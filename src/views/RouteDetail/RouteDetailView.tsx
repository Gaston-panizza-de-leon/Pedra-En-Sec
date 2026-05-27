import { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Tooltip, CircleMarker, useMap } from 'react-leaflet';
import { FaCircle, FaArrowLeft, FaRulerCombined, FaClock, FaCircleCheck, FaStop, FaHeadphones } from 'react-icons/fa6';
import '../../utils/leafletSetup';
import { defaultPoiIcon, churchIcon } from '../../utils/leafletSetup';
import { useAppStore } from '../../store/useAppStore';
import { getPoiPosition } from '../../hooks/useGuidedMode';
import { useNearbyChurches } from '../../hooks/useNearbyChurches';
import { DistanceSlider } from '../../components/DistanceSlider/DistanceSlider';
import { TTSButton } from '../../components/TTSButton/TTSButton';
import { PoiFavButton } from '../../components/PoiFavButton/PoiFavButton';
import { ChurchPopup } from '../../components/ChurchPopup/ChurchPopup';
import { RouteModal } from '../../components/RouteModal/RouteModal';
import type { Route, LatLng } from '../../types';
import './RouteDetailView.css';
import { solveHikingTSP } from '../../scripts/routingEngine';

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);
  return null;
}

function UserPositionMarker() {
  const pos = useAppStore((s) => s.userPosition);
  if (!pos) return null;
  return (
    <CircleMarker
      center={[pos.lat, pos.lng]}
      radius={8}
      pathOptions={{ fillColor: '#3b82f6', fillOpacity: 1, color: '#fff', weight: 3 }}
    />
  );
}

function difficultyLabel(d: Route['difficulty']) {
  const iconProps = { size: 14, style: { verticalAlign: 'middle', marginRight: 4 } };
  switch (d) {
    case 'fácil':
      return <span><FaCircle {...iconProps} style={{ ...iconProps.style, color: '#22c55e' }} />Fácil</span>;
    case 'moderada':
      return <span><FaCircle {...iconProps} style={{ ...iconProps.style, color: '#eab308' }} />Moderada</span>;
    case 'difícil':
      return <span><FaCircle {...iconProps} style={{ ...iconProps.style, color: '#ef4444' }} />Difícil</span>;
  }
}

export function RouteDetailView() {
  const route = useAppStore((s) => s.selectedRoute);
  const setView = useAppStore((s) => s.setView);
  const clearRoute = useAppStore((s) => s.clearRoute);
  const guidedMode = useAppStore((s) => s.guidedMode);
  const toggleGuidedMode = useAppStore((s) => s.toggleGuidedMode);
  const stopGuidedMode = useAppStore((s) => s.stopGuidedMode);
  const selectedChurch = useAppStore((s) => s.selectedChurch);
  const selectChurch = useAppStore((s) => s.selectChurch);
  const clearSelectedChurch = useAppStore((s) => s.clearSelectedChurch);
  const churchDistanceKm = useAppStore((s) => s.churchDistanceKm);
  const setChurchDistance = useAppStore((s) => s.setChurchDistance);

  const nearbyChurches = useNearbyChurches(route);

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
    const allPois = [...route.pois, ...nearbyChurches];
    const selectedPois = allPois.filter((p) => selectedPoiIds.has(p.id));
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
        <FaArrowLeft style={{ marginRight: 6, verticalAlign: 'middle' }} />Volver al mapa
      </button>

      <header className="route-detail-view__header">
        <h1 className="route-detail-view__title">{route.name}</h1>
        <div className="route-detail-view__meta">
          <span>{difficultyLabel(route.difficulty)}</span>
          <span><FaRulerCombined size={13} style={{ marginRight: 3, verticalAlign: 'middle' }} /> {route.distanceKm} km</span>
          <span><FaClock size={13} style={{ marginRight: 3, verticalAlign: 'middle' }} /> {route.durationHours} h</span>
        </div>
      </header>

      {/* Full-width minimap outside content constraints */}
      <section className="route-detail-view__minimap-section">
        <div className="route-detail-view__minimap-wrapper">
          <div className="route-detail-view__minimap">
            <MapContainer center={center} zoom={13} style={{ width: '100%', height: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapResizer />
              {guidedMode && <UserPositionMarker />}

              {/* Ruta original */}
              <Polyline positions={positions} pathOptions={{ color: route.color, weight: 5, opacity: 1, lineCap: 'round', lineJoin: 'round' }} />

              {/* Ruta optimizada */}
              {optimizedPath.length > 0 && (
                <Polyline
                  positions={optimizedPath}
                  pathOptions={{ color: '#ffea00', weight: 6, opacity: 1, dashArray: '10, 10' }}
                />
              )}

              {/* Marcadores de POIs regulares */}
              {route.pois.map((poi) => {
                const pos = getPoiPosition(poi);
                const isSelected = selectedPoiIds.has(poi.id);
                return (
                  <Marker key={poi.id} position={[pos.lat, pos.lng]} icon={defaultPoiIcon} eventHandlers={{ click: () => togglePoi(poi.id) }}>
                    <Tooltip permanent={isSelected}>{isSelected ? <><FaCircleCheck size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />{poi.name}</> : poi.name}</Tooltip>
                  </Marker>
                );
              })}
              {/* Marcadores de iglesias (distancia dinámica) */}
              {nearbyChurches.map((churchPoi) => {
                const pos = getPoiPosition(churchPoi);
                const isSelected = selectedPoiIds.has(churchPoi.id);
                return (
                  <Marker key={churchPoi.id} position={[pos.lat, pos.lng]} icon={churchIcon} eventHandlers={{ click: () => togglePoi(churchPoi.id) }}>
                    <Tooltip permanent={isSelected}>{isSelected ? <><FaCircleCheck size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />{churchPoi.name}</> : churchPoi.name}</Tooltip>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
          <div className="route-detail-view__sidebar">
            {nearbyChurches.length > 0 && (
              <DistanceSlider
                value={churchDistanceKm}
                onChange={setChurchDistance}
                churchCount={nearbyChurches.length}
              />
            )}
            {/* Optimizador de ruta */}
            <section className="route-optimizer" aria-labelledby="optimizer-title">
              <div className="route-optimizer__head">
                <h3 id="optimizer-title" className="route-optimizer__title">
                  Optimizador de Ruta
                </h3>
                <span className="route-optimizer__counter">
                  {selectedPoiIds.size} / {route.pois.length + nearbyChurches.length} seleccionados
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
          </div>
        </div>
      </section>

      <div className="route-detail-view__content">
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
            <h2 className="route-detail-view__section-title">
              Puntos de Interés
            </h2>
            <ul className="route-detail-view__pois">
              {route.pois.map((poi) => (
                <li key={poi.id} className="route-detail-view__poi">
                  {poi.image && (
                    <img className="route-detail-view__poi-img" src={poi.image} alt={poi.name} loading="lazy" />
                  )}
                  <div>
                    <div className="route-detail-view__poi-name">{poi.name}</div>
                    <p className="route-detail-view__poi-narration">{poi.narration}</p>
                    <TTSButton text={poi.narration ?? ''} label={`Escuchar narración de ${poi.name}`} />
                    <PoiFavButton poiId={poi.id} poiName={poi.name} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Churches (distancia dinámica) */}
        {nearbyChurches.length > 0 && (
          <section>
            <h2 className="route-detail-view__section-title">
              Iglesias Cercanas
            </h2>
            <ul className="route-detail-view__pois">
              {nearbyChurches.map((churchPoi) => (
                <li key={churchPoi.id} className="route-detail-view__poi">
                  {churchPoi.church?.image?.[0]?.contentUrl && (
                    <img
                      className="route-detail-view__poi-img"
                      src={churchPoi.church.image[0].contentUrl}
                      alt={churchPoi.name}
                      loading="lazy"
                    />
                  )}
                  <div>
                    <div className="route-detail-view__poi-name">{churchPoi.name}</div>
                    {churchPoi.church?.address?.streetAddress && (
                      <p style={{ fontSize: '13px', color: '#666', margin: '4px 0' }}>
                        {churchPoi.church.address.streetAddress}
                      </p>
                    )}
                    <button
                      className="route-detail-view__church-btn"
                      onClick={() => selectChurch(churchPoi.church!)}
                    >
                      Ver detalles
                    </button>
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
            {guidedMode ? <><FaStop size={14} style={{ marginRight: 5 }} />Detener Guía</> : <><FaHeadphones size={14} style={{ marginRight: 5 }} />Iniciar Modo Guiado</>}
          </button>
        </div>
      </div>

      {/* Church detail modal */}
      {selectedChurch && (
        <RouteModal
          isOpen={!!selectedChurch}
          onClose={clearSelectedChurch}
          ariaLabel={`Detalles de ${selectedChurch.name}`}
        >
          <ChurchPopup church={selectedChurch} onClose={clearSelectedChurch} />
        </RouteModal>
      )}
    </main>
  );
}