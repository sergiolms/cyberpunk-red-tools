/* ============================================================
 * Cyberpunk RED — Generador de personajes
 * data.js — Datos de juego extraídos del Manual Básico (ES).
 * Contenido no oficial (Homebrew Content Policy de R. Talsorian).
 * Orden de estadísticas en tablas: INT REF DES TEC FRI VOL SUE MOV TCO EMP
 * ============================================================ */

const CPR = (() => {
  "use strict";

  // -------- Estadísticas principales --------
  const STATS = [
    { key: "int", abbr: "INT", name: "Inteligencia" },
    { key: "ref", abbr: "REF", name: "Reflejos" },
    { key: "des", abbr: "DES", name: "Destreza" },
    { key: "tec", abbr: "TEC", name: "Técnica" },
    { key: "fri", abbr: "FRI", name: "Frialdad" },
    { key: "vol", abbr: "VOL", name: "Voluntad" },
    { key: "sue", abbr: "SUE", name: "Suerte" },
    { key: "mov", abbr: "MOV", name: "Movimiento" },
    { key: "tco", abbr: "TCO", name: "Tipo Corporal" },
    { key: "emp", abbr: "EMP", name: "Empatía" },
  ];
  const STAT_ORDER = ["int", "ref", "des", "tec", "fri", "vol", "sue", "mov", "tco", "emp"];

  // -------- Roles y aptitudes de rol --------
  const ROLES = [
    { key: "arreglador", name: "Arreglador", ability: "Gestión",
      desc: "Consigue artículos del mercado negro y navega las costumbres sociales de la calle. Mantiene redes de contactos y clientes para obtener bienes, favores o información." },
    { key: "ejecutivo", name: "Ejecutivo", ability: "Colaboración",
      desc: "Construye un equipo cuyos miembros le ayudan a alcanzar sus objetivos, con roles encubiertos y recursos corporativos." },
    { key: "mercenario", name: "Mercenario", ability: "Conciencia de combate",
      desc: "Divide los puntos de su aptitud entre habilidades de combate para tener mayor conciencia de la situación en el campo de batalla." },
    { key: "netrunner", name: "Netrunner", ability: "Interface",
      desc: "Realiza «netruns»: interactúa con ciberterminales y controla ordenadores, electrónica y programación asociada." },
    { key: "nomada", name: "Nómada", ability: "Motor",
      desc: "Añade vehículos a su reserva familiar o mejora los actuales cada vez que sube su valor de Motor; conduce cualquier vehículo con gran habilidad." },
    { key: "periodista", name: "Periodista", ability: "Credibilidad",
      desc: "Convence a la audiencia de la verdad de lo que publica y acumula seguidores; capta rumores e información de forma pasiva." },
    { key: "policia", name: "Policía", ability: "Apoyo",
      desc: "Pide ayuda a un grupo de oficiales compañeros, armados y blindados según su rango." },
    { key: "rockero", name: "Rockero", ability: "Impacto carismático",
      desc: "Influye en otros con su personalidad, a través de música, arte o presencia; afecta a grupos cada vez mayores." },
    { key: "tecnico", name: "Técnico", ability: "Manipulación",
      desc: "Arregla, mejora, modifica, fabrica e inventa. Gana especialidades de Manipulación al subir su valor." },
    { key: "tecnomedico", name: "Tecnomédico", ability: "Medicina",
      desc: "Mantiene viva a la gente usando conocimientos, herramientas y entrenamiento; elige especialidades (cirugía, farmacéutica, criosistemas)." },
  ];

  // -------- Tablas de estadísticas de Rata Callejera (1d10) --------
  // Cada fila = INT REF DES TEC FRI VOL SUE MOV TCO EMP
  const STREETRAT_STATS = {
    arreglador: [
      [8,5,7,4,6,5,8,5,5,8],[8,5,5,5,6,7,8,7,5,7],[6,6,6,4,5,6,8,6,3,8],[7,7,5,5,7,6,7,7,5,8],[8,6,6,3,6,5,8,7,5,6],
      [8,7,5,5,6,7,7,5,3,6],[8,6,6,5,6,5,6,7,5,8],[6,6,7,4,7,6,7,7,4,7],[8,7,7,5,5,5,7,6,5,7],[6,5,6,5,5,6,8,6,4,7],
    ],
    ejecutivo: [
      [8,5,5,3,8,6,6,5,5,7],[8,6,6,4,7,6,7,7,5,7],[8,7,6,3,8,6,7,6,4,5],[8,5,7,5,6,5,6,5,5,7],[7,7,6,5,8,5,7,7,5,6],
      [5,7,7,3,6,7,6,5,5,7],[6,6,7,5,8,7,6,7,4,6],[6,7,7,3,7,5,7,5,5,7],[7,6,7,5,7,5,7,6,5,5],[7,7,5,5,8,6,6,7,4,7],
    ],
    mercenario: [
      [6,7,7,3,8,6,5,5,6,5],[7,8,6,3,6,6,7,5,6,6],[5,8,7,4,7,7,6,7,8,5],[5,8,6,4,6,7,6,5,7,6],[6,6,7,5,7,6,7,6,8,4],
      [7,7,6,5,7,6,6,7,7,5],[7,7,6,5,6,7,7,6,6,6],[7,8,7,5,6,6,5,6,8,4],[7,7,6,4,6,6,6,5,6,5],[6,6,8,5,6,6,5,6,6,5],
    ],
    netrunner: [
      [5,8,7,7,7,4,8,7,7,4],[5,6,7,5,8,3,8,7,5,5],[5,6,8,6,6,4,7,6,7,4],[5,7,7,7,7,5,8,6,5,5],[5,8,8,5,7,3,7,5,5,6],
      [6,6,6,7,8,4,7,7,6,6],[6,6,6,7,6,5,7,7,7,6],[5,7,8,6,8,4,8,5,7,4],[7,6,7,7,6,3,6,5,6,5],[7,8,6,6,6,4,7,7,5,6],
    ],
    nomada: [
      [6,6,8,3,6,7,6,6,6,4],[5,7,6,5,8,8,8,7,5,4],[5,8,6,3,8,7,6,5,6,5],[5,8,7,4,8,6,7,7,7,5],[6,6,6,3,6,7,6,7,7,4],
      [7,6,8,4,6,7,6,5,6,5],[6,7,8,4,6,6,7,5,7,5],[5,7,8,3,8,6,7,5,5,5],[6,7,6,4,8,6,6,6,6,6],[5,6,7,4,7,8,7,7,7,4],
    ],
    periodista: [
      [6,6,5,5,8,7,5,7,5,7],[8,7,7,3,6,6,6,5,6,8],[6,7,7,5,6,8,5,5,5,7],[6,5,7,5,6,7,5,5,6,6],[6,6,7,4,8,7,6,7,5,8],
      [7,5,5,4,8,7,6,7,5,8],[8,5,6,3,7,6,6,5,6,7],[6,5,6,5,6,8,6,6,7,8],[7,7,5,4,6,7,6,5,6,7],[7,6,6,3,7,6,7,6,7,6],
    ],
    policia: [
      [5,6,7,5,7,8,5,6,5,6],[6,6,6,5,6,8,5,7,5,5],[5,7,7,7,6,7,5,5,7,6],[6,6,7,6,6,8,5,7,7,6],[6,6,7,6,7,7,6,5,5,6],
      [7,6,5,5,7,8,5,6,7,4],[7,8,7,5,6,8,7,6,5,4],[5,6,6,5,6,8,5,7,6,4],[7,7,5,5,7,7,6,5,5,6],[6,6,5,6,8,7,5,7,6,6],
    ],
    rockero: [
      [7,6,6,5,6,8,7,7,3,8],[3,7,7,7,7,6,7,7,5,8],[4,5,7,7,6,6,7,7,5,8],[4,5,7,7,6,8,7,6,3,8],[3,7,7,7,6,8,6,5,4,7],
      [5,6,7,5,7,8,5,7,3,7],[5,6,6,7,7,8,7,6,3,6],[5,7,7,5,6,6,6,6,4,8],[3,5,5,6,7,8,7,5,5,7],[4,5,6,5,8,8,7,6,4,7],
    ],
    tecnico: [
      [6,7,7,8,4,4,5,5,7,6],[7,6,6,7,5,3,7,7,5,5],[8,6,5,7,5,4,7,7,5,7],[7,8,7,8,4,4,6,5,6,7],[6,6,7,6,4,3,7,7,6,6],
      [8,7,5,6,3,3,7,6,6,7],[8,6,7,8,4,4,7,6,7,6],[8,8,7,8,5,4,6,5,6,6],[6,6,7,8,3,3,5,7,7,7],[8,8,5,6,4,4,6,5,6,6],
    ],
    tecnomedico: [
      [7,5,6,7,5,3,8,5,5,7],[6,7,7,7,4,4,6,7,7,7],[6,5,5,8,5,3,8,5,7,8],[8,7,6,8,3,5,6,6,5,7],[6,7,5,7,5,5,8,7,6,8],
      [8,5,5,8,5,5,6,6,5,6],[8,6,5,8,5,4,8,5,7,7],[6,5,7,7,3,5,8,5,5,8],[6,6,7,7,5,4,6,6,5,6],[8,7,6,6,3,4,8,7,6,7],
    ],
  };

  // -------- Lista maestra de habilidades --------
  // stat = característica vinculada; x2 = coste doble; cat = categoría; pick = requiere especificar
  const SKILLS = [
    // Aprendizaje (INT)
    { name: "Burocracia", stat: "int", cat: "Aprendizaje" },
    { name: "Buscar en bibliotecas", stat: "int", cat: "Aprendizaje" },
    { name: "Ciencia", stat: "int", cat: "Aprendizaje", pick: true },
    { name: "Composición", stat: "int", cat: "Aprendizaje" },
    { name: "Contabilidad", stat: "int", cat: "Aprendizaje" },
    { name: "Criminología", stat: "int", cat: "Aprendizaje" },
    { name: "Criptografía", stat: "int", cat: "Aprendizaje" },
    { name: "Cultura", stat: "int", cat: "Aprendizaje", basic: true },
    { name: "Deducción", stat: "int", cat: "Aprendizaje" },
    { name: "Experto local", stat: "int", cat: "Aprendizaje", basic: true, pick: true },
    { name: "Idioma", stat: "int", cat: "Aprendizaje", pick: true },
    { name: "Juego", stat: "int", cat: "Aprendizaje" },
    { name: "Manejo de animales", stat: "int", cat: "Aprendizaje" },
    { name: "Negocios", stat: "int", cat: "Aprendizaje" },
    { name: "Tácticas", stat: "int", cat: "Aprendizaje" },
    { name: "Supervivencia", stat: "int", cat: "Aprendizaje" },
    // Armas a distancia (REF)
    { name: "Armas cortas", stat: "ref", cat: "Armas a distancia" },
    { name: "Armas largas", stat: "ref", cat: "Armas a distancia" },
    { name: "Armas pesadas", stat: "ref", cat: "Armas a distancia", x2: true },
    { name: "Disparo automático", stat: "ref", cat: "Armas a distancia", x2: true },
    { name: "Tiro con arco", stat: "ref", cat: "Armas a distancia" },
    // Atención
    { name: "Concentración", stat: "vol", cat: "Atención", basic: true },
    { name: "Lectura de labios", stat: "int", cat: "Atención" },
    { name: "Ocultar/Revelar objeto", stat: "int", cat: "Atención" },
    { name: "Percepción", stat: "int", cat: "Atención", basic: true },
    { name: "Rastrear", stat: "int", cat: "Atención" },
    // Control (REF)
    { name: "Conducir vehículo terrestre", stat: "ref", cat: "Control" },
    { name: "Montar", stat: "ref", cat: "Control" },
    { name: "Pilotar vehículo acuático", stat: "ref", cat: "Control" },
    { name: "Pilotar vehículo aéreo", stat: "ref", cat: "Control", x2: true },
    // Corporales
    { name: "Atletismo", stat: "des", cat: "Corporales", basic: true },
    { name: "Baile", stat: "des", cat: "Corporales" },
    { name: "Contorsionismo", stat: "des", cat: "Corporales" },
    { name: "Resistencia", stat: "vol", cat: "Corporales" },
    { name: "Resistir torturas/drogas", stat: "vol", cat: "Corporales" },
    { name: "Sigilo", stat: "des", cat: "Corporales", basic: true },
    // Interpretación
    { name: "Actuar", stat: "fri", cat: "Interpretación" },
    { name: "Tocar instrumento", stat: "tec", cat: "Interpretación", pick: true },
    // Lucha (DES)
    { name: "Arma cuerpo a cuerpo", stat: "des", cat: "Lucha" },
    { name: "Artes marciales", stat: "des", cat: "Lucha", x2: true, pick: true },
    { name: "Evasión", stat: "des", cat: "Lucha", basic: true },
    { name: "Pelea", stat: "des", cat: "Lucha", basic: true },
    // Sociales
    { name: "Arreglo personal", stat: "fri", cat: "Sociales" },
    { name: "Comerciar", stat: "fri", cat: "Sociales" },
    { name: "Conocimiento de la calle", stat: "fri", cat: "Sociales" },
    { name: "Conversación", stat: "emp", cat: "Sociales", basic: true },
    { name: "Interrogatorio", stat: "fri", cat: "Sociales" },
    { name: "Percepción humana", stat: "emp", cat: "Sociales", basic: true },
    { name: "Persuasión", stat: "fri", cat: "Sociales", basic: true },
    { name: "Sobornar", stat: "fri", cat: "Sociales" },
    { name: "Vestuario y estilo", stat: "fri", cat: "Sociales" },
    // Técnicas (TEC)
    { name: "Abrir cerraduras", stat: "tec", cat: "Técnicas" },
    { name: "Cibertecnología", stat: "tec", cat: "Técnicas" },
    { name: "Demoliciones", stat: "tec", cat: "Técnicas", x2: true },
    { name: "Electrónica/Seguridad", stat: "tec", cat: "Técnicas", x2: true },
    { name: "Enfermería", stat: "tec", cat: "Técnicas", x2: true },
    { name: "Falsificación", stat: "tec", cat: "Técnicas" },
    { name: "Fotografía/Filmación", stat: "tec", cat: "Técnicas" },
    { name: "Mecánica básica", stat: "tec", cat: "Técnicas" },
    { name: "Mecánica de armas", stat: "tec", cat: "Técnicas" },
    { name: "Mecánica de vehículos acuáticos", stat: "tec", cat: "Técnicas" },
    { name: "Mecánica de vehículos aéreos", stat: "tec", cat: "Técnicas" },
    { name: "Mecánica de vehículos terrestres", stat: "tec", cat: "Técnicas" },
    { name: "Pintar/Dibujar/Esculpir", stat: "tec", cat: "Técnicas" },
    { name: "Primeros auxilios", stat: "tec", cat: "Técnicas", basic: true },
    { name: "Robar bolsillos", stat: "tec", cat: "Técnicas" },
  ];

  // Habilidades básicas obligatorias (mínimo 2). "Idioma (jerga callejera)" es básica.
  const BASIC_SKILLS = [
    "Atletismo", "Concentración", "Conversación", "Cultura", "Evasión",
    "Experto local", "Idioma (jerga callejera)", "Pelea", "Percepción",
    "Percepción humana", "Persuasión", "Primeros auxilios", "Sigilo",
  ];

  // -------- Paquetes de habilidades de Rata Callejera por rol (nombre: nivel) --------
  const STREETRAT_SKILLS = {
    arreglador: { "Atletismo":2,"Concentración":2,"Conversación":6,"Cultura":2,"Evasión":6,"Experto local (tu hogar)":6,"Idioma (jerga callejera)":4,"Pelea":2,"Percepción":2,"Percepción humana":6,"Persuasión":4,"Primeros auxilios":2,"Sigilo":2,"Abrir cerraduras":4,"Armas cortas":6,"Comerciar":6,"Conocimiento de la calle":6,"Falsificación":6,"Negocios":6,"Sobornar":6 },
    ejecutivo: { "Atletismo":2,"Concentración":2,"Conversación":6,"Cultura":6,"Evasión":6,"Experto local (tu hogar)":2,"Idioma (jerga callejera)":2,"Pelea":2,"Percepción":2,"Percepción humana":6,"Persuasión":6,"Primeros auxilios":2,"Sigilo":2,"Armas cortas":6,"Arreglo personal":4,"Burocracia":6,"Contabilidad":6,"Deducción":6,"Lectura de labios":6,"Negocios":6 },
    mercenario: { "Atletismo":2,"Concentración":2,"Conversación":2,"Cultura":2,"Evasión":6,"Experto local (tu hogar)":2,"Idioma (jerga callejera)":2,"Pelea":2,"Percepción":6,"Percepción humana":2,"Persuasión":2,"Primeros auxilios":6,"Sigilo":2,"Arma cuerpo a cuerpo":6,"Armas cortas":6,"Armas largas":6,"Disparo automático":6,"Interrogatorio":6,"Resistir torturas/drogas":6,"Tácticas":6 },
    netrunner: { "Atletismo":2,"Concentración":2,"Conversación":2,"Cultura":6,"Evasión":6,"Experto local (tu hogar)":2,"Idioma (jerga callejera)":2,"Pelea":2,"Percepción":2,"Percepción humana":2,"Persuasión":2,"Primeros auxilios":2,"Sigilo":6,"Armas cortas":6,"Buscar en bibliotecas":6,"Cibertecnología":6,"Criptografía":6,"Electrónica/Seguridad":6,"Mecánica básica":6,"Ocultar/Revelar objeto":6 },
    nomada: { "Atletismo":2,"Concentración":2,"Conversación":2,"Cultura":2,"Evasión":6,"Experto local (tu hogar)":2,"Idioma (jerga callejera)":2,"Pelea":6,"Percepción":4,"Percepción humana":2,"Persuasión":2,"Primeros auxilios":6,"Sigilo":6,"Arma cuerpo a cuerpo":6,"Armas cortas":6,"Comerciar":6,"Conducir vehículo terrestre":6,"Manejo de animales":6,"Rastrear":6,"Supervivencia":6 },
    periodista: { "Atletismo":2,"Concentración":2,"Conversación":6,"Cultura":2,"Evasión":6,"Experto local (tu hogar)":6,"Idioma (jerga callejera)":2,"Pelea":2,"Percepción":6,"Percepción humana":6,"Persuasión":6,"Primeros auxilios":2,"Sigilo":2,"Armas cortas":6,"Buscar en bibliotecas":4,"Composición":6,"Deducción":6,"Fotografía/Filmación":4,"Lectura de labios":4,"Sobornar":6 },
    policia: { "Atletismo":2,"Concentración":2,"Conversación":6,"Cultura":2,"Evasión":6,"Experto local (tu hogar)":2,"Idioma (jerga callejera)":2,"Pelea":6,"Percepción":2,"Percepción humana":2,"Persuasión":2,"Primeros auxilios":2,"Sigilo":2,"Armas cortas":6,"Armas largas":6,"Criminología":6,"Deducción":6,"Disparo automático":6,"Interrogatorio":6,"Rastrear":6 },
    rockero: { "Atletismo":2,"Concentración":2,"Conversación":2,"Cultura":2,"Evasión":6,"Experto local (tu hogar)":4,"Idioma (jerga callejera)":2,"Pelea":6,"Percepción":2,"Percepción humana":6,"Persuasión":6,"Primeros auxilios":6,"Sigilo":2,"Arma cuerpo a cuerpo":6,"Armas cortas":6,"Arreglo personal":4,"Composición":6,"Conocimiento de la calle":6,"Tocar instrumento (elige 1)":6,"Vestuario y estilo":4 },
    tecnico: { "Atletismo":2,"Concentración":2,"Conversación":2,"Cultura":6,"Evasión":6,"Experto local (tu hogar)":2,"Idioma (jerga callejera)":2,"Pelea":2,"Percepción":2,"Percepción humana":2,"Persuasión":2,"Primeros auxilios":6,"Sigilo":2,"Armas largas":6,"Cibertecnología":6,"Ciencia (elige 1)":6,"Electrónica/Seguridad":6,"Mecánica básica":6,"Mecánica de armas":6,"Mecánica de vehículos terrestres":6 },
    tecnomedico: { "Atletismo":2,"Concentración":2,"Conversación":6,"Cultura":6,"Evasión":6,"Experto local (tu hogar)":2,"Idioma (jerga callejera)":2,"Pelea":2,"Percepción":2,"Percepción humana":6,"Persuasión":2,"Primeros auxilios":2,"Sigilo":2,"Armas largas":6,"Cibertecnología":4,"Ciencia (elige 1)":6,"Deducción":6,"Enfermería":6,"Mecánica básica":6,"Resistir torturas/drogas":4 },
  };

  // -------- Equipo inicial por rol (Rata Callejera / Edgerunner) --------
  const STARTING_GEAR = {
    arreglador: {
      weapons: ["Pistola pesada o pistola muy pesada", "Pistola pesada o pistola muy pesada", "Arma cuerpo a cuerpo ligera", "Munición básica de pistola P x100 (o MP x100)", "Blindaje ligero en el cuerpo (CP11)", "Blindaje ligero en la cabeza (CP11)"],
      gear: ["Agente", "Detector de micrófonos", "Ordenador", "Teléfono móvil desechable x2", "Ropa normal elegante: lentes de contacto, joyas", "Ropa de deporte: gafas espejadas", "Tendencias urbanas: calzado, chaqueta, parte de abajo, parte de arriba"],
    },
    ejecutivo: {
      weapons: ["Pistola muy pesada", "Munición básica de pistola MP x50", "Blindaje ligero en el cuerpo (CP11)", "Blindaje ligero en la cabeza (CP11)"],
      gear: ["Comunicador de radio x4", "Codificador/Descodificador", "Ropa de negocios: calzado, chaqueta, parte de abajo, gafas espejadas, parte de arriba, joyas x2"],
    },
    mercenario: {
      weapons: ["Fusil de asalto", "Pistola muy pesada", "Arma cuerpo a cuerpo pesada o escudo antibalas", "Munición básica de pistola MP x30", "Munición básica de fusil x70", "Blindaje ligero en el cuerpo (CP11)", "Blindaje ligero en la cabeza (CP11)"],
      gear: ["Agente", "Ropa de deporte: calzado x2, chaqueta x3, gafas espejadas, parte de abajo x2, parte de arriba x2"],
    },
    netrunner: {
      weapons: ["Pistola muy pesada", "Munición básica de pistola MP x30", "Blindaje ligero en el cuerpo (CP11)", "Blindaje ligero en la cabeza (CP11)"],
      gear: ["Agente", "Ciberterminal (7 ranuras)", "Gafas de realidad virtual", "Programa: Armadura", "Programa: Espada", "Programa: Te veo o Borrado", "Programa: Espada o Vrizzbolt", "Programa: Gusano o Espada", "Ropa normal elegante: parte de arriba x10", "Ropa de deporte: calzado x2, joyas, parte de abajo x2", "Tendencias urbanas: chaqueta"],
    },
    nomada: {
      weapons: ["Pistola pesada o pistola muy pesada", "Munición básica de pistola P x100 (o MP x100)", "Arma cuerpo a cuerpo pesada o pistola pesada", "Blindaje ligero en el cuerpo (CP11)", "Blindaje ligero en la cabeza (CP11)"],
      gear: ["Agente", "Máscara respiratoria antismog", "Cinta adhesiva", "Linterna", "Pistola de garfio", "Cama hinchable y saco de dormir", "Bolsa de tecnomédico", "Comunicador de radio x2", "Cuerda", "Tecnoherramienta", "Tienda y material de acampada", "Ropa bohemia: joyas", "Cuero nómada: parte de arriba x4, parte de abajo x2, calzado x2, chaqueta, sombrero"],
    },
    periodista: {
      weapons: ["Pistola pesada o pistola muy pesada", "Munición básica de pistola P x50 (o MP x50)", "Blindaje ligero en el cuerpo (CP11)", "Blindaje ligero en la cabeza (CP11)"],
      gear: ["Agente", "Grabadora de audio", "Binoculares", "Teléfono móvil desechable x2 o pistola de garfio", "Linterna", "Ordenador", "Escáner de radio/Reproductor de música", "Codificador/Descodificador", "Cámara de vídeo", "Ropa normal elegante: calzado, parte de abajo, parte de arriba", "Ropa de deporte: chaqueta", "Tendencias urbanas: gafas espejadas"],
    },
    policia: {
      weapons: ["Fusil de asalto o escopeta", "Pistola pesada", "Munición básica de fusil x100 (o cartucho de escopeta x100 o escopeta x100)", "Munición básica de pistola P x30", "Escudo antibalas o granada de humo x2", "Blindaje ligero en el cuerpo (CP11)", "Blindaje ligero en la cabeza (CP11)"],
      gear: ["Agente", "Linterna", "Esposas o grilletes x2", "Comunicador de radio", "Bengala de carretera x10", "Ropa normal elegante: chaqueta, parte de abajo x2, parte de arriba x3", "Ropa de deporte: calzado x2, chaqueta x2, parte de abajo x2, gafas espejadas, parte de arriba x2"],
    },
    rockero: {
      weapons: ["Pistola muy pesada", "Munición básica de pistola MP x50", "Arma cuerpo a cuerpo pesada o granada cegadora", "Granada de gas lacrimógeno x2", "Blindaje ligero en el cuerpo (CP11)", "Blindaje ligero en la cabeza (CP11)"],
      gear: ["Agente", "Ordenador", "Guitarra eléctrica o detector de micrófonos", "Pintura luminosa x5", "Amplificador de bolsillo", "Escáner de radio/Reproductor de música", "Cámara de vídeo", "Ropa normal elegante: chaqueta, joyas x3, parte de arriba x4", "Ropa de deporte: joyas, gafas espejadas, calzado", "Tendencias urbanas: parte de abajo, parte de arriba"],
    },
    tecnico: {
      weapons: ["Escopeta o fusil de asalto", "Munición básica de cartucho de escopeta x100 (o fusil x100)", "Granada cegadora", "Blindaje ligero en el cuerpo (CP11)", "Blindaje ligero en la cabeza (CP11)"],
      gear: ["Agente", "Máscara respiratoria antismog", "Teléfono móvil desechable", "Cinta adhesiva x5", "Linterna", "Bengala de carretera x6", "Bolsa de técnico", "Ropa normal elegante: parte de abajo x8, parte de arriba x10", "Ropa de deporte: calzado x2"],
    },
    tecnomedico: {
      weapons: ["Escopeta o fusil de asalto", "Munición básica de cartucho de escopeta x100 (o fusil x100)", "Munición de cartucho de escopeta incendiario x10 (o fusil incendiaria x10)", "Granada de humo x2", "Blindaje ligero en el cuerpo (CP11)", "Blindaje ligero en la cabeza (CP11)", "Escudo antibalas"],
      gear: ["Agente", "Jeringa de aire comprimido", "Esposas o grilletes", "Linterna", "Ropa normal elegante: chaqueta x3", "Pintura luminosa", "Bolsa de tecnomédico", "Ropa de deporte: calzado, parte de abajo x3, parte de arriba x5"],
    },
  };

  // -------- Ciberware inicial por rol (Rata Callejera / Edgerunner) --------
  // En «X o Y» se asigna la primera opción (todo editable). Paquete Completo compra por separado.
  const STARTING_CYBER = {
    arreglador: [
      { name: "Agente interno", cat: "Ciberaudio", ph: "3 (1d6)" },
      { name: "Analizador de voz", cat: "Ciberaudio", ph: "3 (1d6)" },
      { name: "Bolsillo subcutáneo", cat: "Ciberequipo externo", ph: "3 (1d6)" },
      { name: "Equipo de ciberaudio (básico)", cat: "Ciberaudio", ph: "7 (2d6)" },
    ],
    ejecutivo: [
      { name: "Agente interno", cat: "Ciberaudio", ph: "3 (1d6)" },
      { name: "Antitoxinas", cat: "Ciberequipo interno", ph: "2 (1d6/2)" },
      { name: "Biomonitor", cat: "Cibermoda", ph: "0" },
      { name: "Equipo de ciberaudio (básico)", cat: "Ciberaudio", ph: "7 (2d6)" },
    ],
    mercenario: [
      { name: "Biomonitor", cat: "Cibermoda", ph: "0" },
      { name: "Sandevistan (cibervelocidad)", cat: "Equipo neuronal", ph: "7 (2d6)" },
      { name: "Conexión neuronal (básico)", cat: "Equipo neuronal", ph: "7 (2d6)" },
    ],
    netrunner: [
      { name: "Conectores interface", cat: "Equipo neuronal", ph: "7 (2d6)" },
      { name: "Conexión neuronal (básico)", cat: "Equipo neuronal", ph: "7 (2d6)" },
      { name: "Lentes cambiantes", cat: "Cibermoda", ph: "0" },
    ],
    nomada: [
      { name: "Conectores interface", cat: "Equipo neuronal", ph: "7 (2d6)" },
      { name: "Conexión neuronal (básico)", cat: "Equipo neuronal", ph: "7 (2d6)" },
    ],
    periodista: [
      { name: "Equipo de ciberaudio (básico)", cat: "Ciberaudio", ph: "7 (2d6)" },
      { name: "Escucha amplificada", cat: "Ciberaudio", ph: "3 (1d6)" },
      { name: "Tatuaje luminoso", cat: "Cibermoda", ph: "0" },
    ],
    policia: [
      { name: "Bolsillo subcutáneo", cat: "Ciberequipo externo", ph: "3 (1d6)" },
      { name: "Pistolera oculta", cat: "Ciberequipo externo", ph: "7 (2d6)" },
    ],
    rockero: [
      { name: "Equipo de ciberaudio (básico)", cat: "Ciberaudio", ph: "7 (2d6)" },
      { name: "Grabadora de audio", cat: "Ciberaudio", ph: "2 (1d6/2)" },
      { name: "Quimipiel", cat: "Cibermoda", ph: "0" },
      { name: "Tecnopelo", cat: "Cibermoda", ph: "0" },
    ],
    tecnico: [
      { name: "Ciberojo (básico)", cat: "Ciberópticos", ph: "7 (2d6)" },
      { name: "Mano con herramientas", cat: "Cibermiembros", ph: "3 (1d6)" },
      { name: "Microópticos", cat: "Ciberópticos", ph: "2 (1d6/2)" },
      { name: "Reloj subcutáneo", cat: "Cibermoda", ph: "0" },
    ],
    tecnomedico: [
      { name: "Amplificador de imagen", cat: "Ciberópticos", ph: "3 (1d6)" },
      { name: "Biomonitor", cat: "Cibermoda", ph: "0" },
      { name: "Ciberojo (básico)", cat: "Ciberópticos", ph: "7 (2d6)" },
      { name: "Antitoxinas", cat: "Ciberequipo interno", ph: "2 (1d6/2)" },
    ],
  };

  // -------- Armas --------
  const WEAPONS_MELEE = [
    { name: "Arma cuerpo a cuerpo ligera", dmg: "1d6", cdt: 2, hands: "1", hide: "Sí", cost: "50ed (costoso)", ej: "Cuchillo de combate, tomahawk" },
    { name: "Arma cuerpo a cuerpo mediana", dmg: "2d6", cdt: 2, hands: "1-2", hide: "No", cost: "50ed (costoso)", ej: "Bate de béisbol, palanqueta, machete" },
    { name: "Arma cuerpo a cuerpo pesada", dmg: "3d6", cdt: 2, hands: "2", hide: "No", cost: "100ed (superior)", ej: "Tubería de plomo, espada, bate con clavos" },
    { name: "Arma cuerpo a cuerpo muy pesada", dmg: "4d6", cdt: 1, hands: "2", hide: "No", cost: "500ed (caro)", ej: "Motosierra, almádena, naginata" },
  ];
  const WEAPONS_RANGED = [
    { name: "Pistola mediana", skill: "Armas cortas", dmg: "2d6", mag: "12 (Pistola M)", cdt: 2, hands: "1", hide: "Sí", cost: "50ed (costoso)", special: "—" },
    { name: "Pistola pesada", skill: "Armas cortas", dmg: "3d6", mag: "8 (Pistola P)", cdt: 2, hands: "1", hide: "Sí", cost: "100ed (superior)", special: "—" },
    { name: "Pistola muy pesada", skill: "Armas cortas", dmg: "4d6", mag: "8 (Pistola MP)", cdt: 1, hands: "1", hide: "No", cost: "100ed (superior)", special: "—" },
    { name: "Subfusil", skill: "Armas cortas", dmg: "2d6", mag: "30 (Pistola M)", cdt: 1, hands: "1", hide: "Sí", cost: "100ed (superior)", special: "Disparo automático (3) · fuego de supresión" },
    { name: "Subfusil pesado", skill: "Armas cortas", dmg: "3d6", mag: "40 (Pistola P)", cdt: 1, hands: "1", hide: "No", cost: "100ed (superior)", special: "Disparo automático (3) · fuego de supresión" },
    { name: "Escopeta", skill: "Armas largas", dmg: "5d6", mag: "4 (Escopeta)", cdt: 1, hands: "2", hide: "No", cost: "500ed (caro)", special: "Cartuchos de escopeta" },
    { name: "Fusil de asalto", skill: "Armas largas", dmg: "5d6", mag: "25 (Fusil)", cdt: 1, hands: "2", hide: "No", cost: "500ed (caro)", special: "Disparo automático (4) · fuego de supresión" },
    { name: "Fusil de francotirador", skill: "Armas largas", dmg: "5d6", mag: "4 (Fusil)", cdt: 1, hands: "2", hide: "No", cost: "500ed (caro)", special: "—" },
    { name: "Arcos y ballestas", skill: "Tiro con arco", dmg: "4d6", mag: "N/A (Flecha)", cdt: 1, hands: "2", hide: "No", cost: "100ed (superior)", special: "Flechas" },
    { name: "Lanzagranadas", skill: "Armas pesadas", dmg: "6d6", mag: "2 (Granada)", cdt: 1, hands: "2", hide: "No", cost: "500ed (caro)", special: "Explosivo" },
    { name: "Lanzamisiles", skill: "Armas pesadas", dmg: "8d6", mag: "1 (Misil)", cdt: 1, hands: "2", hide: "No", cost: "500ed (caro)", special: "Explosivo" },
  ];
  const WEAPONS_EXOTIC = [
    { name: "Acelerador Rhinemetall EMG-86", desc: "Fusil de asalto que ignora armadura inferior a CP11. Se dispara con Armas pesadas. Requiere TCO 11+.", cost: "5.000ed (lujoso)" },
    { name: "Arma de asalto Hurricane (Constitution Arms)", desc: "Escopeta con CdT 2. Requiere TCO 11+.", cost: "5.000ed (lujoso)" },
    { name: "Guante de combate", desc: "Guante pesado. Contiene tres ranuras para ciberbrazo/cibermiembro.", cost: "1.000ed (muy caro)" },
    { name: "Kendachi Mono-tres", desc: "Arma c/c muy pesada a dos manos. Ignora armadura inferior a CP11.", cost: "5.000ed (lujoso)" },
    { name: "Lanzadardos", desc: "Pistola mediana que dispara flechas no básicas.", cost: "100ed (superior)" },
    { name: "Lanzagranadas Militech «Cowboy» U-56", desc: "Lanzagranadas con CdT 2. Requiere TCO 11+.", cost: "5.000ed (lujoso)" },
    { name: "Lanzallamas", desc: "Escopeta que dispara cartuchos incendiarios. Se dispara con Armas pesadas.", cost: "500ed (caro)" },
    { name: "Malorian Arms 3516", desc: "Pistola muy pesada de calidad excelente (la de Johnny Silverhand). 5d6 de daño.", cost: "10.000ed (muy lujoso)" },
    { name: "Pistola aturdidora", desc: "Pistola pesada «menos letal».", cost: "100ed (superior)" },
    { name: "Pistola de aire", desc: "Pistola mediana que dispara bolas de pintura (¡y de ácido!).", cost: "100ed (superior)" },
    { name: "Pistola de microondas", desc: "Pistola muy pesada que puede desconectar ciberequipo y electrónica.", cost: "500ed (caro)" },
    { name: "Pistola sónica", desc: "Pistola muy pesada que causa la herida crítica oído dañado.", cost: "500ed (caro)" },
    { name: "Porra aturdidora", desc: "Arma c/c mediana «menos letal».", cost: "100ed (superior)" },
    { name: "Tsunami Arms Helix", desc: "Fusil de asalto que solo dispara en automático (multiplicador más alto). Requiere TCO 11+.", cost: "5.000ed (lujoso)" },
  ];

  // -------- Blindaje --------
  const ARMOR = [
    { name: "Cuero", cp: 4, penalty: "Ninguna", cost: "20ed (asequible)", desc: "Preferido por nómadas y punks en moto." },
    { name: "Kevlar®", cp: 7, penalty: "Ninguna", cost: "50ed (costoso)", desc: "Ropa, chalecos, chaquetas, trajes de negocios e incluso bikinis." },
    { name: "Blindaje ligero", cp: 11, penalty: "Ninguna", cost: "100ed (superior)", desc: "Kevlar® y membranas de plástico en la trama del tejido." },
    { name: "Traje Bodyweight", cp: 11, penalty: "Ninguna", cost: "1.000ed (muy caro)", desc: "Gel de blindaje sinterizado; alberga ciberterminal y conectores de interfaz." },
    { name: "Blindaje mediano", cp: 12, penalty: "-2 REF, DES y MOV", cost: "100ed (superior)", desc: "Revestimiento de plástico sólido reforzado con Kevlar®." },
    { name: "Blindaje pesado", cp: 13, penalty: "-2 REF, DES y MOV", cost: "500ed (caro)", desc: "Kevlar® de alta densidad y capas de tejido y plástico." },
    { name: "Flak", cp: 15, penalty: "-4 REF, DES y MOV", cost: "500ed (caro)", desc: "Versión del s.XXI del chaleco y pantalones flak." },
    { name: "Metalgear®", cp: 18, penalty: "-4 REF, DES y MOV", cost: "5.000ed (lujoso)", desc: "Detiene casi cualquier cosa, pero te hace fácil de acertar." },
    { name: "Escudo antibalas", cp: "10 PD", penalty: "Ocupa un brazo", cost: "100ed (superior)", desc: "Escudo de policarbonato transparente; los PD se reducen con el daño." },
  ];

  // -------- Equipo general --------
  const GEAR = [
    { name: "Agente", cost: "100ed (superior)", desc: "Teléfono inteligente con IA. +2 Buscar en bibliotecas; +2 Vestuario y estilo en algunas circunstancias." },
    { name: "Amplificador de bolsillo", cost: "50ed (costoso)", desc: "Hasta dos instrumentos. 6 h por carga." },
    { name: "Analizador químico", cost: "1.000ed (muy caro)", desc: "Compara la composición química de una sustancia con una base de datos." },
    { name: "Bastón luminoso", cost: "10ed (barato)", desc: "Ilumina hasta 4 m. 10 h." },
    { name: "Bengala de carretera", cost: "10ed (barato)", desc: "Ilumina 100 m durante 1 h." },
    { name: "Binoculares", cost: "50ed (costoso)", desc: "Aumento x2 o x3." },
    { name: "Bolsa de técnico", cost: "500ed (caro)", desc: "Kit de herramientas para reparar." },
    { name: "Bolsa de tecnomédico", cost: "100ed (superior)", desc: "Kit de herramientas médicas." },
    { name: "Bolsa de viaje", cost: "20ed (asequible)", desc: "Para llevar cosas." },
    { name: "Cama hinchable y saco de dormir", cost: "20ed (asequible)", desc: "Colchón autohinchable con saco." },
    { name: "Cámara de vídeo", cost: "100ed (superior)", desc: "Graba 12 h de audio y vídeo en un chip." },
    { name: "Chip de memoria", cost: "10ed (barato)", desc: "Almacenamiento de datos estándar." },
    { name: "Ciberterminal", cost: "500ed (caro)", desc: "Terminal básico para netrunning. 7 ranuras." },
    { name: "Cinta adhesiva", cost: "20ed (asequible)", desc: "En muchos colores, uno brilla en la oscuridad." },
    { name: "Codificador/Descodificador", cost: "500ed (caro)", desc: "Codifica/descodifica comunicaciones." },
    { name: "Comunicador de radio", cost: "100ed (superior)", desc: "Auricular. Alcance 1,5 km." },
    { name: "Cuerda (60 m)", cost: "20ed (asequible)", desc: "Cuerda de nylon." },
    { name: "Detector de micrófonos", cost: "500ed (caro)", desc: "Pita a menos de 2 m de un dispositivo de escucha." },
    { name: "Detector de radares", cost: "500ed (caro)", desc: "Pita a menos de 100 m de un haz de radar activo." },
    { name: "Escáner de radio/Reproductor de música", cost: "50ed (costoso)", desc: "Música o emisoras en 1,5 km." },
    { name: "Escáner médico", cost: "1.000ed (muy caro)", desc: "+2 Primeros auxilios y Enfermería." },
    { name: "Escáner técnico", cost: "1.000ed (muy caro)", desc: "+2 a varias habilidades basadas en TEC." },
    { name: "Esposas o grilletes", cost: "50ed (costoso)", desc: "Romperlas requiere TCO >10." },
    { name: "Gafas de realidad virtual", cost: "100ed (superior)", desc: "Proyecta el ciberespacio sobre la vista real." },
    { name: "Gafas inteligentes", cost: "500ed (caro)", desc: "2 ranuras para opciones cibernéticas." },
    { name: "Ganzúas", cost: "20ed (asequible)", desc: "Para forzar cerraduras mecánicas." },
    { name: "Grabadora de audio", cost: "100ed (superior)", desc: "Graba 24 h de sonido en un chip." },
    { name: "Guitarra eléctrica/Otro instrumento", cost: "500ed (caro)", desc: "Las versiones eléctricas necesitan amplificador." },
    { name: "Jeringa de aire comprimido", cost: "50ed (costoso)", desc: "Administración de medicamentos." },
    { name: "Kit de higiene personal", cost: "20ed (asequible)", desc: "Para la higiene." },
    { name: "Linterna", cost: "20ed (asequible)", desc: "Haz de 100 m. 10 h." },
    { name: "Máscara respiratoria antismog", cost: "20ed (asequible)", desc: "Filtra toxinas del aire." },
    { name: "Ordenador", cost: "50ed (costoso)", desc: "Portátil o de sobremesa." },
    { name: "Pistola de garfio", cost: "100ed (superior)", desc: "Dispara cuerda con garfio hasta 30 m. No es arma." },
    { name: "Rastreador", cost: "500ed (caro)", desc: "Sigue un rastreador vinculado hasta 1,5 km." },
    { name: "Tecnoherramienta", cost: "100ed (superior)", desc: "Multiherramienta todo en uno." },
    { name: "Teléfono móvil desechable", cost: "50ed (costoso)", desc: "Fácil de deshacerse de él." },
    { name: "Tienda y material de acampada", cost: "50ed (costoso)", desc: "Equipo de acampada para una persona." },
    { name: "Traje contra la radiación", cost: "1.000ed (muy caro)", desc: "Protege de la radiación." },
    { name: "Vial de biotoxina", cost: "500ed (caro)", desc: "3d6 de daño. Resistir torturas/drogas. La armadura aplica." },
    { name: "Vial de veneno", cost: "100ed (superior)", desc: "2d6 de daño. Resistir torturas/drogas. La armadura NO aplica." },
    { name: "Visor de danza cerebral", cost: "1.000ed (muy caro)", desc: "Permite experimentar la danza cerebral." },
  ];

  // -------- Ciberware (por categoría). PH = pérdida de Humanidad --------
  const CYBERWARE = {
    "Cibermoda": [
      { name: "Biomonitor", cost: "100ed", ph: "0", desc: "Lectura de constantes vitales. Vincula con el agente." },
      { name: "Hebras PEM", cost: "10ed", ph: "0", desc: "Finas líneas plateadas como circuitos." },
      { name: "Lentes cambiantes", cost: "100ed", ph: "0", desc: "Lentes que cambian de color." },
      { name: "Quimipiel", cost: "100ed", ph: "0", desc: "Cambia el tono de piel. +2 Arreglo personal con tecnopelo." },
      { name: "Reloj subcutáneo", cost: "100ed", ph: "0", desc: "Reloj LED implantado." },
      { name: "Tatuaje luminoso", cost: "100ed", ph: "0", desc: "Tatuajes de colores. +2 Vestuario y estilo con 3+." },
      { name: "Tecnopelo", cost: "100ed", ph: "0", desc: "Pelo que emite luz. +2 Arreglo personal con quimipiel." },
    ],
    "Equipo neuronal": [
      { name: "Conexión neuronal (básico)", cost: "500ed", ph: "7 (2d6)", desc: "Necesario para equipo neuronal. 5 ranuras de opciones." },
      { name: "Amplificador olfativo", cost: "100ed", ph: "7 (2d6)", desc: "Rastrear por olfato. Requiere zócalo para chips." },
      { name: "Amplificador táctil", cost: "100ed", ph: "7 (2d6)", desc: "Detecta movimiento en 20 m tocando una superficie." },
      { name: "Analizador químico", cost: "500ed", ph: "3 (1d6)", desc: "Comprueba composición química. Requiere zócalo." },
      { name: "Chip de habilidad", cost: "500ed/1000ed", ph: "7 (2d6)", desc: "Una habilidad a nivel 3. Requiere zócalo." },
      { name: "Chip de memoria", cost: "10ed", ph: "0", desc: "Almacenamiento de datos." },
      { name: "Conectores interface", cost: "500ed", ph: "7 (2d6)", desc: "Conectarse a máquinas. Requiere conexión neuronal." },
      { name: "Editor de dolor", cost: "1000ed", ph: "14 (4d6)", desc: "Ignora penalizaciones por Gravemente herido." },
      { name: "Grabadora de danza cerebral", cost: "500ed", ph: "7 (2d6)", desc: "Registra experiencias en chip o dispositivo." },
      { name: "Kerenzikov (cibervelocidad)", cost: "500ed", ph: "14 (4d6)", desc: "+2 iniciativa. Solo 1 cibervelocidad." },
      { name: "Sandevistan (cibervelocidad)", cost: "500ed", ph: "7 (2d6)", desc: "+3 iniciativa 1 min (acción). Solo 1 cibervelocidad." },
      { name: "Zócalo para chips", cost: "500ed", ph: "7 (2d6)", desc: "Requerido para chipware. En la nuca." },
    ],
    "Ciberópticos": [
      { name: "Ciberojo (básico)", cost: "100ed", ph: "7 (2d6)", desc: "Ojo artificial. 3 ranuras de opciones." },
      { name: "Amplificador de imagen", cost: "500ed", ph: "3 (1d6)", desc: "Ver a 800 m. +1 precisión a 51 m+." },
      { name: "Cambio de color", cost: "100ed", ph: "2 (1d6/2)", desc: "Color y patrones ilimitados del ojo." },
      { name: "Detector de radiación", cost: "1000ed", ph: "3 (1d6)", desc: "Radiación a 100 m (resplandor azul)." },
      { name: "Lanzadardos", cost: "500ed", ph: "2 (1d6/2)", desc: "Arma exótica oculta en el ojo. Ocupa 3 ranuras." },
      { name: "Luz tenue/Infrarrojos/Ultravioletas", cost: "500ed", ph: "3 (1d6)", desc: "Ignora oscuridad, humo, niebla. Dos ciberojos." },
      { name: "Mejora de imagen", cost: "500ed", ph: "3 (1d6)", desc: "+2 Percepción, Lectura de labios, Ocultar/Revelar. Dos ciberojos." },
      { name: "Microópticos", cost: "100ed", ph: "2 (1d6/2)", desc: "Aumento de 400x." },
      { name: "Microvídeo", cost: "500ed", ph: "2 (1d6/2)", desc: "Cámara en el ojo. Ocupa 2 ranuras." },
      { name: "Protección antideslumbrante", cost: "100ed", ph: "2 (1d6/2)", desc: "Inmune a destellos de luz. Dos ciberojos." },
      { name: "Sistema de puntería", cost: "500ed", ph: "3 (1d6)", desc: "+1 a tiros de precisión." },
      { name: "Subpantalla", cost: "100ed", ph: "2 (1d6/2)", desc: "Proyecta imágenes en el campo de visión." },
      { name: "Virtualidad", cost: "100ed", ph: "2 (1d6/2)", desc: "Proyecta el ciberespacio. Dos ciberojos." },
    ],
    "Ciberaudio": [
      { name: "Equipo de ciberaudio (básico)", cost: "500ed", ph: "7 (2d6)", desc: "3 ranuras de opciones." },
      { name: "Agente interno", cost: "100ed", ph: "3 (1d6)", desc: "Agente instalado internamente." },
      { name: "Analizador de voz", cost: "100ed", ph: "3 (1d6)", desc: "+2 Percepción humana e Interrogatorio." },
      { name: "Atenuador de nivel", cost: "100ed", ph: "2 (1d6/2)", desc: "Inmune a ruidos fuertes." },
      { name: "Codificador/Descodificador", cost: "100ed", ph: "2 (1d6/2)", desc: "Codifica/descodifica comunicaciones." },
      { name: "Comunicador de radio", cost: "100ed", ph: "2 (1d6/2)", desc: "Radio con alcance de 1,5 km." },
      { name: "Detector de micrófonos", cost: "100ed", ph: "2 (1d6/2)", desc: "Pita cerca de dispositivos de escucha." },
      { name: "Escucha amplificada", cost: "100ed", ph: "3 (1d6)", desc: "+2 Percepción (audición)." },
      { name: "Grabadora de audio", cost: "100ed", ph: "2 (1d6/2)", desc: "Graba audio en chip o agente." },
      { name: "Rastreador", cost: "100ed", ph: "2 (1d6/2)", desc: "Sigue un rastreador vinculado a 1,5 km." },
    ],
    "Ciberequipo interno": [
      { name: "Agallas", cost: "1000ed", ph: "7 (2d6)", desc: "Respirar bajo el agua." },
      { name: "Anticuerpos optimizados", cost: "500ed", ph: "2 (1d6/2)", desc: "Cura TCO x2 por día de descanso." },
      { name: "Antitoxinas", cost: "100ed", ph: "2 (1d6/2)", desc: "+2 Resistir torturas/drogas." },
      { name: "AudioVox", cost: "500ed", ph: "3 (1d6)", desc: "Sintetizador de voz. +2 Actuar/Tocar instrumento al cantar." },
      { name: "Ciberserpiente", cost: "1000ed", ph: "14 (4d6)", desc: "Arma c/c muy pesada en el esófago. Puede ocultarse." },
      { name: "Filtros nasales", cost: "100ed", ph: "2 (1d6/2)", desc: "Inmune a gases tóxicos, humo, etc." },
      { name: "Implante de hueso y músculo", cost: "1000ed", ph: "14 (4d6)", desc: "+2 TCO (cambia PD/umbral/salvación). Máx TCO 10." },
      { name: "Implante de radar/sonar", cost: "1000ed", ph: "7 (2d6)", desc: "Escanea 50 m. No atraviesa cobertura." },
      { name: "Suministro de aire independiente", cost: "1000ed", ph: "2 (1d6/2)", desc: "30 min de oxígeno." },
      { name: "Vampiros", cost: "500ed", ph: "14 (4d6)", desc: "Arma c/c ligera excelente en la boca. Puede añadir veneno." },
    ],
    "Ciberequipo externo": [
      { name: "Blindaje subdérmico", cost: "1000ed", ph: "14 (4d6)", desc: "Cuerpo y cabeza con CP11. No acumula. Se daña." },
      { name: "Bolsillo subcutáneo", cost: "100ed", ph: "3 (1d6)", desc: "Almacenamiento 5x10 cm bajo la piel." },
      { name: "Pistolera oculta", cost: "500ed", ph: "7 (2d6)", desc: "Guarda un arma ocultable dentro del cuerpo." },
      { name: "Tejido dérmico", cost: "500ed", ph: "7 (2d6)", desc: "Cuerpo y cabeza con CP7. No acumula. Se daña." },
    ],
    "Cibermiembros": [
      { name: "Ciberbrazo (básico)", cost: "500ed", ph: "7 (2d6)", desc: "Brazo de repuesto. 4 ranuras + mano estándar gratis." },
      { name: "Ciberpierna (básico)", cost: "100ed", ph: "3 (1d6)", desc: "Pierna de repuesto. 3 ranuras + pie estándar. Emparejar opciones." },
      { name: "Arma a distancia oculta", cost: "500ed", ph: "7 (2d6)", desc: "Arma a distancia a una mano en ciberbrazo. Ocupa 2 ranuras." },
      { name: "Arma cuerpo a cuerpo oculta", cost: "500ed", ph: "7 (2d6)", desc: "Arma c/c ligera/mediana/pesada en ciberbrazo. Ocupa 2 ranuras." },
      { name: "Desgarradores", cost: "100ed", ph: "2 (1d6/2)", desc: "Uñas de carbono. Arma c/c ligera. Puede ir en brazo de carne." },
      { name: "Destripadores", cost: "500ed", ph: "3 (1d6)", desc: "Garras de carbono. Arma c/c mediana." },
      { name: "Garras", cost: "500ed", ph: "7 (2d6)", desc: "Garras largas. Arma c/c pesada." },
      { name: "Lanzagranadas oculto", cost: "500ed", ph: "7 (2d6)", desc: "Lanzagranadas de un disparo. Ocupa 2 ranuras." },
      { name: "Mano con herramientas", cost: "100ed", ph: "3 (1d6)", desc: "Destornillador, llave, taladro, etc." },
      { name: "Nudillos de acero", cost: "100ed", ph: "3 (1d6)", desc: "Nudillos blindados. Arma c/c mediana." },
      { name: "Pie con patín", cost: "500ed", ph: "3 (1d6)", desc: "+6 m al correr. Dos ciberpiernas emparejadas." },
      { name: "Troceador", cost: "500ed", ph: "3 (1d6)", desc: "Látigo monofilamento en el pulgar. Arma c/c mediana." },
    ],
  };

  // -------- Camino vital / Lifepath (tablas de sugerencias, 1d10 salvo indicado) --------
  const LIFEPATH = {
    "Región cultural": ["Norteamérica", "Centroamérica/Sudamérica", "Europa occidental", "Europa oriental", "Oriente Medio/Norte de África", "África subsahariana", "Asia del Sur", "Sudeste asiático", "Asia oriental", "Oceanía/Islas del Pacífico"],
    "Personalidad": ["Tímido y reservado.", "Rebelde, antisocial y violento.", "Arrogante, orgulloso y frío.", "Caprichoso, temerario y testarudo.", "Nervioso, quisquilloso y delicado.", "Serio y estable.", "Idiota y atolondrado.", "Soplón y falso.", "Intelectual e independiente.", "Amigable y extrovertido."],
    "Estilo de ropa": ["Ropa normal elegante (estándar, colorido, modular).", "Ropa de sport (cómodo, ligero, atlético).", "Tendencias urbanas (llamativo, tecnológico, de calle).", "Ropa de negocios (dominante, ostentoso, poderoso).", "Alta costura (exclusiva, de diseño, a la última).", "Ropa bohemia (rústico, retro, libre).", "Ropa de mendigo (sin hogar, andrajoso, callejero).", "Colores de pandilla (peligroso, violento, rebelde).", "Cuero nómada (de vaquero, resistente, tribal).", "Moda asiática (brillante, fantástico, joven)."],
    "Peinado": ["Cresta.", "Largo y rizado.", "Corto y de punta.", "Suelto y despeinado.", "Calvo.", "Con mechas.", "De colores vistosos.", "Corto y bien peinado.", "Corto y rizado.", "Largo y liso."],
    "Rasgo característico": ["Tatuajes.", "Gafas de espejo.", "Cicatrices rituales.", "Guantes claveteados.", "Piercing en la nariz.", "Piercing en la lengua u otros lugares.", "Implantes de uñas extraños.", "Botas con punta o tacones.", "Mitones.", "Lentillas extrañas."],
    "Lo que más valoras": ["El dinero.", "El honor.", "Tu palabra.", "La honestidad.", "El conocimiento.", "La venganza.", "El amor.", "El poder.", "La familia.", "La amistad."],
    "Opinión sobre la gente": ["Eres neutral.", "Eres neutral.", "Te gusta casi todo el mundo.", "Odias a casi todo el mundo.", "Las personas son herramientas. Úsalas y deséchalas.", "Cada persona es un individuo valioso.", "Las personas son obstáculos que hay que destruir.", "La gente no es digna de confianza. No dependas de nadie.", "Aniquílalos y deja el lugar para las cucarachas.", "¡La gente es maravillosa!"],
    "Persona que más valoras": ["Madre o padre.", "Hermano.", "Amante.", "Amigo.", "Tú mismo.", "Mascota.", "Profesor o mentor.", "Personaje público.", "Héroe personal.", "Nadie."],
    "Posesión más valiosa": ["Arma.", "Herramienta.", "Prenda de vestir.", "Fotografía.", "Libro o diario.", "Grabación.", "Instrumento musical.", "Joya.", "Juguete.", "Carta."],
    "Entorno familiar original": ["Directores corporativos.", "Ejecutivos corporativos.", "Técnicos corporativos.", "Grupo de nómadas.", "Pandilla criminal.", "Habitantes de una zona de combate.", "Vagabundos urbanos.", "Ratas de megaestructura.", "Recuperadores.", "Edgerunners."],
    "Objetivo vital": ["Librarte de la mala reputación.", "Obtener poder y control.", "Salir de la calle a cualquier precio.", "Causar dolor y sufrimiento a cualquiera.", "Sobrevivir a tu pasado y olvidarlo.", "Cazar a los responsables de tu miserable vida.", "Conseguir lo que es legítimamente tuyo.", "Salvar a alguien involucrado en tu pasado.", "Obtener fama y reconocimiento.", "Convertirte en temido y respetado."],
    "Vida amorosa trágica": ["Tu amante murió en un accidente.", "Tu amante desapareció misteriosamente.", "Simplemente no funcionó.", "Una venganza o meta personal se interpuso.", "Tu amante fue secuestrado.", "Tu amante enloqueció o sufrió ciberpsicosis.", "Tu amante se suicidó.", "Tu amante murió en una pelea.", "Un rival te sacó del juego.", "Tu amante fue encarcelado o exiliado."],
  };

  // -------- Idiomas por región cultural --------
  const CULTURE_LANGUAGES = {
    "Norteamérica": ["Chino", "Cree", "Criollo", "Español", "Francés", "Inglés", "Navajo"],
    "Centroamérica/Sudamérica": ["Alemán", "Criollo", "Español", "Guaraní", "Inglés", "Maya", "Portugués", "Quechua"],
    "Europa occidental": ["Alemán", "Español", "Francés", "Holandés", "Inglés", "Italiano", "Noruego", "Portugués"],
    "Europa oriental": ["Finlandés", "Inglés", "Polaco", "Rumano", "Ruso", "Ucraniano"],
    "Oriente Medio/Norte de África": ["Árabe", "Bereber", "Farsi", "Francés", "Hebreo", "Inglés", "Turco"],
    "África subsahariana": ["Árabe", "Francés", "Hausa", "Inglés", "Lingala", "Oromo", "Portugués", "Swahili", "Twi", "Yoruba"],
    "Asia del Sur": ["Bengalí", "Cingalés", "Darí", "Hindi", "Inglés", "Nepalí", "Tamil", "Urdu"],
    "Sudeste asiático": ["Árabe", "Birmano", "Camboyano", "Filipino", "Hindi", "Indonesio", "Inglés", "Malayo", "Vietnamita"],
    "Asia oriental": ["Chino cantonés", "Chino mandarín", "Coreano", "Inglés", "Japonés", "Mongol"],
    "Oceanía/Islas del Pacífico": ["Francés", "Hawaiano", "Inglés", "Maorí", "Pama-ñungano", "Tahitiano"],
  };

  // -------- Perfiles de rol para generación coherente --------
  // Índices preferidos (referencian las tablas de LIFEPATH) para sesgar el azar.
  // profileKey -> clave de LIFEPATH:
  //   personality -> "Personalidad", clothing -> "Estilo de ropa",
  //   value -> "Lo que más valoras", family -> "Entorno familiar original",
  //   goal -> "Objetivo vital"
  const ROLE_PROFILES = {
    arreglador: { personality: [2, 5, 8, 9], clothing: [0, 2, 3], value: [0, 7, 8, 9], family: [5, 6, 7, 9], goal: [1, 6, 8, 2] },
    ejecutivo: { personality: [2, 5, 7, 8], clothing: [3, 4], value: [0, 7], family: [0, 1, 2], goal: [1, 8, 9] },
    mercenario: { personality: [1, 2, 5], clothing: [1, 7, 8], value: [0, 1, 5], family: [3, 4, 5, 9], goal: [3, 5, 4, 9] },
    netrunner: { personality: [0, 4, 8], clothing: [1, 2, 9], value: [0, 4, 5], family: [2, 6, 7, 9], goal: [1, 4, 6] },
    nomada: { personality: [3, 5, 9], clothing: [1, 8], value: [1, 8, 9], family: [3, 6, 8], goal: [4, 6, 7] },
    periodista: { personality: [2, 8, 9], clothing: [0, 2, 3], value: [2, 3, 4], family: [1, 2, 7, 9], goal: [0, 6, 8] },
    policia: { personality: [1, 2, 5], clothing: [0, 1, 3], value: [1, 2, 3], family: [1, 2, 5], goal: [6, 1, 9] },
    rockero: { personality: [1, 3, 9], clothing: [2, 5, 7, 9], value: [3, 6, 9], family: [4, 6, 7, 9], goal: [0, 7, 8] },
    tecnico: { personality: [0, 5, 8], clothing: [0, 1, 2], value: [0, 4, 9], family: [2, 7, 8, 9], goal: [2, 6, 8] },
    tecnomedico: { personality: [5, 8, 9], clothing: [0, 1, 8], value: [3, 4, 8], family: [2, 3, 5, 8], goal: [6, 7, 4] },
  };

  // -------- Pools de nombres por región cultural (para coherencia) --------
  const HANDLES = [
    "Redeye", "Cinder", "Static", "Wraith", "Voltage", "Hex", "Bishop", "Havoc",
    "Sable", "Nyx", "Chrome", "Ghost", "Ripper", "Zephyr", "Rune", "Blitz",
    "Fang", "Circuit", "Mirror", "Torque", "Vandal", "Echo", "Payload", "Sombra",
  ];

  const NAME_POOLS = {
    "Norteamérica": { first: ["James", "Mike", "Sarah", "Nadia", "Cole", "Mara", "Wyatt", "Tanya", "Marcus", "Ava"], last: ["Calhoun", "Ward", "Jones", "Miller", "Navarro", "Whitfield", "Hughes", "Brooks"] },
    "Centroamérica/Sudamérica": { first: ["Mateo", "Sofía", "Diego", "Valentina", "Camila", "Santiago", "Lucía", "Emilio"], last: ["Reyes", "Vargas", "Herrera", "Castillo", "Ríos", "Mendoza", "Cordero", "Salas"] },
    "Europa occidental": { first: ["Liam", "Elise", "Marco", "Klaus", "Anaïs", "Lars", "Giulia", "Bram"], last: ["Müller", "Rossi", "Dubois", "Vandenberg", "Bianchi", "Fischer", "Moreau"] },
    "Europa oriental": { first: ["Ivan", "Katya", "Miloš", "Ana", "Pavel", "Zofia", "Dmitri", "Lena"], last: ["Petrov", "Kowalski", "Novak", "Volkov", "Ilić", "Marek", "Sokolov"] },
    "Oriente Medio/Norte de África": { first: ["Karim", "Layla", "Yusuf", "Amira", "Tariq", "Nadia", "Omar", "Farah"], last: ["Haddad", "Nasser", "Farouk", "Bakri", "Amrani", "Zaidi", "Khoury"] },
    "África subsahariana": { first: ["Kwame", "Amara", "Kofi", "Zola", "Sipho", "Nia", "Tunde", "Ada"], last: ["Okafor", "Mensah", "Dube", "Achebe", "Nkosi", "Diallo", "Abara"] },
    "Asia del Sur": { first: ["Arjun", "Priya", "Rohan", "Meera", "Kiran", "Anil", "Deepa", "Sanjay"], last: ["Sharma", "Patel", "Nair", "Reddy", "Iyer", "Khan", "Das"] },
    "Sudeste asiático": { first: ["Bayani", "Mai", "Rizal", "Linh", "Dara", "Sari", "Arun", "Layana"], last: ["Santos", "Nguyen", "Tan", "Wibowo", "Prasetya", "Suharto"] },
    "Asia oriental": { first: ["Kaito", "Yuki", "Jin", "Hana", "Ren", "Mei", "Sora", "Daichi"], last: ["Tanaka", "Kim", "Chen", "Sato", "Park", "Watanabe", "Zhang", "Lee"] },
    "Oceanía/Islas del Pacífico": { first: ["Kai", "Moana", "Tane", "Leilani", "Ari", "Nia", "Manu", "Sina"], last: ["Tui", "Kealoha", "Ngata", "Faleolo", "Rangi", "Vaka"] },
  };

  // -------- Reglas de creación --------
  const RULES = {
    completeStatPoints: 62,
    completeStatMin: 2,
    completeStatMax: 8,
    skillPoints: 86,
    edgeSkillMin: 2,
    edgeSkillMax: 6,
    completeSkillMax: 6,
    streetratMoney: 500,
    completeMoney: 2550,
    completeFashionMoney: 800,
    roleAbilityStart: 4,
    freeLanguageLevel: 4,
  };

  return {
    STATS, STAT_ORDER, ROLES, STREETRAT_STATS, SKILLS, BASIC_SKILLS,
    STREETRAT_SKILLS, STARTING_GEAR, WEAPONS_MELEE, WEAPONS_RANGED,
    WEAPONS_EXOTIC, ARMOR, GEAR, CYBERWARE, LIFEPATH, CULTURE_LANGUAGES,
    ROLE_PROFILES, NAME_POOLS, HANDLES, STARTING_CYBER, RULES,
  };
})();
