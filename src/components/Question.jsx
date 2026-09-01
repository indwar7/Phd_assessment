const LETTERS = ["A", "B", "C", "D"];

export default function Question({ question, index, total, selected, onSelect, locked }) {
  return (
    <>
      <div className="q-meta">
        <span className="q-index">
          Question {String(index + 1).padStart(2, "0")} / {total}
        </span>
        <span className="q-tag">{question.tag}</span>
      </div>

      <h2 className="q-text">{question.text}</h2>

      <div className="options">
        {question.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            className={"option" + (selected === i ? " selected" : "")}
            disabled={locked}
            onClick={() => onSelect(i)}
          >
            <span className="option-letter">{LETTERS[i]}</span>
            <span className="option-text">{opt}</span>
          </button>
        ))}
      </div>
    </>
  );
}
