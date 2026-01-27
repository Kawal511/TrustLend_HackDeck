// components/trust/TrustNetworkViz.tsx - D3.js network visualization

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
        <div className="space-y-4">
            {/* Controls */}
            <Card>
                <CardContent className="py-4">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex gap-2 flex-1">
                            <Input
                                placeholder="Search user..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                            <Button variant="outline" onClick={handleSearch}>
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                            <span className="text-sm text-gray-500 py-2">{Math.round(zoom * 100)}%</span>
                            <Button variant="outline" size="sm">
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Network Visualization */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Trust Network
                    </CardTitle>
                    <CardDescription>
                        {network.nodes.length} users · {network.edges.length} connections
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative bg-gray-50 rounded-lg overflow-hidden">
                        <svg ref={svgRef} width="100%" height="500" />

                        {/* Legend */}
                        <div className="absolute bottom-4 left-4 bg-white/90 rounded-lg p-3 text-xs space-y-2">
                            <div className="font-medium mb-1">Legend</div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span>Completed loans</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <span>Active loans</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <span>Disputed</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Selected Node Details */}
            {selectedNode && (
                <Card>
                    <CardHeader>
                        <CardTitle>{selectedNode.name}</CardTitle>
                        <CardDescription>{selectedNode.email}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-purple-50 rounded-lg p-3">
                                <div className="text-sm text-gray-500">Trust Score</div>
                                <div className="text-xl font-bold" style={{ color: getTrustColor(selectedNode.trustScore) }}>
                                    {selectedNode.trustScore}
                                </div>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-3">
                                <div className="text-sm text-gray-500">Loans Given</div>
                                <div className="text-xl font-bold">{selectedNode.loansGiven}</div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3">
                                <div className="text-sm text-gray-500">Loans Taken</div>
                                <div className="text-xl font-bold">{selectedNode.loansTaken}</div>
                            </div>
                            <div className="bg-orange-50 rounded-lg p-3">
                                <div className="text-sm text-gray-500">Total Volume</div>
                                <div className="text-xl font-bold">{formatCurrency(selectedNode.totalVolume)}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Network Metrics */}
            <Card>
                <CardHeader>
                    <CardTitle>Network Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <div className="text-sm text-gray-500">Avg Connections</div>
                            <div className="text-lg font-bold">{network.metrics.averageDegree.toFixed(1)}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Clustering</div>
                            <div className="text-lg font-bold">{(network.metrics.clusteringCoefficient * 100).toFixed(1)}%</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Trust Hubs</div>
                            <div className="text-lg font-bold">{network.metrics.trustHubs.length}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Total Volume</div>
                            <div className="text-lg font-bold">
                                {formatCurrency(network.edges.reduce((sum, e) => sum + e.totalAmount, 0))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
