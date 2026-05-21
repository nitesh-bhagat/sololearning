'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../../components/socketContext';
import styles from './arena.module.css';
import {
  Swords,
  LogOut,
  Trophy,
  Loader2,
  Play,
  AlertCircle,
  Sparkles,
  Check,
  X,
  Timer,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SUBJECTS = [
  { id: 'python', name: 'Python Basics' },
  { id: 'cs', name: 'Computer Science' },
  { id: 'math', name: 'Mathematics' },
  { id: 'physics', name: 'Physics' },
];

export default function ArenaPage() {
  const {
    isConnected,
    isQueued,
    countdown,
    gameState,
    roundData,
    roundEndData,
    matchEndData,
    opponentSubmittedScore,
    joinQueue,
    leaveQueue,
    submitAnswer,
    forfeitMatch,
    resetMatchState,
  } = useSocket();

  const [selectedSubject, setSelectedSubject] = useState<string>('python');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Timer state for the client progress bar
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const roundStartTimeRef = useRef<number>(0);

  // Track if we submitted this round
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Sync timers when a round starts
  useEffect(() => {
    if (roundData) {
      setSelectedOption(null);
      setHasSubmitted(false);
      setTimeLeft(roundData.limitTime);
      roundStartTimeRef.current = Date.now();

      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0.1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [roundData]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleOptionClick = (index: number) => {
    if (hasSubmitted || roundEndData || matchEndData) return;

    const timeTakenMs = Date.now() - roundStartTimeRef.current;
    setSelectedOption(index);
    setHasSubmitted(true);

    if (timerRef.current) clearInterval(timerRef.current);

    // Send answer to server
    if (roundData) {
      submitAnswer(roundData.roundIndex, index, timeTakenMs);
    }
  };

  // Helper to get option button style class
  const getOptionClass = (index: number) => {
    if (roundEndData) {
      const correctIdx = roundEndData.correctIndex;
      const isSelected = selectedOption === index;

      if (index === correctIdx) {
        return `${styles.optionBtn} ${styles.optionCorrect}`;
      }
      if (isSelected && index !== correctIdx) {
        return `${styles.optionBtn} ${styles.optionIncorrect}`;
      }
      return `${styles.optionBtn} opacity-50`;
    }

    if (selectedOption === index) {
      return `${styles.optionBtn} ${styles.optionSelected}`;
    }

    return styles.optionBtn;
  };

  // --- RENDERS ---

  // 1. Connection Error Screen
  if (!isConnected) {
    return (
      <div className={styles.arenaContainer}>
        <div className={styles.card}>
          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold text-white mb-2">Connecting to Arena...</h2>
          <p className="text-zinc-400 mb-6">
            Establishing a real-time secure connection to the multiplayer game server.
          </p>
          <div className="flex items-center justify-center gap-2 text-zinc-500">
            <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
            <span>Retrying connection...</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Match Ended / Results Screen
  if (matchEndData && gameState) {
    const myId = gameState.player.id;
    const oppId = gameState.opponent.id;

    const myScore = matchEndData.finalScores[myId] || 0;
    const oppScore = matchEndData.finalScores[oppId] || 0;
    const myXp = matchEndData.xpEarned[myId] || 0;

    const isWinner = matchEndData.winnerId === myId;
    const isDraw = matchEndData.winnerId === null;

    return (
      <div className={styles.arenaContainer}>
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`${styles.card} max-w-2xl`}
        >
          <div className="text-center mb-8">
            <Trophy className="w-20 h-20 text-amber-500 mx-auto mb-4 animate-pulse" />
            {isDraw ? (
              <h2 className={`${styles.winnerBanner} ${styles.drawTitle}`}>It&apos;s a Draw!</h2>
            ) : isWinner ? (
              <h2 className={`${styles.winnerBanner} ${styles.winnerTitle}`}>Victory! 🏆</h2>
            ) : (
              <h2 className={`${styles.winnerBanner} ${styles.loserTitle}`}>Defeat</h2>
            )}
            <p className="text-zinc-400">Match completed successfully</p>
          </div>

          <div className={styles.resultsGrid}>
            <div className={styles.resultCard}>
              <span className="text-zinc-400 font-semibold mb-2">You</span>
              <span className="text-3xl font-black text-white">{myScore}</span>
              <span className="text-sm text-zinc-500">Points</span>
              <div className={styles.xpEarned}>
                <Sparkles className="w-5 h-5 text-amber-400" />+{myXp} XP
              </div>
            </div>

            <div className={styles.resultCard}>
              <span className="text-zinc-400 font-semibold mb-2">
                {gameState.opponent.username}
              </span>
              <span className="text-3xl font-black text-white">{oppScore}</span>
              <span className="text-sm text-zinc-500">Points</span>
              <div className="text-zinc-500 text-sm mt-4">
                +{matchEndData.xpEarned[oppId] || 0} XP
              </div>
            </div>
          </div>

          <button
            onClick={resetMatchState}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-rose-500 text-black font-bold rounded-2xl shadow-lg hover:brightness-110 transition-all cursor-pointer"
          >
            Back to Arena Hub
          </button>
        </motion.div>
      </div>
    );
  }

  // 3. Match Countdown Screen
  if (countdown !== null && gameState) {
    return (
      <div className={styles.arenaContainer}>
        <div className={styles.matchWrapper}>
          {/* Header */}
          <div className={styles.matchHeader}>
            <div className={styles.profileInfo}>
              <div className={`${styles.avatar} ${styles.playerAvatar}`}>
                {gameState.player.avatar || gameState.player.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className={styles.username}>{gameState.player.username}</div>
                <div className={styles.scoreLabel}>
                  Score: <span className={styles.playerScore}>0</span>
                </div>
              </div>
            </div>

            <div className={styles.vsCircle}>VS</div>

            <div className={`${styles.profileInfo} ${styles.profileRight}`}>
              <div className={`${styles.avatar} ${styles.opponentAvatar}`}>
                {gameState.opponent.avatar || gameState.opponent.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className={styles.username}>{gameState.opponent.username}</div>
                <div className={styles.scoreLabel}>
                  Score: <span className={styles.opponentScore}>0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Countdown Card */}
          <div className={styles.arenaCard}>
            <div className={styles.countdownOverlay}>
              <span className="text-zinc-400 uppercase tracking-widest font-semibold text-sm">
                Preparing Match
              </span>
              <div className={styles.countdownNum}>{countdown === 0 ? 'GO!' : countdown}</div>
              <p className="text-zinc-500 text-sm">Get ready to solve 5 rapid questions!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. Live Match / Round Play Screen
  if (gameState && roundData) {
    const totalQuestions = gameState.questionsCount || 5;
    const currentRound = roundData.roundIndex + 1;
    const progressWidth = (timeLeft / 15) * 100;

    return (
      <div className={styles.arenaContainer}>
        <div className={styles.matchWrapper}>
          {/* Profiles Header */}
          <div className={styles.matchHeader}>
            <div className={styles.profileInfo}>
              <div className={`${styles.avatar} ${styles.playerAvatar}`}>
                {gameState.player.avatar || gameState.player.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className={styles.username}>You</div>
                <div className={styles.scoreLabel}>
                  Score:{' '}
                  <span className={`${styles.scoreVal} ${styles.playerScore}`}>
                    {gameState.player.score}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.vsCircle}>VS</div>

            <div className={`${styles.profileInfo} ${styles.profileRight}`}>
              <div className={`${styles.avatar} ${styles.opponentAvatar}`}>
                {gameState.opponent.avatar || gameState.opponent.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className={styles.username}>{gameState.opponent.username}</div>
                <div className={styles.scoreLabel}>
                  Score:{' '}
                  <span className={`${styles.scoreVal} ${styles.opponentScore}`}>
                    {opponentSubmittedScore !== null
                      ? opponentSubmittedScore
                      : gameState.opponent.score}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Game Arena Card */}
          <div className={styles.arenaCard}>
            <div className="flex justify-between items-center mb-6">
              <span className={styles.questionNum}>
                Round {currentRound} of {totalQuestions}
              </span>
              <div className="flex items-center gap-1.5 text-rose-500 font-bold bg-rose-500/10 px-3 py-1.5 rounded-full border border-rose-500/20">
                <Timer className="w-4 h-4 animate-pulse" />
                <span>{timeLeft.toFixed(1)}s</span>
              </div>
            </div>

            {/* Timer Strip */}
            <div className={styles.timerContainer}>
              <div className={styles.timerBar} style={{ width: `${progressWidth}%` }} />
            </div>

            {/* Question */}
            <h3 className={styles.questionText}>{roundData.question}</h3>

            {/* Options */}
            <div className={styles.optionsGrid}>
              {roundData.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  disabled={hasSubmitted || !!roundEndData}
                  className={getOptionClass(idx)}
                >
                  <span className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold border border-zinc-700">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{option}</span>
                </button>
              ))}
            </div>

            {/* Round Feedback Banner */}
            <AnimatePresence>
              {roundEndData && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4"
                >
                  {selectedOption === roundEndData.correctIndex ? (
                    <div className={`${styles.roundStatusBanner} ${styles.correctBanner}`}>
                      <Check className="inline-block w-5 h-5 mr-1" />
                      Correct Answer! Gained speed bonus points.
                    </div>
                  ) : selectedOption === -1 || selectedOption === null ? (
                    <div className={`${styles.roundStatusBanner} ${styles.timeoutBanner}`}>
                      <Timer className="inline-block w-5 h-5 mr-1" />
                      Time Out! Opponent scored.
                    </div>
                  ) : (
                    <div className={`${styles.roundStatusBanner} ${styles.incorrectBanner}`}>
                      <X className="inline-block w-5 h-5 mr-1" />
                      Incorrect Answer. Correct was {roundData.options[roundEndData.correctIndex]}.
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Forfeit footer */}
            <div className="mt-8 border-t border-zinc-800 pt-6 flex justify-end">
              <button
                onClick={() => {
                  if (
                    confirm(
                      'Are you sure you want to forfeit this match? You will lose and forfeit all XP.',
                    )
                  ) {
                    forfeitMatch();
                  }
                }}
                className="flex items-center gap-2 py-2 px-4 rounded-xl text-zinc-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all text-sm font-semibold cursor-pointer border border-transparent hover:border-rose-500/10"
              >
                <LogOut className="w-4 h-4" />
                Forfeit Match
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. Matchmaking Hub (Default State)
  return (
    <div className={styles.arenaContainer}>
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={styles.card}
      >
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-green-500/10 border border-green-500/20 py-1.5 px-3 rounded-full text-green-400 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
          Multiplayer Active
        </div>

        {isQueued ? (
          <div className={styles.queueState}>
            <div className={styles.radarRing}>
              <div className={styles.radarPing} />
              <div className={styles.radarPing2} />
              <Swords className="w-10 h-10 text-amber-500 animate-pulse" />
            </div>
            <h3 className={styles.queueText}>Searching for opponent...</h3>
            <p className={styles.queueSubtext}>
              Topic: {SUBJECTS.find((s) => s.id === selectedSubject)?.name}
            </p>
            <button
              onClick={leaveQueue}
              className="py-3 px-8 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all font-semibold cursor-pointer mt-4"
            >
              Cancel Matchmaking
            </button>
          </div>
        ) : (
          <div>
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Swords className="w-8 h-8 text-amber-500" />
            </div>

            <h2 className={styles.title}>Multiplayer MCQ Arena</h2>
            <p className={styles.description}>
              Test your knowledge in real-time head-to-head match play! Battle players, score
              correct answers fast for maximum speed bonus points, and rank up.
            </p>

            {/* Subject Selector */}
            <div className={styles.inviteSection}>
              <div className="text-left">
                <label className="text-zinc-400 text-sm font-bold block mb-3">
                  Choose Arena Topic
                </label>
                <div className={styles.subjectGrid}>
                  {SUBJECTS.map((subject) => (
                    <button
                      key={subject.id}
                      onClick={() => setSelectedSubject(subject.id)}
                      className={`${styles.subjectBtn} ${selectedSubject === subject.id ? styles.subjectSelected : ''}`}
                    >
                      {subject.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => joinQueue(selectedSubject)}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-rose-500 text-black font-bold rounded-2xl shadow-lg shadow-amber-500/10 hover:brightness-110 transition-all flex items-center justify-center gap-2 text-lg cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                Find Match Now
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
