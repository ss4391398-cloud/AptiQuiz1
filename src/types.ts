export type Role = 'HOST' | 'STUDENT';
export type Topic = 'Quant' | 'Logical' | 'Verbal' | 'DI';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type RoomStatus = 'LOBBY' | 'QUESTION_ACTIVE' | 'SCOREBOARD' | 'FINISHED';

export interface College {
  id: string;
  name: string;
  code: string;
  createdAt: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  collegeId: string | null;
  streakDays: number;
  totalPoints: number;
}

export interface Question {
  id: string;
  setId: string;
  text: string;
  imageUrl?: string;
  options: string[];
  correctOptionIndex: number;
  timeLimitSeconds: number;
}

export interface QuestionSet {
  id: string;
  title: string;
  topic: Topic;
  difficulty: Difficulty;
  createdById: string;
  questions: Question[];
}

export interface PlayerSubmission {
  id: string;
  roomId: string;
  userId: string;
  questionId: string;
  selectedOption: number;
  responseTimeMs: number;
  pointsEarned: number;
  isCorrect: boolean;
  serverTimestamp: string;
}

export interface Player {
  id: string;
  name: string;
  avatarColor: string;
  collegeId: string | null;
  totalScore: number;
  lastRoundScore: number;
  correctCount: number;
  totalAnswered: number;
  totalResponseTimeMs: number;
  connected: boolean;
}

export interface RoomSession {
  id: string;
  roomCode: string;
  setId: string;
  status: RoomStatus;
  currentQuestionIndex: number;
  collegeId: string | null;
  questionSet?: QuestionSet;
  players: Player[];
  submissions: PlayerSubmission[];
}

export interface QuestionStartPayload {
  questionId: string;
  text: string;
  imageUrl?: string;
  options: string[];
  durationMs: number;
  serverStartTime: number;
  questionIndex: number;
  totalQuestions: number;
}

export interface ScoreboardEntry {
  playerId: string;
  name: string;
  avatarColor: string;
  totalScore: number;
  roundScore: number;
  rank: number;
  previousRank: number;
  rankDelta: number;
  isCorrect: boolean;
  selectedOption: number;
  correctOptionIndex: number;
  responseTimeMs: number;
  answered: boolean;
}

export interface GameSummary {
  playerId: string;
  name: string;
  avatarColor: string;
  finalScore: number;
  accuracy: number;
  avgResponseTimeMs: number;
  correctCount: number;
  totalQuestions: number;
  topicBreakdown: Record<Topic, { correct: number; total: number }>;
}
