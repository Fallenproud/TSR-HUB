import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Layers,
  Search,
  Filter,
  Eye,
  EyeOff,
  Sliders,
  Share2,
  Activity,
  ArrowRight,
  ExternalLink,
  Shield,
  Zap,
  Info,
  Compass,
  GitCommit,
  Flame,
  CheckCircle2,
  Clock,
  Radio,
} from 'lucide-react';
import { SkillItem, CategoryId, CategoryInfo, SkillStatus } from '../../types';
import { CATEGORIES_DATA, CATEGORY_LIST } from '../../data/categoriesData';
import { SKILLS_DATA } from '../../data/skillsData';

export type TopologyLayoutMode = 'force' | 'cluster' | 'radial' | 'dag';

export interface ClusterMetric {
  count: number;
  internalLinks: number;
  avgPassRate: number;
  color: string;
}

export interface D3TopologyNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  number: string;
  category: CategoryId;
  color: string;
  badgeColor: string;
  status: SkillStatus;
  complexity: 'Low' | 'Medium' | 'High';
  version: string;
  maintainer: string;
  testPassRate: number;
  tags: string[];
  description: string;
  purpose?: string;
  inDegree: number;
  outDegree: number;
  totalDegree: number;
  depth: number;
  radius: number;
}

export interface D3TopologyLink extends d3.SimulationLinkDatum<D3TopologyNode> {
  id: string;
  source: string | D3TopologyNode;
  target: string | D3TopologyNode;
  isCrossCategory: boolean;
}

interface D3TopologyGraphProps {
  skills?: SkillItem[];
  categories?: CategoryInfo[];
  onSelectSkill?: (skill: SkillItem) => void;
  selectedSkillId?: string;
  initialCategoryFilter?: CategoryId | 'ALL';
}

export const D3TopologyGraph: React.FC<D3TopologyGraphProps> = ({
  skills = SKILLS_DATA,
  categories = CATEGORY_LIST,
  onSelectSkill,
  selectedSkillId,
  initialCategoryFilter = 'ALL',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const simulationRef = useRef<d3.Simulation<D3TopologyNode, D3TopologyLink> | null>(null);

  // Layout & View State
  const [layoutMode, setLayoutMode] = useState<TopologyLayoutMode>('force');
  const [categoryFilter, setCategoryFilter] = useState<CategoryId | 'ALL'>(initialCategoryFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [showConvexHulls, setShowConvexHulls] = useState(true);
  const [showFlowParticles, setShowFlowParticles] = useState(true);
  const [showNodeLabels, setShowNodeLabels] = useState(true);
  const [showCrossLinksOnly, setShowCrossLinksOnly] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPhysicsDrawerOpen, setIsPhysicsDrawerOpen] = useState(false);

  // Physics Simulation Tuning
  const [chargeStrength, setChargeStrength] = useState(-240);
  const [linkDistance, setLinkDistance] = useState(85);
  const [collisionRadius, setCollisionRadius] = useState(30);

  // Selection & Highlight state
  const [hoveredNode, setHoveredNode] = useState<D3TopologyNode | null>(null);
  const [pinnedNode, setPinnedNode] = useState<D3TopologyNode | null>(null);

  // Sync category filter if prop changes
  useEffect(() => {
    if (initialCategoryFilter) {
      setCategoryFilter(initialCategoryFilter);
    }
  }, [initialCategoryFilter]);

  // Derive Graph Nodes & Links with Centrality Metrics
  const { graphNodes, graphLinks, clusterMetrics, categoryCentroids } = useMemo(() => {
    const filteredSkills =
      categoryFilter === 'ALL'
        ? skills
        : skills.filter((s) => s.category === categoryFilter);

    const activeSkillsMap = new Map<string, SkillItem>();
    const nameToSkillMap = new Map<string, SkillItem>();
    skills.forEach((s) => {
      nameToSkillMap.set(s.name.toLowerCase().trim(), s);
      nameToSkillMap.set(s.id.toLowerCase().trim(), s);
    });

    filteredSkills.forEach((s) => {
      activeSkillsMap.set(s.id, s);
    });

    // Degree counters
    const inDegreeMap = new Map<string, number>();
    const outDegreeMap = new Map<string, number>();
    const linksList: { sourceId: string; targetId: string; isCross: boolean }[] = [];

    filteredSkills.forEach((skill) => {
      const deps = skill.dependencies || [];
      outDegreeMap.set(skill.id, deps.length);

      deps.forEach((depName) => {
        const target = nameToSkillMap.get(depName.toLowerCase().trim());
        if (target && activeSkillsMap.has(target.id)) {
          inDegreeMap.set(target.id, (inDegreeMap.get(target.id) || 0) + 1);
          linksList.push({
            sourceId: skill.id,
            targetId: target.id,
            isCross: skill.category !== target.category,
          });
        }
      });
    });

    // Compute topological DAG depth (BFS layering)
    const depthMap = new Map<string, number>();
    filteredSkills.forEach((s) => {
      if ((inDegreeMap.get(s.id) || 0) === 0) {
        depthMap.set(s.id, 0);
      }
    });

    for (let iter = 0; iter < 4; iter++) {
      linksList.forEach((link) => {
        const srcDepth = depthMap.get(link.sourceId) ?? 0;
        const tgtDepth = depthMap.get(link.targetId) ?? 0;
        if (tgtDepth <= srcDepth) {
          depthMap.set(link.targetId, srcDepth + 1);
        }
      });
    }

    // Build Nodes
    const nodes: D3TopologyNode[] = filteredSkills.map((s) => {
      const inD = inDegreeMap.get(s.id) || 0;
      const outD = outDegreeMap.get(s.id) || 0;
      const totalD = inD + outD;
      const catMeta = CATEGORIES_DATA[s.category] || {
        color: '#6366f1',
        badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      };

      const radius = Math.min(30, Math.max(16, 16 + totalD * 1.6));

      return {
        id: s.id,
        name: s.name,
        number: s.number,
        category: s.category,
        color: catMeta.color,
        badgeColor: catMeta.badgeColor,
        status: s.status,
        complexity: s.complexity,
        version: s.version,
        maintainer: s.maintainer,
        testPassRate: s.testPassRate,
        tags: s.tags || [],
        description: s.description,
        purpose: s.purpose,
        inDegree: inD,
        outDegree: outD,
        totalDegree: totalD,
        depth: depthMap.get(s.id) ?? 1,
        radius,
      };
    });

    // Category Centroid layout calculations
    const uniqueCats = Array.from(new Set(nodes.map((n) => n.category)));
    const centroids: Record<string, { x: number; y: number }> = {};
    const centerRadius = 260;
    uniqueCats.forEach((catId, idx) => {
      const angle = (idx / uniqueCats.length) * 2 * Math.PI - Math.PI / 2;
      centroids[catId] = {
        x: Math.cos(angle) * centerRadius,
        y: Math.sin(angle) * centerRadius,
      };
    });

    // Build Links
    const links: D3TopologyLink[] = linksList
      .filter((l) => (showCrossLinksOnly ? l.isCross : true))
      .map((l, idx) => ({
        id: `link-${idx}-${l.sourceId}-${l.targetId}`,
        source: l.sourceId,
        target: l.targetId,
        isCrossCategory: l.isCross,
      }));

    // Cluster Metrics
    const clusterStats: Record<string, ClusterMetric> = {};
    uniqueCats.forEach((cat) => {
      const catNodes = nodes.filter((n) => n.category === cat);
      const catNodeIds = new Set(catNodes.map((n) => n.id));
      const internalLinks = linksList.filter(
        (l) => catNodeIds.has(l.sourceId) && catNodeIds.has(l.targetId)
      ).length;
      const avgPass =
        catNodes.length > 0
          ? Math.round(
              catNodes.reduce((sum, n) => sum + n.testPassRate, 0) / catNodes.length
            )
          : 100;

      clusterStats[cat] = {
        count: catNodes.length,
        internalLinks,
        avgPassRate: avgPass,
        color: CATEGORIES_DATA[cat]?.color || '#6366f1',
      };
    });

    return {
      graphNodes: nodes,
      graphLinks: links,
      clusterMetrics: clusterStats,
      categoryCentroids: centroids,
    };
  }, [skills, categoryFilter, showCrossLinksOnly]);

  // Active highlighted / pinned node
  const activeFocusNode = pinnedNode || hoveredNode;

  const { connectedNodeIds, upstreamNodeIds, downstreamNodeIds } = useMemo(() => {
    if (!activeFocusNode) {
      return {
        connectedNodeIds: new Set<string>(),
        upstreamNodeIds: new Set<string>(),
        downstreamNodeIds: new Set<string>(),
      };
    }

    const targetId = activeFocusNode.id;
    const upIds = new Set<string>();
    const downIds = new Set<string>();
    const allConn = new Set<string>([targetId]);

    graphLinks.forEach((link) => {
      const srcId = typeof link.source === 'object' ? link.source.id : link.source;
      const tgtId = typeof link.target === 'object' ? link.target.id : link.target;

      if (srcId === targetId) {
        upIds.add(tgtId);
        allConn.add(tgtId);
      }
      if (tgtId === targetId) {
        downIds.add(srcId);
        allConn.add(srcId);
      }
    });

    return {
      connectedNodeIds: allConn,
      upstreamNodeIds: upIds,
      downstreamNodeIds: downIds,
    };
  }, [activeFocusNode, graphLinks]);

  // D3 Rendering & Simulation Lifecycle
  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    const width = containerRef.current.clientWidth || 900;
    const height = isFullscreen ? window.innerHeight - 180 : 580;
    const centerX = width / 2;
    const centerY = height / 2;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    const defs = svg.append('defs');

    // Default arrow marker
    defs
      .append('marker')
      .attr('id', 'topo-arrow-default')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 24)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L10,0L0,4')
      .attr('fill', '#94a3b8')
      .attr('opacity', 0.6);

    // Highlighted upstream arrow
    defs
      .append('marker')
      .attr('id', 'topo-arrow-upstream')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 26)
      .attr('refY', 0)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L10,0L0,4')
      .attr('fill', '#38bdf8');

    // Highlighted downstream arrow
    defs
      .append('marker')
      .attr('id', 'topo-arrow-downstream')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 26)
      .attr('refY', 0)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L10,0L0,4')
      .attr('fill', '#f59e0b');

    // Grid pattern
    const pattern = defs
      .append('pattern')
      .attr('id', 'topo-grid-dots')
      .attr('width', 32)
      .attr('height', 32)
      .attr('patternUnits', 'userSpaceOnUse');

    pattern
      .append('circle')
      .attr('cx', 2)
      .attr('cy', 2)
      .attr('r', 1)
      .attr('fill', '#64748b')
      .attr('opacity', 0.15);

    const g = svg.append('g').attr('class', 'topology-zoom-container');

    g.append('rect')
      .attr('x', -width * 2)
      .attr('y', -height * 2)
      .attr('width', width * 5)
      .attr('height', height * 5)
      .attr('fill', 'url(#topo-grid-dots)')
      .attr('pointer-events', 'all');

    const hullLayer = g.append('g').attr('class', 'convex-hulls-layer');
    const linkLayer = g.append('g').attr('class', 'links-layer');
    const nodeLayer = g.append('g').attr('class', 'nodes-layer');

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    const simNodes: D3TopologyNode[] = graphNodes.map((d) => ({ ...d }));
    const simLinks: D3TopologyLink[] = graphLinks.map((d) => ({ ...d }));

    const simulation = d3
      .forceSimulation<D3TopologyNode>(simNodes)
      .force(
        'link',
        d3
          .forceLink<D3TopologyNode, D3TopologyLink>(simLinks)
          .id((d) => d.id)
          .distance((d) => (d.isCrossCategory ? linkDistance * 1.3 : linkDistance))
      )
      .force('charge', d3.forceManyBody().strength(chargeStrength))
      .force('collision', d3.forceCollide<D3TopologyNode>().radius((d) => d.radius + collisionRadius))
      .force('center', d3.forceCenter(centerX, centerY));

    if (layoutMode === 'cluster') {
      simulation.force(
        'clusterX',
        d3.forceX<D3TopologyNode>((d) => {
          const centroid = categoryCentroids[d.category];
          return centroid ? centerX + centroid.x : centerX;
        }).strength(0.6)
      );
      simulation.force(
        'clusterY',
        d3.forceY<D3TopologyNode>((d) => {
          const centroid = categoryCentroids[d.category];
          return centroid ? centerY + centroid.y : centerY;
        }).strength(0.6)
      );
    } else if (layoutMode === 'radial') {
      simulation.force(
        'radial',
        d3.forceRadial<D3TopologyNode>(
          (d) => (d.inDegree > 2 ? 60 : d.totalDegree > 1 ? 180 : 310),
          centerX,
          centerY
        ).strength(0.7)
      );
    } else if (layoutMode === 'dag') {
      simulation.force(
        'dagX',
        d3.forceX<D3TopologyNode>((d) => {
          const maxDepth = 4;
          const colSpacing = (width - 240) / maxDepth;
          return 120 + d.depth * colSpacing;
        }).strength(0.85)
      );
      simulation.force(
        'dagY',
        d3.forceY<D3TopologyNode>(() => centerY).strength(0.2)
      );
    }

    simulationRef.current = simulation;

    // Render Links
    const linkElements = linkLayer
      .selectAll<SVGPathElement, D3TopologyLink>('path')
      .data(simLinks)
      .enter()
      .append('path')
      .attr('class', 'topology-link transition-opacity duration-300')
      .attr('fill', 'none')
      .attr('stroke', (d) => (d.isCrossCategory ? '#a855f7' : '#94a3b8'))
      .attr('stroke-width', (d) => (d.isCrossCategory ? 1.8 : 1.4))
      .attr('stroke-opacity', 0.45)
      .attr('stroke-dasharray', showFlowParticles ? '6,4' : 'none')
      .attr('marker-end', 'url(#topo-arrow-default)');

    // Render Nodes
    const nodeElements = nodeLayer
      .selectAll<SVGGElement, D3TopologyNode>('g')
      .data(simNodes)
      .enter()
      .append('g')
      .attr('class', 'topology-node cursor-pointer transition-transform duration-200 group')
      .call(
        d3
          .drag<SVGGElement, D3TopologyNode>()
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

    // Status Ring
    nodeElements
      .append('circle')
      .attr('class', 'node-status-ring')
      .attr('r', (d) => d.radius + 3)
      .attr('fill', 'none')
      .attr('stroke', (d) => {
        if (d.status === 'Complete') return '#10b981';
        if (d.status === 'In Progress') return '#f59e0b';
        if (d.status === 'Under Review') return '#6366f1';
        return '#94a3b8';
      })
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', (d) => (d.status === 'In Progress' ? '4,3' : 'none'))
      .attr('opacity', 0.85);

    // Core Circle
    nodeElements
      .append('circle')
      .attr('class', 'node-core')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => d.color)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', (d) => (d.id === selectedSkillId ? 3.5 : 2))
      .attr('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))');

    // Number text
    nodeElements
      .append('text')
      .attr('class', 'node-number-text')
      .text((d) => d.number)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#ffffff')
      .attr('font-size', (d) => (d.radius > 20 ? '11px' : '9.5px'))
      .attr('font-family', 'monospace')
      .attr('font-weight', '800')
      .attr('pointer-events', 'none');

    // Label Pill
    if (showNodeLabels) {
      const labelGroup = nodeElements
        .append('g')
        .attr('class', 'node-label-group pointer-events-none')
        .attr('transform', (d) => `translate(0, ${d.radius + 14})`);

      labelGroup
        .append('rect')
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('x', (d) => -(Math.min(100, d.name.length * 5.2) / 2) - 4)
        .attr('y', -8)
        .attr('width', (d) => Math.min(100, d.name.length * 5.2) + 8)
        .attr('height', 16)
        .attr('fill', 'currentColor')
        .attr('class', 'text-slate-900/85 dark:text-slate-950/90')
        .attr('opacity', 0.9);

      labelGroup
        .append('text')
        .text((d) => (d.name.length > 18 ? `${d.name.substring(0, 16)}…` : d.name))
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', '#ffffff')
        .attr('font-size', '9.5px')
        .attr('font-weight', '600')
        .attr('letter-spacing', '-0.02em');
    }

    // Node Listeners
    nodeElements
      .on('mouseenter', (_, d) => {
        setHoveredNode(d);
      })
      .on('mouseleave', () => {
        setHoveredNode(null);
      })
      .on('click', (e, d) => {
        e.stopPropagation();
        setPinnedNode((prev) => (prev?.id === d.id ? null : d));
        const found = skills.find((s) => s.id === d.id);
        if (found && onSelectSkill) {
          onSelectSkill(found);
        }
      });

    svg.on('click', () => {
      setPinnedNode(null);
    });

    // Convex Hulls Calculation
    const updateConvexHulls = () => {
      if (!showConvexHulls) {
        hullLayer.selectAll('*').remove();
        return;
      }

      const categoryPointsMap = new Map<string, [number, number][]>();
      simNodes.forEach((node) => {
        if (node.x === undefined || node.y === undefined) return;
        const current = categoryPointsMap.get(node.category) || [];
        const pad = node.radius + 16;
        current.push([node.x - pad, node.y - pad]);
        current.push([node.x + pad, node.y - pad]);
        current.push([node.x - pad, node.y + pad]);
        current.push([node.x + pad, node.y + pad]);
        categoryPointsMap.set(node.category, current);
      });

      const hullData: { category: string; color: string; pathStr: string }[] = [];

      categoryPointsMap.forEach((points, catId) => {
        if (points.length < 3) return;
        const hull = d3.polygonHull(points);
        if (hull) {
          const catMeta = CATEGORIES_DATA[catId] || { color: '#6366f1' };
          const pathStr = d3.line()(hull) + 'Z';
          hullData.push({
            category: catId,
            color: catMeta.color,
            pathStr,
          });
        }
      });

      const hulls = hullLayer
        .selectAll<SVGPathElement, typeof hullData[0]>('path')
        .data(hullData, (d) => d.category);

      hulls
        .enter()
        .append('path')
        .attr('class', 'category-hull transition-all duration-300 pointer-events-none')
        .attr('fill', (d) => d.color)
        .attr('fill-opacity', 0.08)
        .attr('stroke', (d) => d.color)
        .attr('stroke-width', 1.5)
        .attr('stroke-opacity', 0.3)
        .attr('stroke-dasharray', '4,4')
        .merge(hulls)
        .attr('d', (d) => d.pathStr);

      hulls.exit().remove();
    };

    simulation.on('tick', () => {
      linkElements.attr('d', (d) => {
        const src = d.source as D3TopologyNode;
        const tgt = d.target as D3TopologyNode;
        if (!src.x || !src.y || !tgt.x || !tgt.y) return '';

        const dx = tgt.x - src.x;
        const dy = tgt.y - src.y;
        const dr = d.isCrossCategory ? Math.sqrt(dx * dx + dy * dy) * 1.2 : 0;

        if (dr === 0) {
          return `M${src.x},${src.y}L${tgt.x},${tgt.y}`;
        }
        return `M${src.x},${src.y}A${dr},${dr} 0 0,1 ${tgt.x},${tgt.y}`;
      });

      nodeElements.attr('transform', (d) => `translate(${d.x || 0},${d.y || 0})`);
      updateConvexHulls();
    });

    return () => {
      simulation.stop();
    };
  }, [
    graphNodes,
    graphLinks,
    layoutMode,
    chargeStrength,
    linkDistance,
    collisionRadius,
    showConvexHulls,
    showFlowParticles,
    showNodeLabels,
    isFullscreen,
    selectedSkillId,
  ]);

  // Highlighting & Focus logic
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    const isHighlighting = !!activeFocusNode || searchQuery.trim().length > 0;
    const searchMatchIds = new Set<string>();

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      graphNodes.forEach((n) => {
        if (
          n.name.toLowerCase().includes(q) ||
          n.number.includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
        ) {
          searchMatchIds.add(n.id);
        }
      });
    }

    svg.selectAll<SVGGElement, D3TopologyNode>('.topology-node').each(function (d) {
      const nodeEl = d3.select(this);
      const isFocused = activeFocusNode?.id === d.id;
      const isUpstream = upstreamNodeIds.has(d.id);
      const isDownstream = downstreamNodeIds.has(d.id);
      const isSearchMatch = searchMatchIds.has(d.id);

      if (!isHighlighting) {
        nodeEl.attr('opacity', 1);
        nodeEl.select('.node-core').attr('stroke', '#ffffff');
        return;
      }

      if (isFocused || isSearchMatch) {
        nodeEl.attr('opacity', 1);
        nodeEl
          .select('.node-core')
          .attr('stroke', '#38bdf8')
          .attr('stroke-width', 4);
      } else if (isUpstream) {
        nodeEl.attr('opacity', 1);
        nodeEl
          .select('.node-core')
          .attr('stroke', '#38bdf8')
          .attr('stroke-width', 3);
      } else if (isDownstream) {
        nodeEl.attr('opacity', 1);
        nodeEl
          .select('.node-core')
          .attr('stroke', '#f59e0b')
          .attr('stroke-width', 3);
      } else {
        nodeEl.attr('opacity', 0.18);
        nodeEl.select('.node-core').attr('stroke', '#ffffff').attr('stroke-width', 2);
      }
    });

    svg.selectAll<SVGPathElement, D3TopologyLink>('.topology-link').each(function (d) {
      const linkEl = d3.select(this);
      const srcId = typeof d.source === 'object' ? d.source.id : d.source;
      const tgtId = typeof d.target === 'object' ? d.target.id : d.target;

      if (!activeFocusNode) {
        linkEl
          .attr('stroke-opacity', 0.45)
          .attr('stroke-width', d.isCrossCategory ? 1.8 : 1.4)
          .attr('marker-end', 'url(#topo-arrow-default)');
        return;
      }

      const isUpstreamLink = srcId === activeFocusNode.id && upstreamNodeIds.has(tgtId);
      const isDownstreamLink = tgtId === activeFocusNode.id && downstreamNodeIds.has(srcId);

      if (isUpstreamLink) {
        linkEl
          .attr('stroke', '#38bdf8')
          .attr('stroke-width', 2.8)
          .attr('stroke-opacity', 0.95)
          .attr('marker-end', 'url(#topo-arrow-upstream)');
      } else if (isDownstreamLink) {
        linkEl
          .attr('stroke', '#f59e0b')
          .attr('stroke-width', 2.8)
          .attr('stroke-opacity', 0.95)
          .attr('marker-end', 'url(#topo-arrow-downstream)');
      } else {
        linkEl.attr('stroke-opacity', 0.08);
      }
    });
  }, [
    activeFocusNode,
    connectedNodeIds,
    upstreamNodeIds,
    downstreamNodeIds,
    searchQuery,
    selectedSkillId,
    graphNodes,
  ]);

  // Viewport Controls
  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.3);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.75);
  };

  const handleResetView = () => {
    if (!svgRef.current || !zoomBehaviorRef.current || !containerRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(500)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
  };

  const handleFocusHubNode = () => {
    const hubNode = [...graphNodes].sort((a, b) => b.totalDegree - a.totalDegree)[0];
    if (hubNode) {
      setPinnedNode(hubNode);
    }
  };

  const graphDensity = useMemo(() => {
    const n = graphNodes.length;
    if (n <= 1) return '0.0';
    const maxLinks = n * (n - 1);
    return ((graphLinks.length / maxLinks) * 100).toFixed(1);
  }, [graphNodes.length, graphLinks.length]);

  const crossCategoryLinkCount = useMemo(() => {
    return graphLinks.filter((l) => l.isCrossCategory).length;
  }, [graphLinks]);

  return (
    <div
      className={`relative w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all overflow-hidden flex flex-col ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : ''
      }`}
    >
      {/* Top Interactive Toolbar */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        {/* Left: Layout Mode Selector & Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center p-0.5 rounded-xl bg-slate-200/70 dark:bg-slate-800 text-xs font-semibold">
            <button
              onClick={() => setLayoutMode('force')}
              className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                layoutMode === 'force'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Force-directed organic topology"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Force Organic</span>
            </button>

            <button
              onClick={() => setLayoutMode('cluster')}
              className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                layoutMode === 'cluster'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Category Cluster Centroid Topology with Density Hulls"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Category Clusters</span>
            </button>

            <button
              onClick={() => setLayoutMode('radial')}
              className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                layoutMode === 'radial'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Concentric radial rings based on hub centrality"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Radial Rings</span>
            </button>

            <button
              onClick={() => setLayoutMode('dag')}
              className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                layoutMode === 'dag'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Directed Acyclic Graph hierarchical execution flow"
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>DAG Flow</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter node or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-40 sm:w-48 pl-8 pr-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Right: Layer Toggles & Physics Menu */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowConvexHulls((prev) => !prev)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              showConvexHulls
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800'
                : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
            }`}
            title="Toggle Category Density Convex Hulls"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Cluster Hulls</span>
          </button>

          <button
            onClick={() => setShowFlowParticles((prev) => !prev)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              showFlowParticles
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
            }`}
            title="Toggle Flow Pulses along dependencies"
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Flow Pulse</span>
          </button>

          <button
            onClick={() => setShowCrossLinksOnly((prev) => !prev)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              showCrossLinksOnly
                ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
            }`}
            title="Highlight only cross-category bridge dependencies"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Cross-Domain</span>
          </button>

          <button
            onClick={() => setIsPhysicsDrawerOpen((prev) => !prev)}
            className={`p-1.5 rounded-xl border text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
              isPhysicsDrawerOpen
                ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-300'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
            }`}
            title="Tweak D3 Physics Repulsion & Distances"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Topology Canvas'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Physics Sliders Drawer */}
      {isPhysicsDrawerOpen && (
        <div className="p-3 bg-slate-100/90 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs animate-in slide-in-from-top-2">
          <div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
              <span>Charge Repulsion:</span>
              <span className="font-mono">{chargeStrength}</span>
            </div>
            <input
              type="range"
              min={-500}
              max={-50}
              step={20}
              value={chargeStrength}
              onChange={(e) => setChargeStrength(Number(e.target.value))}
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
              <span>Link Distance:</span>
              <span className="font-mono">{linkDistance}px</span>
            </div>
            <input
              type="range"
              min={40}
              max={200}
              step={10}
              value={linkDistance}
              onChange={(e) => setLinkDistance(Number(e.target.value))}
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
              <span>Collision Radius:</span>
              <span className="font-mono">+{collisionRadius}px</span>
            </div>
            <input
              type="range"
              min={10}
              max={60}
              step={5}
              value={collisionRadius}
              onChange={(e) => setCollisionRadius(Number(e.target.value))}
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Main Graph Canvas Viewport */}
      <div
        ref={containerRef}
        className={`relative w-full overflow-hidden select-none bg-slate-900/5 dark:bg-slate-950/70 ${
          isFullscreen ? 'flex-1 min-h-[600px]' : 'h-[580px]'
        }`}
      >
        <svg ref={svgRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

        {/* Viewport Nav Tools */}
        <div className="absolute top-4 right-4 flex flex-col gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Reset View to Center"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleFocusHubNode}
            className="p-2 rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
            title="Focus Centrality Hub Node"
          >
            <Flame className="w-4 h-4" />
          </button>
        </div>

        {/* Top Left Live Legend */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md flex items-center gap-3 pointer-events-auto">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{graphNodes.length} Nodes</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-mono">
              {graphLinks.length} Links
            </div>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
              {graphDensity}% Density
            </div>
          </div>

          {activeFocusNode && (
            <div className="bg-slate-950/90 text-white backdrop-blur-md p-2.5 rounded-xl border border-slate-800 shadow-lg text-xs space-y-1.5 animate-in fade-in">
              <div className="font-bold flex items-center gap-1.5 text-slate-200">
                <Radio className="w-3 h-3 text-indigo-400" />
                <span>Lineage: #{activeFocusNode.number} {activeFocusNode.name}</span>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-sky-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  Prerequisites ({upstreamNodeIds.size})
                </span>
                <span className="flex items-center gap-1 text-amber-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Dependents ({downstreamNodeIds.size})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Floating Node Details Card */}
        {activeFocusNode && (
          <div className="absolute bottom-4 right-4 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl text-xs space-y-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-white shadow-xs shrink-0"
                  style={{ backgroundColor: activeFocusNode.color }}
                >
                  #{activeFocusNode.number}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {activeFocusNode.name}
                  </h4>
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${activeFocusNode.badgeColor}`}
                  >
                    {activeFocusNode.category}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded font-bold">
                  {activeFocusNode.testPassRate}% Pass
                </span>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed line-clamp-2">
              {activeFocusNode.description}
            </p>

            <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Depends On (In)
                </span>
                <span className="font-bold text-sky-600 dark:text-sky-400">
                  {activeFocusNode.outDegree} Prerequisites
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Required By (Out)
                </span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {activeFocusNode.inDegree} Dependents
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-400">
                Maintainer: <strong className="text-slate-700 dark:text-slate-300">{activeFocusNode.maintainer}</strong>
              </span>

              {onSelectSkill && (
                <button
                  type="button"
                  onClick={() => {
                    const found = skills.find((s) => s.id === activeFocusNode.id);
                    if (found) onSelectSkill(found);
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <span>Inspect Spec</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Cluster Density Summary Footer Strip */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Cluster Density & Inter-Domain Modularity
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            {crossCategoryLinkCount} Cross-Domain Bridges across {Object.keys(clusterMetrics).length} Autonomous Guilds
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {Object.entries(clusterMetrics).map(([catId, metric]: [string, ClusterMetric]) => {
            const isSelected = categoryFilter === catId;
            return (
              <button
                key={catId}
                type="button"
                onClick={() => setCategoryFilter((prev) => (prev === catId ? 'ALL' : (catId as CategoryId)))}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-white dark:bg-slate-900 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: metric.color }} />
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {catId}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{metric.count} pkgs</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>{metric.internalLinks} links</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {metric.avgPassRate}% avg
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
