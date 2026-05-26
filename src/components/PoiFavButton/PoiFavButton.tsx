import { useAuthStore } from '../../store/useAuthStore';
import { useAppStore } from '../../store/useAppStore';
import './PoiFavButton.css';

interface PoiFavButtonProps {
  poiId: string;
  poiName: string;
}

/**
 * Botón ★ para marcar un punto de interés como favorito.
 * - Con sesión: alterna el favorito (se guarda en localStorage por usuario).
 * - Sin sesión: abre el modal de login/registro.
 */
export function PoiFavButton({ poiId, poiName }: PoiFavButtonProps) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const isFav = useAuthStore((s) => s.favorites.includes(poiId));
  const toggleFavorite = useAuthStore((s) => s.toggleFavorite);
  const openAuth = useAppStore((s) => s.openAuth);

  const handleClick = () => {
    if (!currentUser) {
      openAuth();
      return;
    }
    toggleFavorite(poiId);
  };

  return (
    <button
      type="button"
      className={`poi-fav ${isFav ? 'poi-fav--active' : ''}`}
      onClick={handleClick}
      aria-pressed={isFav}
      aria-label={
        !currentUser
          ? `Inicia sesión para guardar ${poiName} en favoritos`
          : isFav
            ? `Quitar ${poiName} de favoritos`
            : `Guardar ${poiName} en favoritos`
      }
    >
      <span className="poi-fav__star" aria-hidden="true">
        {isFav ? '★' : '☆'}
      </span>
      {isFav ? 'Guardado' : 'Guardar'}
    </button>
  );
}