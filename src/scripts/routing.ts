import createGraph from 'ngraph.graph';
import { aStar } from 'ngraph.path';

export const calculateOptimalHikingRoute = (
  graphData: TrailGraph,
  selectedPOIs: [number, number][] // The points the user wants to visit
): RouteResult => {
  // 1. Initialize ngraph
  const ngraph = createGraph();
  graphData.adjList.forEach((neighbors, u) => {
    neighbors.forEach((dist, v) => {
      ngraph.addLink(u, v, { weight: dist });
    });
  });

  const pathFinder = aStar(ngraph, {
    distance(fromNode, toNode, link) { return link.data.weight; },
    heuristic(fromNode, toNode) {
      // Euclidean distance as heuristic for A*
      const from = fromNode.id.toString().split(',').map(Number);
      const to = toNode.id.toString().split(',').map(Number);
      return turf.distance(from, to);
    }
  });

  // 2. Simple Greedy TSP
  let currentPoint = selectedPOIs[0];
  let remaining = [...selectedPOIs.slice(1)];
  const finalPath: [number, number][] = [];
  let totalDist = 0;

  while (remaining.length > 0) {
    let bestNextIdx = 0;
    let shortestSegment: any[] = [];
    let minSegmentDist = Infinity;

    remaining.forEach((poi, index) => {
      const path = pathFinder.find(currentPoint.join(','), poi.join(','));
      if (path && path.length > 0) {
        // Calculate segment distance
        const d = calculatePathDistance(path); 
        if (d < minSegmentDist) {
          minSegmentDist = d;
          bestNextIdx = index;
          shortestSegment = path;
        }
      }
    });

    // Add shortestSegment to finalPath and update totalDist
    // ... logic to stitch coordinates ...
    currentPoint = remaining.splice(bestNextIdx, 1)[0];
  }

  return { orderedPoints: finalPath, totalDistance: totalDist, segments: [] };
};