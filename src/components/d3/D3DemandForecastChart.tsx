import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  TrendingUp,
  Calendar,
  Layers,
  Sparkles,
  Zap,
  Sliders,
  Filter,
  Download,
  Info,
  ChevronRight,
  ShieldCheck,
  Cpu,
  ArrowUpRight,
  Activity,
} from 'lucide-react';
import { SkillItem, CategoryId } from '../../types';
import { CATEGORY_LIST } from '../../data/categoriesData';

export interface ForecastDataPoint {
  date: Date;
  dateStr: string;
  isHistorical: boolean;
  actualDemand: number;
  forecastDemand: number;
  lowerBound: number;
  upperBound: number;
  securityDemand: number;
  aiIntegrationDemand: number;
  complianceDemand: number;
}

interface D3DemandForecastChartProps {
  skills?: SkillItem[];
  className?: string;
}

type ScenarioType = 'baseline' | 'aggressive' | 'conservative';
type MetricView = 'total' | 'pillars' | 'agents';

export const D3DemandForecastChart: React.FC<D3DemandForecastChartProps> = ({
  skills = [],
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Configuration States
  const [scenario, setScenario] = useState<ScenarioType>('baseline');
  const [metricView, setMetricView] = useState<MetricView>('total');
  const [showConfidenceInterval, setShowConfidenceInterval] = useState<boolean>(true);
  const [forecastMonths, setForecastMonths] = useState<number>(9);
  const [hoveredPoint, setHoveredPoint] = useState<ForecastDataPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [chartDimensions, setChartDimensions] = useState<{ width: number; height: number }>({
    width: 900,
    height: 380,
  });

  // Responsive container observer
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          const w = entry.contentRect.width;
          const h = w < 640 ? 300 : 380;
          setChartDimensions({ width: w, height: h });
        }
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Generate Synthetic Multi-Month Time Series (Historical 8 months + Forecast N months)
  const timeSeriesData = useMemo<ForecastDataPoint[]>(() => {
    const data: ForecastDataPoint[] = [];
    const baseDate = new Date(2026, 0, 1); // Jan 2026

    // Multipliers based on scenario
    const growthRates: Record<ScenarioType, number> = {
      conservative: 0.05, // 5% monthly
      baseline: 0.12,     // 12% monthly
      aggressive: 0.22,   // 22% monthly
    };

    const varianceFactors: Record<ScenarioType, number> = {
      conservative: 0.08,
      baseline: 0.14,
      aggressive: 0.24,
    };

    const currentGrowth = growthRates[scenario];
    const currentVariance = varianceFactors[scenario];

    // 8 Historical Months: Jan 2026 -> Aug 2026 (Month index 0..7)
    let currentVolume = 2400; // operations / day
    for (let i = 0; i < 8; i++) {
      const d = new Date(2026, i, 1);
      // Realistic growth with small empirical fluctuations
      const noise = Math.sin(i * 1.2) * 120 + ((i % 3 === 0) ? 80 : -40);
      currentVolume = Math.round(currentVolume * 1.08 + noise);

      const security = Math.round(currentVolume * 0.34);
      const ai = Math.round(currentVolume * 0.42);
      const compliance = Math.round(currentVolume * 0.24);

      data.push({
        date: d,
        dateStr: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        isHistorical: true,
        actualDemand: currentVolume,
        forecastDemand: currentVolume,
        lowerBound: currentVolume,
        upperBound: currentVolume,
        securityDemand: security,
        aiIntegrationDemand: ai,
        complianceDemand: compliance,
      });
    }

    // Baseline anchor for future projection (Month 8 = Sep 2026 onward)
    const anchor = data[data.length - 1].actualDemand;
    let projVolume = anchor;

    for (let j = 1; j <= forecastMonths; j++) {
      const d = new Date(2026, 7 + j, 1);
      const monthIdx = 8 + j;
      const seasonal = 1 + Math.sin(monthIdx * 0.6) * 0.04;
      projVolume = Math.round(projVolume * (1 + currentGrowth) * seasonal);

      // Expanding cone of uncertainty
      const uncertainty = projVolume * (currentVariance * Math.sqrt(j));
      const upper = Math.round(projVolume + uncertainty);
      const lower = Math.max(1000, Math.round(projVolume - uncertainty));

      const security = Math.round(projVolume * 0.35);
      const ai = Math.round(projVolume * (0.43 + j * 0.01));
      const compliance = Math.round(projVolume * 0.22);

      data.push({
        date: d,
        dateStr: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        isHistorical: false,
        actualDemand: 0,
        forecastDemand: projVolume,
        lowerBound: lower,
        upperBound: upper,
        securityDemand: security,
        aiIntegrationDemand: ai,
        complianceDemand: compliance,
      });
    }

    return data;
  }, [scenario, forecastMonths]);

  // Aggregate Key Forecasting Statistics
  const stats = useMemo(() => {
    const historicalPoints = timeSeriesData.filter((d) => d.isHistorical);
    const forecastPoints = timeSeriesData.filter((d) => !d.isHistorical);

    const currentRate = historicalPoints[historicalPoints.length - 1]?.actualDemand || 0;
    const finalProjected = forecastPoints[forecastPoints.length - 1]?.forecastDemand || 0;
    const peakDemand = Math.max(...timeSeriesData.map((d) => d.upperBound));

    const totalGrowthPercent = currentRate > 0 ? Math.round(((finalProjected - currentRate) / currentRate) * 100) : 0;
    const projectedMonthlyOps = (finalProjected * 30).toLocaleString();

    return {
      currentRate,
      finalProjected,
      peakDemand,
      totalGrowthPercent,
      projectedMonthlyOps,
    };
  }, [timeSeriesData]);

  // Render D3 SVG
  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    const { width, height } = chartDimensions;
    const margin = {
      top: 24,
      right: width < 640 ? 20 : 36,
      bottom: 36,
      left: width < 640 ? 44 : 58,
    };

    const innerWidth = Math.max(50, width - margin.left - margin.right);
    const innerHeight = Math.max(50, height - margin.top - margin.bottom);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'none');

    // Defs & Gradients
    const defs = svg.append('defs');

    // Gradient 1: Historical Actuals (Solid Indigo / Blue)
    const histGrad = defs
      .append('linearGradient')
      .attr('id', 'hist-area-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    histGrad.append('stop').attr('offset', '0%').attr('stop-color', '#4f46e5').attr('stop-opacity', 0.45);
    histGrad.append('stop').attr('offset', '100%').attr('stop-color', '#4f46e5').attr('stop-opacity', 0.02);

    // Gradient 2: Projected Forecast (Emerald / Cyan)
    const forecastGrad = defs
      .append('linearGradient')
      .attr('id', 'forecast-area-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    forecastGrad.append('stop').attr('offset', '0%').attr('stop-color', '#06b6d4').attr('stop-opacity', 0.35);
    forecastGrad.append('stop').attr('offset', '100%').attr('stop-color', '#06b6d4').attr('stop-opacity', 0.0);

    // Gradient 3: Confidence Cone (Subtle Slate/Indigo Shading)
    const ciGrad = defs
      .append('linearGradient')
      .attr('id', 'ci-cone-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    ciGrad.append('stop').attr('offset', '0%').attr('stop-color', '#38bdf8').attr('stop-opacity', 0.18);
    ciGrad.append('stop').attr('offset', '100%').attr('stop-color', '#38bdf8').attr('stop-opacity', 0.05);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const dateExtent = d3.extent(timeSeriesData, (d: ForecastDataPoint) => d.date);
    const minDate = dateExtent[0] || new Date(2026, 0, 1);
    const maxDate = dateExtent[1] || new Date(2027, 5, 1);

    const xScale = d3
      .scaleTime()
      .domain([minDate, maxDate])
      .range([0, innerWidth]);

    const maxBound = d3.max(timeSeriesData, (d: ForecastDataPoint) => d.upperBound);
    const maxVal: number = typeof maxBound === 'number' ? maxBound : 10000;
    const yScale = d3
      .scaleLinear()
      .domain([0, maxVal * 1.12])
      .range([innerHeight, 0]);

    // X Axis
    const xAxis = d3
      .axisBottom<Date>(xScale)
      .ticks(width < 640 ? 5 : 8)
      .tickFormat(d3.timeFormat('%b %y') as any)
      .tickSize(0)
      .tickPadding(10);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .attr('class', 'text-slate-400 font-mono text-[10px]')
      .select('.domain')
      .attr('stroke', '#cbd5e1')
      .attr('class', 'dark:stroke-slate-800');

    // Y Axis
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickSize(-innerWidth)
      .tickPadding(8)
      .tickFormat((d) => (d as number >= 1000 ? `${((d as number) / 1000).toFixed(1)}k` : `${d}`));

    g.append('g')
      .call(yAxis)
      .attr('class', 'text-slate-400 font-mono text-[10px]')
      .call((gAxis) => gAxis.select('.domain').remove())
      .call((gAxis) =>
        gAxis
          .selectAll('.tick line')
          .attr('stroke', '#e2e8f0')
          .attr('stroke-dasharray', '2,3')
          .attr('class', 'dark:stroke-slate-800/80')
      );

    // Historical Points & Forecast Points Subsets
    const histData = timeSeriesData.filter((d) => d.isHistorical);
    const forecastData = timeSeriesData.filter((d) => !d.isHistorical);
    // Connect forecast line from last historical point for seamless visual continuity
    const seamlessForecastData = [histData[histData.length - 1], ...forecastData];

    // 1. Confidence Cone Area (Upper Bound to Lower Bound)
    if (showConfidenceInterval) {
      const ciArea = d3
        .area<ForecastDataPoint>()
        .x((d) => xScale(d.date))
        .y0((d) => yScale(d.lowerBound))
        .y1((d) => yScale(d.upperBound))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(seamlessForecastData)
        .attr('class', 'confidence-interval-cone')
        .attr('d', ciArea)
        .attr('fill', 'url(#ci-cone-grad)')
        .attr('stroke', '#0284c7')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3')
        .attr('stroke-opacity', 0.5);
    }

    // 2. Historical Area & Line
    const histArea = d3
      .area<ForecastDataPoint>()
      .x((d) => xScale(d.date))
      .y0(innerHeight)
      .y1((d) => yScale(d.actualDemand))
      .curve(d3.curveMonotoneX);

    const histLine = d3
      .line<ForecastDataPoint>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.actualDemand))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(histData)
      .attr('d', histArea)
      .attr('fill', 'url(#hist-area-grad)');

    g.append('path')
      .datum(histData)
      .attr('d', histLine)
      .attr('fill', 'none')
      .attr('stroke', '#4f46e5')
      .attr('stroke-width', 2.5);

    // 3. Projected Forecast Area & Line
    const forecastArea = d3
      .area<ForecastDataPoint>()
      .x((d) => xScale(d.date))
      .y0(innerHeight)
      .y1((d) => yScale(d.forecastDemand))
      .curve(d3.curveMonotoneX);

    const forecastLine = d3
      .line<ForecastDataPoint>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.forecastDemand))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(seamlessForecastData)
      .attr('d', forecastArea)
      .attr('fill', 'url(#forecast-area-grad)');

    g.append('path')
      .datum(seamlessForecastData)
      .attr('d', forecastLine)
      .attr('fill', 'none')
      .attr('stroke', '#06b6d4')
      .attr('stroke-width', 2.5)
      .attr('stroke-dasharray', '5,4');

    // 4. "Current Epoch (Today)" Vertical Threshold Indicator
    const transitionPoint = histData[histData.length - 1];
    if (transitionPoint) {
      const todayX = xScale(transitionPoint.date);

      const todayLine = g.append('g').attr('class', 'today-marker');

      todayLine
        .append('line')
        .attr('x1', todayX)
        .attr('y1', 0)
        .attr('x2', todayX)
        .attr('y2', innerHeight)
        .attr('stroke', '#f59e0b')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4,4');

      todayLine
        .append('circle')
        .attr('cx', todayX)
        .attr('cy', yScale(transitionPoint.actualDemand))
        .attr('r', 5)
        .attr('fill', '#f59e0b')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2)
        .attr('class', 'shadow-md');

      // Tag pill for Today
      todayLine
        .append('rect')
        .attr('x', todayX - 32)
        .attr('y', -18)
        .attr('width', 64)
        .attr('height', 16)
        .attr('rx', 4)
        .attr('fill', '#f59e0b');

      todayLine
        .append('text')
        .attr('x', todayX)
        .attr('y', -7)
        .attr('text-anchor', 'middle')
        .attr('fill', '#ffffff')
        .attr('font-size', '9px')
        .attr('font-weight', 'bold')
        .attr('class', 'select-none pointer-events-none')
        .text('NOW / LIVE');
    }

    // 5. Interactive Crosshair and Hover Cursor
    const focusGroup = g.append('g').style('display', 'none');

    const focusGuide = focusGroup
      .append('line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#64748b')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2');

    const focusCircle = focusGroup
      .append('circle')
      .attr('r', 5)
      .attr('fill', '#06b6d4')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2);

    const overlay = g
      .append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair');

    overlay
      .on('mouseenter', () => focusGroup.style('display', null))
      .on('mouseleave', () => {
        focusGroup.style('display', 'none');
        setHoveredPoint(null);
        setTooltipPos(null);
      })
      .on('mousemove', (event) => {
        const [mx] = d3.pointer(event);
        const hoveredDate = xScale.invert(mx);

        // Bisect nearest data point
        const bisect = d3.bisector<ForecastDataPoint, Date>((d) => d.date).center;
        const index = bisect(timeSeriesData, hoveredDate);
        const point = timeSeriesData[index];

        if (point) {
          const px = xScale(point.date);
          const py = yScale(point.isHistorical ? point.actualDemand : point.forecastDemand);

          focusGuide.attr('transform', `translate(${px},0)`);
          focusCircle
            .attr('transform', `translate(${px},${py})`)
            .attr('fill', point.isHistorical ? '#4f46e5' : '#06b6d4');

          setHoveredPoint(point);
          setTooltipPos({
            x: px + margin.left,
            y: py + margin.top,
          });
        }
      });
  }, [timeSeriesData, chartDimensions, showConfidenceInterval]);

  // Export Forecast dataset to CSV
  const handleExportCSV = () => {
    const headers = [
      'Date',
      'Epoch',
      'Actual Demand (ops/day)',
      'Forecast Demand (ops/day)',
      'Confidence Lower Bound (95%)',
      'Confidence Upper Bound (95%)',
      'Security Pillar Demand',
      'AI Agent Demand',
      'Compliance Demand',
    ];

    const rows = timeSeriesData.map((d) => [
      d.dateStr,
      d.isHistorical ? 'HISTORICAL' : 'PROJECTED',
      d.actualDemand,
      d.forecastDemand,
      d.lowerBound,
      d.upperBound,
      d.securityDemand,
      d.aiIntegrationDemand,
      d.complianceDemand,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tsr-skills-demand-forecast-${scenario}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Scenario & Forecast Tuning Control Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Left: Growth Scenario Selectors */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mr-1">
            <Sliders className="w-3.5 h-3.5" />
            <span>Growth Model:</span>
          </div>

          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium">
            <button
              onClick={() => setScenario('conservative')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                scenario === 'conservative'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Conservative (+5%/mo)
            </button>
            <button
              onClick={() => setScenario('baseline')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                scenario === 'baseline'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Baseline (+12%/mo)
            </button>
            <button
              onClick={() => setScenario('aggressive')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                scenario === 'aggressive'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Aggressive AI (+22%/mo)
            </button>
          </div>
        </div>

        {/* Right: Projection Horizon & Display Options */}
        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-between lg:justify-end">
          {/* Horizon Selection */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={forecastMonths}
              onChange={(e) => setForecastMonths(Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value={6}>6 Months Horizon</option>
              <option value={9}>9 Months Horizon</option>
              <option value={12}>12 Months Horizon</option>
              <option value={18}>18 Months Horizon</option>
            </select>
          </div>

          {/* Confidence Cone Toggle */}
          <button
            onClick={() => setShowConfidenceInterval(!showConfidenceInterval)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
              showConfidenceInterval
                ? 'bg-sky-50 border-sky-200 text-sky-700 dark:bg-sky-950/60 dark:border-sky-800 dark:text-sky-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {showConfidenceInterval ? '95% Confidence Cone: ON' : 'Confidence Cone: OFF'}
          </button>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-2xs"
            title="Download forecast series as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Main D3 Time-Series Area Chart Card */}
      <div className="relative p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4">
        {/* Chart Header & Legend */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Registry Capacity & Autonomous Demand Projection
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Historical baseline invocations bridged to future autonomous agent capacity requirements.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 rounded-full bg-indigo-600" />
              <span className="text-slate-700 dark:text-slate-300">Empirical Actuals</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 rounded-full bg-cyan-500 border border-dashed border-cyan-400" />
              <span className="text-slate-700 dark:text-slate-300">Projected Trajectory</span>
            </div>
            {showConfidenceInterval && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-2 rounded bg-sky-300/40 border border-sky-400/60" />
                <span className="text-slate-500">95% Uncertainty Cone</span>
              </div>
            )}
          </div>
        </div>

        {/* SVG Container */}
        <div ref={containerRef} className="relative w-full overflow-hidden">
          <svg ref={svgRef} className="w-full h-auto block" />

          {/* Crosshair Floating Tooltip */}
          {hoveredPoint && tooltipPos && (
            <div
              className="absolute z-20 pointer-events-none p-3.5 rounded-xl bg-slate-900/95 text-white text-xs shadow-2xl border border-slate-700 backdrop-blur-md transition-all duration-75 min-w-[210px]"
              style={{
                left: `${Math.min(tooltipPos.x + 12, chartDimensions.width - 230)}px`,
                top: `${Math.max(10, tooltipPos.y - 120)}px`,
              }}
            >
              <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-700">
                <span className="font-bold text-slate-200 font-mono">{hoveredPoint.dateStr}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    hoveredPoint.isHistorical
                      ? 'bg-indigo-900/80 text-indigo-200 border border-indigo-700'
                      : 'bg-cyan-900/80 text-cyan-200 border border-cyan-700'
                  }`}
                >
                  {hoveredPoint.isHistorical ? 'Historical' : 'Forecast'}
                </span>
              </div>

              <div className="space-y-1.5 font-mono">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-[11px] text-slate-400">Demand Rate:</span>
                  <span className="font-bold text-white text-sm">
                    {(hoveredPoint.isHistorical
                      ? hoveredPoint.actualDemand
                      : hoveredPoint.forecastDemand
                    ).toLocaleString()}{' '}
                    <span className="text-[10px] text-slate-400 font-normal">ops/day</span>
                  </span>
                </div>

                {!hoveredPoint.isHistorical && showConfidenceInterval && (
                  <div className="flex items-center justify-between text-[10px] text-sky-400 pt-0.5">
                    <span>95% CI Range:</span>
                    <span>
                      {hoveredPoint.lowerBound.toLocaleString()} – {hoveredPoint.upperBound.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="pt-1.5 mt-1.5 border-t border-slate-800 space-y-1 text-[10px]">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>AI / Autonomous:</span>
                    <span className="text-slate-200">{hoveredPoint.aiIntegrationDemand.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Security & Defense:</span>
                    <span className="text-slate-200">{hoveredPoint.securityDemand.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Compliance Audit:</span>
                    <span className="text-slate-200">{hoveredPoint.complianceDemand.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Projection Executive Intelligence Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Current Velocity</span>
            <Activity className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
            {stats.currentRate.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400">ops/day</span>
          </div>
          <p className="text-[11px] text-slate-400">Empirical validated executions (Q3 2026)</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Horizon Target</span>
            <TrendingUp className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 font-mono">
            {stats.finalProjected.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400">ops/day</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{stats.totalGrowthPercent}% Projected Growth</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Upper Capacity Ceiling</span>
            <Cpu className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
            {stats.peakDemand.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400">peak ops</span>
          </div>
          <p className="text-[11px] text-purple-600 dark:text-purple-400">
            95% upper confidence tolerance
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Projected Volume</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {stats.projectedMonthlyOps}
          </div>
          <p className="text-[11px] text-slate-400">Monthly contract executions at horizon</p>
        </div>
      </div>
    </div>
  );
};
