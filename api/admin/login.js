import crypto from "node:crypto";
import { json } from "../_lib/util.js";
import { signToken } from "../_lib/adminAuth.js";

function timingSafeStringEqual(a, b) {
  const given = Buffer.from(a);
  const expected = Buffer.from(b);
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  const configuredId = process.env.ADMIN_LOGIN_ID;
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredId || !configuredPassword) {
    return json(res, 500, { error: "Admin credentials not configured" });
  }

  const { loginId, password } = req.body || {};
  const idMatch = timingSafeStringEqual(typeof loginId === "string" ? loginId.trim() : "", configuredId);
  const passwordMatch = timingSafeStringEqual(typeof password === "string" ? password : "", configuredPassword);

  if (!idMatch || !passwordMatch) {
    return json(res, 401, { error: "Incorrect login ID or password" });
  }

  json(res, 200, { token: signToken() });
}
