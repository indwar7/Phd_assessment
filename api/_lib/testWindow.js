const IST_OFFSET_MINUTES = 5 * 60 + 30;

// Today's date, evaluated in IST, at 15:00 IST — used when no explicit
// TEST_START_AT override is configured.
function defaultTestStartAt() {
  const nowIstMs = Date.now() + IST_OFFSET_MINUTES * 60 * 1000;
  const nowIst = new Date(nowIstMs);
  const y = nowIst.getUTCFullYear();
  const m = nowIst.getUTCMonth();
  const d = nowIst.getUTCDate();
  // 15:00 IST == 09:30 UTC
  return new Date(Date.UTC(y, m, d, 9, 30, 0));
}

export function getTestStartAt() {
  const override = process.env.TEST_START_AT;
  if (override) {
    const parsed = new Date(override);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return defaultTestStartAt();
}
