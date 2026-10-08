import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, Image as ImageIcon } from 'lucide-react';

interface QuestionViewProps {
  questionId: string;
  text: string;
  imageUrl?: string;
  options: string[];
  durationMs: number;
  serverStartTime: number;
  questionIndex: number;
  totalQuestions: number;
  topic: string;
  difficulty: string;
  onAnswer: (selectedOption: number, responseTimeMs: number) => void;
  answered: boolean;
  selectedOption: number | null;
  revealCorrect?: number | null;
  isHost?: boolean;
}

export function QuestionView({
  text,
  imageUrl,
  options,
  durationMs,
  serverStartTime,
  questionIndex,
  totalQuestions,
  topic,
  difficulty,
  onAnswer,
  answered,
  selectedOption,
  revealCorrect,
  isHost,
}: QuestionViewProps) {
  const [timeRemaining, setTimeRemaining] = useState(1);
  const rafRef = useRef<number>(0);
  const answeredRef = useRef(answered);
  answeredRef.current = answered;

  const updateTimer = useCallback(() => {
    const elapsed = Date.now() - serverStartTime;
    const remaining = Math.max(0, 1 - elapsed / durationMs);
    setTimeRemaining(remaining);
    if (remaining > 0) {
      rafRef.current = requestAnimationFrame(updateTimer);
    }
  }, [serverStartTime, durationMs]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(updateTimer);
    return () => cancelAnimationFrame(rafRef.current);
  }, [updateTimer]);

  const secondsLeft = Math.ceil(timeRemaining * (durationMs / 1000));
  const isUrgent = timeRemaining < 0.25;

  const difficultyColor = difficulty === 'Easy' ? 'success' : difficulty === 'Medium' ? 'warning' : 'error';
  const difficultyClass = {
    success: 'bg-success-100 text-success-700',
    warning: 'bg-warning-100 text-warning-700',
    error: 'bg-error-100 text-error-700',
  }[difficultyColor];

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
      {/* Meta bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-100 text-primary-700">{topic}</span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${difficultyClass}`}>{difficulty}</span>
        </div>
        <span className="text-sm font-semibold text-slate-500">
          Question {questionIndex + 1} of {totalQuestions}
        </span>
      </div>

      {/* Timer bar */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-500">
            <Clock size={16} />
            <span className={`tabular-nums ${isUrgent ? 'text-error-500' : 'text-slate-600'}`}>{secondsLeft}s</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {isHost ? 'Hosting — answers hidden' : 'Answer fast for bonus points!'}
          </span>
        </div>
        <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${isUrgent ? 'bg-error-500' : timeRemaining < 0.5 ? 'bg-warning-400' : 'bg-primary-500'}`}
            style={{ width: `${timeRemaining * 100}%` }}
            transition={{ ease: 'linear' }}
          />
        </div>
      </div>

      {/* Question text */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8"
      >
        <p className="text-xl sm:text-2xl font-display font-semibold text-slate-900 leading-snug text-balance">
          {text}
        </p>
        {imageUrl && (
          <div className="mt-4 rounded-2xl overflow-hidden border border-slate-200">
            <img src={imageUrl} alt="Question visual" className="w-full max-h-64 object-contain bg-slate-50" />
          </div>
        )}
      </motion.div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {options.map((option, idx) => {
          const isSelected = selectedOption === idx;
          const isCorrect = revealCorrect === idx;
          const showCorrect = revealCorrect !== null && revealCorrect !== undefined;
          const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

          let stateClass = 'border-slate-200 bg-white hover:border-primary-400 hover:bg-primary-50/50 hover:shadow-md';
          if (showCorrect && isCorrect) {
            stateClass = 'border-success-400 bg-success-50 ring-2 ring-success-400/30';
          } else if (showCorrect && isSelected && !isCorrect) {
            stateClass = 'border-error-400 bg-error-50 ring-2 ring-error-400/30';
          } else if (isSelected) {
            stateClass = 'border-primary-500 bg-primary-50 ring-2 ring-primary-500/30';
          } else if (showCorrect) {
            stateClass = 'border-slate-200 bg-slate-50 opacity-60';
          }

          return (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
              disabled={answered || isHost}
              onClick={() => !answered && !isHost && onAnswer(idx, Date.now() - serverStartTime)}
              className={`relative flex items-center gap-3 p-4 sm:p-5 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.98] ${stateClass}`}
            >
              <div className={`flex items-center justify-center w-10 h-10 rounded-xl font-display font-bold text-base flex-shrink-0 ${
                showCorrect && isCorrect ? 'bg-success-500 text-white' :
                showCorrect && isSelected && !isCorrect ? 'bg-error-500 text-white' :
                isSelected ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {letters[idx]}
              </div>
              <span className="flex-1 text-base font-medium text-slate-800">{option}</span>
              <AnimatePresence>
                {showCorrect && isCorrect && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-success-600">
                    <Check size={22} />
                  </motion.span>
                )}
                {showCorrect && isSelected && !isCorrect && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-error-500">
                    <X size={22} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {!isHost && (
        <div className="text-center min-h-[24px]">
          <AnimatePresence mode="wait">
            {answered ? (
              <motion.p
                key="answered"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-sm font-semibold text-primary-600"
              >
                Answer locked in! Waiting for other players...
              </motion.p>
            ) : (
              <motion.p
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-slate-400"
              >
                Select your answer
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
