const { cors, verifySecret, userKey, supabaseRequest } = require("./_health-utils");

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Use GET." });
  if (!verifySecret(req)) return res.status(401).json({ error: "Unauthorized." });

  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: "Missing Supabase environment variables." });
    }
    const key = encodeURIComponent(userKey());
    const data = await supabaseRequest(`/rest/v1/health_workouts?user_key=eq.${key}&order=start_time.desc&limit=1000`, { method: "GET" });
    return res.status(200).json({ ok: true, workouts: data || [] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message || "Health sync failed." });
  }
};
