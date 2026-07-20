/* ============================================================
 * Cyberpunk RED — Combat Tracker
 * Static app: state en memoria + persistencia en localStorage.
 * Reglas de daño extraídas del manual básico (páginas de combate a
 * distancia / cuerpo a cuerpo / cuando el blindaje no es suficiente).
 * ============================================================ */

(() => {
  "use strict";

  // -------- Storage keys --------
  const STORAGE_ENEMIES = "ct.enemies.v1";
  const STORAGE_TEMPLATES = "ct.customTemplates.v1";

  // -------- State --------
  const state = {
    enemies: [],
    customTemplates: {}, // { [name]: { maxHp, bodySp, headSp, magazine, description } }
    selectedTargets: new Set(),
    selectedTemplateKey: null, // key of built-in or custom name
  };

  // -------- Utils --------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const genId = () => "e_" + Math.random().toString(36).slice(2, 9);

  const esc = (v) =>
    String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const parseIntSafe = (v, fallback = 0) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : fallback;
  };

  // Inline Iconoir icons (https://iconoir.com) — no external deps, work offline.
  const ICON_PATHS = {
    help: '<path d="M9 9a3 3 0 1 1 3.5 2.955c-.85.174-1.5.943-1.5 1.812V14"/><path d="M12 17.01l.01-.011"/><circle cx="12" cy="12" r="9"/>',
    xmark: '<path d="M6.758 17.243 12 12l5.243-5.243M6.758 6.757 12 12l5.243 5.243"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/>',
    heart: '<path d="M22 8.86a5.95 5.95 0 0 1-1.654 4.13c-2.441 2.53-4.809 5.17-7.34 7.608a1.42 1.42 0 0 1-2.019-.038C8.464 18.11 6.096 15.47 3.654 12.99a5.96 5.96 0 0 1 0-8.26 5.68 5.68 0 0 1 8.24 0l.106.11.105-.11a5.68 5.68 0 0 1 8.24 0A5.95 5.95 0 0 1 22 8.86Z"/>',
  };

  const icon = (name) =>
    `<svg class="icn" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ` +
    `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name] || ""}</svg>`;

  const debounce = (fn, ms) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  };

  // -------- Persistence --------
  const loadState = () => {
    try {
      const raw = localStorage.getItem(STORAGE_ENEMIES);
      if (raw) state.enemies = (JSON.parse(raw) || []).map(normalizeEnemy);
    } catch (_) {
      state.enemies = [];
    }
    try {
      const raw = localStorage.getItem(STORAGE_TEMPLATES);
      if (raw) state.customTemplates = JSON.parse(raw) || {};
    } catch (_) {
      state.customTemplates = {};
    }
  };

  /** Fills in any missing fields so older/partial saved enemies stay valid. */
  const normalizeEnemy = (e) => {
    const maxHp = parseIntSafe(e && e.maxHp, 30);
    const bodySp = parseIntSafe(e && e.bodySp, 0);
    const headSp = parseIntSafe(e && e.headSp, 0);
    const magazine = parseIntSafe(e && e.magazine, 0);
    return {
      id: (e && e.id) || genId(),
      name: String((e && e.name) || "Enemigo"),
      maxHp,
      currentHp: parseIntSafe(e && e.currentHp, maxHp),
      bodySp,
      bodySpMax: parseIntSafe(e && e.bodySpMax, bodySp),
      headSp,
      headSpMax: parseIntSafe(e && e.headSpMax, headSp),
      magazine,
      magazineMax: parseIntSafe(e && e.magazineMax, magazine),
      notes: String((e && e.notes) || ""),
      criticalInjuries:
        e && Array.isArray(e.criticalInjuries)
          ? e.criticalInjuries.filter((c) => c && (c.location === "body" || c.location === "head"))
          : [],
      templateKey: (e && e.templateKey) || null,
    };
  };

  const persistEnemies = debounce(() => {
    try {
      localStorage.setItem(STORAGE_ENEMIES, JSON.stringify(state.enemies));
    } catch (_) {
      /* ignore quota errors */
    }
  }, 120);

  const persistTemplates = () => {
    try {
      localStorage.setItem(STORAGE_TEMPLATES, JSON.stringify(state.customTemplates));
    } catch (_) {
      /* ignore quota errors */
    }
  };

  // -------- Templates registry --------
  /** Returns flat list of all templates (built-in + custom) with metadata. */
  const getAllTemplates = () => {
    const groups = BUILT_IN_TEMPLATES.map((g) => ({
      label: g.category,
      builtin: true,
      entries: g.entries.map((e) => ({ ...e, isCustom: false })),
    }));
    const customEntries = Object.entries(state.customTemplates).map(([name, t]) => ({
      key: `custom:${name}`,
      name,
      isCustom: true,
      ...t,
    }));
    if (customEntries.length > 0) {
      groups.unshift({ label: "Mis plantillas", builtin: false, entries: customEntries });
    }
    return groups;
  };

  const findTemplateByKey = (key) => {
    for (const group of getAllTemplates()) {
      for (const e of group.entries) {
        if (e.key === key) return e;
      }
    }
    return null;
  };

  // -------- Combat rules --------
  /**
   * Cyberpunk RED damage application.
   * - Ranged: penetrating = dmg - SP (only if dmg > SP).
   * - Melee (no bruto): penetrating = dmg - ceil(SP/2) (only if dmg > ceil(SP/2)).
   * - Head shots: penetrating × 2.
   * - Ablation: if any damage penetrates, that armor loses 1 SP.
   * Returns { penetrating, hpBefore, hpAfter, spBefore, spAfter, ablated }.
   */
  const applyAttackToEnemy = (enemy, damage, location, type) => {
    const isHead = location === "head";
    const isRanged = type === "ranged";
    const spKey = isHead ? "headSp" : "bodySp";
    const sp = enemy[spKey] || 0;
    const threshold = isRanged ? sp : Math.ceil(sp / 2);

    let penetrating = 0;
    let ablated = false;
    if (damage > threshold) {
      penetrating = isRanged ? damage - sp : damage - Math.ceil(sp / 2);
      if (penetrating < 0) penetrating = 0;
      if (isHead) penetrating *= 2;
      ablated = penetrating > 0;
    }

    const hpBefore = enemy.currentHp;
    const spBefore = sp;
    if (penetrating > 0) {
      enemy.currentHp = Math.max(0, enemy.currentHp - penetrating);
    }
    if (ablated && sp > 0) {
      enemy[spKey] = Math.max(0, sp - 1);
    }

    return {
      penetrating,
      hpBefore,
      hpAfter: enemy.currentHp,
      spBefore,
      spAfter: enemy[spKey],
      ablated,
    };
  };

  const computeStatus = (enemy) => {
    if (enemy.currentHp <= 0) return "dead";
    if (enemy.currentHp <= Math.floor(enemy.maxHp / 2)) return "wounded";
    return "operational";
  };

  const statusLabel = (status) => {
    if (status === "dead") return "🕸 Neutralizado";
    if (status === "wounded") return "⚠ Herido (−2 acciones)";
    return "🟢 Operativo";
  };

  const STAT_MAX_KEY = { magazine: "magazineMax", bodySp: "bodySpMax", headSp: "headSpMax" };

  /**
   * Sets an editable stat (SP or magazine) clamped to >= 0. If the new value
   * exceeds the recorded maximum (reload target / ablation baseline), the max is
   * raised to match — so increasing the magazine also increases reload capacity.
   */
  const applyStatEdit = (enemy, field, value) => {
    const v = Math.max(0, parseIntSafe(value, 0));
    enemy[field] = v;
    const maxKey = STAT_MAX_KEY[field];
    if (maxKey && v > parseIntSafe(enemy[maxKey], 0)) enemy[maxKey] = v;
  };

  const roll2d6 = () => 1 + Math.floor(Math.random() * 6) + (1 + Math.floor(Math.random() * 6));

  /**
   * Records a critical injury on the enemy. When applyDamage is true (a real
   * critical hit) the +5 bonus damage is subtracted from HP. Returns false if
   * the enemy already suffers that injury.
   */
  const addCriticalInjury = (enemy, location, roll, applyDamage) => {
    const table = CRITICAL_INJURIES[location];
    if (!table || !table[roll]) return false;
    if (!Array.isArray(enemy.criticalInjuries)) enemy.criticalInjuries = [];
    const exists = enemy.criticalInjuries.some((c) => c.location === location && c.roll === roll);
    if (exists) return false;
    enemy.criticalInjuries.push({ location, roll, name: table[roll].name });
    if (applyDamage) enemy.currentHp = Math.max(0, enemy.currentHp - CRIT_BONUS_DAMAGE);
    return true;
  };

  /**
   * Rolls a critical injury on the given table (body/head). Per RED, rerolls
   * until an injury the enemy is not already suffering is found and records it
   * as a reminder. Does NOT subtract HP — the GM applies weapon/bonus damage
   * separately with the HP buttons.
   */
  const rollCriticalInjury = (enemy, location) => {
    if (enemy.currentHp <= 0) return;
    const table = CRITICAL_INJURIES[location];
    if (!table) return;
    if (!Array.isArray(enemy.criticalInjuries)) enemy.criticalInjuries = [];

    const suffered = new Set(
      enemy.criticalInjuries.filter((c) => c.location === location).map((c) => c.roll),
    );
    // 11 distinct results per table (2..12). If all are suffered, stop.
    if (suffered.size >= 11) {
      toast(`${enemy.name}: ya sufre todas las heridas de ${location === "head" ? "cabeza" : "cuerpo"}.`, "error");
      return;
    }

    let roll = roll2d6();
    let guard = 0;
    while (suffered.has(roll) && guard < 50) {
      roll = roll2d6();
      guard++;
    }

    // La herida crítica solo se registra como recordatorio: NO resta PD.
    // El DJ aplica el daño del arma por separado.
    const ok = addCriticalInjury(enemy, location, roll, false);
    if (!ok) {
      toast(`${enemy.name}: no se pudo añadir la herida (ya la sufre).`, "error");
      return;
    }
    persistEnemies();
    render();
    const loc = location === "head" ? "Cabeza" : "Cuerpo";
    toast(`${enemy.name}: herida crítica ${loc} ${roll} → ${CRITICAL_INJURIES[location][roll].name}`, "success");
  };

  /** Manually assigns a specific critical injury (DJ override, no auto damage). */
  const addManualCriticalInjury = (enemy, location, roll) => {
    const ok = addCriticalInjury(enemy, location, roll, false);
    if (!ok) {
      toast(`${enemy.name}: ya sufre esa herida.`, "error");
      return;
    }
    persistEnemies();
    render();
    const loc = location === "head" ? "Cabeza" : "Cuerpo";
    toast(`${enemy.name}: ${loc} ${roll} → ${CRITICAL_INJURIES[location][roll].name} (manual)`, "success");
  };

  // -------- Enemy CRUD --------
  const addEnemyFromTemplate = (tpl, overrides = {}, quantity = 1) => {
    const baseName = (overrides.name || tpl.name || "Enemigo").trim() || "Enemigo";
    let created = 0;
    for (let i = 0; i < quantity; i++) {
      const name = uniqueName(baseName, quantity === 1 ? null : i + 1);
      const maxHp = clamp(parseIntSafe(overrides.maxHp ?? tpl.maxHp, 30), 1, 999);
      const bodySp = clamp(parseIntSafe(overrides.bodySp ?? tpl.bodySp, 0), 0, 30);
      const headSp = clamp(parseIntSafe(overrides.headSp ?? tpl.headSp, 0), 0, 30);
      const mag = clamp(parseIntSafe(overrides.magazine ?? tpl.magazine, 0), 0, 999);
      state.enemies.push({
        id: genId(),
        name,
        maxHp,
        currentHp: maxHp,
        bodySp,
        bodySpMax: bodySp,
        headSp,
        headSpMax: headSp,
        magazine: mag,
        magazineMax: mag,
        notes: "",
        criticalInjuries: [],
        templateKey: tpl.key || null,
      });
      created++;
    }
    persistEnemies();
    render();
    return created;
  };

  /**
   * Ensures name uniqueness within the tracker. If suffix is null, only appends
   * a counter when the base name already exists.
   */
  const uniqueName = (base, forcedIndex = null) => {
    const existing = new Set(state.enemies.map((e) => e.name));
    if (forcedIndex !== null) {
      let candidate = `${base} ${forcedIndex}`;
      let n = forcedIndex;
      while (existing.has(candidate)) {
        n++;
        candidate = `${base} ${n}`;
      }
      return candidate;
    }
    if (!existing.has(base)) return base;
    let n = 2;
    let candidate = `${base} ${n}`;
    while (existing.has(candidate)) {
      n++;
      candidate = `${base} ${n}`;
    }
    return candidate;
  };

  const removeEnemy = (id) => {
    const idx = state.enemies.findIndex((e) => e.id === id);
    if (idx < 0) return;
    state.enemies.splice(idx, 1);
    state.selectedTargets.delete(id);
    persistEnemies();
    render();
  };

  const clearAllEnemies = () => {
    if (state.enemies.length === 0) return;
    if (!confirm("¿Vaciar el tracker? Se eliminarán todos los enemigos.")) return;
    state.enemies = [];
    state.selectedTargets.clear();
    persistEnemies();
    render();
    toast("Tracker vaciado.", "success");
  };

  // -------- Damage flow --------
  const applyDamageFlow = () => {
    const dmg = clamp(parseIntSafe($("#calcDamage").value, 0), 0, 9999);
    if (dmg <= 0) {
      toast("Introduce un daño mayor que 0.", "error");
      return;
    }
    const targets = state.enemies.filter((e) => state.selectedTargets.has(e.id));
    if (targets.length === 0) {
      toast("Selecciona al menos un objetivo.", "error");
      return;
    }
    const location = $("#calcLocation").value;
    const type = $("#calcType").value;

    const summary = [];
    for (const enemy of targets) {
      if (enemy.currentHp <= 0) {
        summary.push(`${enemy.name}: ya estaba fuera de combate.`);
        continue;
      }
      const result = applyAttackToEnemy(enemy, dmg, location, type);
      if (result.penetrating > 0) {
        summary.push(`${enemy.name}: −${result.penetrating} PV`);
      } else {
        summary.push(`${enemy.name}: blindaje aguanta`);
      }
    }

    persistEnemies();
    // reset damage input after apply
    $("#calcDamage").value = 0;
    render();
    toast(summary.join(" · "), "success");
  };

  // -------- Rendering --------
  const render = () => {
    renderCounter();
    renderCalculator();
    renderThreatList();
    renderTemplateSelect();
  };

  const renderCounter = () => {
    const alive = state.enemies.filter((e) => e.currentHp > 0).length;
    const total = state.enemies.length;
    $("#threatCounter").textContent = total === 0 ? "0 amenazas" : `${alive}/${total} activas`;
  };

  const renderCalculator = () => {
    const calc = $("#calculator");
    calc.hidden = state.enemies.length === 0;

    const chipsRoot = $("#targetChips");
    if (state.enemies.length === 0) {
      chipsRoot.innerHTML = '<span class="hint">Sin enemigos.</span>';
      return;
    }
    // Prune targets that no longer exist
    for (const id of Array.from(state.selectedTargets)) {
      if (!state.enemies.some((e) => e.id === id)) state.selectedTargets.delete(id);
    }

    chipsRoot.innerHTML = state.enemies
      .map((e) => {
        const selected = state.selectedTargets.has(e.id);
        const dead = e.currentHp <= 0;
        const cls = ["target-chip"];
        if (selected) cls.push("selected");
        if (dead) cls.push("dead");
        return `<button type="button" class="${cls.join(" ")}" data-target-id="${esc(
          e.id,
        )}" title="${esc(e.name)} — ${e.currentHp}/${e.maxHp} PV"><span>${esc(
          e.name,
        )}</span><span class="mini-hp">${e.currentHp}/${e.maxHp}</span></button>`;
      })
      .join("");
  };

  const renderThreatList = () => {
    const list = $("#threatList");
    if (state.enemies.length === 0) {
      list.innerHTML = `
        <div class="empty-state" id="emptyState">
          <p class="empty-title">No hay enemigos en el tracker.</p>
          <p class="empty-desc">
            Usa <strong>+ Enemigo</strong> para añadir la primera amenaza o carga una plantilla del manual.
          </p>
          <button class="command-button primary" type="button" data-action="toggle-add">Añadir enemigo</button>
        </div>
      `;
      return;
    }
    list.innerHTML = state.enemies.map(renderEnemyCard).join("");
  };

  const renderEnemyCard = (enemy) => {
    const status = computeStatus(enemy);
    const hpPct = enemy.maxHp > 0 ? clamp((enemy.currentHp / enemy.maxHp) * 100, 0, 100) : 0;
    const halfHp = Math.floor(enemy.maxHp / 2);
    const halfPct = enemy.maxHp > 0 ? (halfHp / enemy.maxHp) * 100 : 50;
    const targeted = state.selectedTargets.has(enemy.id);
    const dead = enemy.currentHp <= 0;
    const noFirearm = enemy.magazineMax === 0;
    const magFull = enemy.magazine >= enemy.magazineMax;

    return `
      <article class="enemy-card${targeted ? " targeted" : ""}" data-status="${status}" data-enemy-id="${esc(
        enemy.id,
      )}">
        <header class="card-head">
          <div class="card-head-left">
            <input class="enemy-name-input" type="text" value="${esc(enemy.name)}" data-field="name"
              aria-label="Nombre del enemigo" />
            <div class="status-badge">${esc(statusLabel(status))}</div>
          </div>
          <button class="icon-button danger card-remove" type="button" data-action="remove"
            aria-label="Eliminar enemigo">${icon("trash")}</button>
        </header>

        <div class="hp-block">
          <div class="hp-label">
            <span>PV</span>
            <strong>${enemy.currentHp} / ${enemy.maxHp}</strong>
          </div>
          <div class="hp-bar" title="Umbral herida grave: ${halfHp} PV">
            <div class="hp-bar-fill" style="width:${hpPct}%"></div>
            <div class="hp-bar-marker" style="left:${halfPct}%"></div>
          </div>
          <div class="hp-actions">
            <button type="button" class="hp-quick" data-hp-delta="-5">−5</button>
            <button type="button" class="hp-quick" data-hp-delta="-1">−1</button>
            <label class="hp-quick set" title="Fijar PV">
              <span>PV</span>
              <input type="number" min="0" max="${enemy.maxHp}" step="1" value="${enemy.currentHp}" data-field="currentHp" />
            </label>
            <button type="button" class="hp-quick heal" data-hp-delta="1">+1</button>
            <button type="button" class="hp-quick heal" data-hp-delta="5">+5</button>
            <button type="button" class="hp-quick heal" data-action="full-heal" title="Restablecer al máximo">MAX</button>
          </div>
        </div>

        <div class="stats-grid">
          ${renderStatCell(enemy, "bodySp", "SP Cuerpo", enemy.bodySpMax)}
          ${renderStatCell(enemy, "headSp", "SP Cabeza", enemy.headSpMax)}
          ${renderStatCell(enemy, "magazine", "Cargador", enemy.magazineMax)}
        </div>

        <div class="weapon-row">
          <button type="button" class="weapon-btn reload" data-action="reload"
            ${noFirearm || magFull || dead ? "disabled" : ""}>
            Recargar
            <small>${enemy.magazine}/${enemy.magazineMax}</small>
          </button>
          <button type="button" class="weapon-btn" data-action="shoot"
            ${noFirearm || enemy.magazine <= 0 || dead ? "disabled" : ""}>
            Disparar
            <small>−1 bala</small>
          </button>
          <button type="button" class="weapon-btn" data-action="autofire"
            ${noFirearm || enemy.magazine < 10 || dead ? "disabled" : ""}>
            Ráfaga
            <small>−10 balas</small>
          </button>
        </div>

        ${renderCritSection(enemy)}

        <div class="notes-block">
          <textarea data-field="notes" rows="2" placeholder="Notas: cyberware, tácticas, moral…">${esc(
            enemy.notes || "",
          )}</textarea>
        </div>
      </article>
    `;
  };

  const CRIT_HELP =
    "Herida crítica: cuando 2+ dados de daño sacan un 6. Tira 2d6 en la tabla de la zona impactada " +
    "(cabeza solo con tiro de precisión). Según el manual inflige +5 PD directos (no daña armadura) y aplica la desventaja. " +
    "Si repites herida, vuelve a tirar. Aquí la tirada solo registra la herida como recordatorio: aplica tú el daño del " +
    "arma y los +5 PD con los botones de PD si procede.";

  const renderCritSection = (enemy) => {
    const injuries = Array.isArray(enemy.criticalInjuries) ? enemy.criticalInjuries : [];
    const chips = injuries
      .map((inj, i) => {
        const table = CRITICAL_INJURIES[inj.location] || {};
        const data = table[inj.roll] || { name: inj.name || "Herida", effect: "", auto: "" };
        const locTag = inj.location === "head" ? "Cabeza" : "Cuerpo";
        return `
          <span class="crit-chip" data-tip="${esc(data.effect)}">
            <span class="crit-chip-loc">${locTag} ${inj.roll}</span>
            <span class="crit-chip-name">${esc(data.name)}</span>
            ${data.auto ? `<span class="crit-chip-auto">${esc(data.auto)}</span>` : ""}
            <button type="button" class="crit-chip-x" data-crit-remove="${i}" aria-label="Curar herida">${icon(
              "heart",
            )}</button>
          </span>`;
      })
      .join("");

    return `
      <div class="crit-block">
        <div class="crit-head">
          <span class="crit-title">
            Herida crítica
            <button type="button" class="crit-help" data-tip="${esc(CRIT_HELP)}" aria-label="Qué es una herida crítica">${icon(
              "help",
            )}</button>
          </span>
          <div class="crit-roll-btns">
            <button type="button" class="crit-roll" data-crit-roll="body"
              ${enemy.currentHp <= 0 ? "disabled" : ""}>Tirar cuerpo</button>
            <button type="button" class="crit-roll head" data-crit-roll="head"
              ${enemy.currentHp <= 0 ? "disabled" : ""}>Tirar cabeza</button>
          </div>
        </div>
        <select class="input crit-manual" data-crit-manual aria-label="Añadir lesión manualmente">
          ${renderManualInjuryOptions()}
        </select>
        ${chips ? `<div class="crit-list">${chips}</div>` : ""}
      </div>
    `;
  };

  const renderManualInjuryOptions = () => {
    const group = (location, label) => {
      const opts = Object.keys(CRITICAL_INJURIES[location])
        .map((roll) => `<option value="${location}:${roll}">${roll} · ${esc(CRITICAL_INJURIES[location][roll].name)}</option>`)
        .join("");
      return `<optgroup label="${label}">${opts}</optgroup>`;
    };
    return (
      `<option value="" selected>+ Añadir lesión manual…</option>` +
      group("body", "Cuerpo") +
      group("head", "Cabeza")
    );
  };

  const renderStatCell = (enemy, field, label, max) => {
    const value = enemy[field];
    const maxLabel = max != null && max !== value ? `<small style="opacity:.6">/${max}</small>` : "";
    return `
      <div class="stat-cell">
        <div class="stat-label">${esc(label)} ${maxLabel}</div>
        <div class="stat-value-row">
          <button type="button" class="step-btn" data-stat-delta="-1" data-field="${esc(field)}">−</button>
          <input type="number" class="input" min="0" step="1" value="${value}" data-field="${esc(field)}" />
          <button type="button" class="step-btn" data-stat-delta="1" data-field="${esc(field)}">+</button>
        </div>
      </div>
    `;
  };

  const renderTemplateSelect = () => {
    const sel = $("#templateSelect");
    const groups = getAllTemplates();

    // Preserve selection if still valid
    const prev = state.selectedTemplateKey;
    sel.innerHTML = groups
      .map((g) => {
        const options = g.entries
          .map((e) => `<option value="${esc(e.key)}">${esc(e.name)}</option>`)
          .join("");
        return `<optgroup label="${esc(g.label)}">${options}</optgroup>`;
      })
      .join("");

    if (prev && findTemplateByKey(prev)) {
      sel.value = prev;
    } else {
      sel.value = sel.value || (groups[0] && groups[0].entries[0] && groups[0].entries[0].key) || "";
      state.selectedTemplateKey = sel.value;
    }
    updateDeleteTemplateButton();
  };

  const applyTemplateToForm = (key) => {
    const tpl = findTemplateByKey(key);
    if (!tpl) return;
    // Only overwrite the form if user hasn't customized the name/values yet,
    // to reduce accidental data loss when switching. Simple approach: always sync.
    $("#enemyName").value = tpl.name;
    $("#enemyName").placeholder = tpl.name;
    $("#enemyMaxHp").value = tpl.maxHp;
    $("#enemyBody").value = tpl.bodySp;
    $("#enemyHead").value = tpl.headSp;
    $("#enemyMag").value = tpl.magazine;
    $("#templateHint").textContent = tpl.description || "";
  };

  const updateDeleteTemplateButton = () => {
    const key = state.selectedTemplateKey || "";
    const btn = $("#deleteTemplateBtn");
    btn.disabled = !key.startsWith("custom:");
  };

  // -------- Toast --------
  let toastTimer = null;
  const toast = (msg, kind = "info") => {
    const el = $("#toast");
    el.textContent = msg;
    el.className = `toast${kind !== "info" ? " " + kind : ""}`;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.hidden = true;
    }, 3200);
  };

  // -------- Drawer (mobile) --------
  const openDrawer = () => {
    $("#addDrawer").classList.add("open");
    ensureBackdrop().classList.add("show");
  };
  const closeDrawer = () => {
    $("#addDrawer").classList.remove("open");
    const bd = document.querySelector(".backdrop");
    if (bd) bd.classList.remove("show");
  };
  const ensureBackdrop = () => {
    let bd = document.querySelector(".backdrop");
    if (!bd) {
      bd = document.createElement("div");
      bd.className = "backdrop";
      bd.addEventListener("click", closeDrawer);
      // Append inside .app-shell so the drawer (z-index 60) can stack above the
      // backdrop (z-index 55). Appending to <body> would trap the drawer under
      // the overlay because .app-shell creates its own stacking context.
      const host = document.querySelector(".app-shell") || document.body;
      host.appendChild(bd);
    }
    return bd;
  };

  // -------- Import / Export --------
  const exportState = () => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      enemies: state.enemies,
      customTemplates: state.customTemplates,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    a.href = url;
    a.download = `combat-tracker-${ts}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast("Estado exportado.", "success");
  };

  const importStateFromFile = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (!data || typeof data !== "object") throw new Error("Formato inválido");
        if (Array.isArray(data.enemies)) {
          state.enemies = data.enemies.map(normalizeEnemy);
        }
        if (data.customTemplates && typeof data.customTemplates === "object") {
          state.customTemplates = data.customTemplates;
        }
        persistEnemies();
        persistTemplates();
        render();
        toast("Estado importado.", "success");
      } catch (err) {
        console.error(err);
        toast("No se pudo leer el archivo JSON.", "error");
      }
    };
    reader.onerror = () => toast("Error leyendo el archivo.", "error");
    reader.readAsText(file);
  };

  // -------- Event wiring --------
  const wireGlobalActions = () => {
    document.body.addEventListener("click", (ev) => {
      const btn = ev.target.closest("[data-action]");
      if (!btn) return;
      const action = btn.dataset.action;
      switch (action) {
        case "toggle-add":
          openDrawer();
          break;
        case "close-add":
          closeDrawer();
          break;
        case "clear-all":
          clearAllEnemies();
          break;
        case "export":
          exportState();
          break;
        case "import":
          $("#importInput").click();
          break;
        case "apply-damage":
          applyDamageFlow();
          break;
        case "add-enemy":
          handleAddEnemyFromForm();
          break;
        case "save-template":
          handleSaveTemplate();
          break;
      }
    });

    // Stepper buttons for the damage input
    document.body.addEventListener("click", (ev) => {
      const btn = ev.target.closest("[data-step]");
      if (!btn) return;
      const input = document.getElementById(btn.dataset.step);
      if (!input) return;
      const delta = parseIntSafe(btn.dataset.delta, 0);
      input.value = Math.max(0, parseIntSafe(input.value, 0) + delta);
    });

    // Damage quick-set chips
    document.body.addEventListener("click", (ev) => {
      const chip = ev.target.closest("[data-set-damage]");
      if (!chip) return;
      $("#calcDamage").value = parseIntSafe(chip.dataset.setDamage, 0);
    });

    // Target chips toggle
    $("#targetChips").addEventListener("click", (ev) => {
      const chip = ev.target.closest("[data-target-id]");
      if (!chip) return;
      const id = chip.dataset.targetId;
      if (state.selectedTargets.has(id)) state.selectedTargets.delete(id);
      else state.selectedTargets.add(id);
      renderCalculator();
      renderThreatList();
    });

    // Import input
    $("#importInput").addEventListener("change", (ev) => {
      const file = ev.target.files && ev.target.files[0];
      if (file) importStateFromFile(file);
      ev.target.value = "";
    });

    // Template select change
    $("#templateSelect").addEventListener("change", (ev) => {
      state.selectedTemplateKey = ev.target.value;
      applyTemplateToForm(state.selectedTemplateKey);
      updateDeleteTemplateButton();
    });

    // Delete template
    $("#deleteTemplateBtn").addEventListener("click", () => {
      const key = state.selectedTemplateKey || "";
      if (!key.startsWith("custom:")) return;
      const name = key.slice("custom:".length);
      if (!confirm(`¿Eliminar la plantilla "${name}"?`)) return;
      delete state.customTemplates[name];
      state.selectedTemplateKey = null;
      persistTemplates();
      renderTemplateSelect();
      toast("Plantilla eliminada.", "success");
    });

    // Escape closes drawer
    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape") closeDrawer();
    });
  };

  const wireEnemyCardActions = () => {
    const list = $("#threatList");

    list.addEventListener("click", (ev) => {
      const card = ev.target.closest("[data-enemy-id]");
      if (!card) return;
      const id = card.dataset.enemyId;
      const enemy = state.enemies.find((e) => e.id === id);
      if (!enemy) return;

      const action = ev.target.closest("[data-action]");
      if (action) {
        switch (action.dataset.action) {
          case "remove":
            removeEnemy(id);
            return;
          case "reload":
            if (enemy.magazineMax === 0) return;
            enemy.magazine = enemy.magazineMax;
            toast(`${enemy.name}: recargado (${enemy.magazineMax} balas).`, "success");
            persistEnemies();
            render();
            return;
          case "shoot":
            if (enemy.currentHp <= 0) return;
            if (enemy.magazine <= 0) {
              toast(`${enemy.name}: sin munición.`, "error");
              return;
            }
            enemy.magazine = Math.max(0, enemy.magazine - 1);
            persistEnemies();
            render();
            return;
          case "autofire":
            if (enemy.currentHp <= 0) return;
            if (enemy.magazine < 10) {
              toast(`${enemy.name}: no llega para ráfaga (necesita 10 balas).`, "error");
              return;
            }
            enemy.magazine -= 10;
            persistEnemies();
            render();
            return;
          case "full-heal":
            enemy.currentHp = enemy.maxHp;
            persistEnemies();
            render();
            return;
        }
      }

      const hpDelta = ev.target.closest("[data-hp-delta]");
      if (hpDelta) {
        const delta = parseIntSafe(hpDelta.dataset.hpDelta, 0);
        enemy.currentHp = clamp(enemy.currentHp + delta, 0, enemy.maxHp);
        persistEnemies();
        render();
        return;
      }

      const statBtn = ev.target.closest("[data-stat-delta]");
      if (statBtn) {
        const field = statBtn.dataset.field;
        const delta = parseIntSafe(statBtn.dataset.statDelta, 0);
        applyStatEdit(enemy, field, parseIntSafe(enemy[field], 0) + delta);
        persistEnemies();
        render();
        return;
      }

      const critRoll = ev.target.closest("[data-crit-roll]");
      if (critRoll) {
        rollCriticalInjury(enemy, critRoll.dataset.critRoll);
        return;
      }

      const critRemove = ev.target.closest("[data-crit-remove]");
      if (critRemove) {
        const idx = parseIntSafe(critRemove.dataset.critRemove, -1);
        if (Array.isArray(enemy.criticalInjuries) && idx >= 0) {
          enemy.criticalInjuries.splice(idx, 1);
          persistEnemies();
          render();
        }
        return;
      }
    });

    // Field edits (input, textarea, name)
    list.addEventListener("change", (ev) => {
      const card = ev.target.closest("[data-enemy-id]");
      if (!card) return;
      const enemy = state.enemies.find((e) => e.id === card.dataset.enemyId);
      if (!enemy) return;

      // Manual critical injury dropdown
      if (ev.target.matches("[data-crit-manual]")) {
        const val = ev.target.value;
        ev.target.value = ""; // reset to placeholder
        if (!val) return;
        const [location, rollStr] = val.split(":");
        const roll = parseIntSafe(rollStr, 0);
        if ((location === "body" || location === "head") && roll) {
          addManualCriticalInjury(enemy, location, roll);
        }
        return;
      }

      const field = ev.target.dataset.field;
      if (!field) return;

      if (field === "name") {
        const newName = String(ev.target.value || "").trim() || "Enemigo";
        if (newName !== enemy.name) {
          // enforce uniqueness excluding self
          const others = new Set(state.enemies.filter((e) => e.id !== enemy.id).map((e) => e.name));
          let candidate = newName;
          let n = 2;
          while (others.has(candidate)) {
            candidate = `${newName} ${n++}`;
          }
          enemy.name = candidate;
          persistEnemies();
          render();
        }
      } else if (field === "notes") {
        enemy.notes = String(ev.target.value || "");
        persistEnemies();
      } else if (field === "currentHp") {
        enemy.currentHp = clamp(parseIntSafe(ev.target.value, 0), 0, enemy.maxHp);
        persistEnemies();
        render();
      } else if (field === "bodySp" || field === "headSp" || field === "magazine") {
        applyStatEdit(enemy, field, parseIntSafe(ev.target.value, 0));
        persistEnemies();
        render();
      }
    });

    // Live save notes without full re-render (avoids caret jump)
    list.addEventListener("input", (ev) => {
      if (ev.target.matches("textarea[data-field='notes']")) {
        const card = ev.target.closest("[data-enemy-id]");
        if (!card) return;
        const enemy = state.enemies.find((e) => e.id === card.dataset.enemyId);
        if (enemy) {
          enemy.notes = ev.target.value;
          persistEnemies();
        }
      }
    });
  };

  const handleAddEnemyFromForm = () => {
    const key = $("#templateSelect").value;
    const tpl = findTemplateByKey(key) || { name: "Enemigo", maxHp: 30, bodySp: 0, headSp: 0, magazine: 0 };
    const overrides = {
      name: $("#enemyName").value.trim() || tpl.name,
      maxHp: $("#enemyMaxHp").value,
      bodySp: $("#enemyBody").value,
      headSp: $("#enemyHead").value,
      magazine: $("#enemyMag").value,
    };
    const quantity = clamp(parseIntSafe($("#enemyCount").value, 1), 1, 20);
    const created = addEnemyFromTemplate(tpl, overrides, quantity);
    if (created > 0) {
      toast(`Añadido${created > 1 ? "s " + created + " enemigos" : " 1 enemigo"}.`, "success");
      if (window.matchMedia && window.matchMedia("(max-width: 900px)").matches) {
        closeDrawer();
      }
    }
  };

  const handleSaveTemplate = () => {
    const name = ($("#enemyName").value || "").trim();
    if (!name) {
      toast("Ponle un nombre a la plantilla.", "error");
      return;
    }
    state.customTemplates[name] = {
      maxHp: clamp(parseIntSafe($("#enemyMaxHp").value, 30), 1, 999),
      bodySp: clamp(parseIntSafe($("#enemyBody").value, 0), 0, 30),
      headSp: clamp(parseIntSafe($("#enemyHead").value, 0), 0, 30),
      magazine: clamp(parseIntSafe($("#enemyMag").value, 0), 0, 999),
      description: "Plantilla personalizada.",
    };
    persistTemplates();
    state.selectedTemplateKey = `custom:${name}`;
    renderTemplateSelect();
    toast(`Plantilla "${name}" guardada.`, "success");
  };

  // -------- Init --------
  /**
   * Imports a pre-generated encounter passed via the URL (?add=<json>).
   * The payload is an array of { k: templateKey, n: count, name?: label }.
   * Enemies are appended to the current tracker and the URL is cleaned up
   * so a page refresh does not add them again.
   */
  const importFromUrl = () => {
    let raw;
    try {
      raw = new URLSearchParams(window.location.search).get("add");
    } catch (_) {
      return;
    }
    if (!raw) return;
    let specs = null;
    try {
      specs = JSON.parse(decodeURIComponent(raw));
    } catch (_) {
      specs = null;
    }
    if (Array.isArray(specs)) {
      specs.forEach((s) => {
        const tpl = s && findTemplateByKey(s.k);
        if (!tpl) return;
        const qty = clamp(parseIntSafe(s.n, 1), 1, 99);
        addEnemyFromTemplate(tpl, s.name ? { name: String(s.name) } : {}, qty);
      });
    }
    // Strip the query string so refreshes don't re-import.
    try {
      window.history.replaceState({}, "", window.location.pathname);
    } catch (_) {
      /* ignore */
    }
  };

  const init = () => {
    loadState();
    wireGlobalActions();
    wireEnemyCardActions();
    importFromUrl();
    render();
    // Pre-fill the add-enemy form with the initial template (once).
    applyTemplateToForm(state.selectedTemplateKey);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
