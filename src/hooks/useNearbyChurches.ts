import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { filterChurchesByRoute } from '../data/filterChurchesByRoute';
import type { Route, ChurchPOI } from '../types';

export function useNearbyChurches(route: Route | null): ChurchPOI[] {
  const churches = useAppStore((s) => s.churches);
  const churchDistanceKm = useAppStore((s) => s.churchDistanceKm);

  return useMemo(() => {
    if (!route || churches.length === 0) return [];
    return filterChurchesByRoute(route, churches, churchDistanceKm);
  }, [route, churches, churchDistanceKm]);
}
