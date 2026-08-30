import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { CATEGORY_LIST } from '../../data/categoriesData';

interface D3RadarChartProps {
  size?: number;
}

export const D3RadarChart: React.FC<D3RadarChartProps> = ({ size = 320 }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = size;
    const height = size;
    const radius = Math.min(width, height) / 2 - 40;
    const numAxes = CATEGORY_LIST.length;
    const angleSlice = (Math.PI * 2) / numAxes;

    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const rScale = d3.scaleLinear().domain([0, 100]).range([0, radius]);

    // Concentric grid circles (20%, 40%, 60%, 80%, 100%)
    const levels = 5;
    for (let j = 0; j < levels; j++) {
      const levelFactor = radius * ((j + 1) / levels);
      g.append('circle')
        .attr('r', levelFactor)
        .attr('fill', 'none')
        .attr('stroke', '#cbd5e1')
        .attr('stroke-dasharray', '2,2')
        .attr('stroke-opacity', 0.5)
        .attr('class', 'dark:stroke-slate-700');
    }

    // Axes
    const axes = g
      .selectAll('.axis')
      .data(CATEGORY_LIST)
      .enter()
      .append('g')
      .attr('class', 'axis');

    axes
      .append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', (_, i) => rScale(100) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('y2', (_, i) => rScale(100) * Math.sin(angleSlice * i - Math.PI / 2))
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.4);

    // Axis labels
    axes
      .append('text')
      .attr('class', 'legend fill-slate-600 dark:fill-slate-400 font-semibold text-[9px] uppercase')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('x', (_, i) => (rScale(100) + 18) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('y', (_, i) => (rScale(100) + 18) * Math.sin(angleSlice * i - Math.PI / 2))
      .text((d) => d.id.replace('_', ' '));

    // Synthetic Data: Maturity Score (80-100) and Automated Coverage (90-100)
    const maturityData = CATEGORY_LIST.map((c, i) => ({
      category: c.id,
      val: 82 + ((i * 7) % 18),
    }));

    const radarLine = d3
      .lineRadial<{ category: string; val: number }>()
      .radius((d) => rScale(d.val))
      .angle((_, i) => i * angleSlice)
      .curve(d3.curveLinearClosed);

    // Render area
    g.append('path')
      .datum(maturityData)
      .attr('d', radarLine)
      .attr('fill', '#3b82f6')
      .attr('fill-opacity', 0.25)
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2);

    // Dots on vertices
    g.selectAll('.radar-dot')
      .data(maturityData)
      .enter()
      .append('circle')
      .attr('r', 3)
      .attr('cx', (d, i) => rScale(d.val) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('cy', (d, i) => rScale(d.val) * Math.sin(angleSlice * i - Math.PI / 2))
      .attr('fill', '#2563eb')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5);
  }, [size]);

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <svg ref={svgRef} width={size} height={size} className="overflow-visible" />
    </div>
  );
};
