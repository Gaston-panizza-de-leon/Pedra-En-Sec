import type { Route } from '../../../../types';
import { useAppStore } from '../../../../store/useAppStore';
import { TTSButton } from '../../../../components/TTSButton/TTSButton';
import './RouteDetailPanel.css';

interface RouteDetailPanelProps {
  route: Route;
}

function difficultyClass(d: Route['difficulty']) {
  switch (d) {
    case 'fácil':
      return 'route-detail-panel__badge--easy';
    case 'moderada':
      return 'route-detail-panel__badge--moderate';
    case 'difícil':
      return 'route-detail-panel__badge--hard';
  }
}

export function RouteDetailPanel({ route }: RouteDetailPanelProps) {
  const guidedMode = useAppStore((s) => s.guidedMode);
  const toggleGuidedMode = useAppStore((s) => s.toggleGuidedMode);
  const selectRoute = useAppStore((s) => s.selectRoute);
  const setView = useAppStore((s) => s.setView);
  const closeDetail = useAppStore((s) => s.closeDetail);

  const handleFullView = () => {
    selectRoute(route);
    closeDetail();
    setView('routeDetail');
  };

  return (
    <div className="route-detail-panel">
      <h2 className="route-detail-panel__title">{route.name}</h2>

      {/* Meta */}
      <div className="route-detail-panel__meta">
        <span
          className={`route-detail-panel__badge ${difficultyClass(route.difficulty)}`}
        >
          {route.difficulty}
        </span>
        <span>📏 {route.distanceKm} km</span>
        <span>⏱️ {route.durationHours} h</span>
        <span>📍 {route.pois.length} puntos de interés</span>
      </div>

      {/* Description */}
      <p className="route-detail-panel__desc">{route.longDescription}</p>

      {/* TTS for description */}
      <TTSButton
        text={route.longDescription}
        label={`Escuchar descripción de ${route.name}`}
      />

      {/* Photos */}
      {route.photos.length > 0 && (
        <>
          <h3 className="route-detail-panel__section-title">Fotos</h3>
          <div className="route-detail-panel__gallery" role="group" aria-label="Galería de fotos">
            {route.photos.map((src, i) => (
              <img
                key={i}
                className="route-detail-panel__photo"
                src={src}
                alt={`Foto ${i + 1} de la ruta ${route.name}`}
                loading="lazy"
              />
            ))}
          </div>
        </>
      )}

      {/* Video */}
      {route.video && (
        <>
          <h3 className="route-detail-panel__section-title">Vídeo</h3>
          <iframe
            className="route-detail-panel__video"
            src={route.video}
            title={`Vídeo de la ruta ${route.name}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </>
      )}

      {/* Points of Interest */}
      {route.pois.length > 0 && (
        <>
          <h3 className="route-detail-panel__section-title">
            Puntos de Interés
          </h3>
          <ul className="route-detail-panel__pois">
            {route.pois.map((poi) => (
              <li key={poi.id} className="route-detail-panel__poi">
                {poi.image && (
                  <img
                    className="route-detail-panel__poi-img"
                    src={poi.image}
                    alt={poi.name}
                    loading="lazy"
                  />
                )}
                <div>
                  <div className="route-detail-panel__poi-name">{poi.name}</div>
                  <p className="route-detail-panel__poi-narration">
                    {poi.narration}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Actions */}
      <div className="route-detail-panel__actions">
        <button
          className={`route-detail-panel__guided-btn ${guidedMode ? 'route-detail-panel__guided-btn--active' : ''}`}
          onClick={toggleGuidedMode}
          aria-pressed={guidedMode}
          aria-label={
            guidedMode ? 'Desactivar modo guiado' : 'Activar modo guiado'
          }
        >
          {guidedMode ? '⏹ Detener Guía' : '🎧 Modo Guiado'}
        </button>

        <button
          className="route-detail-panel__fullview-btn"
          onClick={handleFullView}
        >
          Ver completo
        </button>
      </div>
    </div>
  );
}
