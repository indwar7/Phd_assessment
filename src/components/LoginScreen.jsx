import { useState } from "react";
import orchidLogo from "../assets/orchid-logo.svg";

export default function LoginScreen({ onLoggedIn }) {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!loginId.trim() || !password) {
      setError("Please enter your login ID and password.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/candidates/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ loginId: loginId.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Incorrect login ID or password.");
      onLoggedIn(data.candidate);
    } catch (err) {
      setError(err.message || "Incorrect login ID or password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="screen">
      <div className="login-card">
        <img src={orchidLogo} alt="Orchid University" className="login-logo" />
        <div className="login-badge">Doctoral Candidate Portal</div>
        <h1 className="login-title">Sign in to begin your assessment</h1>
        <p className="login-sub">
          Use the login ID and password provided in your invitation email to access your
          Ph.D. Entrance Assessment.
        </p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span className="field-label">Login ID</span>
            <div className="field-control">
              <svg className="field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 12c2.485 0 4.5-2.015 4.5-4.5S14.485 3 12 3 7.5 5.015 7.5 7.5 9.515 12 12 12Zm0 2c-3.314 0-9 1.664-9 5v2h18v-2c0-3.336-5.686-5-9-5Z"
                  fill="currentColor"
                />
              </svg>
              <input
                type="text"
                autoComplete="off"
                placeholder="Enter your login ID"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                required
              />
            </div>
          </label>

          <label className="field">
            <span className="field-label">Password</span>
            <div className="field-control">
              <svg className="field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M6 10V8a6 6 0 1 1 12 0v2h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h1Zm2 0h8V8a4 4 0 1 0-8 0v2Z"
                  fill="currentColor"
                />
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="off"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="eye-toggle"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M3 3l18 18M10.6 10.7a2.5 2.5 0 0 0 3.5 3.5M9.3 5.5A10.9 10.9 0 0 1 12 5c5 0 9 4 10.3 7a12.4 12.4 0 0 1-3.2 4.2M6.6 6.6A12.5 12.5 0 0 0 1.7 12C3 15 7 19 12 19a10.7 10.7 0 0 0 3.4-.6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M1.7 12C3 9 7 5 12 5s9 4 10.3 7C21 15 17 19 12 19S3 15 1.7 12Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                )}
              </button>
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
