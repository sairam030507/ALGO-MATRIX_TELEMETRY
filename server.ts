import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  INITIAL_USER,
  INITIAL_ACCOUNTS,
  INITIAL_TOPIC_METRICS,
  INITIAL_SM2_QUEUE,
  INITIAL_CONTESTS,
  INITIAL_REMINDERS,
  INITIAL_WORKER_JOBS,
  INITIAL_PLACEMENT_PLAN,
} from './src/data/mockDatabase';
import { calculateSM2 } from './src/lib/sm2';
import {
  generateICalFeed,
  generateDiscordWebhookPayload,
  generateTelegramMessagePayload,
} from './src/lib/calendar';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory data store for live user modifications
let currentUser = { ...INITIAL_USER };
let accounts = [...INITIAL_ACCOUNTS];
let topicMetrics = JSON.parse(JSON.stringify(INITIAL_TOPIC_METRICS));
let sm2Queue = JSON.parse(JSON.stringify(INITIAL_SM2_QUEUE));
let contests = [...INITIAL_CONTESTS];
let reminders = [...INITIAL_REMINDERS];
let workerJobs = [...INITIAL_WORKER_JOBS];
let placementPlan = JSON.parse(JSON.stringify(INITIAL_PLACEMENT_PLAN));

// Rate Limiter Token Buckets state
const rateLimiters = {
  leetcode: { tokens: 18, max: 20, refillRate: 1, lastRefill: Date.now() },
  codeforces: { tokens: 4, max: 5, refillRate: 1, lastRefill: Date.now() },
  codechef: { tokens: 9, max: 10, refillRate: 1, lastRefill: Date.now() },
};

// ============================================================================
// API ROUTES
// ============================================================================

// 1. User profile and accounts
app.get('/api/user', (req, res) => {
  res.json({
    user: currentUser,
    accounts,
  });
});

// Update comprehensive user profile and handles
app.post('/api/user/profile', (req, res) => {
  const {
    name,
    username,
    email,
    college,
    gradYear,
    bio,
    targetRating,
    preferredLanguage,
    discordWebhookUrl,
    telegramChatId,
    handles,
  } = req.body;

  if (name !== undefined) (currentUser as any).name = name;
  if (username !== undefined) currentUser.username = username;
  if (email !== undefined) (currentUser as any).email = email;
  if (college !== undefined) (currentUser as any).college = college;
  if (gradYear !== undefined) (currentUser as any).gradYear = gradYear;
  if (bio !== undefined) (currentUser as any).bio = bio;
  if (targetRating !== undefined) currentUser.targetRating = Number(targetRating);
  if (preferredLanguage !== undefined) currentUser.preferredLanguage = preferredLanguage;
  if (discordWebhookUrl !== undefined) (currentUser as any).discordWebhookUrl = discordWebhookUrl;
  if (telegramChatId !== undefined) (currentUser as any).telegramChatId = telegramChatId;

  // Update connected platform handles if provided
  if (handles && typeof handles === 'object') {
    Object.entries(handles).forEach(([plat, hVal]) => {
      const acc = accounts.find(a => a.platform === plat);
      if (acc && typeof hVal === 'string' && hVal.trim().length > 0) {
        acc.handle = hVal.trim();
      }
    });
  }

  res.json({
    success: true,
    message: 'Profile updated successfully!',
    user: currentUser,
    accounts,
  });
});

// Update handles or target rating (compact legacy helper)
app.post('/api/user/update', (req, res) => {
  const { targetRating, handle, platform } = req.body;
  if (targetRating) {
    currentUser.targetRating = Number(targetRating);
  }
  if (handle && platform) {
    const acc = accounts.find(a => a.platform === platform);
    if (acc) {
      acc.handle = handle;
    }
  }
  res.json({ success: true, user: currentUser, accounts });
});

// 1b. Placement Drive Roadmap (7-Month Plan Maker)
app.get('/api/placement-plan', (req, res) => {
  // Compute progress analytics
  let totalMilestones = 0;
  let completedMilestones = 0;
  let totalProblemsTarget = 0;

  placementPlan.phases.forEach((phase: any) => {
    phase.milestones.forEach((m: any) => {
      totalMilestones += 1;
      totalProblemsTarget += m.problemsTarget;
      if (m.completed) completedMilestones += 1;
    });
  });

  const progressPct = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
  const daysRemaining = 7 * 30.5; // ~213 days
  const weeksRemaining = Math.round(daysRemaining / 7);

  res.json({
    plan: placementPlan,
    analytics: {
      totalMilestones,
      completedMilestones,
      progressPct,
      totalProblemsTarget,
      daysRemaining: Math.round(daysRemaining),
      weeksRemaining,
      targetRating: placementPlan.targetRating,
      dailyProblemGoal: placementPlan.dailyProblemGoal,
      weeklyHours: placementPlan.weeklyHours,
      companyTier: placementPlan.companyTier,
    },
  });
});

app.post('/api/placement-plan/toggle-milestone', (req, res) => {
  const { milestoneId } = req.body;
  let found = false;
  let newStatus = false;

  for (const phase of placementPlan.phases) {
    for (const m of phase.milestones) {
      if (m.id === milestoneId) {
        m.completed = !m.completed;
        newStatus = m.completed;
        found = true;
        break;
      }
    }
    if (found) break;
  }

  res.json({ success: true, milestoneId, completed: newStatus, plan: placementPlan });
});

app.post('/api/placement-plan/settings', (req, res) => {
  const { targetRating, dailyProblemGoal, weeklyHours, companyTier } = req.body;
  if (targetRating) placementPlan.targetRating = Number(targetRating);
  if (dailyProblemGoal) placementPlan.dailyProblemGoal = Number(dailyProblemGoal);
  if (weeklyHours) placementPlan.weeklyHours = Number(weeklyHours);
  if (companyTier) placementPlan.companyTier = companyTier;

  res.json({ success: true, plan: placementPlan });
});

// 2. Ingestion & Sync Pipeline (BullMQ background worker simulation)
app.post('/api/user/sync', (req, res) => {
  const { platform } = req.body;
  const targetPlatforms = platform ? [platform] : ['leetcode', 'codeforces', 'codechef'];

  const newJobs = targetPlatforms.map(p => {
    const jobId = `job_sync_${p}_${Date.now()}`;
    const job = {
      id: jobId,
      platform: p as any,
      action: 'fetch_submissions' as const,
      state: 'completed' as const,
      progress: 100,
      retryCount: p === 'leetcode' ? 1 : 0, // Leetcode GraphQL simulated backoff
      maxRetries: 3,
      rateLimitRemaining: Math.floor(Math.random() * 5) + 2,
      rateLimitResetSeconds: +(Math.random() * 2 + 0.5).toFixed(1),
      timestamp: new Date().toISOString(),
      durationMs: Math.floor(Math.random() * 1200) + 1400,
    };
    workerJobs.unshift(job);

    // Update account synced status
    const acc = accounts.find(a => a.platform === p);
    if (acc) {
      acc.lastSyncedAt = new Date().toISOString();
      acc.syncStatus = 'success';
      acc.totalSolved += Math.floor(Math.random() * 3) + 1;
    }

    return job;
  });

  // Keep worker jobs list reasonable
  if (workerJobs.length > 25) {
    workerJobs = workerJobs.slice(0, 25);
  }

  res.json({
    success: true,
    message: `Triggered ingestion worker for ${targetPlatforms.join(', ')}`,
    jobs: newJobs,
    accounts,
  });
});

// 3. Analytics & Topic Mastery Engine
app.get('/api/topics/mastery', (req, res) => {
  // Compute overall summary metrics
  const totalSolvedAll = topicMetrics.reduce((sum: number, t: any) => sum + t.totalSolved, 0);
  const totalAttemptedAll = topicMetrics.reduce((sum: number, t: any) => sum + t.totalAttempted, 0);
  const overallRatio = +(totalAttemptedAll / (totalSolvedAll || 1)).toFixed(2);
  const avgSolveTime = +(
    topicMetrics.reduce((sum: number, t: any) => sum + t.averageSolveTimeMinutes * t.totalSolved, 0) /
    (totalSolvedAll || 1)
  ).toFixed(1);

  // Difficulty-weighted score aggregation
  const weightedScore = Math.round(
    topicMetrics.reduce((sum: number, t: any) => sum + t.difficultyWeightedMastery, 0) / topicMetrics.length
  );

  res.json({
    topics: topicMetrics,
    summary: {
      totalSolvedAll,
      totalAttemptedAll,
      overallRatio,
      avgSolveTime,
      weightedScore,
      weaknessCount: topicMetrics.filter((t: any) => t.isWeakness).length,
    },
  });
});

// 4. Spaced Repetition (SM-2) Queue
app.get('/api/sm2/queue', (req, res) => {
  const now = new Date();
  const queueWithDueStatus = sm2Queue.map((item: any) => ({
    ...item,
    isDue: new Date(item.dueDate) <= now,
  }));
  res.json({ items: queueWithDueStatus });
});

// Perform SM-2 Review
app.post('/api/sm2/review', (req, res) => {
  const { id, quality } = req.body;
  const itemIndex = sm2Queue.findIndex((it: any) => it.id === id);

  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item not found in SM-2 queue' });
  }

  const currentItem = sm2Queue[itemIndex];
  const sm2Result = calculateSM2(
    Number(quality),
    currentItem.repetitionNumber,
    currentItem.intervalDays,
    currentItem.easeFactor
  );

  const updatedItem = {
    ...currentItem,
    repetitionNumber: sm2Result.repetitionNumber,
    intervalDays: sm2Result.intervalDays,
    easeFactor: sm2Result.easeFactor,
    dueDate: sm2Result.dueDate,
    lastReviewedDate: new Date().toISOString(),
    historyQuality: [...(currentItem.historyQuality || []), Number(quality)],
    isDue: false,
  };

  sm2Queue[itemIndex] = updatedItem;

  res.json({
    success: true,
    message: `Problem reviewed with SM-2 quality ${quality}. Next review scheduled in ${sm2Result.intervalDays} day(s).`,
    item: updatedItem,
  });
});

// 5. Contest Scheduler & Calendar
app.get('/api/contests', (req, res) => {
  res.json({
    contests,
    reminders,
  });
});

// Export single contest as .ics
app.get('/api/contests/:id/export.ics', (req, res) => {
  const contest = contests.find(c => c.id === req.params.id);
  if (!contest) {
    return res.status(404).send('Contest not found');
  }

  const icsContent = generateICalFeed([contest]);
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${contest.id}.ics"`);
  res.send(icsContent);
});

// Export all upcoming contests as a master .ics feed
app.get('/api/contests/calendar.ics', (req, res) => {
  const icsContent = generateICalFeed(contests);
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="algopulse-contests.ics"');
  res.send(icsContent);
});

// Toggle or update reminder settings
app.post('/api/reminders/toggle', (req, res) => {
  const { contestId, field, value } = req.body;
  let reminder = reminders.find(r => r.contestId === contestId);

  if (!reminder) {
    const contest = contests.find(c => c.id === contestId);
    if (!contest) return res.status(404).json({ error: 'Contest not found' });

    reminder = {
      id: `rem_${Date.now()}`,
      contestId,
      contestName: contest.name,
      platform: contest.platform,
      notify24h: true,
      notify1h: true,
      notify15m: true,
      active: true,
    };
    reminders.push(reminder);
  }

  if (field && typeof value !== 'undefined') {
    (reminder as any)[field] = value;
  }

  res.json({ success: true, reminder, reminders });
});

// Test Webhook Dispatch (Discord / Telegram)
app.post('/api/reminders/test-webhook', (req, res) => {
  const { contestId, channel, milestone } = req.body;
  const contest = contests.find(c => c.id === contestId) || contests[0];

  const payload = channel === 'telegram'
    ? generateTelegramMessagePayload(contest, milestone || '15m')
    : generateDiscordWebhookPayload(contest, milestone || '15m');

  res.json({
    success: true,
    channel,
    milestone: milestone || '15m',
    dispatchedAt: new Date().toISOString(),
    status: 200,
    statusText: 'OK',
    simulatedDelivery: true,
    payload,
  });
});

// 6. Background Worker & Queue metrics
app.get('/api/workers/status', (req, res) => {
  res.json({
    activeJobs: workerJobs.filter(j => j.state === 'active').length,
    waitingJobs: workerJobs.filter(j => j.state === 'waiting').length,
    completedJobs: workerJobs.filter(j => j.state === 'completed').length,
    rateLimiters,
    jobs: workerJobs,
  });
});

// 7. PostgreSQL Relational Schema DDL
app.get('/api/schema/ddl', (req, res) => {
  try {
    const schemaPath = path.resolve(__dirname, 'src/data/schema.sql');
    const ddl = fs.readFileSync(schemaPath, 'utf-8');
    res.json({ ddl });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to read schema file', details: err?.message });
  }
});

// ============================================================================
// VITE DEV SERVER / STATIC PRODUCTION MOUNT
// ============================================================================
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AlgoPulse Unified CP Engine listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
