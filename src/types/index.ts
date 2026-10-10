export type Platform = 'leetcode' | 'codeforces' | 'codechef';

export type LeetCodeDifficulty = 'Easy' | 'Medium' | 'Hard';
export type CodeforcesRating = number; // 800 - 3500
export type CodeChefStar = '1★' | '2★' | '3★' | '4★' | '5★' | '6★' | '7★';

export interface PlatformAccount {
  id: string;
  platform: Platform;
  handle: string;
  avatarUrl?: string;
  rating: number;
  maxRating: number;
  rankTitle: string;
  totalSolved: number;
  lastSyncedAt: string;
  syncStatus: 'idle' | 'syncing' | 'failed' | 'success';
}

export interface CanonicalTopic {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentTopicId?: string | null;
  platformSynonyms: {
    leetcode: string[];
    codeforces: string[];
    codechef: string[];
  };
  subTopics?: CanonicalTopic[];
}

export interface Problem {
  id: string;
  platform: Platform;
  platformProblemId: string;
  title: string;
  url: string;
  rawDifficulty: string; // e.g., 'Medium', '1600', '4★'
  normalizedRating: number; // 800 - 3500
  canonicalTopicId: string;
  subTopicId?: string;
  tags: string[];
  solvedCount: number;
  acceptanceRate: number;
}

export interface UserSubmission {
  id: string;
  problemId: string;
  platform: Platform;
  problemTitle: string;
  canonicalTopicId: string;
  normalizedRating: number;
  status: 'AC' | 'WA' | 'TLE' | 'MLE' | 'RE';
  attemptsBeforeAC: number;
  solveTimeMinutes: number;
  submittedAt: string;
  language: string;
}

export interface TopicMetric {
  topicId: string;
  topicName: string;
  category: string; // e.g., "Algorithms", "Data Structures"
  totalSolved: number;
  totalAttempted: number;
  attemptToAcRatio: number;
  averageSolveTimeMinutes: number;
  difficultyWeightedMastery: number; // 0 - 100
  isWeakness: boolean;
  weaknessReasons: string[];
  subTopics: SubTopicMetric[];
}

export interface SubTopicMetric {
  id: string;
  name: string;
  totalSolved: number;
  attemptToAcRatio: number;
  averageSolveTimeMinutes: number;
  masteryScore: number;
  isWeakness: boolean;
  priorityScore: number; // High score = urgent remedial work
}

export interface SM2Item {
  id: string;
  problemId: string;
  title: string;
  platform: Platform;
  url: string;
  canonicalTopic: string;
  subTopic: string;
  normalizedRating: number;
  repetitionNumber: number;
  intervalDays: number;
  easeFactor: number; // Defaults to 2.5
  dueDate: string; // ISO format
  lastReviewedDate?: string;
  historyQuality: number[]; // Quality ratings 0 - 5
  isDue: boolean;
}

export interface Contest {
  id: string;
  platform: Platform;
  name: string;
  url: string;
  startTime: string; // ISO
  endTime: string; // ISO
  durationSeconds: number;
  division?: string;
  rated: boolean;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED';
}

export interface ReminderSetting {
  id: string;
  contestId: string;
  contestName: string;
  platform: Platform;
  notify24h: boolean;
  notify1h: boolean;
  notify15m: boolean;
  discordWebhookUrl?: string;
  telegramChatId?: string;
  active: boolean;
}

export interface WorkerJobStatus {
  id: string;
  platform: Platform;
  action: 'fetch_submissions' | 'sync_problems' | 'compute_mastery' | 'sync_contests';
  state: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
  progress: number;
  retryCount: number;
  maxRetries: number;
  rateLimitRemaining: number;
  rateLimitResetSeconds: number;
  timestamp: string;
  durationMs?: number;
  errorMessage?: string;
}
