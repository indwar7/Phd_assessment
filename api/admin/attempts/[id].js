import { sql, ensureSchema } from "../../_lib/db.js";
import { json } from "../../_lib/util.js";
import { requireAdmin } from "../../_lib/adminAuth.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });
  if (!requireAdmin(req)) return json(res, 401, { error: "Unauthorized" });

  await ensureSchema();
  const { id } = req.query;

  const attemptRows = await sql`
    SELECT a.id, a.answers, a.score, a.total, a.time_used_seconds, a.timed_out,
           a.started_at, a.submitted_at, a.domain_id,
           a.correct_count, a.wrong_count, a.not_attempted_count,
           c.login_id, c.name, c.email, c.phone
    FROM attempts a
    JOIN candidates c ON c.id = a.candidate_id
    WHERE a.id = ${id}
  `;
  if (attemptRows.length === 0) return json(res, 404, { error: "Attempt not found" });
  const attempt = attemptRows[0];

  const questions = await sql`
    SELECT position, tag, text, options, correct_index
    FROM questions
    WHERE domain_id = ${attempt.domain_id}
    ORDER BY position ASC
  `;

  const answers = attempt.answers;
  const review = questions.map((q, i) => ({
    position: q.position,
    tag: q.tag,
    text: q.text,
    options: q.options,
    correctIndex: q.correct_index,
    givenIndex: answers[i] ?? null,
    isCorrect: answers[i] === q.correct_index,
  }));

  json(res, 200, {
    candidate: { loginId: attempt.login_id, name: attempt.name, email: attempt.email, phone: attempt.phone },
    score: attempt.score,
    total: attempt.total,
    correctCount: attempt.correct_count,
    wrongCount: attempt.wrong_count,
    notAttemptedCount: attempt.not_attempted_count,
    timeUsedSeconds: attempt.time_used_seconds,
    timedOut: attempt.timed_out,
    startedAt: attempt.started_at,
    submittedAt: attempt.submitted_at,
    review,
  });
}
