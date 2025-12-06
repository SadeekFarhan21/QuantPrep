'use client';

import { useState, useEffect, useCallback } from 'react';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import combinationsData from '@/data/combinations.json';
import factorialsData from '@/data/factorials.json';

type CombinationsData = {
  [n: string]: {
    [k: string]: number;
  };
};

type FactorialsData = {
  [n: string]: number;
};

const combinations = combinationsData as CombinationsData;
const factorials = factorialsData as FactorialsData;

type ProblemType = 'combination' | 'factorial';

type Problem =
  | { type: 'combination'; n: number; k: number }
  | { type: 'factorial'; n: number };

function getRandomProblem(): Problem {
  const problemType: ProblemType = Math.random() < 0.5 ? 'combination' : 'factorial';

  if (problemType === 'combination') {
    const n = Math.floor(Math.random() * 10) + 1; // 1 to 10
    const k = Math.floor(Math.random() * (n + 1)); // 0 to n
    return { type: 'combination', n, k };
  } else {
    const n = Math.floor(Math.random() * 11); // 0 to 10
    return { type: 'factorial', n };
  }
}

export default function Home() {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [highestScore, setHighestScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  // Generate initial problem only on client side to avoid hydration mismatch
  useEffect(() => {
    if (problem === null) {
      setProblem(getRandomProblem());
    }
  }, [problem]);

  const correctAnswer = problem
    ? problem.type === 'combination'
      ? combinations[problem.n.toString()][problem.k.toString()]
      : factorials[problem.n.toString()]
    : null;

  const handleNext = useCallback(() => {
    setProblem(getRandomProblem());
    setAnswer('');
    setFeedback(null);
    setIsCorrect(null);
    setAttempts(0);
  }, []);

  // Auto-advance to next problem when answer is correct
  useEffect(() => {
    if (isCorrect) {
      // Move to next problem immediately without showing success message
      handleNext();
    }
  }, [isCorrect, handleNext]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem || correctAnswer === null) return;

    const userAnswer = parseInt(answer.trim(), 10);

    if (isNaN(userAnswer)) {
      setFeedback('Please enter a valid number');
      setIsCorrect(false);
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (userAnswer === correctAnswer) {
      let pointsToAdd = 0;
      if (newAttempts === 1) {
        // First try correct: 1 point
        pointsToAdd = 1;
      } else if (newAttempts === 2) {
        // Second try correct: 0.5 points
        pointsToAdd = 0.5;
      }

      const newStreak = currentStreak + pointsToAdd;
      setCurrentStreak(newStreak);
      if (newStreak > highestScore) {
        setHighestScore(newStreak);
      }
      setIsCorrect(true);
      // Auto-advance will be handled by useEffect (no feedback shown)
    } else {
      if (newAttempts === 2) {
        // Second try wrong: reset streak to 0
        setCurrentStreak(0);
        setFeedback('Wrong answer');
        setIsCorrect(false);
      } else {
        // First try wrong: allow second attempt
        setFeedback('Wrong answer');
        setIsCorrect(false);
      }
    }
  };


  const handleTryAgain = () => {
    setAnswer('');
    setFeedback(null);
    setIsCorrect(null);
    // Keep attempts count for second try
  };

  const latexFormula = problem
    ? problem.type === 'combination'
      ? `\\binom{${problem.n}}{${problem.k}}`
      : `${problem.n}!`
    : `1!`;

  if (!problem) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-8 px-4 sm:py-16 sm:px-8 md:py-32 md:px-16 bg-white dark:bg-black">
          <div className="text-lg text-zinc-600 dark:text-zinc-400">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-8 px-4 sm:py-16 sm:px-8 md:py-32 md:px-16 bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-4 sm:gap-6 md:gap-8 text-center w-full">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-black dark:text-zinc-50 px-4">
            Math Practice
          </h1>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 text-base sm:text-lg font-medium w-full sm:w-auto px-4">
            <div className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-700 dark:text-blue-300">
              Current: {currentStreak % 1 === 0 ? currentStreak : currentStreak.toFixed(1)}
            </div>
            <div className="px-3 py-2 sm:px-4 sm:py-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-700 dark:text-purple-300">
              Best: {highestScore % 1 === 0 ? highestScore : highestScore.toFixed(1)}
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 sm:gap-6 w-full px-4">
            <div className="py-4 sm:py-6 md:py-8" style={{ fontSize: 'clamp(2rem, 8vw, 4rem)' }}>
              <BlockMath math={latexFormula} />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3 sm:gap-4 w-full max-w-sm mt-4 sm:mt-6 md:mt-8">
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter your answer"
                className="w-full px-4 py-3 text-base sm:text-lg text-center border-2 border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                autoFocus
              />

              <button
                type="submit"
                className="w-full px-6 py-3 text-base sm:text-lg bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Check Answer
              </button>
            </form>

            {feedback && !isCorrect && (
              <div
                className="text-base sm:text-lg font-medium px-4 py-2 rounded-lg text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 w-full max-w-sm"
              >
                {feedback}
              </div>
            )}

            {feedback && !isCorrect && (
              <div className="flex flex-col gap-3 items-center w-full max-w-sm px-4">
                {attempts === 1 && (
                  <div className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                    Try again
                  </div>
                )}
                {attempts === 1 && (
                  <button
                    onClick={handleTryAgain}
                    className="w-full px-6 py-3 text-base sm:text-lg bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                )}
                {attempts === 2 && (
                  <button
                    onClick={handleNext}
                    className="w-full px-6 py-3 text-base sm:text-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-black dark:text-zinc-50 font-medium rounded-lg transition-colors"
                  >
                    Next Problem
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
