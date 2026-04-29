import type { LatLng, Route, Church, ChurchPOI } from '../types';
import { distanceToPolyline } from '../utils/distance';

/**
 * Filter churches that are within maxDistance km from any point on the route
 * @param route The route with pathSegments
 * @param churches Array of churches to filter
 * @param maxDistanceKm Maximum distance in kilometers (default: 1)
 * @returns Array of churches converted to ChurchPOI format, deduplicated
 */
export function filterChurchesByRoute(
  route: Route,
  churches: Church[],
  maxDistanceKm: number = 1,
): ChurchPOI[] {
  if (!route.pathSegments || route.pathSegments.length === 0) {
    return [];
  }

  const nearbyChurches = new Map<string, ChurchPOI>();

  // Combine all path segments into one polyline for distance calculation
  const fullPolyline = route.pathSegments.flat();

  for (const church of churches) {
    // Get church coordinates
    if (!church.geo?.latitude || church.geo?.longitude === undefined) {
      continue;
    }

    const churchPos: LatLng = {
      lat: church.geo.latitude,
      lng: church.geo.longitude,
    };

    // Calculate distance to route polyline
    const distance = distanceToPolyline(churchPos, fullPolyline);

    if (distance <= maxDistanceKm) {
      // Convert to ChurchPOI format
      const churchPoi: ChurchPOI = {
        id: church.identifier || church.name,
        name: church.name,
        type: 'church',
        church,
        image: church.image?.[0], // Use first image if available
      };

      // Use identifier as key to avoid duplicates
      nearbyChurches.set(church.identifier, churchPoi);
    }
  }

  return Array.from(nearbyChurches.values());
}

/**
 * Group churches by distance from a reference point (for sorting)
 * @param churches Array of ChurchPOI to sort
 * @param referencePoint The point to measure distance from
 * @returns Churches sorted by distance (closest first)
 */
export function sortChurchesByDistance(churches: ChurchPOI[], referencePoint: LatLng): ChurchPOI[] {
  return [...churches].sort((a, b) => {
    if (!a.church.geo || !b.church.geo) return 0;

    const distA: LatLng = { lat: a.church.geo.latitude, lng: a.church.geo.longitude };
    const distB: LatLng = { lat: b.church.geo.latitude, lng: b.church.geo.longitude };

    // Simple Euclidean distance (acceptable for small areas)
    const dA = Math.sqrt(
      Math.pow(distA.lat - referencePoint.lat, 2) + Math.pow(distA.lng - referencePoint.lng, 2),
    );
    const dB = Math.sqrt(
      Math.pow(distB.lat - referencePoint.lat, 2) + Math.pow(distB.lng - referencePoint.lng, 2),
    );

    return dA - dB;
  });
}
