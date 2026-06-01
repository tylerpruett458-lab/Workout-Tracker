import { cors, verifySecret, userKey, readRequestBody, supabaseRequest } from "./_health-utils.js";

function toNumberOrNull(value) {
  if (value === "" || value === undefined || value === null) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function mapClientWorkoutToRow(workout = {}) {
  const row = {
    workout_date: workout.date || null,
    start_time: workout.startTime || null,
    end_time: workout.endTime || null,
    workout_type: workout.sourceType || workout.type || "Apple Health workout",
    duration_minutes: toNumberOrNull(workout.duration),
    distance: toNumberOrNull(workout.distance),
    calories: toNumberOrNull(workout.calories),
    avg_hr: toNumberOrNull(workout.avgHr),
    min_hr: toNumberOrNull(workout.hrSummary?.minHr),
    max_hr: toNumberOrNull(workout.hrSummary?.maxHr),
    hr_samples: Array.isArray(workout.heartRateSamples) ? workout.heartRateSamples : [],
    hr_zones: workout.hrSummary?.zones && typeof workout.hrSummary.zones === "object" ? workout.hrSummary.zones : {},
    raw_payload: {
      ...(workout.rawPayload && typeof workout.rawPayload === "object" ? workout.rawPayload : {}),
      trackerEditedAt: new Date().toISOString(),
      trackerDisplayType: workout.type || null,
      trackerSourceType: workout.sourceType || null
    }
  };

  Object.keys(row).forEach((key) => {
    if (row[key] === undefined) delete row[key];
  });
  return row;
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (!["PATCH", "DELETE"].includes(req.method)) return res.status(405).json({ error: "Use PATCH or DELETE." });
  if (!verifySecret(req)) return res.status(401).json({ error: "Unauthorized." });

  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: "Missing Supabase environment variables." });
    }

    const bodyText = await readRequestBody(req);
    const body = bodyText ? JSON.parse(bodyText) : {};
    const externalId = body.external_id || body.externalId || body.id;
    if (!externalId) return res.status(400).json({ error: "Missing workout external_id." });

    const key = encodeURIComponent(userKey());
    const id = encodeURIComponent(externalId);
    const path = `/rest/v1/health_workouts?user_key=eq.${key}&external_id=eq.${id}`;

    if (req.method === "DELETE") {
      await supabaseRequest(path, {
        method: "DELETE",
        headers: { Prefer: "return=minimal" }
      });
      return res.status(200).json({ ok: true, deleted: true, external_id: externalId });
    }

    const row = mapClientWorkoutToRow(body.workout || body);
    const data = await supabaseRequest(path, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(row)
    });

    return res.status(200).json({ ok: true, updated: Array.isArray(data) ? data.length : 0, workout: Array.isArray(data) ? data[0] : null });
  } catch (error) {
    console.error("health-workout failed", error);
    return res.status(500).json({ error: error.message || "Health workout update failed." });
  }
}
