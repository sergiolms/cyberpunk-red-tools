// ============================================================
// ChoomDate - app.js
// Deck estilo Tinder que resuelve el "Digital Dating in the Dark
// Future" (RTG, 2022) completo al hacer match.
// Todo local, sin dependencias externas.
// ============================================================
(function () {
  "use strict";

  // ------- Utilities -------
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const d10  = () => rand(1, 10);
  const d6   = () => rand(1, 6);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const uid  = () => Math.random().toString(36).slice(2, 10);
  const esc  = (v) =>
    String(v).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));

  // ------- Card colors per role (fondo de carta) -------
  const roleBackground = (accent) =>
    `linear-gradient(135deg, ${accent}33 0%, #1a1030 45%, #0d1a2e 100%)`;
  const NEUTRAL_ACCENT = "#ff2e88";
  const NEUTRAL_BG = roleBackground(NEUTRAL_ACCENT);

  // ------- Match generator (perfil mínimo) -------
  // Datepath: solo tienes 2 keywords + nombre. Nada más hasta la cita.
  const DECK_SIZE = 12;

  const generateMatch = () => {
    const firstName = pick(FIRST_NAMES);
    // Dos keywords distintas
    const k1 = pick(KEYWORDS);
    let k2 = pick(KEYWORDS);
    while (k2 === k1) k2 = pick(KEYWORDS);
    const keywords = [k1, k2];

    // Si alguna keyword coincide con un rol, la carta hereda su glyph/color
    const roleKw = keywords.find((k) => ROLE_META[k]);
    const role = roleKw ? { name: roleKw, ...ROLE_META[roleKw] } : null;
    const accent = role ? role.accent : NEUTRAL_ACCENT;

    return {
      id: uid(),
      firstName,
      initial: firstName[0].toUpperCase(),
      keywords,
      role,
      accent,
      cardBg: roleBackground(accent),
    };
  };

  const generateDeck = (n = DECK_SIZE) =>
    Array.from({ length: n }, () => generateMatch());

  // ============================================================
  // DATEPATH RESOLVER
  // Resuelve el Datepath completo al hacer match. Devuelve un
  // "informe de cita" estructurado que se pinta en el modal.
  // ============================================================

  // Resolvers de subtablas del manual. Cada resolver hace su propia tirada.
  const resolveRef = (refId, refCount = 1) => {
    switch (refId) {
      case "keyword": {
        // Datepath pág. 12: "Tira en Keywords hasta obtener una NUEVA para tu cita"
        // Aquí simplemente devolvemos una keyword nueva.
        const newKw = pick(KEYWORDS);
        return { source: "Keywords · Datepath p.3", entries: [newKw] };
      }

      case "roleLifepath": {
        // "Usa la Vía de la Vida basada en rol (CP:R p.53)"
        // No tenemos las tablas aquí; devolvemos el rol como referencia.
        const roles = Object.keys(ROLE_META);
        return {
          source: "Vía de la Vida basada en rol · CP:R p.53",
          entries: [`Rol: ${pick(roles)} — el DJ desarrolla esta parte.`],
          verbatim: true,
        };
      }

      case "previousRelationship": {
        // Datepath pág. 12: "Tira 1d10. Par = terminó bien. Impar = tira en Trágica vida amorosa"
        const roll = d10();
        if (roll % 2 === 0) {
          return {
            source: "1d10 par — la relación anterior terminó bien.",
            entries: [`Tirada ${roll}: la relación anterior terminó bien.`],
            verbatim: true,
          };
        }
        return {
          source: `1d10 impar (${roll}) → Trágica vida amorosa · CP:R p.52`,
          entries: [pick(LIFEPATH.tragicLove.entries)],
        };
      }

      case "familyDouble": {
        // "Tira en Entorno familiar original Y en Tragedia familiar"
        return {
          source: "Entorno familiar + Tragedia familiar · CP:R p.49-50",
          entries: [
            "Entorno: " + pick(LIFEPATH.family.entries),
            "Tragedia: " + pick(LIFEPATH.familyCrisis.entries),
          ],
        };
      }

      default: {
        // Subtabla estándar del manual
        const table = LIFEPATH[refId];
        if (!table) return null;
        const entries = Array.from({ length: refCount }, () => pick(table.entries));
        return { source: table.source, entries };
      }
    }
  };

  const resolveBeat = (beat) => {
    const out = { text: beat.text };
    if (beat.flag) out.flag = beat.flag;
    if (beat.postDate) out.postDate = beat.postDate;
    if (beat.ref) {
      const resolved = resolveRef(beat.ref, beat.refCount || 1);
      if (resolved) out.detail = resolved;
    }
    return out;
  };

  // Resuelve el Datepath completo dado un match seleccionado.
  // `options.vibeModifier` desplaza el 1d10 inicial (positivo = peor cita).
  // Se usa para 2ª/3ª citas con el mismo contacto: la cita previa influye.
  const rollDatepath = (match, options = {}) => {
    // Paso 2-3: dónde y qué (Where + What)
    const location = pick(LOCATIONS);
    const activity = pick(location.activities);

    // Paso 4: How does it go? (1d10 [±modificador], acotado a 1-10)
    const rawRoll = d10();
    const modifier = options.vibeModifier || 0;
    const vibeRoll = Math.max(1, Math.min(10, rawRoll + modifier));
    const bucket = VIBE_BUCKETS.find((b) => vibeRoll >= b.min && vibeRoll <= b.max);
    const vibe = bucket.vibe;

    const report = {
      match,
      location,
      activity,
      vibeRoll,
      vibe,
    };

    // Si aplicó un modificador, guarda desglose para mostrarlo en el informe.
    if (modifier !== 0) {
      report.vibeModifier = {
        rawRoll,
        modifier,
        finalRoll: vibeRoll,
        sourceVibe: options.previousVibe || null,
      };
    }

    // Ghosted: fin del camino.
    if (vibe === "ghosted") {
      report.ghostedAtStart = true;
      return report;
    }

    // Paso 5-7: Beginning, Middle, End
    const beatsTable = vibe === "good"
      ? { beg: GOOD_BEGINNING, mid: GOOD_MIDDLE, end: GOOD_END }
      : { beg: WEIRD_BEGINNING, mid: WEIRD_MIDDLE, end: WEIRD_END };

    report.beginning = resolveBeat(pick(beatsTable.beg));

    // Un "Weird Middle 1" corta la cita: la persona se va al baño y no vuelve.
    const middleBeat = pick(beatsTable.mid);
    report.middle = resolveBeat(middleBeat);
    if (report.middle.flag === "abort") {
      report.aborted = true;
      return report;
    }

    const endBeat = pick(beatsTable.end);
    report.end = resolveBeat(endBeat);

    // Extra para cita BUENA: One... Weird... Thing
    if (vibe === "good") {
      const parity = d10();
      if (parity % 2 === 1) {
        const quirkRoll = d10();
        report.weirdThing = {
          text: GOOD_WEIRD_QUIRKS[quirkRoll - 1],
          roll: quirkRoll,
        };
      } else {
        report.weirdThing = { none: true, parity };
      }
    }

    // Post-Date: si End trae skip-postdate, saltamos.
    if (report.end.flag === "skip-postdate") {
      report.postDate = {
        skipped: true,
        wantsMore: true,
        reason: "El «Final» ya cerró la historia (quiere otra cita).",
      };
      return report;
    }

    // Do They Say They Want Another Date? (par/impar)
    const anotherRoll = d10();
    const wantsAnother = anotherRoll % 2 === 0;

    if (!wantsAnother) {
      report.postDate = {
        wantsMore: false,
        anotherRoll,
        detail: "No están tan interesados y se van sin más. Empieza con otra cita o descansa del dating.",
      };
      return report;
    }

    // Aftermath: 1d10 (9-10 = ghosted post-cita)
    const aftermathRoll = d10();
    const ghosted = aftermathRoll >= 9;
    report.postDate = {
      wantsMore: true,
      anotherRoll,
      aftermathRoll,
      ghosted,
      detail: ghosted
        ? "No vuelves a saber de ellos, al menos en cuanto a una segunda cita... pero Night City puede ser un lugar aterradoramente pequeño cuando quiere."
        : "No te han ghosteado. Te contactarán. Empieza una nueva historia — que el DJ y tú decidáis cómo florece (o se marchita).",
    };

    return report;
  };

  // ============================================================
  // ESTADO
  // ============================================================

  // v3 = contactos con historial de citas.
  // v2 = informes sueltos (legacy). Se migra automáticamente al leer.
  const STORAGE_KEY_V3 = "choomdate.contacts.v3";
  const STORAGE_KEY_V2 = "choomdate.reports.v2";

  // Modificador de vibe para citas 2+ con el mismo contacto.
  // Basado en el vibe de la cita anterior. Negativo = más probable buena cita.
  const VIBE_CARRYOVER = { good: -2, weird: -1, ghosted: 3 };
  const VIBE_CARRYOVER_LABEL = {
    good: "cita previa buena → impulso positivo",
    weird: "cita previa rara → leve impulso",
    ghosted: "te ghostearon → difícil de recuperar",
  };

  const state = {
    deck: [],
    sessionMatches: 0,
    // Agenda: cada entrada es un contacto con su historial de citas.
    savedContacts: [],
    // Vista actual del modal:
    //  - currentEntry: { id, at, match, report }   (siempre presente cuando el modal está abierto)
    //  - contactContext: null (fresh) | { contactId, dateIndex } (agenda)
    currentEntry: null,
    contactContext: null,
    animating: false,
  };

  const loadSaved = () => {
    // 1. Intento leer v3 directamente.
    try {
      const raw3 = localStorage.getItem(STORAGE_KEY_V3);
      if (raw3) {
        state.savedContacts = JSON.parse(raw3);
        return;
      }
    } catch { /* storage roto, seguimos abajo */ }

    // 2. Migro desde v2 (informes sueltos) si existe.
    try {
      const raw2 = localStorage.getItem(STORAGE_KEY_V2);
      if (raw2) {
        const oldReports = JSON.parse(raw2);
        state.savedContacts = oldReports.map((entry) => {
          const match = entry.match || (entry.report && entry.report.match);
          const at = entry.at || Date.now();
          const dateId = entry.id || uid();
          return {
            id: uid(),
            match,
            firstSeenAt: at,
            lastSeenAt: at,
            dates: [{ id: dateId, at, report: entry.report }],
          };
        });
        persistSaved();
        return;
      }
    } catch { /* fallback abajo */ }

    state.savedContacts = [];
  };

  const persistSaved = () => {
    try {
      localStorage.setItem(STORAGE_KEY_V3, JSON.stringify(state.savedContacts));
    } catch { /* storage full or blocked */ }
  };

  // ------- DOM refs -------
  const dom = {
    stack:          $("#deckStack"),
    empty:          $("#deckEmpty"),
    counter:        $("#sessionCounter"),
    matchOverlay:   $("#matchOverlay"),
    reportModal:    $("#reportModal"),
    reportTitle:    $("#reportTitle"),
    reportKicker:   $("#reportKicker"),
    matchBody:      $("#matchBody"),
    reportActions:  $("#reportActions"),
    saveBtn:        $("#saveMatchBtn"),
    dismissBtn:     $("#dismissMatchBtn"),
    infoOverlay:    $("#infoOverlay"),
    matchesOverlay: $("#matchesOverlay"),
    matchesBody:    $("#matchesBody"),
    controlBtns:    null, // populated post-render
  };

  // El botón Guardar solo está disponible para informes recién tirados,
  // no cuando se está releyendo uno ya guardado desde la agenda.
  const setCanSaveCurrent = (canSave) => {
    if (!dom.saveBtn) return;
    dom.saveBtn.disabled = !canSave;
    dom.saveBtn.textContent = canSave ? "Guardar en agenda" : "Ya en tu agenda";
  };

  // Cabecera + énfasis del footer según el desenlace de la cita.
  const VIBE_CHROME = {
    good: {
      title: "¡Es un MATCH!",
      kicker: "// CONEXIÓN ESTABLECIDA",
      primary: "save", // Guardar en agenda es la acción principal
    },
    weird: {
      title: "Cita rara",
      kicker: "// SEÑAL INESTABLE",
      primary: "save",
    },
    ghosted: {
      title: "Te dieron plantón",
      kicker: "// SIN RESPUESTA",
      primary: "dismiss", // Descartar es la acción principal aquí
    },
  };

  const applyVibeChrome = (vibe) => {
    const chrome = VIBE_CHROME[vibe] || VIBE_CHROME.good;
    if (dom.reportTitle)  dom.reportTitle.textContent  = chrome.title;
    if (dom.reportKicker) dom.reportKicker.textContent = chrome.kicker;
    if (dom.reportModal)  dom.reportModal.dataset.tone = vibe;
    // Énfasis del footer: swap de la clase primary entre Guardar y Descartar
    if (dom.saveBtn && dom.dismissBtn) {
      dom.saveBtn.classList.toggle("primary",    chrome.primary === "save");
      dom.dismissBtn.classList.toggle("primary", chrome.primary === "dismiss");
    }
  };

  // ============================================================
  // RENDERING - Cartas (front)
  // ============================================================

  const renderCard = (match, depth) => {
    const card = document.createElement("article");
    card.className = "profile-card";
    card.dataset.depth = String(depth);
    card.dataset.id = match.id;
    card.style.setProperty("--card-bg", match.cardBg);
    card.style.setProperty("--card-accent", match.accent);
    card.style.background =
      `linear-gradient(180deg, rgba(9, 11, 15, 0) 55%, rgba(9, 11, 15, 0.92) 100%), ${match.cardBg}`;

    const fileNo = String(rand(100, 999)) + "-" + String(rand(1000, 9999));
    const roleGlyph = match.role ? match.role.glyph : "♡";

    card.innerHTML = `
      <div class="card-header">
        <span class="file-no">// EXP.${esc(fileNo)}</span>
        <span>THE GARDEN · ZIGGURAT</span>
      </div>

      <div class="card-avatar" aria-hidden="true">
        <span class="monogram">${esc(match.initial)}</span>
        <span class="role-badge">Nuevo Match</span>
        <span class="role-glyph">${roleGlyph}</span>
      </div>

      <div class="card-stamp like">MATCH</div>
      <div class="card-stamp nope">NOPE</div>

      <div class="card-body">
        <h2 class="card-name">${esc(match.firstName)}</h2>
        <p class="card-tagline">Descripción con dos palabras clave:</p>
        <div class="card-keywords">
          ${match.keywords.map((kw) => `
            <span class="card-keyword${ROLE_META[kw] ? " is-role" : ""}">${esc(kw)}</span>
          `).join("")}
        </div>
        <p class="card-footer-note">
          No sabes nada más de esta persona. Para eso es la primera cita.
        </p>
      </div>
    `;

    return card;
  };

  const renderDeck = () => {
    dom.stack.innerHTML = "";
    const visible = state.deck.slice(0, 4);
    for (let i = visible.length - 1; i >= 0; i--) {
      const depth = i;
      const card = renderCard(visible[i], depth);
      if (depth === 0) attachDrag(card);
      dom.stack.appendChild(card);
    }
    dom.empty.hidden = state.deck.length !== 0;
    updateCounter();
    updateControls();
  };

  const updateCounter = () => {
    const total = state.sessionMatches;
    dom.counter.textContent = `${total} cita${total === 1 ? "" : "s"}`;
  };

  const updateControls = () => {
    const empty = state.deck.length === 0;
    if (!dom.controlBtns) dom.controlBtns = $$(".deck-btn");
    dom.controlBtns.forEach((btn) => {
      // El botón de info nunca se deshabilita
      if (btn.dataset.action === "help") return;
      btn.disabled = empty;
    });
  };

  // ============================================================
  // DRAG / SWIPE
  // ============================================================
  const SWIPE_THRESHOLD = 110;
  const TILT_THRESHOLD  = 40;

  const attachDrag = (card) => {
    let startX = 0, startY = 0;
    let dx = 0, dy = 0;
    let active = false;

    const onDown = (ev) => {
      if (state.animating) return;
      active = true;
      const point = ev.touches ? ev.touches[0] : ev;
      startX = point.clientX;
      startY = point.clientY;
      dx = dy = 0;
      card.classList.add("dragging");
      if (!ev.touches) {
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
      }
    };

    const onMove = (ev) => {
      if (!active) return;
      const point = ev.touches ? ev.touches[0] : ev;
      dx = point.clientX - startX;
      dy = point.clientY - startY;
      const rot = dx / 18;
      card.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
      if (dx > TILT_THRESHOLD) card.dataset.tilt = "right";
      else if (dx < -TILT_THRESHOLD) card.dataset.tilt = "left";
      else delete card.dataset.tilt;
      if (ev.touches && Math.abs(dx) > 10) ev.preventDefault();
    };

    const onUp = () => {
      if (!active) return;
      active = false;
      card.classList.remove("dragging");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);

      if (dx > SWIPE_THRESHOLD) {
        commitDecision("like");
      } else if (dx < -SWIPE_THRESHOLD) {
        commitDecision("nope");
      } else {
        card.style.transform = "";
        delete card.dataset.tilt;
      }
    };

    card.addEventListener("mousedown", onDown);
    card.addEventListener("touchstart", onDown, { passive: true });
    card.addEventListener("touchmove", onMove, { passive: false });
    card.addEventListener("touchend", onUp);
    card.addEventListener("touchcancel", onUp);
  };

  // ============================================================
  // DECISIONES
  // ============================================================
  const commitDecision = (decision) => {
    if (state.animating || state.deck.length === 0) return;
    const top = dom.stack.querySelector('.profile-card[data-depth="0"]');
    if (!top) return;
    state.animating = true;

    top.classList.add(decision === "like" ? "fly-right" : "fly-left");
    top.style.transform = "";

    const match = state.deck[0];

    window.setTimeout(() => {
      state.deck.shift();
      renderDeck();
      state.animating = false;

      if (decision === "like") {
        state.sessionMatches += 1;
        updateCounter();
        openDateReport(match);
      }
    }, 380);
  };

  // ============================================================
  // MODAL DE INFORME DE CITA
  // ============================================================

  const renderRoleBadge = (match) => {
    if (!match.role) return "";
    return `<span class="role-chip" style="border-color:${match.role.accent};color:${match.role.accent}">
      ${match.role.glyph} ${esc(match.role.name)}
    </span>`;
  };

  const renderBeat = (beat, label) => {
    if (!beat) return "";
    const detail = beat.detail
      ? `<div class="beat-detail">
          <div class="beat-detail-source">${esc(beat.detail.source)}</div>
          ${beat.detail.entries.map((e) => `<div class="beat-detail-entry">› ${esc(e)}</div>`).join("")}
        </div>`
      : "";
    return `
      <div class="beat">
        <div class="beat-label">${esc(label)}</div>
        <div class="beat-text">${esc(beat.text)}</div>
        ${detail}
      </div>
    `;
  };

  const renderPostDate = (postDate) => {
    if (!postDate) return "";

    if (postDate.skipped) {
      return `
        <section class="report-section report-postdate is-positive">
          <h3 class="report-section-title">Post-cita</h3>
          <p><strong>Quiere otra cita — sin dudarlo.</strong> ${esc(postDate.reason)}</p>
        </section>
      `;
    }

    if (!postDate.wantsMore) {
      return `
        <section class="report-section report-postdate is-negative">
          <h3 class="report-section-title">Post-cita · ¿Quieren otra cita?</h3>
          <p>Tirada 1d10 → <strong>${postDate.anotherRoll} (impar)</strong>.</p>
          <p>${esc(postDate.detail)}</p>
        </section>
      `;
    }

    const cls = postDate.ghosted ? "is-negative" : "is-positive";
    return `
      <section class="report-section report-postdate ${cls}">
        <h3 class="report-section-title">Post-cita</h3>
        <p>¿Quieren otra cita? 1d10 → <strong>${postDate.anotherRoll} (par, sí)</strong>.</p>
        <p>Aftermath 1d10 → <strong>${postDate.aftermathRoll}</strong>${postDate.ghosted ? " (ghosteado)" : " (siguen ahí)"}.</p>
        <p>${esc(postDate.detail)}</p>
      </section>
    `;
  };

  const renderReport = (r) => {
    const vibeLabel = { good: "💛 Buena cita", weird: "🤨 Cita rara", ghosted: "👻 Te ghostearon" }[r.vibe];

    let body = `
      <header class="report-head">
        <div class="report-match-line">
          <span class="report-match-initial" style="border-color:${r.match.accent};background:${r.match.cardBg}">
            ${esc(r.match.initial)}
          </span>
          <div class="report-match-info">
            <h2 class="report-match-name">${esc(r.match.firstName)}</h2>
            <div class="report-match-keywords">
              ${r.match.keywords.map((kw) => `<span class="report-kw">${esc(kw)}</span>`).join("")}
              ${renderRoleBadge(r.match)}
            </div>
          </div>
        </div>
      </header>

      <section class="report-section">
        <h3 class="report-section-title">Dónde y qué</h3>
        <p class="report-location"><strong>${esc(r.location.name)}</strong> — <em>${esc(r.location.hint)}</em></p>
        <p class="report-activity">🎯 ${esc(r.activity)}</p>
      </section>

      <section class="report-section report-vibe vibe-${r.vibe}">
        <h3 class="report-section-title">¿Cómo va? (1d10 → ${r.vibeRoll})</h3>
        <p class="vibe-label">${vibeLabel}</p>
        ${r.vibeModifier ? `
          <p class="vibe-modifier">
            Modificador aplicado: ${r.vibeModifier.rawRoll} ${r.vibeModifier.modifier >= 0 ? "+" : "\u2212"} ${Math.abs(r.vibeModifier.modifier)} = ${r.vibeModifier.finalRoll}
            ${r.vibeModifier.sourceVibe ? `<br /><em>${esc(VIBE_CARRYOVER_LABEL[r.vibeModifier.sourceVibe] || "")}</em>` : ""}
          </p>
        ` : ""}
      </section>
    `;

    if (r.ghostedAtStart) {
      body += `
        <section class="report-section is-ghosted">
          <p>No aparecen. Nunca sabes por qué. Bienvenido a Night City.</p>
        </section>
      `;
    } else {
      body += `
        <section class="report-section report-beats">
          ${renderBeat(r.beginning, "Inicio")}
          ${renderBeat(r.middle, "Medio")}
          ${r.aborted
            ? `<p class="beats-aborted">La cita se corta aquí — nunca vuelven del baño.</p>`
            : renderBeat(r.end, "Final")}
        </section>
      `;

      if (r.weirdThing) {
        if (r.weirdThing.none) {
          body += `
            <section class="report-section report-weird">
              <h3 class="report-section-title">Una... cosa... rara</h3>
              <p>1d10 par (${r.weirdThing.parity}) → sin rarezas. Cita limpia.</p>
            </section>
          `;
        } else {
          body += `
            <section class="report-section report-weird">
              <h3 class="report-section-title">Una... cosa... rara (1d10 → ${r.weirdThing.roll})</h3>
              <p>${esc(r.weirdThing.text)}</p>
            </section>
          `;
        }
      }

      if (!r.aborted) {
        body += renderPostDate(r.postDate);
      }
    }

    return body;
  };

  // ============================================================
  // NAVEGADOR DE HISTORIAL (solo para contactos guardados con >1 citas)
  // ============================================================
  const formatDateTime = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const renderHistoryNav = (contact, dateIndex) => {
    const total = contact.dates.length;
    if (total <= 1) return "";
    const at = contact.dates[dateIndex]?.at;
    return `
      <nav class="date-nav" aria-label="Historial de citas">
        <button class="date-nav-btn" type="button" data-action="prev-date"
          ${dateIndex === 0 ? "disabled" : ""} aria-label="Cita anterior">◄</button>
        <div class="date-nav-info">
          <span class="date-nav-count">Cita ${dateIndex + 1} de ${total}</span>
          <span class="date-nav-when">${esc(formatDateTime(at))}</span>
        </div>
        <button class="date-nav-btn" type="button" data-action="next-date"
          ${dateIndex === total - 1 ? "disabled" : ""} aria-label="Cita siguiente">►</button>
      </nav>
    `;
  };

  // ============================================================
  // DISPLAY: pinta el modal a partir del estado actual (fresh o saved)
  // ============================================================
  const paintCurrentView = () => {
    const entry = state.currentEntry;
    if (!entry) return;
    const report = entry.report;

    applyVibeChrome(report.vibe);

    let bodyHtml = "";
    if (state.contactContext) {
      const contact = state.savedContacts.find((c) => c.id === state.contactContext.contactId);
      if (contact) bodyHtml += renderHistoryNav(contact, state.contactContext.dateIndex);
    }
    bodyHtml += renderReport(report);
    dom.matchBody.innerHTML = bodyHtml;
    dom.matchBody.scrollTop = 0;

    // Estado del footer: los contactos guardados no se pueden re-guardar,
    // y el bot\u00f3n de re-tirar cambia su significado a \u00abnueva cita\u00bb.
    const isSaved = state.contactContext !== null;
    setCanSaveCurrent(!isSaved);
    setRerollMode(isSaved ? "new-date" : "reroll");
  };

  const setRerollMode = (mode) => {
    const btn = document.querySelector(".reroll-btn");
    if (!btn) return;
    if (mode === "new-date") {
      btn.title = "Lanzar nueva cita (influida por la anterior)";
      btn.setAttribute("aria-label", "Lanzar nueva cita con este contacto");
      btn.dataset.mode = "new-date";
    } else {
      btn.title = "Volver a tirar";
      btn.setAttribute("aria-label", "Volver a tirar el Datepath");
      btn.dataset.mode = "reroll";
    }
  };

  // ============================================================
  // OPEN / CLOSE / SAVE / REROLL / NEW-DATE
  // ============================================================
  const openDateReport = (match) => {
    const report = rollDatepath(match);
    state.currentEntry = {
      id: uid(),
      at: Date.now(),
      match,
      report,
    };
    state.contactContext = null;
    paintCurrentView();
    openOverlay(dom.matchOverlay);
  };

  const closeMatch = () => {
    closeOverlay(dom.matchOverlay);
    state.currentEntry = null;
    state.contactContext = null;
  };

  const saveMatch = () => {
    // Solo se guarda si es un informe fresco (no ya en agenda).
    if (!state.currentEntry || state.contactContext !== null) return;
    const entry = state.currentEntry;
    const contact = {
      id: uid(),
      match: entry.match,
      firstSeenAt: entry.at,
      lastSeenAt: entry.at,
      dates: [{ id: entry.id, at: entry.at, report: entry.report }],
    };
    state.savedContacts.unshift(contact);
    if (state.savedContacts.length > 50) state.savedContacts.length = 50;
    persistSaved();
    closeMatch();
  };

  const rerollMatch = () => {
    if (!state.currentEntry) return;
    const report = rollDatepath(state.currentEntry.match);
    state.currentEntry = {
      ...state.currentEntry,
      id: uid(),
      at: Date.now(),
      report,
    };
    paintCurrentView();
  };

  const addNewDate = () => {
    if (!state.contactContext) return;
    const contact = state.savedContacts.find((c) => c.id === state.contactContext.contactId);
    if (!contact) return;
    // Modificador basado en el vibe de la \u00faltima cita del contacto
    const lastReport = contact.dates[contact.dates.length - 1].report;
    const modifier = VIBE_CARRYOVER[lastReport.vibe] || 0;
    const report = rollDatepath(contact.match, {
      vibeModifier: modifier,
      previousVibe: lastReport.vibe,
    });
    const now = Date.now();
    const newDate = { id: uid(), at: now, report };
    contact.dates.push(newDate);
    contact.lastSeenAt = now;
    persistSaved();
    // Mostramos la reci\u00e9n a\u00f1adida
    state.contactContext = {
      contactId: contact.id,
      dateIndex: contact.dates.length - 1,
    };
    state.currentEntry = { id: newDate.id, at: newDate.at, match: contact.match, report };
    paintCurrentView();
  };

  const rerollOrNewDate = () => {
    if (state.contactContext) addNewDate();
    else rerollMatch();
  };

  const showDateAt = (dateIndex) => {
    if (!state.contactContext) return;
    const contact = state.savedContacts.find((c) => c.id === state.contactContext.contactId);
    if (!contact) return;
    const clamped = Math.max(0, Math.min(contact.dates.length - 1, dateIndex));
    const dateEntry = contact.dates[clamped];
    state.contactContext.dateIndex = clamped;
    state.currentEntry = {
      id: dateEntry.id,
      at: dateEntry.at,
      match: contact.match,
      report: dateEntry.report,
    };
    paintCurrentView();
  };

  const goPrevDate = () => {
    if (!state.contactContext) return;
    showDateAt(state.contactContext.dateIndex - 1);
  };

  const goNextDate = () => {
    if (!state.contactContext) return;
    showDateAt(state.contactContext.dateIndex + 1);
  };

  // ============================================================
  // AGENDA / MATCHES DRAWER
  // ============================================================
  const renderMatches = () => {
    if (state.savedContacts.length === 0) {
      dom.matchesBody.innerHTML =
        `<p class="matches-empty">Todavía no has guardado ningún contacto.</p>`;
      return;
    }

    // Contactos m\u00e1s recientes primero (por lastSeenAt).
    const sorted = [...state.savedContacts].sort((a, b) => (b.lastSeenAt || 0) - (a.lastSeenAt || 0));

    dom.matchesBody.innerHTML = sorted.map((contact) => {
      const m = contact.match;
      const total = contact.dates.length;
      const last = contact.dates[total - 1].report;
      const vibeLabel = { good: "Buena", weird: "Rara", ghosted: "Ghosted" }[last.vibe];
      const datesLabel = total === 1 ? "1 cita" : `${total} citas`;
      return `
        <button class="match-row" type="button" data-action="view-contact" data-contact-id="${esc(contact.id)}">
          <div class="row-avatar" style="border-color:${m.accent};background:${m.cardBg}">
            ${esc(m.initial)}
          </div>
          <div class="row-info">
            <p class="row-name">${esc(m.firstName)}
              <span class="row-vibe vibe-${last.vibe}">· ${vibeLabel}</span>
            </p>
            <p class="row-meta">${esc(m.keywords.join(" · "))}</p>
            <p class="row-meta">${esc(datesLabel)} · última: ${esc(formatDateTime(contact.lastSeenAt))}</p>
          </div>
          <span class="row-chevron" aria-hidden="true">↗</span>
        </button>
      `;
    }).join("");
  };

  const openMatches = () => {
    renderMatches();
    openOverlay(dom.matchesOverlay);
  };

  const viewSavedContact = (contactId) => {
    const contact = state.savedContacts.find((c) => c.id === contactId);
    if (!contact || contact.dates.length === 0) return;
    const latestIndex = contact.dates.length - 1;
    const dateEntry = contact.dates[latestIndex];
    state.contactContext = { contactId, dateIndex: latestIndex };
    state.currentEntry = {
      id: dateEntry.id,
      at: dateEntry.at,
      match: contact.match,
      report: dateEntry.report,
    };
    paintCurrentView();
    closeOverlay(dom.matchesOverlay);
    openOverlay(dom.matchOverlay);
  };

  const clearMatches = () => {
    if (state.savedContacts.length === 0) return;
    if (!window.confirm("¿Vaciar la agenda de contactos guardados?")) return;
    state.savedContacts = [];
    persistSaved();
    renderMatches();
  };

  // ============================================================
  // OVERLAY HELPERS
  // ============================================================
  const openOverlay = (el) => {
    el.hidden = false;
    el.setAttribute("aria-hidden", "false");
  };
  const closeOverlay = (el) => {
    el.hidden = true;
    el.setAttribute("aria-hidden", "true");
  };

  // ============================================================
  // ACTION DISPATCHER
  // ============================================================
  const actions = {
    "nope":           () => commitDecision("nope"),
    "like":           () => commitDecision("like"),
    "help":           () => openOverlay(dom.infoOverlay),
    "close-info":     () => closeOverlay(dom.infoOverlay),
    "reshuffle":      () => { state.deck = generateDeck(); renderDeck(); },
    "close-match":    closeMatch,
    "save-match":     saveMatch,
    "reroll-match":   rerollOrNewDate,
    "prev-date":      goPrevDate,
    "next-date":      goNextDate,
    "toggle-matches": openMatches,
    "close-matches":  () => closeOverlay(dom.matchesOverlay),
    "clear-matches":  clearMatches,
    "view-contact":   (ev) => {
      const btn = ev.target.closest("[data-contact-id]");
      if (btn) viewSavedContact(btn.dataset.contactId);
    },
  };

  document.addEventListener("click", (ev) => {
    const target = ev.target.closest("[data-action]");
    if (!target) return;
    const handler = actions[target.dataset.action];
    if (handler) handler(ev);
  });

  // Cerrar overlays con click en el fondo
  [dom.matchOverlay, dom.infoOverlay, dom.matchesOverlay].forEach((el) => {
    el.addEventListener("click", (ev) => {
      if (ev.target === el) closeOverlay(el);
    });
  });

  // ============================================================
  // TECLADO
  // ============================================================
  document.addEventListener("keydown", (ev) => {
    const overlayOpen =
      !dom.matchOverlay.hidden || !dom.infoOverlay.hidden || !dom.matchesOverlay.hidden;

    if (ev.key === "Escape") {
      if (!dom.matchOverlay.hidden) closeMatch();
      else if (!dom.infoOverlay.hidden) closeOverlay(dom.infoOverlay);
      else if (!dom.matchesOverlay.hidden) closeOverlay(dom.matchesOverlay);
      return;
    }

    if (overlayOpen) return;

    if (ev.key === "ArrowLeft")       { ev.preventDefault(); commitDecision("nope"); }
    else if (ev.key === "ArrowRight") { ev.preventDefault(); commitDecision("like"); }
  });

  // ============================================================
  // BOOT
  // ============================================================
  loadSaved();
  state.deck = generateDeck();
  renderDeck();
})();
