# Pedra en Sec

Aplicación **React + TypeScript + Vite** para explorar las rutas de Pedra en Sec
(Patrimonio Cultural Inmaterial de la Humanidad, UNESCO 2018) en las Islas Baleares:
mapa interactivo (Leaflet), modo guiado con narración por voz (Web Speech + Geolocation),
optimizador de ruta (grafo + A*) y quiz cultural.

## Pipeline de rutas GeoJSON (runtime)

La app carga las rutas en tiempo de ejecución desde la carpeta **`public/data/`**
(servida en la raíz del sitio), no desde `src/`:

- Catálogo de metadatos y POIs: `public/data/routes.json`
- Geometrías por ruta: archivos `*.geojson` en `public/data/`

### Cómo funciona

1. En `routes.json` defines cada ruta con sus metadatos y POIs.
2. Cada ruta indica su geometría con el campo **`sourceGeoJson`** (nombre del archivo GeoJSON).
3. `src/data/loadRoutesFromGeoJson.ts` descarga y convierte las geometrías
   (LineString / MultiLineString) a coordenadas `{ lat, lng }`, con validación defensiva.
4. Si la ruta define **`simplificationToleranceMeters`**, la geometría se simplifica
   en cliente con Douglas-Peucker (turf) para reducir los puntos a dibujar
   (recomendado 15–35 m según el detalle deseado).

### Añadir una nueva ruta

1. Copia tu archivo GeoJSON a `public/data/`.
2. Añade una entrada al array de `public/data/routes.json` con:
   - `id`, `name`, `difficulty`, `distanceKm`, `durationHours`, `color`
   - `sourceGeoJson`: nombre del archivo GeoJSON
   - `simplificationToleranceMeters`: tolerancia en metros (opcional)
   - `pois`, `photos`, `video` (opcionales)

> Las rutas de imágenes en `routes.json` se resuelven respetando el `base` de Vite,
> así que pueden escribirse como `/images/archivo.webp`.

## Desarrollo

```bash
npm install
npm run dev
```

## Build y despliegue

```bash
npm run build      # tsc -b && vite build  ->  genera dist/
```

El despliegue es automático: al hacer push a `main`, una GitHub Action compila
y sube `dist/` por FTP a DonDominio. `base` está fijado a `./` para soportar
despliegue en subcarpetas.

## PWA

- `public/manifest.json` con iconos PNG (192, 512 y maskable) + SVG.
- `public/sw.js`: Service Worker (cache-first para estáticos, network-first para
  datos JSON/GeoJSON y navegación con fallback offline). Se registra solo en
  producción desde `src/main.tsx`.
- Requiere **HTTPS** en producción (también necesario para Geolocation y Web Speech).

## Estructura

```
public/
  data/            routes.json + *.geojson
  images/          *.webp, placeholders
  manifest.json, sw.js, robots.txt, sitemap.xml, hiker.svg, icon-192.png, icon-512.png
src/
  components/      Header, modales (RouteModal/QuizModal/PhotoLightbox), TTSButton, Loader, RouteCard
  views/           Home (mapa, info, about), RouteDetail
  hooks/           useTTS, useGeolocation, useGuidedMode, useFocusTrap
  data/            loadRoutesFromGeoJson.ts, quizQuestions.ts
  scripts/         routingEngine.ts (grafo + A*)
  store/           useAppStore.ts (zustand)
  types/           index.ts
```
