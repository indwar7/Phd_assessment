import crypto from "node:crypto";

function getSecret() {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error("ADMIN_PASSWORD is not configured");
  return secret;
}

export function signToken() {
  const expires = Date.now() + 1000 * 60 * 60 * 12; // 12 hours
  const payload = `${expires}`;
  const sig = crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyToken(token) {
  if (typeof token !== "string" || !token.includes(".")) return false;
  const [payload, sig] = token.split(".");
  const expected = crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
  const sigBuf = Buffer.from(sig || "", "hex");
  const expectedBuf = Buffer.from(expected, "hex");
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return false;
  }
  return Number(payload) > Date.now();
}

export function requireAdmin(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  return verifyToken(token);
}
