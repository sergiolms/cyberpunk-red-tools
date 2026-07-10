const DB_NAME = "editor-noticias-db";
const DB_VERSION = 1;
const STORE_NAME = "sheets";
const LAST_ID_KEY = "editor-noticias:last-id";

const els = {
  sheet: document.querySelector("#sheet"),
  sheetStage: document.querySelector("#sheetStage"),
  sheetViewport: document.querySelector("#sheetViewport"),
  saveStatus: document.querySelector("#saveStatus"),
  documentTitle: document.querySelector("#documentTitle"),
  updatedAt: document.querySelector("#updatedAt"),
  libraryPanel: document.querySelector("#libraryPanel"),
  libraryList: document.querySelector("#libraryList"),
  imageInput: document.querySelector("#imageInput"),
  toast: document.querySelector("#toast"),
  imageControls: document.querySelector("#imageControls"),
  imageWidth: document.querySelector("#imageWidth"),
  imageHeight: document.querySelector("#imageHeight"),
  imageWidthLabel: document.querySelector("#imageWidthLabel"),
  imageHeightLabel: document.querySelector("#imageHeightLabel"),
};

const IMAGE_SIZE = { width: 100, height: 245 };

const TEMPLATE_OPTIONS = [
  {
    id: "night-city",
    label: "NC Press",
    build: () => ({
      title: "Night City Informa",
      settings: { columns: 2, accent: "#d71920", template: "night-city" },
      masthead: {
        leftCode: "NET 54 // ALERTA ROJA",
        clock: "23:47:12",
        edition: "EDICION LOCAL",
        outlet: "NIGHT CITY INFORMA",
        tagline: "Ruido, sangre y contratos: la verdad antes del apagón",
        ticker:
          "ULTIMA HORA // cortes de energia en Watson // Militech niega despliegue irregular // Trauma Team eleva tarifa nocturna",
        categories: ["CALLE", "CORPO", "CRIMEN", "TECH", "CULTURA"],
        activeCategory: 0,
      },
      blocks: [
        { type: "headline", text: "BANDA LOCAL FILTRA RUTA DE CONVOY CORPORATIVO" },
        { type: "byline", author: "Mara Vox", dateline: "Night City / Distrito Watson" },
        {
          type: "paragraph",
          text:
            "Una señal pirateada interrumpió las pantallas de Kabuki durante treinta y siete segundos con coordenadas, horarios y un logo corporativo parcialmente quemado. La información apunta a un convoy blindado que cruzaría la zona industrial antes del amanecer.",
        },
        { type: "image", src: "", caption: "Imagen pendiente de carga local" },
        {
          type: "pullquote",
          text: "Si la ruta es real, alguien dentro ya vendió la noche.",
          attribution: "Fixer anónimo",
        },
        {
          type: "paragraph",
          text:
            "Fuentes de seguridad privada describen el paquete como material experimental de respuesta urbana. En la calle, sin embargo, la lectura es más simple: quien controle la filtración controla qué equipo sale vivo.",
        },
        {
          type: "sidebar",
          heading: "EN EL BORDE",
          text:
            "Tres pandillas han movido personal hacia los accesos del puente. La policía no ha confirmado cierres, pero los drones municipales dejaron de emitir telemetría pública.",
        },
        {
          type: "brief",
          heading: "MERCADO NEGRO",
          text:
            "Los inhibidores de matrícula subieron un 18% en dos horas. Varios vendedores aceptan solo eurodólares físicos.",
        },
        { type: "ad", text: "Kiroshi Optics: mira primero, dispara después.", sponsor: "Publicidad autorizada por Kiroshi" },
      ],
    }),
  },
  {
    id: "nct-world",
    label: "NCT",
    build: () => ({
      title: "Night City Today",
      settings: { columns: 1, accent: "#d94b3f", template: "nct-world" },
      masthead: {
        leftCode: "SAT-LINK",
        clock: "12:00 AM",
        edition: "DRONE FEED",
        outlet: "NCT",
        tagline: "NIGHT CITY TODAY",
        ticker: "WORLD",
        categories: ["GOSSIP", "OPINION", "WEATHER", "TECH", "LIFESTYLE", "LOCAL", "BUSINESS"],
        activeCategory: 1,
      },
      blocks: [
        { type: "headline", text: "CORPO COUP ROCKS WATSON DISTRICT" },
        { type: "byline", author: "V. Nightingale", dateline: "Night City - 2077" },
        {
          type: "paragraph",
          text:
            "In a stunning overnight maneuver, rival megacorps traded fire across the megabuilding skyline as fixers scrambled to broker an uneasy ceasefire. Authorities urge citizens to stay indoors and keep their cyberware patched.",
        },
        {
          type: "pullquote",
          text: "Stay frosty. The night is long and the deals are longer.",
          attribution: "Anonymous Fixer",
        },
        {
          type: "brief",
          heading: "MARKET WATCH",
          text: "Eddies down 4% against the corporate scrip index. Black-market chrome surging.",
        },
      ],
    }),
  },
  {
    id: "corpo-dossier",
    label: "Corpo",
    build: () => ({
      title: "Corporate Dossier",
      settings: { columns: 3, accent: "#22d3ee", template: "corpo-dossier" },
      masthead: {
        leftCode: "ARASAKA INTEL",
        clock: "04:19",
        edition: "INTERNAL LEAK",
        outlet: "CORPO DOSSIER",
        tagline: "Executive risk, street response, asset movement",
        ticker: "SECURITY BRIEF // hostiles near Japantown // procurement frozen",
        categories: ["BOARD", "OPS", "LEGAL", "BLACK ICE", "ASSETS"],
        activeCategory: 1,
      },
      blocks: [
        { type: "headline", text: "BOARD VOTE TRIGGERS SECURITY LOCKDOWN" },
        { type: "byline", author: "Internal Source", dateline: "City Center" },
        {
          type: "paragraph",
          text:
            "A late session split the directors into two camps and pushed private security into the lobby before dawn. Official channels call it routine risk posture.",
        },
        { type: "section", text: "ASSET MOVEMENT" },
        {
          type: "sidebar",
          heading: "WATCHLIST",
          text: "Two runners, one courier and a trauma broker are flagged for follow-up.",
        },
        {
          type: "brief",
          heading: "LEGAL",
          text: "Counsel recommends deleting nonessential message history before noon.",
        },
        { type: "divider" },
        { type: "ad", text: "Discretion has a premium tier.", sponsor: "Kang Tao Executive Services" },
      ],
    }),
  },
  {
    id: "street-wire",
    label: "Wire",
    build: () => ({
      title: "Street Wire",
      settings: { columns: 2, accent: "#f5c542", template: "street-wire" },
      masthead: {
        leftCode: "PIRATE FEED",
        clock: "02:31",
        edition: "UNFILTERED",
        outlet: "STREET WIRE",
        tagline: "Rumor before the corpos sanitize it",
        ticker: "LIVE // boosters regrouping // nomad convoy spotted // ripperdoc raid denied",
        categories: ["RUMOR", "GIGS", "GEAR", "HEAT", "AFTERLIFE"],
        activeCategory: 0,
      },
      blocks: [
        { type: "headline", text: "AFTERLIFE FIXERS PRICE A DANGEROUS NIGHT" },
        { type: "byline", author: "Radio Ghost", dateline: "Watson Backchannel" },
        { type: "image", src: "", caption: "Street cam still pending" },
        {
          type: "paragraph",
          text:
            "Four contracts hit the boards within the same minute, all pointing at different doors of the same sealed warehouse. Nobody is calling it connected, which means everybody thinks it is.",
        },
        {
          type: "pullquote",
          text: "When every fixer whispers, listen to the silence between them.",
          attribution: "Afterlife regular",
        },
        { type: "brief", heading: "GEAR", text: "EMP tape, burner optics and false plates are moving fast." },
      ],
    }),
  },
  {
    id: "augmented-optic",
    label: "Optic",
    build: () => ({
      title: "The Augmented Optic",
      settings: { columns: 2, accent: "#8ef6b0", template: "augmented-optic" },
      masthead: {
        leftCode: "OPEN YOUR EYES",
        clock: "??:??",
        edition: "TABLOIDE CLANDESTINO",
        outlet: "THE AUGMENTED OPTIC",
        tagline: "El ojo que todo lo ve // ellos no quieren que leas esto",
        ticker:
          "EXCLUSIVA // implantes que espian mientras duermes // el consejo corporativo no existe // hemos visto lo que hay bajo la ciudad",
        categories: ["VERDAD", "COMPLOT", "SEÑALES", "DESPIERTA", "ARCHIVO"],
        activeCategory: 1,
      },
      blocks: [
        { type: "headline", text: "TUS OJOS NUEVOS TE OBSERVAN A TI" },
        { type: "byline", author: "El Vigía", dateline: "En algún lugar bajo Night City" },
        {
          type: "paragraph",
          text:
            "Nadie firma los contratos de fabricación. Nadie audita el firmware. Cada Kiroshi vendida esta temporada comparte una misma dirección de retorno cifrada, y esa dirección no aparece en ningún registro público. Conecta los puntos: te dieron ojos para que ellos también pudieran mirar.",
        },
        {
          type: "pullquote",
          text: "Si puedes leer esto, todavía no te han apagado.",
          attribution: "Transmisión interceptada",
        },
        {
          type: "sidebar",
          heading: "SEÑALES QUE NO IGNORAR",
          text:
            "Parpadeos en el HUD a las 3:33. Publicidad que responde a lo que piensas. Recuerdos que juras no haber vivido. No estás loco: estás sincronizado.",
        },
        {
          type: "brief",
          heading: "ARCHIVO FILTRADO",
          text: "Tres testigos que hablaron con nosotros ya no responden. Guardamos sus grabaciones.",
        },
        { type: "ad", text: "Desconecta antes de que te desconecten.", sponsor: "Resistencia Óptica // frecuencia libre" },
      ],
    }),
  },
];

const TEMPLATE_BY_ID = Object.fromEntries(TEMPLATE_OPTIONS.map((template) => [template.id, template]));
const defaultSheet = createSheetFromTemplate("night-city", { id: "local-main" });

let sheet = structuredClone(defaultSheet);
let selectedBlockId = null;
let pendingImageBlockId = null;
let draggedBlockId = null;
let resizeState = null;
let saveTimer = null;
let toastTimer = null;
let dbPromise = null;

document.addEventListener("DOMContentLoaded", init);

function createSheetFromTemplate(templateId, overrides = {}) {
  const definition = TEMPLATE_BY_ID[templateId] || TEMPLATE_BY_ID["night-city"];
  const next = structuredClone(definition.build());
  const now = new Date().toISOString();

  next.id = overrides.id || uid("sheet");
  next.createdAt = overrides.createdAt || now;
  next.updatedAt = overrides.updatedAt ?? null;
  next.settings = {
    columns: 2,
    accent: "#d71920",
    template: definition.id,
    ...next.settings,
  };
  next.masthead = {
    leftCode: "",
    clock: "",
    edition: "",
    outlet: definition.label,
    tagline: "",
    ticker: "",
    categories: ["NEWS"],
    activeCategory: 0,
    ...next.masthead,
  };
  next.masthead.activeCategory = clampCategoryIndex(next.masthead.activeCategory, next.masthead.categories);
  next.blocks = next.blocks.map((block) => ({ ...structuredClone(block), id: uid("b") }));
  next.title = next.title || next.masthead.outlet;

  return next;
}

function normalizeSheet(value) {
  const normalized = structuredClone(value);
  normalized.settings = {
    columns: 2,
    accent: "#d71920",
    template: "night-city",
    ...(normalized.settings || {}),
  };
  normalized.masthead = {
    leftCode: "",
    clock: "",
    edition: "",
    outlet: normalized.title || "Screamsheet",
    tagline: "",
    ticker: "",
    categories: ["NEWS"],
    activeCategory: 0,
    ...(normalized.masthead || {}),
  };
  normalized.masthead.categories = normalized.masthead.categories?.length
    ? normalized.masthead.categories
    : ["NEWS"];
  normalized.masthead.activeCategory = clampCategoryIndex(
    normalized.masthead.activeCategory,
    normalized.masthead.categories,
  );
  normalized.blocks = normalized.blocks?.length
    ? normalized.blocks.map((block) => ({
        ...block,
        id: block.id || uid("b"),
        type: block.type || "paragraph",
      }))
    : createSheetFromTemplate(normalized.settings.template).blocks;

  return normalized;
}

function clampCategoryIndex(index, categories) {
  return Math.max(0, Math.min(Number(index) || 0, Math.max((categories?.length || 1) - 1, 0)));
}

async function init() {
  bindEvents();
  const loadedFromDb = await loadInitialSheet();
  render();
  if (!loadedFromDb) await saveSheet("silent");
  await renderLibrary();
  updateStatus("DB local lista");
}

function bindEvents() {
  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("input", handleEditableInput);
  document.addEventListener("keydown", handleEditableKeydown);
  document.addEventListener("paste", handlePlainPaste);
  document.addEventListener("dragstart", handleDragStart);
  document.addEventListener("dragover", handleDragOver);
  document.addEventListener("drop", handleDrop);
  document.addEventListener("dragend", handleDragEnd);
  document.addEventListener("pointerdown", handleResizePointerDown);
  document.addEventListener("pointermove", handleResizePointerMove);
  document.addEventListener("pointerup", handleResizePointerUp);
  window.addEventListener("resize", updateSheetMetrics);
  els.imageInput.addEventListener("change", handleImageChange);
}

async function loadInitialSheet() {
  const lastId = localStorage.getItem(LAST_ID_KEY);
  const saved = lastId ? await getSheet(lastId) : await getSheet(defaultSheet.id);
  if (saved) {
    sheet = normalizeSheet(saved);
    localStorage.setItem(LAST_ID_KEY, sheet.id);
    return true;
  }

  sheet = structuredClone(defaultSheet);
  if (!sheet.id) sheet.id = uid("sheet");
  localStorage.setItem(LAST_ID_KEY, sheet.id);
  return false;
}

function render() {
  const templateId = getTemplateId();
  document.documentElement.style.setProperty("--sheet-accent", sheet.settings.accent);
  els.sheet.style.setProperty("--columns", sheet.settings.columns);
  els.sheet.className = `screamsheet template-${templateId}`;
  els.sheet.innerHTML = `
    ${renderStatusbar()}
    ${templateId === "nct-world" ? renderNctMasthead() : renderDefaultMasthead()}
    ${templateId === "nct-world" ? "" : `<nav class="ss-nav" aria-label="Secciones">${renderCategories()}</nav>`}
    ${templateId === "nct-world" ? "" : renderTicker()}
    <section class="ss-body" data-sheet-body>${sheet.blocks.map(renderBlock).join("")}</section>
  `;
  updateChrome();
  updateSelectedBlock();
  updateSheetMetrics();
}

function renderStatusbar() {
  return `
    <div class="ss-statusbar">
      <span contenteditable="true" data-singleline="true" data-edit-path="masthead.leftCode">${escapeHtml(sheet.masthead.leftCode)}</span>
      <span class="ss-clock" contenteditable="true" data-singleline="true" data-edit-path="masthead.clock">${escapeHtml(sheet.masthead.clock)}</span>
      <span contenteditable="true" data-singleline="true" data-edit-path="masthead.edition">${escapeHtml(sheet.masthead.edition)}</span>
      ${renderStatusIcons()}
    </div>
  `;
}

// Iconos tipo barra de estado de telefono; heredan el color del texto de la statusbar (currentColor).
function renderStatusIcons() {
  return `
    <span class="ss-status-icons" aria-hidden="true">
      <svg class="ss-status-icon" viewBox="0 0 18 12" role="img">
        <rect x="0" y="9" width="3" height="3" rx="0.5" />
        <rect x="5" y="6" width="3" height="6" rx="0.5" />
        <rect x="10" y="3" width="3" height="9" rx="0.5" />
        <rect x="15" y="0" width="3" height="12" rx="0.5" />
      </svg>
      <svg class="ss-status-icon" viewBox="0 0 20 15" role="img" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
        <path d="M2.5 5.2a11 11 0 0 1 15 0" />
        <path d="M5.4 8.4a7 7 0 0 1 9.2 0" />
        <circle cx="10" cy="12.4" r="1.1" fill="currentColor" stroke="none" />
      </svg>
      <svg class="ss-status-icon ss-status-battery" viewBox="0 0 27 14" role="img">
        <rect x="0.7" y="1.7" width="22" height="10.6" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.4" />
        <rect x="2.6" y="3.6" width="14" height="6.8" rx="1" />
        <rect x="24" y="4.6" width="2.4" height="4.8" rx="1.2" />
      </svg>
    </span>
  `;
}

function renderDefaultMasthead() {
  return `
    <header class="ss-masthead">
      <h1 class="ss-title" contenteditable="true" data-singleline="true" data-edit-path="masthead.outlet">${escapeHtml(sheet.masthead.outlet)}</h1>
      <p class="ss-tagline" contenteditable="true" data-singleline="true" data-edit-path="masthead.tagline">${escapeHtml(sheet.masthead.tagline)}</p>
    </header>
  `;
}

function renderNctMasthead() {
  return `
    <header class="ss-masthead ss-masthead-nct">
      <div class="ss-nct-logo">
        <span contenteditable="true" data-singleline="true" data-edit-path="masthead.outlet">${escapeHtml(sheet.masthead.outlet)}</span>
        <small contenteditable="true" data-singleline="true" data-edit-path="masthead.tagline">${escapeHtml(sheet.masthead.tagline)}</small>
      </div>
      <div class="ss-nct-navstack">
        <nav class="ss-nav" aria-label="Secciones">${renderCategories()}</nav>
        ${renderTicker()}
      </div>
    </header>
  `;
}

function renderTicker() {
  return `<div class="ss-ticker" contenteditable="true" data-singleline="true" data-edit-path="masthead.ticker">${escapeHtml(sheet.masthead.ticker)}</div>`;
}

function renderCategories() {
  return sheet.masthead.categories
    .map((category, index) => {
      const active = index === sheet.masthead.activeCategory ? " active" : "";
      return `<span class="ss-tab${active}" contenteditable="true" data-singleline="true" data-category-index="${index}">${escapeHtml(category)}</span>`;
    })
    .join("");
}

function renderBlock(block) {
  switch (block.type) {
    case "headline":
      return `<div ${blockAttrs(block)}>${blockGrip()}<h1 class="ss-headline-lead" contenteditable="true" data-singleline="true" data-block-field="text">${escapeHtml(block.text)}</h1></div>`;
    case "section":
      return `<div ${blockAttrs(block)}>${blockGrip()}<h2 class="ss-headline-section" contenteditable="true" data-singleline="true" data-block-field="text">${escapeHtml(block.text)}</h2></div>`;
    case "byline":
      return `<div ${blockAttrs(block)}>${blockGrip()}<p class="ss-byline">BY <span contenteditable="true" data-singleline="true" data-block-field="author">${escapeHtml(block.author)}</span> // <span contenteditable="true" data-singleline="true" data-block-field="dateline">${escapeHtml(block.dateline)}</span></p></div>`;
    case "paragraph":
      return `<div ${blockAttrs(block)}>${blockGrip()}<p class="ss-para" contenteditable="true" data-block-field="text">${escapeHtml(block.text)}</p></div>`;
    case "image": {
      const width = getImageWidth(block);
      const height = getImageHeight(block);
      const media = block.src
        ? `<img src="${escapeAttr(block.src)}" alt="" style="height:${height}px" />`
        : `<div class="image-frame" data-action="replace-image" style="height:${height}px;min-height:${height}px">Cargar imagen</div>`;
      return `<figure ${blockAttrs(block, "ss-figure")} style="width:${width}%;${imageMargins(block)}">
        ${blockGrip()}
        ${media}
        <figcaption class="ss-caption" contenteditable="true" data-singleline="true" data-block-field="caption">${escapeHtml(block.caption)}</figcaption>
        <span class="image-resize-handle" data-image-resize title="Arrastra para redimensionar"></span>
      </figure>`;
    }
    case "pullquote":
      return `<blockquote ${blockAttrs(block, "ss-pullquote")}>
        ${blockGrip()}
        <span contenteditable="true" data-block-field="text">${escapeHtml(block.text)}</span>
        <cite class="ss-attr" contenteditable="true" data-singleline="true" data-block-field="attribution">-- ${escapeHtml(block.attribution)}</cite>
      </blockquote>`;
    case "sidebar":
      return `<aside ${blockAttrs(block, "ss-sidebar")}>
        ${blockGrip()}
        <h3 class="ss-sb-head" contenteditable="true" data-singleline="true" data-block-field="heading">${escapeHtml(block.heading)}</h3>
        <p class="ss-sb-text" contenteditable="true" data-block-field="text">${escapeHtml(block.text)}</p>
      </aside>`;
    case "brief":
      return `<div ${blockAttrs(block, "ss-brief")}>
        ${blockGrip()}
        <h3 class="ss-brief-head" contenteditable="true" data-singleline="true" data-block-field="heading">${escapeHtml(block.heading)}</h3>
        <p class="ss-brief-text" contenteditable="true" data-block-field="text">${escapeHtml(block.text)}</p>
      </div>`;
    case "ad":
      return `<aside ${blockAttrs(block, "ss-ad")}>
        ${blockGrip()}
        <div class="ss-ad-body" contenteditable="true" data-singleline="true" data-block-field="text">${escapeHtml(block.text)}</div>
        <div class="ss-ad-sponsor" contenteditable="true" data-singleline="true" data-block-field="sponsor">${escapeHtml(block.sponsor)}</div>
      </aside>`;
    case "divider":
      return `<div ${blockAttrs(block)}>${blockGrip()}<hr class="ss-divider" /></div>`;
    default:
      return "";
  }
}

function blockGrip() {
  return `<button class="block-grip" type="button" draggable="true" data-drag-handle="true" title="Mover bloque">MOVE</button>`;
}

function blockAttrs(block, className = "") {
  const selected = block.id === selectedBlockId ? " is-selected" : "";
  const classes = `news-block${selected}${className ? ` ${className}` : ""}`;
  return `class="${classes}" data-label="${getBlockLabel(block.type)}" data-block-id="${block.id}" data-block-type="${block.type}" tabindex="0"`;
}

function handleDocumentClick(event) {
  const action = event.target.closest("[data-action]")?.dataset.action;
  const addType = event.target.closest("[data-add-block]")?.dataset.addBlock;
  const templateId = event.target.closest("[data-template]")?.dataset.template;
  const columns = event.target.closest("[data-columns]")?.dataset.columns;
  const accent = event.target.closest("[data-accent]")?.dataset.accent;
  const category = event.target.closest("[data-category-index]");
  const imageAlign = event.target.closest("[data-image-align]")?.dataset.imageAlign;
  const blockNode = event.target.closest("[data-block-id]");

  if (templateId) {
    applyTemplate(templateId);
    return;
  }

  if (addType) {
    insertBlock(addType);
    return;
  }

  if (columns) {
    sheet.settings.columns = Number(columns);
    els.sheet.style.setProperty("--columns", sheet.settings.columns);
    updateChrome();
    queueSave("Columnas actualizadas");
    return;
  }

  if (accent) {
    sheet.settings.accent = accent;
    document.documentElement.style.setProperty("--sheet-accent", accent);
    updateChrome();
    queueSave("Acento actualizado");
    return;
  }

  if (category) {
    selectCategory(Number(category.dataset.categoryIndex));
    queueSave("Seccion activa actualizada");
    return;
  }

  if (imageAlign) {
    setImageAlign(imageAlign);
    return;
  }

  if (action) {
    runAction(action, event);
    return;
  }

  if (blockNode) {
    selectBlock(blockNode.dataset.blockId);
  }
}

function runAction(action, event) {
  switch (action) {
    case "new-sheet":
      createNewSheet();
      break;
    case "open-library":
      openLibrary();
      break;
    case "close-library":
      closeLibrary();
      break;
    case "save-now":
      saveSheet("manual");
      break;
    case "print":
      window.print();
      break;
    case "export-png":
      exportPng();
      break;
    case "move-up":
      moveSelectedBlock(-1);
      break;
    case "move-down":
      moveSelectedBlock(1);
      break;
    case "duplicate-block":
      duplicateSelectedBlock();
      break;
    case "delete-block":
      deleteSelectedBlock();
      break;
    case "add-category":
      addCategory();
      break;
    case "delete-category":
      deleteCategory();
      break;
    case "move-category-left":
      moveCategory(-1);
      break;
    case "move-category-right":
      moveCategory(1);
      break;
    case "replace-image":
      pendingImageBlockId = event.target.closest("[data-block-id]")?.dataset.blockId || selectedBlockId;
      if (pendingImageBlockId) els.imageInput.click();
      break;
    case "reset-image-size":
      resetImageSize();
      break;
    default:
      break;
  }
}

function handleDragStart(event) {
  const handle = event.target.closest("[data-drag-handle]");
  if (!handle) return;

  const blockNode = handle.closest("[data-block-id]");
  if (!blockNode) return;

  draggedBlockId = blockNode.dataset.blockId;
  selectBlock(draggedBlockId);
  blockNode.classList.add("is-dragging");
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", draggedBlockId);
}

function handleDragOver(event) {
  if (!draggedBlockId) return;

  const target = event.target.closest("[data-block-id]");
  if (!target || target.dataset.blockId === draggedBlockId) return;

  event.preventDefault();
  const rect = target.getBoundingClientRect();
  const before = event.clientY < rect.top + rect.height / 2;
  clearDropMarkers();
  target.classList.toggle("drop-before", before);
  target.classList.toggle("drop-after", !before);
}

function handleDrop(event) {
  if (!draggedBlockId) return;

  const target = event.target.closest("[data-block-id]");
  if (!target || target.dataset.blockId === draggedBlockId) {
    handleDragEnd();
    return;
  }

  event.preventDefault();
  const before = target.classList.contains("drop-before");
  reorderBlock(draggedBlockId, target.dataset.blockId, before);
  handleDragEnd();
}

function handleDragEnd() {
  draggedBlockId = null;
  clearDropMarkers();
  els.sheet.querySelectorAll(".is-dragging").forEach((node) => node.classList.remove("is-dragging"));
}

function handleEditableInput(event) {
  if (event.target.matches("[data-image-width], [data-image-height]")) {
    handleImageResize(event.target);
    return;
  }

  const editable = event.target.closest("[contenteditable='true']");
  if (!editable) return;

  const path = editable.dataset.editPath;
  const field = editable.dataset.blockField;
  const categoryIndex = editable.dataset.categoryIndex;
  const text = cleanEditableText(editable);

  if (path) {
    setByPath(sheet, path, text);
    if (path === "masthead.outlet") sheet.title = text || "Screamsheet local";
  }

  if (field) {
    const block = findBlock(editable.closest("[data-block-id]")?.dataset.blockId);
    if (block) {
      block[field] = field === "attribution" ? text.replace(/^[-–—]\s*/, "") : text;
      if (block.type === "headline") sheet.title = block.text || sheet.title;
    }
  }

  if (categoryIndex !== undefined) {
    sheet.masthead.categories[Number(categoryIndex)] = text;
  }

  updateChrome();
  updateSheetMetrics();
  queueSave("Editando");
}

function handleEditableKeydown(event) {
  const editable = event.target.closest("[contenteditable='true']");
  if (!editable) return;

  if (event.key === "Enter" && editable.dataset.singleline === "true") {
    event.preventDefault();
    editable.blur();
  } else if (event.key === "Enter") {
    // Salto de linea en linea (<br>) en vez de dividir en bloques <div>, que rompen columna/pagina al imprimir.
    event.preventDefault();
    document.execCommand("insertLineBreak");
  }

  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
    event.preventDefault();
    saveSheet("manual");
  }
}

function handlePlainPaste(event) {
  const editable = event.target.closest("[contenteditable='true']");
  if (!editable) return;
  event.preventDefault();
  const text = event.clipboardData.getData("text/plain");
  document.execCommand("insertText", false, text);
}

function handleImageChange(event) {
  const file = event.target.files?.[0];
  if (!file || !pendingImageBlockId) return;

  const reader = new FileReader();
  reader.onload = () => {
    const block = findBlock(pendingImageBlockId);
    if (!block) return;
    block.src = String(reader.result || "");
    render();
    selectBlock(block.id);
    queueSave("Imagen actualizada");
    els.imageInput.value = "";
    pendingImageBlockId = null;
  };
  reader.readAsDataURL(file);
}

function getImageWidth(block) {
  return Number.isFinite(block.width) ? block.width : IMAGE_SIZE.width;
}

function getImageHeight(block) {
  return Number.isFinite(block.height) ? block.height : IMAGE_SIZE.height;
}

function getImageAlign(block) {
  return ["left", "center", "right"].includes(block.align) ? block.align : "center";
}

function imageMargins(block) {
  const align = getImageAlign(block);
  return `margin-left:${align === "left" ? "0" : "auto"};margin-right:${align === "right" ? "0" : "auto"}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function handleImageResize(input) {
  const block = findBlock(selectedBlockId);
  if (!block || block.type !== "image") return;

  const value = Number(input.value);
  if (input.hasAttribute("data-image-width")) block.width = value;
  else block.height = value;

  applyImageSize(block);
  updateImageControls();
  queueSave("Tamaño de imagen ajustado");
}

function resetImageSize() {
  const block = findBlock(selectedBlockId);
  if (!block || block.type !== "image") return;
  block.width = IMAGE_SIZE.width;
  block.height = IMAGE_SIZE.height;
  block.align = "center";
  applyImageSize(block);
  updateImageControls();
  queueSave("Tamaño de imagen restablecido");
}

function setImageAlign(align) {
  const block = findBlock(selectedBlockId);
  if (!block || block.type !== "image") return;
  block.align = align;
  applyImageSize(block);
  updateImageControls();
  queueSave("Alineación de imagen actualizada");
}

function handleResizePointerDown(event) {
  const handle = event.target.closest("[data-image-resize]");
  if (!handle) return;

  const figure = handle.closest("[data-block-id]");
  const block = findBlock(figure?.dataset.blockId);
  if (!block || block.type !== "image") return;

  event.preventDefault();
  event.stopPropagation();
  selectBlock(block.id);

  const scale = Number(getComputedStyle(document.documentElement).getPropertyValue("--sheet-scale")) || 1;
  const figLayoutWidth = figure.getBoundingClientRect().width / scale;
  resizeState = {
    block,
    scale,
    startX: event.clientX,
    startY: event.clientY,
    figLayoutWidth,
    containerWidth: figLayoutWidth / (getImageWidth(block) / 100),
    startHeight: getImageHeight(block),
  };
  handle.setPointerCapture(event.pointerId);
  document.body.classList.add("is-resizing-image");
}

function handleResizePointerMove(event) {
  if (!resizeState) return;

  const { block, scale, startX, startY, figLayoutWidth, containerWidth, startHeight } = resizeState;
  const width = clamp(Math.round((figLayoutWidth + (event.clientX - startX) / scale) / containerWidth * 100), 20, 100);
  const height = clamp(Math.round(startHeight + (event.clientY - startY) / scale), 120, 640);
  block.width = width;
  block.height = height;
  applyImageSize(block);
  updateImageControls();
}

function handleResizePointerUp() {
  if (!resizeState) return;
  resizeState = null;
  document.body.classList.remove("is-resizing-image");
  queueSave("Tamaño de imagen ajustado");
}

// Ajusta el DOM directamente para no re-renderizar y perder el foco del slider durante el arrastre.
function applyImageSize(block) {
  const figure = els.sheet.querySelector(`[data-block-id="${cssEscape(block.id)}"]`);
  if (!figure) return;

  const align = getImageAlign(block);
  figure.style.width = `${getImageWidth(block)}%`;
  figure.style.marginLeft = align === "left" ? "0" : "auto";
  figure.style.marginRight = align === "right" ? "0" : "auto";

  const media = figure.querySelector("img, .image-frame");
  if (!media) return;

  const height = `${getImageHeight(block)}px`;
  media.style.height = height;
  if (media.classList.contains("image-frame")) media.style.minHeight = height;
}

function updateImageControls() {
  const block = findBlock(selectedBlockId);
  const isImage = block?.type === "image";
  els.imageControls.hidden = !isImage;
  if (!isImage) return;

  const width = getImageWidth(block);
  const height = getImageHeight(block);
  const align = getImageAlign(block);
  els.imageWidth.value = width;
  els.imageHeight.value = height;
  els.imageWidthLabel.textContent = `${width}%`;
  els.imageHeightLabel.textContent = `${height}px`;
  els.imageControls.querySelectorAll("[data-image-align]").forEach((button) => {
    button.classList.toggle("active", button.dataset.imageAlign === align);
  });
}

function applyTemplate(templateId) {
  if (!TEMPLATE_BY_ID[templateId]) return;

  const next = createSheetFromTemplate(templateId, {
    id: sheet.id,
    createdAt: sheet.createdAt,
  });
  sheet = next;
  selectedBlockId = null;
  render();
  queueSave("Plantilla aplicada");
  showToast(`Plantilla ${TEMPLATE_BY_ID[templateId].label} aplicada`);
}

function insertBlock(type) {
  const block = createBlock(type);
  const selectedIndex = sheet.blocks.findIndex((item) => item.id === selectedBlockId);
  const insertAt = selectedIndex >= 0 ? selectedIndex + 1 : sheet.blocks.length;
  sheet.blocks.splice(insertAt, 0, block);
  selectedBlockId = block.id;
  render();
  focusFirstEditable(block.id);
  queueSave("Bloque añadido");
}

function createBlock(type) {
  const id = uid("b");
  const factory = {
    headline: { id, type, text: "NUEVO TITULAR EN DESARROLLO" },
    section: { id, type, text: "NUEVA SECCION" },
    byline: { id, type, author: "Redaccion", dateline: "Night City" },
    paragraph: {
      id,
      type,
      text: "Nuevo desarrollo pendiente de confirmacion por fuentes de la calle.",
    },
    image: { id, type, src: "", caption: "Pie de foto", width: IMAGE_SIZE.width, height: IMAGE_SIZE.height, align: "center" },
    pullquote: { id, type, text: "Una cita fuerte cambia el ritmo de la pagina.", attribution: "Fuente" },
    sidebar: { id, type, heading: "RECUADRO", text: "Dato auxiliar, alerta o contexto." },
    brief: { id, type, heading: "BREVE", text: "Nota corta para cerrar una columna." },
    ad: { id, type, text: "Espacio publicitario", sponsor: "Patrocinador local" },
    divider: { id, type },
  };
  return factory[type] || factory.paragraph;
}

function selectCategory(index) {
  const max = sheet.masthead.categories.length - 1;
  sheet.masthead.activeCategory = Math.max(0, Math.min(index, max));
  updateCategoryActive();
  updateChrome();
}

function updateCategoryActive() {
  els.sheet.querySelectorAll("[data-category-index]").forEach((node) => {
    node.classList.toggle("active", Number(node.dataset.categoryIndex) === sheet.masthead.activeCategory);
  });
}

function addCategory() {
  const nextNumber = sheet.masthead.categories.length + 1;
  sheet.masthead.categories.push(`SECCION ${nextNumber}`);
  sheet.masthead.activeCategory = sheet.masthead.categories.length - 1;
  render();
  queueSave("Categoria añadida");
}

function deleteCategory() {
  if (sheet.masthead.categories.length <= 1) return;

  sheet.masthead.categories.splice(sheet.masthead.activeCategory, 1);
  sheet.masthead.activeCategory = Math.min(sheet.masthead.activeCategory, sheet.masthead.categories.length - 1);
  render();
  queueSave("Categoria borrada");
}

function moveCategory(direction) {
  const index = sheet.masthead.activeCategory;
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= sheet.masthead.categories.length) return;

  const [category] = sheet.masthead.categories.splice(index, 1);
  sheet.masthead.categories.splice(nextIndex, 0, category);
  sheet.masthead.activeCategory = nextIndex;
  render();
  queueSave("Categoria movida");
}

function selectBlock(blockId) {
  selectedBlockId = blockId;
  updateSelectedBlock();
  updateChrome();
}

function updateSelectedBlock() {
  els.sheet.querySelectorAll("[data-block-id]").forEach((node) => {
    node.classList.toggle("is-selected", node.dataset.blockId === selectedBlockId);
  });
}

function moveSelectedBlock(direction) {
  const index = sheet.blocks.findIndex((block) => block.id === selectedBlockId);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= sheet.blocks.length) return;
  const [block] = sheet.blocks.splice(index, 1);
  sheet.blocks.splice(nextIndex, 0, block);
  render();
  queueSave("Bloque movido");
}

function reorderBlock(blockId, targetId, beforeTarget) {
  const fromIndex = sheet.blocks.findIndex((block) => block.id === blockId);
  let targetIndex = sheet.blocks.findIndex((block) => block.id === targetId);
  if (fromIndex < 0 || targetIndex < 0 || fromIndex === targetIndex) return;

  const [block] = sheet.blocks.splice(fromIndex, 1);
  if (fromIndex < targetIndex) targetIndex -= 1;
  sheet.blocks.splice(beforeTarget ? targetIndex : targetIndex + 1, 0, block);
  selectedBlockId = block.id;
  render();
  queueSave("Bloque movido");
}

function clearDropMarkers() {
  els.sheet.querySelectorAll(".drop-before, .drop-after").forEach((node) => {
    node.classList.remove("drop-before", "drop-after");
  });
}

function duplicateSelectedBlock() {
  const index = sheet.blocks.findIndex((block) => block.id === selectedBlockId);
  if (index < 0) return;
  const copy = structuredClone(sheet.blocks[index]);
  copy.id = uid("b");
  sheet.blocks.splice(index + 1, 0, copy);
  selectedBlockId = copy.id;
  render();
  queueSave("Bloque duplicado");
}

function deleteSelectedBlock() {
  const index = sheet.blocks.findIndex((block) => block.id === selectedBlockId);
  if (index < 0) return;
  sheet.blocks.splice(index, 1);
  selectedBlockId = sheet.blocks[Math.min(index, sheet.blocks.length - 1)]?.id || null;
  render();
  queueSave("Bloque eliminado");
}

async function createNewSheet() {
  await saveSheet("silent");
  const next = createSheetFromTemplate(getTemplateId());
  next.id = uid("sheet");
  next.createdAt = new Date().toISOString();
  next.updatedAt = null;
  next.title = "Nueva screamsheet";
  sheet = next;
  selectedBlockId = null;
  localStorage.setItem(LAST_ID_KEY, sheet.id);
  render();
  await saveSheet("manual");
  await renderLibrary();
}

async function openLibrary() {
  await renderLibrary();
  els.libraryPanel.classList.add("open");
  els.libraryPanel.setAttribute("aria-hidden", "false");
}

function closeLibrary() {
  els.libraryPanel.classList.remove("open");
  els.libraryPanel.setAttribute("aria-hidden", "true");
}

async function renderLibrary() {
  const sheets = await getAllSheets();
  if (!sheets.length) {
    els.libraryList.innerHTML = `<p class="empty-library">DB vacia</p>`;
    return;
  }

  els.libraryList.innerHTML = sheets
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
    .map((item) => {
      const current = item.id === sheet.id ? "Actual" : "Abrir";
      return `
        <article class="library-item" data-library-id="${item.id}">
          <strong>${escapeHtml(item.title || item.masthead?.outlet || "Screamsheet")}</strong>
          <small>${formatDate(item.updatedAt || item.createdAt)}</small>
          <div class="library-actions">
            <button type="button" data-library-action="open">${current}</button>
            <button type="button" data-library-action="copy">Copiar</button>
            <button class="danger" type="button" data-library-action="delete">Borrar</button>
          </div>
        </article>
      `;
    })
    .join("");

  els.libraryList.querySelectorAll("[data-library-action]").forEach((button) => {
    button.addEventListener("click", handleLibraryAction);
  });
}

async function handleLibraryAction(event) {
  const item = event.target.closest("[data-library-id]");
  const id = item?.dataset.libraryId;
  const action = event.target.dataset.libraryAction;
  if (!id) return;

  if (action === "open") {
    const saved = await getSheet(id);
    if (!saved) return;
    await saveSheet("silent");
    sheet = normalizeSheet(saved);
    selectedBlockId = null;
    localStorage.setItem(LAST_ID_KEY, sheet.id);
    render();
    closeLibrary();
    showToast("Hoja cargada desde DB local");
  }

  if (action === "copy") {
    const saved = await getSheet(id);
    if (!saved) return;
    const copy = normalizeSheet(saved);
    copy.id = uid("sheet");
    copy.title = `${copy.title || copy.masthead.outlet} copia`;
    copy.createdAt = new Date().toISOString();
    copy.updatedAt = null;
    copy.blocks = copy.blocks.map((block) => ({ ...structuredClone(block), id: uid("b") }));
    await putSheet(copy);
    await renderLibrary();
    showToast("Copia guardada en DB local");
  }

  if (action === "delete") {
    await deleteSheet(id);
    if (sheet.id === id) {
      sheet = createSheetFromTemplate("night-city");
      sheet.id = uid("sheet");
      localStorage.setItem(LAST_ID_KEY, sheet.id);
      render();
      await saveSheet("silent");
    }
    await renderLibrary();
    showToast("Hoja borrada de DB local");
  }
}

function queueSave(statusText) {
  updateStatus(statusText || "Cambios pendientes");
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => saveSheet("auto"), 700);
}

async function saveSheet(mode) {
  window.clearTimeout(saveTimer);
  sheet.updatedAt = new Date().toISOString();
  sheet.title = getBestTitle();
  localStorage.setItem(LAST_ID_KEY, sheet.id);
  await putSheet(sheet);
  updateChrome();
  updateStatus(mode === "manual" ? "Guardado en DB local" : "Autoguardado local");
  if (mode === "manual") showToast("Guardado en IndexedDB");
  renderLibrary();
}

async function exportPng() {
  try {
    updateStatus("Generando PNG");
    showToast("Generando PNG...");

    const source = els.sheet;
    const width = source.offsetWidth;
    const height = Math.max(source.scrollHeight, source.offsetHeight);
    const scale = 2; // exporta a 2x para nitidez

    const clone = source.cloneNode(true);
    clone.style.position = "static";
    clone.style.transform = "none";
    clone.style.width = `${width}px`;
    clone.style.minHeight = `${height}px`;
    clone.style.margin = "0";
    clone.style.boxShadow = "none";
    clone.querySelectorAll(".block-grip, .image-resize-handle").forEach((node) => node.remove());
    clone.querySelectorAll(".is-selected").forEach((node) => node.classList.remove("is-selected"));
    clone.querySelectorAll("[contenteditable]").forEach((node) => node.removeAttribute("contenteditable"));

    const css = await buildExportCss();
    const markup = new XMLSerializer().serializeToString(clone);
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
      `<foreignObject width="100%" height="100%">` +
      `<div xmlns="http://www.w3.org/1999/xhtml"><style>${css}</style>${markup}</div>` +
      `</foreignObject></svg>`;

    const image = await loadImage("data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg));
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.drawImage(image, 0, 0);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    downloadBlob(blob, `${slugify(getBestTitle())}.png`);
    updateStatus("PNG exportado");
    showToast("PNG exportado");
  } catch (error) {
    console.error("exportPng", error);
    updateStatus("Error al exportar PNG");
    showToast("No se pudo generar el PNG");
  }
}

// La SVG se renderiza aislada: no puede acceder a las fuentes del documento ni a recursos remotos,
// asi que incrustamos la hoja de estilos y las fuentes como data URIs. Se cachea por sesion.
let exportCssCache = null;
async function buildExportCss() {
  if (exportCssCache) return exportCssCache;
  const appCss = await fetch("./styles.css").then((r) => r.text()).catch(() => "");
  const fontLink = document.querySelector('link[href*="fonts.googleapis.com/css"]');
  if (!fontLink) {
    exportCssCache = appCss;
    return appCss;
  }

  let fontCss = await fetch(fontLink.href).then((r) => r.text()).catch(() => "");
  const urls = [...new Set([...fontCss.matchAll(/url\((https:\/\/[^)]+\.woff2)\)/g)].map((m) => m[1]))];
  const embedded = await Promise.all(
    urls.map(async (url) => {
      try {
        const buffer = await fetch(url).then((r) => r.arrayBuffer());
        return [url, `data:font/woff2;base64,${base64FromBuffer(buffer)}`];
      } catch {
        return [url, null];
      }
    }),
  );
  const map = Object.fromEntries(embedded);
  fontCss = fontCss.replace(/url\((https:\/\/[^)]+\.woff2)\)/g, (match, url) => (map[url] ? `url(${map[url]})` : match));
  exportCssCache = `${fontCss}\n${appCss}`;
  return exportCssCache;
}

function base64FromBuffer(buffer) {
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("No se pudo cargar la imagen SVG"));
    image.src = src;
  });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function slugify(value) {
  const normalized = String(value || "screamsheet").toLowerCase().normalize("NFKD");
  return (
    normalized
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "screamsheet"
  );
}

function updateChrome() {
  els.documentTitle.textContent = getBestTitle();
  els.updatedAt.textContent = sheet.updatedAt ? formatDate(sheet.updatedAt) : "Sin guardar";

  document.querySelectorAll("[data-action='move-up'], [data-action='move-down'], [data-action='duplicate-block'], [data-action='delete-block']").forEach((button) => {
    button.disabled = !selectedBlockId;
  });

  updateImageControls();

  document.querySelectorAll("[data-template]").forEach((button) => {
    button.classList.toggle("active", button.dataset.template === getTemplateId());
  });

  document.querySelector("[data-action='move-category-left']").disabled = sheet.masthead.activeCategory <= 0;
  document.querySelector("[data-action='move-category-right']").disabled =
    sheet.masthead.activeCategory >= sheet.masthead.categories.length - 1;
  document.querySelector("[data-action='delete-category']").disabled = sheet.masthead.categories.length <= 1;

  document.querySelectorAll("[data-columns]").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.columns) === sheet.settings.columns);
  });

  document.querySelectorAll("[data-accent]").forEach((button) => {
    button.classList.toggle("active", button.dataset.accent.toLowerCase() === sheet.settings.accent.toLowerCase());
  });
}

function updateStatus(text) {
  els.saveStatus.textContent = text;
}

function updateSheetMetrics() {
  const available = Math.max(els.sheetViewport.clientWidth - 36, 320);
  const scale = Math.min(1, available / 816);
  document.documentElement.style.setProperty("--sheet-scale", String(scale));
  requestAnimationFrame(() => {
    const height = Math.max(1056, els.sheet.scrollHeight);
    document.documentElement.style.setProperty("--sheet-height", `${height}px`);
  });
}

function focusFirstEditable(blockId) {
  requestAnimationFrame(() => {
    const node = els.sheet.querySelector(`[data-block-id="${cssEscape(blockId)}"] [contenteditable="true"]`);
    node?.focus();
  });
}

function getBestTitle() {
  const headline = sheet.blocks.find((block) => block.type === "headline")?.text;
  return headline || sheet.masthead.outlet || "Screamsheet local";
}

function getTemplateId() {
  return TEMPLATE_BY_ID[sheet.settings?.template] ? sheet.settings.template : "night-city";
}

function getBlockLabel(type) {
  return (
    {
      headline: "Titular",
      section: "Seccion",
      byline: "Firma",
      paragraph: "Parrafo",
      image: "Imagen",
      pullquote: "Cita",
      sidebar: "Recuadro",
      brief: "Breve",
      ad: "Anuncio",
      divider: "Linea",
    }[type] || type
  );
}

function findBlock(blockId) {
  return sheet.blocks.find((block) => block.id === blockId);
}

function setByPath(target, path, value) {
  const parts = path.split(".");
  let current = target;
  parts.slice(0, -1).forEach((part) => {
    current = current[part];
  });
  current[parts.at(-1)] = value;
}

function cleanEditableText(node) {
  return node.innerText.replace(/\u00a0/g, " ").trim();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

function cssEscape(value) {
  if (window.CSS?.escape) return CSS.escape(value);
  return String(value).replace(/["\\]/g, "\\$&");
}

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function formatDate(value) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("show");
  toastTimer = window.setTimeout(() => els.toast.classList.remove("show"), 2200);
}

function openDb() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt");
        store.createIndex("title", "title");
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

async function putSheet(data) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(structuredClone(data));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getSheet(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

async function getAllSheets() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function deleteSheet(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
