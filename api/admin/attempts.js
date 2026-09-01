import { sql, ensureSchema } from "../_lib/db.js";
import { json } from "../_lib/util.js";
import { requireAdmin } from "../_lib/adminAuth.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });
  if (!requireAdmin(req)) return json(res, 401, { error: "Unauthorized" });

  await ensureSchema();

  const rows = await sql`
    SELECT
      c.id AS candidate_id, c.login_id, c.name, c.email, c.phone,
      d.slug AS domain_slug, d.title AS domain_title,
      a.id AS attempt_id, a.score, a.total, a.attempted_count,
      a.correct_count, a.wrong_count, a.not_attempted_count,
      a.time_used_seconds, a.timed_out, a.started_at, a.submitted_at
    FROM candidates c
    JOIN domains d ON d.id = c.domain_id
    LEFT JOIN attempts a ON a.candidate_id = c.id
    ORDER BY a.submitted_at DESC NULLS LAST, c.name ASC
  `;

  json(res, 200, {
    attempts: rows.map((r) => ({
      candidate: {
        id: r.candidate_id,
        loginId: r.login_id,
        name: r.name,
        email: r.email,
        phone: r.phone,
      },
      domain: { slug: r.domain_slug, title: r.domain_title },
      hasSubmitted: r.attempt_id !== null,
      attemptId: r.attempt_id,
      score: r.score,
      total: r.total,
      attemptedCount: r.attempted_count,
      correctCount: r.correct_count,
      wrongCount: r.wrong_count,
      notAttemptedCount: r.not_attempted_count,
      timeUsedSeconds: r.time_used_seconds,
      timedOut: r.timed_out,
      startedAt: r.started_at,
      submittedAt: r.submitted_at,
    })),
  });
}
