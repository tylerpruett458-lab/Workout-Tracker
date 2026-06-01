import { cors, verifySecret, userKey, readRequestBody, normalizePayloadToRows, normalizePayloadToHeartRateSamples, buildHeartRateUpdateForWorkout, supabaseRequest } from "./_health-utils.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST." });
  if (!verifySecret(req)) return res.status(401).json({ error: "Unauthorized." });

  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: "Missing Supabase environment variables." });
    }

    const bodyText = await readRequestBody(req);
    const contentType = String(req.headers["content-type"] || "application/json").toLowerCase();
    const workouts = normalizePayloadToRows(contentType, bodyText);

    if (workouts.length) {
      const data = await supabaseRequest("/rest/v1/health_workouts?on_conflict=user_key,external_id", {
        method: "POST",
        headers: {
          Prefer: "resolution=merge-duplicates,return=representation"
        },
        body: JSON.stringify(workouts)
      });

      return res.status(200).json({ ok: true, imported: Array.isArray(data) ? data.length : workouts.length, updated: 0, workouts: data || [] });
    }

    const samples = normalizePayloadToHeartRateSamples(contentType, bodyText);
    if (!samples.length) {
      return res.status(200).json({ ok: true, imported: 0, updated: 0, message: "No workouts or timestamped heart-rate samples found in payload." });
    }

    const minTime = Math.min(...samples.map((sample) => sample.timestamp));
    const maxTime = Math.max(...samples.map((sample) => sample.timestamp));
    const minIso = encodeURIComponent(new Date(minTime).toISOString());
    const maxIso = encodeURIComponent(new Date(maxTime).toISOString());
    const existingWorkouts = await supabaseRequest(
      `/rest/v1/health_workouts?user_key=eq.${encodeURIComponent(userKey())}&start_time=lte.${maxIso}&end_time=gte.${minIso}&select=*`,
      { method: "GET" }
    );

    let updated = 0;
    const updatedWorkouts = [];
    for (const workout of existingWorkouts ?? []) {
      const patch = buildHeartRateUpdateForWorkout(workout, samples);
      if (!patch) continue;
      const result = await supabaseRequest(`/rest/v1/health_workouts?id=eq.${encodeURIComponent(workout.id)}`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(patch)
      });
      if (Array.isArray(result) && result[0]) updatedWorkouts.push(result[0]);
      updated += 1;
    }

    return res.status(200).json({
      ok: true,
      imported: 0,
      updated,
      samples: samples.length,
      message: updated
        ? `Mapped ${samples.length} heart-rate samples to ${updated} existing workout${updated === 1 ? "" : "s"}.`
        : "Heart-rate samples received, but no existing workouts overlapped their timestamps. Import workouts first or expand the workout export date range.",
      workouts: updatedWorkouts
    });
  } catch (error) {
    console.error("health-import failed", error);
    return res.status(500).json({ error: error.message || "Health import failed." });
  }
}
