"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import { SymptomNetworkGraphProps, SymptomNode, Severity } from '../types';
import { ANIMATION_COLORS, EASING } from '../AnimationTokens';
import { cn } from '@/lib/utils';

// D3 Node/Link Extensions for simulation
interface SimulationNode extends d3.SimulationNodeDatum, SymptomNode {
    radius: number;
}
interface SimulationLink extends d3.SimulationLinkDatum<SimulationNode> {
    source: string | SimulationNode;
    target: string | SimulationNode;
}

export const SymptomNetworkGraph = React.memo(({ symptoms, activeSymptom, width = 400, height = 400, className }: SymptomNetworkGraphProps & { className?: string }) => {
    const [nodes, setNodes] = useState<SimulationNode[]>([]);
    const [links, setLinks] = useState<SimulationLink[]>([]);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    const getSeverityColor = (severity: Severity) => {
        return ANIMATION_COLORS.severity[severity] || ANIMATION_COLORS.severity.inactive;
    };

    const getNodeRadius = (severity: Severity) => {
        switch (severity) {
            case 'critical': return 24;
            case 'moderate': return 18;
            case 'low': return 12;
            default: return 12;
        }
    };

    useEffect(() => {
        if (!symptoms || symptoms.length === 0) return;

        // Initialize simulation nodes
        const simNodes: SimulationNode[] = symptoms.map(s => ({
            ...s,
            radius: getNodeRadius(s.severity),
            x: width / 2 + (Math.random() - 0.5) * 100, // starting position
            y: height / 2 + (Math.random() - 0.5) * 100,
        }));

        // Initialize links based on correlations
        const simLinks: SimulationLink[] = [];
        symptoms.forEach(s => {
            s.correlations.forEach(targetId => {
                // Prevent duplicate undirected links
                const existingLink = simLinks.find(l =>
                    (l.source === s.id && l.target === targetId) ||
                    (l.target === s.id && l.source === targetId)
                );

                if (!existingLink && symptoms.find(t => t.id === targetId)) {
                    simLinks.push({ source: s.id, target: targetId });
                }
            });
        });

        // Setup D3 Simulation
        const simulation = d3.forceSimulation<SimulationNode>(simNodes)
            .force('link', d3.forceLink<SimulationNode, SimulationLink>(simLinks).id(d => d.id).distance(100))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collide', d3.forceCollide().radius(d => (d as SimulationNode).radius + 10).iterations(3));

        // Update state on tick
        simulation.on('tick', () => {
            setNodes([...simNodes]);
            setLinks([...simLinks]);
        });

        // Stop simulation when unmounted
        return () => {
            simulation.stop();
        };
    }, [symptoms, width, height]);

    // Derived state for visual highlights
    const activeOrHovered = hoveredNode || activeSymptom;

    const isNodeHighlighted = (id: string) => {
        if (!activeOrHovered) return false;
        if (activeOrHovered === id) return true;

        // Highlight if connected to active/hovered node
        const connectedNode = symptoms.find(s => s.id === activeOrHovered);
        return connectedNode?.correlations.includes(id) ?? false;
    };

    const isLinkHighlighted = (sourceId: string, targetId: string) => {
        if (!activeOrHovered) return false;
        return sourceId === activeOrHovered || targetId === activeOrHovered;
    };

    return (
        <div className={cn("relative flex items-center justify-center", className)} style={{ width, height }}>
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                {/* Render Links */}
                <g strokeOpacity={0.6}>
                    {links.map((link, i) => {
                        // D3 replaces source/target string IDs with actual node objects after setup
                        const source = link.source as SimulationNode;
                        const target = link.target as SimulationNode;

                        if (!source.x || !source.y || !target.x || !target.y) return null;

                        const highlighted = isLinkHighlighted(source.id, target.id);
                        const pathData = `M${source.x},${source.y} Q${(source.x + target.x) / 2 + 20},${(source.y + target.y) / 2 - 20} ${target.x},${target.y}`;

                        return (
                            <g key={`link-${i}`}>
                                {/* Base curve */}
                                <path
                                    d={pathData}
                                    fill="none"
                                    stroke={highlighted ? ANIMATION_COLORS.states.processing : ANIMATION_COLORS.severity.inactive}
                                    strokeWidth={highlighted ? 3 : 1}
                                    className="transition-colors duration-300"
                                />
                                {/* Glowing trail for highlighted Links */}
                                {highlighted && (
                                    <motion.path
                                        d={pathData}
                                        fill="none"
                                        stroke={ANIMATION_COLORS.glow.teal}
                                        strokeWidth="6"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    />
                                )}
                            </g>
                        );
                    })}
                </g>

                {/* Render Nodes */}
                <g>
                    {nodes.map((node) => {
                        if (!node.x || !node.y) return null;

                        const highlighted = isNodeHighlighted(node.id);
                        const isActivePrimary = activeOrHovered === node.id;
                        const color = getSeverityColor(node.severity);

                        return (
                            <motion.g
                                key={node.id}
                                onMouseEnter={() => setHoveredNode(node.id)}
                                onMouseLeave={() => setHoveredNode(null)}
                                // Animate position changes from D3 ticks smoothly
                                animate={{ x: node.x, y: node.y }}
                                transition={{ type: 'spring', stiffness: 50, damping: 20, mass: 0.5 }}
                                style={{ cursor: 'pointer' }}
                                whileHover={{ scale: 1.1 }}
                            >
                                {/* Pulse ring for primary active node */}
                                {isActivePrimary && (
                                    <motion.circle
                                        r={node.radius + 8}
                                        fill="none"
                                        stroke={color}
                                        strokeWidth="2"
                                        animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: EASING.tween.easeInOut }}
                                    />
                                )}

                                {/* Main Node Circle */}
                                <circle
                                    r={node.radius}
                                    fill={ANIMATION_COLORS.background}
                                    stroke={color}
                                    strokeWidth={highlighted ? 4 : 2}
                                    className="transition-all duration-300"
                                />

                                {/* Inner Fill */}
                                <circle
                                    r={node.radius - 4}
                                    fill={color}
                                    opacity={highlighted ? 0.8 : 0.4}
                                    className="transition-all duration-300"
                                />

                                {/* Label */}
                                <text
                                    y={node.radius + 16}
                                    textAnchor="middle"
                                    fill={highlighted ? ANIMATION_COLORS.textPrimary : ANIMATION_COLORS.textSecondary}
                                    className={cn(
                                        "text-xs font-medium transition-colors duration-300",
                                        highlighted ? "opacity-100" : "opacity-0"
                                    )}
                                    style={{ pointerEvents: 'none', filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.8))' }}
                                >
                                    {node.name}
                                </text>
                            </motion.g>
                        );
                    })}
                </g>
            </svg>
        </div>
    );
});

SymptomNetworkGraph.displayName = 'SymptomNetworkGraph';
