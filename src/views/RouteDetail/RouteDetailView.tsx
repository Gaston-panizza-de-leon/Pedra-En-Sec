import { useState, useMemo, useEffect } from 'react';
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
  const [optimizerMsg, setOptimizerMsg] = useState<string>('');

  // Redirección si no hay ruta: como EFECTO, nunca durante el render.
  useEffect(() => {
    if (!route) setView('home');
  }, [route, setView]);

  // Los hooks se ejecutan SIEMPRE (toleran route === null) y van ANTES del return.
  const segments: LatLng[][] = useMemo(() => {
    if (!route) return [];
    return Array.isArray(route.pathSegments) && route.pathSegments.length > 0
      ? route.pathSegments.filter((s) => s.length > 1)
      : route.path.length > 1
        ? [route.path]
        : [];
  }, [route]);

  // Centro con guarda anti-NaN (si no hay puntos -> centro de Baleares).
  const center: [number, number] = useMemo(() => {
    const pts = segments.flat();
    if (pts.length === 0) return [39.6, 2.95];
    return [
      pts.reduce((sum, p) => sum + p.lat, 0) / pts.length,
      pts.reduce((sum, p) => sum + p.lng, 0) / pts.length,
    ];
  }, [segments]);

  // Datos estructurados por ruta (Schema.org / JSON-LD), inyectados en <head>.
  useEffect(() => {
    if (!route) return;
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'TouristAttraction',
      name: route.name,
      description: route.longDescription || route.shortDescription,
      touristType: 'Senderismo',
      isAccessibleForFree: true,
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(ld);
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [route]);

  // Return condicional DESPUÉS de todos los hooks.
  if (!route) return null;

  const handleCalculate = () => {
    const selectedPois = route.pois.filter((p) => selectedPoiIds.has(p.id));
    if (selectedPois.length < 2) {
      setOptimizerMsg('Selecciona al menos 2 puntos en el mapa.');
      return;
    }
    const start = getPoiPosition(selectedPois[0]);
    const others = selectedPois.slice(1).map((p) => getPoiPosition(p));
    const result = solveHikingTSP(segments, start, others);
    if (result.length === 0) {
      setOptimizerMsg(
        'No se pudo trazar una ruta entre esos puntos (pueden estar en tramos desconectados).',
      );
    } else {
      setOptimizerMsg('');
    }
    setOptimizedPath(result);
  };

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

      {/* Optimizador de ruta */}
      <section className="route-optimizer" aria-labelledby="optimizer-title">
        <div className="route-optimizer__head">
          <h3 id="optimizer-title" className="route-optimizer__title">
            Optimizador de Ruta
          </h3>
          <span className="route-optimizer__counter">
            {selectedPoiIds.size} / {route.pois.length} seleccionados
          </span>
        </div>

        <p className="route-optimizer__help">
          Pulsa los marcadores del mapa para elegir los puntos que quieres visitar.
          Con 2 o más, calcula el orden más corto entre ellos.
        </p>

        <ul className="route-optimizer__legend">
          <li className="route-optimizer__legend-item">
            <span className="route-optimizer__swatch" style={{ background: route.color }} />
            Ruta original
          </li>
          <li className="route-optimizer__legend-item">
            <span className="route-optimizer__swatch route-optimizer__swatch--opt" />
            Ruta optimizada
          </li>
        </ul>

        <div className="route-optimizer__actions">
          <button
            onClick={handleCalculate}
            disabled={selectedPoiIds.size < 2}
            className="route-optimizer__btn route-optimizer__btn--primary"
          >
            Calcular ruta{selectedPoiIds.size >= 2 ? ` (${selectedPoiIds.size})` : ''}
          </button>
          {optimizedPath.length > 0 && (
            <button
              onClick={() => {
                setOptimizedPath([]);
                setOptimizerMsg('');
                setSelectedPoiIds(new Set());
              }}
              className="route-optimizer__btn route-optimizer__btn--ghost"
            >
              Limpiar
            </button>
          )}
        </div>

        {optimizerMsg && (
          <p role="status" aria-live="polite" className="route-optimizer__msg">
            {optimizerMsg}
          </p>
        )}
      </section>

      <div className="route-detail-view__content">
        <section>
          <div className="route-detail-view__minimap" style={{ height: '400px' }}>
            <MapContainer center={center} zoom={13} style={{ width: '100%', height: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Ruta original */}
              <Polyline positions={positions} pathOptions={{ color: route.color, weight: 4, opacity: 0.4 }} />

              {/* Ruta optimizada */}
              {optimizedPath.length > 0 && (
                <Polyline
                  positions={optimizedPath}
                  pathOptions={{ color: '#ffea00', weight: 6, opacity: 1, dashArray: '10, 10' }}
                />
              )}

              {/* Marcadores (siempre visibles) */}
              {route.pois.map((poi) => {
                const pos = getPoiPosition(poi);
                const isSelected = selectedPoiIds.has(poi.id);
                return (
                  <Marker key={poi.id} position={[pos.lat, pos.lng]} eventHandlers={{ click: () => togglePoi(poi.id) }}>
                    <Tooltip permanent={isSelected}>{isSelected ? `✅ ${poi.name}` : poi.name}</Tooltip>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </section>

        {/* Galería */}
        {route.photos.length > 0 && (
          <section>
            <h2 className="route-detail-view__section-title">Galería</h2>
            <div className="route-detail-view__gallery" role="group" aria-label="Galería de fotos de la ruta">
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

        {/* Vídeo */}
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

        {/* Vídeo propio (self-hosted), debajo del vídeo embebido */}
        {route.id === 'ruta-pedra-sec-mallorca' && (
          <section>
            
            <video className="route-detail-view__video" controls preload="metadata" playsInline>
              <source src={`${import.meta.env.BASE_URL}videos/video-ownc.mp4`} type="video/mp4" />
              {/* Subtítulos (accesibilidad): crea public/videos/video-ownc.es.vtt y descomenta el track:
              <track kind="captions" src={`${import.meta.env.BASE_URL}videos/video-ownc.es.vtt`} srcLang="es" label="Español" default /> */}
              Tu navegador no soporta el vídeo HTML5.
            </video>
          </section>
        )}

        {/* Puntos de interés */}
        {route.pois.length > 0 && (
          <section>
            <h2 className="route-detail-view__section-title">Puntos de Interés</h2>
            <ul className="route-detail-view__pois">
              {route.pois.map((poi) => (
                <li key={poi.id} className="route-detail-view__poi">
                  {poi.image && (
                    <img className="route-detail-view__poi-img" src={poi.image} alt={poi.name} loading="lazy" />
                  )}
                  <div>
                    <div className="route-detail-view__poi-name">{poi.name}</div>
                    <p className="route-detail-view__poi-narration">{poi.narration}</p>
                    <TTSButton text={poi.narration} label={`Escuchar narración de ${poi.name}`} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Modo guiado */}
        <div className="route-detail-view__actions">
          <button
            className={`route-detail-view__guided-btn ${guidedMode ? 'route-detail-view__guided-btn--active' : ''}`}
            onClick={toggleGuidedMode}
            aria-pressed={guidedMode}
            aria-label={guidedMode ? 'Desactivar modo guiado' : 'Activar modo guiado'}
          >
            {guidedMode ? '⏹ Detener Guía' : '🎧 Iniciar Modo Guiado'}
          </button>
        </div>
      </div>
    </main>
  );
}
