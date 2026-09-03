import { sql, ensureSchema } from "../_lib/db.js";
import { json } from "../_lib/util.js";
import { requireAdmin } from "../_lib/adminAuth.js";
import { randomPassword } from "../_lib/credentials.js";

// POST { loginId }
// Clears a candidate's started_at so they can log in and attempt again.
// Refuses if an attempt was already submitted for them, to avoid masking
// a real completed attempt. Also issues a fresh random password.
export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!requireAdmin(req)) return json(res, 401, { error: "Unauthorized" });

  await ensureSchema();

  const { loginId } = req.body || {};
  if (typeof loginId !== "string" || !loginId.trim()) {
    return json(res, 400, { error: "loginId is required." });
  }

  const candidateRows = await sql`
    SELECT id FROM candidates WHERE login_id = ${loginId.trim().toLowerCase()}
  `;
  if (candidateRows.length === 0) {
    return json(res, 404, { error: "No candidate with that login ID." });
  }
  const candidateId = candidateRows[0].id;

  const attemptRows = await sql`
    SELECT id FROM attempts WHERE candidate_id = ${candidateId}
  `;
  if (attemptRows.length > 0) {
    return json(res, 409, { error: "This candidate already has a submitted attempt. Refusing to unlock." });
  }

  const password = randomPassword();
  const rows = await sql`
    UPDATE candidates
    SET started_at = NULL, password = ${password}
    WHERE id = ${candidateId}
    RETURNING id, login_id, name
  `;

  json(res, 200, { candidate: rows[0], password });
}
