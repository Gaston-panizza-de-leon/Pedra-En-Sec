import { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { InteractiveMap } from './components/InteractiveMap/InteractiveMap';
import { InfoSection } from './components/InfoSection/InfoSection';
import { AboutSection } from './components/AboutSection/AboutSection';
import { RouteModal } from '../../components/RouteModal/RouteModal';
import { RouteDetailPanel } from './components/RouteDetailPanel/RouteDetailPanel';
import { Loader } from '../../components/Loader/Loader';
import { loadRoutesFromGeoJson } from '../../data/loadRoutesFromGeoJson';
import type { Route } from '../../types';
import type { Church } from '../../types';
import './HomeView.css';
import { ChurchPopup } from '../../components/ChurchPopup/ChurchPopup';

export function HomeView() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(true);
  const [routesError, setRoutesError] = useState<string | null>(null);
  const isDetailOpen = useAppStore((s) => s.isDetailOpen);
  const closeDetail = useAppStore((s) => s.closeDetail);
  const selectedRoute = useAppStore((s) => s.selectedRoute);
  const setChurches = useAppStore((s) => s.setChurches);
  const selectedChurch = useAppStore((s) => s.selectedChurch);
  const clearSelectedChurch = useAppStore((s) => s.clearSelectedChurch);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        // Load churches first
        const churchesResponse = await fetch('/data/external/iglesias.json');
        if (!churchesResponse.ok) {
          throw new Error(`No se pudieron cargar iglesias (${churchesResponse.status})`);
        }
        const churchesData = await churchesResponse.json();
        const churches = (churchesData['@graph'] || []) as Church[];
        
        if (isMounted) {
          setChurches(churches);
        }

        // Load routes with churches
        const loadedRoutes = await loadRoutesFromGeoJson(churches);
        if (isMounted) {
          setRoutes(loadedRoutes);
          setRoutesError(null);
        }
      } catch (error) {
        if (isMounted) {
          const message = error instanceof Error ? error.message : 'Error cargando datos';
          setRoutesError(message);
        }
      } finally {
        if (isMounted) {
          setIsLoadingRoutes(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoadingRoutes) {
    return (
      <main className="home-view" id="main-content">
        <Loader text="Cargando rutas desde GeoJSON..." />
      </main>
    );
  }

  if (routesError) {
    return (
      <main className="home-view" id="main-content">
        <section className="home-view__hero" aria-label="Error de carga">
          <h1 className="home-view__hero-title">No se pudieron cargar las rutas</h1>
          <p className="home-view__hero-sub">{routesError}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="home-view" id="main-content">
      {/* Hero */}
      <section className="home-view__hero" aria-label="Presentación">
        <h1 className="home-view__hero-title">
          Descubre la Pedra en Sec
        </h1>
        <p className="home-view__hero-sub">
          Explora las rutas ancestrales de piedra en seco en las Islas Baleares.
          Patrimonio de la Humanidad al alcance de tus pies.
        </p>
      </section>

      {/* Interactive Map */}
      <section className="home-view__map-wrapper" id="map-section" aria-label="Mapa de rutas">
        <InteractiveMap routes={routes} />
      </section>

      {/* Cultural info */}
      <InfoSection />

      {/* About section */}
      <AboutSection />

      {/* Route detail modal (opens on map click) */}
      <RouteModal
        isOpen={isDetailOpen}
        onClose={closeDetail}
        ariaLabel={
          selectedRoute
            ? `Detalle de la ruta ${selectedRoute.name}`
            : 'Detalle de ruta'
        }
      >
        {selectedRoute && <RouteDetailPanel route={selectedRoute} />}
      </RouteModal>

          {/* Church detail modal (opens on church marker click) */}
          {selectedChurch && (
            <RouteModal
              isOpen={!!selectedChurch}
              onClose={clearSelectedChurch}
              ariaLabel={`Detalles de ${selectedChurch.name}`}
            >
              <ChurchPopup church={selectedChurch} onClose={clearSelectedChurch} />
            </RouteModal>
          )}
    </main>
  );
}
