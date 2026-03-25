import type { LatLng, PointOfInterest, Route } from '../types';

type Difficulty = Route['difficulty'];

interface CatalogPoi {
  id: string;
  name: string;
  position?: LatLng;
  triggerRadius?: number;
  triggerArea?: {
    type?: string;
    center?: LatLng;
    radiusMeters?: number;
    coordinates?: LatLng[];
  };
  narration: string;
  image?: string;
}

interface CatalogRoute {
  id: string;
  name: string;
  shortDescription?: string;
  longDescription?: string;
  difficulty?: string;
  distanceKm?: number;
  durationHours?: number;
  path?: LatLng[];
  sourceGeoJson?: string;
  pois?: CatalogPoi[];
  photos?: string[];
  video?: string;
  color?: string;
}

interface GeoJsonFeatureCollection {
  type: string;
  features?: Array<{
    geometry?: {
      type?: string;
      coordinates?: unknown;
    };
  }>;
}

const baseUrl = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;
const DATA_BASE_URL = `${baseUrl}data`;

function resolvePublicUrl(value: string | undefined): string | undefined {
  if (!value) return value;
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
    return value;
  }

  const normalizedPath = value.startsWith('/') ? value.slice(1) : value;
  return `${baseUrl}${normalizedPath}`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`No se pudo cargar ${url} (${response.status})`);
  }
  return (await response.json()) as T;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isLatLng(point: unknown): point is LatLng {
  if (!point || typeof point !== 'object') return false;
  const maybe = point as LatLng;
  return (
    isFiniteNumber(maybe.lat) &&
    isFiniteNumber(maybe.lng) &&
    maybe.lat >= -90 &&
    maybe.lat <= 90 &&
    maybe.lng >= -180 &&
    maybe.lng <= 180
  );
}

function dedupePath(points: LatLng[]): LatLng[] {
  const deduped: LatLng[] = [];
  for (const point of points) {
    const prev = deduped[deduped.length - 1];
    if (!prev || prev.lat !== point.lat || prev.lng !== point.lng) {
      deduped.push(point);
    }
  }
  return deduped;
}

function convertLngLatToLatLng(coord: unknown): LatLng | null {
  if (!Array.isArray(coord) || coord.length < 2) return null;
  const lng = Number(coord[0]);
  const lat = Number(coord[1]);
  if (!isFiniteNumber(lat) || !isFiniteNumber(lng)) return null;
  return { lat, lng };
}

function extractSegmentsFromGeoJson(geojson: GeoJsonFeatureCollection): LatLng[][] {
  if (!geojson || !Array.isArray(geojson.features)) {
    throw new Error('GeoJSON invalido: no contiene features[]');
  }

  const segments: LatLng[][] = [];

  for (const feature of geojson.features) {
    const geometry = feature.geometry;
    if (!geometry?.type || !geometry.coordinates) continue;

    if (geometry.type === 'LineString' && Array.isArray(geometry.coordinates)) {
      const segment = geometry.coordinates.map(convertLngLatToLatLng).filter(isLatLng);
      if (segment.length >= 2) segments.push(dedupePath(segment));
    }

    if (geometry.type === 'MultiLineString' && Array.isArray(geometry.coordinates)) {
      for (const rawSegment of geometry.coordinates) {
        if (!Array.isArray(rawSegment)) continue;
        const segment = rawSegment.map(convertLngLatToLatLng).filter(isLatLng);
        if (segment.length >= 2) segments.push(dedupePath(segment));
      }
    }
  }

  if (segments.length === 0) {
    throw new Error('No se encontraron geometrías LineString/MultiLineString validas');
  }

  return segments;
}

function centroid(points: LatLng[]): LatLng | null {
  if (points.length === 0) return null;
  let latSum = 0;
  let lngSum = 0;
  let count = 0;

  for (const point of points) {
    if (!isLatLng(point)) continue;
    latSum += point.lat;
    lngSum += point.lng;
    count += 1;
  }

  if (count === 0) return null;
  return { lat: latSum / count, lng: lngSum / count };
}

function normalizePoi(poi: CatalogPoi): PointOfInterest {
  const polygonCoordinates =
    poi.triggerArea?.type === 'polygon' && Array.isArray(poi.triggerArea.coordinates)
      ? poi.triggerArea.coordinates.filter(isLatLng)
      : [];

  if (polygonCoordinates.length > 0) {
    return {
      id: poi.id,
      name: poi.name,
      triggerArea: {
        type: 'polygon',
        coordinates: polygonCoordinates,
      },
      narration: poi.narration,
      image: resolvePublicUrl(poi.image),
    };
  }

  const centerFromArea = isLatLng(poi.triggerArea?.center) ? poi.triggerArea.center : null;
  const polygonCentroid = centroid(polygonCoordinates);

  const position = isLatLng(poi.position) ? poi.position : centerFromArea || polygonCentroid;

  if (!position) {
    throw new Error(`POI ${poi.id} sin posicion valida`);
  }

  const triggerRadius = isFiniteNumber(poi.triggerRadius)
    ? poi.triggerRadius
    : isFiniteNumber(poi.triggerArea?.radiusMeters)
      ? poi.triggerArea.radiusMeters
      : 40;

  return {
    id: poi.id,
    name: poi.name,
    triggerArea: {
      type: 'circle',
      center: position,
      radiusMeters: triggerRadius,
    },
    narration: poi.narration,
    image: resolvePublicUrl(poi.image),
  };
}

function normalizeDifficulty(value: string | undefined): Difficulty {
  const normalized = (value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (normalized === 'facil') return 'fácil';
  if (normalized === 'dificil') return 'difícil';
  return 'moderada';
}

async function loadRouteGeometry(route: CatalogRoute): Promise<{ path: LatLng[]; pathSegments: LatLng[][] }> {
  if (Array.isArray(route.path) && route.path.length > 1) {
    const directPath = dedupePath(route.path.filter(isLatLng));
    return { path: directPath, pathSegments: [directPath] };
  }

  if (!route.sourceGeoJson) {
    throw new Error(`Ruta ${route.id}: falta sourceGeoJson`);
  }

  const geojson = await fetchJson<GeoJsonFeatureCollection>(
    `${DATA_BASE_URL}/${route.sourceGeoJson}`,
  );
  const segments = extractSegmentsFromGeoJson(geojson);

  return {
    path: segments.flat(),
    pathSegments: segments,
  };
}

export async function loadRoutesFromGeoJson(): Promise<Route[]> {
  const catalog = await fetchJson<CatalogRoute[]>(`${DATA_BASE_URL}/routes.json`);

  const routes = await Promise.all(
    catalog.map(async (routeConfig) => {
      const geometry = await loadRouteGeometry(routeConfig);
      const pois = Array.isArray(routeConfig.pois) ? routeConfig.pois.map(normalizePoi) : [];

      if (geometry.path.length < 2) {
        throw new Error(`Ruta ${routeConfig.id}: path invalido`);
      }

      return {
        id: routeConfig.id,
        name: routeConfig.name,
        shortDescription: routeConfig.shortDescription || '',
        longDescription: routeConfig.longDescription || '',
        difficulty: normalizeDifficulty(routeConfig.difficulty),
        distanceKm: isFiniteNumber(routeConfig.distanceKm) ? routeConfig.distanceKm : 0,
        durationHours: isFiniteNumber(routeConfig.durationHours) ? routeConfig.durationHours : 0,
        path: geometry.path,
        pathSegments: geometry.pathSegments,
        pois,
        photos: Array.isArray(routeConfig.photos)
          ? routeConfig.photos.map((photo) => resolvePublicUrl(photo) || photo)
          : [],
        video: routeConfig.video || '',
        color: routeConfig.color || '#4a7c59',
      } satisfies Route;
    }),
  );

  return routes;
}
