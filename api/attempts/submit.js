import { sql, ensureSchema } from "../_lib/db.js";
import { json } from "../_lib/util.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  await ensureSchema();

  const { candidateId, answers, timeUsedSeconds, timedOut } = req.body || {};

  if (!Number.isInteger(candidateId)) {
    return json(res, 400, { error: "Missing candidateId." });
  }
  if (!Array.isArray(answers)) {
    return json(res, 400, { error: "Missing answers." });
  }

  const candidateRows = await sql`SELECT id, domain_id, started_at FROM candidates WHERE id = ${candidateId}`;
  if (candidateRows.length === 0) return json(res, 404, { error: "Candidate not found" });
  const domainId = candidateRows[0].domain_id;
  const startedAt = candidateRows[0].started_at || new Date().toISOString();

  const questions = await sql`
    SELECT id, position, correct_index
    FROM questions
    WHERE domain_id = ${domainId}
    ORDER BY position ASC
  `;

  let correctCount = 0;
  let wrongCount = 0;
  let notAttemptedCount = 0;

  for (let i = 0; i < questions.length; i++) {
    const given = answers[i];
    if (given === null || given === undefined) {
      notAttemptedCount++;
    } else if (given === questions[i].correct_index) {
      correctCount++;
    } else {
      wrongCount++;
    }
  }

  const attemptedCount = correctCount + wrongCount;
  const safeTimeUsed = Number.isFinite(timeUsedSeconds) ? Math.max(0, Math.round(timeUsedSeconds)) : 0;

  const inserted = await sql`
    INSERT INTO attempts (
      candidate_id, domain_id, answers, score, total, attempted_count,
      correct_count, wrong_count, not_attempted_count,
      time_used_seconds, timed_out, started_at
    )
    VALUES (
      ${candidateId}, ${domainId}, ${JSON.stringify(answers)}, ${correctCount}, ${questions.length},
      ${attemptedCount}, ${correctCount}, ${wrongCount}, ${notAttemptedCount},
      ${safeTimeUsed}, ${Boolean(timedOut)}, ${startedAt}
    )
    RETURNING id
  `;

  json(res, 200, {
    attemptId: inserted[0].id,
    score: correctCount,
    total: questions.length,
    attempted: attemptedCount,
    correct: correctCount,
    wrong: wrongCount,
    notAttempted: notAttemptedCount,
  });
}
