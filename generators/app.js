// ============================================================
// Generador de Cyberpunk RED — lógica de la interfaz
// ============================================================
(() => {
  "use strict";

  // ---------- utilidades de tiradas ----------
  const d = (n) => Math.floor(Math.random() * n) + 1; // 1..n
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const esc = (v) =>
    String(v).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // Elige `count` elementos distintos de un array (o todos si count >= largo).
  function sampleDistinct(arr, count) {
    const pool = arr.slice();
    const out = [];
    const n = Math.min(count, pool.length);
    for (let i = 0; i < n; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      out.push(pool.splice(idx, 1)[0]);
    }
    return out;
  }

  // 1d10 menos 7 (mínimo 0): usado por amigos, enemigos y amores.
  const countMinus7 = () => Math.max(0, d(10) - 7);

  const chip = (label) => `<span class="roll-chip">${esc(label)}</span>`;

  // ---------- tabs ----------
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".panel");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const id = tab.dataset.tab;
      tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", active ? "true" : "false");
      });
      panels.forEach((p) => {
        const active = p.id === `panel-${id}`;
        p.classList.toggle("is-active", active);
        p.hidden = !active;
      });
    });
  });

  // ---------- poblar selects de rol ----------
  const encargoRol = document.getElementById("encargoRol");
  Object.entries(ENCARGOS_ROLES).forEach(([id, r]) => {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = `${r.glyph} ${r.label}`;
    encargoRol.appendChild(opt);
  });

  const vidaRol = document.getElementById("vidaRol");
  Object.entries(LIFEPATH_ROLES).forEach(([id, r]) => {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = r.label;
    vidaRol.appendChild(opt);
  });

  const encuentroZona = document.getElementById("encuentroZona");
  ZONAS_AMENAZA.forEach((z) => {
    const opt = document.createElement("option");
    opt.value = z.id;
    opt.textContent = z.label;
    encuentroZona.appendChild(opt);
  });

  const empty = (msg) => `<div class="result-empty">${esc(msg)}</div>`;

  // ============================================================
  // TRAPICHEOS (por rol) + gancho opcional
  // ============================================================
  function genEncargo() {
    const roleId = encargoRol.value;
    const role = ENCARGOS_ROLES[roleId];
    const nivel = Number(document.getElementById("encargoNivel").value) || 0;
    const accent = role.accent;

    // Trapicheo oficial: 1d6 en la tabla del rol.
    const roll = d(6);
    const trap = TRAPICHEOS_ROLES[roleId][roll - 1];
    const edis = trap.edis[nivel];

    // Gancho de misión homebrew (opcional).
    let ganchoHtml = "";
    if (document.getElementById("encargoGancho").checked) {
      ganchoHtml = `
        <div class="card-section">Gancho de misión (opcional)</div>
        <p class="card-headline">${esc(pick(role.encargos))}</p>
        <div class="dl">
          <div class="dl-row"><div class="dl-key">Contratante</div><div class="dl-val">${esc(pick(ENCARGO_CONTRATANTES))}</div></div>
          <div class="dl-row"><div class="dl-key">Complicación</div><div class="dl-val">${esc(pick(ENCARGO_COMPLICACIONES))}</div></div>
          <div class="dl-row"><div class="dl-key">Recompensa</div><div class="dl-val">${esc(pick(ENCARGO_RECOMPENSAS))}</div></div>
        </div>`;
    }

    const html = `
      <article class="card" style="--card-accent:${accent}">
        <span class="card-tag">${role.glyph} Trapicheo semanal · ${esc(role.label)}</span>
        <p class="card-headline">${chip("1d6 · " + roll)} ${esc(trap.txt)}</p>
        <div class="payout">
          <span class="payout-label">Ganancia (${esc(NIVELES_APTITUD[nivel].label)})</span>
          <span class="payout-value">${edis}ed</span>
        </div>
        ${ganchoHtml}
      </article>`;
    document.getElementById("encargoResult").innerHTML = html;
  }

  // ============================================================
  // MERCADO NOCTURNO
  // ============================================================
  function genMercado() {
    // 1d6 dos veces, resultados distintos.
    const cats = sampleDistinct(MERCADO_CATEGORIAS, 2);
    let groups = "";
    cats.forEach((cat) => {
      const count = d(10); // 1d10 tipos de artículos
      const items = sampleDistinct(MERCADO_STOCK[cat.id], count);
      groups += `
        <div class="stock-group">
          <p class="stock-cat">${esc(cat.label)} ${chip(`${count} art.`)}</p>
          <p class="stock-cat-desc">${esc(cat.desc)}</p>
          <ul class="stock-list">
            ${items.map((it) => `<li>${esc(it)}</li>`).join("")}
          </ul>
        </div>`;
    });
    const html = `
      <article class="card" style="--card-accent:var(--green)">
        <span class="card-tag">🏪 Mercado nocturno improvisado</span>
        <p class="muted-note">Categorías presentes (1d6 ×2) y muestra del stock disponible (1d10 tiradas por categoría).</p>
        ${groups}
      </article>`;
    document.getElementById("mercadoResult").innerHTML = html;
  }

  // ============================================================
  // ENCUENTROS
  // ============================================================
  // Resuelve la cantidad de PNJ de un grupo según el nº de jugadores (N).
  function resolveCount(formula, N) {
    if (typeof formula === "number") return formula;
    switch (formula) {
      case "half":
        return Math.max(1, Math.round(N / 2));
      case "halfMin2":
        return Math.max(2, Math.round(N / 2));
      case "equal":
        return N;
      case "equalMin4":
        return Math.max(4, N);
      case "minus1":
        return Math.max(1, N - 1);
      case "minus2":
        return Math.max(1, N - 2);
      case "minus3min2":
        return Math.max(2, N - 3);
      case "plus2":
        return N + 2;
      default:
        return 1;
    }
  }

  // Explicación legible de cada fórmula (para mostrar al DJ).
  function formulaNote(formula) {
    if (typeof formula === "number") return "cantidad fija";
    return {
      half: "½ de los jugadores",
      halfMin2: "½ de los jugadores (mín. 2)",
      equal: "= nº de jugadores",
      equalMin4: "= nº de jugadores (mín. 4)",
      minus1: "jugadores − 1",
      minus2: "jugadores − 2",
      minus3min2: "jugadores − 3 (mín. 2)",
      plus2: "jugadores + 2",
    }[formula] || "";
  }

  function buildSpawnList(spawn, N) {
    return spawn.map((g) => ({ k: g.k, name: g.name, count: resolveCount(g.n, N), note: formulaNote(g.n) }));
  }

  function genEncuentro() {
    const key = document.getElementById("encuentroMomento").value;
    const table = ENCUENTROS[key];
    const zona = ZONAS_AMENAZA.find((z) => z.id === encuentroZona.value) || ZONAS_AMENAZA[0];
    const N = clampPlayers(document.getElementById("encuentroJugadores").value);

    // Zona ejecutiva: sin encuentros aleatorios.
    if (zona.id === "ejecutiva") {
      const html = `
        <article class="card" style="--card-accent:var(--red)">
          <span class="card-tag">🎲 Encuentro ${esc(table.label.toLowerCase())} · Zona ejecutiva</span>
          <h3 class="card-title">Sin encuentros</h3>
          <p class="dl-val">${esc(zona.note)}</p>
        </article>`;
      document.getElementById("encuentroResult").innerHTML = html;
      return;
    }

    // Tirada percentil (2d10) acotada al índice de amenaza de la zona.
    const roll = zona.min + Math.floor(Math.random() * (zona.max - zona.min + 1));
    const hit = table.entries.find((e) => roll >= e.r[0] && roll <= e.r[1]);
    const shown = roll === 100 ? "00" : String(roll).padStart(2, "0");
    const range =
      hit.r[0] === hit.r[1]
        ? hit.r[0] === 100
          ? "00"
          : String(hit.r[0])
        : `${hit.r[0]}–${hit.r[1] === 100 ? "00" : hit.r[1]}`;
    const zoneTag = zona.id === "any" ? "" : ` · ${esc(zona.label)}`;
    const zoneNote = zona.note ? `<p class="muted-note">${esc(zona.note)}</p>` : "";

    // Composición de PNJ y deep link al Combat Tracker.
    let combatHtml = "";
    if (hit.spawn && hit.spawn.length) {
      const groups = buildSpawnList(hit.spawn, N);
      const total = groups.reduce((s, g) => s + g.count, 0);
      const rows = groups
        .map(
          (g) =>
            `<li><strong>${g.count}×</strong> ${esc(g.name)} <span class="muted-note">(${esc(g.note)})</span></li>`
        )
        .join("");
      // Payload compacto: [{k, n, name}] con las cantidades ya resueltas.
      const payload = groups.map((g) => ({ k: g.k, n: g.count, name: g.name }));
      const href = "../combat-tracker/index.html?add=" + encodeURIComponent(JSON.stringify(payload));
      combatHtml = `
        <div class="card-section">PNJ del encuentro · ${total} en total (para ${N} jugador${N === 1 ? "" : "es"})</div>
        <ul class="list-tight">${rows}</ul>
        <a class="btn-primary btn-link" href="${href}">Enviar al Combat Tracker →</a>`;
    }

    const html = `
      <article class="card" style="--card-accent:var(--cyan)">
        <span class="card-tag">🎲 Encuentro ${esc(table.label.toLowerCase())} · tirada ${shown}${zoneTag}</span>
        <h3 class="card-title">${chip(range)} ${esc(hit.t)}</h3>
        <p class="dl-val">${esc(hit.d)}</p>
        ${zoneNote}
        ${combatHtml}
      </article>`;
    document.getElementById("encuentroResult").innerHTML = html;
  }

  const clampPlayers = (v) => Math.max(1, Math.min(12, parseInt(v, 10) || 4));

  // ============================================================
  // VIDA PASADA
  // ============================================================
  function rows(pairs) {
    return pairs
      .map(
        (p) =>
          `<div class="dl-row"><div class="dl-key">${esc(p[0])}</div><div class="dl-val">${p[1]}</div></div>`
      )
      .join("");
  }

  function genVida() {
    // Origen cultural + idioma.
    const origen = pick(LIFEPATH_ORIGEN);
    const idioma = pick(origen.idiomas);
    const base = [["Origen cultural", `${esc(origen.region)} <span class="muted-note">(idioma: ${esc(idioma)})</span>`]];
    LIFEPATH_GENERAL.forEach((f) => base.push([f.label, esc(pick(f.options))]));

    // Amigos.
    const nAmigos = countMinus7();
    let amigosHtml = `<p class="muted-note">Ninguno por ahora.</p>`;
    if (nAmigos > 0) {
      amigosHtml = `<ul class="list-tight">${sampleWithRepeat(LIFEPATH_AMIGOS, nAmigos)
        .map((a) => `<li>${esc(a)}</li>`)
        .join("")}</ul>`;
    }

    // Enemigos.
    const nEnem = countMinus7();
    let enemHtml = `<p class="muted-note">Ninguno por ahora.</p>`;
    if (nEnem > 0) {
      const list = [];
      for (let i = 0; i < nEnem; i++) {
        list.push(
          `<li><strong>${esc(pick(LIFEPATH_ENEMIGO))}</strong> — ${esc(pick(LIFEPATH_ENEMIGO_CAUSA))} ` +
            `Puede usar contra ti: ${esc(pick(LIFEPATH_ENEMIGO_PODER))} ` +
            `<span class="muted-note">Reacción: ${esc(pick(LIFEPATH_VENGANZA))}</span></li>`
        );
      }
      enemHtml = `<ul class="list-tight">${list.join("")}</ul>`;
    }

    // Amores trágicos.
    const nAmor = countMinus7();
    let amorHtml = `<p class="muted-note">Ninguno por ahora.</p>`;
    if (nAmor > 0) {
      amorHtml = `<ul class="list-tight">${sampleWithRepeat(LIFEPATH_AMOR, nAmor)
        .map((a) => `<li>${esc(a)}</li>`)
        .join("")}</ul>`;
    }

    // Rol opcional.
    let rolHtml = "";
    const rolId = vidaRol.value;
    if (rolId && LIFEPATH_ROLES[rolId]) {
      const role = LIFEPATH_ROLES[rolId];
      const rolRows = role.fields.map((f) => [f.label, esc(pick(f.options))]);
      rolHtml = `
        <div class="card-section">Vida pasada de ${esc(role.label)}</div>
        <div class="dl">${rows(rolRows)}</div>`;
    }

    const html = `
      <article class="card" style="--card-accent:var(--primary)">
        <span class="card-tag">🧬 Trasfondo generado</span>
        <div class="card-section">Relatos de la calle</div>
        <div class="dl">${rows(base)}</div>
        <div class="card-section">Amigos (1d10−7)</div>
        ${amigosHtml}
        <div class="card-section">Enemigos (1d10−7)</div>
        ${enemHtml}
        <div class="card-section">Trágica vida amorosa (1d10−7)</div>
        ${amorHtml}
        ${rolHtml}
      </article>`;
    document.getElementById("vidaResult").innerHTML = html;
  }

  // Toma `count` elementos permitiendo repeticiones (cada amigo/amante es una tirada).
  function sampleWithRepeat(arr, count) {
    const out = [];
    for (let i = 0; i < count; i++) out.push(pick(arr));
    return out;
  }

  // ---------- delegación de acciones ----------
  document.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-action]");
    if (!btn) return;
    switch (btn.dataset.action) {
      case "gen-encargo":
        genEncargo();
        break;
      case "gen-mercado":
        genMercado();
        break;
      case "gen-encuentro":
        genEncuentro();
        break;
      case "gen-vida":
        genVida();
        break;
      case "cw-add":
        cwAdd();
        break;
      case "cw-remove":
        cwRemove(btn.dataset.idx);
        break;
      case "cw-reset":
        cwState = [];
        cwMsg = null;
        cwRender();
        break;
      case "vida-calc":
        vidaCalc();
        break;
    }
  });

  // ============================================================
  // HUMANIDAD & CIBERWARE
  // ============================================================
  // Tira la PH según la notación de dados (1d6, 2d6, 4d6, 1d6/2 al alza).
  function rollPh(dice, avg) {
    if (!dice) return 0;
    const half = /\/\s*2/.test(dice);
    const m = dice.match(/(\d+)d6/);
    if (!m) return avg;
    let total = 0;
    const nd = parseInt(m[1], 10);
    for (let i = 0; i < nd; i++) total += d(6);
    return half ? Math.ceil(total / 2) : total;
  }

  const cwEmp = () => Math.max(1, Math.min(10, parseInt(document.getElementById("cwEmp").value, 10) || 8));
  let cwState = []; // [{name, cat, ph}]
  let cwMsg = null; // aviso/error de la última acción

  function populateCyberware() {
    const dl = document.getElementById("cwList");
    dl.innerHTML = CYBERWARE.map(
      (c) => `<option value="${esc(c.name)}">${esc(c.cat)} · PH ${c.ph}${c.dice ? " (" + esc(c.dice) + ")" : ""}</option>`
    ).join("");
  }

  // --- Modelo de ranuras (ficha del jugador) ---
  // Piezas base que aportan ranuras de opciones a su pool.
  const CW_BASES = {
    "Conexión neuronal": { pool: "neural", provides: 5 },
    Ciberojo: { pool: "optica", provides: 3 },
    "Equipo de ciberaudio": { pool: "audio", provides: 3 },
    Ciberbrazo: { pool: "brazo", provides: 4 },
    Ciberpierna: { pool: "pierna", provides: 3 },
  };
  // Pools de categoría con capacidad fija (no requieren pieza base).
  const CW_FIXED_POOLS = { cibermoda: 7, interno: 7, externo: 7 };
  const CW_POOL_LABEL = {
    neural: "Neuralware (conexión neuronal)",
    optica: "Ciberóptica (ciberojos)",
    audio: "Ciberaudio",
    brazo: "Ciberbrazo",
    pierna: "Ciberpierna",
    cibermoda: "Cibermoda",
    interno: "Ciberequipo interno",
    externo: "Ciberequipo externo",
  };

  const cwNorm = (s) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Bases requeridas por una opción (array de nombres; para "brazo o pierna" basta una).
  function cwRequiredBases(item) {
    const n = cwNorm(item.desc);
    if (/requiere.*conexion neuronal/.test(n)) return ["Conexión neuronal"];
    if (/requiere.*equipo de ciberaudio/.test(n)) return ["Equipo de ciberaudio"];
    if (/requiere.*ciberojo/.test(n) || /requiere dos ciberojos/.test(n)) return ["Ciberojo"];
    if (/requiere un ciberbrazo o ciberpierna/.test(n)) return ["Ciberbrazo", "Ciberpierna"];
    if (/requiere.*ciberpierna/.test(n) || /requiere dos ciberpiernas/.test(n)) return ["Ciberpierna"];
    if (/requiere.*ciberbrazo/.test(n)) return ["Ciberbrazo"];
    return [];
  }

  // Ranuras que ocupa una opción (0 si es base o "no ocupa ninguna ranura").
  function cwSlotCost(item) {
    if (CW_BASES[item.name]) return 0;
    const n = cwNorm(item.desc);
    if (/no ocupa ninguna ranura/.test(n)) return 0;
    const m = n.match(/ocupa (\d+) ranuras? de opciones/);
    if (m) return parseInt(m[1], 10);
    return 1;
  }

  // Pool del que consume ranuras la opción.
  function cwPoolOf(item) {
    if (CW_BASES[item.name]) return CW_BASES[item.name].pool;
    const req = cwRequiredBases(item);
    if (req.length) return CW_BASES[req[0]].pool;
    switch (item.cat) {
      case "Cibermoda":
        return "cibermoda";
      case "Ciberequipo externo":
        return "externo";
      case "Neuralware":
        return "neural";
      case "Ciberóptica":
        return "optica";
      case "Ciberaudio":
        return "audio";
      case "Cibermiembros":
        return "brazo";
      default:
        return "interno";
    }
  }

  const cwPoolUsed = (pool) =>
    cwState.reduce((s, c) => {
      const it = CYBERWARE.find((x) => x.name === c.name);
      return it && cwPoolOf(it) === pool ? s + cwSlotCost(it) : s;
    }, 0);

  const cwCount = (name) => cwState.filter((c) => c.name === name).length;

  function cwPoolCapacity(pool, extraBases = []) {
    if (CW_FIXED_POOLS[pool] != null) return CW_FIXED_POOLS[pool];
    const provider = Object.keys(CW_BASES).find((k) => CW_BASES[k].pool === pool);
    if (!provider) return 0;
    const n = cwCount(provider) + extraBases.filter((b) => b === provider).length;
    return n * CW_BASES[provider].provides;
  }

  function cwAdd() {
    const name = document.getElementById("cwSearch").value.trim();
    const item = CYBERWARE.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (!item) return;

    // Requisitos: bases que faltan (se auto-instalarán si procede).
    const req = cwRequiredBases(item);
    let missing = [];
    if (req.length && !req.some((b) => cwCount(b) > 0)) missing = [req[0]];

    // Comprobar ranuras (contando la base que se auto-instalaría).
    const pool = cwPoolOf(item);
    const cost = cwSlotCost(item);
    const cap = cwPoolCapacity(pool, missing);
    const used = cwPoolUsed(pool);
    if (cost > 0 && used + cost > cap) {
      cwMsg = {
        tone: "danger",
        text: `No quedan ranuras en ${CW_POOL_LABEL[pool] || pool}: ${used}/${cap} usadas y esta pieza necesita ${cost}. Instala otra base o retira algo.`,
      };
      cwRender();
      return;
    }

    const roll = document.getElementById("cwRoll").checked;
    const addPiece = (it) => {
      const ph = roll ? rollPh(it.dice, it.ph) : it.ph;
      cwState.push({ name: it.name, cat: it.cat, ph, rolled: roll && !!it.dice });
    };

    // Auto-instalar la base que falte (opción "warning + instalar").
    missing.forEach((b) => {
      const base = CYBERWARE.find((c) => c.name === b);
      if (base) addPiece(base);
    });
    addPiece(item);

    cwMsg = missing.length ? { tone: "warn", text: `Requería ${missing.join(", ")}: se ha instalado también.` } : null;
    document.getElementById("cwSearch").value = "";
    document.getElementById("cwPreview").innerHTML = "";
    cwRender();
  }

  function cwRemove(idx) {
    cwState.splice(Number(idx), 1);
    cwMsg = null;
    cwRender();
  }

  // Formatea la notación de PH para lectura (1d6/2alalza -> 1d6÷2 redondeo al alza).
  function prettyDice(dice) {
    if (!dice) return "";
    if (/\/\s*2/.test(dice)) return dice.replace(/\/.*/, "") + "÷2 (al alza)";
    return dice;
  }

  // Vista previa de la pieza seleccionada: qué hace, coste, instalación, ranuras y requisitos.
  function cwPreview() {
    const name = document.getElementById("cwSearch").value.trim();
    const item = CYBERWARE.find((c) => c.name.toLowerCase() === name.toLowerCase());
    const box = document.getElementById("cwPreview");
    if (!item) {
      box.innerHTML = "";
      return;
    }
    const phTxt = item.ph === 0 ? "0 (no reduce Humanidad)" : `${item.ph}${item.dice ? " (" + prettyDice(item.dice) + ")" : ""}`;
    const cost = cwSlotCost(item);
    const pool = cwPoolOf(item);
    const base = CW_BASES[item.name];
    const slotTxt = base
      ? `Pieza base: aporta ${base.provides} ranuras de opciones (${esc(CW_POOL_LABEL[base.pool])})`
      : cost === 0
        ? "No ocupa ranuras de opciones"
        : `Ocupa ${cost} ranura${cost === 1 ? "" : "s"} de ${esc(CW_POOL_LABEL[pool] || pool)}`;
    const reqHtml = item.reqs && item.reqs.length
      ? `<div class="dl-row"><div class="dl-key">Requisitos</div><div class="dl-val">${item.reqs.map(esc).join(" · ")}</div></div>`
      : "";
    box.innerHTML = `
      <article class="card" style="--card-accent:var(--cyan)">
        <span class="card-tag">🦾 ${esc(item.cat)}</span>
        <h3 class="card-title">${esc(item.name)}</h3>
        <p class="dl-val">${esc(item.desc)}</p>
        <div class="dl" style="margin-top:12px">
          <div class="dl-row"><div class="dl-key">Pérdida de Humanidad</div><div class="dl-val">${esc(phTxt)}</div></div>
          <div class="dl-row"><div class="dl-key">Coste de la pieza</div><div class="dl-val">${esc(item.cost)}</div></div>
          <div class="dl-row"><div class="dl-key">Instalación</div><div class="dl-val">${esc(item.install)}${item.vd ? " · Cirugía " + esc(item.vd) + " (tecnomédico)" : ""}${item.edis ? " · " + esc(item.edis) + " en hospital" : ""}</div></div>
          <div class="dl-row"><div class="dl-key">Ranuras</div><div class="dl-val">${slotTxt}</div></div>
          ${reqHtml}
        </div>
      </article>`;
  }

  function cwRender() {
    const emp = cwEmp();
    const baseHum = emp * 10;
    const lost = cwState.reduce((s, c) => s + c.ph, 0);
    const hum = baseHum - lost;
    const curEmp = Math.max(0, Math.floor(hum / 10));
    const status = CIBERPSICOSIS[Math.min(3, Math.max(0, curEmp))] || CIBERPSICOSIS[3];
    const accent = status.tone === "danger" ? "var(--red)" : status.tone === "warn" ? "var(--primary)" : "var(--green)";

    // Aviso/error de la última acción.
    const msgHtml = cwMsg
      ? `<div class="cw-msg cw-msg-${cwMsg.tone}">${esc(cwMsg.text)}</div>`
      : "";

    // Ranuras en uso por pool (solo los que tienen capacidad o uso).
    const pools = ["neural", "optica", "audio", "brazo", "pierna", "cibermoda", "interno", "externo"];
    const slotRows = pools
      .map((p) => ({ p, used: cwPoolUsed(p), cap: cwPoolCapacity(p) }))
      .filter((x) => x.cap > 0 || x.used > 0)
      .map((x) => {
        const full = x.used >= x.cap && x.cap > 0;
        return `<div class="dl-row"><div class="dl-key">${esc(CW_POOL_LABEL[x.p])}</div><div class="dl-val"${full ? ' style="color:var(--red)"' : ""}>${x.used}/${x.cap} ranuras</div></div>`;
      })
      .join("");
    const slotHtml = slotRows
      ? `<div class="card-section">Ranuras de opciones</div><div class="dl">${slotRows}</div>`
      : "";

    const detail = (name) => CYBERWARE.find((c) => c.name === name) || {};
    const list = cwState.length
      ? `<ul class="list-tight">${cwState
          .map((c, i) => {
            const it = detail(c.name);
            const inst = it.vd ? ` · ${esc(it.install)} ${esc(it.vd)}${it.edis ? " / " + esc(it.edis) : ""}` : "";
            return (
              `<li><strong>−${c.ph} PH</strong> · ${esc(c.name)} ` +
              `<span class="muted-note">${esc(c.cat)}${c.rolled ? " · tirado" : ""}${inst}</span> ` +
              `<button class="cw-del" type="button" data-action="cw-remove" data-idx="${i}" aria-label="Quitar">✕</button></li>`
            );
          })
          .join("")}</ul>`
      : `<p class="muted-note">Sin ciberware instalado.</p>`;

    const html = `
      <article class="card" style="--card-accent:${accent}">
        <span class="card-tag">🦾 Humanidad ${hum < 0 ? "(negativa)" : ""}</span>
        ${msgHtml}
        <div class="stat-grid">
          <div class="stat-box"><span class="stat-num">${hum}</span><span class="stat-lbl">Humanidad</span></div>
          <div class="stat-box"><span class="stat-num">${curEmp}</span><span class="stat-lbl">EMP actual</span></div>
          <div class="stat-box"><span class="stat-num">−${lost}</span><span class="stat-lbl">PH total</span></div>
        </div>
        <div class="payout" style="--card-accent:${accent}">
          <span class="payout-label">${esc(status.label)}</span>
          <span class="payout-value" style="font-size:16px">${esc(status.text)}</span>
        </div>
        ${slotHtml}
        <div class="card-section">Ciberware instalado (${cwState.length})${cwState.length ? ' · <button class="btn-link-sm" type="button" data-action="cw-reset">vaciar</button>' : ""}</div>
        ${list}
      </article>`;
    document.getElementById("ciberwareResult").innerHTML = html;
  }

  // ============================================================
  // ESTILO DE VIDA
  // ============================================================
  const fmt = (n) => n.toLocaleString("es-ES") + "ed";

  function populateVida() {
    const c = document.getElementById("vidaComida");
    c.innerHTML = ESTILO_VIDA.map((e) => `<option value="${e.id}">${esc(e.label)} · ${fmt(e.cost)}/mes</option>`).join("");
    const a = document.getElementById("vidaAloja");
    a.innerHTML = ALOJAMIENTO.map(
      (e) => `<option value="${e.id}">${esc(e.label)} · ${e.rent > 0 ? fmt(e.rent) + "/mes" : "sin alquiler"}</option>`
    ).join("");
  }

  function vidaCalc() {
    const comida = ESTILO_VIDA.find((e) => e.id === document.getElementById("vidaComida").value);
    const aloja = ALOJAMIENTO.find((e) => e.id === document.getElementById("vidaAloja").value);
    const semanal = Math.max(0, parseInt(document.getElementById("vidaIngreso").value, 10) || 0);
    const mensualGasto = comida.cost + aloja.rent;
    const mensualIngreso = Math.round(semanal * 4.33); // ~4,33 semanas/mes
    const balance = mensualIngreso - mensualGasto;
    const balAccent = balance >= 0 ? "var(--green)" : "var(--red)";

    const ingresoRow = semanal > 0
      ? `<div class="dl-row"><div class="dl-key">Ingreso mensual (~4,33 sem.)</div><div class="dl-val">${fmt(mensualIngreso)}</div></div>
         <div class="dl-row"><div class="dl-key">Balance</div><div class="dl-val" style="color:${balAccent}">${balance >= 0 ? "+" : ""}${fmt(balance)}${balance < 0 ? " — no llegas a fin de mes" : ""}</div></div>`
      : "";

    const html = `
      <article class="card" style="--card-accent:var(--green)">
        <span class="card-tag">🏠 Coste de vida mensual</span>
        <div class="payout">
          <span class="payout-label">Gasto mensual total</span>
          <span class="payout-value">${fmt(mensualGasto)}</span>
        </div>
        <div class="dl" style="margin-top:14px">
          <div class="dl-row"><div class="dl-key">Comida — ${esc(comida.label)}</div><div class="dl-val">${fmt(comida.cost)}/mes<br><span class="muted-note">${esc(comida.desc)}</span></div></div>
          <div class="dl-row"><div class="dl-key">Alojamiento — ${esc(aloja.label)}</div><div class="dl-val">${aloja.rent > 0 ? fmt(aloja.rent) + "/mes" : "Sin alquiler"}${aloja.buy ? " · compra " + fmt(aloja.buy) : ""}<br><span class="muted-note">${esc(aloja.note)}</span></div></div>
          ${ingresoRow}
        </div>
      </article>`;
    document.getElementById("vidaEconResult").innerHTML = html;
  }

  // ---------- estado inicial ----------
  document.getElementById("encargoResult").innerHTML = empty("Elige un rol y su nivel de aptitud, y pulsa «Generar trapicheo».");
  document.getElementById("mercadoResult").innerHTML = empty("Pulsa «Generar mercado» para improvisar uno.");
  document.getElementById("encuentroResult").innerHTML = empty("Elige el momento del día y tira un encuentro.");
  document.getElementById("vidaResult").innerHTML = empty("Pulsa «Generar trasfondo» para crear una vida pasada.");
  populateCyberware();
  cwRender();
  populateVida();
  document.getElementById("vidaEconResult").innerHTML = empty("Elige comida y alojamiento y pulsa «Calcular».");
  document.getElementById("cwEmp").addEventListener("input", cwRender);
  document.getElementById("cwSearch").addEventListener("input", cwPreview);
})();
