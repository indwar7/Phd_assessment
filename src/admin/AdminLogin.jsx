import { useState } from "react";
import orchidLogo from "../assets/orchid-logo.svg";

export default function AdminLogin({ onLoggedIn }) {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ loginId, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      onLoggedIn(data.token);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="screen">
      <div className="login-card">
        <img src={orchidLogo} alt="Orchid University" className="login-logo" />
        <div className="login-badge">Admin</div>
        <h1 className="login-title">Sign in to view results</h1>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span className="field-label">Login ID</span>
            <div className="field-control">
              <input
                type="text"
                autoComplete="username"
                placeholder="Admin login ID"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                required
                autoFocus
              />
            </div>
          </label>

          <label className="field">
            <span className="field-label">Password</span>
            <div className="field-control">
              <input
                type="password"
                autoComplete="current-password"
                placeholder="Admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </label>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-btn" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
