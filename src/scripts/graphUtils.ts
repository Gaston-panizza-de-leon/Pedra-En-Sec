import * as turf from '@turf/turf';
import { FeatureCollection, LineString } from 'geojson';

export const buildTrailGraph = (geoJson: FeatureCollection<LineString>): TrailGraph => {
  const adjList = new Map<string, Map<string, number>>();

  geoJson.features.forEach((feature) => {
    const coords = feature.geometry.coordinates;

    for (let i = 0; i < coords.length - 1; i++) {
      const u = coords[i].join(',');
      const v = coords[i + 1].join(',');
      const dist = turf.distance(coords[i], coords[i + 1]);

      // Add bidirectional edges
      if (!adjList.has(u)) adjList.set(u, new Map());
      if (!adjList.has(v)) adjList.set(v, new Map());

      adjList.get(u)!.set(v, dist);
      adjList.get(v)!.set(u, dist);
    }
  });

  return { adjList };
};