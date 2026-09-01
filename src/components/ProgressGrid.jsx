export default function ProgressGrid({ answers, current, onJump, locked }) {
  const total = answers.length;
  const attempted = answers.filter((a) => a !== null).length;

  return (
    <div className="progress-block">
      <div className="progress-head">
        <span className="progress-label">Progress</span>
        <span className="progress-count">
          {attempted} / {total}
        </span>
      </div>

      <div className="progress-bar-outer">
        <div className="progress-bar-inner" style={{ width: `${(attempted / total) * 100}%` }} />
      </div>

      <div className="progress-grid">
        {answers.map((answer, i) => (
          <button
            key={i}
            type="button"
            className={
              "cell" +
              (answer !== null ? " answered" : "") +
              (i === current ? " current" : "")
            }
            aria-label={`Go to question ${i + 1}`}
            disabled={locked}
            onClick={() => onJump(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="legend">
        <span className="legend-item">
          <span className="legend-swatch answered" />
          Attempted
        </span>
        <span className="legend-item">
          <span className="legend-swatch" />
          Remaining
        </span>
      </div>
    </div>
  );
}
