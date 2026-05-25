import createGraph from 'ngraph.graph';
import { aStar } from 'ngraph.path';
import * as turf from '@turf/turf';
import type { Feature, Point } from 'geojson';
import type { LatLng } from '../types';

/* Redondea a ~5 decimales (~1.1 m) para fusionar nodos casi coincidentes
   de distintos "ways" de OSM y así conectar segmentos contiguos. */
const SNAP_DECIMALS = 5;
const snap = (n: number) => Number(n.toFixed(SNAP_DECIMALS));
const nodeId = (p: LatLng) => `${snap(p.lat)},${snap(p.lng)}`;
const coordsOf = (id: string | number): [number, number] => {
  const [lat, lng] = String(id).split(',').map(Number);
  return [lat, lng];
};

interface TrailPointProps {
  id: string;
}

export function solveHikingTSP(
  segments: LatLng[][],
  startPoi: LatLng,
  otherPois: LatLng[],
): [number, number][] {
  const graph = createGraph();
  const allTrailPoints: Feature<Point, TrailPointProps>[] = [];
  const processedPoints = new Set<string>();

  // 1. Construcción del grafo (con snapping de nodos).
  segments.forEach((segment) => {
    for (let i = 0; i < segment.length - 1; i++) {
      const u = segment[i];
      const v = segment[i + 1];
      const uId = nodeId(u);
      const vId = nodeId(v);
      if (uId === vId) continue;

      if (!processedPoints.has(uId)) {
        allTrailPoints.push(turf.point([snap(u.lng), snap(u.lat)], { id: uId }));
        processedPoints.add(uId);
      }
      if (!processedPoints.has(vId)) {
        allTrailPoints.push(turf.point([snap(v.lng), snap(v.lat)], { id: vId }));
        processedPoints.add(vId);
      }

      const dist = turf.distance([u.lng, u.lat], [v.lng, v.lat]);
      graph.addLink(uId, vId, { weight: dist });
      graph.addLink(vId, uId, { weight: dist });
    }
  });

  if (allTrailPoints.length === 0) return [];

  const trailFeatureCollection = turf.featureCollection(allTrailPoints);

  // Encuentra el ID del nodo de la traza más cercano a un POI.
  const snapToTrail = (poi: LatLng): string => {
    const pt = turf.point([poi.lng, poi.lat]);
    const nearest = turf.nearestPoint(pt, trailFeatureCollection);
    return (nearest.properties as TrailPointProps).id;
  };

  // A* con heurística (distancia en línea recta entre nodos) -> A* real, no Dijkstra.
  const pathFinder = aStar(graph, {
    distance(_from, _to, link) {
      return (link.data as { weight: number }).weight;
    },
    heuristic(from, to) {
      const a = coordsOf(from.id);
      const b = coordsOf(to.id);
      return turf.distance([a[1], a[0]], [b[1], b[0]]);
    },
  });

  // 2. Greedy nearest-neighbor sobre los POIs seleccionados.
  let currentId = snapToTrail(startPoi);
  const remainingPois = [...otherPois];
  let fullPath: [number, number][] = [];

  while (remainingPois.length > 0) {
    let closestIdx = -1;
    let bestPathNodes: { id: string | number }[] = [];
    let minNodesCount = Infinity;

    remainingPois.forEach((poi, idx) => {
      const targetId = snapToTrail(poi);
      const foundPath = pathFinder.find(currentId, targetId);
      if (foundPath && foundPath.length > 0 && foundPath.length < minNodesCount) {
        minNodesCount = foundPath.length;
        closestIdx = idx;
        bestPathNodes = foundPath;
      }
    });

    if (closestIdx === -1) {
      console.warn('No hay camino entre puntos (segmentos desconectados).');
      break;
    }

    // ngraph devuelve el camino de destino -> origen; lo invertimos.
    const coords = bestPathNodes.map((node) => coordsOf(node.id)).reverse();
    fullPath = [...fullPath, ...coords];
    currentId = snapToTrail(remainingPois[closestIdx]);
    remainingPois.splice(closestIdx, 1);
  }

  return fullPath;
}
