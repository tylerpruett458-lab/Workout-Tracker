import { cors, verifySecret, userKey, readRequestBody, normalizePayloadToRows, normalizePayloadToHeartRateSamples, normalizePayloadToSupplementalMetricSamples, buildHeartRateUpdateForWorkout, buildSupplementalMetricUpdateForWorkout, supabaseRequest } from "./_health-utils.js";

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

    const heartRateSamples = normalizePayloadToHeartRateSamples(contentType, bodyText);
    const supplementalSamples = normalizePayloadToSupplementalMetricSamples(contentType, bodyText);

    const allSamples = [...heartRateSamples, ...supplementalSamples];
    if (!allSamples.length) {
      return res.status(200).json({ ok: true, imported: 0, updated: 0, message: "No workouts, timestamped heart-rate samples, distance samples, or active-energy samples found in payload." });
    }

    const minTime = Math.min(...allSamples.map((sample) => sample.timestamp));
    const maxTime = Math.max(...allSamples.map((sample) => sample.timestamp));
    const minIso = encodeURIComponent(new Date(minTime).toISOString());
    const maxIso = encodeURIComponent(new Date(maxTime).toISOString());
    const existingWorkouts = await supabaseRequest(
      `/rest/v1/health_workouts?user_key=eq.${encodeURIComponent(userKey())}&start_time=lte.${maxIso}&end_time=gte.${minIso}&select=*`,
      { method: "GET" }
    );

    let hrUpdated = 0;
    let metricUpdated = 0;
    const updatedWorkouts = [];

    for (const workout of existingWorkouts ?? []) {
      const hrPatch = heartRateSamples.length ? buildHeartRateUpdateForWorkout(workout, heartRateSamples) : null;
      const metricPatch = supplementalSamples.length ? buildSupplementalMetricUpdateForWorkout(workout, supplementalSamples) : null;
      const patch = { ...(hrPatch ?? {}), ...(metricPatch ?? {}) };
      if (!Object.keys(patch).length) continue;

      const result = await supabaseRequest(`/rest/v1/health_workouts?id=eq.${encodeURIComponent(workout.id)}`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(patch)
      });
      if (Array.isArray(result) && result[0]) updatedWorkouts.push(result[0]);
      if (hrPatch) hrUpdated += 1;
      if (metricPatch) metricUpdated += 1;
    }

    const updated = new Set(updatedWorkouts.map((workout) => workout.id)).size || Math.max(hrUpdated, metricUpdated);
    return res.status(200).json({
      ok: true,
      imported: 0,
      updated,
      hrUpdated,
      metricUpdated,
      heartRateSamples: heartRateSamples.length,
      supplementalSamples: supplementalSamples.length,
      message: updated
        ? `Mapped ${heartRateSamples.length} heart-rate sample${heartRateSamples.length === 1 ? "" : "s"} and ${supplementalSamples.length} distance/energy sample${supplementalSamples.length === 1 ? "" : "s"} to existing workout rows.`
        : "Metric samples received, but no existing workouts overlapped their timestamps. Import workouts first or use a metric date range that overlaps workout start/end times.",
      workouts: updatedWorkouts
    });
  } catch (error) {
    console.error("health-import failed", error);
    return res.status(500).json({ error: error.message || "Health import failed." });
  }
}
