import createGraph from 'ngraph.graph';
import { aStar } from 'ngraph.path';
import { point, distance as turfDistance, featureCollection, nearestPoint } from '@turf/turf';
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
        allTrailPoints.push(point([snap(u.lng), snap(u.lat)], { id: uId }));
        processedPoints.add(uId);
      }
      if (!processedPoints.has(vId)) {
        allTrailPoints.push(point([snap(v.lng), snap(v.lat)], { id: vId }));
        processedPoints.add(vId);
      }

      const dist = turfDistance([u.lng, u.lat], [v.lng, v.lat]);
      graph.addLink(uId, vId, { weight: dist });
      graph.addLink(vId, uId, { weight: dist });
    }
  });

  if (allTrailPoints.length === 0) return [];

  // 1b. Puentear las componentes desconectadas del trazado (algunos GeoJSON de
  //     OSM vienen partidos en tramos con huecos, p. ej. el Camí de Cavalls).
  //     Unimos cada componente menor a la principal por su par de nodos más
  //     cercano, para que el A* pueda recorrer toda la ruta.
  const coordCache = new Map<string | number, [number, number]>();
  graph.forEachNode((node) => {
    coordCache.set(node.id, coordsOf(node.id));
  });

  const visited = new Set<string | number>();
  const components: (string | number)[][] = [];
  graph.forEachNode((node) => {
    if (visited.has(node.id)) return;
    const comp: (string | number)[] = [];
    const stack: (string | number)[] = [node.id];
    while (stack.length) {
      const id = stack.pop() as string | number;
      if (visited.has(id)) continue;
      visited.add(id);
      comp.push(id);
      graph.forEachLinkedNode(
        id,
        (other) => {
          if (!visited.has(other.id)) stack.push(other.id);
        },
        false,
      );
    }
    components.push(comp);
  });

  if (components.length > 1) {
    components.sort((a, b) => b.length - a.length);
    const connIds: (string | number)[] = [...components[0]];
    const connLat: number[] = [];
    const connLng: number[] = [];
    for (const id of connIds) {
      const c = coordCache.get(id)!;
      connLat.push(c[0]);
      connLng.push(c[1]);
    }
    for (let k = 1; k < components.length; k++) {
      const comp = components[k];
      let best = Infinity;
      let bu: string | number | null = null;
      let bv: string | number | null = null;
      for (const cid of comp) {
        const c = coordCache.get(cid)!;
        const cLat = c[0];
        const cLng = c[1];
        for (let j = 0; j < connLat.length; j++) {
          const dLat = cLat - connLat[j];
          const dLng = cLng - connLng[j];
          const d2 = dLat * dLat + dLng * dLng;
          if (d2 < best) {
            best = d2;
            bu = cid;
            bv = connIds[j];
          }
        }
      }
      if (bu !== null && bv !== null) {
        const a = coordCache.get(bu)!;
        const b = coordCache.get(bv)!;
        const w = turfDistance([a[1], a[0]], [b[1], b[0]]);
        graph.addLink(bu, bv, { weight: w });
        graph.addLink(bv, bu, { weight: w });
        for (const cid of comp) {
          const cc = coordCache.get(cid)!;
          connIds.push(cid);
          connLat.push(cc[0]);
          connLng.push(cc[1]);
        }
      }
    }
  }

  const trailFeatureCollection = featureCollection(allTrailPoints);

  // Encuentra el ID del nodo de la traza más cercano a un POI.
  const snapToTrail = (poi: LatLng): string => {
    const pt = point([poi.lng, poi.lat]);
    const nearest = nearestPoint(pt, trailFeatureCollection);
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
      return turfDistance([a[1], a[0]], [b[1], b[0]]);
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
