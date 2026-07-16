// ============================================================
// Trauma Team — datos (manual básico, cap. Trauma Team, pág. 219-234)
// Heridas críticas, estados de herida, drogas, terapias,
// ingresos de hospital y el propio equipo de Trauma Team.
// ============================================================

// Heridas críticas (2d6): efecto + remedio rápido + tratamiento.
const TT_HERIDAS = {
  cuerpo: {
    label: "Cuerpo",
    entries: [
      { r: 2, name: "Brazo amputado", effect: "El brazo ya no está. Sueltas lo que llevaras en esa mano. +1 a la penalización de salvación contra muerte.", remedio: "N/A", trat: "Cirugía VD17" },
      { r: 3, name: "Mano amputada", effect: "La mano ya no está. Sueltas lo que llevaras en esa mano. +1 a la penalización de salvación contra muerte.", remedio: "N/A", trat: "Cirugía VD17" },
      { r: 4, name: "Colapso pulmonar", effect: "−2 a MOV (mínimo 1). +1 a la penalización de salvación contra muerte.", remedio: "Enfermería VD15", trat: "Cirugía VD15" },
      { r: 5, name: "Costillas rotas", effect: "Al final de cada turno en que te muevas más de 4 m a pie, vuelves a sufrir 5 PD directos.", remedio: "Enfermería VD13", trat: "Enfermería VD15 o Cirugía VD13" },
      { r: 6, name: "Brazo roto", effect: "No puedes usar ese brazo. Sueltas lo que llevaras en esa mano.", remedio: "Enfermería VD13", trat: "Enfermería VD15 o Cirugía VD13" },
      { r: 7, name: "Objeto extraño", effect: "Al final de cada turno en que te muevas más de 4 m a pie, vuelves a sufrir 5 PD directos.", remedio: "Primeros auxilios o Enfermería VD13", trat: "El remedio rápido lo elimina de forma permanente" },
      { r: 8, name: "Pierna rota", effect: "−4 a MOV (mínimo 1).", remedio: "Enfermería VD13", trat: "Enfermería VD15 o Cirugía VD13" },
      { r: 9, name: "Desgarro muscular", effect: "−2 a los ataques cuerpo a cuerpo.", remedio: "Primeros auxilios o Enfermería VD13", trat: "El remedio rápido lo elimina de forma permanente" },
      { r: 10, name: "Lesión de columna", effect: "En tu siguiente turno solo puedes realizar la acción de Movimiento. +1 a la penalización de salvación contra muerte.", remedio: "Enfermería VD15", trat: "Cirugía VD15" },
      { r: 11, name: "Dedos aplastados", effect: "−4 a todas las acciones que impliquen esa mano.", remedio: "Enfermería VD13", trat: "Cirugía VD15" },
      { r: 12, name: "Pierna amputada", effect: "La pierna ya no está. −6 a MOV (mínimo 1). No puedes esquivar ataques. +1 a la penalización de salvación contra muerte.", remedio: "N/A", trat: "Cirugía VD17" },
    ],
  },
  cabeza: {
    label: "Cabeza",
    entries: [
      { r: 2, name: "Ojo perdido", effect: "El ojo ya no está. −4 a ataques a distancia y a Percepción visual. +1 a la penalización de salvación contra muerte.", remedio: "N/A", trat: "Cirugía VD17" },
      { r: 3, name: "Lesión cerebral", effect: "−2 a todas las acciones. +1 a la penalización de salvación contra muerte.", remedio: "N/A", trat: "Cirugía VD17" },
      { r: 4, name: "Ojo dañado", effect: "−2 a ataques a distancia y a Percepción visual.", remedio: "Enfermería VD15", trat: "Cirugía VD13" },
      { r: 5, name: "Conmoción cerebral", effect: "−2 a todas las acciones.", remedio: "Primeros auxilios o Enfermería VD13", trat: "El remedio rápido lo elimina de forma permanente" },
      { r: 6, name: "Mandíbula rota", effect: "−4 a todas las acciones que impliquen hablar.", remedio: "Enfermería VD13", trat: "Enfermería o Cirugía VD13" },
      { r: 7, name: "Objeto extraño", effect: "Al final de cada turno en que te muevas más de 4 m a pie, vuelves a sufrir 5 PD directos.", remedio: "Primeros auxilios o Enfermería VD13", trat: "El remedio rápido lo elimina de forma permanente" },
      { r: 8, name: "Latigazo cervical", effect: "+1 a la penalización de salvación contra muerte.", remedio: "Enfermería VD13", trat: "Enfermería o Cirugía VD13" },
      { r: 9, name: "Cráneo fracturado", effect: "Los tiros de precisión a la cabeza multiplican el daño que atraviesa la CP por 3 en vez de por 2. +1 a la penalización de salvación contra muerte.", remedio: "Enfermería VD15", trat: "Enfermería o Cirugía VD15" },
      { r: 10, name: "Oído dañado", effect: "Si te mueves más de 4 m a pie, no podrás usar acción de Movimiento el turno siguiente. −2 a Percepción por oído.", remedio: "Enfermería VD13", trat: "Cirugía VD13" },
      { r: 11, name: "Tráquea aplastada", effect: "No puedes hablar. +1 a la penalización de salvación contra muerte.", remedio: "N/A", trat: "Cirugía VD15" },
      { r: 12, name: "Oreja perdida", effect: "La oreja ya no está. Si te mueves más de 4 m a pie, no podrás usar acción de Movimiento el turno siguiente. −4 a Percepción por oído. +1 a la penalización de salvación contra muerte.", remedio: "N/A", trat: "Cirugía VD17" },
    ],
  },
};

// Toda herida crítica inflige además 5 PD directos.
const TT_BONUS_DAMAGE = 5;

// Estados de herida y VD para estabilizar (PÁG. 220).
const TT_ESTADOS = [
  { estado: "Ligeramente herido", umbral: "PD por debajo del máximo", efecto: "Ninguno.", vd: "VD10" },
  { estado: "Gravemente herido", umbral: "PD por debajo de la mitad (redondeo al alza)", efecto: "−2 a todas las acciones.", vd: "VD13" },
  { estado: "Mortalmente herido", umbral: "PD por debajo de 1", efecto: "−4 a todas las acciones · −6 a MOV (mín. 1) · salvación contra muerte al inicio de cada turno · sufre una herida crítica cada vez que recibe daño.", vd: "VD15 (recupera hasta 1 PD y queda inconsciente 1 minuto)" },
  { estado: "Muerto", umbral: "Una salvación contra muerte fallada", efecto: "Muerte. No hay vuelta atrás.", vd: "Nunca regresará" },
];

// Ingresos de hospital: se cobra por el mayor VD requerido (PÁG. 225).
const TT_HOSPITAL = [
  { vd: "VD17 o superior", cost: "1.000ed (muy caro)" },
  { vd: "VD15", cost: "500ed (caro)" },
  { vd: "VD13", cost: "100ed (superior)" },
  { vd: "VD10", cost: "50ed (costoso)" },
];

// Coste/VD de instalación de ciberware (PÁG. 230).
const TT_INSTALL = [
  { lugar: "Centro comercial", vd: "VD13", cost: "100ed (superior)" },
  { lugar: "Clínica", vd: "VD15", cost: "500ed (caro)" },
  { lugar: "Hospital", vd: "VD17", cost: "1.000ed (muy caro)" },
];

// Drogas de la calle (PÁG. 231-233).
const TT_DROGAS = [
  {
    name: "Encaje negro",
    cost: "50ed (costoso)",
    primario: ["Dura 24 horas.", "Sufres 2d6 de pérdida de Humanidad al tomar la dosis (se recupera si no te afecta el efecto secundario).", "Mientras dura, ignoras los efectos del estado de herida grave."],
    vd: "VD17",
    secundario: ["La pérdida de Humanidad del efecto primario no se recupera.", "Si no eras adicto, ahora lo eres. Mientras adicto y sin efecto primario, tus REF se reducen en 2."],
  },
  {
    name: "Cristal azul",
    cost: "20ed (asequible)",
    primario: ["Dura 4 horas.", "El DJ te dirá de vez en cuando que tienes un «apagón»: alucinaciones que te hacen perder tu acción ese turno."],
    vd: "VD15",
    secundario: ["Si no eras adicto, ahora lo eres.", "Adicto: apagones ocasionales. Mientras experimentas el efecto primario eres inmune a los apagones (lo tomas para estabilizarte)."],
  },
  {
    name: "Boost",
    cost: "50ed (costoso)",
    primario: ["Dura 24 horas.", "La INT del usuario aumenta en 2 (puede superar 8)."],
    vd: "VD17",
    secundario: ["Si no eras adicto, ahora lo eres. Mientras adicto, tu INT se reduce en 2."],
  },
  {
    name: "Smash",
    cost: "10ed (barato)",
    primario: ["Dura 4 horas.", "Eufórico, suelto y listo para la fiesta: +2 a Actuar, Baile, Contorsionismo, Conversación, Percepción humana y Persuasión."],
    vd: "VD15",
    secundario: ["Si no eras adicto, ahora lo eres.", "Adicto: pérdida de interés y −2 a Actuar, Baile, Contorsionismo, Conversación, Percepción humana y Persuasión. Te apetece tomar más."],
  },
  {
    name: "Sintecoca",
    cost: "20ed (asequible)",
    primario: ["Dura 4 horas.", "Los REF aumentan en 1 (puede superar 8). Propenso a imaginaciones paranoicas."],
    vd: "VD15",
    secundario: ["Si no eras adicto, ahora lo eres. Mientras adicto, tus REF se reducen en 2 salvo bajo efecto primario. Te apetece tomar más."],
  },
];

// Terapias (PÁG. 232-234).
const TT_TERAPIAS = [
  { name: "Adicción", desc: "Una semana de psicoterapia intensiva con medicación contra la adicción en un entorno seguro.", cost: "1.000ed (muy caro)", vd: "VD15 · materiales 500ed", efecto: "El paciente se libra de una adicción. Durante 1 año, siempre que tire contra el efecto secundario de esa fuente, falla automáticamente." },
  { name: "Pérdida de Humanidad estándar", desc: "Una semana de psicoterapia (control del estrés/ira, hipnosis, reprogramación cerebral leve) con fármacos y entorno seguro.", cost: "500ed (caro)", vd: "VD15 · materiales 100ed", efecto: "Recupera 2d6 de Humanidad perdida. No puede recuperarse por completo sin quitar el ciberequipo (cada pieza estándar reduce la HUM máxima en 2; borgware en 4)." },
  { name: "Pérdida de Humanidad extrema", desc: "Una semana de psicoterapia con reprogramación cerebral directa y extrema, solo posible con fármacos de última generación y entorno seguro.", cost: "1.000ed (muy caro)", vd: "VD17 · materiales 500ed", efecto: "Recupera 4d6 de Humanidad perdida. Mismas limitaciones que la terapia estándar." },
];

// El equipo de Trauma Team (PÁG. 224).
const TT_MIEMBROS = [
  { name: "Médico del Trauma Team", cv: 10, cp: 11, pd: 20, mov: 4, desc: "Tecnomédico con chaqueta blindada ligera; criobomba y pistola pesada. Lleva 2 jeringas de aire comprimido con Rapidetox. Usa su CV para Cirugía, Enfermería, Primeros auxilios y Tecnología médica.", qty: 1 },
  { name: "Asistente médico del Trauma Team", cv: 10, cp: 7, pd: 25, mov: 6, desc: "Tecnomédico con Kevlar®, criobomba y escudo antibalas. Usa su CV para Enfermería, Pilotar vehículo aéreo, Primeros auxilios y Tecnología médica.", qty: 1 },
  { name: "Piloto del Trauma Team", cv: 10, cp: 7, pd: 25, mov: 6, desc: "Piloto con Kevlar® y pistola muy pesada. Usa su CV para Mecánica de vehículos aéreos, Pilotar vehículo aéreo y Primeros auxilios.", qty: 1 },
  { name: "Oficial de seguridad del Trauma Team", cv: 10, cp: 13, pd: 30, mov: 4, desc: "Soldado de alquiler con chaqueta blindada pesada y fusil de asalto.", qty: 2 },
];

const TT_SERVICIO = {
  plata: {
    label: "Plata",
    price: "500ed/mes",
    text: "Se cobra por los tratamientos que requieren Cirugía, con el mismo coste que en un hospital. Si no quieres pagar de más, el TT hará lo posible con Enfermería antes de llevarte al hospital más cercano.",
  },
  ejecutivo: {
    label: "Ejecutivo",
    price: "1.000ed/mes",
    text: "Incluye los tratamientos que requieren Cirugía sin coste adicional.",
  },
  general:
    "Ambos planes son transferibles individualmente (puedes cubrir a un amigo, no a dos a la vez ni si ya has llamado por ti). Registrar tu tarjeta en un agente con biomonitor permite la llamada automática cuando tus PD bajan de tu TCO o sufres una amputación. Al llamar, tira 1d6: son los asaltos hasta que llega el AV-4.",
};
