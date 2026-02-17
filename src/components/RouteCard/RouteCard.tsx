import type { Route } from '../../types';
import './RouteCard.css';

interface RouteCardProps {
  route: Route;
  onClick: (route: Route) => void;
}

function difficultyClass(d: Route['difficulty']) {
  switch (d) {
    case 'fácil':
      return 'route-card__badge--easy';
    case 'moderada':
      return 'route-card__badge--moderate';
    case 'difícil':
      return 'route-card__badge--hard';
  }
}

export function RouteCard({ route, onClick }: RouteCardProps) {
  return (
    <article
      className="route-card"
      tabIndex={0}
      role="button"
      aria-label={`Ver detalle de la ruta ${route.name}`}
      onClick={() => onClick(route)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(route);
        }
      }}
    >
      <h3 className="route-card__name">{route.name}</h3>
      <p className="route-card__desc">{route.shortDescription}</p>

      <div className="route-card__meta">
        <span className={`route-card__badge ${difficultyClass(route.difficulty)}`}>
          {route.difficulty}
        </span>
        <span>{route.distanceKm} km</span>
        <span>{route.durationHours} h</span>
      </div>
    </article>
  );
}
