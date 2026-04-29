import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useTTS } from './useTTS';
import { useGeolocation } from './useGeolocation';
import type { PointOfInterest, LatLng } from '../types';

/**
 * Haversine distance between two LatLng points (returns meters).
 */
function haversineDistance(a: LatLng, b: LatLng): number {
  const R = 6_371_000; // Earth radius in metres
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/**
 * Point-in-polygon test using ray casting algorithm.
 */
function isPointInPolygon(point: LatLng, polygon: LatLng[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat, yi = polygon[i].lng;
    const xj = polygon[j].lat, yj = polygon[j].lng;

    const intersect =
      yi > point.lng !== yj > point.lng &&
      point.lat < ((xj - xi) * (point.lng - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Check if user position is inside a POI's trigger area.
 */
function isInsideTriggerArea(position: LatLng, poi: PointOfInterest): boolean {
  const area = poi.triggerArea;
  if (!area) return false; // No trigger area (e.g., church)
  if (area.type === 'circle') {
    return haversineDistance(position, area.center) <= area.radiusMeters / 1000; // Convert meters to km
  }
  return isPointInPolygon(position, area.coordinates);
}

/**
 * Get the representative position of a POI (for map markers, etc.).
 */
export function getPoiPosition(poi: PointOfInterest): LatLng {
  const area = poi.triggerArea;
  if (!area) {
    // For churches without trigger area, use church geo if available
    if (poi.church?.geo) {
      return { lat: poi.church.geo.latitude, lng: poi.church.geo.longitude };
    }
    // Fallback to default position
    return { lat: 0, lng: 0 };
  }
  if (area.type === 'circle') {
    return area.center;
  }
  // Centroid of the polygon
  const coords = area.coordinates;
  const lat = coords.reduce((sum: number, c) => sum + c.lat, 0) / coords.length;
  const lng = coords.reduce((sum: number, c) => sum + c.lng, 0) / coords.length;
  return { lat, lng };
}

/**
 * When guided mode is active, watches the user's position
 * and auto-narrates when they enter a POI trigger zone.
 */
export function useGuidedMode() {
  const guidedMode = useAppStore((s) => s.guidedMode);
  const userPosition = useAppStore((s) => s.userPosition);
  const selectedRoute = useAppStore((s) => s.selectedRoute);
  const { speak, stop } = useTTS();

  // Track which POIs have already been narrated so we don't repeat
  const narratedIds = useRef<Set<string>>(new Set());

  // Activate geolocation when guided mode is on
  useGeolocation(guidedMode);

  // Reset narrated POIs when route changes or guided mode toggles
  useEffect(() => {
    narratedIds.current.clear();
    if (!guidedMode) {
      stop();
    }
  }, [guidedMode, selectedRoute, stop]);

  // Check proximity to POIs
  useEffect(() => {
    if (!guidedMode || !userPosition || !selectedRoute) return;

    const pois: PointOfInterest[] = selectedRoute.pois;

    for (const poi of pois) {
      if (narratedIds.current.has(poi.id)) continue;

      // Only process POIs with narration (skip churches which don't have audio)
      if (poi.narration && isInsideTriggerArea(userPosition, poi)) {
        narratedIds.current.add(poi.id);
        speak(poi.narration || '');
        break; // narrate one at a time
      }
    }
  }, [guidedMode, userPosition, selectedRoute, speak]);
}
