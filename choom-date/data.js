// ============================================================
// ChoomDate - Datepath (Digital Dating in the Dark Future)
// Basado en el DLC oficial gratuito de R. Talsorian Games
// por Neil Branquinho, James Hutt y J Gray (2022).
// https://rtalsoriangames.com/wp-content/uploads/2022/02/RTG-CPR-DLC-DigitalDating.pdf
//
// Traducción libre al castellano. Nombres propios (barrios,
// corporaciones, locales) se mantienen en su forma canónica.
// ============================================================

// ---- Nombres (solo pila; el Datepath: "no sabes nada más de esta persona") ----
const FIRST_NAMES = [
  "Vex", "Mira", "Nova", "Piper", "Echo", "Riven", "Nyx", "Solene",
  "Kira", "Ash", "Cinder", "Neon", "Trinity", "Wraith", "Iris",
  "Luna", "Sable", "Vega", "Rogue", "Sirena", "Kai", "Bishop",
  "Dagger", "Chrome", "Blitz", "Havoc", "Rift", "Cypher", "Jax",
  "Zed", "Ronin", "Ryker", "Bane", "Kade", "Nox", "Ridge", "Steel",
  "Vortex", "Dante", "Fenrir", "Ghost", "Ripper", "Byte", "Glitch",
  "Signal", "Halo", "Zero", "Pulse", "Void", "Static", "Hex", "Onyx",
  "Draco", "Karma", "Mirage", "Vandal", "Mark", "Tora",
];

// ---- Roles: mapeo de keyword -> glyph/color para pintar la carta ----
// Se usa cuando alguna keyword del match coincide con uno de los 10 roles.
const ROLE_META = {
  "Ejecutivo":   { glyph: "💼", accent: "#e9eef2" },
  "Arreglador":  { glyph: "💰", accent: "#f5c542" },
  "Policía":     { glyph: "🛡", accent: "#4d9df5" },
  "Periodista":  { glyph: "📡", accent: "#c084fc" },
  "Tecnomédico": { glyph: "⚕",  accent: "#35d07f" },
  "Netrunner":   { glyph: "💾", accent: "#22d3ee" },
  "Nómada":      { glyph: "🛻", accent: "#d0793c" },
  "Rockero":     { glyph: "🎸", accent: "#ff4bd8" },
  "Mercenario":  { glyph: "🔫", accent: "#ff4661" },
  "Técnico":     { glyph: "🔧", accent: "#f5a623" },
};

// ---- KEYWORDS (Datepath pág. 3, tabla 1d100, dos tiradas) ----
// Se muestran como texto libre en el perfil. Traducidas del original.
const KEYWORDS = [
  "Adorable", "Aventurera", "Cariñosa", "Ambiciosa", "Atleta",
  "Panadería", "Valiente", "Considerada", "Encantadora", "Cocinar",
  "Valerosa", "Creativa", "Beber", "Elflines Online", "Ejecutivo",
  "Pescar", "Arreglador", "Sibarita", "Divertida", "Jardinería",
  "Trabajadora", "Senderismo", "Esperanzada", "Cazar", "Independiente",
  "Perspicaz", "Inteligente", "Policía", "Amorosa", "Leal",
  "Periodista", "Tecnomédico", "Modesta", "Netrunner", "Nómada",
  "Optimista", "Apasionada", "Paciente", "En forma", "Silenciosa",
  "Racional", "Respetuosa", "Rockero", "Correr", "Mercenario",
  "Espontánea", "Deportes", "Rol de mesa", "Técnico", "Virtuosa",
];

// ---- Género (se muestra en la carta del perfil) ----
const GENDERS = [
  { label: "Femenino", glyph: "♀" },
  { label: "Masculino", glyph: "♂" },
  { label: "No binario", glyph: "⚧" },
];

// ---- Formas de género para keywords/roles (f = femenino, m = masculino,
// e = no binario · forma inclusiva -e). Solo las palabras con marca de
// género aparecen aquí; el resto se muestran tal cual (epicenas/neutras). ----
const WORD_FORMS = {
  // Rasgos
  "Aventurera":  { m: "Aventurero",  f: "Aventurera",  e: "Aventurere" },
  "Cariñosa":    { m: "Cariñoso",    f: "Cariñosa",    e: "Cariñose" },
  "Ambiciosa":   { m: "Ambicioso",   f: "Ambiciosa",   e: "Ambiciose" },
  "Considerada": { m: "Considerado", f: "Considerada", e: "Considerade" },
  "Encantadora": { m: "Encantador",  f: "Encantadora", e: "Encantadore" },
  "Valerosa":    { m: "Valeroso",    f: "Valerosa",    e: "Valerose" },
  "Creativa":    { m: "Creativo",    f: "Creativa",    e: "Creative" },
  "Divertida":   { m: "Divertido",   f: "Divertida",   e: "Divertide" },
  "Trabajadora": { m: "Trabajador",  f: "Trabajadora", e: "Trabajadore" },
  "Esperanzada": { m: "Esperanzado", f: "Esperanzada", e: "Esperanzade" },
  "Amorosa":     { m: "Amoroso",     f: "Amorosa",     e: "Amorose" },
  "Modesta":     { m: "Modesto",     f: "Modesta",     e: "Modeste" },
  "Apasionada":  { m: "Apasionado",  f: "Apasionada",  e: "Apasionade" },
  "Silenciosa":  { m: "Silencioso",  f: "Silenciosa",  e: "Silenciose" },
  "Respetuosa":  { m: "Respetuoso",  f: "Respetuosa",  e: "Respetuose" },
  "Espontánea":  { m: "Espontáneo",  f: "Espontánea",  e: "Espontánee" },
  "Virtuosa":    { m: "Virtuoso",    f: "Virtuosa",    e: "Virtuose" },
  // Roles con marca de género (los epicenos —Policía, Periodista, Netrunner,
  // Nómada— no cambian y no necesitan entrada).
  "Ejecutivo":   { m: "Ejecutivo",   f: "Ejecutiva",   e: "Ejecutive" },
  "Arreglador":  { m: "Arreglador",  f: "Arregladora", e: "Arregladore" },
  "Tecnomédico": { m: "Tecnomédico", f: "Tecnomédica", e: "Tecnomédique" },
  "Rockero":     { m: "Rockero",     f: "Rockera",     e: "Rockere" },
  "Mercenario":  { m: "Mercenario",  f: "Mercenaria",  e: "Mercenarie" },
  "Técnico":     { m: "Técnico",     f: "Técnica",     e: "Técnique" },
};

// ---- LOCATIONS (Datepath pág. 4) ----
// 20 distritos con su "prompt" y las 6 actividades correspondientes.
const LOCATIONS = [
  {
    id: "norcal",
    name: "Base Militar NorCal",
    hint: "Tu cita probablemente tenga contactos en Militech.",
    activities: [
      "Sacudirse los nervios de la primera cita en el campo de tiro.",
      "Algo sobre una pista de cuerdas. Suena interesante.",
      "Al parecer, en la base se come bastante bien.",
      "Ver juntos un ejercicio militar en directo.",
      "Ver una peli en el cine de la base.",
      "Ven con tu mejor juego para el partido de paintball más salvaje de tu vida.",
    ],
  },
  {
    id: "watson",
    name: "Watson Development",
    hint: "Tu cita podría tener contactos en Petrochem o SovOil.",
    activities: [
      "Fiesta en el vestíbulo inacabado de un megaedificio en construcción.",
      "Cita de museo en el Museo del Petróleo de SovOil.",
      "Picnic corporativo en un parque cerca de Watson Central Cubelife.",
      "Cita en un izakaya del distrito Kabuki.",
      "¡Es una sorpresa! Te espera en la entrada Watson del Monorraíl de Alta Seguridad.",
      "Ir a una manifestación organizada por el rockero local Lucius Rhyne.",
    ],
  },
  {
    id: "new_westbrook",
    name: "New Westbrook",
    hint: "Puede tener conexión con Rocklin Augmentics o Network 54.",
    activities: [
      "Formar parte del público en directo de un programa de Network 54.",
      "Asistir a una carrera de Skate Foot cerca del Parque de Bomberos #1 de Night City.",
      "Gala organizada por Rocklin Augmentics en su campus.",
      "Escalada en el acantilado bajo las oficinas de WorldSat.",
      "Cazar un food truck esquivo por la zona.",
      "Tomar una copa en un Executive Bar.",
    ],
  },
  {
    id: "morro_rock",
    name: "Morro Rock",
    hint: "¡Tienes un ferry que coger!",
    activities: [
      "Ver una prueba de las puertas de acero gigantes del Orbital Massdriver.",
      "El sitio perfecto para ver los fuegos artificiales.",
      "Comida en la cafetería de empleados de Orbital Air Massdriver.",
      "Dice que tiene un barco atracado en Morro Rock.",
      "Cita doble con alguien de su Familia.",
      "Asientos de primera fila para una pelea clandestina en las obras del Massdriver.",
    ],
  },
  {
    id: "executive_zone",
    name: "Zona Ejecutiva",
    hint: "Tu cita está forrada. Puede que sea un Exec de alto nivel.",
    activities: [
      "¿Alguien se apunta al golf?",
      "¿Una partida de tenis en una pista de hierba orgánica de verdad?",
      "Brunch en el sitio favorito de tu cita.",
      "Fiesta en la piscina de una McMansión de Beaverville.",
      "Copas en el business lounge del Country Club.",
      "Fiesta de disfraces en la mansión de un Exec recientemente fallecido.",
    ],
  },
  {
    id: "heywood_industrial",
    name: "Zona Industrial de Heywood",
    hint: "Puede que tenga conexión con Zhirafa.",
    activities: [
      "Quiere enseñarte su última pieza de arte urbano.",
      "Laser tag en el Zhirafa Office Park.",
      "Alguien soldó una pila de contenedores para hacer un speakeasy.",
      "Concierto de música industrial en un polígono industrial.",
      "«Hay un teriyaki muy bueno al que voy siempre».",
      "Vivir en directo la carnicería del combate de drones. Pobres GRAF3s...",
    ],
  },
  {
    id: "heywood_sd",
    name: "Heywood — Santo Domingo",
    hint: "Tu cita seguramente tenga amigos Nómadas.",
    activities: [
      "Se acerca un festival callejero. Va todo el mundo.",
      "«Vamos a emborracharnos de Smash en el Metalstorm».",
      "Los Aldecaldos hacen una barbacoa.",
      "¿Te apetece que echemos una carrera de Roadbikes?",
      "«Mi abuela hace el mejor mole poblano».",
      "Esta noche hay fiesta en el East Cargo Village.",
    ],
  },
  {
    id: "rancho_coronado",
    name: "Rancho Coronado",
    hint: "Puede que sea un corporativo de nivel medio-bajo.",
    activities: [
      "Desayuno en una panquequería.",
      "«Vente al parque a conocer a mi perro totalmente real».",
      "«¿Tomamos algo en mi pub de siempre?»",
      "Cita de manicura-pedicura en el mercado del barrio.",
      "«¿Alguna vez has hecho LARP?»",
      "Asar salchichas en un cookout de empresa.",
    ],
  },
  {
    id: "outskirts",
    name: "Outskirts",
    hint: "¡Tu cita seguramente sea Nómada!",
    activities: [
      "«¡Vamos de senderismo!»",
      "«Mi Familia me deja el Girocóptero».",
      "«Buscar setas es divertido, te lo prometo».",
      "«¿Has probado alguna vez el tiro con arco?»",
      "«¡Vámonos a hacer off-road por los Badlands!»",
      "Tu cita dice que sabe dónde hay una cascada secreta.",
    ],
  },
  {
    id: "reclaimed_perimeter",
    name: "Perímetro Recuperado",
    hint: "¡Tu cita seguramente sea Recuperador!",
    activities: [
      "Bolera en un edificio abandonado.",
      "«Vámonos a hacer espeleología urbana».",
      "«Unos amigos han quedado, ¿te apuntas?»",
      "«Hemos encontrado unos fuegos artificiales viejos. ¿Los disparamos contra coches abandonados?»",
      "«Vamos a por tacos al camión de mi colega».",
      "«Nos vemos en el diner nocturno».",
    ],
  },
  {
    id: "little_europe",
    name: "Little Europe",
    hint: "Puede tener conexión con Continental Brands o Danger Gal.",
    activities: [
      "Asistir a una clase de Cocina con Kibble en el Oasis Megamart.",
      "Rezar juntos en la Iglesia de los Ángeles Santos.",
      "Una noche loca en el Short Circuit.",
      "Carrera de karts rosa neón en las oficinas de Danger Gal.",
      "Disfrutar de una cena italiana preciosa.",
      "Una copa de vino con vistas a Night City desde el rooftop del Camden Court.",
    ],
  },
  {
    id: "upper_marina",
    name: "Upper Marina",
    hint: "Puede tener conexión con Ziggurat.",
    activities: [
      "Ir a un partido en el McCartney Field Stadium.",
      "Alquilar una moto acuática y disfrutar de la bahía.",
      "Asistir a una rueda de prensa / desfile de moda organizado por Ziggurat.",
      "Pedir un Johnny Silverhand en el Afterlife.",
      "Pasar el día en el tranvía haciendo de turistas. No se averiará. Probablemente.",
      "¡Ir a pescar!",
    ],
  },
  {
    id: "university",
    name: "Distrito Universitario",
    hint: "Puede trabajar o estudiar en la Universidad de Night City, o tener conexión con Biotechnica.",
    activities: [
      "Fiestón fuera del campus, en el University Cargo Bay.",
      "¿Qué tal un paseo por la naturaleza en Lake Park?",
      "Tour por el museo vivo de Biotechnica, en su única cúpula geodésica abierta al público.",
      "Tu cita quiere enseñarte su nuevo proyecto de investigación.",
      "Concurso grupal de comilones. ¿Aguantas el Mega Kibbledog y te llevas la camiseta?",
      "Asistir a un concierto en el campus del departamento de música.",
    ],
  },
  {
    id: "little_china",
    name: "Little China",
    hint: "¡Es una Zona de Combate! Ven preparado.",
    activities: [
      "Tomar algo en el Forlorn Hope.",
      "Ver escaparates y comida callejera.",
      "Ir a que os den un masaje.",
      "Ir de tiendas de segunda mano.",
      "Es domingo por la mañana, hora del dim sum.",
      "Ir juntos a un Mercado Nocturno.",
    ],
  },
  {
    id: "old_japantown",
    name: "Old Japantown",
    hint: "Igual quieres llevar un Armorjack a esta cita.",
    activities: [
      "Picnic con vistas a la Hot Zone.",
      "Pedir «sushi» en cinta transportadora.",
      "Cantar karaoke en un edificio de hormigón puro — ¡acústica genial!",
      "Tu cita quiere que conozcas a su mejor amigo.",
      "Asistir a un desfile grande y disfrutar del ambiente.",
      "El padre de tu cita quiere conocerte.",
    ],
  },
  {
    id: "the_glen",
    name: "The Glen",
    hint: "Tu cita seguramente sea Exec o Policía.",
    activities: [
      "Discoteca en el Club Atlantis.",
      "Tour guiado por el ayuntamiento.",
      "Happy hour en un Excellent Bar.",
      "Pillar bollería recién hecha en una panadería local. ¡Esto es de verdad!",
      "Asistir a un acto político de recaudación de fondos.",
      "Una noche en la ópera.",
    ],
  },
  {
    id: "old_combat_zone",
    name: "Antigua Zona de Combate",
    hint: "Puede que no sea muy buena idea...",
    activities: [
      "El Jessie James Kosher Deli merece el riesgo.",
      "Subir a un tejado abandonado para disfrutar de la vista.",
      "Disparar lanzagranadas contra montones de escombros. Muy romántico.",
      "Trae tus propias latas de spray para una cita graffitera.",
      "Ayudar a desbrozar el huerto en la azotea de tu cita.",
      "Pasar el rato en un centro comercial abandonado.",
    ],
  },
  {
    id: "south_night_city",
    name: "South Night City",
    hint: "Puede estar en una banda. O tener amigos que sí lo estén.",
    activities: [
      "Comer con tu cita después de su sesión de tatuaje.",
      "¡Tomar el sol en la playa!",
      "Colarse en Playland by the Sea en barco.",
      "Tu cita quiere presentarte a toda la banda.",
      "Tomar algo en un bar bullicioso de nómadas del mar.",
      "Música en vivo en un gimnasio abandonado.",
    ],
  },
  {
    id: "hot_zone",
    name: "Hot Zone",
    hint: "¿Siempre quisiste salir con un Scavver? Es tu oportunidad.",
    activities: [
      "¡Hacer una visita histórica por las ruinas!",
      "Te espera una noche loca en el Totentanz.",
      "Colarse en un viejo edificio corporativo.",
      "Ayudar a tu cita a recuperar una pieza clásica de tecnología.",
      "Asistir a una carrera callejera ligeramente radioactiva.",
      "Cenar MREs caducados bajo un precioso cielo rojo.",
    ],
  },
  {
    id: "pacifica_playground",
    name: "Pacifica Playground",
    hint: "¡La mayor diversión sin salir de Night City!",
    activities: [
      "Tu cita quiere compartir contigo su braindance favorito.",
      "Picnic en el aparcamiento de Playland by the Sea.",
      "Visita entre bastidores al Playland by the Sea Holostravaganza Concert Hall.",
      "Buscar conchas (y casquillos) en la playa.",
      "Subir a las atracciones y comer el exclusivo Pineapple Madness Kibble de Playland by the Sea.",
      "Carreras de aceleración por el muelle.",
    ],
  },
];

// ---- HOW DOES YOUR DATE GO? (Datepath pág. 11) ----
// 1d10: 1-4 buena, 5-8 rara, 9-10 ghosteado (no aparece).
const VIBE_BUCKETS = [
  { min: 1,  max: 4,  vibe: "good"    },
  { min: 5,  max: 8,  vibe: "weird"   },
  { min: 9,  max: 10, vibe: "ghosted" },
];

// ---- Beats de CITA BUENA ----
// Cada entrada puede llevar un `ref` para invocar una subtabla del manual básico,
// o un `flag: "skip-postdate"` cuando el resultado hace saltar el post-date.
const GOOD_BEGINNING = [
  { text: "Aprendes algo nuevo de tu cita.", ref: "keyword" },
  { text: "Te habla de uno de sus amigos.", ref: "friends" },
  { text: "Te cuenta a qué se dedica como edgerunner.", ref: "roleLifepath" },
  { text: "Descubres al momento algo que tenéis en común." },
  { text: "Tiene un rasgo positivo (a tu elección) que no aparecía en el perfil." },
  { text: "Tiene un atractivo de infarto. Posiblemente con bodysculpt." },
];

const GOOD_MIDDLE = [
  { text: "Aprendes algo nuevo de tu cita.", ref: "keyword" },
  { text: "Se desahoga sobre uno de sus enemigos.", ref: "enemies" },
  { text: "Te habla de una relación anterior.", ref: "previousRelationship" },
  { text: "Descubres cosas sobre su familia.", ref: "family" },
  { text: "Te sorprende con un detalle de 20eb (Cotidiano). El DJ elige." },
  { text: "Se queda en silencio todo el rato y te escucha hablar." },
];

const GOOD_END = [
  { text: "Se sincera y te cuenta el objetivo de su vida.", ref: "lifeGoals" },
  { text: "Te da un consejo útil. El DJ elige cuál." },
  { text: "Te enteras de sus valores y visión de la vida.", ref: "motivations" },
  { text: "Tiene mucho interés en ti y quiere otra cita.", flag: "skip-postdate", postDate: "wants-more" },
  { text: "Descubres uno de sus grandes talentos (DJ elige). Tiene Base 16 en la habilidad correspondiente." },
  { text: "La cita termina demasiado pronto para aprender nada más." },
];

// ---- Beats de CITA RARA ----
const WEIRD_BEGINNING = [
  { text: "Te cuenta sus tres romances trágicos más recientes.", ref: "tragicLove", refCount: 3 },
  { text: "Tu cita no es la persona de las fotos del perfil." },
  { text: "Ha traído a un amigo a la cita.", ref: "friends" },
  { text: "Lleva algo bastante raro puesto, incluso para los estándares de Night City." },
  { text: "Tiene afiliación a una banda (elige el DJ) y aparece con los colores de la banda." },
  { text: "Tiene un montón de cibernéticos. Una cantidad peligrosa. Puede que estén chispeando." },
];

const WEIRD_MIDDLE = [
  { text: "Se disculpa para ir al baño y no vuelve nunca.", flag: "abort" },
  { text: "Empieza una pelea y la termina rápido. Tiene Base 16 en una habilidad de combate (DJ elige)." },
  { text: "No te enteras de nada porque pasó todo el rato pendiente de su Agent." },
  { text: "Le gusta mucho el Smash. Puede que también el Synthcoke, no lo sabes seguro." },
  { text: "Te cuenta a sus tres enemigos más odiados.", ref: "enemies", refCount: 3 },
  { text: "Habla de su familia todo el rato. Te enteras de mucho.", ref: "familyDouble" },
];

const WEIRD_END = [
  { text: "Tiene mucho interés en ti y quiere otra cita.", flag: "skip-postdate", postDate: "wants-more" },
  { text: "Te enteras de sus valores y visión de la vida.", ref: "motivations" },
  { text: "Insiste en enseñarte su «amuleto de la suerte».", ref: "valuedPossession" },
  { text: "Te da un consejo útil. El DJ elige cuál." },
  { text: "Te regala 50eb (Caro) en droga callejera y/o munición (DJ elige)." },
  { text: "La cita termina demasiado pronto para aprender nada más." },
];

// ---- «One... Weird... Thing» (Datepath pág. 13) ----
// Solo tras cita BUENA: par = nada raro; impar = 1d10 en esta tabla.
const GOOD_WEIRD_QUIRKS = [
  "Tu cita comió de forma extraña.",
  "El padre/madre de tu cita le llamó dos veces durante la cita.",
  "Tu cita habló de su ex. Mucho.",
  "La ropa de tu cita estaba muy manchada y no le importaba.",
  "El Agent de tu cita sonó varias veces durante la cita.",
  "Tu cita no dejó propina.",
  "Tu cita mintió sobre un dato que habías aprendido (a tu elección cuál).",
  "Tu cita apareció con media hora de retraso.",
  "Al principio de la cita, pensó que eras otra persona.",
  "Tu cita se estaba recuperando de una herida de bala.",
];

// ============================================================
// SUBTABLAS DEL MANUAL BÁSICO (Vía de la Vida, págs. 48-53)
// Se usan como resolvers cuando un beat del Datepath lo referencia.
// ============================================================

const LIFEPATH = {
  // p. 51 — Amigos: relación con ese amigo
  friends: {
    source: "Amigos · CP:R p.51",
    entries: [
      "Como un/a hermano/a mayor para ti.",
      "Como un/a hermano/a menor para ti.",
      "Maestro/a o mentor/a.",
      "Socio/a o compañero/a de trabajo.",
      "Un antiguo amante.",
      "Un viejo enemigo.",
      "Como un padre o una madre para ti.",
      "Viejo/a amigo/a de la infancia.",
      "Alguien a quien conoces de la calle.",
      "Lo conociste por un interés mutuo.",
    ],
  },

  // p. 51 — Enemigos: quién + causa + qué puede usar contra ti
  enemies: {
    source: "Enemigos · CP:R p.51",
    entries: [
      "Antiguo amigo. Hizo que el otro perdiera su prestigio. Va solo, ni siquiera como prioridad.",
      "Antiguo amante. Provocó que el otro perdiera un amante/amigo/pariente. Va solo.",
      "Pariente lejano. Provocó al otro una humillación pública. Él y un amigo cercano.",
      "Enemigo de la infancia. Acusó al otro de cobardía u otro defecto. Él y unos pocos amigos.",
      "Persona que trabaja para ti. Traicionó al otro. Él y unos cuantos amigos.",
      "Persona para la que trabajas. Rechazó una oferta de trabajo o amor. Toda una banda.",
      "Socio/compañero de trabajo. Simplemente no os gustáis. La policía local u otras autoridades.",
      "Ejecutivo corporativo. Fue rival amoroso. El jefe de una banda poderosa o corporación pequeña.",
      "Funcionario del gobierno. Fue rival de negocios. Una corporación poderosa.",
      "Miembro de una banda. Culpó al otro de un crimen que no cometió. Una ciudad, gobierno o agencia.",
    ],
  },

  // p. 52 — Trágica vida amorosa
  tragicLove: {
    source: "Trágica vida amorosa · CP:R p.52",
    entries: [
      "Tu amante murió en un accidente.",
      "Tu amante desapareció misteriosamente.",
      "Simplemente no funcionó.",
      "Se interpuso una venganza o meta personal entre vosotros.",
      "Tu amante fue secuestrado.",
      "Tu amante enloqueció o sufrió ciberpsicosis.",
      "Tu amante se suicidó.",
      "Tu amante murió en una pelea.",
      "Un rival te sacó del juego.",
      "Tu amante fue encarcelado o exiliado.",
    ],
  },

  // p. 49 — Entorno familiar original
  family: {
    source: "Entorno familiar original · CP:R p.49",
    entries: [
      "Directores corporativos. Ricos y poderosos; escuela privada de renombre.",
      "Ejecutivos corporativos. Acomodados, casa en barrio seguro.",
      "Técnicos corporativos. Clase media, cubículo cómodo o casa en «ciudades castor».",
      "Grupo de nómadas. Remolques, vehículos y grandes combis como hogar.",
      "Pandilla criminal. Hogar salvaje y violento donde la pandilla ocupara.",
      "Habitantes de una zona de combate. Edificio fortificado en «la zona».",
      "Vagabundos urbanos. Coches, basureros, módulos abandonados.",
      "Ratas de megaestructura. Cubículo diminuto, pienso y cama caliente.",
      "Recuperadores. De la carretera a un pueblo fantasma para reconstruirlo.",
      "Edgerunners. La casa cambiaba según el «trabajo» de sus padres.",
    ],
  },

  // p. 50 — Tragedia familiar
  familyCrisis: {
    source: "Tragedia familiar · CP:R p.50",
    entries: [
      "La familia lo perdió todo por una traición.",
      "La familia lo perdió todo por mala gestión.",
      "La familia fue exiliada o expulsada de su hogar/nación/corporación.",
      "La familia está encarcelada; solo pudo escapar uno.",
      "La familia desapareció; solo queda uno.",
      "La familia fue asesinada; único superviviente.",
      "La familia está implicada en una conspiración o asociación importante.",
      "La familia se dispersó a los cuatro vientos por una desgracia.",
      "La familia está en una enemistad hereditaria de varias generaciones.",
      "Heredero/a de una deuda familiar que debe saldar.",
    ],
  },

  // p. 48 — Motivaciones y relaciones (dos columnas combinadas)
  motivations: {
    source: "Motivaciones y relaciones · CP:R p.48",
    entries: [
      "Aprecia el dinero. Es neutral con la gente.",
      "Aprecia el honor. Es neutral con la gente.",
      "Aprecia su palabra. Le gusta casi todo el mundo.",
      "Aprecia la honestidad. Odia a casi todo el mundo.",
      "Aprecia el conocimiento. Ve a las personas como herramientas.",
      "Aprecia la venganza. Cada persona es un individuo valioso.",
      "Aprecia el amor. Las personas son obstáculos que destruir si estorban.",
      "Aprecia el poder. La gente no es de fiar. No dependas de nadie.",
      "Aprecia la familia. Aniquílalos y deja el sitio a las cucarachas.",
      "Aprecia la amistad. ¡La gente es maravillosa!",
    ],
  },

  // p. 48 — Posesión más valiosa
  valuedPossession: {
    source: "Posesión más valiosa · CP:R p.48",
    entries: [
      "Un arma.",
      "Una herramienta.",
      "Una prenda de vestir.",
      "Una fotografía.",
      "Un libro o diario.",
      "Una grabación.",
      "Un instrumento musical.",
      "Una joya.",
      "Un juguete.",
      "Una carta.",
    ],
  },

  // p. 53 — Objetivos vitales
  lifeGoals: {
    source: "Objetivos vitales · CP:R p.53",
    entries: [
      "Librarse de su mala reputación.",
      "Obtener poder y control.",
      "Salir de la calle a cualquier precio.",
      "Causar dolor y sufrimiento a cualquiera con quien se cruce.",
      "Sobrevivir a su pasado y tratar de olvidarlo.",
      "Cazar a los responsables de su miserable vida y hacerles pagar.",
      "Conseguir lo que es legítimamente suyo.",
      "Salvar (si es posible) a otra persona involucrada en su pasado (amante, familiar).",
      "Obtener fama y reconocimiento.",
      "Convertirse en alguien temido y respetado.",
    ],
  },
};
