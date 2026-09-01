import crypto from "node:crypto";

const PASSWORD_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

export function slugifyName(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z\s]/g, "")
    .trim()
    .split(/\s+/)
    .join("");
}

export function randomPassword(length = 8) {
  let out = "";
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    out += PASSWORD_ALPHABET[bytes[i] % PASSWORD_ALPHABET.length];
  }
  return out;
}
