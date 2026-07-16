/* ============================================================
 * Cyberpunk RED — Generador de personajes
 * app.js — Estado en memoria + persistencia en localStorage.
 * Reglas del Manual Básico (ES). Todo editable.
 * ============================================================ */

(() => {
  "use strict";

  // -------- Utils --------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const d10 = () => 1 + Math.floor(Math.random() * 10);
  const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const esc = (v) =>
    String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const STORAGE_KEY = "cg.character.v1";

  const METHOD_LABELS = { streetrat: "Rata Callejera", edgerunner: "Edgerunner", complete: "Paquete Completo" };

  // -------- State --------
  const emptyState = () => ({
    method: "streetrat",
    name: "",
    alias: "",
    roleKey: CPR.ROLES[0].key,
    roleAbilityRank: CPR.RULES.roleAbilityStart,
    stats: Object.fromEntries(CPR.STAT_ORDER.map((k) => [k, 6])),
    skills: {}, // name -> level
    weapons: [],
    armor: [],
    gear: [],
    cyber: [],
    cyberPhMode: "fixed", // "fixed" | "roll"
    lifepath: {},
    notes: "",
  });

  let state = emptyState();

  // -------- Skill metadata helpers --------
  const baseName = (name) => name.replace(/\s*\(.*?\)\s*$/, "").trim();
  const SKILL_BY_BASE = Object.fromEntries(CPR.SKILLS.map((s) => [s.name, s]));

  const getSkillMeta = (name) => {
    const b = baseName(name);
    return SKILL_BY_BASE[b] || { name: b, stat: "int", cat: "Otras" };
  };

  const skillCost = (name, level) => {
    if (/origen cultural/i.test(name)) return 0; // idioma de origen: gratis
    const meta = getSkillMeta(name);
    return level * (meta.x2 ? 2 : 1);
  };

  // Canonical display list of skills (master list with friendly basic names)
  const canonicalSkills = () => {
    return CPR.SKILLS.map((s) => {
      let name = s.name;
      if (s.name === "Experto local") name = "Experto local (tu hogar)";
      if (s.name === "Idioma") name = "Idioma (jerga callejera)";
      return { name, stat: s.stat, x2: !!s.x2, cat: s.cat };
    });
  };

  // Skill entries to render: canonical + any extra present in state
  const renderableSkills = () => {
    const canon = canonicalSkills();
    const seen = new Set(canon.map((s) => s.name));
    const extras = Object.keys(state.skills)
      .filter((n) => !seen.has(n))
      .map((n) => {
        const m = getSkillMeta(n);
        return { name: n, stat: m.stat, x2: !!m.x2, cat: m.cat };
      });
    return canon.concat(extras);
  };

  // -------- Persistence --------
  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* ignore quota */
    }
  };

  const load = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        state = Object.assign(emptyState(), parsed);
        state.stats = Object.assign(Object.fromEntries(CPR.STAT_ORDER.map((k) => [k, 6])), parsed.stats || {});
      }
    } catch (e) {
      state = emptyState();
    }
  };

  // -------- Derived stats --------
  const derived = () => {
    const s = state.stats;
    const hp = 10 + 5 * Math.ceil((Number(s.tco) + Number(s.vol)) / 2);
    return {
      hp,
      sw: Math.ceil(hp / 2),
      death: Number(s.tco),
      hum: 10 * Number(s.emp),
    };
  };

  // -------- PH / Humanidad --------
  // Cada ciberware: -2 a la Humanidad máxima, y -PH (fija o d6) a la actual.
  const parsePh = (phStr) => {
    if (phStr === undefined || phStr === null) return { fixed: 0, dice: null };
    const s = String(phStr);
    const fixedM = s.match(/^\s*(\d+)/);
    const diceM = s.match(/(\d+d\d+(?:\/2)?)/i);
    return { fixed: fixedM ? parseInt(fixedM[1], 10) : 0, dice: diceM ? diceM[1] : null };
  };

  const rollDice = (dice) => {
    if (!dice) return 0;
    const half = /\/2$/.test(dice);
    const m = dice.match(/(\d+)d(\d+)/i);
    if (!m) return 0;
    const n = +m[1];
    const sides = +m[2];
    let sum = 0;
    for (let i = 0; i < n; i++) sum += 1 + Math.floor(Math.random() * sides);
    return half ? Math.ceil(sum / 2) : sum;
  };

  const rollAllCyber = () => {
    state.cyber.forEach((c) => {
      const p = parsePh(c.ph);
      c.roll = p.dice ? rollDice(p.dice) : p.fixed;
    });
  };

  // PH aplicada por una pieza según el modo actual
  const phUsed = (item) => {
    const p = parsePh(item.ph);
    if (state.cyberPhMode === "roll" && p.dice) {
      return typeof item.roll === "number" ? item.roll : p.fixed;
    }
    return p.fixed;
  };

  const humanityInfo = () => {
    const base = 10 * Number(state.stats.emp || 0);
    const count = state.cyber.length;
    const maxReduction = 2 * count;
    const phTotal = state.cyber.reduce((a, c) => a + phUsed(c), 0);
    const max = base - maxReduction;
    return { base, count, maxReduction, phTotal, max, current: max - phTotal };
  };

  // Descripción (qué hace) de cada ciberware, desde el catálogo.
  const CYBER_DESC = {};
  Object.values(CPR.CYBERWARE).forEach((list) => list.forEach((c) => (CYBER_DESC[c.name] = c.desc)));
  const cyberDesc = (name) => CYBER_DESC[name] || CYBER_DESC[baseName(name)] || "";

  // -------- Role --------
  const currentRole = () => CPR.ROLES.find((r) => r.key === state.roleKey) || CPR.ROLES[0];

  // ============================================================
  // RENDER
  // ============================================================
  const render = () => {
    renderMethod();
    renderIdentity();
    renderStats();
    renderDerived();
    renderSkills();
    renderTagLists();
    renderCyberControls();
    renderLifepath();
    save();
  };

  const renderMethod = () => {
    $$("#methodGrid .method-chip").forEach((chip) => {
      chip.classList.toggle("active", chip.dataset.method === state.method);
    });
    const isComplete = state.method === "complete";
    const isStreet = state.method === "streetrat";
    $("#statBudget").hidden = !isComplete;
    $("#skillBudget").hidden = isStreet;
  };

  const renderIdentity = () => {
    $("#charName").value = state.name;
    $("#charAlias").value = state.alias;
    const sel = $("#roleSelect");
    if (!sel.options.length) {
      CPR.ROLES.forEach((r) => {
        const o = document.createElement("option");
        o.value = r.key;
        o.textContent = r.name;
        sel.appendChild(o);
      });
    }
    sel.value = state.roleKey;
    const role = currentRole();
    $("#roleAbility").value = role.ability;
    $("#roleAbilityRank").value = state.roleAbilityRank;
    $("#roleAbilityDesc").textContent = role.desc;
  };

  const renderStats = () => {
    const grid = $("#statGrid");
    grid.innerHTML = "";
    CPR.STATS.forEach((st) => {
      const row = document.createElement("div");
      row.className = "stat-row";
      row.innerHTML =
        `<span class="stat-abbr">${st.abbr}</span>` +
        `<span class="stat-name">${st.name}</span>` +
        `<input class="input stat-input" type="number" min="1" max="10" data-stat="${st.key}" value="${esc(state.stats[st.key])}" />`;
      grid.appendChild(row);
    });
    // budget for complete method
    if (state.method === "complete") {
      updateStatBudget();
    }
  };

  const updateStatBudget = () => {
    if (state.method !== "complete") return;
    const spent = CPR.STAT_ORDER.reduce((a, k) => a + Number(state.stats[k] || 0), 0);
    const total = CPR.RULES.completeStatPoints;
    const el = $("#statBudget");
    el.textContent = `${spent} / ${total} pts`;
    el.classList.toggle("over", spent > total);
    el.classList.toggle("exact", spent === total);
  };

  const renderDerived = () => {
    const d = derived();
    $("#dHp").textContent = d.hp;
    $("#dSw").textContent = d.sw;
    $("#dDeath").textContent = d.death;
    renderHumanity();
  };

  // Humanidad vive en el bloque de Estadísticas (derivada de EMP):
  // base = 10×EMP; máxima = base − 2×ciberware; actual = máxima − ΣPH → "actual de máxima".
  const renderHumanity = () => {
    const h = humanityInfo();
    const cur = $("#statHumCur");
    const max = $("#statHumMax");
    const note = $("#statHumNote");
    if (cur) cur.textContent = h.current;
    if (max) max.textContent = h.max;
    if (note) {
      const curEmp = Math.max(0, Math.floor(h.current / 10));
      const baseEmp = Number(state.stats.emp || 0);
      const empPart = h.count && curEmp !== baseEmp ? ` · EMP efectiva ${curEmp} de ${baseEmp}` : "";
      note.textContent = h.count
        ? `base ${h.base} (10 × EMP) · −${h.maxReduction} máx por ciberware · PH ${h.phTotal} (${state.cyberPhMode === "roll" ? "d6" : "fija"})${empPart}`
        : `base ${h.base} = 10 × EMP`;
    }
  };

  const renderSkills = () => {
    const list = $("#skillList");
    list.innerHTML = "";
    const skills = renderableSkills();
    // group by category preserving order of CPR categories
    const cats = [];
    const byCat = {};
    skills.forEach((s) => {
      if (!byCat[s.cat]) {
        byCat[s.cat] = [];
        cats.push(s.cat);
      }
      byCat[s.cat].push(s);
    });
    cats.forEach((cat) => {
      const h = document.createElement("div");
      h.className = "skill-cat";
      h.textContent = cat;
      list.appendChild(h);
      byCat[cat].forEach((s) => {
        const level = Number(state.skills[s.name] || 0);
        const row = document.createElement("div");
        row.className = "skill-row" + (level > 0 ? " has-level" : "");
        const isCanon = canonicalSkills().some((c) => c.name === s.name);
        row.innerHTML =
          `<span class="skill-name">${esc(s.name)}${s.x2 ? '<span class="x2">×2</span>' : ""}</span>` +
          `<span class="skill-stat">${getSkillMeta(s.name).stat.toUpperCase()}</span>` +
          `<input class="input skill-input" type="number" min="0" max="10" data-skill="${esc(s.name)}" value="${level}" />` +
          (isCanon ? "" : `<button class="skill-remove" type="button" data-remove-skill="${esc(s.name)}" title="Quitar">×</button>`);
        list.appendChild(row);
      });
    });
    // hint + budget
    const role = currentRole();
    if (state.method === "streetrat") {
      $("#skillHint").textContent = "Plantilla predeterminada por rol (editable). Idioma de origen cultural gratis a nivel 4.";
    } else if (state.method === "edgerunner") {
      $("#skillHint").textContent = "Reparte 86 puntos entre las 20 habilidades del rol. Mín 2, máx 6. (×2) cuesta doble.";
    } else {
      $("#skillHint").textContent = "86 puntos libres. Básicas mín 2, máx 6. (×2) cuesta doble. Idioma de origen gratis a nivel 4.";
    }
    if (state.method !== "streetrat") {
      updateSkillBudget();
    }
    const pkgBtn = $('#cardSkills [data-action="apply-package"]');
    if (pkgBtn) pkgBtn.textContent = state.method === "streetrat" ? "Plantilla rol" : "Repartir 86";
  };

  const updateSkillBudget = () => {
    if (state.method === "streetrat") return;
    const spent = Object.entries(state.skills).reduce((a, [n, lv]) => a + skillCost(n, Number(lv)), 0);
    const el = $("#skillBudget");
    el.textContent = `${spent} / ${CPR.RULES.skillPoints} pts`;
    el.classList.toggle("over", spent > CPR.RULES.skillPoints);
    el.classList.toggle("exact", spent === CPR.RULES.skillPoints);
  };

  const tagItem = (title, meta, listKey, idx, badge) => {
    const div = document.createElement("div");
    div.className = "tag-item";
    div.innerHTML =
      `<div class="tag-main"><div class="tag-title">${esc(title)}</div>${meta ? `<span class="tag-meta">${esc(meta)}</span>` : ""}</div>` +
      (badge ? `<span class="tag-badge">${esc(badge)}</span>` : "") +
      `<button class="tag-remove" type="button" data-remove-list="${listKey}" data-idx="${idx}" title="Quitar">×</button>`;
    return div;
  };

  const renderTagLists = () => {
    const configs = [
      { key: "weapons", el: "#weaponList", empty: "Sin armas." },
      { key: "armor", el: "#armorList", empty: "Sin blindaje." },
      { key: "gear", el: "#gearList", empty: "Sin equipo." },
      { key: "cyber", el: "#cyberList", empty: "Sin ciberware." },
    ];
    configs.forEach((cfg) => {
      const container = $(cfg.el);
      container.innerHTML = "";
      const arr = state[cfg.key];
      if (!arr.length) {
        const p = document.createElement("p");
        p.className = "empty-note";
        p.textContent = cfg.empty;
        container.appendChild(p);
        return;
      }
      arr.forEach((it, i) => {
        if (cfg.key === "cyber") {
          const p = parsePh(it.ph);
          const used = phUsed(it);
          const rolled = state.cyberPhMode === "roll" && p.dice;
          const badge = `−2 máx · PH ${used}${rolled ? " ⚄" : ""}`;
          const effect = it.desc || cyberDesc(it.name);
          const parts = [];
          if (effect) parts.push(effect);
          if (it.cat) parts.push(it.cat);
          if (p.dice) parts.push(`PH fija ${p.fixed} / ${p.dice}`);
          container.appendChild(tagItem(it.name, parts.join(" · "), cfg.key, i, badge));
        } else {
          container.appendChild(tagItem(it.name, it.desc || "", cfg.key, i, it.badge || ""));
        }
      });
    });
  };

  const renderCyberControls = () => {
    const toggle = $("#cyberRollToggle");
    if (toggle) toggle.checked = state.cyberPhMode === "roll";
    const rerollBtn = $("#rerollPhBtn");
    if (rerollBtn) rerollBtn.hidden = state.cyberPhMode !== "roll";
    const summary = $("#cyberSummary");
    if (summary) {
      const h = humanityInfo();
      if (!h.count) {
        summary.innerHTML = `<span class="cyber-sum-hum">Humanidad ${h.current}</span> · sin ciberware`;
      } else {
        summary.innerHTML =
          `<span class="cyber-sum-hum">Humanidad ${h.current} / máx ${h.max}</span> · ` +
          `${h.count} pieza${h.count > 1 ? "s" : ""} · −${h.maxReduction} máx · PH total ${h.phTotal} ` +
          `<span class="cyber-sum-mode">(${state.cyberPhMode === "roll" ? "tirada d6" : "fija"})</span>`;
      }
    }
  };

  const renderLifepath = () => {
    const grid = $("#lifepathGrid");
    if (!grid.dataset.built) {
      // Region field first (drives languages)
      grid.appendChild(lifepathField("Región cultural", "region"));
      grid.appendChild(lifepathField("Idioma de origen", "idioma", true));
      Object.keys(CPR.LIFEPATH).forEach((key) => {
        if (key === "Región cultural") return;
        grid.appendChild(lifepathField(key, key));
      });
      grid.dataset.built = "1";
    }
    // sync values
    $$("[data-lp]", grid).forEach((inp) => {
      inp.value = state.lifepath[inp.dataset.lp] || "";
    });
    $("#lifepathNotes").value = state.notes;
  };

  const lifepathField = (label, key, freeText) => {
    const wrap = document.createElement("div");
    wrap.className = "field";
    const roll = freeText ? "" : `<button class="skill-remove" type="button" data-roll-lp="${esc(key)}" title="Tirar 1d10" style="font-size:14px">⚄</button>`;
    wrap.innerHTML =
      `<label class="field-label">${esc(label)}</label>` +
      `<div style="display:flex;gap:6px;align-items:center">` +
      `<input class="input" type="text" data-lp="${esc(key)}" placeholder="—" />${roll}</div>`;
    return wrap;
  };

  // ============================================================
  // ACTIONS
  // ============================================================

  const setMethod = (m) => {
    state.method = m;
    render();
  };

  // Roll stats depending on method
  const rollStats = () => {
    const role = state.roleKey;
    const table = CPR.STREETRAT_STATS[role];
    if (!table) return;
    if (state.method === "streetrat") {
      const row = table[d10() - 1];
      CPR.STAT_ORDER.forEach((k, i) => (state.stats[k] = row[i]));
    } else if (state.method === "edgerunner") {
      // 1d10 por columna comparado con la fila resultante
      CPR.STAT_ORDER.forEach((k, i) => (state.stats[k] = table[d10() - 1][i]));
    } else {
      // complete: reparto aproximado de 62 puntos (min2 max8)
      distributePoints(CPR.RULES.completeStatPoints, CPR.STAT_ORDER, 2, 8, (k, v) => (state.stats[k] = v));
    }
    render();
  };

  // Generic point distribution helper
  const distributePoints = (total, keys, min, max, setter) => {
    const vals = Object.fromEntries(keys.map((k) => [k, min]));
    let remaining = total - min * keys.length;
    while (remaining > 0) {
      const k = rand(keys);
      if (vals[k] < max) {
        vals[k]++;
        remaining--;
      } else if (keys.every((kk) => vals[kk] >= max)) {
        break;
      }
    }
    keys.forEach((k) => setter(k, vals[k]));
  };

  const applyPackage = () => {
    const pkg = CPR.STREETRAT_SKILLS[state.roleKey];
    if (!pkg) return;
    // reset skills then apply
    state.skills = {};
    Object.entries(pkg).forEach(([n, lv]) => (state.skills[n] = lv));
    // free origin-culture language at 4
    if (state.lifepath["idioma"]) {
      state.skills[`Idioma (origen cultural: ${state.lifepath["idioma"]})`] = 4;
    } else {
      state.skills["Idioma (origen cultural)"] = 4;
    }
    if (state.method !== "streetrat") {
      // for edgerunner/complete, keep skill names but zero the levels to distribute
      if (state.method === "edgerunner") {
        // leave streetrat levels as a starting suggestion
      }
    }
    render();
  };

  // Distribute 86 skill points for edgerunner/complete over role skills
  const rollSkills = () => {
    const pkg = CPR.STREETRAT_SKILLS[state.roleKey];
    if (!pkg) return;
    const names = Object.keys(pkg);
    state.skills = {};
    names.forEach((n) => (state.skills[n] = CPR.RULES.edgeSkillMin));
    // free language
    const langName = state.lifepath["idioma"]
      ? `Idioma (origen cultural: ${state.lifepath["idioma"]})`
      : "Idioma (origen cultural)";
    state.skills[langName] = 4;
    // distribute remaining points up to 86, respecting x2 cost and max 6
    let spent = names.reduce((a, n) => a + skillCost(n, CPR.RULES.edgeSkillMin), 0);
    let guard = 2000;
    while (spent < CPR.RULES.skillPoints && guard-- > 0) {
      const n = rand(names);
      const meta = getSkillMeta(n);
      const mult = meta.x2 ? 2 : 1;
      if (state.skills[n] + 1 <= CPR.RULES.edgeSkillMax && spent + mult <= CPR.RULES.skillPoints) {
        state.skills[n]++;
        spent += mult;
      } else if (names.every((nn) => state.skills[nn] >= CPR.RULES.edgeSkillMax)) {
        break;
      }
    }
    render();
  };

  const applyStarterGear = () => {
    const g = CPR.STARTING_GEAR[state.roleKey];
    if (!g) return;
    state.weapons = [];
    state.armor = [];
    state.gear = [];
    g.weapons.forEach((w) => {
      if (/blindaje|escudo|cp\d|kevlar|flak|metalgear|cuero/i.test(w) && /cp|blindaje|escudo/i.test(w)) {
        state.armor.push({ name: w });
      } else {
        state.weapons.push({ name: w });
      }
    });
    g.gear.forEach((it) => state.gear.push({ name: it }));
    // Ciberware inicial: Rata Callejera / Edgerunner traen paquete; Paquete Completo se compra por separado.
    if (state.method === "complete") {
      state.cyber = [];
    } else {
      const cy = CPR.STARTING_CYBER[state.roleKey] || [];
      state.cyber = cy.map((c) => {
        const entry = { name: c.name, cat: c.cat, ph: c.ph, desc: cyberDesc(c.name), badge: "PH " + c.ph };
        if (state.cyberPhMode === "roll") {
          const p = parsePh(c.ph);
          entry.roll = p.dice ? rollDice(p.dice) : p.fixed;
        }
        return entry;
      });
    }
    render();
  };

  // -------- Lifepath rolls --------
  const rollLifepathField = (key) => {
    if (key === "region") {
      const region = rand(CPR.LIFEPATH["Región cultural"]);
      state.lifepath["region"] = region;
      state.lifepath["idioma"] = rand(CPR.CULTURE_LANGUAGES[region] || ["Inglés"]);
    } else if (CPR.LIFEPATH[key]) {
      state.lifepath[key] = rand(CPR.LIFEPATH[key]);
    }
    render();
  };

  const rollAllLifepath = () => {
    const region = rand(CPR.LIFEPATH["Región cultural"]);
    state.lifepath["region"] = region;
    state.lifepath["idioma"] = rand(CPR.CULTURE_LANGUAGES[region] || ["Inglés"]);
    Object.keys(CPR.LIFEPATH).forEach((key) => {
      if (key === "Región cultural") return;
      state.lifepath[key] = rand(CPR.LIFEPATH[key]);
    });
    render();
  };

  // -------- Full random character (coherente) --------
  // Elige de una sublista preferida con probabilidad bias, si no de toda la tabla.
  const pickBiasedIndex = (listKey, indices, bias = 0.72) => {
    const list = CPR.LIFEPATH[listKey];
    if (!list) return "";
    if (indices && indices.length && Math.random() < bias) {
      return list[rand(indices)];
    }
    return rand(list);
  };

  const makeName = (region) => {
    const pool = CPR.NAME_POOLS[region] || CPR.NAME_POOLS["Norteamérica"];
    const handle = rand(CPR.HANDLES);
    const first = rand(pool.first);
    const last = rand(pool.last);
    return { full: `${first} «${handle}» ${last}`, alias: handle };
  };

  const randomizeAll = () => {
    if (!state.method) state.method = "streetrat";
    const role = rand(CPR.ROLES);
    state.roleKey = role.key;
    state.roleAbilityRank = CPR.RULES.roleAbilityStart;
    const prof = CPR.ROLE_PROFILES[role.key] || {};

    // Región cultural + idioma coherentes, y nombre acorde a la región
    const region = rand(CPR.LIFEPATH["Región cultural"]);
    state.lifepath["region"] = region;
    state.lifepath["idioma"] = rand(CPR.CULTURE_LANGUAGES[region] || ["Inglés"]);
    const nm = makeName(region);
    state.name = nm.full;
    state.alias = nm.alias;

    // Camino vital: sesgado por el rol donde tiene sentido, aleatorio en lo demás
    state.lifepath["Personalidad"] = pickBiasedIndex("Personalidad", prof.personality);
    state.lifepath["Estilo de ropa"] = pickBiasedIndex("Estilo de ropa", prof.clothing);
    state.lifepath["Lo que más valoras"] = pickBiasedIndex("Lo que más valoras", prof.value);
    state.lifepath["Entorno familiar original"] = pickBiasedIndex("Entorno familiar original", prof.family);
    state.lifepath["Objetivo vital"] = pickBiasedIndex("Objetivo vital", prof.goal);
    // resto totalmente aleatorio
    ["Peinado", "Rasgo característico", "Opinión sobre la gente", "Persona que más valoras", "Posesión más valiosa", "Vida amorosa trágica"].forEach(
      (k) => (state.lifepath[k] = rand(CPR.LIFEPATH[k]))
    );

    rollStats();
    if (state.method === "streetrat") {
      applyPackage();
    } else {
      rollSkills();
    }
    applyStarterGear();
    render();
  };

  // ============================================================
  // MODAL PICKER
  // ============================================================
  let modalTarget = null; // "weapons" | "armor" | "gear" | "cyber"

  const CATALOGS = {
    weapons: () => {
      const groups = [
        { label: "Cuerpo a cuerpo", items: CPR.WEAPONS_MELEE.map((w) => ({ name: w.name, desc: `${w.dmg} · CdT ${w.cdt} · ${w.cost}`, badge: w.dmg })) },
        { label: "A distancia", items: CPR.WEAPONS_RANGED.map((w) => ({ name: w.name, desc: `${w.skill} · ${w.dmg} · Cgd ${w.mag} · ${w.special}`, badge: w.dmg })) },
        { label: "Exóticas", items: CPR.WEAPONS_EXOTIC.map((w) => ({ name: w.name, desc: `${w.desc} · ${w.cost}` })) },
      ];
      return groups;
    },
    armor: () => [{ label: "Blindaje", items: CPR.ARMOR.map((a) => ({ name: a.name, desc: `${a.penalty} · ${a.cost} — ${a.desc}`, badge: "CP " + a.cp })) }],
    gear: () => [{ label: "Equipo", items: CPR.GEAR.map((g) => ({ name: g.name, desc: `${g.desc} · ${g.cost}` })) }],
    cyber: () =>
      Object.entries(CPR.CYBERWARE).map(([cat, items]) => ({
        label: cat,
        items: items.map((c) => ({ name: c.name, desc: `${c.desc} · ${c.cost}`, effect: c.desc, badge: "PH " + c.ph, cat, ph: c.ph })),
      })),
  };

  const openModal = (target) => {
    modalTarget = target;
    const titles = { weapons: "Añadir arma", armor: "Añadir blindaje", gear: "Añadir equipo", cyber: "Añadir ciberware" };
    $("#modalTitle").textContent = titles[target] || "Añadir";
    $("#modalSearch").value = "";
    renderModalBody("");
    $("#modalBackdrop").hidden = false;
    $("#modalSearch").focus();
  };

  const closeModal = () => {
    $("#modalBackdrop").hidden = true;
    modalTarget = null;
  };

  const renderModalBody = (query) => {
    const body = $("#modalBody");
    body.innerHTML = "";
    const q = query.toLowerCase();
    const groups = CATALOGS[modalTarget] ? CATALOGS[modalTarget]() : [];
    groups.forEach((g) => {
      const filtered = g.items.filter((it) => !q || it.name.toLowerCase().includes(q) || (it.desc || "").toLowerCase().includes(q));
      if (!filtered.length) return;
      const gh = document.createElement("div");
      gh.className = "pick-group";
      gh.textContent = g.label;
      body.appendChild(gh);
      filtered.forEach((it) => {
        const btn = document.createElement("button");
        btn.className = "pick-item";
        btn.type = "button";
        btn.innerHTML = `<strong>${esc(it.name)}${it.badge ? ` — ${esc(it.badge)}` : ""}</strong>${it.desc ? `<small>${esc(it.desc)}</small>` : ""}`;
        btn.addEventListener("click", () => {
          const entry = { name: it.name, desc: modalTarget === "cyber" ? it.effect || "" : it.desc || "", badge: it.badge || "", cat: it.cat || "", ph: it.ph || "" };
          if (modalTarget === "cyber" && state.cyberPhMode === "roll") {
            const p = parsePh(entry.ph);
            entry.roll = p.dice ? rollDice(p.dice) : p.fixed;
          }
          state[modalTarget].push(entry);
          renderTagLists();
          renderCyberControls();
          renderDerived();
          save();
        });
        body.appendChild(btn);
      });
    });
    if (!body.children.length) {
      const p = document.createElement("p");
      p.className = "empty-note";
      p.textContent = "Sin coincidencias. Usa «Añadir texto libre».";
      body.appendChild(p);
    }
  };

  const addCustomToList = () => {
    if (!modalTarget) return;
    const q = $("#modalSearch").value.trim();
    if (!q) return;
    state[modalTarget].push({ name: q, desc: "", badge: "", cat: modalTarget === "cyber" ? "Otros" : "", ph: "" });
    renderTagLists();
    if (modalTarget === "cyber") {
      renderCyberControls();
      renderDerived();
    }
    save();
    $("#modalSearch").value = "";
    $("#modalSearch").focus();
  };

  // ============================================================
  // ADD SKILL (modal-lite via prompt-free inline)
  // ============================================================
  const addSkill = () => {
    const name = window.prompt("Nombre de la habilidad (puedes añadir especialidad entre paréntesis):");
    if (!name) return;
    const clean = name.trim();
    if (!clean) return;
    if (!(clean in state.skills)) state.skills[clean] = 0;
    render();
  };

  // ============================================================
  // EXPORT / IMPORT / PRINT
  // ============================================================
  const exportJson = () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const slug = (state.name || state.alias || "personaje").replace(/[^\w\-]+/g, "_").slice(0, 40);
    a.href = url;
    a.download = `cpr_${slug || "personaje"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        state = Object.assign(emptyState(), parsed);
        state.stats = Object.assign(Object.fromEntries(CPR.STAT_ORDER.map((k) => [k, 6])), parsed.stats || {});
        render();
      } catch (e) {
        window.alert("Archivo no válido.");
      }
    };
    reader.readAsText(file);
  };

  // Skill row + category block for the official sheet layout
  const csSkillRow = (displayName, statKey, x2, isBasic) => {
    const level = Number(state.skills[displayName] || 0);
    const sv = Number(state.stats[statKey] || 0);
    const base = level + sv;
    return (
      `<div class="cs-skill">` +
      `<span class="cs-sn${isBasic ? " b" : ""}">${esc(displayName)} <em>(${statKey.toUpperCase()})</em>${x2 ? ' <b class="x2">×2</b>' : ""}</span>` +
      `<span class="cs-v">${level || ""}</span><span class="cs-v">${sv || ""}</span><span class="cs-v cs-base">${base || 0}</span>` +
      `</div>`
    );
  };

  const csCatBlock = (title, canonSkills, catName) => {
    const canonNames = new Set(canonSkills.map((s) => s.name));
    // extra specialized variants present in state that belong to this category
    const extras = Object.keys(state.skills)
      .filter((n) => !canonNames.has(n) && getSkillMeta(n).cat === catName)
      .map((n) => {
        const m = getSkillMeta(n);
        return csSkillRow(n, m.stat, !!m.x2, false);
      })
      .join("");
    const rows = canonSkills.map((s) => csSkillRow(s.name, s.stat, s.x2, s.basic)).join("") + extras;
    return (
      `<div class="cs-cat"><div class="cs-cathead"><span>${esc(title)}</span>` +
      `<span class="cs-hc">NIV</span><span class="cs-hc">CAR</span><span class="cs-hc">BASE</span></div>${rows}</div>`
    );
  };

  const CAT_TITLES = {
    Aprendizaje: "Habilidades de aprendizaje",
    "Armas a distancia": "Habilidades de armas a distancia",
    Atención: "Habilidades de atención",
    Control: "Habilidades de control",
    Corporales: "Habilidades corporales",
    Interpretación: "Habilidades de interpretación",
    Lucha: "Habilidades de lucha",
    Sociales: "Habilidades sociales",
    Técnicas: "Habilidades técnicas",
  };

  const buildPrintSheet = () => {
    const role = currentRole();
    const d = derived();
    const sheet = $("#printSheet");
    const S = (k) => esc(state.stats[k] ?? "");

    // Canonical skills grouped by category with friendly display names
    const canon = canonicalSkills().map((s) => ({ ...s, basic: CPR.BASIC_SKILLS.includes(s.name) || CPR.BASIC_SKILLS.includes(baseName(s.name)) }));
    const byCat = {};
    canon.forEach((s) => {
      (byCat[s.cat] = byCat[s.cat] || []).push(s);
    });
    const block = (cat) => (byCat[cat] ? csCatBlock(CAT_TITLES[cat] || cat, byCat[cat], cat) : "");
    const skillColA = block("Aprendizaje") + block("Armas a distancia");
    const skillColB = block("Atención") + block("Control") + block("Corporales") + block("Interpretación");
    const skillColC = block("Lucha") + block("Sociales") + block("Técnicas");

    // Stat ladder
    const hInfo = humanityInfo();
    const currentEmp = Math.max(0, Math.floor(hInfo.current / 10));
    const ladder = CPR.STATS.map((st) => {
      const isEmp = st.key === "emp";
      const isSue = st.key === "sue";
      const der = isEmp
        ? `${currentEmp} <span class="cs-de">de</span> ${S("emp")}`
        : isSue
          ? `<span class="cs-blank"></span> <span class="cs-de">de</span> ${S("sue")}`
          : "";
      return (
        `<div class="cs-stat"><span class="cs-sk">${st.abbr}</span>` +
        `<span class="cs-sv">${S(st.key)}</span>` +
        (isSue || isEmp ? `<span class="cs-sder">${der}</span>` : "") +
        `</div>`
      );
    }).join("");

    // Weapons table rows
    const weaponRows = () => {
      const rows = state.weapons.map((w) => {
        const meta = findWeaponMeta(w.name);
        return (
          `<tr><td>${esc(w.name)}</td><td>${esc(meta.dmg)}</td><td>${esc(meta.mag)}</td><td>${esc(meta.cdt)}</td><td>${esc(meta.notes)}</td></tr>`
        );
      });
      while (rows.length < 6) rows.push("<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>");
      return rows.join("");
    };

    // Armor rows: head / body / shield
    const armorRow = (label) => {
      const found = state.armor.find((a) => new RegExp(label, "i").test(a.name));
      const meta = found ? findArmorMeta(found.name) : { cp: "", pen: "" };
      return `<tr><td class="cs-al">${label === "cabeza" ? "Cabeza" : label === "cuerpo" ? "Cuerpo" : "Escudo"}</td><td>${esc(meta.cp)}</td><td>${esc(meta.pen)}</td></tr>`;
    };

    const listLines = (arr, min) => {
      const rows = arr.map((it) => `<div class="cs-line">${esc(it.name)}${it.badge ? ` — ${esc(it.badge)}` : ""}</div>`);
      while (rows.length < (min || 0)) rows.push('<div class="cs-line">&nbsp;</div>');
      return rows.join("");
    };

    const lp = (k) => esc(state.lifepath[k] || "");

    // ---- Ciberware bucketing por categoría (para la página 3) ----
    const cyBy = {};
    state.cyber.forEach((c) => {
      const k = c.cat || "Otros";
      (cyBy[k] = cyBy[k] || []).push(c);
    });
    const limbs = cyBy["Cibermiembros"] || [];
    const cyLegs = limbs.filter((c) => /pierna|\bpie\b/i.test(c.name));
    const cyArms = limbs.filter((c) => !cyLegs.includes(c));
    const cyInterno = (cyBy["Ciberequipo interno"] || []).concat(cyBy["Otros"] || []);
    const cyBox = (title, items, hasChk, minRows) => {
      const rows = (items || []).map((c) => {
        const effect = c.desc || cyberDesc(c.name);
        const data = `${effect ? esc(effect) + " · " : ""}−2 máx · PH ${esc(phUsed(c))}`;
        return `<div class="cs-cybrow"><span class="cs-cybn">${esc(c.name)}</span><span class="cs-cybd">${data}</span></div>`;
      });
      while (rows.length < (minRows || 3)) rows.push('<div class="cs-cybrow"><span class="cs-cybn">&nbsp;</span><span class="cs-cybd"></span></div>');
      return (
        `<div class="cs-cybox"><div class="cs-cybhead"><span class="cs-cybtitle">${esc(title)}${hasChk ? ' <span class="cs-chk"></span>' : ""}</span><span class="cs-cybdatos">Datos</span></div>${rows.join("")}</div>`
      );
    };

    sheet.innerHTML =
      // ============ PÁGINA 1 ============
      `<section class="cs-page">` +
        `<div class="cs-brand">CYBERPUNK<span>RED</span></div>` +
        `<div class="cs-p1">` +
          // left column
          `<div class="cs-left">` +
            `<div class="cs-portrait"></div>` +
            `<div class="cs-field"><label>Mote</label><div class="cs-val">${esc(state.name || state.alias || "")}</div></div>` +
            `<div class="cs-field"><label>Rol</label><div class="cs-val">${esc(role.name)}</div></div>` +
            `<div class="cs-field"><label>Aptitud de rol <span class="cs-rank">${esc(state.roleAbilityRank)}</span></label><div class="cs-val">${esc(role.ability)}</div></div>` +
            `<div class="cs-field cs-notes"><label>Notas</label><div class="cs-val">${esc(state.notes || "")}</div></div>` +
            `<div class="cs-hum"><label>Humanidad</label><div class="cs-hum-v">${hInfo.current} <span class="cs-hum-de">de</span> ${hInfo.max}</div></div>` +
            `<div class="cs-dmgrow">` +
              `<div class="cs-dmgbox"><label>Puntos de daño</label><div class="cs-big"><span class="cs-blank cs-blank-lg"></span> <span class="cs-de">de</span> ${d.hp}</div></div>` +
              `<div class="cs-dmgbox"><label>Heridas críticas</label><div class="cs-crit"></div></div>` +
            `</div>` +
            `<div class="cs-dmgrow">` +
              `<div class="cs-dmgbox"><label>Gravemente herido</label><div class="cs-big">${d.sw}</div></div>` +
              `<div class="cs-dmgbox"><label>Adicciones</label><div class="cs-crit"></div></div>` +
            `</div>` +
            `<div class="cs-dmgbox cs-death"><label>Salvación contra muerte</label><div class="cs-big">${d.death}</div><small>-2 a todas las acciones al estar gravemente herido</small></div>` +
          `</div>` +
          // stat ladder
          `<div class="cs-ladder">${ladder}</div>` +
          // skills
          `<div class="cs-skills">${skillColA}</div>` +
          `<div class="cs-skills">${skillColB}</div>` +
          `<div class="cs-skills">${skillColC}</div>` +
        `</div>` +
        // combat
        `<div class="cs-combat">` +
          `<div class="cs-combat-left">` +
            `<h3 class="cs-red-h">Armas y blindaje</h3>` +
            `<table class="cs-armor"><thead><tr><th class="cs-al">Blindaje</th><th>CP</th><th>Penalizador</th></tr></thead>` +
            `<tbody>${armorRow("cabeza")}${armorRow("cuerpo")}${armorRow("escudo")}</tbody></table>` +
            `<div class="cs-armor-note">El penalizador se aplica a REF, DES y MOV</div>` +
          `</div>` +
          `<table class="cs-weapons"><thead><tr><th>Arma</th><th>Daño</th><th>Munición</th><th>CdT</th><th>Notas</th></tr></thead><tbody>${weaponRows()}</tbody></table>` +
        `</div>` +
      `</section>` +
      // ============ PÁGINA 2 ============
      `<section class="cs-page">` +
        `<div class="cs-brand">CYBERPUNK<span>RED</span></div>` +
        `<div class="cs-p2">` +
          `<div class="cs-p2-left">` +
            `<div class="cs-field"><label>Alias</label><div class="cs-val">${esc(state.alias || "")}</div></div>` +
            `<h3 class="cs-red-h">Vida pasada</h3>` +
            `<div class="cs-lpgrid">` +
              csLp("Origen cultural", lp("region")) + csLp("Personalidad", lp("Personalidad")) +
              csLp("Estilo de ropa", lp("Estilo de ropa")) + csLp("Peinado", lp("Peinado")) +
              csLp("¿Qué aprecias más?", lp("Lo que más valoras")) + csLp("¿Qué opinas de la gente?", lp("Opinión sobre la gente")) +
              csLp("Persona que más valoras", lp("Persona que más valoras")) + csLp("Posesión más valiosa", lp("Posesión más valiosa")) +
              csLp("Entorno familiar", lp("Entorno familiar original")) + csLp("Rasgo característico", lp("Rasgo característico")) +
              csLp("Objetivos vitales", lp("Objetivo vital")) + csLp("Trágica vida amorosa", lp("Vida amorosa trágica")) +
            `</div>` +
            `<div class="cs-field"><label>Idioma de origen</label><div class="cs-val">${lp("idioma")}</div></div>` +
          `</div>` +
          `<div class="cs-p2-right">` +
            `<h3 class="cs-blk-h">Equipo</h3>` +
            `<div class="cs-equip">${listLines(state.gear, 10)}</div>` +
            `<h3 class="cs-red-h">Moda</h3>` +
            `<div class="cs-moda">${esc([lp("Estilo de ropa"), lp("Peinado"), lp("Rasgo característico")].filter(Boolean).join(" · "))}</div>` +
          `</div>` +
        `</div>` +
      `</section>` +
      // ============ PÁGINA 3 · CIBEREQUIPO ============
      `<section class="cs-page">` +
        `<div class="cs-brand">CYBERPUNK<span>RED</span></div>` +
        `<h3 class="cs-red-h cs-cyber-h">Ciberequipo</h3>` +
        `<div class="cs-hum-line">Humanidad base ${hInfo.base} · ${hInfo.count} pieza${hInfo.count === 1 ? "" : "s"} (−${hInfo.maxReduction} máx) · PH total ${hInfo.phTotal} (${state.cyberPhMode === "roll" ? "tirada d6" : "fija"}) → <b>Humanidad ${hInfo.current} / máx ${hInfo.max}</b></div>` +
        `<div class="cs-p3">` +
          `<div class="cs-p3-col">` +
            cyBox("Equipo de ciberaudio", cyBy["Ciberaudio"], true, 3) +
            cyBox("Ciberojo derecho", cyBy["Ciberópticos"], true, 3) +
            cyBox("Ciberojo izquierdo", [], true, 3) +
            cyBox("Ciberbrazo derecho", cyArms, true, 3) +
            cyBox("Ciberbrazo izquierdo", [], true, 3) +
          `</div>` +
          `<div class="cs-p3-col">` +
            cyBox("Conexión neuronal", cyBy["Equipo neuronal"], true, 5) +
            cyBox("Ciberpierna derecha", cyLegs, true, 3) +
            cyBox("Ciberpierna izquierda", [], true, 3) +
            `<p class="cs-cyber-note">Marca la casilla del ciberequipo con requisito básico (ciberojo, conexión neuronal…) que tengas; sus opciones van en las líneas de debajo. El ciberequipo sin requisito básico se anota directamente en su categoría.</p>` +
          `</div>` +
          `<div class="cs-p3-col">` +
            cyBox("Ciberequipo interno", cyInterno, false, 7) +
            cyBox("Ciberequipo externo", cyBy["Ciberequipo externo"], false, 5) +
            cyBox("Cibermoda", cyBy["Cibermoda"], false, 5) +
            cyBox("Borgware", cyBy["Borgware"], false, 3) +
          `</div>` +
        `</div>` +
      `</section>`;
  };

  // Helper to render a lifepath cell for the sheet
  const csLp = (label, value) => `<div class="cs-lpcell"><label>${esc(label)}</label><div class="cs-val">${value}</div></div>`;

  // Weapon/armor metadata lookup for the sheet
  const findWeaponMeta = (name) => {
    const all = CPR.WEAPONS_RANGED.concat(CPR.WEAPONS_MELEE);
    const hit = all.find((w) => name.toLowerCase().includes(w.name.toLowerCase()));
    if (hit) return { dmg: hit.dmg || "", mag: hit.mag || "—", cdt: hit.cdt || "", notes: hit.special || hit.ej || "" };
    return { dmg: "", mag: "", cdt: "", notes: "" };
  };
  const findArmorMeta = (name) => {
    const hit = CPR.ARMOR.find((a) => name.toLowerCase().includes(a.name.toLowerCase()));
    if (hit) return { cp: hit.cp, pen: hit.penalty };
    const m = name.match(/cp\s*(\d+)/i);
    return { cp: m ? m[1] : "", pen: "" };
  };

  const doPrint = () => {
    buildPrintSheet();
    window.print();
  };

  // ============================================================
  // EVENTS
  // ============================================================
  const bindEvents = () => {
    // method chips
    $("#methodGrid").addEventListener("click", (e) => {
      const chip = e.target.closest("[data-method]");
      if (chip) setMethod(chip.dataset.method);
    });

    // topbar actions
    document.body.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const a = btn.dataset.action;
      switch (a) {
        case "randomize": randomizeAll(); break;
        case "export": exportJson(); break;
        case "import": $("#importFile").click(); break;
        case "print": doPrint(); break;
        case "reset":
          if (window.confirm("¿Empezar un personaje nuevo? Se perderá el actual.")) {
            state = emptyState();
            render();
          }
          break;
        case "roll-stats": rollStats(); break;
        case "apply-package":
          if (state.method === "streetrat") applyPackage();
          else rollSkills();
          break;
        case "roll-lifepath": rollAllLifepath(); break;
        case "add-skill": addSkill(); break;
        case "starter-gear": applyStarterGear(); break;
        case "add-weapon": openModal("weapons"); break;
        case "add-armor": openModal("armor"); break;
        case "add-gear": openModal("gear"); break;
        case "add-cyber": openModal("cyber"); break;
        case "reroll-ph":
          rollAllCyber();
          renderTagLists();
          renderCyberControls();
          renderDerived();
          save();
          break;
        case "close-modal": closeModal(); break;
        case "add-custom": addCustomToList(); break;
      }
    });

    // identity inputs
    $("#charName").addEventListener("input", (e) => { state.name = e.target.value; save(); });
    $("#charAlias").addEventListener("input", (e) => { state.alias = e.target.value; save(); });
    $("#roleSelect").addEventListener("change", (e) => { state.roleKey = e.target.value; render(); });
    $("#roleAbilityRank").addEventListener("input", (e) => {
      state.roleAbilityRank = clamp(parseInt(e.target.value, 10) || 0, 0, 10);
      save();
    });

    // stat inputs
    $("#statGrid").addEventListener("input", (e) => {
      const inp = e.target.closest("[data-stat]");
      if (!inp) return;
      state.stats[inp.dataset.stat] = clamp(parseInt(inp.value, 10) || 0, 1, 20);
      renderDerived();
      updateStatBudget();
      save();
    });

    // skill inputs / removal
    $("#skillList").addEventListener("input", (e) => {
      const inp = e.target.closest("[data-skill]");
      if (!inp) return;
      const lv = clamp(parseInt(inp.value, 10) || 0, 0, 10);
      if (lv === 0) delete state.skills[inp.dataset.skill];
      else state.skills[inp.dataset.skill] = lv;
      // light update: keep focus, refresh budget + row highlight only
      inp.closest(".skill-row").classList.toggle("has-level", lv > 0);
      updateSkillBudget();
      save();
    });
    $("#skillList").addEventListener("click", (e) => {
      const rm = e.target.closest("[data-remove-skill]");
      if (rm) {
        delete state.skills[rm.dataset.removeSkill];
        render();
      }
    });

    // tag list removal
    document.body.addEventListener("click", (e) => {
      const rm = e.target.closest("[data-remove-list]");
      if (rm) {
        const key = rm.dataset.removeList;
        state[key].splice(parseInt(rm.dataset.idx, 10), 1);
        renderTagLists();
        if (key === "cyber") {
          renderCyberControls();
          renderDerived();
        }
        save();
      }
    });

    // ciberware: modo PH (fija / tirada d6) y re-tirar
    $("#cyberRollToggle").addEventListener("change", (e) => {
      state.cyberPhMode = e.target.checked ? "roll" : "fixed";
      if (state.cyberPhMode === "roll") rollAllCyber();
      renderTagLists();
      renderCyberControls();
      renderDerived();
      save();
    });

    // lifepath
    $("#lifepathGrid").addEventListener("input", (e) => {
      const inp = e.target.closest("[data-lp]");
      if (inp) { state.lifepath[inp.dataset.lp] = inp.value; save(); }
    });
    $("#lifepathGrid").addEventListener("click", (e) => {
      const roll = e.target.closest("[data-roll-lp]");
      if (roll) rollLifepathField(roll.dataset.rollLp);
    });
    $("#lifepathNotes").addEventListener("input", (e) => { state.notes = e.target.value; save(); });

    // modal search
    $("#modalSearch").addEventListener("input", (e) => renderModalBody(e.target.value));
    $("#modalBackdrop").addEventListener("click", (e) => {
      if (e.target === $("#modalBackdrop")) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !$("#modalBackdrop").hidden) closeModal();
    });

    // import file
    $("#importFile").addEventListener("change", (e) => {
      const f = e.target.files[0];
      if (f) importJson(f);
      e.target.value = "";
    });
  };

  // ============================================================
  // INIT
  // ============================================================
  load();
  bindEvents();
  render();
})();
