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

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = 520;

    const svg = d3.select(containerRef.current).select('svg');
    svg.selectAll('*').remove();

    svg
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Prepare nodes and links
    const filteredSkills = categoryFilter === 'ALL'
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
        const targetSkill = SKILLS_DATA.find((s) => s.name.toLowerCase() === depName.toLowerCase());
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
          .distance(70)
      )
      .force('charge', d3.forceManyBody().strength(-180))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(24));

    // Render links
    const link = g
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#94a3b8')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '3,3');

    // Render node groups
    const node = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'cursor-pointer group')
      .call(
        d3
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
          })
      );

    // Node circles with glow
    node
      .append('circle')
      .attr('r', (d) => (d.id === selectedSkillId ? 18 : 14))
      .attr('fill', (d) => d.color)
      .attr('stroke', (d) => (d.id === selectedSkillId ? '#ffffff' : '#f8fafc'))
      .attr('stroke-width', (d) => (d.id === selectedSkillId ? 3.5 : 2))
      .attr('class', 'transition-all duration-200 hover:scale-125 shadow-md');

    // Node number text
    node
      .append('text')
      .text((d) => d.number)
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', '#ffffff')
      .attr('font-size', '10px')
      .attr('font-weight', '700')
      .attr('pointer-events', 'none');

    // Node label
    node
      .append('text')
      .text((d) => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', '26px')
      .attr('class', 'fill-slate-700 dark:fill-slate-300 text-[11px] font-medium tracking-tight pointer-events-none');

    // Interactions
    node
      .on('mouseenter', (_, d) => {
        setHoveredNode(d);
      })
      .on('mouseleave', () => {
        setHoveredNode(null);
      })
      .on('click', (_, d) => {
        const found = SKILLS_DATA.find((s) => s.id === d.id);
        if (found && onSelectSkill) {
          onSelectSkill(found);
        }
      });

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as D3Node).x || 0)
        .attr('y1', (d) => (d.source as D3Node).y || 0)
        .attr('x2', (d) => (d.target as D3Node).x || 0)
        .attr('y2', (d) => (d.target as D3Node).y || 0);

      node.attr('transform', (d) => `translate(${d.x || 0},${d.y || 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [categoryFilter, selectedSkillId]);

  return (
    <div className="relative w-full h-[520px] bg-slate-900/5 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden" ref={containerRef}>
      <svg className="w-full h-full block" />
      <div className="absolute top-3 left-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        <span>D3 Force-Directed Network • Drag nodes or scroll to zoom</span>
      </div>

      {hoveredNode && (
        <div className="absolute bottom-3 right-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xl text-xs max-w-xs backdrop-blur-md">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: hoveredNode.color }}
            />
            <span className="font-semibold text-slate-900 dark:text-white">
              {hoveredNode.number} {hoveredNode.name}
            </span>
          </div>
          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {hoveredNode.category}
          </span>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1">
            Click to inspect detailed schemas, prompts, and execution suites.
          </p>
        </div>
      )}
    </div>
  );
};
