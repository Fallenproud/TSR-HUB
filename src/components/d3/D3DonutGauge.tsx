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
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeSegment, setActiveSegment] = useState<DonutSegment | null>(null);
  const [gaugeSize, setGaugeSize] = useState<number>(size);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          const newSize = Math.min(entry.contentRect.width, size);
          setGaugeSize(Math.max(100, newSize));
        }
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [size]);

  const total = segments.reduce((acc, s) => acc + s.value, 0) || 1;

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const currentSize = gaugeSize;
    const width = currentSize;
    const height = currentSize;
    const radius = Math.min(width, height) / 2;
    const innerRadius = radius * 0.72;

    svg
      .attr('width', currentSize)
      .attr('height', currentSize)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // If all other segments are 0, draw full ring for complete
    const pieData = segments.filter((s) => s.value > 0);
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
          .attr('d', arcHover(d) || '');
        setActiveSegment(d.data);
      })
      .on('mouseleave', function (event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('d', arc(d) || '');
        setActiveSegment(null);
      });

    // Center text label
    const textGroup = g.append('g').attr('text-anchor', 'middle');

    textGroup
      .append('text')
      .attr('dy', '-0.1em')
      .attr('class', 'fill-slate-900 dark:fill-white font-bold font-mono')
      .attr('font-size', `${Math.max(13, radius * 0.32)}px`)
      .text(activeSegment ? `${activeSegment.value}` : centerLabel);

    textGroup
      .append('text')
      .attr('dy', '1.3em')
      .attr('class', 'fill-slate-400 font-medium')
      .attr('font-size', `${Math.max(9, radius * 0.18)}px`)
      .text(activeSegment ? activeSegment.label : centerSublabel);
  }, [gaugeSize, segments, centerLabel, centerSublabel, activeSegment]);

  return (
    <div ref={containerRef} className="flex flex-col items-center justify-center p-1 overflow-hidden w-full">
      <svg ref={svgRef} className="overflow-visible max-w-full h-auto" />
    </div>
  );
};
