import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface ActivityPoint {
  time: string;
  executions: number;
  validations: number;
  failures: number;
}

export const D3ActivityChart: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [data] = useState<ActivityPoint[]>([
    { time: '00:00', executions: 120, validations: 240, failures: 0 },
    { time: '02:00', executions: 90, validations: 180, failures: 1 },
    { time: '04:00', executions: 75, validations: 150, failures: 0 },
    { time: '06:00', executions: 140, validations: 280, failures: 0 },
    { time: '08:00', executions: 380, validations: 760, failures: 2 },
    { time: '10:00', executions: 620, validations: 1240, failures: 1 },
    { time: '12:00', executions: 540, validations: 1080, failures: 0 },
    { time: '14:00', executions: 680, validations: 1360, failures: 3 },
    { time: '16:00', executions: 790, validations: 1580, failures: 1 },
    { time: '18:00', executions: 490, validations: 980, failures: 0 },
    { time: '20:00', executions: 310, validations: 620, failures: 0 },
    { time: '22:00', executions: 210, validations: 420, failures: 0 },
  ]);

  const [tooltip, setTooltip] = useState<{ x: number; y: number; point: ActivityPoint } | null>(null);
  const [chartWidth, setChartWidth] = useState<number>(600);

  // Responsive Resize Observer
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setChartWidth(entry.contentRect.width);
        }
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = chartWidth;
    const height = 240;
    const margin = {
      top: 20,
      right: width < 400 ? 10 : 20,
      bottom: 30,
      left: width < 400 ? 35 : 45,
    };

    const svg = d3.select(containerRef.current).select('svg');
    svg.selectAll('*').remove();

    svg
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'none');

    const innerWidth = Math.max(50, width - margin.left - margin.right);
    const innerHeight = Math.max(50, height - margin.top - margin.bottom);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3
      .scalePoint()
      .domain(data.map((d) => d.time))
      .range([0, innerWidth])
      .padding(0.2);

    const maxVal = d3.max(data, (d: { validations: number }) => d.validations) ?? 1600;
    const y = d3
      .scaleLinear()
      .domain([0, maxVal * 1.15])
      .range([innerHeight, 0]);

    // X Axis with responsive label skip on small devices
    const isSmall = width < 480;
    const xAxis = d3
      .axisBottom(x)
      .tickSize(0)
      .tickPadding(8)
      .tickFormat((d, i) => (isSmall && i % 2 !== 0 ? '' : d));

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .attr('class', 'text-slate-400 text-[10px] font-mono')
      .select('.domain')
      .attr('stroke', '#cbd5e1')
      .attr('class', 'dark:stroke-slate-800');

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(4).tickSize(-innerWidth).tickPadding(6))
      .attr('class', 'text-slate-400 text-[10px] font-mono')
      .call((gAxis) => gAxis.select('.domain').remove())
      .call((gAxis) =>
        gAxis
          .selectAll('.tick line')
          .attr('stroke', '#e2e8f0')
          .attr('stroke-dasharray', '2,2')
          .attr('class', 'dark:stroke-slate-800/80')
      );

    // Area generator for validations
    const areaValidations = d3
      .area<ActivityPoint>()
      .x((d) => x(d.time) || 0)
      .y0(innerHeight)
      .y1((d) => y(d.validations))
      .curve(d3.curveMonotoneX);

    // Area generator for executions
    const areaExecutions = d3
      .area<ActivityPoint>()
      .x((d) => x(d.time) || 0)
      .y0(innerHeight)
      .y1((d) => y(d.executions))
      .curve(d3.curveMonotoneX);

    // Line generator for validations
    const lineValidations = d3
      .line<ActivityPoint>()
      .x((d) => x(d.time) || 0)
      .y((d) => y(d.validations))
      .curve(d3.curveMonotoneX);

    // Line generator for executions
    const lineExecutions = d3
      .line<ActivityPoint>()
      .x((d) => x(d.time) || 0)
      .y((d) => y(d.executions))
      .curve(d3.curveMonotoneX);

    // Gradients
    const defs = svg.append('defs');

    const gradVal = defs
      .append('linearGradient')
      .attr('id', 'grad-validations')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    gradVal.append('stop').attr('offset', '0%').attr('stop-color', '#3b82f6').attr('stop-opacity', 0.35);
    gradVal.append('stop').attr('offset', '100%').attr('stop-color', '#3b82f6').attr('stop-opacity', 0.0);

    const gradExec = defs
      .append('linearGradient')
      .attr('id', 'grad-executions')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    gradExec.append('stop').attr('offset', '0%').attr('stop-color', '#10b981').attr('stop-opacity', 0.35);
    gradExec.append('stop').attr('offset', '100%').attr('stop-color', '#10b981').attr('stop-opacity', 0.0);

    // Render areas
    g.append('path')
      .datum(data)
      .attr('d', areaValidations)
      .attr('fill', 'url(#grad-validations)');

    g.append('path')
      .datum(data)
      .attr('d', areaExecutions)
      .attr('fill', 'url(#grad-executions)');

    // Render lines
    g.append('path')
      .datum(data)
      .attr('d', lineValidations)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2);

    g.append('path')
      .datum(data)
      .attr('d', lineExecutions)
      .attr('fill', 'none')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 2);

    // Hover overlay / interactive vertical guide
    const focus = g.append('g').style('display', 'none');

    focus
      .append('line')
      .attr('class', 'focus-line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#64748b')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3');

    const dotVal = focus
      .append('circle')
      .attr('r', 4)
      .attr('fill', '#3b82f6')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5);

    const dotExec = focus
      .append('circle')
      .attr('r', 4)
      .attr('fill', '#10b981')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5);

    g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .on('mouseenter', () => focus.style('display', null))
      .on('mouseleave', () => {
        focus.style('display', 'none');
        setTooltip(null);
      })
      .on('mousemove', (event) => {
        const [mx] = d3.pointer(event);
        const eachBand = innerWidth / (data.length - 1);
        const index = Math.round(mx / eachBand);
        const clampedIndex = Math.max(0, Math.min(data.length - 1, index));
        const point = data[clampedIndex];
        const px = x(point.time) || 0;

        focus.select('.focus-line').attr('transform', `translate(${px},0)`);
        dotVal.attr('transform', `translate(${px},${y(point.validations)})`);
        dotExec.attr('transform', `translate(${px},${y(point.executions)})`);

        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          setTooltip({
            x: px + margin.left,
            y: Math.min(y(point.validations), y(point.executions)) + margin.top,
            point,
          });
        }
      });
  }, [data, chartWidth]);

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden">
      <svg className="w-full h-auto block" />

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-10 pointer-events-none p-2.5 rounded-xl bg-slate-900/90 text-white text-xs shadow-xl border border-slate-700/80 backdrop-blur-xs transition-transform duration-75"
          style={{
            left: `${Math.min(tooltip.x + 10, chartWidth - 140)}px`,
            top: `${Math.max(10, tooltip.y - 65)}px`,
          }}
        >
          <div className="font-bold text-[11px] text-slate-300 font-mono mb-1">{tooltip.point.time} UTC</div>
          <div className="flex items-center gap-2 text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Validations: {tooltip.point.validations.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Executions: {tooltip.point.executions.toLocaleString()}</span>
          </div>
          {tooltip.point.failures > 0 && (
            <div className="flex items-center gap-2 text-rose-400 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Failures: {tooltip.point.failures}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
