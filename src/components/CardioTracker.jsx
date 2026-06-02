import React, { useEffect, useMemo, useRef, useState } from "react";
import { dateKey, displayDate, parseLocalDate } from "../utils/training";
import { Button } from "./ui";

const CARDIO_TYPES = [
  "Incline treadmill",
  "Outdoor walk",
  "Jog / run",
  "Bike",
  "Elliptical",
  "Stairmaster",
  "Rower",
  "HIIT",
  "Other"
];

const INTENSITIES = ["Easy", "Moderate", "Hard", "Very hard"];

const DATE_FIELDS = ["date", "startdate", "start date", "start", "workoutdate", "workout date", "creationdate", "creation date"];
const TYPE_FIELDS = ["type", "workout type", "workouttype", "activity", "activitytype", "workoutactivitytype", "workout activity type", "name"];
const DURATION_FIELDS = ["duration", "durationmin", "duration minutes", "duration_minutes", "minutes", "elapsedtime", "elapsed time", "total time", "totaltime"];
const DURATION_SECONDS_FIELDS = ["durationseconds", "duration seconds", "duration_seconds", "seconds", "durationsec", "duration sec"];
const DISTANCE_FIELDS = ["distance", "totaldistance", "total distance", "distance miles", "distancemiles", "miles", "kilometers", "km"];
const CALORIE_FIELDS = ["calories", "activeenergy", "active energy", "activeenergyburned", "active energy burned", "totalenergyburned", "total energy burned", "energy"];
const HR_FIELDS = ["averageheartrate", "average heart rate", "avgheartrate", "avg heart rate", "avg hr", "avghr", "heartrate", "heart rate"];
const START_FIELDS = ["startdate", "start date", "starttime", "start time", "start", "workoutstartdate", "workout start date"];
const END_FIELDS = ["enddate", "end date", "endtime", "end time", "end", "workoutenddate", "workout end date"];
const SAMPLE_TIME_FIELDS = ["time", "timestamp", "date", "datetime", "startdate", "start date", "creationdate", "creation date"];
const SAMPLE_VALUE_FIELDS = ["value", "bpm", "heartrate", "heart rate", "heart rate bpm", "heart_rate", "qty", "quantity"];
const RECORD_TYPE_FIELDS = ["recordtype", "record type", "type", "sampletype", "sample type", "identifier", "name"];

const HR_ZONES = [
  { name: "Zone 1", min: 0, max: 119 },
  { name: "Zone 2", min: 120, max: 139 },
  { name: "Zone 3", min: 140, max: 159 },
  { name: "Zone 4", min: 160, max: 179 },
  { name: "Zone 5", min: 180, max: Infinity }
];

function addDaysToDate(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeek(dateString) {
  const parsed = parseLocalDate(dateString) ?? new Date();
  const start = new Date(parsed);
  start.setDate(parsed.getDate() - parsed.getDay());
  return start;
}

function toNumber(value) {
  const number = parseFloat(String(value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(number) ? number : 0;
}

function roundOne(value) {
  return Math.round(Number(value || 0) * 10) / 10;
}

function normalizeHeader(value) {
  return String(value ?? "").trim().toLowerCase().replace(/[()\[\]{}]/g, "").replace(/\s+/g, " ");
}

function getField(row, candidates) {
  const entries = Object.entries(row ?? {});
  for (const candidate of candidates) {
    const normalizedCandidate = normalizeHeader(candidate);
    const match = entries.find(([key]) => normalizeHeader(key) === normalizedCandidate);
    if (match && match[1] !== undefined && match[1] !== "") return match[1];
  }
  for (const candidate of candidates) {
    const normalizedCandidate = normalizeHeader(candidate);
    const match = entries.find(([key]) => normalizeHeader(key).includes(normalizedCandidate));
    if (match && match[1] !== undefined && match[1] !== "") return match[1];
  }
  return "";
}

function parseHealthDate(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  const isoMatch = raw.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  const slashMatch = raw.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (slashMatch) {
    const month = slashMatch[1].padStart(2, "0");
    const day = slashMatch[2].padStart(2, "0");
    const year = slashMatch[3].length === 2 ? `20${slashMatch[3]}` : slashMatch[3];
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) return dateKey(parsed);
  return "";
}

function parseHealthDateTime(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const normalized = raw.replace(/\s([+-]\d{4})$/, "$1");
  const parsed = new Date(normalized);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  const slashMatch = raw.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?)?/i);
  if (slashMatch) {
    const month = Number(slashMatch[1]) - 1;
    const day = Number(slashMatch[2]);
    const year = Number(slashMatch[3].length === 2 ? `20${slashMatch[3]}` : slashMatch[3]);
    let hour = Number(slashMatch[4] ?? 0);
    const minute = Number(slashMatch[5] ?? 0);
    const second = Number(slashMatch[6] ?? 0);
    const ampm = String(slashMatch[7] ?? "").toUpperCase();
    if (ampm === "PM" && hour < 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;
    return new Date(year, month, day, hour, minute, second);
  }

  const dateOnly = parseHealthDate(raw);
  return dateOnly ? parseLocalDate(dateOnly) : null;
}

function dateFromDateTime(value) {
  const parsed = parseHealthDateTime(value);
  if (parsed) return dateKey(parsed);
  return parseHealthDate(value);
}

function isHeartRateRow(row) {
  const typeText = String(getField(row, RECORD_TYPE_FIELDS) ?? "").toLowerCase();
  const hasHrValue = Boolean(getField(row, SAMPLE_VALUE_FIELDS)) || Boolean(getField(row, HR_FIELDS));
  const hasTime = Boolean(getField(row, SAMPLE_TIME_FIELDS));
  return hasTime && hasHrValue && (typeText.includes("heart") || typeText.includes("hr") || !getField(row, DURATION_FIELDS));
}

function getDurationMinutes(row) {
  const durationSeconds = getField(row, DURATION_SECONDS_FIELDS);
  const rawDuration = getField(row, DURATION_FIELDS);
  return durationSeconds ? roundOne(toNumber(durationSeconds) / 60) : roundOne(toNumber(rawDuration));
}

function calculateHrStats(samples = [], durationMinutes = 0) {
  const valid = samples
    .map((sample) => ({ ...sample, bpm: toNumber(sample.bpm), timestamp: Number(sample.timestamp) }))
    .filter((sample) => sample.bpm > 0 && Number.isFinite(sample.timestamp))
    .sort((a, b) => a.timestamp - b.timestamp);

  if (!valid.length) return { avgHr: "", minHr: "", maxHr: "", sampleCount: 0, zones: {} };

  const avgHr = roundOne(valid.reduce((sum, sample) => sum + sample.bpm, 0) / valid.length);
  const minHr = Math.min(...valid.map((sample) => sample.bpm));
  const maxHr = Math.max(...valid.map((sample) => sample.bpm));
  const zones = {};
  HR_ZONES.forEach((zone) => { zones[zone.name] = 0; });

  if (valid.length > 1) {
    for (let i = 0; i < valid.length; i += 1) {
      const current = valid[i];
      const next = valid[i + 1];
      const fallbackMinutes = durationMinutes ? durationMinutes / valid.length : 0;
      const minutes = next ? Math.max(0, Math.min(5, (next.timestamp - current.timestamp) / 60000)) : fallbackMinutes;
      const zone = HR_ZONES.find((item) => current.bpm >= item.min && current.bpm <= item.max);
      if (zone) zones[zone.name] = roundOne((zones[zone.name] ?? 0) + minutes);
    }
  }

  return { avgHr, minHr, maxHr, sampleCount: valid.length, zones };
}

function normalizeHeartRateSamples(rows) {
  return rows
    .filter(isHeartRateRow)
    .map((row) => {
      const timeValue = getField(row, SAMPLE_TIME_FIELDS);
      const parsed = parseHealthDateTime(timeValue);
      const bpm = toNumber(getField(row, SAMPLE_VALUE_FIELDS) || getField(row, HR_FIELDS));
      return parsed && bpm ? { timestamp: parsed.getTime(), time: parsed.toISOString(), bpm } : null;
    })
    .filter(Boolean);
}

function normalizeHealthWorkout(row) {
  const startRaw = getField(row, START_FIELDS) || getField(row, DATE_FIELDS);
  const start = parseHealthDateTime(startRaw);
  const date = start ? dateKey(start) : parseHealthDate(startRaw);
  if (!date) return null;

  const duration = getDurationMinutes(row);
  if (!duration) return null;

  const endRaw = getField(row, END_FIELDS);
  const end = parseHealthDateTime(endRaw) || (start ? new Date(start.getTime() + duration * 60000) : null);
  const rawType = getField(row, TYPE_FIELDS);
  const calories = roundOne(toNumber(getField(row, CALORIE_FIELDS)));
  const distance = roundOne(toNumber(getField(row, DISTANCE_FIELDS)));
  const avgHr = roundOne(toNumber(getField(row, HR_FIELDS)));
  const type = mapWorkoutType(rawType);

  return {
    id: `${date}-${String(rawType || type).replace(/[^a-z0-9]+/gi, "-")}-${start ? start.getTime() : Math.random().toString(36).slice(2)}`,
    date,
    startTime: start ? start.toISOString() : "",
    endTime: end ? end.toISOString() : "",
    type,
    sourceType: rawType || type,
    duration,
    distance,
    calories,
    avgHr: avgHr || "",
    intensity: inferIntensity(avgHr, calories, duration),
    heartRateSamples: [],
    hrSummary: avgHr ? { avgHr, minHr: "", maxHr: "", sampleCount: 0, zones: {} } : { avgHr: "", minHr: "", maxHr: "", sampleCount: 0, zones: {} }
  };
}

function extractHealthData(parsed) {
  if (Array.isArray(parsed)) return { workouts: parsed, heartRateRows: parsed };
  return {
    workouts: parsed?.workouts ?? parsed?.data?.workouts ?? parsed?.records ?? parsed?.data ?? parsed?.samples ?? [],
    heartRateRows: parsed?.heartRate ?? parsed?.heartRates ?? parsed?.heart_rate ?? parsed?.heartRateSamples ?? parsed?.data?.heartRate ?? parsed?.records ?? parsed?.samples ?? parsed?.data ?? []
  };
}

function attachHeartRateSamplesToWorkouts(workouts, samples) {
  return workouts.map((workout) => {
    const start = workout.startTime ? new Date(workout.startTime).getTime() : null;
    const end = workout.endTime ? new Date(workout.endTime).getTime() : null;
    const matched = start && end
      ? samples.filter((sample) => sample.timestamp >= start && sample.timestamp <= end)
      : [];
    const hrSummary = matched.length ? calculateHrStats(matched, workout.duration) : workout.hrSummary;
    return {
      ...workout,
      heartRateSamples: matched,
      avgHr: hrSummary.avgHr || workout.avgHr || "",
      hrSummary
    };
  });
}

function mapWorkoutType(value) {
  const raw = String(value ?? "").toLowerCase();
  if (!raw) return "Other";
  if (raw.includes("walk")) return "Outdoor walk";
  if (raw.includes("run") || raw.includes("jog")) return "Jog / run";
  if (raw.includes("cycle") || raw.includes("bike") || raw.includes("biking")) return "Bike";
  if (raw.includes("elliptical")) return "Elliptical";
  if (raw.includes("stair")) return "Stairmaster";
  if (raw.includes("row")) return "Rower";
  if (raw.includes("hiit") || raw.includes("interval")) return "HIIT";
  if (raw.includes("treadmill")) return "Incline treadmill";
  return "Other";
}

function inferIntensity(avgHr, calories, duration) {
  const hr = toNumber(avgHr);
  const mins = toNumber(duration);
  const cals = toNumber(calories);
  if (hr >= 165 || (mins && cals / mins >= 12)) return "Very hard";
  if (hr >= 145 || (mins && cals / mins >= 9)) return "Hard";
  if (hr >= 120 || (mins && cals / mins >= 5)) return "Moderate";
  return "Easy";
}

function parseCsv(text) {
  const rows = [];
  let current = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && next === '"' && inQuotes) {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      current.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      current.push(cell);
      if (current.some((value) => String(value).trim() !== "")) rows.push(current);
      current = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  current.push(cell);
  if (current.some((value) => String(value).trim() !== "")) rows.push(current);
  if (rows.length < 2) return [];

  const headers = rows[0].map((header) => String(header).trim());
  return rows.slice(1).map((row) => {
    const object = {};
    headers.forEach((header, index) => {
      object[header] = row[index] ?? "";
    });
    return object;
  });
}

function extractRowsFromJson(parsed) {
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed?.workouts)) return parsed.workouts;
  if (Array.isArray(parsed?.data?.workouts)) return parsed.data.workouts;
  if (Array.isArray(parsed?.data)) return parsed.data;
  if (Array.isArray(parsed?.records)) return parsed.records;
  if (Array.isArray(parsed?.samples)) return parsed.samples;
  return [];
}

function normalizeHealthRows(rows, heartRateRows = rows) {
  const workouts = rows
    .filter((row) => !isHeartRateRow(row))
    .map(normalizeHealthWorkout)
    .filter(Boolean);
  const heartRateSamples = normalizeHeartRateSamples(heartRateRows);
  const workoutsWithHr = attachHeartRateSamplesToWorkouts(workouts, heartRateSamples);

  return workoutsWithHr.map((workout) => ({
    date: workout.date,
    workout,
    entry: {
      completed: true,
      type: workout.type,
      intensity: workout.intensity,
      duration: String(workout.duration),
      distance: workout.distance ? String(workout.distance) : "",
      calories: workout.calories ? String(workout.calories) : "",
      avgHr: workout.avgHr ? String(workout.avgHr) : "",
      notes: workout.sourceType ? `Imported from Apple Health export: ${workout.sourceType}` : "Imported from Apple Health export",
      healthWorkouts: [workout]
    }
  }));
}


function normalizeSyncedHealthRows(rows = []) {
  return rows.map((row) => {
    const samples = Array.isArray(row.hr_samples) ? row.hr_samples : [];
    const zones = row.hr_zones && typeof row.hr_zones === "object" ? row.hr_zones : {};
    const sampleCount = samples.length;
    const workout = {
      id: row.external_id || row.id || `${row.workout_date}-${row.workout_type || "workout"}`,
      date: row.workout_date || dateFromDateTime(row.start_time),
      startTime: row.start_time || "",
      endTime: row.end_time || "",
      type: mapWorkoutType(row.workout_type),
      sourceType: row.workout_type || "Apple Health workout",
      duration: row.duration_minutes || "",
      distance: row.distance || "",
      calories: row.calories || "",
      avgHr: row.avg_hr || "",
      intensity: inferIntensity(row.avg_hr, row.calories, row.duration_minutes),
      heartRateSamples: samples,
      hrSummary: {
        avgHr: row.avg_hr || "",
        minHr: row.min_hr || "",
        maxHr: row.max_hr || "",
        sampleCount,
        zones
      }
    };

    return {
      date: workout.date,
      workout,
      entry: {
        completed: true,
        type: workout.type,
        intensity: workout.intensity,
        duration: workout.duration ? String(workout.duration) : "",
        distance: workout.distance ? String(workout.distance) : "",
        calories: workout.calories ? String(workout.calories) : "",
        avgHr: workout.avgHr ? String(workout.avgHr) : "",
        notes: workout.sourceType ? `Synced from Apple Health: ${workout.sourceType}` : "Synced from Apple Health",
        healthWorkouts: [workout]
      }
    };
  }).filter((item) => item.date);
}


function formatDateTimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function dateTimeLocalToIso(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function recalculateEntryFromHealthWorkouts(baseEntry, workouts) {
  const valid = (workouts ?? []).filter(Boolean);
  if (!valid.length) {
    return {
      ...baseEntry,
      completed: false,
      duration: "",
      distance: "",
      calories: "",
      avgHr: "",
      healthWorkouts: []
    };
  }

  const totalDuration = valid.reduce((sum, workout) => sum + toNumber(workout.duration), 0);
  const totalDistance = valid.reduce((sum, workout) => sum + toNumber(workout.distance), 0);
  const totalCalories = valid.reduce((sum, workout) => sum + toNumber(workout.calories), 0);
  const hrWeightedTotal = valid.reduce((sum, workout) => sum + (toNumber(workout.avgHr) * (toNumber(workout.duration) || 1)), 0);
  const hrWeight = valid.reduce((sum, workout) => sum + (toNumber(workout.avgHr) ? (toNumber(workout.duration) || 1) : 0), 0);
  const avgHr = hrWeight ? roundOne(hrWeightedTotal / hrWeight) : "";

  return {
    ...baseEntry,
    completed: true,
    type: valid.length === 1 ? (valid[0].type ?? baseEntry.type) : (baseEntry.type ?? "Other"),
    intensity: valid.length === 1 ? (valid[0].intensity ?? baseEntry.intensity) : (baseEntry.intensity ?? inferIntensity(avgHr, totalCalories, totalDuration)),
    duration: totalDuration ? String(roundOne(totalDuration)) : "",
    distance: totalDistance ? String(roundOne(totalDistance)) : "",
    calories: totalCalories ? String(roundOne(totalCalories)) : "",
    avgHr: avgHr ? String(avgHr) : "",
    healthWorkouts: valid
  };
}

function mergeImportedCardio(existingLog, importedEntries) {
  const nextLog = { ...(existingLog ?? {}) };
  let created = 0;
  let merged = 0;
  let hrMapped = 0;

  for (const { date, entry, workout } of importedEntries) {
    if (workout?.heartRateSamples?.length) hrMapped += 1;
    const existing = nextLog[date];
    if (!existing) {
      nextLog[date] = entry;
      created += 1;
      continue;
    }

    const existingWorkouts = existing.healthWorkouts ?? [];
    const incomingWorkouts = entry.healthWorkouts ?? [];
    const workoutMap = new Map();
    existingWorkouts.forEach((item, index) => workoutMap.set(String(item.id ?? `existing-${index}`), item));
    incomingWorkouts.forEach((item, index) => workoutMap.set(String(item.id ?? `incoming-${index}`), item));
    const combinedWorkouts = Array.from(workoutMap.values()).sort((a, b) => {
      const aTime = a?.startTime ? new Date(a.startTime).getTime() : 0;
      const bTime = b?.startTime ? new Date(b.startTime).getTime() : 0;
      return aTime - bTime;
    });

    const baseEntry = {
      ...existing,
      notes: Array.from(new Set([existing.notes, entry.notes].filter(Boolean))).join("\n")
    };
    nextLog[date] = recalculateEntryFromHealthWorkouts(baseEntry, combinedWorkouts);
    merged += 1;
  }

  return { nextLog, created, merged, hrMapped };
}

function summarizeEntries(entries) {
  return entries.reduce(
    (sum, entry) => ({
      sessions: sum.sessions + (entry.completed ? 1 : 0),
      minutes: sum.minutes + toNumber(entry.duration),
      distance: sum.distance + toNumber(entry.distance),
      calories: sum.calories + toNumber(entry.calories)
    }),
    { sessions: 0, minutes: 0, distance: 0, calories: 0 }
  );
}

function CardioStat({ label, value, sub }) {
  return (
    <div className="rounded-2xl bg-white/75 p-3">
      <div className="text-xs font-medium text-sky-700">{label}</div>
      <div className="mt-1 text-2xl font-bold text-sky-950">{value}</div>
      {sub && <div className="text-xs text-sky-700">{sub}</div>}
    </div>
  );
}

function ProgressBar({ value, max, label, rightLabel }) {
  const width = Math.min(100, Math.round((toNumber(value) / Math.max(toNumber(max), 1)) * 100));
  return (
    <div className="grid grid-cols-[84px_1fr_88px] items-center gap-2 text-xs">
      <div className="font-medium text-zinc-600">{label}</div>
      <div className="h-3 overflow-hidden rounded-full bg-zinc-100">
        <div className="h-full rounded-full bg-sky-600" style={{ width: `${width}%` }} />
      </div>
      <div className="text-right text-zinc-600">{rightLabel}</div>
    </div>
  );
}

function CardioLineChart({ points, valueKey = "avgHr", label = "Avg HR" }) {
  const valid = (points ?? [])
    .map((point) => ({ ...point, value: toNumber(point[valueKey]) }))
    .filter((point) => point.value > 0);

  if (valid.length < 2) {
    return <div className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-500">Need at least two synced workouts with {label.toLowerCase()} to show a trend.</div>;
  }

  const minValue = Math.min(...valid.map((point) => point.value));
  const maxValue = Math.max(...valid.map((point) => point.value));
  const range = Math.max(maxValue - minValue, 1);
  const coords = valid.map((point, index) => {
    const x = valid.length === 1 ? 50 : (index / (valid.length - 1)) * 100;
    const y = 90 - ((point.value - minValue) / range) * 75;
    return { ...point, x, y };
  });
  const polyline = coords.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className="rounded-2xl bg-white p-4">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-zinc-800">{label} trend</span>
        <span className="text-xs text-zinc-500">{roundOne(minValue)}–{roundOne(maxValue)}</span>
      </div>
      <svg viewBox="0 0 100 100" className="h-44 w-full overflow-visible">
        <polyline points={polyline} fill="none" stroke="currentColor" strokeWidth="2.5" className="text-sky-700" />
        {coords.map((point, index) => (
          <g key={`${point.date}-${index}`}>
            <circle cx={point.x} cy={point.y} r="2.8" className="fill-sky-700" />
            <text x={point.x} y={Math.max(8, point.y - 6)} textAnchor="middle" className="fill-zinc-500 text-[5px]">{roundOne(point.value)}</text>
          </g>
        ))}
      </svg>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-zinc-500 md:grid-cols-4">
        {coords.slice(-4).map((point, index) => (
          <div key={`${point.date}-${index}`} className="rounded-lg bg-zinc-50 px-2 py-1">
            <div className="font-medium text-zinc-700">{displayDate(point.date)}</div>
            <div>{point.type || "Workout"} · {roundOne(point.value)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CardioTracker({ state, activeDate, updateNested, updateState }) {
  const [selectedDate, setSelectedDate] = useState(activeDate || dateKey(new Date()));
  const [importSummary, setImportSummary] = useState("");
  const [syncSummary, setSyncSummary] = useState("");
  const [syncingHealth, setSyncingHealth] = useState(false);
  const [savingRemoteHealth, setSavingRemoteHealth] = useState(false);
  const [selectedHealthWorkoutId, setSelectedHealthWorkoutId] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (activeDate) setSelectedDate(activeDate);
  }, [activeDate]);

  const cardioLog = state.cardioLog ?? {};
  const goals = state.cardioGoals ?? { weeklyMinutes: 150, weeklySessions: 4 };
  const entry = cardioLog[selectedDate] ?? {
    completed: false,
    type: "Incline treadmill",
    duration: "",
    distance: "",
    calories: "",
    avgHr: "",
    intensity: "Easy",
    notes: ""
  };

  const healthWorkouts = entry.healthWorkouts ?? [];
  const allHealthWorkoutOptions = useMemo(() => {
    return Object.entries(cardioLog)
      .flatMap(([date, logEntry]) => (logEntry?.healthWorkouts ?? []).map((workout, index) => ({
        date,
        workout,
        index,
        key: `${date}::${workout.id ?? index}`
      })))
      .sort((a, b) => {
        const aTime = a.workout?.startTime ? new Date(a.workout.startTime).getTime() : new Date(a.date).getTime();
        const bTime = b.workout?.startTime ? new Date(b.workout.startTime).getTime() : new Date(b.date).getTime();
        return bTime - aTime;
      });
  }, [cardioLog]);

  const selectedHealthWorkoutOption = allHealthWorkoutOptions.find((option) => option.key === selectedHealthWorkoutId)
    ?? allHealthWorkoutOptions.find((option) => option.date === selectedDate)
    ?? allHealthWorkoutOptions[0]
    ?? null;
  const selectedHealthWorkout = selectedHealthWorkoutOption?.workout ?? null;
  const selectedHealthWorkoutDate = selectedHealthWorkoutOption?.date ?? selectedDate;
  const selectedHealthWorkoutEntry = cardioLog[selectedHealthWorkoutDate] ?? entry;
  const selectedHealthWorkoutDailyTotal = selectedHealthWorkoutEntry ?? {};
  const selectedHealthWorkoutIndex = selectedHealthWorkoutOption
    ? (cardioLog[selectedHealthWorkoutDate]?.healthWorkouts ?? []).findIndex((workout, index) => `${selectedHealthWorkoutDate}::${workout.id ?? index}` === selectedHealthWorkoutOption.key)
    : -1;

  useEffect(() => {
    if (!allHealthWorkoutOptions.length) {
      setSelectedHealthWorkoutId("");
      return;
    }

    const sameDateOption = allHealthWorkoutOptions.find((option) => option.date === selectedDate);
    const currentOption = allHealthWorkoutOptions.find((option) => option.key === selectedHealthWorkoutId);

    if (sameDateOption && currentOption?.date !== selectedDate) {
      setSelectedHealthWorkoutId(sameDateOption.key);
      return;
    }

    if (!currentOption) {
      setSelectedHealthWorkoutId((sameDateOption ?? allHealthWorkoutOptions[0]).key);
    }
  }, [selectedDate, selectedHealthWorkoutId, allHealthWorkoutOptions]);

  const selectedWeekStart = startOfWeek(selectedDate);
  const selectedWeekDates = Array.from({ length: 7 }, (_, index) => dateKey(addDaysToDate(selectedWeekStart, index)));
  const selectedWeekEntries = selectedWeekDates.map((date) => cardioLog[date]).filter(Boolean);
  const selectedWeekSummary = summarizeEntries(selectedWeekEntries);

  const recentWeeks = useMemo(() => {
    const currentStart = startOfWeek(selectedDate);
    return Array.from({ length: 8 }, (_, index) => {
      const weekStart = addDaysToDate(currentStart, (index - 7) * 7);
      const dates = Array.from({ length: 7 }, (_, dayIndex) => dateKey(addDaysToDate(weekStart, dayIndex)));
      const entries = dates.map((date) => cardioLog[date]).filter(Boolean);
      return {
        label: `${displayDate(dateKey(weekStart))}`,
        ...summarizeEntries(entries)
      };
    });
  }, [cardioLog, selectedDate]);

  const maxMinutes = Math.max(...recentWeeks.map((week) => week.minutes), Number(goals.weeklyMinutes) || 1, 1);

  const cardioAnalytics = useMemo(() => {
    const entries = Object.entries(cardioLog)
      .map(([date, item]) => ({ date, ...(item ?? {}) }))
      .filter((item) => item.completed || toNumber(item.duration) || toNumber(item.distance) || toNumber(item.calories) || item.healthWorkouts?.length)
      .sort((a, b) => a.date.localeCompare(b.date));

    const syncedWorkouts = allHealthWorkoutOptions
      .map((option) => ({ date: option.date, ...(option.workout ?? {}) }))
      .sort((a, b) => {
        const aTime = a.startTime ? new Date(a.startTime).getTime() : new Date(a.date).getTime();
        const bTime = b.startTime ? new Date(b.startTime).getTime() : new Date(b.date).getTime();
        return aTime - bTime;
      });

    const total = summarizeEntries(entries);
    const avgHrValues = syncedWorkouts.map((workout) => toNumber(workout.avgHr)).filter(Boolean);
    const avgHr = avgHrValues.length ? roundOne(avgHrValues.reduce((sum, value) => sum + value, 0) / avgHrValues.length) : "";
    const workoutsWithHr = syncedWorkouts.filter((workout) => toNumber(workout.avgHr) || workout.hrSummary?.sampleCount).length;
    const workoutsWithDistance = syncedWorkouts.filter((workout) => toNumber(workout.distance)).length;
    const workoutsWithCalories = syncedWorkouts.filter((workout) => toNumber(workout.calories)).length;

    const typeTotals = {};
    syncedWorkouts.forEach((workout) => {
      const type = workout.type || workout.sourceType || "Other";
      if (!typeTotals[type]) typeTotals[type] = { type, sessions: 0, minutes: 0, distance: 0, calories: 0 };
      typeTotals[type].sessions += 1;
      typeTotals[type].minutes += toNumber(workout.duration);
      typeTotals[type].distance += toNumber(workout.distance);
      typeTotals[type].calories += toNumber(workout.calories);
    });

    const typeBreakdown = Object.values(typeTotals).sort((a, b) => b.minutes - a.minutes).slice(0, 6);
    const hrTrend = syncedWorkouts
      .filter((workout) => toNumber(workout.avgHr))
      .slice(-12)
      .map((workout) => ({
        date: workout.date || dateFromDateTime(workout.startTime),
        avgHr: workout.avgHr,
        type: workout.type || workout.sourceType || "Workout"
      }));

    const bestWeek = recentWeeks.reduce((best, week) => week.minutes > (best?.minutes ?? -1) ? week : best, null);

    return {
      entries,
      syncedWorkouts,
      total,
      avgHr,
      workoutsWithHr,
      workoutsWithDistance,
      workoutsWithCalories,
      typeBreakdown,
      hrTrend,
      bestWeek
    };
  }, [cardioLog, allHealthWorkoutOptions, recentWeeks]);

  const weeklyGoalPercent = Math.min(100, Math.round((selectedWeekSummary.minutes / Math.max(Number(goals.weeklyMinutes) || 1, 1)) * 100));

  function updateCardioEntry(patch) {
    updateNested("cardioLog", selectedDate, { ...entry, ...patch });
  }

  function updateSelectedHealthWorkout(patch) {
    if (selectedHealthWorkoutIndex < 0 || !selectedHealthWorkoutOption) return;
    const targetDate = selectedHealthWorkoutOption.date;
    const targetEntry = cardioLog[targetDate] ?? {};
    const targetWorkouts = targetEntry.healthWorkouts ?? [];
    const nextWorkouts = targetWorkouts.map((workout, index) => {
      if (index !== selectedHealthWorkoutIndex) return workout;
      const nextWorkout = { ...workout, ...patch };
      if (patch.startTime || patch.endTime) {
        const start = nextWorkout.startTime ? new Date(nextWorkout.startTime).getTime() : null;
        const end = nextWorkout.endTime ? new Date(nextWorkout.endTime).getTime() : null;
        if (start && end && end > start) nextWorkout.duration = roundOne((end - start) / 60000);
      }
      return nextWorkout;
    });
    updateNested("cardioLog", targetDate, recalculateEntryFromHealthWorkouts(targetEntry, nextWorkouts));
    if (selectedDate !== targetDate) setSelectedDate(targetDate);
  }

  function deleteSelectedHealthWorkout() {
    if (selectedHealthWorkoutIndex < 0 || !selectedHealthWorkoutOption) return;
    if (!window.confirm("Remove this imported workout from the selected cardio day?")) return;
    const targetDate = selectedHealthWorkoutOption.date;
    const targetEntry = cardioLog[targetDate] ?? {};
    const targetWorkouts = targetEntry.healthWorkouts ?? [];
    const nextWorkouts = targetWorkouts.filter((_, index) => index !== selectedHealthWorkoutIndex);
    if (!nextWorkouts.length) {
      updateNested("cardioLog", targetDate, undefined);
      setSelectedHealthWorkoutId("");
      if (selectedDate !== targetDate) setSelectedDate(targetDate);
      return;
    }
    updateNested("cardioLog", targetDate, recalculateEntryFromHealthWorkouts(targetEntry, nextWorkouts));
    const nextKey = `${targetDate}::${nextWorkouts[0]?.id ?? 0}`;
    setSelectedHealthWorkoutId(nextKey);
    if (selectedDate !== targetDate) setSelectedDate(targetDate);
  }

  function clearEntry() {
    if (!window.confirm(`Clear cardio for ${displayDate(selectedDate)}?`)) return;
    updateNested("cardioLog", selectedDate, undefined);
  }

  function updateGoal(key, value) {
    updateState({ cardioGoals: { ...goals, [key]: value } });
  }

  function getHealthSyncSecret() {
    let secret = localStorage.getItem("health_sync_secret") || "";
    if (!secret) {
      secret = window.prompt("Enter your Apple Health sync secret. This is the same value you saved in Vercel as HEALTH_IMPORT_SECRET.");
      if (!secret) return "";
      localStorage.setItem("health_sync_secret", secret);
    }
    return secret;
  }

  function makeSyncedWorkoutPayload(workout) {
    if (!workout) return null;
    return {
      external_id: workout.id,
      workout: {
        ...workout,
        external_id: workout.id,
        date: workout.date ?? selectedHealthWorkoutDate
      }
    };
  }

  async function saveSelectedHealthWorkoutToSupabase() {
    if (!selectedHealthWorkout) return;
    const secret = getHealthSyncSecret();
    if (!secret) return;
    const payload = makeSyncedWorkoutPayload(selectedHealthWorkout);
    if (!payload?.external_id) {
      alert("This imported workout does not have a sync ID, so it can only be edited locally.");
      return;
    }

    setSavingRemoteHealth(true);
    setSyncSummary("Saving imported workout changes to Supabase...");
    try {
      const response = await fetch("/api/health-workout", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-health-secret": secret
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Could not save imported workout.");
      setSyncSummary("Saved imported workout changes to Supabase. Future syncs will keep the corrected values.");
    } catch (error) {
      console.error(error);
      setSyncSummary(error.message || "Could not save imported workout.");
      alert(error.message || "Could not save imported workout.");
    } finally {
      setSavingRemoteHealth(false);
    }
  }

  async function deleteSelectedHealthWorkoutFromSupabase() {
    if (!selectedHealthWorkout) return;
    if (!window.confirm("Delete this imported workout from Supabase and remove it from the tracker?")) return;
    const secret = getHealthSyncSecret();
    if (!secret) return;
    const externalId = selectedHealthWorkout.id;
    if (!externalId) {
      deleteSelectedHealthWorkout();
      return;
    }

    setSavingRemoteHealth(true);
    setSyncSummary("Deleting imported workout from Supabase...");
    try {
      const response = await fetch("/api/health-workout", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-health-secret": secret
        },
        body: JSON.stringify({ external_id: externalId })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Could not delete imported workout.");

      const targetDate = selectedHealthWorkoutOption?.date ?? selectedDate;
      const targetEntry = cardioLog[targetDate] ?? {};
      const targetWorkouts = targetEntry.healthWorkouts ?? [];
      const nextWorkouts = targetWorkouts.filter((workout) => String(workout.id) !== String(externalId));
      if (!nextWorkouts.length) {
        updateNested("cardioLog", targetDate, undefined);
        setSelectedHealthWorkoutId("");
      } else {
        updateNested("cardioLog", targetDate, recalculateEntryFromHealthWorkouts(targetEntry, nextWorkouts));
        setSelectedHealthWorkoutId(`${targetDate}::${nextWorkouts[0]?.id ?? 0}`);
      }
      if (selectedDate !== targetDate) setSelectedDate(targetDate);
      setSyncSummary("Deleted imported workout from Supabase and removed it from the tracker.");
    } catch (error) {
      console.error(error);
      setSyncSummary(error.message || "Could not delete imported workout.");
      alert(error.message || "Could not delete imported workout.");
    } finally {
      setSavingRemoteHealth(false);
    }
  }

  function clearLocalSyncedHealthWorkouts() {
    if (!window.confirm("Clear all locally synced Apple Health workouts from the tracker? This does not delete anything from Supabase.")) return;
    const nextLog = { ...cardioLog };
    Object.entries(nextLog).forEach(([date, logEntry]) => {
      if (!logEntry?.healthWorkouts?.length) return;
      const nextEntry = { ...logEntry, healthWorkouts: [] };
      nextLog[date] = recalculateEntryFromHealthWorkouts(nextEntry, []);
    });
    Object.keys(nextLog).forEach((date) => {
      const item = nextLog[date];
      if (!item?.completed && !item?.duration && !item?.distance && !item?.calories && !item?.notes) delete nextLog[date];
    });
    updateState({ cardioLog: nextLog });
    setSelectedHealthWorkoutId("");
    setSyncSummary("Cleared locally synced Apple Health workouts. Use Sync Apple Health to re-import from Supabase.");
  }

  async function syncSelectedCardioDate() {
    const secret = getHealthSyncSecret();
    if (!secret) return;
    setSyncingHealth(true);
    setSyncSummary(`Syncing Apple Health workouts for ${displayDate(selectedDate)}...`);
    try {
      const response = await fetch(`/api/health-sync?date=${encodeURIComponent(selectedDate)}`, {
        headers: { "x-health-secret": secret }
      });
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("health_sync_secret");
        throw new Error("Sync secret was rejected. Re-enter the same secret saved in Vercel as HEALTH_IMPORT_SECRET.");
      }
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Apple Health date sync failed.");
      const importedEntries = normalizeSyncedHealthRows(payload.workouts ?? []);
      if (!importedEntries.length) {
        setSyncSummary(`No synced Apple Health workouts found for ${displayDate(selectedDate)}.`);
        return;
      }
      const { nextLog, created, merged, hrMapped } = mergeImportedCardio(cardioLog, importedEntries);
      updateState({ cardioLog: nextLog });
      setSyncSummary(`Synced ${importedEntries.length} Apple Health workout${importedEntries.length === 1 ? "" : "s"} for ${displayDate(selectedDate)}. Created ${created}; merged ${merged}; mapped HR samples to ${hrMapped}.`);
    } catch (error) {
      console.error(error);
      setSyncSummary(error.message || "Apple Health date sync failed.");
      alert(error.message || "Apple Health date sync failed.");
    } finally {
      setSyncingHealth(false);
    }
  }


  async function syncAppleHealth() {
    const secret = getHealthSyncSecret();
    if (!secret) return;

    setSyncingHealth(true);
    setSyncSummary("Syncing Apple Health data...");
    try {
      const response = await fetch("/api/health-sync", {
        headers: { "x-health-secret": secret }
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("health_sync_secret");
        throw new Error("Sync secret was rejected. Re-enter the same secret saved in Vercel as HEALTH_IMPORT_SECRET.");
      }

      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Apple Health sync failed.");

      const importedEntries = normalizeSyncedHealthRows(payload.workouts ?? []);
      if (!importedEntries.length) {
        setSyncSummary("No synced Apple Health workouts were found yet. Send a test export from Health Auto Export first.");
        return;
      }

      const { nextLog, created, merged, hrMapped } = mergeImportedCardio(cardioLog, importedEntries);
      updateState({
        cardioLog: nextLog,
        cardioImportHistory: [
          ...(state.cardioImportHistory ?? []).slice(-9),
          {
            importedAt: new Date().toISOString(),
            fileName: "Supabase sync",
            rows: importedEntries.length,
            dates: new Set(importedEntries.map((item) => item.date)).size,
            created,
            merged,
            hrMapped
          }
        ]
      });
      setSyncSummary(`Synced ${importedEntries.length} Apple Health workout${importedEntries.length === 1 ? "" : "s"}. Created ${created}; merged ${merged}; mapped HR samples to ${hrMapped}.`);
    } catch (error) {
      console.error(error);
      setSyncSummary(error.message || "Apple Health sync failed.");
      alert(error.message || "Apple Health sync failed.");
    } finally {
      setSyncingHealth(false);
    }
  }

  function forgetHealthSyncSecret() {
    localStorage.removeItem("health_sync_secret");
    setSyncSummary("Saved sync secret cleared from this browser.");
  }

  function handleHealthImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result ?? "");
        const isJson = file.name.toLowerCase().endsWith(".json");
        const parsedJson = isJson ? JSON.parse(text) : null;
        const healthData = isJson ? extractHealthData(parsedJson) : { workouts: parseCsv(text), heartRateRows: parseCsv(text) };
        const importedEntries = normalizeHealthRows(healthData.workouts, healthData.heartRateRows);
        if (!importedEntries.length) {
          alert("No usable cardio/workout rows were found. Try a Health Auto Export workout CSV/JSON file with date, duration, and workout type fields.");
          return;
        }
        const uniqueDates = new Set(importedEntries.map((item) => item.date)).size;
        const shouldImport = window.confirm([
          `Import ${importedEntries.length} Apple Health cardio/workout row${importedEntries.length === 1 ? "" : "s"}?`,
          `These will be merged into ${uniqueDates} date${uniqueDates === 1 ? "" : "s"}.`,
          "",
          "If timestamped heart-rate samples are present, they will be mapped to workouts by start/end time.",
          "Existing cardio logs on the same date will be combined, not deleted."
        ].join("\n"));
        if (!shouldImport) return;

        const { nextLog, created, merged, hrMapped } = mergeImportedCardio(cardioLog, importedEntries);
        updateState({
          cardioLog: nextLog,
          cardioImportHistory: [
            ...(state.cardioImportHistory ?? []).slice(-9),
            {
              importedAt: new Date().toISOString(),
              fileName: file.name,
              rows: importedEntries.length,
              dates: uniqueDates,
              created,
              merged,
              hrMapped
            }
          ]
        });
        setImportSummary(`Imported ${importedEntries.length} workout${importedEntries.length === 1 ? "" : "s"} from ${file.name}. Created ${created} new date${created === 1 ? "" : "s"}; merged ${merged}; mapped detailed HR samples to ${hrMapped} workout${hrMapped === 1 ? "" : "s"}.`);
      } catch (error) {
        console.error(error);
        alert("Could not import that Apple Health file. Use CSV or JSON exported from Health Auto Export.");
      } finally {
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  }

  return (
    <details className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sky-950">
      <summary className="cursor-pointer select-none text-lg font-semibold text-sky-900">Cardio Tracker</summary>
      <div className="mt-4 space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          <CardioStat label="This week" value={roundOne(selectedWeekSummary.minutes)} sub={`${weeklyGoalPercent}% of ${goals.weeklyMinutes || 0} min goal`} />
          <CardioStat label="Sessions" value={`${selectedWeekSummary.sessions}/${goals.weeklySessions || 0}`} sub="weekly goal" />
          <CardioStat label="Synced workouts" value={cardioAnalytics.syncedWorkouts.length} sub={`${cardioAnalytics.workoutsWithHr} with HR`} />
          <CardioStat label="Avg HR" value={cardioAnalytics.avgHr || "—"} sub="synced workouts" />
        </div>

        <div className="rounded-2xl bg-white p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
            <label className="text-sm font-medium text-zinc-700">
              Cardio date
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
            </label>
            <label className="text-sm font-medium text-zinc-700">
              Weekly minute goal
              <input value={goals.weeklyMinutes ?? ""} onChange={(e) => updateGoal("weeklyMinutes", e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
            </label>
            <label className="text-sm font-medium text-zinc-700">
              Weekly session goal
              <input value={goals.weeklySessions ?? ""} onChange={(e) => updateGoal("weeklySessions", e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
            </label>
            <Button variant="outline" onClick={() => setSelectedDate(activeDate || dateKey(new Date()))} className="mt-7">Use workout date</Button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <label className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm">
              <input type="checkbox" checked={Boolean(entry.completed)} onChange={(e) => updateCardioEntry({ completed: e.target.checked })} /> Completed
            </label>
            <label className="text-sm font-medium text-zinc-700">
              Type
              <select value={entry.type ?? "Incline treadmill"} onChange={(e) => updateCardioEntry({ type: e.target.value })} className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm">
                {CARDIO_TYPES.map((type) => <option key={type}>{type}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-zinc-700">
              Intensity
              <select value={entry.intensity ?? "Easy"} onChange={(e) => updateCardioEntry({ intensity: e.target.value })} className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm">
                {INTENSITIES.map((intensity) => <option key={intensity}>{intensity}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-zinc-700">
              Avg HR
              <input value={entry.avgHr ?? ""} onChange={(e) => updateCardioEntry({ avgHr: e.target.value })} placeholder="optional" className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
            </label>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-4">
            <input value={entry.duration ?? ""} onChange={(e) => updateCardioEntry({ duration: e.target.value })} placeholder="Minutes" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
            <input value={entry.distance ?? ""} onChange={(e) => updateCardioEntry({ distance: e.target.value })} placeholder="Distance" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
            <input value={entry.calories ?? ""} onChange={(e) => updateCardioEntry({ calories: e.target.value })} placeholder="Calories" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
            <Button variant="outline" onClick={clearEntry}>Clear day</Button>
          </div>

          <textarea value={entry.notes ?? ""} onChange={(e) => updateCardioEntry({ notes: e.target.value })} placeholder="Cardio notes: pace, incline, machine, recovery, breathing, etc." className="mt-3 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" rows={2} />
        </div>

        <details className="rounded-2xl border border-sky-100 bg-white p-4">
          <summary className="cursor-pointer select-none text-sm font-semibold text-zinc-900">Apple Health sync and import tools</summary>
          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="max-w-3xl text-xs leading-5 text-zinc-600">
                Use these only when you need to pull new Apple Health data, re-sync one date, clear the local cache, or manually import a Health Auto Export CSV/JSON file.
              </p>
              {importSummary && <p className="mt-2 rounded-xl bg-sky-50 px-3 py-2 text-xs text-sky-800">{importSummary}</p>}
              {syncSummary && <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-800">{syncSummary}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={syncAppleHealth} disabled={syncingHealth}>{syncingHealth ? "Syncing..." : "Sync Apple Health"}</Button>
              <Button variant="outline" onClick={syncSelectedCardioDate} disabled={syncingHealth}>Sync selected date</Button>
              <Button variant="outline" onClick={clearLocalSyncedHealthWorkouts}>Clear local sync</Button>
              <Button variant="outline" onClick={forgetHealthSyncSecret}>Forget Sync Secret</Button>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>Import CSV/JSON</Button>
              <input ref={fileInputRef} type="file" accept=".csv,.json,text/csv,application/json" onChange={handleHealthImport} className="hidden" />
            </div>
          </div>
        </details>

        {!!allHealthWorkoutOptions.length && (
          <details className="rounded-2xl border border-emerald-100 bg-white p-4">
            <summary className="cursor-pointer select-none text-sm font-semibold text-zinc-900">Imported workout manager</summary>
            <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Imported Apple Health workouts</div>
                  <div className="text-xs text-zinc-500">{allHealthWorkoutOptions.length} synced</div>
                </div>
                <div className="max-h-80 space-y-2 overflow-auto pr-1">
                  {allHealthWorkoutOptions.map(({ date, workout, key }) => {
                    const selected = key === selectedHealthWorkoutOption?.key;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          setSelectedHealthWorkoutId(key);
                          setSelectedDate(date);
                        }}
                        className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${selected ? "border-emerald-300 bg-emerald-50" : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100"}`}
                      >
                        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                          <div className="font-semibold text-zinc-900">{displayDate(date)} · {workout.sourceType || workout.type || "Workout"}</div>
                          <div className="text-xs text-zinc-500">
                            {workout.startTime ? new Date(workout.startTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "No start"}
                            {workout.endTime ? ` – ${new Date(workout.endTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : ""}
                          </div>
                        </div>
                        <div className="mt-1 text-xs text-zinc-600">
                          {workout.duration || "—"} min · {workout.distance || "—"} distance · {workout.calories || "—"} cal · Avg HR {workout.avgHr || "—"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
                <div className="text-sm font-semibold text-emerald-900">Edit selected imported workout</div>
                <p className="mt-1 text-xs text-emerald-800">
                  Corrections can stay local or be saved back to Supabase so future syncs keep the fixed values.
                </p>

                <div className="mt-3 grid gap-3 md:grid-cols-[2fr_1fr]">
                  <label className="text-sm font-medium text-zinc-700">
                    Imported workout
                    <select
                      value={selectedHealthWorkoutOption?.key ?? ""}
                      onChange={(e) => {
                        const option = allHealthWorkoutOptions.find((item) => item.key === e.target.value);
                        setSelectedHealthWorkoutId(e.target.value);
                        if (option?.date) setSelectedDate(option.date);
                      }}
                      className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                    >
                      {allHealthWorkoutOptions.map(({ date, workout, index, key }) => (
                        <option key={key} value={key}>
                          {displayDate(date)} · {workout.sourceType || workout.type || "Workout"} · {workout.startTime ? new Date(workout.startTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : `#${index + 1}`} · {workout.duration || "—"} min
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="rounded-xl bg-white px-3 py-2 text-xs text-zinc-600">
                    <div className="font-semibold text-zinc-800">Selected day total</div>
                    {selectedHealthWorkoutDailyTotal.duration || "0"} min · {selectedHealthWorkoutDailyTotal.calories || "0"} cal · Avg HR {selectedHealthWorkoutDailyTotal.avgHr || "—"}
                  </div>
                </div>

                {selectedHealthWorkout && (
                  <div className="mt-3 grid gap-3 md:grid-cols-4">
                    <label className="text-sm font-medium text-zinc-700">
                      Type
                      <select value={selectedHealthWorkout.type ?? "Other"} onChange={(e) => updateSelectedHealthWorkout({ type: e.target.value })} className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm">
                        {CARDIO_TYPES.map((type) => <option key={type}>{type}</option>)}
                      </select>
                    </label>
                    <label className="text-sm font-medium text-zinc-700">
                      Source label
                      <input value={selectedHealthWorkout.sourceType ?? ""} onChange={(e) => updateSelectedHealthWorkout({ sourceType: e.target.value })} className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
                    </label>
                    <label className="text-sm font-medium text-zinc-700">
                      Start time
                      <input type="datetime-local" value={formatDateTimeLocal(selectedHealthWorkout.startTime)} onChange={(e) => updateSelectedHealthWorkout({ startTime: dateTimeLocalToIso(e.target.value) })} className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
                    </label>
                    <label className="text-sm font-medium text-zinc-700">
                      End time
                      <input type="datetime-local" value={formatDateTimeLocal(selectedHealthWorkout.endTime)} onChange={(e) => updateSelectedHealthWorkout({ endTime: dateTimeLocalToIso(e.target.value) })} className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
                    </label>
                    <label className="text-sm font-medium text-zinc-700">
                      Duration minutes
                      <input value={selectedHealthWorkout.duration ?? ""} onChange={(e) => updateSelectedHealthWorkout({ duration: e.target.value })} className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
                    </label>
                    <label className="text-sm font-medium text-zinc-700">
                      Distance
                      <input value={selectedHealthWorkout.distance ?? ""} onChange={(e) => updateSelectedHealthWorkout({ distance: e.target.value })} className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
                    </label>
                    <label className="text-sm font-medium text-zinc-700">
                      Calories
                      <input value={selectedHealthWorkout.calories ?? ""} onChange={(e) => updateSelectedHealthWorkout({ calories: e.target.value })} className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
                    </label>
                    <label className="text-sm font-medium text-zinc-700">
                      Avg HR
                      <input value={selectedHealthWorkout.avgHr ?? ""} onChange={(e) => updateSelectedHealthWorkout({ avgHr: e.target.value, hrSummary: { ...(selectedHealthWorkout.hrSummary ?? {}), avgHr: e.target.value } })} className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
                    </label>
                    <div className="flex flex-wrap gap-2 md:col-span-4">
                      <Button onClick={saveSelectedHealthWorkoutToSupabase} disabled={savingRemoteHealth}>{savingRemoteHealth ? "Saving..." : "Save to Supabase"}</Button>
                      <Button variant="outline" onClick={deleteSelectedHealthWorkout}>Remove locally</Button>
                      <Button variant="outline" onClick={deleteSelectedHealthWorkoutFromSupabase} disabled={savingRemoteHealth}>Delete from Supabase</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </details>
        )}

        <details className="rounded-2xl border border-sky-100 bg-white p-4" open>
          <summary className="cursor-pointer select-none text-sm font-semibold text-zinc-900">Cardio analytics</summary>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold text-zinc-800">Recent weekly cardio minutes</div>
                <div className="text-xs text-zinc-500">Best: {cardioAnalytics.bestWeek ? `${cardioAnalytics.bestWeek.minutes} min` : "—"}</div>
              </div>
              <div className="space-y-2">
                {recentWeeks.map((week) => (
                  <ProgressBar key={week.label} value={week.minutes} max={maxMinutes} label={week.label} rightLabel={`${roundOne(week.minutes)} min`} />
                ))}
              </div>
            </div>

            <CardioLineChart points={cardioAnalytics.hrTrend} valueKey="avgHr" label="Average heart rate" />

            <div className="rounded-2xl bg-white p-4">
              <div className="mb-3 text-sm font-semibold text-zinc-800">Workout type volume</div>
              {cardioAnalytics.typeBreakdown.length ? (
                <div className="space-y-2">
                  {cardioAnalytics.typeBreakdown.map((item) => (
                    <ProgressBar
                      key={item.type}
                      value={item.minutes}
                      max={Math.max(...cardioAnalytics.typeBreakdown.map((type) => type.minutes), 1)}
                      label={item.type}
                      rightLabel={`${roundOne(item.minutes)} min`}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-500">Sync or log cardio workouts to see type breakdown.</div>
              )}
            </div>

            <div className="rounded-2xl bg-white p-4">
              <div className="mb-3 text-sm font-semibold text-zinc-800">Data completeness</div>
              <div className="grid gap-2 text-sm md:grid-cols-2">
                <div className="rounded-xl bg-zinc-50 p-3"><span className="block text-xs text-zinc-500">Total logged sessions</span><span className="font-semibold">{cardioAnalytics.total.sessions}</span></div>
                <div className="rounded-xl bg-zinc-50 p-3"><span className="block text-xs text-zinc-500">Total minutes</span><span className="font-semibold">{roundOne(cardioAnalytics.total.minutes)}</span></div>
                <div className="rounded-xl bg-zinc-50 p-3"><span className="block text-xs text-zinc-500">With distance</span><span className="font-semibold">{cardioAnalytics.workoutsWithDistance}/{cardioAnalytics.syncedWorkouts.length}</span></div>
                <div className="rounded-xl bg-zinc-50 p-3"><span className="block text-xs text-zinc-500">With calories</span><span className="font-semibold">{cardioAnalytics.workoutsWithCalories}/{cardioAnalytics.syncedWorkouts.length}</span></div>
              </div>
            </div>
          </div>

          {!!entry.healthWorkouts?.length && (
            <details className="mt-4 rounded-2xl border border-sky-100 bg-sky-50 p-3">
              <summary className="cursor-pointer select-none text-sm font-semibold text-sky-900">Selected date heart-rate details</summary>
              <div className="mt-3 space-y-3">
                {entry.healthWorkouts.map((workout, index) => {
                  const summary = workout.hrSummary ?? {};
                  const zones = summary.zones ?? {};
                  return (
                    <div key={workout.id ?? index} className="rounded-xl bg-white p-3 text-sm">
                      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                        <div className="font-semibold text-zinc-900">{workout.sourceType || workout.type}</div>
                        <div className="text-xs text-zinc-500">
                          {workout.startTime ? new Date(workout.startTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : ""}
                          {workout.endTime ? ` – ${new Date(workout.endTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : ""}
                        </div>
                      </div>
                      <div className="mt-2 grid gap-2 text-xs md:grid-cols-5">
                        <div className="rounded-lg bg-zinc-50 p-2"><span className="block text-zinc-500">Duration</span><span className="font-semibold">{workout.duration || "—"} min</span></div>
                        <div className="rounded-lg bg-zinc-50 p-2"><span className="block text-zinc-500">Avg HR</span><span className="font-semibold">{summary.avgHr || workout.avgHr || "—"}</span></div>
                        <div className="rounded-lg bg-zinc-50 p-2"><span className="block text-zinc-500">Min HR</span><span className="font-semibold">{summary.minHr || "—"}</span></div>
                        <div className="rounded-lg bg-zinc-50 p-2"><span className="block text-zinc-500">Max HR</span><span className="font-semibold">{summary.maxHr || "—"}</span></div>
                        <div className="rounded-lg bg-zinc-50 p-2"><span className="block text-zinc-500">Samples</span><span className="font-semibold">{summary.sampleCount || 0}</span></div>
                      </div>
                      {!!summary.sampleCount && (
                        <div className="mt-2 grid gap-1 text-xs md:grid-cols-5">
                          {HR_ZONES.map((zone) => (
                            <div key={zone.name} className="rounded-lg bg-sky-50 px-2 py-1 text-sky-900">
                              {zone.name}: {roundOne(zones[zone.name] || 0)} min
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </details>
          )}
        </details>
      </div>
    </details>
  );
}
