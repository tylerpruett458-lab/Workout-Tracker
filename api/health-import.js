import { cors, verifySecret, readRequestBody, normalizePayloadToRows, supabaseRequest } from "./_health-utils.js";

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

    if (!workouts.length) {
      return res.status(200).json({ ok: true, imported: 0, message: "No workouts found in payload." });
    }

    const data = await supabaseRequest("/rest/v1/health_workouts?on_conflict=user_key,external_id", {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation"
      },
      body: JSON.stringify(workouts)
    });

    return res.status(200).json({ ok: true, imported: Array.isArray(data) ? data.length : workouts.length, workouts: data || [] });
  } catch (error) {
    console.error("health-import failed", error);
    return res.status(500).json({ error: error.message || "Health import failed." });
  }
}
