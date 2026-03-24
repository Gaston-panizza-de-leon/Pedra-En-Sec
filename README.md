# Pedra en Sec

Aplicacion React + TypeScript + Vite para explorar rutas de Pedra en Sec.

## Pipeline de rutas GeoJSON (runtime)

La app carga las rutas en tiempo de ejecucion, leyendo:

- Catalogo de metadatos y POIs: `src/data/routes.json`
- Geometrias por ruta: archivos `*.geojson` en `src/data/`

### Como funciona

1. En el catalogo defines cada ruta con metadatos y POIs.
2. Para cada ruta defines `sourceGeoJson` con el archivo correspondiente.
3. La UI carga y convierte las geometrias directamente desde esos GeoJSON (LineString/MultiLineString).

### Añadir una nueva ruta GeoJSON

1. Copia tu archivo GeoJSON a `src/data/`.
2. Añade una entrada al array de `src/data/routes.json` con:
   - `id`, `name`, `difficulty`, etc.
   - `sourceGeoJson`: nombre del archivo GeoJSON
   - `simplificationToleranceMeters`: tolerancia en metros (recomendado 15-25)
### Ejecucion

```bash
npm install
npm run dev
```

### Build

El build compila la app sin regenerar rutas automaticamente:

```bash
npm run build
```

Internamente ejecuta:

1. `tsc -b`
2. `vite build`

## Notas tecnicas

- El generador soporta `LineString` y `MultiLineString`.
- Convierte coordenadas GeoJSON de `[lng, lat]` a `{ lat, lng }`.
- Preserva bifurcaciones como segmentos separados (`pathSegments`) para evitar lineas rectas artificiales entre ramas desconectadas.
- Normaliza POIs para garantizar `position` y `triggerRadius`, manteniendo compatibilidad con `triggerArea`.
