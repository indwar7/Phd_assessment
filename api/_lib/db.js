import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL);

let schemaReady;

export function ensureSchema() {
  if (!schemaReady) {
    schemaReady = sql`
      CREATE TABLE IF NOT EXISTS domains (
        id SERIAL PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        duration_seconds INTEGER NOT NULL DEFAULT 900,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `
      .then(
        () => sql`
          CREATE TABLE IF NOT EXISTS questions (
            id SERIAL PRIMARY KEY,
            domain_id INTEGER NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
            position INTEGER NOT NULL,
            tag TEXT,
            text TEXT NOT NULL,
            options JSONB NOT NULL,
            correct_index INTEGER NOT NULL
          )
        `
      )
      .then(
        () => sql`
          CREATE TABLE IF NOT EXISTS candidates (
            id SERIAL PRIMARY KEY,
            login_id TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            domain_id INTEGER NOT NULL REFERENCES domains(id) ON DELETE RESTRICT,
            started_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
          )
        `
      )
      .then(
        () => sql`ALTER TABLE candidates ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ`
      )
      .then(
        () => sql`
          CREATE TABLE IF NOT EXISTS attempts (
            id SERIAL PRIMARY KEY,
            candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
            domain_id INTEGER NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
            answers JSONB NOT NULL,
            score INTEGER NOT NULL,
            total INTEGER NOT NULL,
            attempted_count INTEGER NOT NULL,
            correct_count INTEGER NOT NULL,
            wrong_count INTEGER NOT NULL,
            not_attempted_count INTEGER NOT NULL,
            time_used_seconds INTEGER NOT NULL,
            timed_out BOOLEAN NOT NULL DEFAULT false,
            started_at TIMESTAMPTZ NOT NULL,
            submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
          )
        `
      )
      .then(
        () => sql`CREATE INDEX IF NOT EXISTS idx_questions_domain ON questions(domain_id, position)`
      )
      .then(
        () => sql`CREATE INDEX IF NOT EXISTS idx_attempts_candidate ON attempts(candidate_id)`
      )
      .then(
        () => sql`CREATE INDEX IF NOT EXISTS idx_candidates_domain ON candidates(domain_id)`
      );
  }
  return schemaReady;
}
