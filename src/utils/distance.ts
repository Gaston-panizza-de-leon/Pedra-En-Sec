import type { LatLng } from '../types';

/** Calculate distance between two geographic points using Haversine formula
 * @param point1 First coordinate
 * @param point2 Second coordinate
 * @returns Distance in kilometers
 */
export function haversineDistance(point1: LatLng, point2: LatLng): number {
  const R = 6371; // Earth radius in kilometers

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) *
      Math.cos(toRad(point2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.asin(Math.sqrt(a));
  return R * c;
}

/** Find minimum distance from a point to any point in a polyline
 * @param point The point to check
 * @param polyline Array of coordinates
 * @returns Minimum distance in kilometers
 */
export function distanceToPolyline(point: LatLng, polyline: LatLng[]): number {
  if (polyline.length === 0) return Infinity;
  if (polyline.length === 1) return haversineDistance(point, polyline[0]);

  let minDistance = Infinity;

  // Check distance to each segment
  for (let i = 0; i < polyline.length - 1; i++) {
    const p1 = polyline[i];
    const p2 = polyline[i + 1];

    // Distance to segment (using perpendicular distance approximation)
    const d = distanceToSegment(point, p1, p2);
    minDistance = Math.min(minDistance, d);
  }

  return minDistance;
}

/** Calculate perpendicular distance from point to line segment
 * Using simplified 2D formula (accurate enough for small distances)
 */
function distanceToSegment(point: LatLng, p1: LatLng, p2: LatLng): number {
  const x = point.lng;
  const y = point.lat;
  const x1 = p1.lng;
  const y1 = p1.lat;
  const x2 = p2.lng;
  const y2 = p2.lat;

  // Vector from p1 to p2
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) return haversineDistance(point, p1);

  // Parameter t indicates where the perpendicular from point hits the line
  let t = ((x - x1) * dx + (y - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t)); // Clamp to segment

  // Closest point on segment
  const closestX = x1 + t * dx;
  const closestY = y1 + t * dy;

  return haversineDistance(point, { lat: closestY, lng: closestX });
}
