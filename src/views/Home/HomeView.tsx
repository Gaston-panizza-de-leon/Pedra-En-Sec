import { useAppStore } from '../../store/useAppStore';
import { InteractiveMap } from './components/InteractiveMap/InteractiveMap';
import { InfoSection } from './components/InfoSection/InfoSection';
import { RouteList } from './components/RouteList/RouteList';
import { SwipePanel } from '../../components/SwipePanel/SwipePanel';
import { RouteDetailPanel } from './components/RouteDetailPanel/RouteDetailPanel';
import routesData from '../../data/routes.json';
import type { Route } from '../../types';
import './HomeView.css';

const routes = routesData as Route[];

export function HomeView() {
  const isDetailOpen = useAppStore((s) => s.isDetailOpen);
  const closeDetail = useAppStore((s) => s.closeDetail);
  const selectedRoute = useAppStore((s) => s.selectedRoute);
  const openDetail = useAppStore((s) => s.openDetail);

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
      <div className="home-view__map-wrapper">
        <InteractiveMap routes={routes} />
      </div>

      {/* Route list */}
      <RouteList routes={routes} onSelect={openDetail} />

      <hr className="home-view__divider" />

      {/* Cultural info */}
      <InfoSection />

      {/* Detail panel (swipe-up / sidebar) */}
      <SwipePanel
        isOpen={isDetailOpen}
        onClose={closeDetail}
        ariaLabel={
          selectedRoute
            ? `Detalle de la ruta ${selectedRoute.name}`
            : 'Detalle de ruta'
        }
      >
        {selectedRoute && <RouteDetailPanel route={selectedRoute} />}
      </SwipePanel>
    </main>
  );
}
