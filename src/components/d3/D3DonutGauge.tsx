import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface D3DonutGaugeProps {
  size?: number;
  segments?: DonutSegment[];
  centerLabel?: string;
  centerSublabel?: string;
}

const DEFAULT_SEGMENTS: DonutSegment[] = [
  { label: 'Complete', value: 35, color: '#10b981' },
  { label: 'In Progress', value: 0, color: '#0ea5e9' },
  { label: 'Planned', value: 0, color: '#93c5fd' },
  { label: 'Missing', value: 0, color: '#f43f5e' },
];

export const D3DonutGauge: React.FC<D3DonutGaugeProps> = ({
  size = 140,
  segments = DEFAULT_SEGMENTS,
  centerLabel = '100%',
  centerSublabel = 'Complete',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeSegment, setActiveSegment] = useState<DonutSegment | null>(null);

  const total = segments.reduce((acc, s) => acc + s.value, 0) || 1;

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = size;
    const height = size;
    const radius = Math.min(width, height) / 2;
    const innerRadius = radius * 0.72;

    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // If all other segments are 0, draw full ring for complete
    const pieData = segments.filter(s => s.value > 0);
    const validData = pieData.length > 0 ? pieData : [{ label: 'Complete', value: 1, color: '#10b981' }];

    const pie = d3
      .pie<DonutSegment>()
      .value((d) => d.value)
      .sort(null)
      .padAngle(0.04);

    const arc = d3
      .arc<d3.PieArcDatum<DonutSegment>>()
      .innerRadius(innerRadius)
      .outerRadius(radius - 2)
      .cornerRadius(4);

    const arcHover = d3
      .arc<d3.PieArcDatum<DonutSegment>>()
      .innerRadius(innerRadius - 2)
      .outerRadius(radius + 2)
      .cornerRadius(4);

    // Background track ring
    g.append('circle')
      .attr('r', (radius + innerRadius) / 2)
      .attr('fill', 'none')
      .attr('stroke', 'currentColor')
      .attr('class', 'text-slate-100 dark:text-slate-800')
      .attr('stroke-width', radius - innerRadius);

    const slices = g
      .selectAll('.arc')
      .data(pie(validData))
      .enter()
      .append('path')
      .attr('class', 'arc transition-all duration-200 cursor-pointer')
      .attr('d', (d) => arc(d) || '')
      .attr('fill', (d) => d.data.color)
      .on('mouseenter', function (event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('d', (arcHover(d) || ''));
        setActiveSegment(d.data);
      })
      .on('mouseleave', function (event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('d', (arc(d) || ''));
        setActiveSegment(null);
      });
  }, [size, segments]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        ref={svgRef}
        width={size}
        height={size}
        className="overflow-visible"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
          {activeSegment ? `${Math.round((activeSegment.value / total) * 100)}%` : centerLabel}
        </span>
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
          {activeSegment ? activeSegment.label : centerSublabel}
        </span>
      </div>
    </div>
  );
};
