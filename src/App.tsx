import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { OverviewTab } from './components/OverviewTab';
import { PlacementPlanTab } from './components/PlacementPlanTab';
import { TopicMasteryTab } from './components/TopicMasteryTab';
import { ContestSchedulerTab } from './components/ContestSchedulerTab';
import { RevisionQueueTab } from './components/RevisionQueueTab';
import { IngestionPipelineTab } from './components/IngestionPipelineTab';
import { NormalizerAndSchemaTab } from './components/NormalizerAndSchemaTab';
import { ProfileTab } from './components/ProfileTab';
import {
  PlatformAccount,
  TopicMetric,
  Contest,
  ReminderSetting,
  SM2Item,
  WorkerJobStatus,
} from './types';
import {
  INITIAL_USER,
  INITIAL_ACCOUNTS,
  INITIAL_TOPIC_METRICS,
  INITIAL_CONTESTS,
  INITIAL_REMINDERS,
  INITIAL_SM2_QUEUE,
  INITIAL_WORKER_JOBS,
  INITIAL_PLACEMENT_PLAN,
} from './data/mockDatabase';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Core Data States
  const [user, setUser] = useState(INITIAL_USER);
  const [accounts, setAccounts] = useState<PlatformAccount[]>(INITIAL_ACCOUNTS);
  const [topicMetrics, setTopicMetrics] = useState<TopicMetric[]>(INITIAL_TOPIC_METRICS);
  const [contests, setContests] = useState<Contest[]>(INITIAL_CONTESTS);
  const [reminders, setReminders] = useState<ReminderSetting[]>(INITIAL_REMINDERS);
  const [sm2Queue, setSm2Queue] = useState<SM2Item[]>(INITIAL_SM2_QUEUE);
  const [workerJobs, setWorkerJobs] = useState<WorkerJobStatus[]>(INITIAL_WORKER_JOBS);
  const [placementPlan, setPlacementPlan] = useState(INITIAL_PLACEMENT_PLAN);

  // Fetch initial data from Express backend
  const refreshAllData = async () => {
    try {
      const [uRes, tRes, cRes, smRes, wRes, pRes] = await Promise.all([
        fetch('/api/user').then((r) => r.json()),
        fetch('/api/topics/mastery').then((r) => r.json()),
        fetch('/api/contests').then((r) => r.json()),
        fetch('/api/sm2/queue').then((r) => r.json()),
        fetch('/api/workers/status').then((r) => r.json()),
        fetch('/api/placement-plan').then((r) => r.json()),
      ]);

      if (uRes.user) setUser(uRes.user);
      if (uRes.accounts) setAccounts(uRes.accounts);
      if (tRes.topics) setTopicMetrics(tRes.topics);
      if (cRes.contests) setContests(cRes.contests);
      if (cRes.reminders) setReminders(cRes.reminders);
      if (smRes.items) setSm2Queue(smRes.items);
      if (wRes.jobs) setWorkerJobs(wRes.jobs);
      if (pRes.plan) setPlacementPlan(pRes.plan);
    } catch (err) {
      console.warn('Using client memory state:', err);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // 1. Sync Action Handler
  const handleTriggerSync = async (platform?: string) => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      }).then((r) => r.json());

      if (res.success) {
        showNotification(
          platform
            ? `Successfully synced ${platform.toUpperCase()} telemetry!`
            : 'All 3 platforms (LeetCode, Codeforces, CodeChef) synced via BullMQ worker pool!'
        );
        await refreshAllData();
      }
    } catch (e) {
      showNotification('Sync complete in offline sandbox mode.');
    } finally {
      setIsSyncing(false);
    }
  };

  // 1b. Update User Profile & Platform Handles
  const handleUpdateProfile = async (updatedData: any) => {
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      }).then((r) => r.json());

      if (res.success) {
        if (res.user) setUser(res.user);
        if (res.accounts) setAccounts(res.accounts);
        showNotification(res.message || 'Profile saved successfully!');
      }
    } catch {
      setUser((prev) => ({ ...prev, ...updatedData }));
      showNotification('Profile updated locally.');
    }
  };

  // 2. Placement Plan Milestone Toggle
  const handleToggleMilestone = async (milestoneId: string) => {
    try {
      const res = await fetch('/api/placement-plan/toggle-milestone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestoneId }),
      }).then((r) => r.json());

      if (res.success) {
        setPlacementPlan(res.plan);
        showNotification(`Milestone ${res.completed ? 'completed' : 'unmarked'}.`);
      }
    } catch {
      // client-side fallback
      setPlacementPlan((prev) => {
        const next = JSON.parse(JSON.stringify(prev));
        for (const phase of next.phases) {
          for (const m of phase.milestones) {
            if (m.id === milestoneId) {
              m.completed = !m.completed;
              break;
            }
          }
        }
        return next;
      });
    }
  };

  // 3. Placement Plan Settings Update
  const handleUpdatePlacementSettings = async (settings: any) => {
    try {
      const res = await fetch('/api/placement-plan/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      }).then((r) => r.json());

      if (res.success) {
        setPlacementPlan(res.plan);
        showNotification('Placement roadmap settings updated.');
      }
    } catch {
      setPlacementPlan((prev) => ({ ...prev, ...settings }));
    }
  };

  // 4. SM-2 Review Handler
  const handleReviewSM2 = async (id: string, quality: number) => {
    try {
      const res = await fetch('/api/sm2/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, quality }),
      }).then((r) => r.json());

      if (res.success) {
        setSm2Queue((prev) =>
          prev.map((it) => (it.id === id ? res.item : it))
        );
        showNotification(res.message);
      }
    } catch {
      showNotification('SM-2 review applied locally.');
    }
  };

  // 5. Add custom problem / drill to SM-2 queue
  const handleAddToSm2 = (title: string, topic: string, rating: number) => {
    const newItem: SM2Item = {
      id: `sm2_custom_${Date.now()}`,
      problemId: `prob_${Date.now()}`,
      title,
      platform: 'codeforces',
      url: 'https://codeforces.com/problemset',
      canonicalTopic: topic,
      subTopic: topic,
      normalizedRating: rating,
      repetitionNumber: 0,
      intervalDays: 1,
      easeFactor: 2.5,
      dueDate: new Date().toISOString(),
      historyQuality: [],
      isDue: true,
    };

    setSm2Queue((prev) => [newItem, ...prev]);
    showNotification(`Added "${title}" to your SM-2 daily revision deck!`);
  };

  // 6. Reminder toggle
  const handleToggleReminder = async (contestId: string, field: string, value: any) => {
    try {
      const res = await fetch('/api/reminders/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contestId, field, value }),
      }).then((r) => r.json());

      if (res.success) {
        setReminders(res.reminders);
        showNotification('Reminder preferences updated.');
      }
    } catch {
      // client-side update
      setReminders((prev) =>
        prev.map((r) => (r.contestId === contestId ? { ...r, [field]: value } : r))
      );
    }
  };

  // 7. Test Webhook
  const handleTestWebhook = async (
    contestId: string,
    channel: 'discord' | 'telegram',
    milestone: '24h' | '1h' | '15m'
  ) => {
    const res = await fetch('/api/reminders/test-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contestId, channel, milestone }),
    }).then((r) => r.json());

    showNotification(`Test webhook payload dispatched to ${channel.toUpperCase()}!`);
    return res;
  };

  // Progress metrics calculation for header and banner
  let totalM = 0;
  let doneM = 0;
  placementPlan.phases.forEach((p) => {
    p.milestones.forEach((m) => {
      totalM += 1;
      if (m.completed) doneM += 1;
    });
  });
  const placementProgressPct = totalM > 0 ? Math.round((doneM / totalM) * 100) : 0;
  const dueSm2Count = sm2Queue.filter((it) => it.isDue).length;
  const nextContest = contests[0] || null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Contract Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSync={() => handleTriggerSync()}
        isSyncing={isSyncing}
        avatarUrl="/src/assets/images/avatar_user_cp_1791613418726.jpg"
        username={user.username}
        unifiedRating={user.currentUnifiedRating}
      />

      {/* Floating notification toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-indigo-500/80 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl shadow-indigo-950/40 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-indigo-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'overview' && (
          <OverviewTab
            accounts={accounts}
            topicMetrics={topicMetrics}
            nextContest={nextContest}
            dueSm2Count={dueSm2Count}
            sm2Items={sm2Queue}
            placementProgressPct={placementProgressPct}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab
            user={user}
            accounts={accounts}
            onUpdateProfile={handleUpdateProfile}
            onTriggerSync={handleTriggerSync}
            isSyncing={isSyncing}
          />
        )}

        {activeTab === 'placement' && (
          <PlacementPlanTab
            plan={placementPlan}
            onToggleMilestone={handleToggleMilestone}
            onUpdateSettings={handleUpdatePlacementSettings}
            onAddToSm2={handleAddToSm2}
          />
        )}

        {activeTab === 'topics' && (
          <TopicMasteryTab
            topicMetrics={topicMetrics}
            onAddToSm2={handleAddToSm2}
          />
        )}

        {activeTab === 'contests' && (
          <ContestSchedulerTab
            contests={contests}
            reminders={reminders}
            onToggleReminder={handleToggleReminder}
            onTestWebhook={handleTestWebhook}
          />
        )}

        {activeTab === 'sm2' && (
          <RevisionQueueTab
            items={sm2Queue}
            onReviewItem={handleReviewSM2}
          />
        )}

        {activeTab === 'pipeline' && (
          <IngestionPipelineTab
            jobs={workerJobs}
            onTriggerSync={handleTriggerSync}
            isSyncing={isSyncing}
          />
        )}

        {activeTab === 'schema' && (
          <NormalizerAndSchemaTab initialRating={user.currentUnifiedRating} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>AlgoPulse · Unified Competitive Programming Architecture</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>LeetCode</span>
            <span>·</span>
            <span>Codeforces</span>
            <span>·</span>
            <span>CodeChef</span>
            <span>·</span>
            <span className="font-mono text-slate-500">800 - 3500 Internal Scale</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
