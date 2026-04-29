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

/** A point of interest along a route (supports both regular POIs and churches) */
export interface PointOfInterest {
  id: string;
  name: string;
  /** Zone that triggers TTS narration when the user enters it (optional for churches) */
  triggerArea?: TriggerArea;
  /** Short narration text read aloud by Web Speech API (optional for churches) */
  narration?: string;
  /** Optional thumbnail */
  image?: string;
  /** POI type: 'poi' (default) or 'church' */
  type?: 'poi' | 'church';
  /** Associated church (only for type='church') */
  church?: Church;
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
  /** Ordered coordinates for legacy single-polyline consumers */
  path: LatLng[];
  /** Optional disjoint segments for branched routes (MultiLineString) */
  pathSegments?: LatLng[][];
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

/** PostalAddress from Schema.org */
export interface PostalAddress {
  addressLocality?: string;
  addressRegion?: string;
  streetAddress?: string;
}

/** AggregateRating from Schema.org */
export interface AggregateRating {
  ratingValue?: string;
  reviewCount?: string;
}

/** PropertyValue from Schema.org */
export interface PropertyValue {
  name?: string;
  value?: string;
}

/** Church / TouristAttraction from iglesias.json (Schema.org format) */
export interface Church {
  identifier: string;
  '@id'?: string;
  url?: string;
  name: string;
  alternateName?: string;
  description?: string;
  address?: PostalAddress;
  geo?: {
    latitude: number;
    longitude: number;
  };
  telephone?: string;
  openingHours?: string;
  isAccessibleForFree?: boolean;
  maximumAttendeeCapacity?: number;
  aggregateRating?: AggregateRating;
  image?: string[];
  email?: string;
  additionalProperty?: PropertyValue[];
}

/** Church POI - Church converted to PointOfInterest format for routes */
export interface ChurchPOI extends Omit<PointOfInterest, 'triggerArea' | 'narration'> {
  type: 'church';
  church: Church;
  triggerArea?: never;
  narration?: never;
}
