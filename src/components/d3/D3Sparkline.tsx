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
    45, 52, 49, 62, 58, 70, 65, 55, 68, 72, 60, 64, 75, 71, 69, 78, 74, 82, 79, 85,
  ]);
  const [hoverVal, setHoverVal] = useState<number | null>(null);
  const [sparkWidth, setSparkWidth] = useState<number>(240);

  // Resize observer for responsive parent container scaling
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setSparkWidth(entry.contentRect.width);
        }
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

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

    const width = sparkWidth;
    const svg = d3.select(containerRef.current).select('svg');
    svg.selectAll('*').remove();

    svg
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'none');

    const margin = { top: 6, right: 6, bottom: 6, left: 6 };
    const innerWidth = Math.max(20, width - margin.left - margin.right);
    const innerHeight = Math.max(10, height - margin.top - margin.bottom);

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

    // Draw area fill
    g.append('path')
      .datum(data)
      .attr('d', area)
      .attr('fill', `url(#${gradientId})`);

    // Draw main stroke line
    g.append('path')
      .datum(data)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('stroke-linecap', 'round');

    // Pulsing end marker
    const lastX = xScale(data.length - 1);
    const lastY = yScale(data[data.length - 1]);

    g.append('circle')
      .attr('cx', lastX)
      .attr('cy', lastY)
      .attr('r', 4)
      .attr('fill', color)
      .attr('class', 'animate-ping origin-center')
      .attr('opacity', 0.75);

    g.append('circle')
      .attr('cx', lastX)
      .attr('cy', lastY)
      .attr('r', 3.5)
      .attr('fill', '#ffffff')
      .attr('stroke', color)
      .attr('stroke-width', 2);

    // Interactive hover overlay
    const overlay = g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair');

    overlay.on('mousemove', (event) => {
      const [mx] = d3.pointer(event);
      const index = Math.round(xScale.invert(mx));
      if (index >= 0 && index < data.length) {
        setHoverVal(data[index]);
      }
    });

    overlay.on('mouseleave', () => {
      setHoverVal(null);
    });
  }, [data, height, color, sparkWidth]);

  return (
    <div ref={containerRef} className="w-full flex flex-col justify-center overflow-hidden">
      <div className="flex items-baseline justify-between text-[11px] mb-1">
        <span className="text-slate-400">Throughput Velocity</span>
        <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
          {hoverVal !== null ? `${hoverVal} ops/sec` : `${data[data.length - 1]} ops/sec`}
        </span>
      </div>
      <svg className="w-full block" />
    </div>
  );
};
