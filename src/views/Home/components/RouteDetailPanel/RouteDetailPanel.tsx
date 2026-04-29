import { useState } from 'react';
import type { Route } from '../../../../types';
import { useAppStore } from '../../../../store/useAppStore';
import { TTSButton } from '../../../../components/TTSButton/TTSButton';
import { PhotoLightbox } from '../../../../components/PhotoLightbox/PhotoLightbox';
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
  const [isPhotoLightboxOpen, setIsPhotoLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const guidedMode = useAppStore((s) => s.guidedMode);
  const toggleGuidedMode = useAppStore((s) => s.toggleGuidedMode);
  const selectRoute = useAppStore((s) => s.selectRoute);
  const setView = useAppStore((s) => s.setView);
  const closeDetail = useAppStore((s) => s.closeDetail);
  const selectChurch = useAppStore((s) => s.selectChurch);

  const handleFullView = () => {
    selectRoute(route);
    closeDetail();
    setView('routeDetail');
  };

  const openPhotoLightbox = (index: number) => {
    setCurrentPhotoIndex(index);
    setIsPhotoLightboxOpen(true);
  };

  const closePhotoLightbox = () => {
    setIsPhotoLightboxOpen(false);
  };

  const goToNextPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === route.photos.length - 1 ? 0 : prev + 1
    );
  };

  const goToPrevPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === 0 ? route.photos.length - 1 : prev - 1
    );
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
              <button
                key={i}
                className="route-detail-panel__photo-button"
                onClick={() => openPhotoLightbox(i)}
                type="button"
                aria-label={`Ver foto ${i + 1} en tamaño completo`}
              >
                <img
                  className="route-detail-panel__photo"
                  src={src}
                  alt={`Foto ${i + 1} de la ruta ${route.name}`}
                  loading="lazy"
                />
              </button>
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

              {/* Churches */}
              {route.pois.filter((p) => p.type === 'church').length > 0 && (
                <>
                  <h3 className="route-detail-panel__section-title">
                    ⛪ Iglesias Cercanas ({route.pois.filter((p) => p.type === 'church').length})
                  </h3>
                  <ul className="route-detail-panel__poi-list" role="list">
                    {route.pois
                      .filter((poi) => poi.type === 'church' && poi.church)
                      .map((poi) => (
                        <li
                          key={poi.id}
                          className="route-detail-panel__poi-item"
                          role="listitem"
                        >
                          <button
                            className="route-detail-panel__church-button"
                            onClick={() => selectChurch(poi.church!)}
                            style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          >
                            <div>
                              <div className="route-detail-panel__poi-name">{poi.name}</div>
                              {poi.church?.address?.streetAddress && (
                                <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0 0' }}>
                                  📍 {poi.church.address.streetAddress}
                                </p>
                              )}
                            </div>
                          </button>
                        </li>
                      ))}
                  </ul>
                </>
              )}

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

      {/* Photo Lightbox */}
      <PhotoLightbox
        isOpen={isPhotoLightboxOpen}
        photos={route.photos}
        currentIndex={currentPhotoIndex}
        routeName={route.name}
        onClose={closePhotoLightbox}
        onNext={goToNextPhoto}
        onPrev={goToPrevPhoto}
      />
    </div>
  );
}
