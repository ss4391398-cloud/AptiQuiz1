export const AVATAR_COLORS = [
  'bg-primary-500', 'bg-accent-500', 'bg-success-500', 'bg-warning-500',
  'bg-error-500', 'bg-indigo-500', 'bg-teal-500', 'bg-pink-500',
  'bg-orange-500', 'bg-cyan-500', 'bg-lime-600', 'bg-rose-500',
  'bg-violet-500', 'bg-emerald-500', 'bg-sky-500', 'bg-amber-600',
];

export function pickAvatarColor(seed: number): string {
  return AVATAR_COLORS[seed % AVATAR_COLORS.length];
}

export function shuffleOptions<T>(options: T[], correctIndex: number): { shuffled: T[]; newCorrectIndex: number } {
  const indices = options.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const shuffled = indices.map(i => options[i]);
  const newCorrectIndex = indices.indexOf(correctIndex);
  return { shuffled, newCorrectIndex };
}

export function computeScore(
  isCorrect: boolean,
  responseTimeMs: number,
  durationMs: number,
  penaltyEnabled = false,
): number {
  if (!isCorrect) return penaltyEnabled ? -200 : 0;
  const timeRemaining = Math.max(0, durationMs - responseTimeMs);
  const fraction = timeRemaining / durationMs;
  return Math.round(1000 + 500 * fraction);
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}
