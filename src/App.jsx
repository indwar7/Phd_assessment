import { useCallback, useRef, useState } from "react";
import LoginScreen from "./components/LoginScreen";
import IntroScreen from "./components/IntroScreen";
import QuizScreen from "./components/QuizScreen";
import CompleteScreen from "./components/CompleteScreen";
import { useCountdown } from "./hooks/useCountdown";
import "./App.css";

const PHASES = { LOGIN: "login", LOADING: "loading", INTRO: "intro", QUIZ: "quiz", COMPLETE: "complete" };

export default function App() {
  const [phase, setPhase] = useState(PHASES.LOGIN);
  const [candidate, setCandidate] = useState(null);
  const [domain, setDomain] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [locked, setLocked] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const timeUsedRef = useRef(0);
  const startedAtRef = useRef(null);

  const durationSeconds = domain?.durationSeconds ?? 15 * 60;

  const submitAttempt = useCallback(
    async (finalAnswers, byTimeout, timeUsed) => {
      try {
        const res = await fetch("/api/attempts/submit", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            candidateId: candidate.id,
            answers: finalAnswers,
            timeUsedSeconds: timeUsed,
            timedOut: byTimeout,
            startedAt: startedAtRef.current,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Submission failed");
      } catch (err) {
        setSubmitError(err.message || "Could not submit your assessment. Please contact the coordinator.");
      }
    },
    [candidate]
  );

  const finishAssessment = useCallback(
    (byTimeout, secondsLeft) => {
      setLocked(true);
      const timeUsed = byTimeout ? durationSeconds : durationSeconds - secondsLeft;
      timeUsedRef.current = timeUsed;
      setTimedOut(byTimeout);

      setAnswers((currentAnswers) => {
        submitAttempt(currentAnswers, byTimeout, timeUsed);
        return currentAnswers;
      });

      if (byTimeout) {
        setTimeout(() => setPhase(PHASES.COMPLETE), 1400);
      } else {
        setPhase(PHASES.COMPLETE);
      }
    },
    [durationSeconds, submitAttempt]
  );

  const timeLeft = useCountdown(durationSeconds, phase === PHASES.QUIZ && !locked, () =>
    finishAssessment(true, 0)
  );

  const handleLoggedIn = async (loggedInCandidate) => {
    setCandidate(loggedInCandidate);
    setPhase(PHASES.LOADING);
    try {
      const res = await fetch(`/api/domains/${loggedInCandidate.domainSlug}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load the assessment");
      setDomain(data.domain);
      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(null));
      setPhase(PHASES.INTRO);
    } catch (err) {
      setSubmitError(err.message || "Could not load the assessment. Please try again.");
      setPhase(PHASES.LOGIN);
    }
  };

  const handleStart = () => {
    startedAtRef.current = new Date().toISOString();
    setPhase(PHASES.QUIZ);
  };

  const handleSelectOption = (optionIndex) => {
    if (locked) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[current] = optionIndex;
      return next;
    });
  };

  const handleJump = (index) => {
    if (!locked) setCurrent(index);
  };

  const handleBack = () => {
    if (current > 0 && !locked) setCurrent((c) => c - 1);
  };

  const handleNext = () => {
    if (locked) return;
    if (current === questions.length - 1) {
      finishAssessment(false, timeLeft);
    } else {
      setCurrent((c) => c + 1);
    }
  };

  if (phase === PHASES.LOGIN) {
    return <LoginScreen onLoggedIn={handleLoggedIn} />;
  }

  if (phase === PHASES.LOADING) {
    return (
      <div className="screen">
        <p>Loading assessment…</p>
      </div>
    );
  }

  if (phase === PHASES.INTRO) {
    return (
      <IntroScreen
        onStart={handleStart}
        title={domain?.title || "Assessment"}
        questionCount={questions.length}
        durationSeconds={durationSeconds}
      />
    );
  }

  if (phase === PHASES.COMPLETE) {
    const attempted = answers.filter((a) => a !== null).length;
    return (
      <CompleteScreen
        attempted={attempted}
        total={questions.length}
        timeUsedSeconds={timeUsedRef.current}
        submitError={submitError}
      />
    );
  }

  return (
    <QuizScreen
      questions={questions}
      current={current}
      answers={answers}
      timeLeft={timeLeft}
      durationSeconds={durationSeconds}
      locked={locked}
      timedOut={timedOut}
      candidateId={candidate?.name}
      onSelectOption={handleSelectOption}
      onJump={handleJump}
      onBack={handleBack}
      onNext={handleNext}
    />
  );
}
