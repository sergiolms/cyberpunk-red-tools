// ============================================================
// Trauma Team — lógica de la interfaz
// ============================================================
(() => {
  "use strict";

  const d = (n) => Math.floor(Math.random() * n) + 1;
  const d66 = () => d(6) + d(6);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const esc = (v) =>
    String(v).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const empty = (msg) => `<div class="result-empty">${esc(msg)}</div>`;
  const chip = (t) => `<span class="roll-chip">${esc(t)}</span>`;

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
  // HERIDAS CRÍTICAS
  // ============================================================
  // Tabla legible de heridas; `hitRoll` resalta la fila que ha salido.
  function heridaTableHtml(table, hitRoll) {
    const rows = table.entries
      .map(
        (h) => `
        <tr${h.r === hitRoll ? ' class="is-hit"' : ""}>
          <th scope="row">${h.r}</th>
          <td>${esc(h.name)}</td>
          <td>${esc(h.effect)}</td>
          <td>${esc(h.remedio)}</td>
          <td>${esc(h.trat)}</td>
        </tr>`
      )
      .join("");
    return `
      <div class="tt-scroll">
        <table class="tt-table">
          <thead>
            <tr>
              <th scope="col">2d6</th>
              <th scope="col">Herida</th>
              <th scope="col">Efecto</th>
              <th scope="col">Remedio rápido</th>
              <th scope="col">Tratamiento</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  function genHerida() {
    const key = document.getElementById("heridaLoc").value;
    const table = TT_HERIDAS[key];
    const box = document.getElementById("heridaResult");
    const roll = d66();
    const hit = table.entries.find((h) => h.r === roll);

    // Tabla completa con la tirada resaltada.
    if (document.getElementById("heridaTabla").checked) {
      box.innerHTML = `
        <article class="card" style="--card-accent:var(--red)">
          <span class="card-tag">🩸 Heridas críticas · ${esc(table.label)} · 2d6 = ${roll} → ${esc(hit.name)}</span>
          <p class="muted-note">Toda herida crítica inflige además +${TT_BONUS_DAMAGE} PD directos.</p>
          ${heridaTableHtml(table, roll)}
        </article>`;
      return;
    }

    box.innerHTML = `
      <article class="card" style="--card-accent:var(--red)">
        <span class="card-tag">🩸 Herida en ${esc(table.label.toLowerCase())} · 2d6 = ${roll}</span>
        <h3 class="card-title">${chip(hit.r)} ${esc(hit.name)}</h3>
        <p class="dl-val">${esc(hit.effect)}</p>
        <div class="payout"><span class="payout-label">Daño adicional</span><span class="payout-value">+${TT_BONUS_DAMAGE} PD</span></div>
        <div class="dl" style="margin-top:12px">
          <div class="dl-row"><div class="dl-key">Remedio rápido</div><div class="dl-val">${esc(hit.remedio)} <span class="muted-note">(1 min · quita el efecto el resto del día · puedes aplicártelo a ti mismo)</span></div></div>
          <div class="dl-row"><div class="dl-key">Tratamiento</div><div class="dl-val">${esc(hit.trat)} <span class="muted-note">(4 h · elimina el efecto de forma permanente · no puedes tratarte a ti mismo)</span></div></div>
        </div>
      </article>`;
  }

  // ============================================================
  // DROGAS
  // ============================================================
  function drogaCard(dr, highlight) {
    const prim = dr.primario.map((p) => `<li>${esc(p)}</li>`).join("");
    const sec = dr.secundario.map((p) => `<li>${esc(p)}</li>`).join("");
    return `
      <article class="card${highlight ? " is-hit" : ""}" style="--card-accent:var(--primary)">
        <span class="card-tag">💊 Droga de la calle${highlight ? " · al azar" : ""}</span>
        <h3 class="card-title">${esc(dr.name)}</h3>
        <div class="payout"><span class="payout-label">Coste por dosis</span><span class="payout-value" style="font-size:20px">${esc(dr.cost)}</span></div>
        <div class="card-section">Efecto primario (automático)</div>
        <ul class="list-tight">${prim}</ul>
        <div class="card-section">Efecto secundario · salvación ${esc(dr.vd)}</div>
        <ul class="list-tight">${sec}</ul>
      </article>`;
  }

  function renderDrogas(highlightName) {
    document.getElementById("drogaResult").innerHTML = TT_DROGAS.map((dr) =>
      drogaCard(dr, dr.name === highlightName)
    ).join("");
  }

  function rollDroga() {
    const dr = pick(TT_DROGAS);
    renderDrogas(dr.name);
    const el = document.querySelector("#drogaResult .is-hit");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // ============================================================
  // TERAPIA
  // ============================================================
  function verTerapia() {
    const cards = TT_TERAPIAS.map(
      (t) => `
      <article class="card" style="--card-accent:var(--cyan)">
        <span class="card-tag">🧠 Terapia</span>
        <h3 class="card-title">${esc(t.name)}</h3>
        <p class="dl-val">${esc(t.desc)}</p>
        <div class="dl" style="margin-top:12px">
          <div class="dl-row"><div class="dl-key">Coste</div><div class="dl-val">${esc(t.cost)}</div></div>
          <div class="dl-row"><div class="dl-key">Tirada</div><div class="dl-val">Tecnología médica ${esc(t.vd)}</div></div>
          <div class="dl-row"><div class="dl-key">Efecto</div><div class="dl-val">${esc(t.efecto)}</div></div>
        </div>
      </article>`
    ).join("");
    document.getElementById("terapiaResult").innerHTML = cards;
  }

  // ============================================================
  // SERVICIO Y CURACIÓN
  // ============================================================
  function llamarTT() {
    const roll = d(6);
    const miembros = TT_MIEMBROS.map(
      (m) => {
        const q = m.qty > 1 ? ` ×${m.qty}` : "";
        return `<div class="dl-row"><div class="dl-key">${esc(m.name)}${q}</div><div class="dl-val">CV ${m.cv} · CP ${m.cp} · PD ${m.pd} · MOV ${m.mov}<br><span class="muted-note">${esc(m.desc)}</span></div></div>`;
      }
    ).join("");
    document.getElementById("servicioResult").innerHTML = `
      <article class="card is-hit" style="--card-accent:var(--red)">
        <span class="card-tag">🚑 Llamada al Trauma Team</span>
        <div class="payout"><span class="payout-label">Asaltos hasta que llega el AV-4 (1d6)</span><span class="payout-value">${roll}</span></div>
        <p class="muted-note" style="margin-top:10px">Se incorpora al principio de la fila de iniciativa. Los miembros añaden 1d10 a su Valor de combate al atacar, usar equipo o defenderse. No pueden esquivar balas.</p>
        <div class="card-section">Equipo (5 miembros)</div>
        <div class="dl">${miembros}</div>
      </article>
      ${servicioReferenceHtml()}`;
  }

  function servicioReferenceHtml() {
    const s = TT_SERVICIO;
    const estados = TT_ESTADOS.map(
      (e) => `<div class="dl-row"><div class="dl-key">${esc(e.estado)}</div><div class="dl-val">${esc(e.umbral)} — ${esc(e.efecto)}<br><span class="muted-note">Estabilizar: ${esc(e.vd)}</span></div></div>`
    ).join("");
    const hospital = TT_HOSPITAL.map(
      (h) => `<div class="dl-row"><div class="dl-key">${esc(h.vd)}</div><div class="dl-val">${esc(h.cost)}</div></div>`
    ).join("");
    const install = TT_INSTALL.map(
      (i) => `<div class="dl-row"><div class="dl-key">${esc(i.lugar)}</div><div class="dl-val">Cirugía ${esc(i.vd)} · ${esc(i.cost)}</div></div>`
    ).join("");

    return `
      <article class="card" style="--card-accent:var(--red)">
        <span class="card-tag">🚑 Seguros: ¿Plata o Ejecutivo?</span>
        <div class="dl">
          <div class="dl-row"><div class="dl-key">Plata · ${esc(s.plata.price)}</div><div class="dl-val">${esc(s.plata.text)}</div></div>
          <div class="dl-row"><div class="dl-key">Ejecutivo · ${esc(s.ejecutivo.price)}</div><div class="dl-val">${esc(s.ejecutivo.text)}</div></div>
        </div>
        <p class="muted-note" style="margin-top:10px">${esc(s.general)}</p>
        <div class="card-section">Estados de herida y estabilización</div>
        <div class="dl">${estados}</div>
        <p class="muted-note" style="margin-top:8px">Estabilizar requiere una acción y tirar TEC + Primeros auxilios o Enfermería + 1d10 contra el VD. Estabilizado, curas tu TCO en PD por cada día completo de descanso hasta recuperar todos los PD.</p>
        <div class="card-section">Ingresos de hospital (se cobra el mayor VD requerido)</div>
        <div class="dl">${hospital}</div>
        <p class="muted-note" style="margin-top:8px">Camas: 100ed/noche (superior). Salvo curarte en el hospital, sueles salir el mismo día.</p>
        <div class="card-section">Instalar ciberware</div>
        <div class="dl">${install}</div>
      </article>`;
  }

  // ---------- delegación de acciones ----------
  document.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-action]");
    if (!btn) return;
    switch (btn.dataset.action) {
      case "roll-herida":
        genHerida();
        break;
      case "roll-droga":
        rollDroga();
        break;
      case "llamar-tt":
        llamarTT();
        break;
    }
  });

  // ---------- init ----------
  document.getElementById("heridaResult").innerHTML = empty("Elige localización y tira 2d6 (o marca «Ver tabla completa» para verlas todas con la tirada resaltada).");
  renderDrogas(); // todas las drogas, directo
  verTerapia(); // todas las terapias, directo
  document.getElementById("servicioResult").innerHTML = servicioReferenceHtml(); // referencia, directo
})();
