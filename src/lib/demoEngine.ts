import type { QuestionSet, Player, ScoreboardEntry, GameSummary, Topic } from '@/types';
import { computeScore, shuffleOptions, pickAvatarColor } from './gameUtils';

export interface PlayerView {
  playerId: string;
  name: string;
  avatarColor: string;
}

export interface RoundResult {
  questionId: string;
  correctOptionIndex: number;
  scoreboard: ScoreboardEntry[];
}

export interface BotPlayer {
  id: string;
  name: string;
  color: string;
  skill: number;
  minDelay: number;
  maxDelay: number;
  answered: boolean;
}

const BOT_NAMES = [
  'Aarav', 'Diya', 'Vivaan', 'Ananya', 'Arjun', 'Sara', 'Kabir', 'Ishaan',
  'Maya', 'Rohan', 'Priya', 'Aryan', 'Neha', 'Krish', 'Tara', 'Dhruv',
  'Riya', 'Veer', 'Aisha', 'Karan', 'Sneha', 'Aditya', 'Pari', 'Isha',
  'Yash', 'Meera', 'Ayaan', 'Zara', 'Reyansh', 'Anika', 'Shaurya', 'Naira',
  'Vihaan', 'Myra', 'Arnav', 'Kiara', 'Atharv', 'Riyaan', 'Saanvi', 'Vedant',
  'Advik', 'Pavni', 'Naksh', 'Aadhya', ' Reyansh', 'Aaradhya', 'Krishna', 'Saanvi',
  'Raghav', 'Mahika',
];

let botCounter = 0;

export function makeBotPlayers(count: number): BotPlayer[] {
  botCounter = 0;
  return Array.from({ length: count }, () => {
    botCounter++;
    const skill = 0.3 + Math.random() * 0.6;
    const minDelay = 800 + Math.random() * 1500;
    const maxDelay = Math.min(12000, minDelay + 3000 + Math.random() * 6000);
    return {
      id: `bot-${botCounter}`,
      name: `BOT ${BOT_NAMES[botCounter % BOT_NAMES.length]}`,
      color: pickAvatarColor(botCounter),
      skill,
      minDelay,
      maxDelay,
      answered: false,
    };
  });
}

export interface DemoRoomState {
  roomCode: string;
  questionSet: QuestionSet;
  status: 'LOBBY' | 'QUESTION_ACTIVE' | 'SCOREBOARD' | 'FINISHED';
  currentQuestionIndex: number;
  players: Player[];
  bots: BotPlayer[];
  roundResults: RoundResult[];
  startTime: number | null;
  durationMs: number;
  shuffledOptions: { shuffled: string[]; correctIndex: number } | null;
  humanPlayerId: string;
}

export function createDemoRoom(
  roomCode: string,
  questionSet: QuestionSet,
  humanName: string,
  botCount = 7,
): DemoRoomState {
  const bots = makeBotPlayers(botCount);
  const players: Player[] = [
    {
      id: 'human-0',
      name: humanName || 'You',
      avatarColor: pickAvatarColor(0),
      collegeId: null,
      totalScore: 0,
      lastRoundScore: 0,
      correctCount: 0,
      totalAnswered: 0,
      totalResponseTimeMs: 0,
      connected: true,
    },
    ...bots.map(b => ({
      id: b.id,
      name: b.name,
      avatarColor: b.color,
      collegeId: null,
      totalScore: 0,
      lastRoundScore: 0,
      correctCount: 0,
      totalAnswered: 0,
      totalResponseTimeMs: 0,
      connected: true,
    })),
  ];

  return {
    roomCode,
    questionSet,
    status: 'LOBBY',
    currentQuestionIndex: -1,
    players,
    bots,
    roundResults: [],
    startTime: null,
    durationMs: 0,
    shuffledOptions: null,
    humanPlayerId: 'human-0',
  };
}

export function startNextQuestion(state: DemoRoomState): {
  questionId: string;
  text: string;
  options: string[];
  durationMs: number;
  serverStartTime: number;
} {
  const nextIdx = state.currentQuestionIndex + 1;
  state.currentQuestionIndex = nextIdx;
  state.status = 'QUESTION_ACTIVE';
  const question = state.questionSet.questions[nextIdx];
  const { shuffled, newCorrectIndex } = shuffleOptions(question.options, question.correctOptionIndex);
  state.shuffledOptions = { shuffled, correctIndex: newCorrectIndex };
  state.startTime = Date.now();
  state.durationMs = question.timeLimitSeconds * 1000;
  state.bots.forEach(b => { b.answered = false; });

  return {
    questionId: question.id,
    text: question.text,
    imageUrl: question.imageUrl,
    options: shuffled,
    durationMs: state.durationMs,
    serverStartTime: state.startTime,
  };
}

export function submitAnswer(
  state: DemoRoomState,
  playerId: string,
  selectedOption: number,
  serverReceivedTime: number,
): { accepted: boolean; points: number; isCorrect: boolean } {
  if (state.status !== 'QUESTION_ACTIVE') return { accepted: false, points: 0, isCorrect: false };
  const question = state.questionSet.questions[state.currentQuestionIndex];
  if (!question) return { accepted: false, points: 0, isCorrect: false };

  const player = state.players.find(p => p.id === playerId);
  if (!player) return { accepted: false, points: 0, isCorrect: false };

  const responseTimeMs = serverReceivedTime - (state.startTime ?? serverReceivedTime);
  if (responseTimeMs > state.durationMs) return { accepted: false, points: 0, isCorrect: false };

  const correctIndex = state.shuffledOptions?.correctIndex ?? question.correctOptionIndex;
  const isCorrect = selectedOption === correctIndex;
  const points = computeScore(isCorrect, responseTimeMs, state.durationMs);

  player.lastRoundScore = points;
  player.totalScore += points;
  player.totalAnswered += 1;
  player.totalResponseTimeMs += responseTimeMs;
  if (isCorrect) player.correctCount += 1;

  return { accepted: true, points, isCorrect };
}

export function processBotAnswers(
  state: DemoRoomState,
  onBotAnswer: (botId: string, selectedOption: number, responseTimeMs: number) => void,
): number[] {
  const timeouts: number[] = [];
  state.bots.forEach(bot => {
    if (bot.answered) return;
    const delay = bot.minDelay + Math.random() * (bot.maxDelay - bot.minDelay);
    const t = window.setTimeout(() => {
      if (state.status !== 'QUESTION_ACTIVE') return;
      bot.answered = true;
      const isCorrectGuess = Math.random() < bot.skill;
      const correctIdx = state.shuffledOptions?.correctIndex ?? 0;
      let selectedOption: number;
      if (isCorrectGuess) {
        selectedOption = correctIdx;
      } else {
        const wrongIndices = state.shuffledOptions!.shuffled.map((_, i) => i).filter(i => i !== correctIdx);
        selectedOption = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
      }
      const responseTimeMs = Date.now() - (state.startTime ?? Date.now());
      onBotAnswer(bot.id, selectedOption, responseTimeMs);
    }, delay);
    timeouts.push(t);
  });
  return timeouts;
}

export function endRound(state: DemoRoomState): RoundResult {
  state.status = 'SCOREBOARD';
  const question = state.questionSet.questions[state.currentQuestionIndex];
  const correctOptionIndex = state.shuffledOptions?.correctIndex ?? question.correctOptionIndex;

  // For players who didn't answer this round, lastRoundScore stays at whatever it was
  // We need to reset unanswered players to 0 for this round
  state.players.forEach(p => {
    // Check if they answered this round - if not, lastRoundScore = 0
    // We track via totalAnswered vs currentQuestionIndex+1
    if (p.totalAnswered < state.currentQuestionIndex + 1) {
      p.lastRoundScore = 0;
    }
  });

  const prevRanks = computeRanks(state.players);
  const scoreboard: ScoreboardEntry[] = state.players.map(p => {
    const rank = prevRanks.sorted.findIndex(sp => sp.id === p.id) + 1;
    const previousRank = prevRanks.prevRankMap[p.id] ?? rank;
    return {
      playerId: p.id,
      name: p.name,
      avatarColor: p.avatarColor,
      totalScore: p.totalScore,
      roundScore: p.lastRoundScore,
      rank,
      previousRank,
      rankDelta: previousRank - rank,
      isCorrect: p.lastRoundScore > 0,
      selectedOption: -1,
      correctOptionIndex,
      responseTimeMs: 0,
      answered: p.totalAnswered > state.currentQuestionIndex,
    };
  });

  state.roundResults.push({ questionId: question.id, correctOptionIndex, scoreboard });
  return { questionId: question.id, correctOptionIndex, scoreboard };
}

export function computeRanks(players: Player[]): { sorted: Player[]; prevRankMap: Record<string, number> } {
  const sorted = [...players].sort((a, b) => b.totalScore - a.totalScore);
  return { sorted, prevRankMap: {} };
}

export function computeFinalSummary(state: DemoRoomState): GameSummary[] {
  const questionSet = state.questionSet;
  const topicMap = new Map<string, Topic>();
  questionSet.questions.forEach(q => {
    topicMap.set(q.id, questionSet.topic);
  });

  return state.players.map(p => {
    const accuracy = p.totalAnswered > 0 ? (p.correctCount / p.totalAnswered) * 100 : 0;
    const avgResponseTimeMs = p.totalAnswered > 0 ? p.totalResponseTimeMs / p.totalAnswered : 0;

    const breakdown: Record<Topic, { correct: number; total: number }> = {
      Quant: { correct: 0, total: 0 },
      Logical: { correct: 0, total: 0 },
      Verbal: { correct: 0, total: 0 },
      DI: { correct: 0, total: 0 },
    };

    state.roundResults.forEach((rr, idx) => {
      const entry = rr.scoreboard.find(e => e.playerId === p.id);
      const topic = topicMap.get(rr.questionId) || 'Quant';
      breakdown[topic].total += 1;
      if (entry?.isCorrect) breakdown[topic].correct += 1;
      void idx;
    });

    return {
      playerId: p.id,
      name: p.name,
      avatarColor: p.avatarColor,
      finalScore: p.totalScore,
      accuracy,
      avgResponseTimeMs,
      correctCount: p.correctCount,
      totalQuestions: questionSet.questions.length,
      topicBreakdown: breakdown,
    };
  }).sort((a, b) => b.finalScore - a.finalScore);
}

export function advanceToNextOrFinish(state: DemoRoomState): 'QUESTION_ACTIVE' | 'FINISHED' {
  if (state.currentQuestionIndex + 1 >= state.questionSet.questions.length) {
    state.status = 'FINISHED';
    return 'FINISHED';
  }
  return 'QUESTION_ACTIVE';
}

export function getCurrentShuffledOptions(state: DemoRoomState): string[] | null {
  return state.shuffledOptions?.shuffled ?? null;
}

export function getCorrectOptionIndex(state: DemoRoomState): number | null {
  return state.shuffledOptions?.correctIndex ?? null;
}

export function getTimerProgress(startTime: number, durationMs: number): number {
  const elapsed = Date.now() - startTime;
  return Math.max(0, Math.min(1, 1 - elapsed / durationMs));
}

export function getElapsedSeconds(startTime: number): number {
  return Math.floor((Date.now() - startTime) / 1000);
}
