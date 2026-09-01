import orchidLogo from "../assets/orchid-logo.svg";
import { formatTime } from "../hooks/useCountdown";

export default function CompleteScreen({ attempted, total, timeUsedSeconds }) {
  return (
    <div className="screen">
      <div className="complete-card">
        <img src={orchidLogo} alt="Orchid University" className="complete-logo" />
        <div className="complete-mark">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 12.5L9.5 18L20 6"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "var(--accent)" }}
            />
          </svg>
        </div>
        <h1 className="complete-title">Thank you for attempting the assessment</h1>
        <p className="complete-sub">Our team will get back to you soon. You may now close this window.</p>
        <div className="complete-stats">
          <div className="complete-stat">
            <span className="complete-stat-num">
              {attempted}/{total}
            </span>
            <span className="complete-stat-label">Attempted</span>
          </div>
          <div className="complete-stat">
            <span className="complete-stat-num">{formatTime(timeUsedSeconds)}</span>
            <span className="complete-stat-label">Time used</span>
          </div>
        </div>
      </div>
    </div>
  );
}
