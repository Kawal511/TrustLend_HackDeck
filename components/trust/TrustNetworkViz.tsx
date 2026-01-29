// components/trust/TrustNetworkViz.tsx - D3.js network visualization
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { TrustNetwork, NetworkNode, NetworkEdge, PathResult } from "@/lib/graph/trust-network";
import { Search, ZoomIn, ZoomOut, RefreshCw, Users } from "lucide-react";

interface TrustNetworkVizProps {
    network: TrustNetwork;
    currentUserId: string;
    onNodeClick?: (node: NetworkNode) => void;
}

interface D3Node extends d3.SimulationNodeDatum, NetworkNode { }
interface D3Edge extends d3.SimulationLinkDatum<D3Node> {
    loanCount: number;
    totalAmount: number;
    status: "completed" | "active" | "disputed";
    successRate: number;
}

export function TrustNetworkViz({ network, currentUserId, onNodeClick }: TrustNetworkVizProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [highlightedPath, setHighlightedPath] = useState<string[]>([]);
    const [zoom, setZoom] = useState(1);

    const statusColors = {
        completed: "#22c55e", // green
        active: "#eab308",   // yellow
        disputed: "#ef4444"  // red
    };

    const getTrustColor = (score: number): string => {
        if (score >= 140) return "#a855f7"; // purple - diamond
        if (score >= 110) return "#3b82f6"; // blue - platinum
        if (score >= 80) return "#f59e0b";  // amber - gold
        if (score >= 50) return "#6b7280";  // gray - silver
        return "#78716c"; // stone - bronze
    };

    useEffect(() => {
        if (!svgRef.current || network.nodes.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const width = svgRef.current.clientWidth;
        const height = 500;

        // Create container with zoom support
        const container = svg.append("g");

        // Add zoom behavior
        const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.3, 3])
            .on("zoom", (event) => {
                container.attr("transform", event.transform);
                setZoom(event.transform.k);
            });

        svg.call(zoomBehavior);

        // Prepare data for D3
        const nodes: D3Node[] = network.nodes.map(n => ({ ...n }));
        const edges: D3Edge[] = network.edges.map(e => ({
            source: e.source,
            target: e.target,
            loanCount: e.loanCount,
            totalAmount: e.totalAmount,
            status: e.status,
            successRate: e.successRate
        }));

        // Create force simulation
        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(edges)
                .id((d: any) => d.id)
                .distance(100))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide().radius(40));

        // Draw edges
        const link = container.append("g")
            .selectAll("line")
            .data(edges)
            .join("line")
            .attr("stroke", d => statusColors[d.status])
            .attr("stroke-width", d => Math.min(1 + d.loanCount * 2, 8))
            .attr("stroke-opacity", 0.6);

        // Draw nodes
        const node = container.append("g")
            .selectAll("g")
            .data(nodes)
            .join("g")
            .attr("cursor", "pointer")
            .call(d3.drag<SVGGElement, D3Node>()
                .on("start", (event, d) => {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on("drag", (event, d) => {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on("end", (event, d) => {
                    if (!event.active) simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                }) as any);

        // Node circles
        node.append("circle")
            .attr("r", d => 15 + (d.trustScore / 15))
            .attr("fill", d => getTrustColor(d.trustScore))
            .attr("stroke", d => d.id === currentUserId ? "#000" : "#fff")
            .attr("stroke-width", d => d.id === currentUserId ? 3 : 2)
            .on("click", (event, d) => {
                setSelectedNode(d);
                onNodeClick?.(d);
            });

        // Node labels
        node.append("text")
            .text(d => d.name.split(" ")[0] || d.email.split("@")[0])
            .attr("text-anchor", "middle")
            .attr("dy", d => 25 + (d.trustScore / 15))
            .attr("font-size", "10px")
            .attr("fill", "#374151");

        // Trust score labels
        node.append("text")
            .text(d => d.trustScore)
            .attr("text-anchor", "middle")
            .attr("dy", 4)
            .attr("font-size", "10px")
            .attr("font-weight", "bold")
            .attr("fill", "#fff");

        // Update positions on simulation tick
        simulation.on("tick", () => {
            link
                .attr("x1", (d: any) => d.source.x)
                .attr("y1", (d: any) => d.source.y)
                .attr("x2", (d: any) => d.target.x)
                .attr("y2", (d: any) => d.target.y);

            node.attr("transform", d => `translate(${d.x},${d.y})`);
        });

        // Highlight path if exists
        if (highlightedPath.length > 0) {
            link.attr("stroke-opacity", (d: any) => {
                const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
                const targetId = typeof d.target === 'object' ? d.target.id : d.target;
                const inPath = highlightedPath.some((id, i) => {
                    if (i === highlightedPath.length - 1) return false;
                    const nextId = highlightedPath[i + 1];
                    return (sourceId === id && targetId === nextId) ||
                        (targetId === id && sourceId === nextId);
                });
                return inPath ? 1 : 0.2;
            });
        }

        return () => {
            simulation.stop();
        };
    }, [network, currentUserId, highlightedPath, onNodeClick]);

    const handleSearch = () => {
        const found = network.nodes.find(
            n => n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                n.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (found) {
            setSelectedNode(found);
            onNodeClick?.(found);
        }
    };

    return (
        <div className="space-y-6">
            {/* Controls */}
            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl bg-white">
                <CardContent className="py-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex gap-2 flex-1">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search user..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    className="pl-10 h-10 border-2 border-gray-200 focus-visible:border-black focus-visible:ring-0 rounded-xl"
                                />
                            </div>
                            <Button variant="outline" onClick={handleSearch} className="border-2 border-black hover:bg-black hover:text-white transition-colors rounded-xl font-bold">
                                Search
                            </Button>
                        </div>
                        <div className="flex gap-2 items-center bg-gray-50 p-1 rounded-xl border border-gray-200">
                            <Button variant="ghost" size="sm" onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} className="hover:bg-white rounded-lg">
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                            <span className="text-xs font-bold w-12 text-center">{Math.round(zoom * 100)}%</span>
                            <Button variant="ghost" size="sm" onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="hover:bg-white rounded-lg">
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Network Visualization */}
            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl bg-white overflow-hidden">
                <CardHeader className="border-b-2 border-black bg-white pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl font-black">
                        <Users className="h-6 w-6" />
                        Network Graph
                    </CardTitle>
                    <CardDescription className="font-medium">
                        {network.nodes.length} users · {network.edges.length} connections
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative bg-gray-50/50">
                        <svg ref={svgRef} width="100%" height="500" className="opacity-90 hover:opacity-100 transition-opacity" />

                        {/* Legend */}
                        <div className="absolute bottom-4 left-4 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] rounded-xl p-4 text-xs space-y-2">
                            <div className="font-bold mb-2 uppercase tracking-wide text-gray-400">Connection Types</div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500 border border-green-600" />
                                <span className="font-medium">Completed</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-yellow-500 border border-yellow-600" />
                                <span className="font-medium">Active</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500 border border-red-600" />
                                <span className="font-medium">Disputed</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Selected Node Details */}
            {selectedNode && (
                <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl bg-white animate-in slide-in-from-bottom-2">
                    <CardHeader className="border-b border-gray-100 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="font-black text-xl">{selectedNode.name}</CardTitle>
                                <CardDescription>{selectedNode.email}</CardDescription>
                            </div>
                            <Badge className="bg-black text-white hover:bg-black font-mono">
                                ID: {selectedNode.id.slice(0, 6)}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white border-2 border-gray-100 rounded-xl p-4 hover:border-black transition-colors">
                                <div className="text-xs font-bold text-gray-400 uppercase">Trust Score</div>
                                <div className="text-3xl font-black mt-1" style={{ color: getTrustColor(selectedNode.trustScore) }}>
                                    {selectedNode.trustScore}
                                </div>
                            </div>
                            <div className="bg-white border-2 border-gray-100 rounded-xl p-4 hover:border-black transition-colors">
                                <div className="text-xs font-bold text-gray-400 uppercase">Loans Given</div>
                                <div className="text-2xl font-black text-black mt-1">{selectedNode.loansGiven}</div>
                            </div>
                            <div className="bg-white border-2 border-gray-100 rounded-xl p-4 hover:border-black transition-colors">
                                <div className="text-xs font-bold text-gray-400 uppercase">Loans Taken</div>
                                <div className="text-2xl font-black text-black mt-1">{selectedNode.loansTaken}</div>
                            </div>
                            <div className="bg-white border-2 border-gray-100 rounded-xl p-4 hover:border-black transition-colors">
                                <div className="text-xs font-bold text-gray-400 uppercase">Total Volume</div>
                                <div className="text-2xl font-black text-black mt-1 tracking-tight">{formatCurrency(selectedNode.totalVolume)}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Network Metrics */}
            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl bg-black text-white">
                <CardHeader>
                    <CardTitle className="text-xl font-bold">Network Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
                            <div className="text-xs text-gray-400 uppercase font-bold">Avg Connections</div>
                            <div className="text-2xl font-black mt-1">{network.metrics.averageDegree.toFixed(1)}</div>
                        </div>
                        <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
                            <div className="text-xs text-gray-400 uppercase font-bold">Clustering</div>
                            <div className="text-2xl font-black mt-1">{(network.metrics.clusteringCoefficient * 100).toFixed(1)}%</div>
                        </div>
                        <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
                            <div className="text-xs text-gray-400 uppercase font-bold">Trust Hubs</div>
                            <div className="text-2xl font-black mt-1">{network.metrics.trustHubs.length}</div>
                        </div>
                        <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
                            <div className="text-xs text-gray-400 uppercase font-bold">Total Volume</div>
                            <div className="text-2xl font-black mt-1 tracking-tight">
                                {formatCurrency(network.edges.reduce((sum, e) => sum + e.totalAmount, 0))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
