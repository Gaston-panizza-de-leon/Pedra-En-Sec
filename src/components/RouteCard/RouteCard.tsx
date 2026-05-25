import type { Route } from '../../types';
import { useAuthStore } from '../../store/useAuthStore';
import { useAppStore } from '../../store/useAppStore';
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
  const currentUser = useAuthStore((s) => s.currentUser);
  const isFav = useAuthStore((s) => s.favorites.includes(route.id));
  const toggleFavorite = useAuthStore((s) => s.toggleFavorite);
  const openAuth = useAppStore((s) => s.openAuth);

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      openAuth();
      return;
    }
    toggleFavorite(route.id);
  };

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
      <button
        type="button"
        className={`route-card__fav ${isFav ? 'route-card__fav--active' : ''}`}
        onClick={handleFav}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') e.stopPropagation();
        }}
        aria-pressed={isFav}
        aria-label={
          !currentUser
            ? `Inicia sesión para guardar ${route.name} en favoritas`
            : isFav
              ? `Quitar ${route.name} de favoritas`
              : `Añadir ${route.name} a favoritas`
        }
        title={currentUser ? 'Favorita' : 'Inicia sesión para guardar favoritas'}
      >
        {isFav ? '★' : '☆'}
      </button>

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