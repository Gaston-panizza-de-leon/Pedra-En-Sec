export interface QuizQuestion {
  question: string;
  answerOptions: Array<{
    text: string;
    isCorrect: boolean;
    rationale: string;
  }>;
}

export const quizQuestions: QuizQuestion[] = [
  {
    question: "¿En qué año fue declarada la técnica de la 'pedra en sec' como Patrimonio Cultural Inmaterial de la Humanidad por la UNESCO?",
    answerOptions: [
      { text: "2018", isCorrect: true, rationale: "Fue reconocida en 2018 como una técnica milenaria compartida por varios países del Mediterráneo." },
      { text: "2010", isCorrect: false, rationale: "" },
      { text: "1995", isCorrect: false, rationale: "" },
      { text: "2021", isCorrect: false, rationale: "" }
    ]
  },
  {
    question: "¿Cuál es la principal característica técnica de la construcción en 'pedra en sec'?",
    answerOptions: [
      { text: "No utiliza ningún tipo de mortero ni cemento", isCorrect: true, rationale: "La técnica se basa exclusivamente en el encaje de las piezas y la gravedad." },
      { text: "Utiliza barro arcilloso para sellar", isCorrect: false, rationale: "" },
      { text: "Las piedras se cortan con láser", isCorrect: false, rationale: "" },
      { text: "Solo usa piedras cúbicas", isCorrect: false, rationale: "" }
    ]
  },
  {
    question: "¿Cómo se llama tradicionalmente al oficio de la persona experta en construir muros de piedra seca?",
    answerOptions: [
      { text: "Margener", isCorrect: true, rationale: "El nombre proviene de los 'marges' (bancales), construcciones típicas para la agricultura en pendiente." },
      { text: "Picapedrer", isCorrect: false, rationale: "" },
      { text: "Mestre d'obres", isCorrect: false, rationale: "" },
      { text: "Pedrer de tall", isCorrect: false, rationale: "" }
    ]
  },
  {
    question: "La ruta GR 221 en Mallorca empieza en Andratx y termina en:",
    answerOptions: [
      { text: "Pollença", isCorrect: true, rationale: "La ruta atraviesa toda la Serra de Tramuntana de suroeste a noreste." },
      { text: "Sóller", isCorrect: false, rationale: "" },
      { text: "Alcúdia", isCorrect: false, rationale: "" },
      { text: "Valldemossa", isCorrect: false, rationale: "" }
    ]
  },
  {
    question: "¿Cuál era la función original del Camí de Cavalls (Menorca) en el siglo XIV?",
    answerOptions: [
      { text: "Defensa y vigilancia de la costa", isCorrect: true, rationale: "Servía para comunicar las torres de vigilancia y desplazar tropas a caballo rápidamente." },
      { text: "Ruta turística", isCorrect: false, rationale: "" },
      { text: "Camino de trashumancia", isCorrect: false, rationale: "" },
      { text: "Transporte de sal", isCorrect: false, rationale: "" }
    ]
  },
  {
    question: "¿Cuál es la longitud total aproximada del Camí de Cavalls (GR 223)?",
    answerOptions: [
      { text: "185 km", isCorrect: true, rationale: "Es el sendero circular que recorre todo el litoral de la isla de Menorca." },
      { text: "90 km", isCorrect: false, rationale: "" },
      { text: "300 km", isCorrect: false, rationale: "" },
      { text: "50 km", isCorrect: false, rationale: "" }
    ]
  },
  {
    question: "El 'Camí de sa Pujada' en Formentera/Ibiza es conocido popularmente como:",
    answerOptions: [
      { text: "Camí Romà", isCorrect: true, rationale: "Se le llama así por su excelente empedrado, aunque su forma actual es del siglo XVIII." },
      { text: "Camí de los Contrabandistas", isCorrect: false, rationale: "" },
      { text: "Camí de s'Arxiduc", isCorrect: false, rationale: "" },
      { text: "Vía de la Plata", isCorrect: false, rationale: "" }
    ]
  },
  {
    question: "¿Qué municipio mallorquín es famoso por sus bancales de piedra seca que caen al mar?",
    answerOptions: [
      { text: "Banyalbufar", isCorrect: true, rationale: "Sus bancales son una de las estampas más icónicas de la ingeniería agrícola mediterránea." },
      { text: "Inca", isCorrect: false, rationale: "" },
      { text: "Llucmajor", isCorrect: false, rationale: "" },
      { text: "Marratxí", isCorrect: false, rationale: "" }
    ]
  },
  {
    question: "¿Qué famoso compositor pasó un invierno en la Cartuja de Valldemossa (GR 221)?",
    answerOptions: [
      { text: "Frédéric Chopin", isCorrect: true, rationale: "Se alojó allí en 1838 junto a George Sand, componiendo parte de sus preludios." },
      { text: "Beethoven", isCorrect: false, rationale: "" },
      { text: "Mozart", isCorrect: false, rationale: "" },
      { text: "Wagner", isCorrect: false, rationale: "" }
    ]
  },
  {
    question: "¿Qué elemento de piedra seca se utiliza para almacenar agua de lluvia?",
    answerOptions: [
      { text: "Aljub", isCorrect: true, rationale: "Los aljibes de piedra seca son esenciales para captar agua en zonas áridas." },
      { text: "Barraca de roder", isCorrect: false, rationale: "" },
      { text: "Claper", isCorrect: false, rationale: "" },
      { text: "Sínia", isCorrect: false, rationale: "" }
    ]
  },
  {
    question: "¿Qué indican los 'fites' (hitos) amontonados en las rutas de montaña?",
    answerOptions: [
      { text: "Señalan el camino correcto", isCorrect: true, rationale: "Son pequeñas pilas de piedras que ayudan al senderista a seguir el trazado donde no es claro." },
      { text: "Mesas para comer", isCorrect: false, rationale: "" },
      { text: "Tesoros enterrados", isCorrect: false, rationale: "" },
      { text: "Límites de propiedad", isCorrect: false, rationale: "" }
    ]
  },
  {
    question: "¿Qué escritor vivió en Deià (Ruta GR 221) y está enterrado allí?",
    answerOptions: [
      { text: "Robert Graves", isCorrect: true, rationale: "El autor de 'Yo, Claudio' hizo de Deià su hogar permanente, atrayendo a muchos otros artistas." },
      { text: "Hemingway", isCorrect: false, rationale: "" },
      { text: "Oscar Wilde", isCorrect: false, rationale: "" },
      { text: "Shakespeare", isCorrect: false, rationale: "" }
    ]
  },
  {
    question: "¿De qué madera se fabrican las puertas tradicionales ('barreres') en los muros de Menorca?",
    answerOptions: [
      { text: "Ullastre (Acebuche)", isCorrect: true, rationale: "Se usa madera de olivo silvestre por su extrema dureza y resistencia a la humedad." },
      { text: "Pino", isCorrect: false, rationale: "" },
      { text: "Roble", isCorrect: false, rationale: "" },
      { text: "Eucalipto", isCorrect: false, rationale: "" }
    ]
  },
  {
    question: "¿En qué municipio empieza oficialmente el kilómetro 0 del Camí de Cavalls?",
    answerOptions: [
      { text: "Mahón (Maó)", isCorrect: true, rationale: "El inicio oficial se sitúa en la capital de Menorca." },
      { text: "Ciutadella", isCorrect: false, rationale: "" },
      { text: "Es Mercadal", isCorrect: false, rationale: "" },
      { text: "Fornells", isCorrect: false, rationale: "" }
    ]
  },
  {
    question: "¿Cuál es el objetivo principal de los bancales en la Serra de Tramuntana?",
    answerOptions: [
      { text: "Prevenir erosión y ganar tierra cultivable", isCorrect: true, rationale: "Transforman laderas imposibles en terrenos planos para olivos, viñas y hortalizas." },
      { text: "Adorno turístico", isCorrect: false, rationale: "" },
      { text: "Base para edificios", isCorrect: false, rationale: "" },
      { text: "Protección contra el viento", isCorrect: false, rationale: "" }
    ]
  }
];
