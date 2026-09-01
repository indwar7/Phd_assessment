import Timer from "./Timer";
import ProgressGrid from "./ProgressGrid";
import Question from "./Question";
import orchidLogo from "../assets/orchid-logo.svg";

export default function QuizScreen({
  questions,
  current,
  answers,
  timeLeft,
  durationSeconds,
  locked,
  timedOut,
  candidateId,
  onSelectOption,
  onJump,
  onBack,
  onNext,
}) {
  const isLast = current === questions.length - 1;

  return (
    <div className="quiz-shell">
      <div className="topbar">
        <div className="brand">
          <img src={orchidLogo} alt="Orchid University" className="topbar-logo" />
          <div className="brand-text">
            <div className="brand-label">Doctoral Candidate Assessment</div>
            <div className="brand-title">Research Aptitude &amp; Reasoning</div>
          </div>
        </div>
        <div className="candidate-chip">
          Candidate <strong>{candidateId}</strong>
        </div>
      </div>

      <div className="layout">
        <div className="main">
          {timedOut && (
            <div className="timeout-banner visible">
              <span>
                Time has expired. The assessment has been locked and your answers submitted
                automatically.
              </span>
            </div>
          )}

          <Question
            question={questions[current]}
            index={current}
            total={questions.length}
            selected={answers[current]}
            onSelect={onSelectOption}
            locked={locked}
          />

          <div className="nav-row">
            <button className="nav-btn" onClick={onBack} disabled={current === 0 || locked}>
              Back
            </button>
            <span className="skip-hint">{answers[current] === null ? "Not yet answered" : ""}</span>
            <button
              className={"nav-btn " + (isLast ? "submit" : "primary")}
              onClick={onNext}
              disabled={locked}
            >
              {isLast ? "Submit assessment" : "Next"}
            </button>
          </div>
        </div>

        <div className="sidebar">
          <Timer timeLeft={timeLeft} durationSeconds={durationSeconds} />
          <ProgressGrid answers={answers} current={current} onJump={onJump} locked={locked} />
          <div className="instructions-note">
            Click any tile to jump directly to that question. Attempted questions are marked
            green and remain editable until submission.
          </div>
        </div>
      </div>
    </div>
  );
}
