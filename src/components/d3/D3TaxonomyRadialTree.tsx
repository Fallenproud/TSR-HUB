import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import {
  FolderTree,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Filter,
  Search,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap,
  Info,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SkillItem, CategoryId, CategoryInfo } from '../../types';
import { CATEGORIES_DATA, CATEGORY_LIST } from '../../data/categoriesData';
import { SKILLS_DATA } from '../../data/skillsData';

interface D3TaxonomyRadialTreeProps {
  skills?: SkillItem[];
  categories?: CategoryInfo[];
  selectedSkillId?: string;
  onSelectSkill?: (skill: SkillItem) => void;
  className?: string;
}

interface TaxonomyTreeNode {
  id: string;
  name: string;
  type: 'root' | 'category' | 'skill';
  categoryId?: CategoryId;
  color: string;
  skillItem?: SkillItem;
  categoryInfo?: CategoryInfo;
  count?: number;
  children?: TaxonomyTreeNode[];
  _children?: TaxonomyTreeNode[];
  collapsed?: boolean;
}

export const D3TaxonomyRadialTree: React.FC<D3TaxonomyRadialTreeProps> = ({
  skills = SKILLS_DATA,
  categories = CATEGORY_LIST,
  selectedSkillId,
  onSelectSkill,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // States
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<CategoryId | 'ALL'>('ALL');
  const [layoutMode, setLayoutMode] = useState<'tree' | 'cluster'>('cluster');
  const [showLeafLabels, setShowLeafLabels] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [activeHoverNode, setActiveHoverNode] = useState<TaxonomyTreeNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<TaxonomyTreeNode | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 900,
    height: 650,
  });

  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const gRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);

  // Measure container dimensions
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          const w = entry.contentRect.width;
          const h = isFullscreen ? window.innerHeight - 160 : w < 640 ? 520 : 660;
          setDimensions({ width: w, height: h });
        }
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [isFullscreen]);

  // Build hierarchical data structure
  const rootHierarchyData = useMemo<TaxonomyTreeNode>(() => {
    // Filter categories if needed
    const activeCategories =
      selectedCategoryFilter === 'ALL'
        ? categories
        : categories.filter((c) => c.id === selectedCategoryFilter);

    const categoryNodes: TaxonomyTreeNode[] = activeCategories.map((cat) => {
      const catSkills = skills.filter((s) => s.category === cat.id);
      
      const skillNodes: TaxonomyTreeNode[] = catSkills.map((s) => ({
        id: `skill-${s.id}`,
        name: `#${s.number} ${s.name}`,
        type: 'skill',
        categoryId: cat.id,
        color: cat.color,
        skillItem: s,
      }));

      const isCollapsed = collapsedCategories.has(cat.id);

      return {
        id: `cat-${cat.id}`,
        name: cat.label,
        type: 'category',
        categoryId: cat.id,
        color: cat.color,
        categoryInfo: cat,
        count: catSkills.length,
        children: isCollapsed ? undefined : skillNodes,
        _children: skillNodes,
        collapsed: isCollapsed,
      };
    });

    return {
      id: 'root-registry',
      name: 'Skills Registry',
      type: 'root',
      color: '#3b82f6',
      count: skills.length,
      children: categoryNodes,
    };
  }, [skills, categories, selectedCategoryFilter, collapsedCategories]);

  // Handle category toggle
  const toggleCategoryCollapse = useCallback((catId: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
      }
      return next;
    });
  }, []);

  const expandAll = () => {
    setCollapsedCategories(new Set());
  };

  const collapseAll = () => {
    setCollapsedCategories(new Set(categories.map((c) => c.id)));
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomBehaviorRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomBehaviorRef.current.scaleBy, 0.77);
    }
  };

  const handleResetZoom = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      const { width, height } = dimensions;
      d3.select(svgRef.current)
        .transition()
        .duration(500)
        .call(
          zoomBehaviorRef.current.transform,
          d3.zoomIdentity.translate(width / 2, height / 2).scale(width < 640 ? 0.75 : 0.95)
        );
    }
  };

  // Main D3 Rendering Lifecycle
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Defs & Gradients
    const defs = svg.append('defs');

    // Glow filter
    const filter = defs.append('filter').attr('id', 'radial-glow').attr('x', '-30%').attr('y', '-30%').attr('width', '160%').attr('height', '160%');
    filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'blur');
    filter.append('feComposite').attr('in', 'SourceGraphic').attr('in2', 'blur').attr('operator', 'over');

    // Radial background circles pattern
    const maxRadius = Math.min(width, height) / 2 - (width < 640 ? 40 : 80);

    // Zoom container
    const g = svg.append('g').attr('class', 'radial-tree-viewport');
    gRef.current = g;

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.35, 3.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    // Initial translation to center
    const initialScale = width < 640 ? 0.72 : 0.92;
    svg.call(
      zoom.transform,
      d3.zoomIdentity.translate(width / 2, height / 2).scale(initialScale)
    );

    // Render concentric range guidelines in background
    const bgGroup = g.append('g').attr('class', 'radial-background-guides');
    const ringRadii = [maxRadius * 0.35, maxRadius * 0.65, maxRadius];
    const ringLabels = ['Core Registry', 'Domain Pillars (11)', 'Skill Packages (35)'];

    ringRadii.forEach((r, i) => {
      bgGroup
        .append('circle')
        .attr('r', r)
        .attr('fill', 'none')
        .attr('stroke', '#94a3b8')
        .attr('stroke-opacity', 0.18)
        .attr('stroke-dasharray', '3,4')
        .attr('class', 'dark:stroke-slate-700');

      if (width >= 640) {
        bgGroup
          .append('text')
          .attr('y', -r - 4)
          .attr('text-anchor', 'middle')
          .attr('fill', '#94a3b8')
          .attr('font-size', '9px')
          .attr('class', 'dark:fill-slate-600 font-mono select-none pointer-events-none opacity-60')
          .text(ringLabels[i]);
      }
    });

    // Create D3 hierarchy & layout
    const root = d3.hierarchy<TaxonomyTreeNode>(rootHierarchyData);

    const layout =
      layoutMode === 'cluster'
        ? d3.cluster<TaxonomyTreeNode>().size([2 * Math.PI, maxRadius]).separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth)
        : d3.tree<TaxonomyTreeNode>().size([2 * Math.PI, maxRadius]).separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

    layout(root);

    // Radial Link Generator
    const radialLink = d3
      .linkRadial<any, d3.HierarchyPointNode<TaxonomyTreeNode>>()
      .angle((d) => d.x)
      .radius((d) => d.y);

    // Links Layer
    const linksGroup = g.append('g').attr('class', 'radial-links');

    const linkPaths = linksGroup
      .selectAll<SVGPathElement, d3.HierarchyPointLink<TaxonomyTreeNode>>('path')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'radial-link-path transition-all duration-300')
      .attr('d', radialLink as any)
      .attr('fill', 'none')
      .attr('stroke', (d) => {
        if (d.target.data.type === 'category') {
          return d.target.data.color;
        }
        if (d.target.data.type === 'skill') {
          return d.source.data.color || '#3b82f6';
        }
        return '#cbd5e1';
      })
      .attr('stroke-opacity', (d) => {
        const isSearchMatch =
          !searchTerm ||
          d.target.data.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.source.data.name.toLowerCase().includes(searchTerm.toLowerCase());
        return isSearchMatch ? 0.45 : 0.12;
      })
      .attr('stroke-width', (d) => (d.target.data.type === 'category' ? 2 : 1.25));

    // Nodes Layer
    const nodesGroup = g.append('g').attr('class', 'radial-nodes');

    const nodeSelection = nodesGroup
      .selectAll<SVGGElement, d3.HierarchyPointNode<TaxonomyTreeNode>>('g')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'radial-node cursor-pointer group')
      .attr('transform', (d) => {
        // Position at polar coordinate
        const angle = (d.x * 180) / Math.PI - 90;
        return `rotate(${angle}) translate(${d.y},0)`;
      });

    // Node Click Handlers
    nodeSelection.on('click', (event, d) => {
      event.stopPropagation();
      setSelectedNode(d.data);
      if (d.data.type === 'category' && d.data.categoryId) {
        toggleCategoryCollapse(d.data.categoryId);
      } else if (d.data.type === 'skill' && d.data.skillItem && onSelectSkill) {
        onSelectSkill(d.data.skillItem);
      }
    });

    // Node Hover Handlers
    nodeSelection
      .on('mouseenter', (event, d) => {
        setActiveHoverNode(d.data);

        // Highlight ancestral branch
        const ancestors = new Set(d.ancestors().map((a) => a.data.id));
        const descendants = new Set(d.descendants().map((des) => des.data.id));

        linkPaths
          .attr('stroke-opacity', (l) =>
            ancestors.has(l.target.data.id) || descendants.has(l.target.data.id) ? 0.95 : 0.1
          )
          .attr('stroke-width', (l) =>
            ancestors.has(l.target.data.id) || descendants.has(l.target.data.id) ? 3 : 1
          );
      })
      .on('mouseleave', () => {
        setActiveHoverNode(null);
        linkPaths
          .attr('stroke-opacity', (d) => {
            const isSearchMatch =
              !searchTerm ||
              d.target.data.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              d.source.data.name.toLowerCase().includes(searchTerm.toLowerCase());
            return isSearchMatch ? 0.45 : 0.12;
          })
          .attr('stroke-width', (d) => (d.target.data.type === 'category' ? 2 : 1.25));
      });

    // Draw Node Circles / Visual Indicators
    // 1. ROOT Node (Center Hub)
    nodeSelection
      .filter((d) => d.data.type === 'root')
      .append('circle')
      .attr('r', 24)
      .attr('fill', '#0f172a')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 3)
      .attr('class', 'dark:fill-slate-900 shadow-xl');

    nodeSelection
      .filter((d) => d.data.type === 'root')
      .append('circle')
      .attr('r', 16)
      .attr('fill', '#2563eb')
      .attr('opacity', 0.2)
      .attr('class', 'animate-ping');

    nodeSelection
      .filter((d) => d.data.type === 'root')
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#ffffff')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('class', 'select-none pointer-events-none')
      .text('TSR');

    // 2. CATEGORY Nodes (Middle Layer)
    const categoryNodes = nodeSelection.filter((d) => d.data.type === 'category');

    categoryNodes
      .append('circle')
      .attr('r', (d) => (d.data.collapsed ? 14 : 16))
      .attr('fill', (d) => d.data.color)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .attr('class', 'shadow-md transition-all duration-200 group-hover:scale-110');

    // Badge showing count of skills inside category
    categoryNodes
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#ffffff')
      .attr('font-size', '9px')
      .attr('font-weight', 'bold')
      .attr('class', 'select-none pointer-events-none font-mono')
      .text((d) => d.data.count || 0);

    // Expand / Collapse indicator icon badge
    categoryNodes
      .append('circle')
      .attr('cx', 12)
      .attr('cy', -10)
      .attr('r', 5)
      .attr('fill', (d) => (d.data.collapsed ? '#f59e0b' : '#10b981'))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1);

    // Category Label Text (oriented for radial readability)
    categoryNodes
      .append('text')
      .attr('dy', '0.35em')
      .attr('x', (d) => (d.x < Math.PI ? 22 : -22))
      .attr('text-anchor', (d) => (d.x < Math.PI ? 'start' : 'end'))
      .attr('transform', (d) => (d.x >= Math.PI ? 'rotate(180)' : null))
      .attr('class', 'fill-slate-800 dark:fill-slate-200 font-bold text-[10px] tracking-wide select-none')
      .text((d) => d.data.name);

    // 3. SKILL Nodes (Leaf Layer)
    const skillNodes = nodeSelection.filter((d) => d.data.type === 'skill');

    skillNodes
      .append('circle')
      .attr('r', (d) => (d.data.skillItem?.id === selectedSkillId ? 8 : 5.5))
      .attr('fill', (d) => d.data.color)
      .attr('stroke', (d) => (d.data.skillItem?.id === selectedSkillId ? '#ffffff' : '#ffffff'))
      .attr('stroke-width', (d) => (d.data.skillItem?.id === selectedSkillId ? 2.5 : 1.5))
      .attr('class', 'transition-all duration-200 group-hover:scale-125 shadow-xs');

    // Selection ring
    skillNodes
      .filter((d) => d.data.skillItem?.id === selectedSkillId)
      .append('circle')
      .attr('r', 12)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '2,2')
      .attr('class', 'animate-spin');

    // Skill Leaf Labels
    if (showLeafLabels) {
      skillNodes
        .append('text')
        .attr('dy', '0.35em')
        .attr('x', (d) => (d.x < Math.PI ? 10 : -10))
        .attr('text-anchor', (d) => (d.x < Math.PI ? 'start' : 'end'))
        .attr('transform', (d) => (d.x >= Math.PI ? 'rotate(180)' : null))
        .attr('class', (d) => {
          const isSelected = d.data.skillItem?.id === selectedSkillId;
          const isMatch =
            !searchTerm || d.data.name.toLowerCase().includes(searchTerm.toLowerCase());
          return `text-[9px] font-medium transition-colors select-none ${
            isSelected
              ? 'fill-blue-600 dark:fill-blue-400 font-bold'
              : isMatch
              ? 'fill-slate-600 dark:fill-slate-400 group-hover:fill-slate-900 dark:group-hover:fill-white'
              : 'fill-slate-300 dark:fill-slate-700'
          }`;
        })
        .text((d) => {
          const raw = d.data.name;
          return raw.length > 20 ? `${raw.slice(0, 18)}…` : raw;
        });
    }

    // Dismiss selection on background SVG click
    svg.on('click', () => {
      setSelectedNode(null);
    });
  }, [
    rootHierarchyData,
    dimensions,
    layoutMode,
    showLeafLabels,
    searchTerm,
    selectedSkillId,
    toggleCategoryCollapse,
    onSelectSkill,
  ]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Control Ribbon */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Left: Search & Category Filter */}
        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search taxonomy packages..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value as CategoryId | 'ALL')}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-white"
            >
              <option value="ALL">All Pillars (11)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label} ({c.count})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Layout Modes & View Actions */}
        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-between lg:justify-end">
          {/* Radial Tree / Cluster Selector */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium">
            <button
              onClick={() => setLayoutMode('cluster')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                layoutMode === 'cluster'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Align all package leaves to equidistant outer radius"
            >
              Radial Cluster
            </button>
            <button
              onClick={() => setLayoutMode('tree')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                layoutMode === 'tree'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Standard hierarchical radial tree"
            >
              Radial Tree
            </button>
          </div>

          {/* Toggle Labels */}
          <button
            onClick={() => setShowLeafLabels(!showLeafLabels)}
            className={`p-2 rounded-xl border transition-colors ${
              showLeafLabels
                ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/60 dark:border-blue-800 dark:text-blue-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title={showLeafLabels ? 'Hide Leaf Labels' : 'Show Leaf Labels'}
          >
            {showLeafLabels ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          {/* Expand / Collapse All */}
          <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 bg-slate-50 dark:bg-slate-950">
            <button
              onClick={expandAll}
              className="px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-850 rounded-lg transition-colors"
              title="Expand all 11 category pillars"
            >
              Expand
            </button>
            <button
              onClick={collapseAll}
              className="px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-850 rounded-lg transition-colors"
              title="Collapse all categories to pillar nodes"
            >
              Collapse
            </button>
          </div>

          {/* Zoom & Fullscreen Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Reset Viewport"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Visual Canvas & Inspector Container */}
      <div
        className={`relative grid grid-cols-1 ${
          selectedNode ? 'lg:grid-cols-4' : ''
        } gap-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden`}
      >
        {/* Canvas Area */}
        <div
          ref={containerRef}
          className={`relative overflow-hidden select-none bg-slate-900/5 dark:bg-slate-950/70 ${
            selectedNode ? 'lg:col-span-3' : 'w-full'
          } ${isFullscreen ? 'fixed inset-4 z-50 rounded-2xl shadow-2xl bg-white dark:bg-slate-900' : 'h-[540px] sm:h-[620px] md:h-[660px]'}`}
        >
          {/* Top HUD status tags */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">D3 Radial Hierarchy</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="hidden sm:inline">Click pillar to collapse/expand • Click skill to inspect</span>
          </div>

          {/* Interactive Hover HUD */}
          {activeHoverNode && (
            <div className="absolute bottom-3 left-3 z-10 max-w-sm p-3 rounded-xl bg-slate-900/95 dark:bg-slate-950/95 text-white border border-slate-700/80 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-150 pointer-events-none">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: activeHoverNode.color }}
                />
                <span className="font-bold text-xs">{activeHoverNode.name}</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-300 uppercase">
                  {activeHoverNode.type}
                </span>
              </div>

              {activeHoverNode.type === 'category' && activeHoverNode.categoryInfo && (
                <div className="mt-2 text-[11px] text-slate-300 space-y-1">
                  <p className="line-clamp-2 text-slate-400">{activeHoverNode.categoryInfo.description}</p>
                  <div className="flex items-center justify-between text-[10px] pt-1 text-slate-400 border-t border-slate-800">
                    <span>Domain Lead:</span>
                    <span className="text-slate-200 font-semibold">{activeHoverNode.categoryInfo.domainLead.split(',')[0]}</span>
                  </div>
                </div>
              )}

              {activeHoverNode.type === 'skill' && activeHoverNode.skillItem && (
                <div className="mt-2 text-[11px] space-y-1.5 text-slate-300">
                  <p className="line-clamp-2 text-slate-400">{activeHoverNode.skillItem.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-slate-800">
                    <div>
                      <span className="text-slate-500">Complexity: </span>
                      <span className="font-semibold text-slate-200">{activeHoverNode.skillItem.complexity}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Pass Rate: </span>
                      <span className="font-semibold text-emerald-400">{activeHoverNode.skillItem.testPassRate}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SVG Canvas */}
          <svg ref={svgRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />
        </div>

        {/* Right Detail Inspector Panel (When node clicked) */}
        {selectedNode && (
          <div className="p-5 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: selectedNode.color }}
                  />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {selectedNode.type} Node
                  </span>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  {selectedNode.name}
                </h3>
                {selectedNode.categoryId && (
                  <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold">
                    {selectedNode.categoryId}
                  </span>
                )}
              </div>

              {/* Category Node Details */}
              {selectedNode.type === 'category' && selectedNode.categoryInfo && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Pillar Overview</span>
                    <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                      {selectedNode.categoryInfo.description}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>Domain Leadership:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{selectedNode.categoryInfo.domainLead}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>Enrolled Packages:</span>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{selectedNode.count} skills</span>
                    </div>
                  </div>

                  <button
                    onClick={() => selectedNode.categoryId && toggleCategoryCollapse(selectedNode.categoryId)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-xs"
                  >
                    {selectedNode.collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    <span>{selectedNode.collapsed ? 'Expand Child Packages' : 'Collapse Branch'}</span>
                  </button>
                </div>
              )}

              {/* Skill Node Details */}
              {selectedNode.type === 'skill' && selectedNode.skillItem && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Capability Purpose</span>
                    <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                      {selectedNode.skillItem.purpose || selectedNode.skillItem.description}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Test Pass Rate:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        {selectedNode.skillItem.testPassRate}% Pass
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Maintainer:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {selectedNode.skillItem.maintainer}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Prerequisites:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {selectedNode.skillItem.dependencies.length} upstream
                      </span>
                    </div>
                  </div>

                  {selectedNode.skillItem.tags && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {selectedNode.skillItem.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {onSelectSkill && selectedNode.skillItem && (
                    <button
                      onClick={() => onSelectSkill(selectedNode.skillItem!)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs"
                    >
                      <span>Inspect Full Specification</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-400 text-center">
              D3.js Hierarchical Radial Tree Engine
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
