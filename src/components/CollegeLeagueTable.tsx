import { motion } from 'framer-motion';
import { Trophy, Users, Building2, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export interface CollegeLeagueEntry {
  id: string;
  name: string;
  code: string;
  totalScore: number;
  playerCount: number;
  avgScore: number;
  roomsPlayed: number;
}

const SAMPLE_LEAGUE: CollegeLeagueEntry[] = [
  { id: 'col-1', name: 'IIT Bombay', code: 'IITB', totalScore: 84520, playerCount: 142, avgScore: 595, roomsPlayed: 38 },
  { id: 'col-2', name: 'BITS Pilani', code: 'BITS', totalScore: 78300, playerCount: 128, avgScore: 612, roomsPlayed: 35 },
  { id: 'col-3', name: 'NIT Trichy', code: 'NITT', totalScore: 72150, playerCount: 110, avgScore: 656, roomsPlayed: 29 },
  { id: 'col-4', name: 'VIT Vellore', code: 'VITV', totalScore: 64800, playerCount: 95, avgScore: 682, roomsPlayed: 24 },
  { id: 'col-5', name: 'SRM Chennai', code: 'SRMC', totalScore: 51200, playerCount: 78, avgScore: 656, roomsPlayed: 18 },
];

interface CollegeLeagueTableProps {
  entries?: CollegeLeagueEntry[];
}

export function CollegeLeagueTable({ entries = SAMPLE_LEAGUE }: CollegeLeagueTableProps) {
  const maxScore = Math.max(...entries.map(e => e.totalScore));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Building2 className="text-primary-600" size={24} />
        <h2 className="text-xl font-bold text-slate-900 font-display">College League Table</h2>
      </div>
      <p className="text-sm text-slate-500 -mt-2">Aggregate scores across all rooms per college</p>

      <div className="flex flex-col gap-3">
        {entries.map((entry, idx) => {
          const isTop = idx === 0;
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
            >
              <Card hover className="overflow-hidden">
                <div className="flex items-center gap-4 p-4 sm:p-5">
                  {/* Rank medal */}
                  <div className={`flex items-center justify-center w-12 h-12 rounded-2xl font-display font-bold text-xl flex-shrink-0 ${
                    isTop ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/30' :
                    idx === 1 ? 'bg-slate-300 text-white' :
                    idx === 2 ? 'bg-amber-600 text-white' :
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {isTop ? <Trophy size={22} /> : idx + 1}
                  </div>

                  {/* College info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-slate-900 text-base sm:text-lg truncate">{entry.name}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500">{entry.code}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1"><Users size={12} /> {entry.playerCount} players</span>
                      <span className="flex items-center gap-1"><TrendingUp size={12} /> {entry.roomsPlayed} rooms</span>
                      <span>Avg {entry.avgScore}</span>
                    </div>
                  </div>

                  {/* Score bar */}
                  <div className="hidden sm:block flex-shrink-0 w-32">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${isTop ? 'bg-accent-500' : 'bg-primary-500'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(entry.totalScore / maxScore) * 100}%` }}
                        transition={{ delay: idx * 0.08 + 0.2, duration: 0.6 }}
                      />
                    </div>
                  </div>

                  {/* Total score */}
                  <div className="text-right flex-shrink-0">
                    <div className="font-display font-bold text-xl sm:text-2xl text-slate-900 tabular-nums">
                      {entry.totalScore.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">total pts</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
