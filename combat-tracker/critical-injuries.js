/**
 * Tablas de heridas críticas de Cyberpunk RED (manual básico, pág. 187 y 192).
 *
 * Regla: cuando dos o más dados de daño sacan un 6, se inflige una herida
 * crítica. Se tira 2d6 en la tabla correspondiente (cuerpo o cabeza) hasta
 * obtener una herida que el objetivo no esté sufriendo. Toda herida crítica
 * inflige además 5 PD directos (no daña la armadura ni se modifica por
 * localización).
 *
 * Cada entrada incluye:
 *  - roll: resultado de 2d6
 *  - name: nombre de la herida
 *  - effect: desventaja mecánica que aplica
 *  - auto: penalización numérica que la app puede recordar (texto corto)
 */

// eslint-disable-next-line no-unused-vars
const CRIT_BONUS_DAMAGE = 5;

// eslint-disable-next-line no-unused-vars
const CRITICAL_INJURIES = {
  body: {
    2: {
      name: "Brazo amputado",
      effect:
        "El brazo ya no está. Suelta lo que llevara en esa mano. +1 a la penalización de salvación contra muerte.",
      auto: "+1 salv. muerte",
    },
    3: {
      name: "Mano amputada",
      effect:
        "La mano ya no está. Suelta lo que llevara en esa mano. +1 a la penalización de salvación contra muerte.",
      auto: "+1 salv. muerte",
    },
    4: {
      name: "Colapso pulmonar",
      effect: "−2 a MOV (mínimo 1). +1 a la penalización de salvación contra muerte.",
      auto: "−2 MOV · +1 salv.",
    },
    5: {
      name: "Costillas rotas",
      effect:
        "Al final de cada turno en que se mueva más de 4 m a pie, vuelve a sufrir 5 PD directos por esta herida.",
      auto: "5 PD si mueve >4 m",
    },
    6: {
      name: "Brazo roto",
      effect: "No puede usar ese brazo. Suelta lo que llevara en esa mano.",
      auto: "Brazo inutilizado",
    },
    7: {
      name: "Objeto extraño",
      effect:
        "Al final de cada turno en que se mueva más de 4 m a pie, vuelve a sufrir 5 PD directos por esta herida.",
      auto: "5 PD si mueve >4 m",
    },
    8: {
      name: "Pierna rota",
      effect: "−4 a MOV (mínimo 1).",
      auto: "−4 MOV",
    },
    9: {
      name: "Desgarro muscular",
      effect: "−2 a los ataques cuerpo a cuerpo.",
      auto: "−2 melee",
    },
    10: {
      name: "Lesión de columna",
      effect:
        "En su siguiente turno solo puede realizar la acción de Movimiento. +1 a la penalización de salvación contra muerte.",
      auto: "Solo mover 1 turno",
    },
    11: {
      name: "Dedos aplastados",
      effect: "−4 a todas las acciones que impliquen esa mano.",
      auto: "−4 con esa mano",
    },
    12: {
      name: "Pierna amputada",
      effect:
        "La pierna ya no está. −6 a MOV (mínimo 1). No puede esquivar ataques. +1 a la penalización de salvación contra muerte.",
      auto: "−6 MOV · sin esquiva",
    },
  },
  head: {
    2: {
      name: "Ojo perdido",
      effect:
        "El ojo ya no está. −4 a los ataques a distancia y a Percepción visual. +1 a la penalización de salvación contra muerte.",
      auto: "−4 distancia/vista",
    },
    3: {
      name: "Lesión cerebral",
      effect: "−2 a todas las acciones. +1 a la penalización de salvación contra muerte.",
      auto: "−2 a todo",
    },
    4: {
      name: "Ojo dañado",
      effect: "−2 a los ataques a distancia y a Percepción visual.",
      auto: "−2 distancia/vista",
    },
    5: {
      name: "Conmoción cerebral",
      effect: "−2 a todas las acciones.",
      auto: "−2 a todo",
    },
    6: {
      name: "Mandíbula rota",
      effect: "−4 a todas las acciones que impliquen hablar.",
      auto: "−4 al hablar",
    },
    7: {
      name: "Objeto extraño",
      effect:
        "Al final de cada turno en que se mueva más de 4 m a pie, vuelve a sufrir 5 PD directos por esta herida.",
      auto: "5 PD si mueve >4 m",
    },
    8: {
      name: "Latigazo cervical",
      effect: "+1 a la penalización de salvación contra muerte.",
      auto: "+1 salv. muerte",
    },
    9: {
      name: "Cráneo fracturado",
      effect:
        "Los tiros de precisión a la cabeza multiplican el daño que atraviesa la CP por 3 en vez de por 2. +1 a la penalización de salvación contra muerte.",
      auto: "Cabeza ×3",
    },
    10: {
      name: "Oído dañado",
      effect:
        "Si se mueve más de 4 m a pie, no podrá usar acción de Movimiento el turno siguiente. −2 a Percepción por oído.",
      auto: "−2 oído",
    },
    11: {
      name: "Tráquea aplastada",
      effect: "No puede hablar. +1 a la penalización de salvación contra muerte.",
      auto: "No puede hablar",
    },
    12: {
      name: "Oreja perdida",
      effect:
        "La oreja ya no está. Si se mueve más de 4 m a pie, no podrá usar acción de Movimiento el turno siguiente. −4 a Percepción por oído. +1 a la penalización de salvación contra muerte.",
      auto: "−4 oído",
    },
  },
};
