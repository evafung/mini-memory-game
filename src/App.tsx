import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckMark,
  CircleProgressRing,
  ClockIcon,
  CrossMark,
  HomeIcon,
  ReplayIcon,
  ShapeIcon,
} from './components/ShapeIcons';
import {
  SHAPE_DEFINITIONS,
  calculateBonus,
  generateSequence,
  INITIAL_DIFFICULTY,
  isSelectionCorrect,
  nextDifficulty,
  type Difficulty,
  type GamePhase,
  type PlayerSelection,
  type ShapeId,
} from './game/engine';
import './App.css';

function App() {
  const [phase, setPhase] = useState<GamePhase>('HOME');
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>(INITIAL_DIFFICULTY);
  const [sequence, setSequence] = useState<ShapeId[]>([]);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [displayedShape, setDisplayedShape] = useState<ShapeId | null>(null);
  const [playerSelections, setPlayerSelections] = useState<PlayerSelection[]>([]);
  const [selectionIndex, setSelectionIndex] = useState(0);
  const [remainingTimeMs, setRemainingTimeMs] = useState(INITIAL_DIFFICULTY.inputTimeMs);
  const [gameOverReason, setGameOverReason] = useState<'incorrect' | 'timeout' | null>(null);

  const timeoutBounds = useRef<number[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const clearScheduledTimers = useCallback(() => {
    timeoutBounds.current.forEach((timerId) => {
      window.clearTimeout(timerId);
    });
    timeoutBounds.current = [];
  }, []);

  const stopAnimationFrame = useCallback(() => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const beginRound = useCallback((nextDifficultyInfo: Difficulty) => {
    const nextSequence = generateSequence(nextDifficultyInfo.sequenceLength);
    setSequence(nextSequence);
    setPlayerSelections([]);
    setSelectionIndex(0);
    setDisplayedShape(null);
    setRemainingTimeMs(nextDifficultyInfo.inputTimeMs);
    setCountdownValue(3);
    setGameOverReason(null);
    setPhase('COUNTDOWN');
  }, []);

  const startNewGame = useCallback(() => {
    clearScheduledTimers();
    stopAnimationFrame();
    setScore(0);
    setDifficulty(INITIAL_DIFFICULTY);
    beginRound(INITIAL_DIFFICULTY);
  }, [beginRound, clearScheduledTimers, stopAnimationFrame]);

  const returnHome = useCallback(() => {
    clearScheduledTimers();
    stopAnimationFrame();
    setPhase('HOME');
    setScore(0);
    setDifficulty(INITIAL_DIFFICULTY);
    setSequence([]);
    setPlayerSelections([]);
    setSelectionIndex(0);
    setDisplayedShape(null);
    setRemainingTimeMs(INITIAL_DIFFICULTY.inputTimeMs);
    setCountdownValue(null);
    setGameOverReason(null);
  }, [clearScheduledTimers, stopAnimationFrame]);

  useEffect(() => {
    if (phase !== 'COUNTDOWN') {
      return undefined;
    }

    const countdownTimers = [
      window.setTimeout(() => setCountdownValue(3), 0),
      window.setTimeout(() => setCountdownValue(2), 1000),
      window.setTimeout(() => setCountdownValue(1), 2000),
      window.setTimeout(() => {
        setCountdownValue(null);
        setPhase('SHOWING_SEQUENCE');
      }, 3000),
    ];

    timeoutBounds.current.push(...countdownTimers);

    return () => {
      countdownTimers.forEach((timerId) => window.clearTimeout(timerId));
      timeoutBounds.current = timeoutBounds.current.filter(
        (timerId) => !countdownTimers.includes(timerId),
      );
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'SHOWING_SEQUENCE' || sequence.length === 0) {
      return undefined;
    }

    let isCancelled = false;

    const revealSequence = (index: number) => {
      if (isCancelled) {
        return;
      }

      setDisplayedShape(sequence[index]);

      if (index === sequence.length - 1) {
        const endTimer = window.setTimeout(() => {
          if (!isCancelled) {
            setDisplayedShape(null);
            setPhase('PLAYER_INPUT');
          }
        }, difficulty.displayDurationMs);
        timeoutBounds.current.push(endTimer);
        return;
      }

      const nextTimer = window.setTimeout(() => {
        revealSequence(index + 1);
      }, difficulty.displayDurationMs);
      timeoutBounds.current.push(nextTimer);
    };

    revealSequence(0);

    return () => {
      isCancelled = true;
      timeoutBounds.current = timeoutBounds.current.filter((timerId) => {
        window.clearTimeout(timerId);
        return false;
      });
    };
  }, [phase, sequence, difficulty.displayDurationMs]);

  useEffect(() => {
    if (phase !== 'PLAYER_INPUT') {
      return undefined;
    }

    const startTimestamp = performance.now();
    const tick = () => {
      const elapsed = performance.now() - startTimestamp;
      const newRemaining = Math.max(0, difficulty.inputTimeMs - elapsed);
      setRemainingTimeMs(newRemaining);

      if (newRemaining <= 0) {
        setRemainingTimeMs(0);
        setGameOverReason('timeout');
        setPhase('GAME_OVER');
        return;
      }

      animationFrameRef.current = window.requestAnimationFrame(tick);
    };

    animationFrameRef.current = window.requestAnimationFrame(tick);

    return () => {
      stopAnimationFrame();
    };
  }, [phase, difficulty.inputTimeMs, stopAnimationFrame]);

  useEffect(() => {
    if (phase !== 'ROUND_SUCCESS') {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      const updatedDifficulty = nextDifficulty(difficulty);
      setDifficulty(updatedDifficulty);
      beginRound(updatedDifficulty);
    }, 700);

    timeoutBounds.current.push(timeoutId);

    return () => {
      window.clearTimeout(timeoutId);
      timeoutBounds.current = timeoutBounds.current.filter((timerId) => timerId !== timeoutId);
    };
  }, [beginRound, difficulty, phase]);

  const handleShapePress = useCallback(
    (shape: ShapeId) => {
      if (phase !== 'PLAYER_INPUT') {
        return;
      }

      const isCorrect = isSelectionCorrect(sequence, selectionIndex, shape);

      const newSelection: PlayerSelection = {
        id: `${shape}-${selectionIndex}-${Date.now()}`,
        shape,
        isCorrect,
      };

      setPlayerSelections((current) => [...current, newSelection]);

      if (!isCorrect) {
        setGameOverReason('incorrect');
        setPhase('GAME_OVER');
        return;
      }

      const nextIndex = selectionIndex + 1;
      if (nextIndex >= sequence.length) {
        const earnedPoints = calculateBonus(remainingTimeMs);
        setScore((currentScore) => currentScore + earnedPoints);
        setSelectionIndex(nextIndex);
        setPhase('ROUND_SUCCESS');
        return;
      }

      setSelectionIndex(nextIndex);
    },
    [phase, remainingTimeMs, selectionIndex, sequence],
  );

  const isButtonDisabled = phase !== 'PLAYER_INPUT';

  const playerAnswerSlots = useMemo(() => {
    const timeoutMarkerVisible =
      phase === 'GAME_OVER' &&
      gameOverReason === 'timeout' &&
      !playerSelections.some((selection) => !selection.isCorrect) &&
      playerSelections.length < sequence.length;

    const slots = Array.from({ length: sequence.length }, (_, index) => {
      const selection = playerSelections[index];

      if (selection) {
        return (
          <div className="answer-slot" key={selection.id}>
            <ShapeIcon shapeId={selection.shape} size={26} />
            {selection.isCorrect ? <CheckMark size={14} /> : <CrossMark size={14} />}
          </div>
        );
      }

      if (timeoutMarkerVisible && index === playerSelections.length) {
        return (
          <div className="answer-slot answer-slot--timeout" key={`timeout-${index}`}>
            <CrossMark size={14} />
          </div>
        );
      }

      return <div className="answer-slot answer-slot--empty" key={`empty-${index}`} />;
    });

    return slots;
  }, [gameOverReason, phase, playerSelections, sequence.length]);

  const renderMiddleDisplay = () => {
    if (phase === 'HOME') {
      return (
        <div className="home-screen">
          <h1>Mini Memory Game</h1>
          <button className="primary-button" type="button" onClick={startNewGame}>
            Start
          </button>
        </div>
      );
    }

    if (phase === 'COUNTDOWN') {
      return (
        <div className="countdown-display" key={countdownValue ?? 0}>
          <div className="countdown-value">{countdownValue}</div>
        </div>
      );
    }

    if (phase === 'SHOWING_SEQUENCE') {
      return (
        <div className="sequence-display">
          {displayedShape ? <ShapeIcon shapeId={displayedShape} size={120} /> : null}
        </div>
      );
    }

    if (phase === 'PLAYER_INPUT') {
      const inputProgress = Math.min(1, Math.max(0, remainingTimeMs / difficulty.inputTimeMs));
      return (
        <div className="input-display">
          <div className="timer-orbit">
            <CircleProgressRing progress={inputProgress} size={130} />
            <div className="timer-center">
              <ClockIcon size={40} />
            </div>
          </div>
          <div className="timer-value">{Math.ceil(remainingTimeMs / 1000)}</div>
        </div>
      );
    }

    if (phase === 'ROUND_SUCCESS') {
      return (
        <div className="round-success">
          <CheckMark size={44} />
          <span>Round cleared</span>
        </div>
      );
    }

    return null;
  };

  if (phase === 'GAME_OVER') {
    return (
      <div className="app-shell app-shell--gameover">
        <div className="game-over-card">
          <h2>Game Over</h2>
          <div className="final-score-wrap">
            <span>Final Score</span>
            <strong>{score}</strong>
          </div>
          <div className="game-over-actions">
            <button type="button" className="game-action-button" onClick={returnHome}>
              <HomeIcon size={22} />
              <span>Back to Home</span>
            </button>
            <button type="button" className="game-action-button" onClick={startNewGame}>
              <ReplayIcon size={22} />
              <span>Play Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {phase === 'HOME' ? (
        renderMiddleDisplay()
      ) : (
        <>
          <header className="score-row">
            <span className="score-label">Score</span>
            <span className="score-value">{score}</span>
          </header>

          <main className="game-stage">
            <div className="middle-display">{renderMiddleDisplay()}</div>
            <div className="answer-row">{playerAnswerSlots}</div>
          </main>

          <footer className="shape-grid">
            {SHAPE_DEFINITIONS.map((shape) => (
              <button
                key={shape.id}
                type="button"
                className="shape-button"
                aria-label={`Select ${shape.label}`}
                disabled={isButtonDisabled}
                onClick={() => handleShapePress(shape.id)}
              >
                <span className="shape-button__shape">
                  <ShapeIcon
                    shapeId={shape.id}
                    size={44}
                    faded={isButtonDisabled}
                  />
                </span>
              </button>
            ))}
          </footer>
        </>
      )}
    </div>
  );
}

export default App;
