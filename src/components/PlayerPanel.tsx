import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, ArrowLeft, Hash, Users, Clock, Trophy, Check, X,
  TrendingUp, Target, Zap, BarChart3, RotateCcw, Home, Wifi, WifiOff,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, Badge } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Leaderboard } from '@/components/Leaderboard';
import { QuestionView } from '@/components/QuestionView';
import { SAMPLE_SETS, SAMPLE_COLLEGES } from '@/data/questions';
import { generateRoomCode, pickAvatarColor, shuffleOptions, computeScore, formatMs } from '@/lib/gameUtils';
import type { ScoreboardEntry, GameSummary, Topic, QuestionSet, Player } from '@/types';
import {
  createDemoRoom, startNextQuestion, submitAnswer, processBotAnswers,
  endRound, computeFinalSummary, advanceToNextOrFinish,
  type DemoRoomState,
} from '@/lib/demoEngine';

type PlayerScreen = 'join' | 'lobby' | 'question' | 'scoreboard' | 'final';

interface PlayerPanelProps {
  onBack: () => void;
}

export function PlayerPanel({ onBack }: PlayerPanelProps) {
  const [screen, setScreen] = useState<PlayerScreen>('join');
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [error, setError] = useState('');
  const [room, setRoom] = useState<DemoRoomState | null>(null);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [serverStartTime, setServerStartTime] = useState(0);
  const [durationMs, setDurationMs] = useState(15000);
  const [answered, setAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [revealCorrect, setRevealCorrect] = useState<number | null>(null);
  const [scoreboard, setScoreboard] = useState<ScoreboardEntry[]>([]);
  const [summary, setSummary] = useState<GameSummary[]>([]);
  const [connected, setConnected] = useState(true);
  const botTimeoutsRef = useRef<number[]>([]);
  const roundTimerRef = useRef<number>(0);

  // ─── Join ───────────────────────────────────────────────
  if (screen === 'join') {
    const handleJoin = () => {
      if (!roomCode.trim()) { setError('Enter a room code'); return; }
      if (!playerName.trim()) { setError('Enter your name'); return; }

      // Simulate: create a demo room with the default set
      const set = SAMPLE_SETS[Math.floor(Math.random() * SAMPLE_SETS.length)];
      const demoRoom = createDemoRoom(roomCode.toUpperCase(), set, playerName, 7);
      setRoom(demoRoom);
      setConnected(true);
      setScreen('lobby');
    };

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <nav className="bg-white/80 backdrop-blur-lg border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
            <Button size="sm" variant="ghost" onClick={onBack}><ArrowLeft size={16} /> Back</Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <Brain size={18} className="text-white" />
              </div>
              <span className="font-display font-bold text-slate-900">Join Game</span>
            </div>
          </div>
        </nav>

        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
            <Card className="p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 shadow-lg shadow-primary-600/25 mb-3">
                  <Hash className="text-white" size={28} />
                </div>
                <h2 className="text-2xl font-display font-bold text-slate-900">Join a Quiz Room</h2>
                <p className="text-sm text-slate-500 mt-1">Enter the 6-character code from your host</p>
              </div>

              <div className="flex flex-col gap-4">
                <Input
                  label="Room Code"
                  value={roomCode}
                  onChange={e => { setRoomCode(e.target.value.toUpperCase()); setError(''); }}
                  placeholder="ABC123"
                  maxLength={6}
                  className="text-center text-2xl font-display font-bold tracking-widest uppercase"
                  onKeyDown={e => e.key === 'Enter' && handleJoin()}
                />
                <Input
                  label="Your Name"
                  value={playerName}
                  onChange={e => { setPlayerName(e.target.value); setError(''); }}
                  placeholder="John Doe"
                  onKeyDown={e => e.key === 'Enter' && handleJoin()}
                />
                <Select label="College (optional)" value={collegeId} onChange={e => setCollegeId(e.target.value)}>
                  <option value="">Select college...</option>
                  {SAMPLE_COLLEGES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>

                {error && <p className="text-sm text-error-600 font-medium text-center">{error}</p>}

                <Button size="lg" fullWidth onClick={handleJoin}>
                  <Zap size={18} /> Join Room
                </Button>

                <div className="text-center pt-2">
                  <p className="text-xs text-slate-400">No code? Try a demo: </p>
                  <button
                    className="text-sm text-primary-600 font-semibold hover:underline mt-1"
                    onClick={() => { setRoomCode(generateRoomCode()); setPlayerName('Demo Player'); }}
                  >
                    Generate demo code
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── Lobby ──────────────────────────────────────────────
  if (screen === 'lobby' && room) {
    return (
      <PlayerLayout onBack={onBack} title="Waiting Room" roomCode={room.roomCode} connected={connected}>
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          <Card className="p-8 text-center bg-gradient-to-br from-primary-600 to-primary-800 border-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid opacity-10" />
            <div className="relative">
              <p className="text-primary-100 text-sm font-semibold uppercase tracking-wider mb-2">Room Code</p>
              <span className="text-5xl font-display font-extrabold text-white tracking-wider tabular-nums">
                {room.roomCode}
              </span>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Brain className="text-primary-600" size={20} />
                <h3 className="font-bold text-slate-900 font-display">{room.questionSet.title}</h3>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge color="primary">{room.questionSet.topic}</Badge>
              <Badge color={room.questionSet.difficulty === 'Easy' ? 'success' : room.questionSet.difficulty === 'Medium' ? 'warning' : 'error'}>
                {room.questionSet.difficulty}
              </Badge>
              <span className="text-sm text-slate-400">{room.questionSet.questions.length} questions</span>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="text-slate-400" size={20} />
              <h3 className="font-bold text-slate-900 font-display">Players ({room.players.length})</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {room.players.map((p, i) => (
                <div key={p.id} className={`flex items-center gap-3 p-2.5 rounded-xl ${p.id === room.humanPlayerId ? 'bg-primary-50 ring-1 ring-primary-200' : 'bg-slate-50'}`}>
                  <div className={`w-8 h-8 rounded-full ${p.avatarColor} flex items-center justify-center text-white font-bold text-xs`}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-slate-700 text-sm truncate">{p.name}</span>
                  {p.id === room.humanPlayerId && <Badge color="primary" className="ml-auto text-[10px]">You</Badge>}
                </div>
              ))}
            </div>
          </Card>

          <div className="text-center">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-slate-400 text-sm font-medium"
            >
              Waiting for host to start the game...
            </motion.div>
          </div>

          {/* Demo: start button for player (simulates host starting) */}
          <Button size="lg" variant="secondary" fullWidth onClick={() => startGame()}>
            <Zap size={18} /> Start Game (Demo)
          </Button>
        </div>
      </PlayerLayout>
    );
  }

  // ─── Question ───────────────────────────────────────────
  if (screen === 'question' && room) {
    const question = room.questionSet.questions[room.currentQuestionIndex];
    return (
      <PlayerLayout onBack={onBack} title="Question" roomCode={room.roomCode} connected={connected}>
        <QuestionView
          questionId={question.id}
          text={question.text}
          imageUrl={question.imageUrl}
          options={currentOptions}
          durationMs={durationMs}
          serverStartTime={serverStartTime}
          questionIndex={room.currentQuestionIndex}
          totalQuestions={room.questionSet.questions.length}
          topic={room.questionSet.topic}
          difficulty={room.questionSet.difficulty}
          onAnswer={handleAnswer}
          answered={answered}
          selectedOption={selectedOption}
          revealCorrect={revealCorrect}
        />
      </PlayerLayout>
    );
  }

  // ─── Scoreboard ─────────────────────────────────────────
  if (screen === 'scoreboard' && room) {
    const isLast = room.currentQuestionIndex + 1 >= room.questionSet.questions.length;
    return (
      <PlayerLayout onBack={onBack} title="Round Results" roomCode={room.roomCode} connected={connected}>
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={room.currentQuestionIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Leaderboard entries={scoreboard} highlightPlayerId={room.humanPlayerId} />
            </motion.div>
          </AnimatePresence>

          <div className="text-center">
            <Button size="lg" onClick={() => {
              if (isLast) {
                const s = computeFinalSummary(room);
                setSummary(s);
                setScreen('final');
              } else {
                nextQuestion();
              }
            }}>
              {isLast ? <><Trophy size={18} /> View Final Results</> : <><Zap size={18} /> Next Question</>}
            </Button>
          </div>
        </div>
      </PlayerLayout>
    );
  }

  // ─── Final Summary ──────────────────────────────────────
  if (screen === 'final' && room) {
    const mySummary = summary.find(s => s.playerId === room.humanPlayerId);
    const myRank = summary.findIndex(s => s.playerId === room.humanPlayerId) + 1;
    return (
      <PlayerLayout onBack={onBack} title="Game Over" roomCode={room.roomCode} connected={connected}>
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          {mySummary && (
            <>
              {/* Hero stats */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-6 sm:p-8 text-center bg-gradient-to-br from-primary-600 to-primary-800 border-0 relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid opacity-10" />
                  <div className="relative">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-white/15 mb-3">
                      <Trophy className="text-white" size={32} />
                    </div>
                    <h2 className="text-3xl font-display font-extrabold text-white">You ranked #{myRank}!</h2>
                    <p className="text-primary-200 mt-1">Out of {room.players.length} players</p>
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div>
                        <div className="text-2xl font-display font-bold text-white tabular-nums">{mySummary.finalScore.toLocaleString()}</div>
                        <div className="text-xs text-primary-200 font-medium uppercase tracking-wide">Total Score</div>
                      </div>
                      <div>
                        <div className="text-2xl font-display font-bold text-white tabular-nums">{mySummary.accuracy.toFixed(0)}%</div>
                        <div className="text-xs text-primary-200 font-medium uppercase tracking-wide">Accuracy</div>
                      </div>
                      <div>
                        <div className="text-2xl font-display font-bold text-white tabular-nums">{formatMs(mySummary.avgResponseTimeMs)}</div>
                        <div className="text-xs text-primary-200 font-medium uppercase tracking-wide">Avg Speed</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Topic breakdown */}
              <Card className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="text-primary-600" size={20} />
                  <h3 className="font-bold text-slate-900 font-display">Topic Breakdown</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.entries(mySummary.topicBreakdown) as [Topic, { correct: number; total: number }][]).map(([topic, stats]) => (
                    <div key={topic} className="p-3 rounded-xl bg-slate-50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-700">{topic}</span>
                        <span className="text-xs text-slate-400">{stats.correct}/{stats.total}</span>
                      </div>
                      <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${stats.total > 0 ? (stats.correct / stats.total) * 100 : 0}%` }}
                          transition={{ duration: 0.6 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {/* Full standings */}
          <Leaderboard entries={scoreboard} highlightPlayerId={room.humanPlayerId} title="Final Standings" showRoundScore={false} />

          {/* Summary table for all players */}
          <Card className="p-5">
            <h3 className="font-bold text-slate-900 font-display mb-3">All Player Analytics</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 text-xs uppercase tracking-wide">
                    <th className="pb-2 pr-3">#</th>
                    <th className="pb-2 pr-3">Player</th>
                    <th className="pb-2 pr-3 text-right">Score</th>
                    <th className="pb-2 pr-3 text-right">Accuracy</th>
                    <th className="pb-2 pr-3 text-right">Avg Speed</th>
                    <th className="pb-2 text-right">Correct</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.map((s, i) => (
                    <tr key={s.playerId} className={`border-t border-slate-100 ${s.playerId === room.humanPlayerId ? 'bg-primary-50/50' : ''}`}>
                      <td className="py-2.5 pr-3 font-bold text-slate-400">{i + 1}</td>
                      <td className="py-2.5 pr-3 font-medium text-slate-700">{s.name}{s.playerId === room.humanPlayerId && ' (You)'}</td>
                      <td className="py-2.5 pr-3 text-right font-bold tabular-nums text-slate-900">{s.finalScore.toLocaleString()}</td>
                      <td className="py-2.5 pr-3 text-right tabular-nums text-slate-600">{s.accuracy.toFixed(0)}%</td>
                      <td className="py-2.5 pr-3 text-right tabular-nums text-slate-600">{formatMs(s.avgResponseTimeMs)}</td>
                      <td className="py-2.5 text-right tabular-nums text-slate-600">{s.correctCount}/{s.totalQuestions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button fullWidth variant="secondary" onClick={() => { resetGame(); setScreen('join'); }}>
              <RotateCcw size={18} /> Play Again
            </Button>
            <Button fullWidth onClick={onBack}>
              <Home size={18} /> Home
            </Button>
          </div>
        </div>
      </PlayerLayout>
    );
  }

  return null;

  // ─── Game logic functions ───────────────────────────────
  function startGame() {
    if (!room) return;
    const updated = { ...room };
    const payload = startNextQuestion(updated);
    setRoom({ ...updated });
    setCurrentOptions(payload.options);
    setServerStartTime(payload.serverStartTime);
    setDurationMs(payload.durationMs);
    setAnswered(false);
    setSelectedOption(null);
    setRevealCorrect(null);
    setScreen('question');

    // Start bot timers
    botTimeoutsRef.current = processBotAnswers(updated, (botId, selectedOpt, _rtt) => {
      const state = roomRef.current;
      if (!state) return;
      submitAnswer(state, botId, selectedOpt, Date.now());
      setRoom({ ...state });
    });

    // Auto-end round when timer expires
    roundTimerRef.current = window.setTimeout(() => {
      endCurrentRound();
    }, payload.durationMs + 500);
  }

  function nextQuestion() {
    if (!room) return;
    const updated = { ...room };
    const result = advanceToNextOrFinish(updated);
    if (result === 'FINISHED') {
      const s = computeFinalSummary(updated);
      setSummary(s);
      setRoom({ ...updated });
      setScreen('final');
      return;
    }
    const payload = startNextQuestion(updated);
    setRoom({ ...updated });
    setCurrentOptions(payload.options);
    setServerStartTime(payload.serverStartTime);
    setDurationMs(payload.durationMs);
    setAnswered(false);
    setSelectedOption(null);
    setRevealCorrect(null);
    setScreen('question');

    botTimeoutsRef.current = processBotAnswers(updated, (botId, selectedOpt) => {
      const state = roomRef.current;
      if (!state) return;
      submitAnswer(state, botId, selectedOpt, Date.now());
      setRoom({ ...state });
    });

    roundTimerRef.current = window.setTimeout(() => {
      endCurrentRound();
    }, payload.durationMs + 500);
  }

  function handleAnswer(selectedOpt: number, _responseTimeMs: number) {
    if (!room || answered) return;
    const updated = { ...room };
    const result = submitAnswer(updated, room.humanPlayerId, selectedOpt, Date.now());
    if (!result.accepted) return;
    setRoom({ ...updated });
    setAnswered(true);
    setSelectedOption(selectedOpt);
  }

  function endCurrentRound() {
    if (!room) return;
    botTimeoutsRef.current.forEach(t => clearTimeout(t));
    const updated = { ...room };
    const result = endRound(updated);
    setRoom({ ...updated });
    setScoreboard(result.scoreboard);
    setRevealCorrect(result.correctOptionIndex);
    setScreen('scoreboard');
  }

  function resetGame() {
    setRoom(null);
    setScoreboard([]);
    setSummary([]);
    setAnswered(false);
    setSelectedOption(null);
    setRevealCorrect(null);
    setRoomCode('');
    setPlayerName('');
  }

  // Keep a ref to room for bot callbacks
  const roomRef = useRef<DemoRoomState | null>(null);
  useEffect(() => { roomRef.current = room; }, [room]);

  // Simulate connection status flicker
  useEffect(() => {
    if (screen !== 'question' && screen !== 'scoreboard') return;
    const t = setTimeout(() => setConnected(true), 100);
    return () => clearTimeout(t);
  }, [screen]);

  // Cleanup
  useEffect(() => {
    return () => {
      botTimeoutsRef.current.forEach(t => clearTimeout(t));
      if (roundTimerRef.current) clearTimeout(roundTimerRef.current);
    };
  }, []);
}

// ─── Player Layout ─────────────────────────────────────────
function PlayerLayout({ children, onBack, title, roomCode, connected }: {
  children: React.ReactNode; onBack: () => void; title: string; roomCode: string; connected: boolean;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button size="sm" variant="ghost" onClick={onBack}><ArrowLeft size={16} /> Exit</Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <Brain size={18} className="text-white" />
              </div>
              <span className="font-display font-bold text-slate-900">{title}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge color="slate"><Hash size={10} /> {roomCode}</Badge>
            <span className={`flex items-center gap-1 text-xs font-semibold ${connected ? 'text-success-600' : 'text-error-500'}`}>
              {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
              {connected ? 'Connected' : 'Reconnecting...'}
            </span>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </div>
    </div>
  );
}
