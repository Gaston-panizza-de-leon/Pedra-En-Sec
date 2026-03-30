import { Feature, LineString, Point } from 'geojson';

export interface TrailNode {
  id: string; // "lng,lat" string
  coordinates: [number, number];
}

export interface TrailGraph {
  // We use a Map for O(1) access to nodes and their neighbors
  adjList: Map<string, Map<string, number>>; 
}

export interface RouteResult {
  orderedPoints: [number, number][]; // Full path for Leaflet Polyline
  totalDistance: number;
  segments: [number, number][][]; // Individual paths between POIs
}