/* ───────────────────────────────────────────
   Domain types – Pedra en Sec
   ─────────────────────────────────────────── */

/** A single geographic coordinate */
export interface LatLng {
  lat: number;
  lng: number;
}

/** A circular trigger zone */
interface TriggerAreaCircle {
  type: 'circle';
  center: LatLng;
  radiusMeters: number;
}

/** A polygon trigger zone */
interface TriggerAreaPolygon {
  type: 'polygon';
  coordinates: LatLng[];
}

/** Trigger zone that activates TTS narration */
export type TriggerArea = TriggerAreaCircle | TriggerAreaPolygon;

/** A point of interest along a route */
export interface PointOfInterest {
  id: string;
  name: string;
  /** Zone that triggers TTS narration when the user enters it */
  triggerArea: TriggerArea;
  /** Short narration text read aloud by Web Speech API */
  narration: string;
  /** Optional thumbnail */
  image?: string;
}

/** A hiking / cultural route */
export interface Route {
  id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  difficulty: 'fácil' | 'moderada' | 'difícil';
  distanceKm: number;
  durationHours: number;
  /** Ordered coordinates that draw the polyline */
  path: LatLng[];
  /** Points of interest along the route */
  pois: PointOfInterest[];
  /** Photo URLs (can be local public or remote) */
  photos: string[];
  /** Optional video URL */
  video?: string;
  /** Colour used when the route is "lit up" */
  color: string;
}

/** Views the SPA can render (no router) */
export type ViewName = 'home' | 'routeDetail';
