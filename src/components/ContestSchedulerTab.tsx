import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Download,
  ExternalLink,
  Bell,
  Check,
  Send,
  Radio,
  Share2,
} from 'lucide-react';
import { Contest, Platform, ReminderSetting } from '../types';
import { generateGoogleCalendarUrl } from '../lib/calendar';

interface ContestSchedulerTabProps {
  contests: Contest[];
  reminders: ReminderSetting[];
  onToggleReminder: (contestId: string, field: string, value: any) => Promise<void>;
  onTestWebhook: (contestId: string, channel: 'discord' | 'telegram', milestone: '24h' | '1h' | '15m') => Promise<any>;
}

export const ContestSchedulerTab: React.FC<ContestSchedulerTabProps> = ({
  contests,
  reminders,
  onToggleReminder,
  onTestWebhook,
}) => {
  const [filterPlatform, setFilterPlatform] = useState<Platform | 'all'>('all');
  const [selectedContestForTest, setSelectedContestForTest] = useState<string>(contests[0]?.id || '');
  const [webhookChannel, setWebhookChannel] = useState<'discord' | 'telegram'>('discord');
  const [webhookMilestone, setWebhookMilestone] = useState<'24h' | '1h' | '15m'>('15m');
  const [isTestingWebhook, setIsTestingWebhook] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  // Live countdowns state map
  const [countdowns, setCountdowns] = useState<Record<string, string>>({});

  useEffect(() => {
    const updateCountdowns = () => {
      const now = Date.now();
      const newMap: Record<string, string> = {};

      contests.forEach((c) => {
        const start = new Date(c.startTime).getTime();
        const diff = Math.max(0, Math.floor((start - now) / 1000));

        const days = Math.floor(diff / 86400);
        const hours = Math.floor((diff % 86400) / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;

        if (days > 0) {
          newMap[c.id] = `${days}d ${hours}h ${minutes}m`;
        } else {
          newMap[c.id] = `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
        }
      });

      setCountdowns(newMap);
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);
    return () => clearInterval(interval);
  }, [contests]);

  const filteredContests = contests.filter((c) => {
    if (filterPlatform === 'all') return true;
    return c.platform === filterPlatform;
  });

  const handleTestWebhook = async () => {
    setIsTestingWebhook(true);
    try {
      const res = await onTestWebhook(selectedContestForTest, webhookChannel, webhookMilestone);
      setTestResult(res);
    } finally {
      setIsTestingWebhook(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Master Export Action */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4" />
              <span>Multi-Platform Contest Sync &amp; Calendar Engine</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Real-Time Contest Radar &amp; Multi-Channel Reminders
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Low-latency feed aggregated across LeetCode, Codeforces, and CodeChef. Synchronize via standard
              iCal (.ics), Google Calendar, and automated Discord / Telegram webhook dispatchers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/api/contests/calendar.ics"
              download="algopulse-contests.ics"
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors whitespace-nowrap shadow-sm shadow-indigo-600/30"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Master Feed (.ics)</span>
            </a>
          </div>
        </div>

        {/* Platform Filter Buttons */}
        <div className="flex items-center gap-2 pt-4">
          <span className="text-xs text-slate-500 mr-2">Filter Platform:</span>
          {(['all', 'leetcode', 'codeforces', 'codechef'] as const).map((plat) => (
            <button
              key={plat}
              onClick={() => setFilterPlatform(plat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                filterPlatform === plat
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {plat === 'all' ? 'All Platforms' : plat}
            </button>
          ))}
        </div>
      </div>

      {/* Contests List Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredContests.map((contest) => {
          const reminder = reminders.find((r) => r.contestId === contest.id);
          const isRemActive = reminder?.active ?? true;
          const countdown = countdowns[contest.id] || 'Loading...';

          return (
            <div
              key={contest.id}
              className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 transition-all hover:border-slate-700/80"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Contest Main Info */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`font-semibold uppercase tracking-wider font-mono text-[11px] ${
                        contest.platform === 'leetcode'
                          ? 'text-amber-400'
                          : contest.platform === 'codeforces'
                          ? 'text-cyan-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {contest.platform}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400 font-mono text-xs">
                      {new Date(contest.startTime).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400 text-xs">
                      {Math.round(contest.durationSeconds / 60)} mins
                    </span>
                    {contest.division && (
                      <>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-400 text-xs">{contest.division}</span>
                      </>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white hover:text-indigo-300 transition-colors">
                    <a href={contest.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5">
                      <span>{contest.name}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                    </a>
                  </h3>
                </div>

                {/* Live Countdown & Fast Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:shrink-0">
                  <div className="bg-slate-950 border border-slate-800/80 rounded-lg px-3 py-1.5 text-right min-w-[130px]">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Starts in</div>
                    <div className="text-sm font-mono font-bold text-indigo-400 tabular-nums">
                      {countdown}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={generateGoogleCalendarUrl(contest)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-md transition-colors"
                      title="Add to Google Calendar"
                    >
                      <Calendar className="w-4 h-4 text-indigo-400" />
                    </a>

                    <a
                      href={`/api/contests/${contest.id}/export.ics`}
                      download={`${contest.id}.ics`}
                      className="p-2 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-md transition-colors"
                      title="Download .ics for Apple / Outlook"
                    >
                      <Download className="w-4 h-4 text-slate-300" />
                    </a>

                    {/* Milestone Reminders Toggle Dropdown */}
                    <button
                      onClick={() => onToggleReminder(contest.id, 'active', !isRemActive)}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border transition-colors ${
                        isRemActive
                          ? 'bg-indigo-950/40 border-indigo-800/60 text-indigo-300'
                          : 'bg-slate-950 border-slate-800 text-slate-500'
                      }`}
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>{isRemActive ? 'Reminders Active' : 'Reminders Muted'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Reminder Milestones Checkbox Sub-Bar */}
              {isRemActive && (
                <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap items-center gap-6 text-xs text-slate-400">
                  <span className="text-slate-500 font-medium">Alert Milestones:</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reminder?.notify24h ?? true}
                      onChange={(e) => onToggleReminder(contest.id, 'notify24h', e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                    />
                    <span>T-24h Ahead</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reminder?.notify1h ?? true}
                      onChange={(e) => onToggleReminder(contest.id, 'notify1h', e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                    />
                    <span>T-1h Warning</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reminder?.notify15m ?? true}
                      onChange={(e) => onToggleReminder(contest.id, 'notify15m', e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                    />
                    <span>T-15m Final Call</span>
                  </label>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Multi-Channel Webhook Dispatch Tester Simulator */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Radio className="w-4 h-4 text-indigo-400" />
            Webhook Dispatch Simulator (Discord &amp; Telegram)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Validate bot notifications, markdown formatting, and webhook JSON payloads before live contest schedules.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
          <div>
            <label className="text-[11px] text-slate-400 uppercase font-medium block mb-1">Target Contest</label>
            <select
              value={selectedContestForTest}
              onChange={(e) => setSelectedContestForTest(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-md p-2 focus:border-indigo-500 focus:outline-none"
            >
              {contests.map((c) => (
                <option key={c.id} value={c.id}>
                  [{c.platform.toUpperCase()}] {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 uppercase font-medium block mb-1">Channel Type</label>
            <select
              value={webhookChannel}
              onChange={(e) => setWebhookChannel(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-md p-2 focus:border-indigo-500 focus:outline-none"
            >
              <option value="discord">Discord Embed (Webhook URL)</option>
              <option value="telegram">Telegram Bot (HTML/Markdown)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 uppercase font-medium block mb-1">Trigger Milestone</label>
            <select
              value={webhookMilestone}
              onChange={(e) => setWebhookMilestone(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-md p-2 focus:border-indigo-500 focus:outline-none"
            >
              <option value="24h">T-24h Ahead</option>
              <option value="1h">T-1h Warning</option>
              <option value="15m">T-15m Final Call</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleTestWebhook}
              disabled={isTestingWebhook}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-md transition-colors shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isTestingWebhook ? 'Dispatching...' : 'Dispatch Test Alert'}</span>
            </button>
          </div>
        </div>

        {/* Delivery Receipt & JSON payload preview */}
        {testResult && (
          <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Dispatch Status: 200 OK (Simulated Delivery)
              </span>
              <span className="font-mono text-slate-500 text-[11px]">
                {testResult.dispatchedAt}
              </span>
            </div>

            <pre className="p-3 bg-slate-900 border border-slate-800/80 rounded font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
              {JSON.stringify(testResult.payload, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
