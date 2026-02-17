import type { Route } from '../../../../types';
import { RouteCard } from '../../../../components/RouteCard/RouteCard';
import './RouteList.css';

interface RouteListProps {
  routes: Route[];
  onSelect: (route: Route) => void;
}

export function RouteList({ routes, onSelect }: RouteListProps) {
  return (
    <section className="route-list" aria-labelledby="route-list-heading">
      <h2 id="route-list-heading" className="route-list__title">
        Rutas Disponibles
      </h2>

      <div className="route-list__grid">
        {routes.map((route) => (
          <RouteCard key={route.id} route={route} onClick={onSelect} />
        ))}
      </div>
    </section>
  );
}
