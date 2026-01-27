// lib/graph/trust-network.ts - Social graph analyzer for trust networks

export interface NetworkNode {
    id: string;
    email: string;
    name: string;
    trustScore: number;
    loansGiven: number;
    loansTaken: number;
    totalVolume: number;
}

export interface NetworkEdge {
    source: string;
    target: string;
    loanCount: number;
    totalAmount: number;
    status: "completed" | "active" | "disputed";
    successRate: number;
}

export interface TrustNetwork {
    nodes: NetworkNode[];
    edges: NetworkEdge[];
    metrics: NetworkMetrics;
}

export interface NetworkMetrics {
    totalNodes: number;
    totalEdges: number;
    averageDegree: number;
    clusteringCoefficient: number;
    trustHubs: string[];
}

export interface PathResult {
    path: string[];
    distance: number;
    trustScore: number;
}

// Adjacency list representation
type AdjacencyList = Map<string, Set<string>>;

// Build adjacency list from edges
function buildAdjacencyList(edges: NetworkEdge[]): AdjacencyList {
    const adj: AdjacencyList = new Map();

    for (const edge of edges) {
        if (!adj.has(edge.source)) adj.set(edge.source, new Set());
        if (!adj.has(edge.target)) adj.set(edge.target, new Set());

        adj.get(edge.source)!.add(edge.target);
        adj.get(edge.target)!.add(edge.source);
    }

    return adj;
}

// Calculate degree centrality for each node
export function calculateCentrality(network: TrustNetwork): Map<string, number> {
    const adj = buildAdjacencyList(network.edges);
    const centrality = new Map<string, number>();
    const n = network.nodes.length;

    for (const node of network.nodes) {
        const degree = adj.get(node.id)?.size || 0;
        // Normalize by max possible connections
        centrality.set(node.id, n > 1 ? degree / (n - 1) : 0);
    }

    return centrality;
}

// Calculate local clustering coefficient
function localClusteringCoefficient(nodeId: string, adj: AdjacencyList): number {
    const neighbors = adj.get(nodeId);
    if (!neighbors || neighbors.size < 2) return 0;

    const neighborArray = Array.from(neighbors);
    let triangles = 0;

    for (let i = 0; i < neighborArray.length; i++) {
        for (let j = i + 1; j < neighborArray.length; j++) {
            const iNeighbors = adj.get(neighborArray[i]);
            if (iNeighbors?.has(neighborArray[j])) {
                triangles++;
            }
        }
    }

    const possibleTriangles = (neighbors.size * (neighbors.size - 1)) / 2;
    return possibleTriangles > 0 ? triangles / possibleTriangles : 0;
}

// Calculate network clustering coefficient
export function calculateClusteringCoefficient(network: TrustNetwork): number {
    const adj = buildAdjacencyList(network.edges);
    let totalCoeff = 0;

    for (const node of network.nodes) {
        totalCoeff += localClusteringCoefficient(node.id, adj);
    }

    return network.nodes.length > 0 ? totalCoeff / network.nodes.length : 0;
}

// BFS to find shortest path between two users
export function findPath(
    network: TrustNetwork,
    sourceId: string,
    targetId: string
): PathResult | null {
    if (sourceId === targetId) {
        return { path: [sourceId], distance: 0, trustScore: 100 };
    }

    const adj = buildAdjacencyList(network.edges);
    const visited = new Set<string>();
    const parent = new Map<string, string>();
    const queue: string[] = [sourceId];

    visited.add(sourceId);

    while (queue.length > 0) {
        const current = queue.shift()!;

        const neighbors = adj.get(current);
        if (!neighbors) continue;

        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                parent.set(neighbor, current);
                queue.push(neighbor);

                if (neighbor === targetId) {
                    // Reconstruct path
                    const path: string[] = [targetId];
                    let node = targetId;

                    while (parent.has(node)) {
                        node = parent.get(node)!;
                        path.unshift(node);
                    }

                    // Calculate trust score for path
                    const trustScore = calculatePathTrust(network, path);

                    return {
                        path,
                        distance: path.length - 1,
                        trustScore
                    };
                }
            }
        }
    }

    return null; // No path found
}

// Calculate trust score along a path
function calculatePathTrust(network: TrustNetwork, path: string[]): number {
    if (path.length <= 1) return 100;

    const nodeMap = new Map(network.nodes.map(n => [n.id, n]));
    let trustProduct = 1;

    for (const nodeId of path) {
        const node = nodeMap.get(nodeId);
        if (node) {
            // Normalize trust score to 0-1 range
            const normalizedTrust = node.trustScore / 150;
            trustProduct *= normalizedTrust;
        }
    }

    // Decay factor for longer paths
    const pathDecay = Math.pow(0.8, path.length - 1);

    return Math.round(trustProduct * pathDecay * 100);
}

// Find all mutual connections between two users
export function findMutualConnections(
    network: TrustNetwork,
    userId1: string,
    userId2: string
): string[] {
    const adj = buildAdjacencyList(network.edges);
    const connections1 = adj.get(userId1) || new Set();
    const connections2 = adj.get(userId2) || new Set();

    return Array.from(connections1).filter(id => connections2.has(id));
}

// Identify trust hubs (users with many successful relationships)
export function identifyTrustHubs(network: TrustNetwork, topN: number = 5): NetworkNode[] {
    const adj = buildAdjacencyList(network.edges);

    // Score each node based on connections and success rate
    const scores = network.nodes.map(node => {
        const degree = adj.get(node.id)?.size || 0;
        const relevantEdges = network.edges.filter(
            e => e.source === node.id || e.target === node.id
        );
        const avgSuccessRate = relevantEdges.length > 0
            ? relevantEdges.reduce((sum, e) => sum + e.successRate, 0) / relevantEdges.length
            : 0;

        // Combined score: connections × success rate × trust score
        const score = degree * avgSuccessRate * (node.trustScore / 100);

        return { node, score };
    });

    // Sort by score and return top N
    return scores
        .sort((a, b) => b.score - a.score)
        .slice(0, topN)
        .map(s => s.node);
}

// Calculate trust distance (degrees of separation weighted by trust)
export function calculateTrustDistance(
    network: TrustNetwork,
    sourceId: string,
    targetId: string
): number {
    const pathResult = findPath(network, sourceId, targetId);

    if (!pathResult) return Infinity;

    // Weight distance by inverse of path trust score
    const trustWeight = pathResult.trustScore > 0 ? 100 / pathResult.trustScore : 10;

    return pathResult.distance * trustWeight;
}

// Build full network metrics
export function calculateNetworkMetrics(network: TrustNetwork): NetworkMetrics {
    const adj = buildAdjacencyList(network.edges);

    // Calculate average degree
    let totalDegree = 0;
    for (const neighbors of adj.values()) {
        totalDegree += neighbors.size;
    }
    const averageDegree = network.nodes.length > 0 ? totalDegree / network.nodes.length : 0;

    // Calculate clustering coefficient
    const clusteringCoefficient = calculateClusteringCoefficient(network);

    // Identify trust hubs
    const hubs = identifyTrustHubs(network, 5);

    return {
        totalNodes: network.nodes.length,
        totalEdges: network.edges.length,
        averageDegree,
        clusteringCoefficient,
        trustHubs: hubs.map(h => h.id)
    };
}

// Transform raw loan data into network format
export function buildNetworkFromLoans(
    users: Array<{ id: string; email: string; firstName?: string | null; lastName?: string | null; trustScore: number }>,
    loans: Array<{ lenderId: string; borrowerId: string; amount: number; status: string }>
): TrustNetwork {
    // Build nodes
    const nodeMap = new Map<string, NetworkNode>();

    for (const user of users) {
        const name = user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.email;

        const givenLoans = loans.filter(l => l.lenderId === user.id);
        const takenLoans = loans.filter(l => l.borrowerId === user.id);

        nodeMap.set(user.id, {
            id: user.id,
            email: user.email,
            name,
            trustScore: user.trustScore,
            loansGiven: givenLoans.length,
            loansTaken: takenLoans.length,
            totalVolume: [...givenLoans, ...takenLoans].reduce((sum, l) => sum + l.amount, 0)
        });
    }

    // Build edges (aggregate loans between same pairs)
    const edgeMap = new Map<string, NetworkEdge>();

    for (const loan of loans) {
        const key = [loan.lenderId, loan.borrowerId].sort().join("-");

        if (edgeMap.has(key)) {
            const edge = edgeMap.get(key)!;
            edge.loanCount++;
            edge.totalAmount += loan.amount;
            if (loan.status === "DISPUTED") edge.status = "disputed";
            else if (loan.status !== "COMPLETED" && edge.status !== "disputed") edge.status = "active";
        } else {
            edgeMap.set(key, {
                source: loan.lenderId,
                target: loan.borrowerId,
                loanCount: 1,
                totalAmount: loan.amount,
                status: loan.status === "COMPLETED" ? "completed" :
                    loan.status === "DISPUTED" ? "disputed" : "active",
                successRate: loan.status === "COMPLETED" ? 1 : 0
            });
        }
    }

    // Calculate success rates
    for (const edge of edgeMap.values()) {
        const relevantLoans = loans.filter(
            l => (l.lenderId === edge.source && l.borrowerId === edge.target) ||
                (l.lenderId === edge.target && l.borrowerId === edge.source)
        );
        const completed = relevantLoans.filter(l => l.status === "COMPLETED").length;
        edge.successRate = relevantLoans.length > 0 ? completed / relevantLoans.length : 0;
    }

    const nodes = Array.from(nodeMap.values());
    const edges = Array.from(edgeMap.values());

    return {
        nodes,
        edges,
        metrics: calculateNetworkMetrics({ nodes, edges, metrics: {} as NetworkMetrics })
    };
}
