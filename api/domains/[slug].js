import { sql, ensureSchema } from "../_lib/db.js";
import { json } from "../_lib/util.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  await ensureSchema();
  const { slug } = req.query;

  const rows = await sql`SELECT id, slug, title, duration_seconds FROM domains WHERE slug = ${slug}`;
  if (rows.length === 0) return json(res, 404, { error: "Domain not found" });

  const domain = rows[0];
  const questions = await sql`
    SELECT id, position, tag, text, options
    FROM questions
    WHERE domain_id = ${domain.id}
    ORDER BY position ASC
  `;

  json(res, 200, {
    domain: {
      slug: domain.slug,
      title: domain.title,
      durationSeconds: domain.duration_seconds,
    },
    questions: questions.map((q) => ({
      id: q.id,
      position: q.position,
      tag: q.tag,
      text: q.text,
      options: q.options,
    })),
  });
}
