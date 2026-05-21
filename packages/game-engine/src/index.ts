export const GAME_CONSTANTS = {
  QUESTIONS_COUNT: 5,
  LIMIT_TIME_SEC: 15,
  BASE_SCORE: 100,
  MAX_SPEED_BONUS: 50,
  XP_WIN: 50,
  XP_DRAW: 25,
  XP_LOSE: 10,
} as const;

/**
 * Calculates player round score based on correctness and speed
 */
export function calculateRoundScore(
  isCorrect: boolean,
  timeTakenMs: number,
  limitTimeSec: number = GAME_CONSTANTS.LIMIT_TIME_SEC,
): number {
  if (!isCorrect) return 0;

  const limitTimeMs = limitTimeSec * 1000;
  const ratio = Math.max(0, Math.min(1, timeTakenMs / limitTimeMs));
  const speedBonus = Math.round(GAME_CONSTANTS.MAX_SPEED_BONUS * (1 - ratio));

  return GAME_CONSTANTS.BASE_SCORE + speedBonus;
}

/**
 * Checks if the answer index matches the correct answer index
 */
export function verifyAnswer(selectedIdx: number, correctIdx: number): boolean {
  return selectedIdx === correctIdx;
}
