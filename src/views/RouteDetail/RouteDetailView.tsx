import { MapContainer, TileLayer, Polyline, Marker, Tooltip } from 'react-leaflet';
import { useAppStore } from '../../store/useAppStore';
import { TTSButton } from '../../components/TTSButton/TTSButton';
import type { Route, LatLng } from '../../types';
import './RouteDetailView.css';

function difficultyLabel(d: Route['difficulty']) {
  switch (d) {
    case 'fácil':
      return '🟢 Fácil';
    case 'moderada':
      return '🟡 Moderada';
    case 'difícil':
      return '🔴 Difícil';
  }
}

export function RouteDetailView() {
  const route = useAppStore((s) => s.selectedRoute);
  const setView = useAppStore((s) => s.setView);
  const clearRoute = useAppStore((s) => s.clearRoute);
  const guidedMode = useAppStore((s) => s.guidedMode);
  const toggleGuidedMode = useAppStore((s) => s.toggleGuidedMode);
  const stopGuidedMode = useAppStore((s) => s.stopGuidedMode);

  if (!route) {
    // Fallback: go home if no route selected
    setView('home');
    return null;
  }

  const segments: LatLng[][] =
    Array.isArray(route.pathSegments) && route.pathSegments.length > 0
      ? route.pathSegments.filter((segment) => segment.length > 1)
      : route.path.length > 1
        ? [route.path]
        : [];

  const positions: [number, number][][] = segments.map((segment) =>
    segment.map((p) => [p.lat, p.lng] as [number, number]),
  );

  const allPoints = segments.flat();

  const center: [number, number] = [
    allPoints.reduce((sum, p) => sum + p.lat, 0) / allPoints.length,
    allPoints.reduce((sum, p) => sum + p.lng, 0) / allPoints.length,
  ];

  const goBack = () => {
    stopGuidedMode();
    clearRoute();
    setView('home');
  };

  return (
    <main className="route-detail-view" id="main-content">
      {/* Back button */}
      <button
        className="route-detail-view__back"
        onClick={goBack}
        aria-label="Volver al mapa de rutas"
      >
        ← Volver al mapa
      </button>

      {/* Header */}
      <header className="route-detail-view__header">
        <h1 className="route-detail-view__title">{route.name}</h1>
        <div className="route-detail-view__meta">
          <span>{difficultyLabel(route.difficulty)}</span>
          <span>📏 {route.distanceKm} km</span>
          <span>⏱️ {route.durationHours} h</span>
          <span>📍 {route.pois.length} puntos de interés</span>
        </div>
      </header>

      {/* Content */}
      <div className="route-detail-view__content">
        {/* Description */}
        <section>
          <p className="route-detail-view__desc">{route.longDescription}</p>
          <TTSButton
            text={route.longDescription}
            label={`Escuchar descripción de ${route.name}`}
          />
        </section>

        {/* Mini-map */}
        <section>
          <h2 className="route-detail-view__section-title">Recorrido</h2>
          <div className="route-detail-view__minimap">
            <MapContainer
              center={center}
              zoom={13}
              scrollWheelZoom={false}
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Polyline
                positions={positions}
                pathOptions={{ color: route.color, weight: 4, opacity: 0.9 }}
              />
              {route.pois.map((poi) => (
                <Marker
                  key={poi.id}
                  position={[poi.position.lat, poi.position.lng]}
                >
                  <Tooltip direction="top" offset={[0, -20]}>
                    {poi.name}
                  </Tooltip>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </section>

        {/* Photos */}
        {route.photos.length > 0 && (
          <section>
            <h2 className="route-detail-view__section-title">Galería</h2>
            <div
              className="route-detail-view__gallery"
              role="group"
              aria-label="Galería de fotos de la ruta"
            >
              {route.photos.map((src, i) => (
                <img
                  key={i}
                  className="route-detail-view__photo"
                  src={src}
                  alt={`Foto ${i + 1} de ${route.name}`}
                  loading="lazy"
                />
              ))}
            </div>
          </section>
        )}

        {/* Video */}
        {route.video && (
          <section>
            <h2 className="route-detail-view__section-title">Vídeo</h2>
            <iframe
              className="route-detail-view__video"
              src={route.video}
              title={`Vídeo de ${route.name}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </section>
        )}

        {/* Points of interest */}
        {route.pois.length > 0 && (
          <section>
            <h2 className="route-detail-view__section-title">
              Puntos de Interés
            </h2>
            <ul className="route-detail-view__pois">
              {route.pois.map((poi) => (
                <li key={poi.id} className="route-detail-view__poi">
                  {poi.image && (
                    <img
                      className="route-detail-view__poi-img"
                      src={poi.image}
                      alt={poi.name}
                      loading="lazy"
                    />
                  )}
                  <div>
                    <div className="route-detail-view__poi-name">
                      {poi.name}
                    </div>
                    <p className="route-detail-view__poi-narration">
                      {poi.narration}
                    </p>
                    <TTSButton
                      text={poi.narration}
                      label={`Escuchar narración de ${poi.name}`}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Guided mode */}
        <div className="route-detail-view__actions">
          <button
            className={`route-detail-view__guided-btn ${guidedMode ? 'route-detail-view__guided-btn--active' : ''}`}
            onClick={toggleGuidedMode}
            aria-pressed={guidedMode}
            aria-label={
              guidedMode ? 'Desactivar modo guiado' : 'Activar modo guiado'
            }
          >
            {guidedMode ? '⏹ Detener Guía' : '🎧 Iniciar Modo Guiado'}
          </button>
        </div>
      </div>
    </main>
  );
}
