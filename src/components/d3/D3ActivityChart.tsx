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

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 600;
    const height = 240;
    const margin = { top: 20, right: 20, bottom: 30, left: 45 };

    const svg = d3.select(containerRef.current).select('svg');
    svg.selectAll('*').remove();

    svg
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

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

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickSize(0).tickPadding(8))
      .attr('class', 'text-slate-400 text-[10px] font-mono')
      .select('.domain')
      .attr('stroke', '#cbd5e1')
      .attr('class', 'dark:stroke-slate-800');

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(4).tickSize(-innerWidth).tickPadding(8))
      .attr('class', 'text-slate-400 text-[10px] font-mono')
      .call((g) => g.select('.domain').remove())
      .call((g) =>
        g
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

    // Validations Area
    g.append('path')
      .datum(data)
      .attr('fill', '#3b82f6')
      .attr('fill-opacity', 0.15)
      .attr('d', areaValidations);

    // Validations Line
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .attr(
        'd',
        d3
          .line<ActivityPoint>()
          .x((d) => x(d.time) || 0)
          .y((d) => y(d.validations))
          .curve(d3.curveMonotoneX)
      );

    // Executions Line
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 2)
      .attr(
        'd',
        d3
          .line<ActivityPoint>()
          .x((d) => x(d.time) || 0)
          .y((d) => y(d.executions))
          .curve(d3.curveMonotoneX)
      );

    // Interaction dots
    data.forEach((p) => {
      const cx = x(p.time) || 0;
      const cy = y(p.validations);

      g.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 3)
        .attr('fill', '#3b82f6')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1.5)
        .attr('class', 'cursor-pointer hover:r-5 transition-all');
    });

    // Bisector overlay
    svg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'transparent')
      .on('mousemove', (event) => {
        const [mx] = d3.pointer(event);
        const relX = mx - margin.left;
        const index = Math.max(
          0,
          Math.min(
            data.length - 1,
            Math.round((relX / innerWidth) * (data.length - 1))
          )
        );
        const point = data[index];
        if (point) {
          setTooltip({ x: mx, y: y(point.validations) + margin.top, point });
        }
      })
      .on('mouseleave', () => setTooltip(null));
  }, [data]);

  return (
    <div className="relative w-full" ref={containerRef}>
      <svg className="w-full block overflow-visible" />
      {tooltip && (
        <div
          className="absolute z-20 pointer-events-none bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs px-2.5 py-1.5 rounded-lg shadow-xl -translate-x-1/2 -translate-y-full"
          style={{ left: tooltip.x, top: tooltip.y - 8 }}
        >
          <div className="font-semibold">{tooltip.point.time} UTC</div>
          <div className="text-[11px] text-blue-300 dark:text-blue-600">
            ⚡ {tooltip.point.validations} Validations/hr
          </div>
          <div className="text-[11px] text-emerald-300 dark:text-emerald-600">
            ✓ {tooltip.point.executions} Executions/hr
          </div>
        </div>
      )}
    </div>
  );
};
