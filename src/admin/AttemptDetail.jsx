import { useEffect, useState } from "react";
import { formatTime } from "../hooks/useCountdown";

const LETTERS = ["A", "B", "C", "D"];

export default function AttemptDetail({ token, attemptId, onBack, onLogout }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/admin/attempts/${attemptId}`, {
          headers: { authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Could not load attempt");
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) {
          if (err.message === "Unauthorized") onLogout();
          else setError(err.message || "Could not load attempt");
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [token, attemptId, onLogout]);

  return (
    <div className="admin-shell">
      <div className="admin-topbar">
        <button className="nav-btn" onClick={onBack}>
          ← Back
        </button>
        <button className="nav-btn" onClick={onLogout}>
          Log out
        </button>
      </div>

      {error && <div className="login-error">{error}</div>}
      {!data && !error && <p>Loading…</p>}

      {data && (
        <>
          <div className="attempt-summary">
            <h2>{data.candidate.name}</h2>
            <p>
              Login ID: <strong>{data.candidate.loginId}</strong>
              {data.candidate.email ? ` · ${data.candidate.email}` : ""}
              {data.candidate.phone ? ` · ${data.candidate.phone}` : ""}
            </p>
            <p>
              Correct: <strong>{data.correctCount}</strong> · Wrong: <strong>{data.wrongCount}</strong> · Not
              attempted: <strong>{data.notAttemptedCount}</strong> · Final score:{" "}
              <strong>{data.score} / {data.total}</strong>
            </p>
            <p>
              Time used: <strong>{formatTime(data.timeUsedSeconds)}</strong>
              {data.timedOut ? " · Timed out" : ""}
            </p>
            <p>Submitted: {new Date(data.submittedAt).toLocaleString()}</p>
          </div>

          <div className="attempt-review">
            {data.review.map((q) => (
              <div key={q.position} className={"review-item" + (q.isCorrect ? " correct" : " incorrect")}>
                <div className="q-meta">
                  <span className="q-index">Question {q.position + 1}</span>
                  <span className="q-tag">{q.tag}</span>
                </div>
                <p className="q-text">{q.text}</p>
                <ul className="review-options">
                  {q.options.map((opt, i) => {
                    const classes = ["review-option"];
                    if (i === q.correctIndex) classes.push("is-correct");
                    if (i === q.givenIndex && i !== q.correctIndex) classes.push("is-wrong");
                    if (i === q.givenIndex) classes.push("is-chosen");
                    return (
                      <li key={i} className={classes.join(" ")}>
                        <span className="option-letter">{LETTERS[i]}</span>
                        <span>{opt}</span>
                      </li>
                    );
                  })}
                </ul>
                {q.givenIndex === null && <p className="skip-hint">Not answered</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
