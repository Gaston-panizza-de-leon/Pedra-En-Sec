import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';

/**
 * Watches the device geolocation and pushes updates
 * to the global store while `enabled` is true.
 */
export function useGeolocation(enabled: boolean) {
  const setUserPosition = useAppStore((s) => s.setUserPosition);
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        console.warn('[Geolocation] request failed:', err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setUserPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        console.warn('[Geolocation]', err.message);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  }, [enabled, setUserPosition]);
}
