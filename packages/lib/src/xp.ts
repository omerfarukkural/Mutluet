export const XP_REWARDS = {
  event_complete: 50,
  event_lead: 150,
  referral: 100,
  competition_first: 500,
  competition_second: 300,
  competition_third: 150,
  daily_login: 5,
  daily_streak_7: 50,
  profile_complete: 30,
  feedback: 10,
  mini_task_easy: 20,
  mini_task_medium: 75,
  mini_task_hard: 200,
} as const

export const LEVELS = [
  { level: 1, name: 'Tohum', emoji: '🌱', minXp: 0, maxXp: 499 },
  { level: 2, name: 'Filiz', emoji: '🌿', minXp: 500, maxXp: 1999 },
  { level: 3, name: 'Fidancı', emoji: '🌳', minXp: 2000, maxXp: 4999 },
  { level: 4, name: 'Gönüllü', emoji: '⭐', minXp: 5000, maxXp: 9999 },
  { level: 5, name: 'Elçi', emoji: '🔥', minXp: 10000, maxXp: 19999 },
  { level: 6, name: 'Efsane', emoji: '💎', minXp: 20000, maxXp: Infinity },
] as const

export function getLevelInfo(xp: number) {
  return LEVELS.find(l => xp >= l.minXp && xp <= l.maxXp) ?? LEVELS[0]
}

export function getXpProgress(xp: number) {
  const level = getLevelInfo(xp)
  if (level.maxXp === Infinity) return 100
  const range = level.maxXp - level.minXp
  const progress = xp - level.minXp
  return Math.round((progress / range) * 100)
}
