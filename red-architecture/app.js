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

  // ============================================================
  // ARQUITECTURA (método oficial · manual pág. 209-211)
  // ============================================================
  const iceByName = (nm) => RA_BLACK_ICE.find((x) => x.name === nm);
  const parseCost = (s) => Number(String(s).replace(/[^\d]/g, "")) || 0;

  // Tira un piso: Vestíbulo (1d6) para los dos primeros pisos del tronco,
  // resto de pisos (3d6) para el resto. Vuelve a tirar programas/contraseñas
  // ya salidos si `reroll` está activo (regla del manual).
  function rollFloorEntry(diff, isLobby, seen, reroll) {
    let guard = 0;
    while (guard++ < 80) {
      let entry;
      if (isLobby) {
        const v = RA_VESTIBULO[d(6) - 1];
        entry = v.kind === "ice" ? { kind: "ice", ice: v.ice.slice() } : { kind: v.kind, vd: v.vd };
      } else {
        const cell = RA_PISOS[d(6) + d(6) + d(6)];
        if (cell === "pass" || cell === "file" || cell === "node") entry = { kind: cell, vd: diff.vd };
        else entry = { kind: "ice", ice: cell[diff.key].slice() };
      }
      const sig =
        entry.kind === "ice" ? "ice:" + entry.ice.slice().sort().join("|") :
        entry.kind === "pass" ? "pass:" + entry.vd : null;
      if (reroll && sig && seen.has(sig)) continue;
      if (sig) seen.add(sig);
      return entry;
    }
    return { kind: "file", vd: diff.vd };
  }

  // Paso 1 · forma: reparte el total de pisos entre el tronco y las ramas
  // (1d10 ≥ 7 → rama). El tronco siempre es el más largo (el «fondo»).
  function buildBranches(total, allow) {
    if (!allow || total < 6) return { mainLen: total, branches: [] };
    let count = 0;
    while (d(10) >= 7 && count < 2) count++;
    if (!count) return { mainLen: total, branches: [] };
    let per = Math.max(2, Math.round((total - 2) / (count + 2)));
    let branches = Array.from({ length: count }, () => per);
    let main = total - per * count;
    while (main < per + 2 && per > 1) {
      per--;
      branches = branches.map(() => per);
      main = total - per * count;
    }
    if (main < 3) return { mainLen: total, branches: [] };
    return { mainLen: main, branches };
  }

  const RA_ICON = { file: "🗂️", node: "🎛️", pass: "🔒", ice: "🧊" };
  function floorRowHtml(entry, label) {
    let body;
    if (entry.kind === "file") body = `${RA_ICON.file} <strong>Archivo</strong> <span class="muted-note">(el botín · VD${entry.vd})</span>`;
    else if (entry.kind === "pass") body = `${RA_ICON.pass} <strong>Contraseña</strong> <span class="muted-note">(Puerta trasera VD${entry.vd})</span>`;
    else if (entry.kind === "node") body = `${RA_ICON.node} <strong>Nodo de control</strong> → ${esc(entry.def.name)} <span class="muted-note">(Control VD${entry.vd} · contrarrestar Electrónica/Seguridad VD${entry.def.vd})</span>`;
    else body = entry.ice.map((nm) => { const ic = iceByName(nm); return `${RA_ICON.ice} <strong>${esc(nm)}</strong> <span class="muted-note">${esc(ic.clase)} · PER ${ic.per} VEL ${ic.vel} ATQ ${ic.atq} DEF ${ic.def} REZ ${ic.rez}</span>`; }).join("<br>");
    return `<div class="floor-row"><div class="floor-num">${esc(String(label))}</div><div class="floor-body">${body}</div></div>`;
  }

  function genArquitectura() {
    const diff = RA_DIFICULTAD[document.getElementById("raDificultad").value] || RA_DIFICULTAD.estandar;
    const auto = document.getElementById("raAutoPisos").checked;
    const total = auto
      ? d(6) + d(6) + d(6)
      : Math.max(3, Math.min(30, parseInt(document.getElementById("raPisos").value, 10) || 6));
    const allowBranches = document.getElementById("raRamas").checked;
    const reroll = document.getElementById("raRerollDup").checked;
    const wantDemon = document.getElementById("raConDemonioArq").checked;

    const seen = new Set();
    const { mainLen, branches } = buildBranches(total, allowBranches);

    const mainFloors = Array.from({ length: mainLen }, (_, i) => rollFloorEntry(diff, i < 2, seen, reroll));
    const branchFloors = branches.map((len) =>
      Array.from({ length: len }, () => rollFloorEntry(diff, false, seen, reroll))
    );
    const all = [...mainFloors, ...branchFloors.flat()];

    // A cada nodo de control se le asigna un dispositivo (cámaras, puerta, torreta…).
    all.filter((e) => e.kind === "node").forEach((e) => { e.def = pick(RA_DEFENSAS); });

    const counts = {
      ice: all.filter((e) => e.kind === "ice").reduce((a, e) => a + e.ice.length, 0),
      node: all.filter((e) => e.kind === "node").length,
      pass: all.filter((e) => e.kind === "pass").length,
      file: all.filter((e) => e.kind === "file").length,
    };

    const demon = counts.node > 0 && wantDemon ? (RA_DEMONS.find((x) => x.name === diff.demon) || RA_DEMONS[0]) : null;
    const iceUsed = [...new Set(all.filter((e) => e.kind === "ice").flatMap((e) => e.ice))].map(iceByName).filter(Boolean);
    const defsUsed = [...new Set(all.filter((e) => e.kind === "node").map((e) => e.def.name))]
      .map((nm) => RA_DEFENSAS.find((x) => x.name === nm))
      .filter(Boolean);

    // Coste orientativo (el manual dobla el coste de los programas del 1.er piso).
    let cost = 0;
    all.forEach((e) => {
      if (e.kind === "ice") e.ice.forEach((nm) => { const ic = iceByName(nm); if (ic) cost += parseCost(ic.cost); });
      else if (e.kind === "pass") { const p = RA_PASSWORD_VD.find((x) => x.vd === e.vd); if (p) cost += parseCost(p.cost); }
    });
    if (demon) cost += parseCost(demon.cost);

    const branchesHtml = branchFloors
      .map((arr, bi) => `
        <div class="card-section">Rama ${bi + 1} <span class="muted-note">(se bifurca tras el piso 2)</span></div>
        <div class="floor-stack">${arr.map((e, i) => floorRowHtml(e, `${bi + 1}·${i + 1}`)).join("")}</div>`)
      .join("");

    document.getElementById("arqResult").innerHTML = `
      <article class="card" style="--card-accent:var(--cyan)">
        <span class="card-tag">🗼 Arquitectura ${esc(diff.label)} · ${total} pisos${branches.length ? ` · ${branches.length} rama${branches.length > 1 ? "s" : ""}` : ""}</span>
        <div class="dl" style="margin-bottom:14px">
          <div class="dl-row"><div class="dl-key">Dificultad</div><div class="dl-val">${esc(diff.label)} · contraseña/archivo/nodo = <strong>VD${diff.vd}</strong></div></div>
          <div class="dl-row"><div class="dl-key">Netrunner objetivo</div><div class="dl-val">Interface <strong>${diff.ifBatalla}</strong> para plantar batalla${diff.ifMortal ? ` · <span class="muted-note">${esc(diff.ifMortal)} puede morir antes del fondo</span>` : ""}</div></div>
          <div class="dl-row"><div class="dl-key">Contenido</div><div class="dl-val">${counts.ice} hielo negro · ${counts.node} nodo${counts.node !== 1 ? "s" : ""} de control · ${counts.pass} contraseña${counts.pass !== 1 ? "s" : ""} · ${counts.file} archivo${counts.file !== 1 ? "s" : ""}${demon ? " · 1 Demonio" : ""}</div></div>
          <div class="dl-row"><div class="dl-key">Coste aprox.</div><div class="dl-val">${fmt(cost)} <span class="muted-note">(programas${demon ? " + demonio" : ""} + contraseñas; el manual dobla el coste de los programas del 1.er piso)</span></div></div>
        </div>
        <p class="muted-note" style="margin-bottom:6px">${demon ? `👹 Demonio ${esc(demon.name)} manejando los nodos de control.` : counts.node ? "Los nodos de control se activan de forma automática (o los maneja el DJ)." : "Sin nodos de control activos en esta arquitectura."}</p>
        <div class="card-section">Tronco principal (de la entrada hacia el fondo)</div>
        <div class="floor-stack">${mainFloors.map((e, i) => floorRowHtml(e, i + 1)).join("")}</div>
        ${branchesHtml}
        <div class="card-section">Para dirigir · fichas listas</div>
        ${demon ? demonBlock(demon) : `<p class="muted-note">Sin Demonio en esta arquitectura.</p>`}
        ${iceUsed.length ? `<p class="muted-note" style="margin-top:6px">Hielo negro presente en la arquitectura:</p>${iceTableHtml(iceUsed)}` : ""}
        ${defsUsed.length ? `<p class="muted-note" style="margin-top:10px">Dispositivos conectados a los nodos de control:</p><div class="dl">${defsUsed.map(defRow).join("")}</div>` : ""}
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
  const raAuto = document.getElementById("raAutoPisos");
  const raPisos = document.getElementById("raPisos");
  if (raAuto && raPisos) {
    const syncPisos = () => { raPisos.disabled = raAuto.checked; };
    raAuto.addEventListener("change", syncPisos);
    syncPisos();
  }
  document.getElementById("arqResult").innerHTML = empty("Elige la dificultad y genera una arquitectura según el manual.");
  document.getElementById("combateResult").innerHTML = empty("Genera la oposición de un netrun.");
  tablaIce(); // referencia completa, sin botón
  verDemonios(); // referencia completa, sin botón
})();
