import orchidLogo from "../assets/orchid-logo.svg";

export default function IntroScreen({ onStart, title, questionCount, durationSeconds, starting, startError }) {
  const minutes = durationSeconds / 60;

  return (
    <div className="screen">
      <div className="intro-card">
        <img src={orchidLogo} alt="Orchid University" className="intro-logo" />
        <div className="intro-eyebrow">Doctoral Candidate Assessment</div>
        <h1 className="intro-title">{title}</h1>
        <p className="intro-sub">
          This timed assessment evaluates quantitative reasoning, experimental logic, and
          research judgment. Complete it in one sitting — your progress cannot be saved and
          resumed.
        </p>

        <div className="intro-facts">
          <div className="intro-fact">
            <div className="intro-fact-num">{questionCount}</div>
            <div className="intro-fact-label">Questions</div>
          </div>
          <div className="intro-fact">
            <div className="intro-fact-num">{minutes}</div>
            <div className="intro-fact-label">Minutes</div>
          </div>
          <div className="intro-fact">
            <div className="intro-fact-num">4</div>
            <div className="intro-fact-label">Options each</div>
          </div>
        </div>

        <ul className="intro-rules">
          <li>Answer each question by selecting one of four options.</li>
          <li>
            You may move freely between questions using Back and Next, or jump via the grid
            once the assessment begins.
          </li>
          <li>The timer starts as soon as you click Begin and cannot be paused.</li>
          <li>When time expires, the assessment locks automatically and submits your current answers.</li>
          <li>Your login can only be used to begin once — closing or refreshing the page will not give you a fresh attempt.</li>
        </ul>

        {startError && <div className="login-error" style={{ marginBottom: 16 }}>{startError}</div>}

        <button className="start-btn" onClick={onStart} disabled={starting}>
          {starting ? "Starting…" : "Begin assessment"}
        </button>
      </div>
    </div>
  );
}
