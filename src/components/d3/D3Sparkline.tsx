import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface D3SparklineProps {
  height?: number;
  color?: string;
  isLive?: boolean;
}

export const D3Sparkline: React.FC<D3SparklineProps> = ({
  height = 56,
  color = '#10b981', // emerald matching screenshot
  isLive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<number[]>([
    45, 52, 49, 62, 58, 70, 65, 55, 68, 72, 60, 64, 75, 71, 69, 78, 74, 82, 79, 85
  ]);
  const [hoverVal, setHoverVal] = useState<number | null>(null);

  // Live real-time data point generation
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setData((prev) => {
        const last = prev[prev.length - 1] || 70;
        const noise = (Math.random() - 0.48) * 12;
        const nextVal = Math.max(30, Math.min(95, Math.round(last + noise)));
        return [...prev.slice(1), nextVal];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive]);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 240;
    const svg = d3.select(containerRef.current).select('svg');
    svg.selectAll('*').remove();

    svg
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'none');

    const margin = { top: 6, right: 6, bottom: 6, left: 6 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleLinear()
      .domain([0, data.length - 1])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([20, 100])
      .range([innerHeight, 0]);

    // Gradient definitions
    const defs = svg.append('defs');
    const gradientId = `sparkline-grad-${Math.random().toString(36).substring(2, 9)}`;
    const gradient = defs
      .append('linearGradient')
      .attr('id', gradientId)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', color)
      .attr('stop-opacity', 0.28);

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', color)
      .attr('stop-opacity', 0.0);

    // Area generator
    const area = d3
      .area<number>()
      .x((_, i) => xScale(i))
      .y0(innerHeight)
      .y1((d) => yScale(d))
      .curve(d3.curveMonotoneX);

    // Line generator
    const line = d3
      .line<number>()
      .x((_, i) => xScale(i))
      .y((d) => yScale(d))
      .curve(d3.curveMonotoneX);

    // Render Area
    g.append('path')
      .datum(data)
      .attr('fill', `url(#${gradientId})`)
      .attr('d', area);

    // Render Line
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('d', line);

    // Last point pulsing dot
    const lastX = xScale(data.length - 1);
    const lastY = yScale(data[data.length - 1]);

    g.append('circle')
      .attr('cx', lastX)
      .attr('cy', lastY)
      .attr('r', 3.5)
      .attr('fill', color)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5);

    // Overlay for interaction
    const bisect = d3.bisector<number, number>((_, i) => i).center;
    svg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair')
      .on('mousemove', (event) => {
        const [mx] = d3.pointer(event);
        const relX = mx - margin.left;
        const index = bisect(data, xScale.invert(relX));
        if (index >= 0 && index < data.length) {
          setHoverVal(data[index]);
        }
      })
      .on('mouseleave', () => {
        setHoverVal(null);
      });
  }, [data, height, color]);

  return (
    <div className="relative w-full overflow-hidden" ref={containerRef}>
      <svg className="w-full overflow-visible block" />
      {hoverVal !== null && (
        <div className="absolute top-1 right-2 bg-slate-900/90 text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow pointer-events-none backdrop-blur-sm dark:bg-slate-100 dark:text-slate-900">
          {hoverVal} ops/sec
        </div>
      )}
    </div>
  );
};
