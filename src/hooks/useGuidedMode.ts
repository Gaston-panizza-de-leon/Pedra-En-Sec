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

      const distance = haversineDistance(userPosition, poi.position);
      if (distance <= poi.triggerRadius) {
        narratedIds.current.add(poi.id);
        speak(poi.narration);
        break; // narrate one at a time
      }
    }
  }, [guidedMode, userPosition, selectedRoute, speak]);
}
