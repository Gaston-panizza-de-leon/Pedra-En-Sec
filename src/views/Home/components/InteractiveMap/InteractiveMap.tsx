import {
  MapContainer,
  TileLayer,
  Polyline,
  Tooltip,
  CircleMarker,
  Marker,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import { useAppStore } from '../../../../store/useAppStore';
import type { Route, LatLng } from '../../../../types';
import './InteractiveMap.css';

/* ── Fix default Leaflet icon paths (Vite bundling) ── */
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/* ── Balearic Islands centre ── */
const BALEARES_CENTER: [number, number] = [39.6, 2.95];
const DEFAULT_ZOOM = 9;

interface InteractiveMapProps {
  routes: Route[];
}

function getRouteSegments(route: Route): LatLng[][] {
  if (Array.isArray(route.pathSegments) && route.pathSegments.length > 0) {
    return route.pathSegments.filter((segment) => segment.length > 1);
  }
  return route.path.length > 1 ? [route.path] : [];
}

/** Fly to the selected route bounds */
function FlyToRoute({ route }: { route: Route | null }) {
  const map = useMap();

  if (route) {
    const points = getRouteSegments(route).flat();
    if (points.length < 2) return null;

    const bounds = L.latLngBounds(
      points.map((p) => [p.lat, p.lng] as [number, number]),
    );
    map.flyToBounds(bounds, { padding: [60, 60], maxZoom: 14, duration: 0.8 });
  }

  return null;
}

/** User position dot */
function UserPositionMarker() {
  const pos = useAppStore((s) => s.userPosition);
  if (!pos) return null;

  return (
    <CircleMarker
      center={[pos.lat, pos.lng]}
      radius={8}
      pathOptions={{
        fillColor: '#3b82f6',
        fillOpacity: 1,
        color: '#fff',
        weight: 3,
      }}
    >
      <Tooltip direction="top" offset={[0, -12]}>
        Tu posición
      </Tooltip>
    </CircleMarker>
  );
}

export function InteractiveMap({ routes }: InteractiveMapProps) {
  const hoveredRouteId = useAppStore((s) => s.hoveredRouteId);
  const setHoveredRouteId = useAppStore((s) => s.setHoveredRouteId);
  const openDetail = useAppStore((s) => s.openDetail);
  const selectedRoute = useAppStore((s) => s.selectedRoute);
  const guidedMode = useAppStore((s) => s.guidedMode);

  return (
    <div className="interactive-map" role="region" aria-label="Mapa interactivo de rutas de Pedra en Sec">
      <MapContainer
        center={BALEARES_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        className="interactive-map__container"
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FlyToRoute route={selectedRoute} />

        {/* Route polylines */}
        {routes.map((route) => {
          const isHovered = hoveredRouteId === route.id;
          const isSelected = selectedRoute?.id === route.id;
          const isActive = isHovered || isSelected;

          const positions: [number, number][][] = getRouteSegments(route).map((segment) =>
            segment.map((p: LatLng) => [p.lat, p.lng] as [number, number]),
          );
          if (positions.length === 0) return null;

          return (
            <Polyline
              key={route.id}
              positions={positions}
              pathOptions={{
                color: isActive ? route.color : '#999',
                weight: isActive ? 5 : 3,
                opacity: isActive ? 1 : 0.4,
                dashArray: isActive ? undefined : '8 6',
              }}
              eventHandlers={{
                mouseover: () => setHoveredRouteId(route.id),
                mouseout: () => setHoveredRouteId(null),
                click: () => openDetail(route),
              }}
            >
              <Tooltip sticky direction="top" offset={[0, -10]}>
                <strong>{route.name}</strong>
                <br />
                {route.shortDescription}
              </Tooltip>
            </Polyline>
          );
        })}

        {/* POI markers for selected route */}
        {selectedRoute?.pois.map((poi) => (
          <Marker
            key={poi.id}
            position={[poi.position.lat, poi.position.lng]}
          >
            <Tooltip direction="top" offset={[0, -20]}>
              {poi.name}
            </Tooltip>
          </Marker>
        ))}

        {/* User position when in guided mode */}
        {guidedMode && <UserPositionMarker />}
      </MapContainer>
    </div>
  );
}
