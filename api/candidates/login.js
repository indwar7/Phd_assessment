import crypto from "node:crypto";
import { sql, ensureSchema } from "../_lib/db.js";
import { json } from "../_lib/util.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  await ensureSchema();

  const { loginId, password } = req.body || {};
  if (typeof loginId !== "string" || typeof password !== "string") {
    return json(res, 400, { error: "Login ID and password are required." });
  }

  const rows = await sql`
    SELECT c.id, c.login_id, c.name, c.password, c.started_at, d.slug AS domain_slug, d.title AS domain_title
    FROM candidates c
    JOIN domains d ON d.id = c.domain_id
    WHERE c.login_id = ${loginId.trim().toLowerCase()}
  `;

  if (rows.length === 0) {
    return json(res, 401, { error: "Incorrect login ID or password." });
  }

  const candidate = rows[0];
  const given = Buffer.from(password);
  const expected = Buffer.from(candidate.password);
  const match = given.length === expected.length && crypto.timingSafeEqual(given, expected);

  if (!match) {
    return json(res, 401, { error: "Incorrect login ID or password." });
  }

  if (candidate.started_at !== null) {
    return json(res, 403, { error: "This login has already been used to start an assessment." });
  }

  json(res, 200, {
    candidate: {
      id: candidate.id,
      name: candidate.name,
      loginId: candidate.login_id,
      domainSlug: candidate.domain_slug,
      domainTitle: candidate.domain_title,
    },
  });
}
