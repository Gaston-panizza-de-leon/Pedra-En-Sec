import { useEffect, useState } from 'react';
import { buildTrailGraph } from '../scripts/graphUtils';
import { calculateOptimalHikingRoute } from '../scripts/routing';
import type { TrailGraph } from '../types/routing';

export const useHikingRouter = (geoJsonData: any) => {
  const [graph, setGraph] = useState<TrailGraph | null>(null);

  useEffect(() => {
    if (geoJsonData) {
      const g = buildTrailGraph(geoJsonData);
      setGraph(g);
    }
  }, [geoJsonData]);

  const getRoute = (pois: [number, number][]) => {
    if (!graph) return null;
    return calculateOptimalHikingRoute(graph, pois);
  };

  return { getRoute };
};