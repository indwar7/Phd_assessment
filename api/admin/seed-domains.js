import { json } from "../_lib/util.js";
import { requireAdmin } from "../_lib/adminAuth.js";
import { seedDomains } from "../_lib/seed.js";

// One-time (idempotent) load of the 5 domain question banks into the DB.
export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!requireAdmin(req)) return json(res, 401, { error: "Unauthorized" });

  await seedDomains();
  json(res, 200, { ok: true });
}
