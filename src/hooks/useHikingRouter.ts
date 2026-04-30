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