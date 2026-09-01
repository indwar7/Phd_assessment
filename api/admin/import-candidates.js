import { sql, ensureSchema } from "../_lib/db.js";
import { json } from "../_lib/util.js";
import { requireAdmin } from "../_lib/adminAuth.js";
import { findDomainSlugBySchool } from "../_lib/seed.js";
import { slugifyName, randomPassword } from "../_lib/credentials.js";

// POST { candidates: [{ name, email, school }] }
// Creates a candidate per row with a generated unique login_id and password,
// tied to the domain whose `school` matches (case-insensitive). Returns the
// generated credentials so the admin can distribute them.
// Assumes domains/questions are already seeded (see /api/admin/seed-domains).
export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!requireAdmin(req)) return json(res, 401, { error: "Unauthorized" });

  await ensureSchema();

  const { candidates } = req.body || {};
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return json(res, 400, { error: "Provide a non-empty candidates array." });
  }

  const existingIds = new Set(
    (await sql`SELECT login_id FROM candidates`).map((r) => r.login_id)
  );

  const created = [];
  const skipped = [];

  for (const row of candidates) {
    const name = typeof row?.name === "string" ? row.name.trim() : "";
    const school = typeof row?.school === "string" ? row.school.trim() : "";
    const email = typeof row?.email === "string" ? row.email.trim().toLowerCase() : null;

    if (!name || !school) {
      skipped.push({ row, reason: "Missing name or school" });
      continue;
    }

    const domainRows = await sql`SELECT id FROM domains WHERE slug = ${findDomainSlugBySchool(school) || "__none__"}`;
    if (domainRows.length === 0) {
      skipped.push({ row, reason: `No domain found matching school "${school}"` });
      continue;
    }
    const domainId = domainRows[0].id;

    const base = slugifyName(name) || "candidate";
    let loginId = base;
    let suffix = 1;
    while (existingIds.has(loginId)) {
      suffix++;
      loginId = `${base}${suffix}`;
    }
    existingIds.add(loginId);

    const password = randomPassword();

    const inserted = await sql`
      INSERT INTO candidates (login_id, password, name, email, domain_id)
      VALUES (${loginId}, ${password}, ${name}, ${email}, ${domainId})
      RETURNING id
    `;

    created.push({
      id: inserted[0].id,
      name,
      email,
      school,
      loginId,
      password,
    });
  }

  json(res, 200, { created, skipped });
}
