const sheets = window.PROJECT_SHEETS || [];

const elements = {
  activeAreas: document.querySelector("#activeAreas"),
  areaFilter: document.querySelector("#areaFilter"),
  areaGrid: document.querySelector("#areaGrid"),
  copyTemplate: document.querySelector("#copyTemplate"),
  areaBars: document.querySelector("#areaBars"),
  dashboardTotal: document.querySelector("#dashboardTotal"),
  emptyState: document.querySelector("#emptyState"),
  highPriority: document.querySelector("#highPriority"),
  priorityLegend: document.querySelector("#priorityLegend"),
  priorityPie: document.querySelector("#priorityPie"),
  priorityPieTotal: document.querySelector("#priorityPieTotal"),
  projectGrid: document.querySelector("#projectGrid"),
  resultCount: document.querySelector("#resultCount"),
  searchInput: document.querySelector("#searchInput"),
  sidebarProjects: document.querySelector("#sidebarProjects"),
  statusSummary: document.querySelector("#statusSummary"),
  statusFilter: document.querySelector("#statusFilter"),
  totalBooks: document.querySelector("#totalBooks"),
  trackingBooks: document.querySelector("#trackingBooks"),
  updatedAt: document.querySelector("#updatedAt")
};

function normalize(value) {
  return String(value || "").toLocaleLowerCase("es");
}

function uniqueValues(key) {
  return [...new Set(sheets.map((sheet) => sheet[key]).filter(Boolean))].sort();
}

function fillFilter(select, values) {
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function priorityClass(priority) {
  const normalized = normalize(priority);
  if (normalized === "alta") return "alta";
  if (normalized === "media") return "media";
  return "normal";
}

function isValidUrl(url, expectedText) {
  return Boolean(url && url.includes(expectedText) && !url.endsWith("/...") && !url.endsWith("/"));
}

function countBy(key) {
  return sheets.reduce((accumulator, sheet) => {
    const value = sheet[key] || "Sin definir";
    accumulator[value] = (accumulator[value] || 0) + 1;
    return accumulator;
  }, {});
}

function priorityColor(priority) {
  const normalized = normalize(priority);
  if (normalized === "alta") return "#a32020";
  if (normalized === "media") return "#c27a05";
  return "#0a3a78";
}

function getSheetPreviewUrl(url) {
  if (!isValidUrl(url, "docs.google.com/spreadsheets")) return "";

  const idMatch = url.match(/\/spreadsheets\/d\/([^/]+)/);
  const gidMatch = url.match(/[?#&]gid=([0-9]+)/);
  if (!idMatch) return "";

  const gid = gidMatch ? `?gid=${gidMatch[1]}` : "";
  return `https://docs.google.com/spreadsheets/d/${idMatch[1]}/preview${gid}`;
}

function renderMetrics() {
  const areas = uniqueValues("area");
  elements.totalBooks.textContent = sheets.length;
  elements.highPriority.textContent = sheets.filter((sheet) => normalize(sheet.priority) === "alta").length;
  elements.trackingBooks.textContent = sheets.filter((sheet) => normalize(sheet.status).includes("seguimiento")).length;
  elements.activeAreas.textContent = areas.length;
  elements.updatedAt.textContent = new Intl.DateTimeFormat("es-GT", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date());
}

function renderDashboard() {
  const total = sheets.length || 1;
  const priorityCounts = countBy("priority");
  const areaCounts = countBy("area");
  const statusCounts = countBy("status");
  let currentPercent = 0;

  const slices = Object.entries(priorityCounts).map(([priority, count]) => {
    const start = currentPercent;
    const end = currentPercent + (count / total) * 100;
    currentPercent = end;
    return `${priorityColor(priority)} ${start}% ${end}%`;
  });

  elements.dashboardTotal.textContent = `${sheets.length} proyecto${sheets.length === 1 ? "" : "s"}`;
  elements.priorityPie.style.background = slices.length
    ? `conic-gradient(${slices.join(", ")})`
    : "#edf1f6";
  elements.priorityPieTotal.textContent = sheets.length;

  elements.priorityLegend.innerHTML = "";
  Object.entries(priorityCounts)
    .sort(([a], [b]) => a.localeCompare(b, "es"))
    .forEach(([priority, count]) => {
      const item = document.createElement("div");
      item.className = "legend-item";
      item.innerHTML = `
        <span class="legend-dot" style="background:${priorityColor(priority)}"></span>
        <strong>${priority}</strong>
        <small>${count}</small>
      `;
      elements.priorityLegend.appendChild(item);
    });

  const maxAreaCount = Math.max(...Object.values(areaCounts), 1);
  elements.areaBars.innerHTML = "";
  Object.entries(areaCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .forEach(([area, count]) => {
      const width = Math.max((count / maxAreaCount) * 100, 8);
      const item = document.createElement("div");
      item.className = "bar-item";
      item.innerHTML = `
        <div class="bar-label">
          <span>${area}</span>
          <strong>${count}</strong>
        </div>
        <div class="bar-track"><span style="width:${width}%"></span></div>
      `;
      elements.areaBars.appendChild(item);
    });

  elements.statusSummary.innerHTML = "";
  Object.entries(statusCounts)
    .sort(([a], [b]) => a.localeCompare(b, "es"))
    .forEach(([status, count]) => {
      const item = document.createElement("div");
      item.className = "status-pill";
      item.innerHTML = `<span>${status}</span><strong>${count}</strong>`;
      elements.statusSummary.appendChild(item);
    });
}

function matchesFilters(sheet) {
  const query = normalize(elements.searchInput.value);
  const area = elements.areaFilter.value;
  const status = elements.statusFilter.value;
  const haystack = normalize(`${sheet.name} ${sheet.area} ${sheet.owner} ${sheet.status} ${sheet.description}`);

  return (
    (!query || haystack.includes(query)) &&
    (area === "todas" || sheet.area === area) &&
    (status === "todos" || sheet.status === status)
  );
}

function renderProjects() {
  const filtered = sheets.filter(matchesFilters);
  elements.projectGrid.innerHTML = "";
  elements.emptyState.hidden = filtered.length > 0;
  elements.resultCount.textContent = `${filtered.length} resultado${filtered.length === 1 ? "" : "s"}`;

  filtered.forEach((sheet) => {
    const card = document.createElement("article");
    const previewUrl = getSheetPreviewUrl(sheet.url);
    const preview = previewUrl
      ? `
        <div class="sheet-preview">
          <iframe title="Vista previa de ${sheet.name}" src="${previewUrl}" loading="lazy"></iframe>
        </div>
      `
      : `
        <div class="sheet-preview unavailable">
          <span>Vista previa pendiente</span>
        </div>
      `;
    const sheetLink = isValidUrl(sheet.url, "docs.google.com/spreadsheets")
      ? `<a class="open-link" href="${sheet.url}" target="_blank" rel="noreferrer">Abrir libro</a>`
      : `<button class="disabled-link" type="button" disabled>Libro pendiente</button>`;
    const driveLink = isValidUrl(sheet.driveUrl, "drive.google.com")
      ? `<a class="drive-link" href="${sheet.driveUrl}" target="_blank" rel="noreferrer">Carpeta Drive</a>`
      : `<button class="disabled-link" type="button" disabled>Drive pendiente</button>`;

    card.className = "project-card";
    card.innerHTML = `
      <div class="card-head">
        <div>
          <h3>${sheet.name}</h3>
          <p class="project-meta">${sheet.area} | ${sheet.owner}</p>
        </div>
        <span class="badge ${priorityClass(sheet.priority)}">${sheet.priority}</span>
      </div>
      <p>${sheet.description}</p>
      ${preview}
      <div class="card-footer">
        <span class="status">${sheet.status}</span>
        <div class="card-actions">
          ${driveLink}
          ${sheetLink}
        </div>
      </div>
    `;
    elements.projectGrid.appendChild(card);
  });
}

function renderSidebarProjects() {
  elements.sidebarProjects.innerHTML = "";

  sheets.forEach((sheet) => {
    const item = document.createElement(isValidUrl(sheet.url, "docs.google.com/spreadsheets") ? "a" : "button");
    item.innerHTML = `${sheet.name}<small>${sheet.area}</small>`;

    if (item.tagName === "A") {
      item.href = sheet.url;
      item.target = "_blank";
      item.rel = "noreferrer";
    } else {
      item.type = "button";
      item.disabled = true;
      item.title = "Agrega el enlace del libro en sheets.js";
    }

    elements.sidebarProjects.appendChild(item);
  });
}

function renderAreas() {
  const counts = sheets.reduce((accumulator, sheet) => {
    accumulator[sheet.area] = (accumulator[sheet.area] || 0) + 1;
    return accumulator;
  }, {});

  elements.areaGrid.innerHTML = "";
  Object.entries(counts)
    .sort(([areaA], [areaB]) => areaA.localeCompare(areaB, "es"))
    .forEach(([area, count]) => {
      const card = document.createElement("article");
      card.className = "area-card";
      card.innerHTML = `<strong>${count}</strong><span>${area}</span>`;
      elements.areaGrid.appendChild(card);
    });
}

async function copyTemplate() {
  const template = `{
  name: "Nombre del proyecto",
  area: "Area",
  owner: "Responsable",
  status: "Activo",
  priority: "Alta",
  description: "Descripcion breve del libro.",
  url: "https://docs.google.com/spreadsheets/d/...",
  driveUrl: "https://drive.google.com/drive/folders/..."
},`;

  try {
    await navigator.clipboard.writeText(template);
    elements.copyTemplate.textContent = "Plantilla copiada";
  } catch (error) {
    elements.copyTemplate.textContent = "No se pudo copiar";
  }

  setTimeout(() => {
    elements.copyTemplate.textContent = "Copiar plantilla";
  }, 1800);
}

function init() {
  fillFilter(elements.areaFilter, uniqueValues("area"));
  fillFilter(elements.statusFilter, uniqueValues("status"));
  renderDashboard();
  renderMetrics();
  renderSidebarProjects();
  renderProjects();
  renderAreas();

  elements.searchInput.addEventListener("input", renderProjects);
  elements.areaFilter.addEventListener("change", renderProjects);
  elements.statusFilter.addEventListener("change", renderProjects);
  elements.copyTemplate.addEventListener("click", copyTemplate);
}

init();
