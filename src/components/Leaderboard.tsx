import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Minus, Check, X, Crown } from 'lucide-react';
import type { ScoreboardEntry } from '@/types';

interface LeaderboardProps {
  entries: ScoreboardEntry[];
  highlightPlayerId?: string;
  showRoundScore?: boolean;
  maxRows?: number;
  title?: string;
}

export function Leaderboard({
  entries,
  highlightPlayerId,
  showRoundScore = true,
  maxRows,
  title = 'Live Leaderboard',
}: LeaderboardProps) {
  const sorted = [...entries].sort((a, b) => a.rank - b.rank);
  const displayed = maxRows ? sorted.slice(0, maxRows) : sorted;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-1">
        <Trophy className="text-accent-500" size={22} />
        <h3 className="text-lg font-bold text-slate-900 font-display">{title}</h3>
      </div>

      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {displayed.map((entry, idx) => {
            const isHighlighted = entry.playerId === highlightPlayerId;
            const isTop = entry.rank === 1;

            return (
              <motion.div
                key={entry.playerId}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', damping: 20, stiffness: 260 }}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 border transition-colors ${
                  isHighlighted
                    ? 'border-primary-400 bg-primary-50 ring-2 ring-primary-400/30'
                    : isTop
                    ? 'border-accent-200 bg-accent-50'
                    : 'border-slate-200 bg-white'
                }`}
              >
                {/* Rank */}
                <div className={`flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0 font-display font-bold text-lg ${
                  isTop ? 'bg-accent-500 text-white' : entry.rank === 2 ? 'bg-slate-300 text-white' : entry.rank === 3 ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {isTop ? <Crown size={18} /> : entry.rank}
                </div>

                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full ${entry.avatarColor} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm`}>
                  {entry.name.charAt(0).toUpperCase()}
                </div>

                {/* Name & Round Score */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 truncate">
                      {entry.name}
                    </span>
                    {showRoundScore && entry.answered && (
                      entry.isCorrect ? (
                        <span className="inline-flex items-center gap-0.5 text-success-600">
                          <Check size={14} />
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-error-500">
                          <X size={14} />
                        </span>
                      )
                    )}
                  </div>
                  {showRoundScore && (
                    <span className={`text-xs font-medium ${entry.roundScore > 0 ? 'text-success-600' : entry.roundScore < 0 ? 'text-error-500' : 'text-slate-400'}`}>
                      {entry.roundScore > 0 ? `+${entry.roundScore}` : entry.roundScore} pts this round
                    </span>
                  )}
                </div>

                {/* Rank Delta */}
                {showRoundScore && (
                  <div className="flex items-center gap-1 flex-shrink-0 w-12 justify-end">
                    {entry.rankDelta > 0 ? (
                      <span className="flex items-center gap-0.5 text-success-600 text-xs font-bold">
                        <TrendingUp size={14} />
                        {entry.rankDelta}
                      </span>
                    ) : entry.rankDelta < 0 ? (
                      <span className="flex items-center gap-0.5 text-error-500 text-xs font-bold">
                        <TrendingDown size={14} />
                        {Math.abs(entry.rankDelta)}
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-slate-300 text-xs">
                        <Minus size={14} />
                      </span>
                    )}
                  </div>
                )}

                {/* Total Score */}
                <div className="text-right flex-shrink-0 w-24">
                  <div className="font-display font-bold text-lg text-slate-900 tabular-nums">
                    {entry.totalScore.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">total</div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
