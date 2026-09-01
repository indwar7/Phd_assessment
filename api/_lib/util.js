export function json(res, status, body) {
  res.status(status).setHeader("content-type", "application/json");
  res.send(JSON.stringify(body));
}

export function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
