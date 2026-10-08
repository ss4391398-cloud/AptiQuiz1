import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Plus, Edit3, Trash2, GripVertical, Eye, Play, ArrowLeft,
  Users, Hash, Clock, ChevronUp, ChevronDown, Copy, Check,
  Trophy, BarChart3, Settings, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, Badge } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Leaderboard } from '@/components/Leaderboard';
import { QuestionView } from '@/components/QuestionView';
import { CollegeLeagueTable } from '@/components/CollegeLeagueTable';
import { SAMPLE_SETS, SAMPLE_COLLEGES } from '@/data/questions';
import { generateRoomCode, pickAvatarColor, computeScore, shuffleOptions } from '@/lib/gameUtils';
import type { QuestionSet, Question, Topic, Difficulty, ScoreboardEntry } from '@/types';

type HostScreen = 'dashboard' | 'editor' | 'lobby' | 'question' | 'scoreboard' | 'final' | 'league';

interface HostPanelProps {
  onBack: () => void;
}

export function HostPanel({ onBack }: HostPanelProps) {
  const [screen, setScreen] = useState<HostScreen>('dashboard');
  const [sets, setSets] = useState<QuestionSet[]>(SAMPLE_SETS);
  const [editingSet, setEditingSet] = useState<QuestionSet | null>(null);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [roomCode, setRoomCode] = useState('');
  const [activeSet, setActiveSet] = useState<QuestionSet | null>(null);
  const [playerNames, setPlayerNames] = useState<string[]>(['Demo Student']);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [scoreboard, setScoreboard] = useState<ScoreboardEntry[]>([]);
  const [playerScores, setPlayerScores] = useState<Map<string, number>>(new Map());
  const [prevRanks, setPrevRanks] = useState<Map<string, number>>(new Map());
  const [copied, setCopied] = useState(false);

  // ─── Dashboard ──────────────────────────────────────────
  if (screen === 'dashboard') {
    return (
      <HostLayout onBack={onBack} title="Host Dashboard" icon={Brain}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 font-display">Question Sets</h2>
              <Button size="sm" onClick={() => {
                const newSet: QuestionSet = {
                  id: `set-${Date.now()}`,
                  title: 'Untitled Set',
                  topic: 'Quant',
                  difficulty: 'Easy',
                  createdById: 'host-1',
                  questions: [],
                };
                setEditingSet(newSet);
                setScreen('editor');
              }}>
                <Plus size={16} /> New Set
              </Button>
            </div>
            <div className="flex flex-col gap-3">
              {sets.map(set => (
                <Card key={set.id} hover className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-bold text-slate-900 truncate">{set.title}</h3>
                        <Badge color="primary">{set.topic}</Badge>
                        <Badge color={set.difficulty === 'Easy' ? 'success' : set.difficulty === 'Medium' ? 'warning' : 'error'}>
                          {set.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400 mt-1">{set.questions.length} questions</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setPreviewQuestion(set.questions[0] || null)} disabled={!set.questions.length}>
                        <Eye size={16} />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => { setEditingSet(set); setScreen('editor'); }}>
                        <Edit3 size={16} />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-error-500 hover:bg-error-50" onClick={() => {
                        setSets(prev => prev.filter(s => s.id !== set.id));
                      }}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick actions sidebar */}
          <div className="flex flex-col gap-4">
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="text-accent-500" size={20} />
                <h3 className="font-bold text-slate-900 font-display">Quick Start</h3>
              </div>
              <p className="text-sm text-slate-500 mb-4">Pick a set and generate a room code instantly.</p>
              <Select
                value={activeSet?.id ?? ''}
                onChange={e => {
                  const s = sets.find(s => s.id === e.target.value);
                  setActiveSet(s || null);
                }}
              >
                <option value="">Select question set...</option>
                {sets.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </Select>
              <Button
                fullWidth
                className="mt-3"
                disabled={!activeSet}
                onClick={() => {
                  const code = generateRoomCode();
                  setRoomCode(code);
                  setPlayerScores(new Map());
                  setPrevRanks(new Map());
                  setPlayerNames(['Demo Student']);
                  setScreen('lobby');
                }}
              >
                <Play size={16} /> Create Room
              </Button>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="text-primary-600" size={20} />
                <h3 className="font-bold text-slate-900 font-display">College League</h3>
              </div>
              <p className="text-sm text-slate-500 mb-3">View aggregate scores across colleges.</p>
              <Button fullWidth variant="secondary" onClick={() => setScreen('league')}>
                View League Table
              </Button>
            </Card>
          </div>
        </div>

        <Modal open={!!previewQuestion} onClose={() => setPreviewQuestion(null)} title="Question Preview">
          {previewQuestion && (
            <div className="flex flex-col gap-4">
              <p className="text-lg font-semibold text-slate-900">{previewQuestion.text}</p>
              <div className="grid grid-cols-1 gap-2">
                {previewQuestion.options.map((opt, i) => (
                  <div key={i} className={`p-3 rounded-xl border-2 ${i === previewQuestion.correctOptionIndex ? 'border-success-400 bg-success-50' : 'border-slate-200 bg-white'}`}>
                    <span className="font-medium text-slate-700">{opt}</span>
                    {i === previewQuestion.correctOptionIndex && <Check className="inline ml-2 text-success-600" size={16} />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal>
      </HostLayout>
    );
  }

  // ─── Editor ─────────────────────────────────────────────
  if (screen === 'editor' && editingSet) {
    return (
      <QuestionSetEditor
        set={editingSet}
        onBack={() => setScreen('dashboard')}
        onSave={(updated) => {
          setSets(prev => {
            const exists = prev.find(s => s.id === updated.id);
            if (exists) return prev.map(s => s.id === updated.id ? updated : s);
            return [...prev, updated];
          });
          setScreen('dashboard');
        }}
      />
    );
  }

  // ─── Lobby ──────────────────────────────────────────────
  if (screen === 'lobby' && activeSet) {
    return (
      <HostLayout onBack={() => setScreen('dashboard')} title="Room Lobby" icon={Hash}>
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          {/* Room code card */}
          <Card className="p-8 text-center bg-gradient-to-br from-primary-600 to-primary-800 border-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid opacity-10" />
            <div className="relative">
              <p className="text-primary-100 text-sm font-semibold uppercase tracking-wider mb-2">Room Code</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-5xl sm:text-6xl font-display font-extrabold text-white tracking-wider tabular-nums">
                  {roomCode}
                </span>
                <button
                  onClick={() => { navigator.clipboard?.writeText(roomCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>
              <p className="text-primary-200 text-sm mt-3">Share this code with players to join</p>
            </div>
          </Card>

          {/* Set info */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 font-display">{activeSet.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge color="primary">{activeSet.topic}</Badge>
                  <Badge color={activeSet.difficulty === 'Easy' ? 'success' : activeSet.difficulty === 'Medium' ? 'warning' : 'error'}>{activeSet.difficulty}</Badge>
                  <span className="text-sm text-slate-400">{activeSet.questions.length} questions</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Players list */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="text-slate-400" size={20} />
              <h3 className="font-bold text-slate-900 font-display">Players ({playerNames.length})</h3>
            </div>
            <div className="flex flex-col gap-2">
              {playerNames.map((name, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50">
                  <div className={`w-8 h-8 rounded-full ${pickAvatarColor(i)} flex items-center justify-center text-white font-bold text-xs`}>
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-slate-700 text-sm">{name}</span>
                  <span className="ml-auto text-xs text-success-600 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-success-500" /> Connected
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Button size="xl" fullWidth onClick={() => { setCurrentQIndex(0); setScreen('question'); }}>
            <Play size={20} /> Start Game
          </Button>
        </div>
      </HostLayout>
    );
  }

  // ─── Question (Host view) ───────────────────────────────
  if (screen === 'question' && activeSet) {
    const question = activeSet.questions[currentQIndex];
    const { shuffled, newCorrectIndex } = shuffleOptions(question.options, question.correctOptionIndex);

    return (
      <HostLayout onBack={() => setScreen('lobby')} title="Question Control" icon={Clock}>
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <Badge color="primary">Question {currentQIndex + 1} / {activeSet.questions.length}</Badge>
            <Button size="sm" variant="secondary" onClick={() => {
              // End question -> go to scoreboard
              generateScoreboard(playerNames, playerScores, prevRanks, question, newCorrectIndex, setScoreboard, setPrevRanks);
              setScreen('scoreboard');
            }}>
              Show Results <Trophy size={14} />
            </Button>
          </div>

          <div className="bg-primary-50 border border-primary-200 rounded-2xl p-4 flex items-center gap-3">
            <Settings className="text-primary-600 flex-shrink-0" size={20} />
            <p className="text-sm text-primary-700 font-medium">
              Host view: correct answer is hidden from players. Options are shuffled independently per player connection.
            </p>
          </div>

          <QuestionView
            questionId={question.id}
            text={question.text}
            imageUrl={question.imageUrl}
            options={shuffled}
            durationMs={question.timeLimitSeconds * 1000}
            serverStartTime={Date.now()}
            questionIndex={currentQIndex}
            totalQuestions={activeSet.questions.length}
            topic={activeSet.topic}
            difficulty={activeSet.difficulty}
            onAnswer={() => {}}
            answered={false}
            selectedOption={null}
            isHost
          />

          <div className="text-center">
            <Button size="lg" onClick={() => {
              generateScoreboard(playerNames, playerScores, prevRanks, question, newCorrectIndex, setScoreboard, setPrevRanks);
              setScreen('scoreboard');
            }}>
              End Question & Show Leaderboard
            </Button>
          </div>
        </div>
      </HostLayout>
    );
  }

  // ─── Scoreboard ─────────────────────────────────────────
  if (screen === 'scoreboard' && activeSet) {
    const isLast = currentQIndex + 1 >= activeSet.questions.length;
    return (
      <HostLayout onBack={() => setScreen('dashboard')} title="Round Scoreboard" icon={Trophy}>
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          <div className="text-center">
            <Badge color="primary">Question {currentQIndex + 1} Results</Badge>
          </div>
          <Leaderboard entries={scoreboard} title="Live Standings" />
          <Button
            size="xl"
            fullWidth
            onClick={() => {
              if (isLast) {
                setScreen('final');
              } else {
                setCurrentQIndex(i => i + 1);
                setScreen('question');
              }
            }}
          >
            {isLast ? <><Trophy size={20} /> Show Final Results</> : <><Play size={20} /> Next Question</>}
          </Button>
        </div>
      </HostLayout>
    );
  }

  // ─── Final ──────────────────────────────────────────────
  if (screen === 'final' && activeSet) {
    return (
      <HostLayout onBack={() => setScreen('dashboard')} title="Game Summary" icon={BarChart3}>
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-accent-500 shadow-lg shadow-accent-500/30 mb-3">
              <Trophy className="text-white" size={32} />
            </div>
            <h2 className="text-2xl font-display font-bold text-slate-900">Game Complete!</h2>
            <p className="text-slate-500 mt-1">{activeSet.title} — {activeSet.questions.length} questions</p>
          </div>
          <Leaderboard entries={scoreboard} title="Final Standings" showRoundScore={false} />
          <div className="flex gap-3">
            <Button fullWidth variant="secondary" onClick={() => setScreen('league')}>
              <BarChart3 size={18} /> View College League
            </Button>
            <Button fullWidth onClick={() => setScreen('dashboard')}>
              <Brain size={18} /> Back to Dashboard
            </Button>
          </div>
        </div>
      </HostLayout>
    );
  }

  // ─── League ─────────────────────────────────────────────
  if (screen === 'league') {
    return (
      <HostLayout onBack={() => setScreen('dashboard')} title="College League" icon={BarChart3}>
        <div className="max-w-3xl mx-auto">
          <CollegeLeagueTable />
        </div>
      </HostLayout>
    );
  }

  return null;
}

// ─── Host Layout wrapper ───────────────────────────────────
function HostLayout({ children, onBack, title, icon: Icon }: { children: React.ReactNode; onBack: () => void; title: string; icon: React.ComponentType<{ size?: number; className?: string }> }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button size="sm" variant="ghost" onClick={onBack}><ArrowLeft size={16} /> Back</Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <Icon size={18} className="text-white" />
              </div>
              <span className="font-display font-bold text-slate-900">{title}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge color="accent"><Zap size={10} /> Host Mode</Badge>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </div>
    </div>
  );
}

// ─── Scoreboard helper ────────────────────────────────────
function generateScoreboard(
  names: string[],
  scores: Map<string, number>,
  prevRanks: Map<string, number>,
  question: Question,
  correctIndex: number,
  setScoreboard: (s: ScoreboardEntry[]) => void,
  setPrevRanks: (m: Map<string, number>) => void,
) {
  // Simulate results for demo: assign random scores
  const entries: ScoreboardEntry[] = names.map((name, i) => {
    const playerId = `player-${i}`;
    const oldScore = scores.get(playerId) ?? 0;
    const isCorrect = Math.random() < 0.6;
    const responseTimeMs = 2000 + Math.random() * 10000;
    const roundScore = isCorrect ? computeScore(true, responseTimeMs, question.timeLimitSeconds * 1000) : 0;
    const totalScore = oldScore + roundScore;
    scores.set(playerId, totalScore);
    return {
      playerId,
      name,
      avatarColor: pickAvatarColor(i),
      totalScore,
      roundScore,
      rank: 0,
      previousRank: prevRanks.get(playerId) ?? 0,
      rankDelta: 0,
      isCorrect,
      selectedOption: isCorrect ? correctIndex : (correctIndex + 1) % 4,
      correctOptionIndex: correctIndex,
      responseTimeMs,
      answered: true,
    };
  });

  // Compute ranks
  const sorted = [...entries].sort((a, b) => b.totalScore - a.totalScore);
  const newPrevRanks = new Map(prevRanks);
  sorted.forEach((entry, idx) => {
    entry.rank = idx + 1;
    entry.rankDelta = (newPrevRanks.get(entry.playerId) ?? idx + 1) - entry.rank;
    newPrevRanks.set(entry.playerId, entry.rank);
  });

  setPrevRanks(newPrevRanks);
  setScoreboard(entries);
}

// ─── Question Set Editor ──────────────────────────────────
function QuestionSetEditor({ set, onBack, onSave }: { set: QuestionSet; onBack: () => void; onSave: (s: QuestionSet) => void }) {
  const [draft, setDraft] = useState<QuestionSet>({ ...set, questions: [...set.questions] });
  const [editingQ, setEditingQ] = useState<Question | null>(null);
  const [editIndex, setEditIndex] = useState(-1);

  const updateQuestion = (idx: number, updated: Question) => {
    setDraft(prev => ({ ...prev, questions: prev.questions.map((q, i) => i === idx ? updated : q) }));
  };

  const addQuestion = () => {
    const newQ: Question = {
      id: `q-${Date.now()}`,
      setId: draft.id,
      text: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      timeLimitSeconds: 15,
    };
    setDraft(prev => ({ ...prev, questions: [...prev.questions, newQ] }));
  };

  const removeQuestion = (idx: number) => {
    setDraft(prev => ({ ...prev, questions: prev.questions.filter((_, i) => i !== idx) }));
  };

  const moveQuestion = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= draft.questions.length) return;
    setDraft(prev => {
      const qs = [...prev.questions];
      [qs[idx], qs[newIdx]] = [qs[newIdx], qs[idx]];
      return { ...prev, questions: qs };
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button size="sm" variant="ghost" onClick={onBack}><ArrowLeft size={16} /> Back</Button>
            <span className="font-display font-bold text-slate-900">Question Set Editor</span>
          </div>
          <Button size="sm" onClick={() => onSave(draft)}><Check size={16} /> Save Set</Button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Set metadata */}
        <Card className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Title" value={draft.title} onChange={e => setDraft(prev => ({ ...prev, title: e.target.value }))} />
            <Select label="Topic" value={draft.topic} onChange={e => setDraft(prev => ({ ...prev, topic: e.target.value as Topic }))}>
              <option value="Quant">Quant</option>
              <option value="Logical">Logical</option>
              <option value="Verbal">Verbal</option>
              <option value="DI">DI</option>
            </Select>
            <Select label="Difficulty" value={draft.difficulty} onChange={e => setDraft(prev => ({ ...prev, difficulty: e.target.value as Difficulty }))}>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </Select>
          </div>
        </Card>

        {/* Questions list */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 font-display">Questions ({draft.questions.length})</h2>
          <Button size="sm" onClick={addQuestion}><Plus size={16} /> Add Question</Button>
        </div>

        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {draft.questions.map((qst, idx) => (
              <motion.div
                key={qst.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center gap-1 pt-1">
                      <button onClick={() => moveQuestion(idx, -1)} disabled={idx === 0} className="p-1 rounded hover:bg-slate-100 text-slate-400 disabled:opacity-30">
                        <ChevronUp size={16} />
                      </button>
                      <GripVertical size={16} className="text-slate-300" />
                      <button onClick={() => moveQuestion(idx, 1)} disabled={idx === draft.questions.length - 1} className="p-1 rounded hover:bg-slate-100 text-slate-400 disabled:opacity-30">
                        <ChevronDown size={16} />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-400">Q{idx + 1}</span>
                        <Badge color="slate"><Clock size={10} /> {qst.timeLimitSeconds}s</Badge>
                      </div>
                      <p className="font-medium text-slate-800 text-sm line-clamp-2">{qst.text || '(empty question)'}</p>
                      <p className="text-xs text-slate-400 mt-1">{qst.options.length} options — correct: {String.fromCharCode(65 + qst.correctOptionIndex)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => { setEditingQ(qst); setEditIndex(idx); }}><Edit3 size={16} /></Button>
                      <Button size="sm" variant="ghost" className="text-error-500 hover:bg-error-50" onClick={() => removeQuestion(idx)}><Trash2 size={16} /></Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {draft.questions.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-slate-400">No questions yet. Click "Add Question" to start.</p>
          </Card>
        )}
      </div>

      {/* Question edit modal */}
      <Modal open={!!editingQ} onClose={() => setEditingQ(null)} title={`Edit Question ${editIndex + 1}`} maxWidth="max-w-xl">
        {editingQ && (
          <QuestionEditForm
            question={editingQ}
            onSave={(updated) => { updateQuestion(editIndex, updated); setEditingQ(null); }}
          />
        )}
      </Modal>
    </div>
  );
}

function QuestionEditForm({ question, onSave }: { question: Question; onSave: (q: Question) => void }) {
  const [draft, setDraft] = useState<Question>({ ...question });
  return (
    <div className="flex flex-col gap-4">
      <Input label="Question Text" value={draft.text} onChange={e => setDraft(prev => ({ ...prev, text: e.target.value }))} />
      <Input label="Image URL (optional)" value={draft.imageUrl ?? ''} onChange={e => setDraft(prev => ({ ...prev, imageUrl: e.target.value || undefined }))} placeholder="https://..." />
      <div>
        <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Options (click the radio to mark correct)</label>
        <div className="flex flex-col gap-2">
          {draft.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                checked={draft.correctOptionIndex === i}
                onChange={() => setDraft(prev => ({ ...prev, correctOptionIndex: i }))}
                className="w-5 h-5 accent-primary-600"
              />
              <input
                value={opt}
                onChange={e => setDraft(prev => ({ ...prev, options: prev.options.map((o, j) => j === i ? e.target.value : o) }))}
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
              {draft.options.length > 2 && (
                <button
                  onClick={() => setDraft(prev => ({
                    ...prev,
                    options: prev.options.filter((_, j) => j !== i),
                    correctOptionIndex: prev.correctOptionIndex >= i ? Math.max(0, prev.correctOptionIndex - 1) : prev.correctOptionIndex,
                  }))}
                  className="p-1.5 rounded-lg hover:bg-error-50 text-error-500"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
        {draft.options.length < 6 && (
          <Button size="sm" variant="ghost" className="mt-2" onClick={() => setDraft(prev => ({ ...prev, options: [...prev.options, ''] }))}>
            <Plus size={14} /> Add Option
          </Button>
        )}
      </div>
      <Select label="Time Limit (seconds)" value={String(draft.timeLimitSeconds)} onChange={e => setDraft(prev => ({ ...prev, timeLimitSeconds: parseInt(e.target.value) }))}>
        <option value="10">10 seconds</option>
        <option value="15">15 seconds</option>
        <option value="20">20 seconds</option>
        <option value="30">30 seconds</option>
        <option value="60">60 seconds</option>
      </Select>
      <Button fullWidth onClick={() => onSave(draft)}><Check size={16} /> Save Question</Button>
    </div>
  );
}
