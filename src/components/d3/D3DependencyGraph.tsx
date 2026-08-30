import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { SKILLS_DATA } from '../../data/skillsData';
import { CATEGORIES_DATA } from '../../data/categoriesData';
import { CategoryId, SkillItem } from '../../types';

interface D3Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  number: string;
  category: CategoryId;
  color: string;
  val: number;
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  source: string | D3Node;
  target: string | D3Node;
}

interface D3DependencyGraphProps {
  onSelectSkill?: (skill: SkillItem) => void;
  selectedSkillId?: string;
  categoryFilter?: CategoryId | 'ALL';
}

export const D3DependencyGraph: React.FC<D3DependencyGraphProps> = ({
  onSelectSkill,
  selectedSkillId,
  categoryFilter = 'ALL',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<D3Node | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 800,
    height: 520,
  });

  // Responsive Resize Observer
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          const w = entry.contentRect.width;
          const h = w < 640 ? 380 : 520;
          setDimensions({ width: w, height: h });
        }
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const { width, height } = dimensions;

    const svg = d3.select(containerRef.current).select('svg');
    svg.selectAll('*').remove();

    svg
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Prepare nodes and links
    const filteredSkills =
      categoryFilter === 'ALL'
        ? SKILLS_DATA
        : SKILLS_DATA.filter((s) => s.category === categoryFilter);

    const activeIds = new Set(filteredSkills.map((s) => s.id));

    const nodes: D3Node[] = filteredSkills.map((s) => ({
      id: s.id,
      name: s.name,
      number: s.number,
      category: s.category,
      color: CATEGORIES_DATA[s.category]?.color || '#3b82f6',
      val: s.dependencies.length + 6,
    }));

    const links: D3Link[] = [];
    filteredSkills.forEach((skill) => {
      skill.dependencies.forEach((depName) => {
        const targetSkill = SKILLS_DATA.find(
          (s) => s.name.toLowerCase() === depName.toLowerCase()
        );
        if (targetSkill && activeIds.has(targetSkill.id)) {
          links.push({
            source: skill.id,
            target: targetSkill.id,
          });
        }
      });
    });

    // Setup simulation
    const simulation = d3
      .forceSimulation<D3Node>(nodes)
      .force(
        'link',
        d3
          .forceLink<D3Node, D3Link>(links)
          .id((d) => d.id)
          .distance(width < 640 ? 45 : 70)
      )
      .force('charge', d3.forceManyBody().strength(width < 640 ? -120 : -180))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(width < 640 ? 18 : 25));

    // Arrow markers
    const defs = svg.append('defs');
    defs
      .append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', width < 640 ? 18 : 22)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#94a3b8');

    // Draw links
    const link = g
      .append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1.5)
      .attr('marker-end', 'url(#arrow)')
      .attr('class', 'dark:stroke-slate-700');

    // Drag behavior
    const drag = d3
      .drag<SVGGElement, D3Node>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    // Draw node containers
    const node = g
      .append('g')
      .selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node cursor-pointer group')
      .call(drag as any)
      .on('click', (_, d) => {
        const found = SKILLS_DATA.find((s) => s.id === d.id);
        if (found && onSelectSkill) {
          onSelectSkill(found);
        }
      })
      .on('mouseenter', (_, d) => setHoveredNode(d))
      .on('mouseleave', () => setHoveredNode(null));

    // Outer glow for selected
    node
      .append('circle')
      .attr('r', (d) => (d.id === selectedSkillId ? 22 : 0))
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 3)
      .attr('stroke-dasharray', '3,3')
      .attr('class', 'animate-spin');

    // Node body
    node
      .append('circle')
      .attr('r', width < 640 ? 12 : 16)
      .attr('fill', (d) => d.color)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .attr('class', 'shadow-md transition-transform group-hover:scale-110');

    // Node number label inside
    node
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', '#ffffff')
      .attr('font-size', width < 640 ? '8px' : '10px')
      .attr('font-weight', 'bold')
      .text((d) => d.number);

    // Node full title text underneath
    node
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', width < 640 ? '22px' : '26px')
      .attr('class', 'fill-slate-700 dark:fill-slate-300 font-medium text-[9px] sm:text-[10px] pointer-events-none select-none')
      .text((d) => (d.name.length > 14 ? `${d.name.slice(0, 12)}…` : d.name));

    // Tick update
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [categoryFilter, selectedSkillId, dimensions, onSelectSkill]);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-center items-center"
    >
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        <span>Drag nodes • Scroll to zoom</span>
      </div>

      {hoveredNode && (
        <div className="absolute bottom-3 left-3 z-10 bg-slate-900/90 text-white px-3 py-1.5 rounded-lg text-xs font-mono backdrop-blur-xs border border-slate-700 pointer-events-none">
          #{hoveredNode.number} {hoveredNode.name} ({hoveredNode.category})
        </div>
      )}

      <svg className="w-full h-auto cursor-grab active:cursor-grabbing block" />
    </div>
  );
};
