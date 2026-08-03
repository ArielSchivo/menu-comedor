// Renders a monthly cafeteria-menu calendar from menu.json.
// To update the menu each month, edit menu.json only — no code changes needed.

const WEEKDAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const MONTH_NAMES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

let data = null;
let months = []; // sorted list of "YYYY-MM" keys that have a menu
let currentIndex = 0;

const els = {
  schoolName: document.getElementById("school-name"),
  monthSelect: document.getElementById("month-select"),
  prev: document.getElementById("prev-month"),
  next: document.getElementById("next-month"),
  calendar: document.getElementById("calendar"),
  emptyState: document.getElementById("empty-state"),
  lastUpdated: document.getElementById("last-updated"),
};

init();

async function init() {
  try {
    const res = await fetch("menu.json", { cache: "no-cache" });
    data = await res.json();
  } catch (err) {
    els.calendar.innerHTML =
      '<p class="empty-state">No se pudo cargar el menú (menu.json).</p>';
    return;
  }

  if (data.colegio) {
    els.schoolName.textContent = data.colegio;
    document.title = "Menú del Comedor · " + data.colegio;
  }

  months = Object.keys(data.meses || {}).sort();
  if (months.length === 0) {
    els.calendar.hidden = true;
    els.emptyState.hidden = false;
    return;
  }

  // Default to the current month if available, otherwise the latest month.
  const now = new Date();
  const currentKey =
    now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
  currentIndex = months.indexOf(currentKey);
  if (currentIndex === -1) currentIndex = months.length - 1;

  buildMonthOptions();
  els.monthSelect.addEventListener("change", () => {
    currentIndex = Number(els.monthSelect.value);
    render();
  });
  els.prev.addEventListener("click", () => step(-1));
  els.next.addEventListener("click", () => step(1));

  if (data.actualizado) els.lastUpdated.textContent = data.actualizado;

  render();
}

function buildMonthOptions() {
  els.monthSelect.innerHTML = months
    .map((key, i) => `<option value="${i}">${formatMonth(key)}</option>`)
    .join("");
}

function step(delta) {
  const next = currentIndex + delta;
  if (next < 0 || next >= months.length) return;
  currentIndex = next;
  render();
}

function render() {
  const key = months[currentIndex];
  els.monthSelect.value = String(currentIndex);
  els.prev.disabled = currentIndex === 0;
  els.next.disabled = currentIndex === months.length - 1;

  const [year, month] = key.split("-").map(Number);
  const days = data.meses[key] || {};

  const rows = buildWeekRows(year, month);
  const todayKey = todayString();

  let html = WEEKDAYS.map((d) => `<div class="weekday">${d}</div>`).join("");

  for (const row of rows) {
    for (let col = 0; col < 5; col++) {
      const day = row[col];
      if (day === null) {
        html += '<div class="day-cell empty"></div>';
        continue;
      }
      const dishes = days[String(day)] || [];
      const dateKey =
        year + "-" + String(month).padStart(2, "0") + "-" +
        String(day).padStart(2, "0");
      const isToday = dateKey === todayKey;
      const dishItems = dishes
        .map((d) => `<li>${escapeHtml(d)}</li>`)
        .join("");

      html +=
        `<div class="day-cell${isToday ? " today" : ""}">` +
        `<div class="day-number" data-weekday="${WEEKDAYS[col]}">${day}</div>` +
        (dishItems
          ? `<ul class="dishes">${dishItems}</ul>`
          : '<ul class="dishes"></ul>') +
        `</div>`;
    }
  }

  els.calendar.innerHTML = html;
  els.calendar.hidden = false;
  els.emptyState.hidden = true;
}

// Groups the weekdays (Mon–Fri) of a month into calendar rows.
function buildWeekRows(year, month) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const rows = [];
  let row = new Array(5).fill(null);
  let rowHasContent = false;

  for (let d = 1; d <= daysInMonth; d++) {
    const wd = new Date(year, month - 1, d).getDay(); // 0=Sun … 6=Sat
    if (wd === 0 || wd === 6) continue; // skip weekends
    const col = wd - 1; // Mon=0 … Fri=4
    if (col === 0 && rowHasContent) {
      rows.push(row);
      row = new Array(5).fill(null);
      rowHasContent = false;
    }
    row[col] = d;
    rowHasContent = true;
  }
  if (rowHasContent) rows.push(row);
  return rows;
}

function formatMonth(key) {
  const [year, month] = key.split("-").map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

function todayString() {
  const n = new Date();
  return (
    n.getFullYear() + "-" +
    String(n.getMonth() + 1).padStart(2, "0") + "-" +
    String(n.getDate()).padStart(2, "0")
  );
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
