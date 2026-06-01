const { cors, verifySecret, readRequestBody, normalizePayloadToRows, supabaseRequest } = require("./_health-utils");

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST." });
  if (!verifySecret(req)) return res.status(401).json({ error: "Unauthorized." });

  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: "Missing Supabase environment variables." });
    }
    const contentType = String(req.headers["content-type"] || "application/json").toLowerCase();
    const text = await readRequestBody(req);
    const rows = normalizePayloadToRows(contentType, text);
    if (!rows.length) return res.status(400).json({ error: "No usable workout rows found." });

    const data = await supabaseRequest("/rest/v1/health_workouts?on_conflict=user_key,external_id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(rows)
    });

    return res.status(200).json({ ok: true, imported: Array.isArray(data) ? data.length : rows.length, rows: data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message || "Health import failed." });
  }
};
