import fs from 'fs';

function generarRutaUnica(geoJsonOriginal) {
  const features = geoJsonOriginal.features;
  
  // 1. Recolectar TODAS las coordenadas en un solo array maestro
  let coordenadasTotales = [];

  features.forEach(f => {
    if (f.geometry && f.geometry.type === 'LineString') {
      coordenadasTotales.push(...f.geometry.coordinates);
    } else if (f.geometry && f.geometry.type === 'MultiLineString') {
      // Aplanamos los arrays internos de los MultiLineString
      f.geometry.coordinates.forEach(segmento => {
        coordenadasTotales.push(...segmento);
      });
    }
  });

  // 2. Reducir los puntos (Ajusta este número si queda muy "cuadrada")
  const FACTOR_REDUCCION = 100; 
  
  const pathSimplificado = coordenadasTotales
    .filter((coord, index) => {
      // Nos quedamos con 1 de cada N puntos, y el último para cerrar
      return index % FACTOR_REDUCCION === 0 || index === coordenadasTotales.length - 1;
    })
    .map(coord => ({
      lat: coord[1], // Invertimos Longitud/Latitud
      lng: coord[0]
    }));

  // 3. Devolver exactamente la estructura que buscas, limpia y unificada
  return [
    {
      id: "ruta-pedra-sec-unificada",
      name: "Ruta de Pedra en Sec",
      shortDescription: "",
      longDescription: "",
      difficulty: "moderada",
      distanceKm: 0, // Para rellenar a mano
      durationHours: 0, // Para rellenar a mano
      path: pathSimplificado,
      pois: [], // Limpio para que lo llenes tú
      photos: [],
      video: "",
      color: "#4a7c59"
    }
  ];
}

// Ejecución
try {
  const rawData = fs.readFileSync('../data/export.geojson', 'utf8');
  const geojson = JSON.parse(rawData);
  const datosOptimizados = generarRutaUnica(geojson);
  fs.writeFileSync('../data/output.json', JSON.stringify(datosOptimizados, null, 2));
  console.log('✅ Rutas extraídas, simplificadas y guardadas en ../data/output.json');
} catch (error) {
  console.error('❌ Error:', error.message);
}