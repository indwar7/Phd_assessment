import { useCallback, useEffect, useState } from "react";
import { formatTime } from "../hooks/useCountdown";
import AttemptDetail from "./AttemptDetail";
import ImportCandidates from "./ImportCandidates";
import { downloadAttemptsCsv } from "./csvExport";

function groupByDomain(attempts) {
  const groups = new Map();
  for (const a of attempts) {
    const key = a.domain.title;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(a);
  }
  return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

export default function AdminDashboard({ token, onLogout }) {
  const [attempts, setAttempts] = useState(null);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/attempts", {
        headers: { authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load attempts");
      setAttempts(data.attempts);
    } catch (err) {
      if (err.message === "Unauthorized") onLogout();
      else setError(err.message || "Could not load attempts");
    }
  }, [token, onLogout]);

  useEffect(() => {
    load();
  }, [load]);

  if (selectedId) {
    return <AttemptDetail token={token} attemptId={selectedId} onBack={() => setSelectedId(null)} onLogout={onLogout} />;
  }

  const submittedCount = attempts?.filter((a) => a.hasSubmitted).length ?? 0;
  const domainGroups = attempts ? groupByDomain(attempts) : [];

  return (
    <div className="admin-shell">
      <div className="admin-topbar">
        <h1>Assessment results</h1>
        <button className="nav-btn" onClick={onLogout}>
          Log out
        </button>
      </div>

      <ImportCandidates token={token} onImported={load} />

      {error && <div className="login-error">{error}</div>}
      {!attempts && !error && <p>Loading…</p>}

      {attempts && attempts.length === 0 && <p>No candidates found. Import candidates to get started.</p>}

      {attempts && attempts.length > 0 && (
        <>
          <div className="admin-table-toolbar">
            <p className="skip-hint">
              {submittedCount} of {attempts.length} candidates have submitted.
            </p>
            <button className="nav-btn" onClick={() => downloadAttemptsCsv(attempts)}>
              Download CSV
            </button>
          </div>

          {domainGroups.map(([domainTitle, rows]) => (
            <div key={domainTitle} className="domain-group">
              <h2 className="domain-group-title">
                {domainTitle} <span className="skip-hint">({rows.length})</span>
              </h2>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Login ID</th>
                      <th>Status</th>
                      <th>Correct</th>
                      <th>Wrong</th>
                      <th>Not attempted</th>
                      <th>Final score</th>
                      <th>Time used</th>
                      <th>Submitted</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((a) => (
                      <tr key={a.candidate.id}>
                        <td>{a.candidate.name}</td>
                        <td>{a.candidate.loginId}</td>
                        <td>{a.hasSubmitted ? (a.timedOut ? "Timed out" : "Submitted") : "Pending"}</td>
                        <td>{a.hasSubmitted ? a.correctCount : "—"}</td>
                        <td>{a.hasSubmitted ? a.wrongCount : "—"}</td>
                        <td>{a.hasSubmitted ? a.notAttemptedCount : "—"}</td>
                        <td>{a.hasSubmitted ? `${a.correctCount} / ${a.total}` : "—"}</td>
                        <td>{a.hasSubmitted ? formatTime(a.timeUsedSeconds) : "—"}</td>
                        <td>{a.hasSubmitted ? new Date(a.submittedAt).toLocaleString() : "—"}</td>
                        <td>
                          {a.hasSubmitted && (
                            <button className="nav-btn" onClick={() => setSelectedId(a.attemptId)}>
                              View
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
