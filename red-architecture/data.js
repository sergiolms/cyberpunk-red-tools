// ============================================================
// RED Architecture — datos (Netrunning, manual básico pág. 195-217
// y Seguridad doméstica pág. 373-379).
// Generador de arquitecturas de RED y sus combates.
// ============================================================

// Tramos por número de pisos: nodos de control máx., portabilidad y coste/piso.
const RA_TIERS = [
  { min: 3, max: 6, nodes: 2, portable: true, cost: 1000 },
  { min: 7, max: 12, nodes: 3, portable: false, cost: 5000 },
  { min: 13, max: 18, nodes: Infinity, portable: false, cost: 10000 },
];

// Contraseñas / obstrucciones: VD y coste.
const RA_PASSWORD_VD = [
  { vd: 6, cost: "500ed (caro)" },
  { vd: 8, cost: "1.000ed (muy caro)" },
  { vd: 10, cost: "5.000ed (lujoso)" },
  { vd: 12, cost: "10.000ed (muy lujoso)" },
];

// Archivos: sabor para lo que hay detrás de una puerta.
const RA_FILES = [
  "Datos financieros de la corpo",
  "Registros de personal y biometría",
  "Planos de seguridad del edificio",
  "Correspondencia comprometedora",
  "Investigación de un «proyecto negro»",
  "Copia de seguridad de una IA",
  "Lista de clientes y proveedores",
  "Grabaciones de cámaras",
  "Códigos de acceso físicos",
  "Un secreto que alguien pagaría por enterrar",
];

// Hielo negro (PÁG. 206-211): PER, VEL, ATQ, DEF, REZ + efecto.
const RA_BLACK_ICE = [
  { name: "Cuervo", clase: "Antipersonal", per: 6, vel: 4, atq: 4, def: 2, rez: 15, cost: "50ed", efecto: "Desreza un programa defensivo al azar del netrunner e inflige 1d6 de daño directo al cerebro." },
  { name: "Escorpión", clase: "Antipersonal", per: 2, vel: 6, atq: 2, def: 2, rez: 15, cost: "100ed", efecto: "El MOV del netrunner se reduce en 1d6 durante 1 hora (mín. 1). Psicosomático, sin efectos permanentes." },
  { name: "Fuego fatuo", clase: "Antipersonal", per: 4, vel: 4, atq: 4, def: 2, rez: 15, cost: "50ed", efecto: "1d6 de daño directo al cerebro y reduce en 1 las acciones de RED de su próximo turno (mín. 2)." },
  { name: "Gigante", clase: "Antipersonal", per: 2, vel: 2, atq: 8, def: 4, rez: 25, cost: "1.000ed", efecto: "3d6 de daño directo al cerebro. Expulsado a la fuerza y sin seguridad; sufre al salir todo el hielo negro rezeado." },
  { name: "Kraken", clase: "Antipersonal", per: 6, vel: 2, atq: 8, def: 4, rez: 30, cost: "1.000ed", efecto: "3d6 de daño directo al cerebro. Hasta el final de su próximo turno no puede avanzar ni desconectarse de forma segura." },
  { name: "Mofeta", clase: "Antipersonal", per: 2, vel: 4, atq: 4, def: 2, rez: 10, cost: "500ed", efecto: "Mientras esté rezeado, el netrunner tira Deslizamiento con −2. Varias Mofetas se acumulan." },
  { name: "Liche", clase: "Antipersonal", per: 8, vel: 2, atq: 6, def: 2, rez: 25, cost: "500ed", efecto: "INT, REF y DES del netrunner se reducen en 1d6 cada una durante 1 hora (mín. 1). Psicosomático." },
  { name: "Perro del infierno", clase: "Antipersonal", per: 6, vel: 6, atq: 6, def: 2, rez: 20, cost: "500ed", efecto: "2d6 de daño directo al cerebro. Salvo aislamiento, su ciberterminal arde: 2 PD al final del turno hasta apagarse." },
  { name: "Asesino", clase: "Antiprograma", per: 4, vel: 8, atq: 6, def: 2, rez: 20, cost: "500ed", efecto: "4d6 de daño a un programa. Si lo desreza, queda destruido." },
  { name: "Áspid", clase: "Antiprograma", per: 4, vel: 6, atq: 2, def: 2, rez: 15, cost: "100ed", efecto: "Destruye un único programa al azar instalado en el ciberterminal del netrunner." },
  { name: "Dientes de sable", clase: "Antiprograma", per: 8, vel: 6, atq: 6, def: 2, rez: 25, cost: "1.000ed", efecto: "6d6 de daño a un programa. Si lo desreza, queda destruido." },
  { name: "Dragón", clase: "Antiprograma", per: 6, vel: 4, atq: 6, def: 6, rez: 30, cost: "1.000ed", efecto: "6d6 de daño a un programa. Si lo desreza, queda destruido." },
];

// Demonios (PÁG. 216): manejan nodos de control. Sin PER/VEL/DEF.
const RA_DEMONS = [
  { name: "Duende", rez: 15, interface: 3, acciones: 2, cv: 14, cost: "1.000ed (muy caro)", nota: "El más común. Icono: esfera de luz naranja con cuernos rojos." },
  { name: "Afrit", rez: 25, interface: 4, acciones: 3, cv: 14, cost: "5.000ed (lujoso)", nota: "Icono: hombre elegante con fez y daga." },
  { name: "Balron", rez: 30, interface: 7, acciones: 4, cv: 14, cost: "10.000ed (muy lujoso)", nota: "Reservado para lo que oculta algo grande. Icono: humanoide con armadura negra y tentáculos." },
];

// Defensas conectables a nodos de control (PÁG. 373-379).
const RA_DEFENSAS = [
  { name: "Torreta automatizada", vd: 17, pd: 25, nota: "Valor de combate 14. Fusil de asalto, lanzallamas o pistola muy pesada." },
  { name: "Arma cuerpo a cuerpo automatizada", vd: 17, pd: 25, nota: "Valor de combate 14. Cortador de agua a presión o monofilamento giratorio." },
  { name: "Dron aéreo grande", vd: 21, pd: 20, nota: "MOV 6. Lanzadardos, pistola muy pesada y cámara." },
  { name: "Dron arácnido", vd: 21, pd: 40, nota: "MOV 4. Gas lacrimógeno, arma c/c muy pesada y subfusil pesado." },
  { name: "Dron terrestre", vd: 21, pd: 30, nota: "MOV 4. Pistola muy pesada y subfusil." },
  { name: "Rejilla láser", vd: 17, pd: null, nota: "Tocar un láser = golpe de arma c/c muy pesada. Contorsionismo VD17 para cruzar." },
  { name: "Suelo electrificado", vd: 13, pd: 20, nota: "6d6 al cuerpo (reduce blindaje) y repite cada turno hasta salir." },
  { name: "Válvula de gas somnífero", vd: 17, pd: 60, nota: "Resistir torturas/drogas VD13 o inconsciente. Sella las salidas." },
  { name: "Paneles aturdidores", vd: 13, pd: 5, nota: "Resistir torturas/drogas VD15 o heridas críticas ojo/oído dañado 1 min." },
  { name: "Cámaras de vigilancia", vd: 9, pd: 5, nota: "Luz tenue/infrarrojos/UV. Alimenta a un Demonio o a seguridad." },
];

// Reglas de generación.
const RA_RULES = {
  demonPerFloors: 6, // 1 Demonio por cada 6 pisos.
};

// ============================================================
// MÉTODO OFICIAL DE GENERACIÓN (manual básico pág. 209-211)
// ============================================================

// Paso 0 — Grado de dificultad: fija el VD de contraseña/archivo/nodo
// y el Interface del netrunner objetivo. `demon` = Demonio sugerido.
const RA_DIFICULTAD = {
  basica:    { key: "basica",    label: "Básica",     vd: 6,  ifBatalla: 2, ifMortal: null,               demon: "Duende" },
  estandar:  { key: "estandar",  label: "Estándar",   vd: 8,  ifBatalla: 4, ifMortal: "Interface 2 o menos", demon: "Duende" },
  pococomun: { key: "pococomun", label: "Poco común", vd: 10, ifBatalla: 6, ifMortal: "Interface 4 o menos", demon: "Afrit" },
  avanzada:  { key: "avanzada",  label: "Avanzada",   vd: 12, ifBatalla: 8, ifMortal: "Interface 6 o menos", demon: "Balron" },
};

// Vestíbulo (los dos primeros pisos), tirada 1d6. VD fijos según la tabla.
const RA_VESTIBULO = [
  { kind: "file", vd: 6 },              // 1 · Archivo VD6
  { kind: "pass", vd: 6 },              // 2 · Contraseña VD6
  { kind: "pass", vd: 8 },              // 3 · Contraseña VD8
  { kind: "ice",  ice: ["Mofeta"] },    // 4
  { kind: "ice",  ice: ["Fuego fatuo"] }, // 5
  { kind: "ice",  ice: ["Asesino"] },   // 6
];

// Resto de pisos, tirada 3d6 (índices 3-18). Cada celda es o bien una
// lista de programas de hielo negro por dificultad, o una cadena
// ("pass"/"file"/"node") cuyo VD toma el valor de la dificultad elegida.
const RA_PISOS = {
  3:  { basica: ["Perro del infierno"], estandar: ["Perro del infierno", "Perro del infierno"], pococomun: ["Kraken"], avanzada: ["Perro del infierno", "Perro del infierno", "Perro del infierno"] },
  4:  { basica: ["Dientes de sable"], estandar: ["Perro del infierno", "Asesino"], pococomun: ["Perro del infierno", "Escorpión"], avanzada: ["Áspid", "Áspid"] },
  5:  { basica: ["Cuervo", "Cuervo"], estandar: ["Mofeta", "Mofeta"], pococomun: ["Perro del infierno", "Asesino"], avanzada: ["Perro del infierno", "Liche"] },
  6:  { basica: ["Perro del infierno"], estandar: ["Dientes de sable"], pococomun: ["Cuervo", "Cuervo"], avanzada: ["Fuego fatuo", "Fuego fatuo", "Fuego fatuo"] },
  7:  { basica: ["Fuego fatuo"], estandar: ["Escorpión"], pococomun: ["Dientes de sable"], avanzada: ["Perro del infierno", "Dientes de sable"] },
  8:  { basica: ["Cuervo"], estandar: ["Perro del infierno"], pococomun: ["Perro del infierno"], avanzada: ["Kraken"] },
  9:  "pass",
  10: "file",
  11: "node",
  12: "pass",
  13: { basica: ["Mofeta"], estandar: ["Áspid"], pococomun: ["Asesino"], avanzada: ["Gigante"] },
  14: { basica: ["Áspid"], estandar: ["Asesino"], pococomun: ["Liche"], avanzada: ["Dragón"] },
  15: { basica: ["Escorpión"], estandar: ["Liche"], pococomun: ["Dragón"], avanzada: ["Asesino", "Escorpión"] },
  16: { basica: ["Asesino", "Mofeta"], estandar: ["Áspid"], pococomun: ["Áspid", "Cuervo"], avanzada: ["Kraken"] },
  17: { basica: ["Fuego fatuo", "Fuego fatuo", "Fuego fatuo"], estandar: ["Cuervo", "Cuervo", "Cuervo"], pococomun: ["Dragón", "Fuego fatuo"], avanzada: ["Cuervo", "Fuego fatuo", "Perro del infierno"] },
  18: { basica: ["Liche"], estandar: ["Liche", "Cuervo"], pococomun: ["Gigante"], avanzada: ["Dragón", "Dragón"] },
};
