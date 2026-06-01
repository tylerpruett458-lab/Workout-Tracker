const HR_ZONES = [
  { name: "Zone 1", min: 0, max: 119 },
  { name: "Zone 2", min: 120, max: 139 },
  { name: "Zone 3", min: 140, max: 159 },
  { name: "Zone 4", min: 160, max: 179 },
  { name: "Zone 5", min: 180, max: Infinity }
];

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

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-health-secret");
}

function verifySecret(req) {
  const expected = process.env.HEALTH_IMPORT_SECRET;
  const provided = req.headers["x-health-secret"] || req.query?.secret || req.body?.secret;
  return Boolean(expected && provided && String(provided) === String(expected));
}

function userKey() {
  return process.env.HEALTH_USER_KEY || "default";
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

function toNumber(value) {
  const number = parseFloat(String(value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(number) ? number : 0;
}

function roundOne(value) {
  return Math.round(Number(value || 0) * 10) / 10;
}

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
  return Number.isNaN(parsed.getTime()) ? "" : dateKey(parsed);
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
  return null;
}

function dateFromDateTime(value) {
  const parsed = parseHealthDateTime(value);
  if (parsed) return dateKey(parsed);
  return parseHealthDate(value);
}

function getDurationMinutes(row) {
  const durationSeconds = getField(row, DURATION_SECONDS_FIELDS);
  if (durationSeconds) return roundOne(toNumber(durationSeconds) / 60);

  const rawDuration = getField(row, DURATION_FIELDS);
  const rawNumber = toNumber(rawDuration);
  if (!rawNumber) return 0;

  const durationText = String(rawDuration ?? "").toLowerCase();
  if (durationText.includes("sec")) return roundOne(rawNumber / 60);
  if (durationText.includes("hour") || durationText.includes(" hr") || durationText.endsWith("hr")) return roundOne(rawNumber * 60);
  if (durationText.includes("min")) return roundOne(rawNumber);

  // Health Auto Export workout JSON can send duration as seconds under a generic
  // "duration" field. Treat unrealistically large minute values as seconds.
  // Example: 7583.5 means 7,583.5 seconds = 126.4 minutes, not 7,583.5 minutes.
  if (rawNumber > 360) return roundOne(rawNumber / 60);

  return roundOne(rawNumber);
}

function isHeartRateRow(row) {
  const typeText = String(getField(row, RECORD_TYPE_FIELDS) ?? "").toLowerCase();
  const hasHrValue = Boolean(getField(row, SAMPLE_VALUE_FIELDS)) || Boolean(getField(row, HR_FIELDS));
  const hasTime = Boolean(getField(row, SAMPLE_TIME_FIELDS));
  return hasTime && hasHrValue && (typeText.includes("heart") || typeText.includes("hr") || !getField(row, DURATION_FIELDS));
}

function normalizeHeartRateSamples(rows) {
  return rows
    .filter(isHeartRateRow)
    .map((row) => {
      const parsed = parseHealthDateTime(getField(row, SAMPLE_TIME_FIELDS));
      const bpm = toNumber(getField(row, SAMPLE_VALUE_FIELDS) || getField(row, HR_FIELDS));
      return parsed && bpm ? { timestamp: parsed.getTime(), time: parsed.toISOString(), bpm } : null;
    })
    .filter(Boolean);
}

function calculateHrStats(samples = [], durationMinutes = 0) {
  const valid = samples
    .map((sample) => ({ ...sample, bpm: toNumber(sample.bpm), timestamp: Number(sample.timestamp) }))
    .filter((sample) => sample.bpm > 0 && Number.isFinite(sample.timestamp))
    .sort((a, b) => a.timestamp - b.timestamp);
  if (!valid.length) return { avgHr: null, minHr: null, maxHr: null, zones: {} };
  const avgHr = roundOne(valid.reduce((sum, sample) => sum + sample.bpm, 0) / valid.length);
  const minHr = Math.min(...valid.map((sample) => sample.bpm));
  const maxHr = Math.max(...valid.map((sample) => sample.bpm));
  const zones = {};
  HR_ZONES.forEach((zone) => { zones[zone.name] = 0; });
  for (let i = 0; i < valid.length; i += 1) {
    const current = valid[i];
    const next = valid[i + 1];
    const fallbackMinutes = durationMinutes ? durationMinutes / valid.length : 0;
    const minutes = next ? Math.max(0, Math.min(5, (next.timestamp - current.timestamp) / 60000)) : fallbackMinutes;
    const zone = HR_ZONES.find((item) => current.bpm >= item.min && current.bpm <= item.max);
    if (zone) zones[zone.name] = roundOne((zones[zone.name] ?? 0) + minutes);
  }
  return { avgHr, minHr, maxHr, zones };
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

function normalizeHealthWorkout(row) {
  const startRaw = getField(row, START_FIELDS) || getField(row, DATE_FIELDS);
  const start = parseHealthDateTime(startRaw);
  const date = start ? dateKey(start) : parseHealthDate(startRaw);
  if (!date) return null;
  const duration = getDurationMinutes(row);
  if (!duration) return null;
  const end = parseHealthDateTime(getField(row, END_FIELDS)) || (start ? new Date(start.getTime() + duration * 60000) : null);
  const rawType = getField(row, TYPE_FIELDS);
  const calories = roundOne(toNumber(getField(row, CALORIE_FIELDS))) || null;
  const distance = roundOne(toNumber(getField(row, DISTANCE_FIELDS))) || null;
  const avgHr = roundOne(toNumber(getField(row, HR_FIELDS))) || null;
  return {
    external_id: `${date}-${String(rawType || "workout").replace(/[^a-z0-9]+/gi, "-")}-${start ? start.getTime() : Math.random().toString(36).slice(2)}`,
    workout_date: date,
    start_time: start ? start.toISOString() : null,
    end_time: end ? end.toISOString() : null,
    workout_type: rawType || mapWorkoutType(rawType),
    duration_minutes: duration,
    distance,
    calories,
    avg_hr: avgHr,
    min_hr: null,
    max_hr: null,
    hr_samples: [],
    hr_zones: {},
    raw_payload: row
  };
}

function parseCsv(text) {
  const rows = [];
  let current = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && next === '"' && inQuotes) { cell += '"'; i += 1; }
    else if (char === '"') inQuotes = !inQuotes;
    else if (char === "," && !inQuotes) { current.push(cell); cell = ""; }
    else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      current.push(cell);
      if (current.some((value) => String(value).trim() !== "")) rows.push(current);
      current = []; cell = "";
    } else cell += char;
  }
  current.push(cell);
  if (current.some((value) => String(value).trim() !== "")) rows.push(current);
  if (rows.length < 2) return [];
  const headers = rows[0].map((header) => String(header).trim());
  return rows.slice(1).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
}

async function readRequestBody(req) {
  if (req.body) return typeof req.body === "string" ? req.body : JSON.stringify(req.body);
  return await new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => { data += chunk; });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function extractHealthData(parsed) {
  if (Array.isArray(parsed)) return { workouts: parsed, heartRateRows: parsed };
  return {
    workouts: parsed?.workouts ?? parsed?.data?.workouts ?? parsed?.records ?? parsed?.data ?? parsed?.samples ?? [],
    heartRateRows: parsed?.heartRate ?? parsed?.heartRates ?? parsed?.heart_rate ?? parsed?.heartRateSamples ?? parsed?.data?.heartRate ?? parsed?.records ?? parsed?.samples ?? parsed?.data ?? []
  };
}

function normalizePayloadToRows(contentType, text) {
  let rows = [];
  let heartRateRows = [];
  if (contentType.includes("json")) {
    const parsed = JSON.parse(text || "{}");
    const healthData = extractHealthData(parsed);
    rows = Array.isArray(healthData.workouts) ? healthData.workouts : [];
    heartRateRows = Array.isArray(healthData.heartRateRows) ? healthData.heartRateRows : rows;
  } else {
    rows = parseCsv(text || "");
    heartRateRows = rows;
  }
  const workouts = rows.filter((row) => !isHeartRateRow(row)).map(normalizeHealthWorkout).filter(Boolean);
  const samples = normalizeHeartRateSamples(heartRateRows);
  return workouts.map((workout) => {
    const start = workout.start_time ? new Date(workout.start_time).getTime() : null;
    const end = workout.end_time ? new Date(workout.end_time).getTime() : null;
    const matched = start && end ? samples.filter((sample) => sample.timestamp >= start && sample.timestamp <= end) : [];
    const hr = matched.length ? calculateHrStats(matched, workout.duration_minutes) : {};
    return {
      ...workout,
      user_key: userKey(),
      source: "health_auto_export",
      avg_hr: hr.avgHr || workout.avg_hr,
      min_hr: hr.minHr || workout.min_hr,
      max_hr: hr.maxHr || workout.max_hr,
      hr_samples: matched,
      hr_zones: hr.zones || workout.hr_zones
    };
  });
}

async function supabaseRequest(path, options = {}) {
  const url = `${process.env.SUPABASE_URL}${path}`;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const response = await fetch(url, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) {
    const message = typeof data === "string" ? data : data?.message || data?.error || "Supabase request failed";
    throw new Error(message);
  }
  return data;
}

export { cors, verifySecret, userKey, readRequestBody, normalizePayloadToRows, supabaseRequest };
