// ============================================================
// RED Architecture — lógica de la interfaz
// ============================================================
(() => {
  "use strict";

  const d = (n) => Math.floor(Math.random() * n) + 1;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const esc = (v) =>
    String(v).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const empty = (msg) => `<div class="result-empty">${esc(msg)}</div>`;
  const chip = (t) => `<span class="roll-chip">${esc(t)}</span>`;
  const fmt = (n) => n.toLocaleString("es-ES") + "ed";

  function sample(arr, count, unique = true) {
    const out = [];
    const pool = arr.slice();
    for (let i = 0; i < count; i++) {
      if (unique && pool.length) {
        out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
      } else {
        out.push(pick(arr));
      }
    }
    return out;
  }

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

  const tierFor = (n) => RA_TIERS.find((t) => n >= t.min && n <= t.max) || RA_TIERS[RA_TIERS.length - 1];

  // ============================================================
  // ARQUITECTURA
  // ============================================================
  function genArquitectura() {
    const n = Math.max(3, Math.min(18, parseInt(document.getElementById("raPisos").value, 10) || 6));
    const intensidad = document.getElementById("raIntensidad").value;
    const tier = tierFor(n);

    // Cuánto hielo negro y cuántos nodos según intensidad.
    const iceFactor = intensidad === "alta" ? 0.9 : intensidad === "baja" ? 0.34 : 0.6;
    const numIce = Math.max(1, Math.round(n * iceFactor));
    const maxNodes = tier.nodes === Infinity ? Math.max(2, Math.round(n / 3)) : tier.nodes;
    const numNodes = intensidad === "baja" ? Math.max(1, Math.round(maxNodes / 2)) : maxNodes;
    const numDemons = Math.floor(n / RA_RULES.demonPerFloors);
    const numPasswords = Math.max(1, Math.round(n / 4));
    const numFiles = Math.max(1, Math.round(n / 6) + 1);

    // Pisos vacíos que iremos rellenando (índice 1..n; el 1 es la entrada).
    const floors = Array.from({ length: n }, () => []);
    const freeDeep = () => {
      // prioriza pisos profundos (mayor número) que aún no tengan nodo/archivo
      for (let i = n - 1; i >= 0; i--) if (!floors[i].some((x) => x.kind === "node" || x.kind === "file")) return i;
      return n - 1;
    };
    const anyFree = () => Math.floor(Math.random() * n);

    // Archivos (el botín), en los pisos más profundos.
    for (let i = 0; i < numFiles; i++) {
      floors[Math.max(0, n - 1 - i)].push({ kind: "file", text: pick(RA_FILES) });
    }
    // Nodos de control con una defensa y VD de Control.
    const usedDef = [];
    for (let i = 0; i < numNodes; i++) {
      const def = sample(RA_DEFENSAS.filter((x) => !usedDef.includes(x.name)), 1)[0] || pick(RA_DEFENSAS);
      usedDef.push(def.name);
      const vd = pick(RA_PASSWORD_VD).vd;
      floors[freeDeep()].push({ kind: "node", def, vd });
    }
    // Contraseñas (puertas que bloquean el descenso), repartidas.
    for (let i = 0; i < numPasswords; i++) {
      const pw = pick(RA_PASSWORD_VD);
      floors[Math.min(n - 1, Math.round(((i + 1) * n) / (numPasswords + 1)))].push({ kind: "pass", vd: pw.vd });
    }
    // Hielo negro al acecho (puede haber 2-3 por piso).
    const iceChosen = sample(RA_BLACK_ICE, numIce, false);
    iceChosen.forEach((ice) => {
      let tries = 0;
      let idx = anyFree();
      while (floors[idx].filter((x) => x.kind === "ice").length >= 3 && tries < 10) {
        idx = anyFree();
        tries++;
      }
      floors[idx].push({ kind: "ice", ice });
    });

    // Coste base de la arquitectura.
    const baseCost = n * tier.cost;

    const iconFor = { file: "🗂️", node: "🎛️", pass: "🔒", ice: "🧊" };
    const rows = floors
      .map((items, i) => {
        const piso = i + 1;
        const cells = items.length
          ? items
              .map((it) => {
                if (it.kind === "file") return `${iconFor.file} <strong>Archivo</strong> · ${esc(it.text)}`;
                if (it.kind === "node")
                  return `${iconFor.node} <strong>Nodo de control</strong> → ${esc(it.def.name)} <span class="muted-note">(Control VD${it.vd} · contrarrestar Electrónica/Seguridad VD${it.def.vd})</span>`;
                if (it.kind === "pass") return `${iconFor.pass} <strong>Contraseña</strong> <span class="muted-note">(Puerta trasera VD${it.vd})</span>`;
                if (it.kind === "ice")
                  return `${iconFor.ice} <strong>${esc(it.ice.name)}</strong> <span class="muted-note">${esc(it.ice.clase)} · PER ${it.ice.per} VEL ${it.ice.vel} ATQ ${it.ice.atq} DEF ${it.ice.def} REZ ${it.ice.rez}</span>`;
                return "";
              })
              .join("<br>")
          : `<span class="muted-note">Piso despejado</span>`;
        return `<div class="floor-row"><div class="floor-num">${piso}</div><div class="floor-body">${cells}</div></div>`;
      })
      .join("");

    // Demonios concretos según intensidad (para dirigir).
    const demonPool =
      intensidad === "alta"
        ? [RA_DEMONS[1], RA_DEMONS[2]]
        : intensidad === "baja"
          ? [RA_DEMONS[0]]
          : [RA_DEMONS[0], RA_DEMONS[0], RA_DEMONS[1]];
    const demonsChosen = Array.from({ length: numDemons }, () => pick(demonPool));
    const iceUsed = [...new Set(iceChosen.map((x) => x.name))].map((nm) => RA_BLACK_ICE.find((x) => x.name === nm));
    const defsUsed = usedDef.map((nm) => RA_DEFENSAS.find((x) => x.name === nm)).filter(Boolean);

    const demonSummary = numDemons
      ? `👹 ${numDemons} Demonio${numDemons > 1 ? "s" : ""} (${[...new Set(demonsChosen.map((x) => x.name))].join(", ")}) manejando los nodos de control.`
      : "Sin Demonio: las defensas se activan de forma automática (o las controla el DJ).";

    const djBlock = `
        <div class="card-section">Para dirigir · fichas listas</div>
        ${demonsChosen.length ? demonsChosen.map(demonBlock).join("") : `<p class="muted-note">Sin Demonio en esta arquitectura.</p>`}
        ${iceUsed.length ? `<p class="muted-note" style="margin-top:6px">Hielo negro presente en la arquitectura:</p>${iceTableHtml(iceUsed)}` : ""}
        ${defsUsed.length ? `<p class="muted-note" style="margin-top:10px">Defensas conectadas a los nodos de control:</p><div class="dl">${defsUsed.map(defRow).join("")}</div>` : ""}`;

    document.getElementById("arqResult").innerHTML = `
      <article class="card" style="--card-accent:var(--cyan)">
        <span class="card-tag">🗼 Arquitectura de ${n} pisos · ${intensidad}</span>
        <div class="dl" style="margin-bottom:14px">
          <div class="dl-row"><div class="dl-key">Tramo</div><div class="dl-val">${n} pisos · máx. ${tier.nodes === Infinity ? "sin límite de" : tier.nodes} nodos de control · ${tier.portable ? "portátil" : "no portátil"}</div></div>
          <div class="dl-row"><div class="dl-key">Coste base</div><div class="dl-val">${fmt(baseCost)} <span class="muted-note">(${fmt(tier.cost)}/piso; el hielo negro, defensas y demonios se pagan aparte)</span></div></div>
          <div class="dl-row"><div class="dl-key">Contenido</div><div class="dl-val">${numIce} hielo negro · ${numNodes} nodos de control · ${numPasswords} contraseñas · ${numFiles} archivos · ${numDemons} demonios</div></div>
        </div>
        <p class="muted-note" style="margin-bottom:6px">${demonSummary}</p>
        <div class="card-section">Pisos (de la entrada hacia el fondo)</div>
        <div class="floor-stack">${rows}</div>
        ${djBlock}
      </article>`;
  }

  // Fichas reutilizables.
  function demonBlock(dm) {
    return `
      <article class="card" style="--card-accent:var(--red);margin-top:10px">
        <span class="card-tag">👹 Demonio</span>
        <h3 class="card-title">${esc(dm.name)}</h3>
        <div class="stat-grid">
          <div class="stat-box"><span class="stat-num">${dm.rez}</span><span class="stat-lbl">REZ</span></div>
          <div class="stat-box"><span class="stat-num">${dm.interface}</span><span class="stat-lbl">Interface</span></div>
          <div class="stat-box"><span class="stat-num">${dm.cv}</span><span class="stat-lbl">Valor combate</span></div>
        </div>
        <p class="muted-note" style="margin-top:10px">${dm.acciones} acciones de RED · sin PER/VEL/DEF (se defiende con Interface + 1d10; no puedes hacer Deslizamiento contra él).</p>
      </article>`;
  }

  const defRow = (df) =>
    `<div class="dl-row"><div class="dl-key">${esc(df.name)}</div><div class="dl-val">Electrónica/Seguridad VD${df.vd}${df.pd ? " · " + df.pd + " PD" : ""}<br><span class="muted-note">${esc(df.nota)}</span></div></div>`;

  function iceTableHtml(list) {
    const rows = list
      .map(
        (ice) => `
        <tr>
          <th scope="row">${esc(ice.name)}<span class="ice-class">${esc(ice.clase)}</span></th>
          <td class="ice-n">${ice.per}</td>
          <td class="ice-n">${ice.vel}</td>
          <td class="ice-n">${ice.atq}</td>
          <td class="ice-n">${ice.def}</td>
          <td class="ice-n">${ice.rez}</td>
          <td class="ice-eff">${esc(ice.efecto)}<span class="ice-cost">${esc(ice.cost)}</span></td>
        </tr>`
      )
      .join("");
    return `
      <div class="ice-scroll">
        <table class="ice-table">
          <thead>
            <tr>
              <th scope="col">Programa</th>
              <th scope="col">PER</th>
              <th scope="col">VEL</th>
              <th scope="col">ATQ</th>
              <th scope="col">DEF</th>
              <th scope="col">REZ</th>
              <th scope="col">Efecto</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  // ============================================================
  // COMBATE
  // ============================================================
  function iceBlock(ice) {
    return `
      <article class="card" style="--card-accent:var(--cyan)">
        <span class="card-tag">🧊 ${esc(ice.clase)}</span>
        <h3 class="card-title">${esc(ice.name)}</h3>
        <div class="stat-grid stat-grid-5">
          <div class="stat-box"><span class="stat-num">${ice.per}</span><span class="stat-lbl">PER</span></div>
          <div class="stat-box"><span class="stat-num">${ice.vel}</span><span class="stat-lbl">VEL</span></div>
          <div class="stat-box"><span class="stat-num">${ice.atq}</span><span class="stat-lbl">ATQ</span></div>
          <div class="stat-box"><span class="stat-num">${ice.def}</span><span class="stat-lbl">DEF</span></div>
          <div class="stat-box"><span class="stat-num">${ice.rez}</span><span class="stat-lbl">REZ</span></div>
        </div>
        <p class="dl-val" style="margin-top:12px">${esc(ice.efecto)}</p>
        <p class="muted-note">Coste: ${esc(ice.cost)}</p>
      </article>`;
  }

  function genCombate() {
    const num = Math.max(1, Math.min(8, parseInt(document.getElementById("raNumIce").value, 10) || 3));
    const conDemonio = document.getElementById("raConDemonio").checked;
    const chosen = sample(RA_BLACK_ICE, num, false);

    let demonHtml = "";
    if (conDemonio) {
      const dm = pick(RA_DEMONS);
      const def = pick(RA_DEFENSAS);
      demonHtml = `
        <article class="card" style="--card-accent:var(--red)">
          <span class="card-tag">👹 Demonio</span>
          <h3 class="card-title">${esc(dm.name)}</h3>
          <div class="stat-grid">
            <div class="stat-box"><span class="stat-num">${dm.rez}</span><span class="stat-lbl">REZ</span></div>
            <div class="stat-box"><span class="stat-num">${dm.interface}</span><span class="stat-lbl">Interface</span></div>
            <div class="stat-box"><span class="stat-num">${dm.cv}</span><span class="stat-lbl">Valor combate</span></div>
          </div>
          <p class="muted-note" style="margin-top:10px">${dm.acciones} acciones de RED · sin PER/VEL/DEF (se defiende con Interface + 1d10; no puedes hacer Deslizamiento contra él). Maneja: <strong>${esc(def.name)}</strong> (Electrónica/Seguridad VD${def.vd}).</p>
        </article>`;
    }

    document.getElementById("combateResult").innerHTML = `
      <article class="card" style="--card-accent:var(--cyan)">
        <span class="card-tag">⚔️ Oposición del netrun</span>
        <p class="dl-val">Al encontrar un hielo negro al acecho, tira Interface + Velocidad + 1d10 contra su VEL + 1d10. Si te supera, aplica su efecto y se coloca en lo alto de la iniciativa.</p>
      </article>
      ${demonHtml}
      ${chosen.map(iceBlock).join("")}`;
  }

  // ============================================================
  // HIELO NEGRO
  // ============================================================
  function tablaIce() {
    document.getElementById("iceResult").innerHTML = `
      <article class="card" style="--card-accent:var(--cyan)">
        <span class="card-tag">🧊 Todo el hielo negro</span>
        <p class="muted-note">PER = dificultad para eludirlo con Deslizamiento · VEL = reacción · ATQ/DEF · REZ = «PD» del programa.</p>
        ${iceTableHtml(RA_BLACK_ICE)}
      </article>`;
  }

  // ============================================================
  // DEMONIOS & DEFENSAS
  // ============================================================
  function verDemonios() {
    const demons = RA_DEMONS.map(
      (dm) => `
      <article class="card" style="--card-accent:var(--red)">
        <span class="card-tag">👹 Demonio</span>
        <h3 class="card-title">${esc(dm.name)} <span class="muted-note" style="font-size:13px">${esc(dm.cost)}</span></h3>
        <div class="stat-grid">
          <div class="stat-box"><span class="stat-num">${dm.rez}</span><span class="stat-lbl">REZ</span></div>
          <div class="stat-box"><span class="stat-num">${dm.interface}</span><span class="stat-lbl">Interface</span></div>
          <div class="stat-box"><span class="stat-num">${dm.cv}</span><span class="stat-lbl">Valor combate</span></div>
        </div>
        <p class="muted-note" style="margin-top:10px">${dm.acciones} acciones de RED · ${esc(dm.nota)}</p>
      </article>`
    ).join("");
    const defRows = RA_DEFENSAS.map(defRow).join("");
    document.getElementById("demoResult").innerHTML = `
      ${demons}
      <article class="card" style="--card-accent:var(--primary)">
        <span class="card-tag">🛡 Defensas conectables a nodos de control</span>
        <div class="dl">${defRows}</div>
      </article>`;
  }

  // ---------- delegación ----------
  document.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-action]");
    if (!btn) return;
    switch (btn.dataset.action) {
      case "gen-arq":
        genArquitectura();
        break;
      case "gen-combate":
        genCombate();
        break;
    }
  });

  // ---------- init ----------
  document.getElementById("arqResult").innerHTML = empty("Elige nº de pisos e intensidad y genera una arquitectura.");
  document.getElementById("combateResult").innerHTML = empty("Genera la oposición de un netrun.");
  tablaIce(); // referencia completa, sin botón
  verDemonios(); // referencia completa, sin botón
})();
