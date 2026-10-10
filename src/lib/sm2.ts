import { SM2Item } from '../types';

/**
 * SuperMemo SM-2 Spaced Repetition Engine
 * Computes updated Ease Factor (EF), repetition counter, interval (days), and next due date.
 *
 * Quality ratings:
 * 5 - Perfect recall / Instant AC without hints
 * 4 - Correct response after slight hesitation / standard solve
 * 3 - Correct response recalled with serious difficulty / slow solve
 * 2 - Incorrect response; where the correct one seemed easy to recall
 * 1 - Incorrect response; the correct one remembered
 * 0 - Complete blackout / total blank
 */
export interface SM2Result {
  repetitionNumber: number;
  intervalDays: number;
  easeFactor: number;
  dueDate: string;
}

export function calculateSM2(
  quality: number, // 0 - 5
  currentRepetition: number,
  currentInterval: number,
  currentEaseFactor: number
): SM2Result {
  const q = Math.max(0, Math.min(5, Math.round(quality)));

  // Calculate new Ease Factor (EF')
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  let newEaseFactor = currentEaseFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  // EF cannot fall below 1.3
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }
  // Keep EF clean to 2 decimal places
  newEaseFactor = Math.round(newEaseFactor * 100) / 100;

  let newRepetition = currentRepetition;
  let newInterval = currentInterval;

  if (q >= 3) {
    // Successful recall
    if (currentRepetition === 0) {
      newInterval = 1;
    } else if (currentRepetition === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(currentInterval * newEaseFactor);
    }
    newRepetition += 1;
  } else {
    // Failure to recall / reset repetition loop
    newRepetition = 0;
    newInterval = 1;
  }

  // Calculate next due date
  const now = new Date();
  const nextDueDate = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);

  return {
    repetitionNumber: newRepetition,
    intervalDays: newInterval,
    easeFactor: newEaseFactor,
    dueDate: nextDueDate.toISOString(),
  };
}

export function formatIntervalDays(days: number): string {
  if (days <= 1) return 'Tomorrow (1d)';
  if (days < 7) return `in ${days} days`;
  if (days < 30) {
    const weeks = Math.round(days / 7);
    return `in ${weeks} week${weeks > 1 ? 's' : ''}`;
  }
  const months = Math.round(days / 30);
  return `in ${months} month${months > 1 ? 's' : ''}`;
}

export const SM2_QUALITY_RATINGS = [
  { score: 5, label: '5 - Flawless AC', description: 'Instant optimal solution without hints' },
  { score: 4, label: '4 - Solid AC', description: 'Solved cleanly with standard implementation time' },
  { score: 3, label: '3 - Hard AC', description: 'Solved but struggled or exceeded standard time' },
  { score: 2, label: '2 - Wrong Approach', description: 'Got stuck, required glancing at editorial' },
  { score: 1, label: '1 - Minor Glimpse', description: 'Knew the topic name but could not formulate transition' },
  { score: 0, label: '0 - Total Blackout', description: 'Completely stuck, unfamiliar with technique' },
];
