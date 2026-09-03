import { sql, ensureSchema } from "../_lib/db.js";
import { json } from "../_lib/util.js";
import { getTestStartAt } from "../_lib/testWindow.js";

// Called once when a candidate clicks "Begin assessment". Atomically marks
// the login as started so it can never be reused to get a fresh timer,
// whether or not the candidate goes on to submit.
export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  const startAt = getTestStartAt();
  if (Date.now() < startAt.getTime()) {
    return json(res, 403, {
      error: "The assessment has not started yet.",
      testStartsAt: startAt.toISOString(),
    });
  }

  await ensureSchema();

  const { candidateId } = req.body || {};
  if (!Number.isInteger(candidateId)) {
    return json(res, 400, { error: "Missing candidateId." });
  }

  const rows = await sql`
    UPDATE candidates
    SET started_at = now()
    WHERE id = ${candidateId} AND started_at IS NULL
    RETURNING started_at
  `;

  if (rows.length === 0) {
    return json(res, 403, { error: "This login has already been used to start an assessment." });
  }

  json(res, 200, { startedAt: rows[0].started_at });
}
