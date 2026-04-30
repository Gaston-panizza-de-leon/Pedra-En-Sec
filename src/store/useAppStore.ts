import { create } from 'zustand';
import type { Route, ViewName, LatLng } from '../types';

interface AppState {
  /* ── Navigation ──────────────────────── */
  currentView: ViewName;
  setView: (view: ViewName) => void;

  /* ── Selected Route ──────────────────── */
  selectedRoute: Route | null;
  selectRoute: (route: Route) => void;
  clearRoute: () => void;

  /* ── Detail panel (swipe-up / modal) ── */
  isDetailOpen: boolean;
  openDetail: (route: Route) => void;
  closeDetail: () => void;

  /* ── Guided mode ─────────────────────── */
  guidedMode: boolean;
  toggleGuidedMode: () => void;
  stopGuidedMode: () => void;

  /* ── Geolocation ─────────────────────── */
  userPosition: LatLng | null;
  setUserPosition: (pos: LatLng | null) => void;

  /* ── Hovered route (for map highlight) ─ */
  hoveredRouteId: string | null;
  setHoveredRouteId: (id: string | null) => void;
  /* ── Quiz modal ──────────────────────── */
  isQuizOpen: boolean;
  openQuiz: () => void;
  closeQuiz: () => void;}

export const useAppStore = create<AppState>((set) => ({
  /* Navigation */
  currentView: 'home',
  setView: (view) => set({ currentView: view }),

  /* Selected route */
  selectedRoute: null,
  selectRoute: (route) => set({ selectedRoute: route }),
  clearRoute: () => set({ selectedRoute: null }),

  /* Detail panel */
  isDetailOpen: false,
  openDetail: (route) =>
    set({ selectedRoute: route, isDetailOpen: true }),
  closeDetail: () => set({ isDetailOpen: false }),

  /* Guided mode */
  guidedMode: false,
  toggleGuidedMode: () => set((s) => ({ guidedMode: !s.guidedMode })),
  stopGuidedMode: () => set({ guidedMode: false }),

  /* Geolocation */
  userPosition: null,
  setUserPosition: (pos) => set({ userPosition: pos }),

  /* Hovered route */
  hoveredRouteId: null,
  setHoveredRouteId: (id) => set({ hoveredRouteId: id }),

  /* Quiz modal */
  isQuizOpen: false,
  openQuiz: () => set({ isQuizOpen: true }),
  closeQuiz: () => set({ isQuizOpen: false }),
}));
