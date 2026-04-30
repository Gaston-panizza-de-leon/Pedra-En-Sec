import createGraph from 'ngraph.graph';
import { aStar } from 'ngraph.path';
import * as turf from '@turf/turf';
import type { Feature, Point } from 'geojson';
import type { LatLng } from '../types';

export function solveHikingTSP(segments: LatLng[][], startPoi: LatLng, otherPois: LatLng[]) {
  const graph = createGraph();
  
  // 1. We'll store all unique trail points to find the "nearest" later
  const allTrailPoints: Feature<Point>[] = [];
  const processedPoints = new Set<string>();

  // 2. Build the Graph
  segments.forEach(segment => {
    for (let i = 0; i < segment.length - 1; i++) {
      const uCoords = [segment[i].lng, segment[i].lat];
      const vCoords = [segment[i+1].lng, segment[i+1].lat];
      
      const uId = `${segment[i].lat},${segment[i].lng}`;
      const vId = `${segment[i+1].lat},${segment[i+1].lng}`;

      // Add to our "searchable" list for snapping
      if (!processedPoints.has(uId)) {
        allTrailPoints.push(turf.point(uCoords, { id: uId }));
        processedPoints.add(uId);
      }

      const dist = turf.distance(uCoords, vCoords);
      graph.addLink(uId, vId, { weight: dist });
      graph.addLink(vId, uId, { weight: dist });
    }
  });

  const trailFeatureCollection = turf.featureCollection(allTrailPoints);

  // HELPER: Function to find the ID of the closest point on the trail
  const snapToTrail = (poi: LatLng): string => {
    const pt = turf.point([poi.lng, poi.lat]);
    const nearest = turf.nearestPoint(pt, trailFeatureCollection);
    return nearest.properties.id;
  };

  const pathFinder = aStar(graph, {
    distance(_from, _to, link) { return link.data.weight; }
  });

  // 3. Snap our input points to the nearest GRAPH nodes
  let currentId = snapToTrail(startPoi);
  let remainingPois = [...otherPois];
  let fullPath: [number, number][] = [];

  while (remainingPois.length > 0) {
    let closestIdx = -1;
    let bestPathNodes: any[] = [];
    let minNodesCount = Infinity;

    remainingPois.forEach((poi, idx) => {
      const targetId = snapToTrail(poi);
      const foundPath = pathFinder.find(currentId, targetId);
      
      if (foundPath && foundPath.length > 0) {
        if (foundPath.length < minNodesCount) { 
            minNodesCount = foundPath.length; 
            closestIdx = idx; 
            bestPathNodes = foundPath;
        }
      }
    });

    if (closestIdx !== -1) {
      // ngraph returns path from target to start, so we reverse it
      const coords = bestPathNodes
        .map(node => node.id.split(',').map(Number) as [number, number])
        .reverse();
      
      fullPath = [...fullPath, ...coords];
      currentId = snapToTrail(remainingPois[closestIdx]);
      remainingPois.splice(closestIdx, 1);
    } else {
      console.warn("No path found between points. They might be on disconnected trail segments.");
      break; 
    }
  }

  return fullPath;
}