import { useCallback, useRef, useState } from "react";
import LoginScreen from "./components/LoginScreen";
import IntroScreen from "./components/IntroScreen";
import QuizScreen from "./components/QuizScreen";
import CompleteScreen from "./components/CompleteScreen";
import { useCountdown } from "./hooks/useCountdown";
import { QUESTIONS, ASSESSMENT_DURATION_SECONDS } from "./data/questions";
import "./App.css";

const PHASES = { LOGIN: "login", INTRO: "intro", QUIZ: "quiz", COMPLETE: "complete" };

export default function App() {
  const [phase, setPhase] = useState(PHASES.LOGIN);
  const [candidateId, setCandidateId] = useState("");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(() => new Array(QUESTIONS.length).fill(null));
  const [locked, setLocked] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const timeUsedRef = useRef(0);

  const finishAssessment = useCallback((byTimeout, secondsLeft) => {
    setLocked(true);
    if (byTimeout) {
      setTimedOut(true);
      timeUsedRef.current = ASSESSMENT_DURATION_SECONDS;
      setTimeout(() => setPhase(PHASES.COMPLETE), 1400);
    } else {
      timeUsedRef.current = ASSESSMENT_DURATION_SECONDS - secondsLeft;
      setPhase(PHASES.COMPLETE);
    }
  }, []);

  const timeLeft = useCountdown(ASSESSMENT_DURATION_SECONDS, phase === PHASES.QUIZ && !locked, () =>
    finishAssessment(true, 0)
  );

  const handleLogin = (id) => {
    setCandidateId(id);
    setPhase(PHASES.INTRO);
  };

  const handleStart = () => setPhase(PHASES.QUIZ);

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
    if (current === QUESTIONS.length - 1) {
      finishAssessment(false, timeLeft);
    } else {
      setCurrent((c) => c + 1);
    }
  };

  if (phase === PHASES.LOGIN) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (phase === PHASES.INTRO) {
    return <IntroScreen onStart={handleStart} />;
  }

  if (phase === PHASES.COMPLETE) {
    const attempted = answers.filter((a) => a !== null).length;
    return (
      <CompleteScreen
        attempted={attempted}
        total={QUESTIONS.length}
        timeUsedSeconds={timeUsedRef.current}
      />
    );
  }

  return (
    <QuizScreen
      questions={QUESTIONS}
      current={current}
      answers={answers}
      timeLeft={timeLeft}
      locked={locked}
      timedOut={timedOut}
      candidateId={candidateId}
      onSelectOption={handleSelectOption}
      onJump={handleJump}
      onBack={handleBack}
      onNext={handleNext}
    />
  );
}
