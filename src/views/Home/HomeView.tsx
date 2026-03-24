import { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { InteractiveMap } from './components/InteractiveMap/InteractiveMap';
import { InfoSection } from './components/InfoSection/InfoSection';
import { RouteModal } from '../../components/RouteModal/RouteModal';
import { RouteDetailPanel } from './components/RouteDetailPanel/RouteDetailPanel';
import { Loader } from '../../components/Loader/Loader';
import { loadRoutesFromGeoJson } from '../../data/loadRoutesFromGeoJson';
import type { Route } from '../../types';
import './HomeView.css';

export function HomeView() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(true);
  const [routesError, setRoutesError] = useState<string | null>(null);
  const isDetailOpen = useAppStore((s) => s.isDetailOpen);
  const closeDetail = useAppStore((s) => s.closeDetail);
  const selectedRoute = useAppStore((s) => s.selectedRoute);

  useEffect(() => {
    let isMounted = true;

    loadRoutesFromGeoJson()
      .then((loadedRoutes) => {
        if (!isMounted) return;
        setRoutes(loadedRoutes);
        setRoutesError(null);
      })
      .catch((error) => {
        if (!isMounted) return;
        const message = error instanceof Error ? error.message : 'Error cargando rutas';
        setRoutesError(message);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoadingRoutes(false);
      });

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
      <section className="home-view__map-wrapper" aria-label="Mapa de rutas">
        <InteractiveMap routes={routes} />
      </section>

      {/* Cultural info */}
      <InfoSection />

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
    </main>
  );
}
