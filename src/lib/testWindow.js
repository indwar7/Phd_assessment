const IST_OFFSET_MINUTES = 5 * 60 + 30;

// Mirrors api/_lib/testWindow.js: today at 15:00 IST, unless overridden via
// VITE_TEST_START_AT (ISO string) at build time.
export function getTestStartAt() {
  const override = import.meta.env.VITE_TEST_START_AT;
  if (override) {
    const parsed = new Date(override);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  const nowIst = new Date(Date.now() + IST_OFFSET_MINUTES * 60 * 1000);
  const y = nowIst.getUTCFullYear();
  const m = nowIst.getUTCMonth();
  const d = nowIst.getUTCDate();
  return new Date(Date.UTC(y, m, d, 9, 30, 0));
}

export function formatCountdown(msRemaining) {
  const totalSeconds = Math.max(0, Math.floor(msRemaining / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n) => (n < 10 ? "0" + n : String(n));
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
