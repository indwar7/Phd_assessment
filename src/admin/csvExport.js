function escapeCsvCell(value) {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function downloadAttemptsCsv(attempts) {
  const headers = [
    "Login ID",
    "Name",
    "Domain",
    "Status",
    "Correct",
    "Wrong",
    "Not Attempted",
    "Total",
    "Time Used",
    "Submitted At",
  ];

  const rows = attempts.map((a) => [
    a.candidate.loginId,
    a.candidate.name,
    a.domain.title,
    a.hasSubmitted ? (a.timedOut ? "Timed out" : "Submitted") : "Pending",
    a.hasSubmitted ? a.correctCount : "",
    a.hasSubmitted ? a.wrongCount : "",
    a.hasSubmitted ? a.notAttemptedCount : "",
    a.hasSubmitted ? a.total : "",
    a.hasSubmitted ? formatSeconds(a.timeUsedSeconds) : "",
    a.hasSubmitted ? new Date(a.submittedAt).toLocaleString() : "",
  ]);

  const csv = [headers, ...rows].map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `orchid-assessment-results-${stamp}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function formatSeconds(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s < 10 ? "0" + s : s}`;
}
