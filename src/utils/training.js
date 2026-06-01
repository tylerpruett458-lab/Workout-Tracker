export function pct(done, total) {
  return total ? Math.round((done / total) * 100) : 0;
}

export function sessionId(weekIndex, dayIndex, cycle = 1) {
  return `c${cycle}-w${weekIndex + 1}-d${dayIndex + 1}`;
}

export function blockLabel(block) {
  return `Block ${block}`;
}

export function exerciseId(occurrenceId, sessionName, exercise) {
  return `${occurrenceId}::${sessionName}::${exercise}`;
}

export function defaultState() {
  return {
    needsBackup: false,
    backupExportedAt: null,
    completedDays: {},
    exerciseLog: {},
    cardioLog: {},
    cardioGoals: { weeklyMinutes: 150, weeklySessions: 4 },
    cardioImportHistory: [],
    bodyweight: {},
    notes: {},
    customDates: {},
    readiness: {},
    sessionOverrides: {},
    startDate: "",
    activeBlock: 1,
    blockCount: 1,
    dataScope: "Current block",
    customPlan: null,
    savedPlans: [],
    selectedSavedPlanId: "",
    activePlanKey: "default",
    viewMode: "simple",
    activeWeek: 1,
    activeDay: 1
  };
}


export function addDays(dateString, daysToAdd) {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) return "";
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + daysToAdd);
  return dateKey(date);
}

export function displayDate(dateString) {
  if (!dateString) return "Set date";
  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) return dateString;
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  });
}

export function parsePrescription(setsReps) {
  const setsMatch = String(setsReps).match(/(\d+)\s*(?:–|-|x)/i);
  const sets = setsMatch ? Number(setsMatch[1]) : 3;
  const repMatches = Array.from(String(setsReps).matchAll(/(\d+)\s*(?:–|-)\s*(\d+)/g));
  const lastRange = repMatches[repMatches.length - 1];
  const topReps = lastRange ? Number(lastRange[2]) : 10;
  return { sets, topReps };
}

export function parseNumber(value) {
  const number = parseFloat(String(value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(number) ? number : 0;
}

export function parseReps(value) {
  return String(value ?? "")
    .split(/[,/ ]+/)
    .map((r) => parseFloat(r))
    .filter((n) => Number.isFinite(n));
}

export function occurrenceDate(state, weekIndex, dayIndex, cycle = state.activeBlock ?? 1, blockLengthDays = 84) {
  const id = sessionId(weekIndex, dayIndex, cycle);
  if (state.customDates?.[id]) return state.customDates[id];
  if (!state.startDate) return "";
  return addDays(state.startDate, (cycle - 1) * blockLengthDays + weekIndex * 7 + dayIndex);
}

export function sessionForDay(state, weekIndex, dayIndex, cycle = state.activeBlock ?? 1, calendar = []) {
  const id = sessionId(weekIndex, dayIndex, cycle);
  return state.sessionOverrides?.[id] ?? calendar[weekIndex]?.[dayIndex] ?? "Rest";
}

export const READINESS_VALUES = ["-3", "-2", "-1", "0", "1", "2", "3"];

export function nextReadinessValue(currentValue) {
  const current = String(currentValue ?? "0");
  const index = READINESS_VALUES.indexOf(current);
  return READINESS_VALUES[(index + 1) % READINESS_VALUES.length];
}

export function readinessLabel(value) {
  const labels = {
    "-3": "Very poor",
    "-2": "Poor",
    "-1": "Slightly worse",
    "0": "Baseline",
    "1": "Slightly better",
    "2": "Good",
    "3": "Great"
  };
  return labels[String(value ?? "0")] ?? "Baseline";
}

export function readinessShortLabel(value) {
  const stringValue = String(value ?? "0");
  if (stringValue === "0") return "0";
  return Number(stringValue) > 0 ? `+${stringValue}` : stringValue;
}

export function readinessClass(value, rest = false) {
  if (rest) return "bg-zinc-100 text-zinc-400 border-zinc-200";
  const stringValue = String(value ?? "0");
  if (stringValue === "3") return "bg-emerald-200 text-emerald-950 border-emerald-300";
  if (stringValue === "2") return "bg-emerald-100 text-emerald-900 border-emerald-200";
  if (stringValue === "1") return "bg-lime-100 text-lime-900 border-lime-200";
  if (stringValue === "-1") return "bg-amber-100 text-amber-900 border-amber-200";
  if (stringValue === "-2") return "bg-orange-100 text-orange-900 border-orange-200";
  if (stringValue === "-3") return "bg-red-100 text-red-900 border-red-200";
  return "bg-white text-zinc-700 border-zinc-200";
}

export function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(dateString) {
  if (!dateString) return null;
  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

export function monthTitle(year, monthIndex) {
  return new Date(year, monthIndex, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric"
  });
}

export function buildMonthCells(year, monthIndex) {
  const first = new Date(year, monthIndex, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}
