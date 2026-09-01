import { useState } from "react";

const PLACEHOLDER = `Aditya Singh, adisingh.cs@gmail.com, Information Technology (IT)
Mahfooz Ahmad, mahfooz.only007@gmail.com, Commerce & Management`;

function parseRows(raw) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(",").map((p) => p.trim());
      return { name: parts[0] || "", email: parts[1] || "", school: parts[2] || "" };
    });
}

export default function ImportCandidates({ token, onImported }) {
  const [raw, setRaw] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const candidates = parseRows(raw);
    if (candidates.length === 0) {
      setError("Paste at least one row: Name, Email, School");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/import-candidates", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ candidates }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setResult(data);
      setRaw("");
      onImported?.();
    } catch (err) {
      setError(err.message || "Import failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="attempt-summary">
      <button className="nav-btn" onClick={() => setOpen((o) => !o)} type="button">
        {open ? "Hide" : "Add candidates"}
      </button>

      {open && (
        <form onSubmit={handleSubmit} style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <label className="field">
            <span className="field-label">One candidate per line: Name, Email, School</span>
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder={PLACEHOLDER}
              rows={6}
              style={{
                fontFamily: "inherit",
                fontSize: "13.5px",
                padding: "12px 14px",
                border: "1.5px solid var(--border-strong)",
                borderRadius: 9,
                background: "var(--paper-raised)",
                color: "var(--ink)",
                resize: "vertical",
              }}
            />
          </label>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-btn" style={{ marginTop: 0, alignSelf: "flex-start" }} disabled={submitting}>
            {submitting ? "Importing…" : "Import candidates"}
          </button>
        </form>
      )}

      {result && (
        <div style={{ marginTop: 20 }}>
          {result.created.length > 0 && (
            <>
              <p className="skip-hint">{result.created.length} candidate(s) created — share these credentials:</p>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>School</th>
                      <th>Login ID</th>
                      <th>Password</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.created.map((c) => (
                      <tr key={c.id}>
                        <td>{c.name}</td>
                        <td>{c.school}</td>
                        <td>{c.loginId}</td>
                        <td>{c.password}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {result.skipped.length > 0 && (
            <div className="login-error" style={{ marginTop: 12 }}>
              {result.skipped.length} row(s) skipped:
              <ul>
                {result.skipped.map((s, i) => (
                  <li key={i}>
                    {s.row?.name || "(unknown)"} — {s.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
