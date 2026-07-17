/* ============================================================
 * Shared UI components for the Cyberpunk RED toolkit
 *  - SearchableSelect: upgrades native <select> and
 *    <input list="..."> fields into a mobile-friendly
 *    combobox with a search box (native pickers/datalists
 *    behave poorly on small screens).
 *  - Split button: compact topbar action (primary action +
 *    dropdown with the rest). Markup lives in each page; this
 *    only wires up open/close behaviour.
 *
 * The native element stays in the DOM as the source of truth,
 * so existing app.js logic (reading .value, listening to
 * change/input, repopulating options) keeps working untouched.
 * ============================================================ */
(function () {
  "use strict";

  const norm = (s) =>
    (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const escHtml = (s) =>
    String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const escAttr = (s) => escHtml(s).replace(/'/g, "&#39;");

  // Track the currently open combobox so only one is open at a time.
  let openInstance = null;
  function closeOpen() {
    if (openInstance) openInstance.close();
  }

  // Intercept programmatic `el.value = x` so the visible trigger stays in sync
  // even when app.js mutates the value without firing an event.
  function hookValue(el, onSet) {
    const proto = el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    const desc = Object.getOwnPropertyDescriptor(proto, "value");
    if (!desc || !desc.set) return;
    Object.defineProperty(el, "value", {
      configurable: true,
      get() {
        return desc.get.call(this);
      },
      set(v) {
        desc.set.call(this, v);
        onSet();
      },
    });
  }

  class Combobox {
    constructor(native, mode) {
      this.native = native;
      this.mode = mode; // "select" | "input"
      native.__ssEnhanced = true;

      const root = document.createElement("div");
      root.className = "ss";
      this.root = root;

      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "ss-trigger " + (native.className || "");
      trigger.setAttribute("aria-haspopup", "listbox");
      trigger.setAttribute("aria-expanded", "false");
      this.trigger = trigger;

      const label = document.createElement("span");
      label.className = "ss-value";
      trigger.appendChild(label);
      this.label = label;

      const caret = document.createElement("span");
      caret.className = "ss-caret";
      caret.setAttribute("aria-hidden", "true");
      caret.textContent = "▾";
      trigger.appendChild(caret);

      const popup = document.createElement("div");
      popup.className = "ss-popup";
      popup.hidden = true;
      this.popup = popup;

      const searchWrap = document.createElement("div");
      searchWrap.className = "ss-search";
      const search = document.createElement("input");
      search.type = "text";
      search.className = "ss-search-input";
      search.placeholder = "Buscar…";
      search.setAttribute("autocomplete", "off");
      search.setAttribute("autocapitalize", "none");
      search.setAttribute("spellcheck", "false");
      searchWrap.appendChild(search);
      popup.appendChild(searchWrap);
      this.search = search;

      const list = document.createElement("div");
      list.className = "ss-list";
      list.setAttribute("role", "listbox");
      popup.appendChild(list);
      this.list = list;

      // Accessible name from an associated label / aria-label.
      const wrapLabel = native.closest("label");
      const fieldLabel = wrapLabel && wrapLabel.querySelector(".field-label, .ss-field-label");
      const aria = native.getAttribute("aria-label") || (fieldLabel && fieldLabel.textContent.trim());
      if (aria) {
        trigger.setAttribute("aria-label", aria);
        search.setAttribute("aria-label", "Buscar " + aria);
      }

      // Placeholder text.
      this.placeholder =
        native.getAttribute("data-placeholder") ||
        (mode === "input" ? native.getAttribute("placeholder") : "") ||
        "Seleccionar…";

      native.style.display = "none";
      native.setAttribute("tabindex", "-1");
      native.setAttribute("aria-hidden", "true");
      native.after(root);
      root.appendChild(trigger);
      root.appendChild(popup);

      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        this.toggle();
      });
      search.addEventListener("input", () => this.render(search.value));
      search.addEventListener("keydown", (e) => this.onKey(e));
      list.addEventListener("click", (e) => {
        const opt = e.target.closest(".ss-option");
        if (opt && opt.dataset.disabled !== "true") this.choose(opt.dataset.value);
      });

      this.observer = new MutationObserver(() => this.syncLabel());
      this.observer.observe(mode === "input" ? this.dataSource() || native : native, {
        childList: true,
        subtree: true,
      });
      native.addEventListener("change", () => this.syncLabel());
      hookValue(native, () => this.syncLabel());

      this.activeIndex = -1;
      this.syncLabel();
    }

    dataSource() {
      if (this.mode !== "input") return null;
      const id = this.native.getAttribute("list");
      return id ? document.getElementById(id) : null;
    }

    options() {
      if (this.mode === "select") {
        return Array.from(this.native.options).map((o) => ({
          value: o.value,
          text: o.textContent.trim(),
          meta: "",
          disabled: o.disabled,
        }));
      }
      const src = this.dataSource();
      if (!src) return [];
      return Array.from(src.options).map((o) => {
        const value = o.value;
        const text = (o.textContent || "").trim();
        return { value, text: value, meta: text && text !== value ? text : "", disabled: false };
      });
    }

    currentValue() {
      return this.native.value;
    }

    syncLabel() {
      let text = "";
      if (this.mode === "select") {
        const sel = this.native.options[this.native.selectedIndex];
        text = sel ? sel.textContent.trim() : "";
      } else {
        text = this.native.value.trim();
      }
      if (text) {
        this.label.textContent = text;
        this.label.classList.remove("ss-placeholder");
      } else {
        this.label.textContent = this.placeholder;
        this.label.classList.add("ss-placeholder");
      }
    }

    toggle() {
      this.popup.hidden ? this.open() : this.close();
    }

    open() {
      closeOpen();
      openInstance = this;
      this.popup.hidden = false;
      this.trigger.setAttribute("aria-expanded", "true");
      this.root.classList.add("is-open");
      this.search.value = "";
      this.render("");
      requestAnimationFrame(() => this.search.focus());
    }

    close() {
      this.popup.hidden = true;
      this.trigger.setAttribute("aria-expanded", "false");
      this.root.classList.remove("is-open");
      if (openInstance === this) openInstance = null;
    }

    render(query) {
      const q = norm(query);
      const current = this.currentValue();
      const opts = this.options().filter(
        (o) => !q || norm(o.text).includes(q) || norm(o.meta).includes(q)
      );
      this.rendered = opts;
      if (!opts.length) {
        this.list.innerHTML = '<div class="ss-empty">Sin resultados</div>';
        this.activeIndex = -1;
        return;
      }
      this.list.innerHTML = opts
        .map((o, i) => {
          const selected = o.value === current;
          return (
            `<div class="ss-option${selected ? " is-selected" : ""}${o.disabled ? " is-disabled" : ""}"` +
            ` role="option" aria-selected="${selected}" data-value="${escAttr(o.value)}"` +
            ` data-index="${i}" data-disabled="${o.disabled}">` +
            `<span class="ss-option-main">${escHtml(o.text)}</span>` +
            (o.meta ? `<span class="ss-option-meta">${escHtml(o.meta)}</span>` : "") +
            `</div>`
          );
        })
        .join("");
      this.activeIndex = opts.findIndex((o) => o.value === current && !o.disabled);
      if (this.activeIndex < 0) this.activeIndex = opts.findIndex((o) => !o.disabled);
      this.updateActive();
    }

    updateActive() {
      const items = Array.from(this.list.querySelectorAll(".ss-option"));
      items.forEach((el, i) => el.classList.toggle("is-active", i === this.activeIndex));
      const active = items[this.activeIndex];
      if (active) active.scrollIntoView({ block: "nearest" });
    }

    move(delta) {
      const items = this.rendered || [];
      if (!items.length) return;
      let i = this.activeIndex;
      for (let step = 0; step < items.length; step++) {
        i = (i + delta + items.length) % items.length;
        if (!items[i].disabled) break;
      }
      this.activeIndex = i;
      this.updateActive();
    }

    onKey(e) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        this.move(1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        this.move(-1);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const opt = (this.rendered || [])[this.activeIndex];
        if (opt && !opt.disabled) this.choose(opt.value);
      } else if (e.key === "Escape") {
        e.preventDefault();
        this.close();
        this.trigger.focus();
      }
    }

    choose(value) {
      if (this.native.value !== value) {
        this.native.value = value;
        this.native.dispatchEvent(new Event("input", { bubbles: true }));
        this.native.dispatchEvent(new Event("change", { bubbles: true }));
      }
      this.syncLabel();
      this.close();
      this.trigger.focus();
    }
  }

  function enhance(el) {
    if (el.__ssEnhanced || el.closest(".ss-popup")) return;
    if (el.tagName === "SELECT") {
      new Combobox(el, "select");
    } else if (el.tagName === "INPUT" && el.hasAttribute("list")) {
      new Combobox(el, "input");
    }
  }

  function scan(root) {
    (root || document).querySelectorAll("select, input[list]").forEach(enhance);
  }

  // Global dismissal for open comboboxes.
  document.addEventListener("click", (e) => {
    if (openInstance && !openInstance.root.contains(e.target)) openInstance.close();
  });

  /* ============ Split button ============ */
  function closeAllMenus(except) {
    document.querySelectorAll(".split-menu").forEach((m) => {
      if (m !== except) m.hidden = true;
    });
    document.querySelectorAll(".split-toggle").forEach((t) => {
      if (!except || t.closest(".split-button") !== except.closest(".split-button"))
        t.setAttribute("aria-expanded", "false");
    });
  }

  document.addEventListener("click", (e) => {
    const toggle = e.target.closest(".split-toggle");
    if (toggle) {
      e.preventDefault();
      const menu = toggle.closest(".split-button").querySelector(".split-menu");
      const willOpen = menu.hidden;
      closeAllMenus();
      menu.hidden = !willOpen;
      toggle.setAttribute("aria-expanded", String(willOpen));
      return;
    }
    const item = e.target.closest(".split-item");
    if (item) {
      // The action itself is handled by each page's delegated listener.
      closeAllMenus();
      return;
    }
    if (!e.target.closest(".split-menu")) closeAllMenus();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllMenus();
  });

  /* ============ Init ============ */
  function init() {
    scan(document);
    // Enhance selects/inputs added later (dynamic rows, modals, etc.).
    new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType !== 1) continue;
          if (node.matches && node.matches("select, input[list]")) enhance(node);
          if (node.querySelectorAll) scan(node);
        }
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
