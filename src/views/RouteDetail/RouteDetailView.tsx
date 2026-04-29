import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Tooltip } from 'react-leaflet';
import { useAppStore } from '../../store/useAppStore';
import { getPoiPosition } from '../../hooks/useGuidedMode';
import { TTSButton } from '../../components/TTSButton/TTSButton';
import type { Route, LatLng } from '../../types';
import './RouteDetailView.css';
import { solveHikingTSP } from '../../scripts/routingEngine';

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

  const [selectedPoiIds, setSelectedPoiIds] = useState<Set<string>>(new Set());
  const [optimizedPath, setOptimizedPath] = useState<[number, number][]>([]);

  if (!route) {
    setView('home');
    return null;
  }

  // Logic for segments
  const segments: LatLng[][] = useMemo(() => {
    return Array.isArray(route.pathSegments) && route.pathSegments.length > 0
      ? route.pathSegments.filter((s) => s.length > 1)
      : route.path.length > 1 ? [route.path] : [];
  }, [route]);

  // MISSING FUNCTION 1: handleCalculate
  const handleCalculate = () => {
    const selectedPois = route.pois.filter(p => selectedPoiIds.has(p.id));
    if (selectedPois.length < 2) {
      alert("Selecciona al menos 2 puntos en el mapa");
      return;
    }

    const start = getPoiPosition(selectedPois[0]);
    const others = selectedPois.slice(1).map(p => getPoiPosition(p));
    
    const result = solveHikingTSP(segments, start, others);
    setOptimizedPath(result);
  };

  // MISSING FUNCTION 2: togglePoi
  const togglePoi = (id: string) => {
    setSelectedPoiIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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
      <button className="route-detail-view__back" onClick={goBack}>
        ← Volver al mapa
      </button>

      <header className="route-detail-view__header">
        <h1 className="route-detail-view__title">{route.name}</h1>
        <div className="route-detail-view__meta">
          <span>{difficultyLabel(route.difficulty)}</span>
          <span>📏 {route.distanceKm} km</span>
          <span>⏱️ {route.durationHours} h</span>
        </div>
      </header>

      {/* Optimizer UI */}
      <section className="route-optimizer-controls" style={{ padding: '1rem', background: '#f0f0f0', borderRadius: '8px', margin: '1rem 0' }}>
        <h3>Optimizador de Ruta</h3>
        <p>Haz clic en los marcadores del mapa para seleccionarlos.</p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button 
            onClick={handleCalculate} 
            disabled={selectedPoiIds.size < 2}
            className="optimize-btn"
          >
            ✨ Calcular Ruta ({selectedPoiIds.size})
          </button>
          {optimizedPath.length > 0 && (
            <button onClick={() => setOptimizedPath([])}>Limpiar</button>
          )}
        </div>
      </section>

      <div className="route-detail-view__content">
        <section>
          <div className="route-detail-view__minimap" style={{ height: '400px' }}>
            <MapContainer center={center} zoom={13} style={{ width: '100%', height: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              
              {/* Original Route */}
              <Polyline
                positions={positions}
                pathOptions={{ color: route.color, weight: 4, opacity: 0.4 }}
              />

              {/* FIXED: Optimized path conditional rendering */}
              {optimizedPath.length > 0 && (
                <Polyline
                  positions={optimizedPath}
                  pathOptions={{ color: '#ffea00', weight: 6, opacity: 1, dashArray: '10, 10' }}
                />
              )}

              {/* Markers (Outside the conditional so they always show) */}
              {route.pois.map((poi) => {
                const pos = getPoiPosition(poi);
                const isSelected = selectedPoiIds.has(poi.id);
                return (
                  <Marker
                    key={poi.id}
                    position={[pos.lat, pos.lng]}
                    eventHandlers={{ click: () => togglePoi(poi.id) }}
                  >
                    <Tooltip permanent={isSelected}>
                      {isSelected ? `✅ ${poi.name}` : poi.name}
                    </Tooltip>
                  </Marker>
                );
              })}
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
                    {poi.narration && (
                      <>
                        <p className="route-detail-view__poi-narration">
                          {poi.narration}
                        </p>
                        <TTSButton
                          text={poi.narration}
                          label={`Escuchar narración de ${poi.name}`}
                        />
                      </>
                    )}
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
