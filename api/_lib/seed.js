import { sql, ensureSchema } from "./db.js";
import domainsData from "./domains-data.json" with { type: "json" };

export async function seedDomains() {
  await ensureSchema();

  for (const domain of domainsData.domains) {
    const existing = await sql`SELECT id FROM domains WHERE slug = ${domain.slug}`;
    let domainId = existing[0]?.id;
    const durationSeconds = domain.durationMinutes * 60;

    if (!domainId) {
      const inserted = await sql`
        INSERT INTO domains (slug, title, duration_seconds)
        VALUES (${domain.slug}, ${domain.title}, ${durationSeconds})
        RETURNING id
      `;
      domainId = inserted[0].id;
    } else {
      await sql`
        UPDATE domains SET title = ${domain.title}, duration_seconds = ${durationSeconds}
        WHERE id = ${domainId}
      `;
      await sql`DELETE FROM questions WHERE domain_id = ${domainId}`;
    }

    const positions = domain.questions.map((_, i) => i);
    const tags = domain.questions.map((q) => q.tag);
    const texts = domain.questions.map((q) => q.text);
    const options = domain.questions.map((q) => JSON.stringify(q.options));
    const corrects = domain.questions.map((q) => q.correct);
    const domainIds = domain.questions.map(() => domainId);

    await sql`
      INSERT INTO questions (domain_id, position, tag, text, options, correct_index)
      SELECT * FROM UNNEST(
        ${domainIds}::int[],
        ${positions}::int[],
        ${tags}::text[],
        ${texts}::text[],
        ${options}::jsonb[],
        ${corrects}::int[]
      )
    `;
  }
}

export function findDomainSlugBySchool(school) {
  const normalized = school.trim().toLowerCase();
  const match = domainsData.domains.find((d) => d.school.trim().toLowerCase() === normalized);
  return match?.slug || null;
}

export function listSchools() {
  return domainsData.domains.map((d) => ({ slug: d.slug, school: d.school, title: d.title }));
}
