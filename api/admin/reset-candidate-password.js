import { sql, ensureSchema } from "../_lib/db.js";
import { json } from "../_lib/util.js";
import { requireAdmin } from "../_lib/adminAuth.js";

// POST { loginId, password }
// Overwrites one candidate's password to the given value. For fixing a
// candidate who can't log in with the credentials they were issued.
export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!requireAdmin(req)) return json(res, 401, { error: "Unauthorized" });

  await ensureSchema();

  const { loginId, password } = req.body || {};
  if (typeof loginId !== "string" || typeof password !== "string" || !password) {
    return json(res, 400, { error: "loginId and password are required." });
  }

  const rows = await sql`
    UPDATE candidates
    SET password = ${password}
    WHERE login_id = ${loginId.trim().toLowerCase()}
    RETURNING id, login_id, name, started_at
  `;

  if (rows.length === 0) {
    return json(res, 404, { error: "No candidate with that login ID." });
  }

  json(res, 200, { candidate: rows[0] });
}
