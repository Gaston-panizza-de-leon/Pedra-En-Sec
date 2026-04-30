import * as turf from '@turf/turf';
import createGraph from 'ngraph.graph';
import { aStar } from 'ngraph.path';
import type { RouteResult, TrailGraph } from '../types/routing';

function calculatePathDistance(path: Array<{ id: string }>): number {
  if (path.length < 2) {
    return 0;
  }

  let distance = 0;
  for (let index = 0; index < path.length - 1; index++) {
    const from = path[index].id.split(',').map(Number) as [number, number];
    const to = path[index + 1].id.split(',').map(Number) as [number, number];
    distance += turf.distance(from, to);
  }

  return distance;
}

export const calculateOptimalHikingRoute = (
  graphData: TrailGraph,
  selectedPOIs: [number, number][]
): RouteResult => {
  if (selectedPOIs.length === 0) {
    return { orderedPoints: [], totalDistance: 0, segments: [] };
  }

  const ngraph = createGraph();
  graphData.adjList.forEach((neighbors, u) => {
    neighbors.forEach((dist, v) => {
      ngraph.addLink(u, v, { weight: dist });
    });
  });

  const pathFinder = aStar(ngraph, {
    distance(_fromNode, _toNode, link) {
      return link.data.weight;
    },
    heuristic(fromNode, toNode) {
      const from = fromNode.id.toString().split(',').map(Number) as [number, number];
      const to = toNode.id.toString().split(',').map(Number) as [number, number];
      return turf.distance(from, to);
    },
  });

  let currentPoint = selectedPOIs[0];
  let remaining = [...selectedPOIs.slice(1)];
  const finalPath: [number, number][] = [];
  const segments: [number, number][][] = [];
  let totalDist = 0;

  while (remaining.length > 0) {
    let bestNextIdx = 0;
    let shortestSegment: Array<{ id: string }> = [];
    let minSegmentDist = Infinity;

    remaining.forEach((poi, index) => {
      const path = pathFinder.find(currentPoint.join(','), poi.join(',')) as Array<{ id: string }> | null;
      if (path && path.length > 0) {
        const d = calculatePathDistance(path);
        if (d < minSegmentDist) {
          minSegmentDist = d;
          bestNextIdx = index;
          shortestSegment = path;
        }
      }
    });

    const segmentCoordinates = shortestSegment
      .map((node) => node.id.split(',').map(Number) as [number, number])
      .reverse();

    if (segmentCoordinates.length > 0) {
      if (finalPath.length > 0) {
        finalPath.push(...segmentCoordinates.slice(1));
      } else {
        finalPath.push(...segmentCoordinates);
      }
      segments.push(segmentCoordinates);
      totalDist += minSegmentDist;
    }

    currentPoint = remaining.splice(bestNextIdx, 1)[0];
  }

  return { orderedPoints: finalPath, totalDistance: totalDist, segments };
};