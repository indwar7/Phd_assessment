import { formatTime } from "../hooks/useCountdown";

export default function Timer({ timeLeft, durationSeconds }) {
  const pct = (timeLeft / durationSeconds) * 100;
  const critical = timeLeft <= 60;

  return (
    <div className="timer-block">
      <div className="timer-label">Time remaining</div>
      <div className={"timer-value" + (critical ? " critical" : "")}>{formatTime(timeLeft)}</div>
      <div className="timer-bar">
        <div
          className={"timer-bar-fill" + (critical ? " critical" : "")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
