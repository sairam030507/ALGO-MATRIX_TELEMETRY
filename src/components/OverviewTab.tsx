import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Calendar,
  AlertTriangle,
  Clock,
  Target,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Award,
} from 'lucide-react';
import { PlatformAccount, TopicMetric, Contest, SM2Item } from '../types';
import { generateGoogleCalendarUrl } from '../lib/calendar';

interface OverviewTabProps {
  accounts: PlatformAccount[];
  topicMetrics: TopicMetric[];
  nextContest: Contest | null;
  dueSm2Count: number;
  sm2Items: SM2Item[];
  placementProgressPct: number;
  setActiveTab: (tab: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  accounts,
  topicMetrics,
  nextContest,
  dueSm2Count,
  sm2Items,
  placementProgressPct,
  setActiveTab,
}) => {
  // Live countdown state
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  }>({ hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });

  useEffect(() => {
    if (!nextContest) return;

    const updateTimer = () => {
      const now = Date.now();
      const start = new Date(nextContest.startTime).getTime();
      const diff = Math.max(0, Math.floor((start - now) / 1000));

      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      setTimeLeft({ hours, minutes, seconds, totalSeconds: diff });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [nextContest]);

  const totalSolvedAll = accounts.reduce((sum, a) => sum + a.totalSolved, 0);
  const unifiedRating = 1980; // Alex's unified rating
  const weaknessCount = topicMetrics.filter(t => t.isWeakness).length;

  return (
    <div className="space-y-6">
      {/* 7-Month Placement Drive Fast-Action Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-900/40 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              <Target className="w-3.5 h-3.5" />
              <span>Campus Placement Drive Roadmap · 7 Months Horizon</span>
            </div>
            <h2 className="text-lg font-bold text-white">
              Target: 2100 Unified Rating &amp; FAANG / Tier-1 Quant Bar
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              213 days remaining until drive day. Master high-yield patterns across Trees, Graphs, DP, and Core CS Fundamentals.
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <div className="text-right">
              <div className="text-xs text-slate-400">Roadmap Progress</div>
              <div className="text-sm font-mono font-bold text-indigo-300 tabular-nums">
                {placementProgressPct}% Completed
              </div>
            </div>
            <button
              onClick={() => setActiveTab('placement')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors whitespace-nowrap shadow-sm shadow-indigo-600/30"
            >
              <span>Open 7-Month Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden mt-4">
          <div
            className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.max(5, placementProgressPct)}%` }}
          />
        </div>
      </div>

      {/* Unified Rating & Multi-Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Unified Rating Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Unified Internal Rating</span>
              <Award className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-bold font-mono text-white tabular-nums">
              {unifiedRating}
            </div>
            <div className="text-xs text-indigo-300 font-medium mt-1">
              Candidate Master Tier (800 - 3500 Scale)
            </div>
          </div>
          <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span>Aggregated Solved</span>
            <span className="font-mono font-semibold text-slate-200 tabular-nums">
              {totalSolvedAll.toLocaleString()}
            </span>
          </div>
        </div>

        {/* LeetCode Card */}
        {(() => {
          const acc = accounts.find(a => a.platform === 'leetcode');
          return (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-amber-400 mb-2 font-medium">
                  <span>LeetCode</span>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="text-[11px] font-mono text-slate-400 hover:text-white transition-colors underline-offset-2 hover:underline"
                    title="Click to edit handle"
                  >
                    @{acc?.handle || 'sairam_lc'}
                  </button>
                </div>
                <div className="text-2xl font-bold font-mono text-white tabular-nums">
                  {acc?.rating || 2185}
                </div>
                <div className="text-xs text-amber-300/90 mt-1">
                  {acc?.rankTitle || 'Guardian'}
                </div>
              </div>
              <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
                <span>Solved</span>
                <span className="font-mono font-semibold text-slate-200 tabular-nums">
                  {acc?.totalSolved || 642}
                </span>
              </div>
            </div>
          );
        })()}

        {/* Codeforces Card */}
        {(() => {
          const acc = accounts.find(a => a.platform === 'codeforces');
          return (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-cyan-400 mb-2 font-medium">
                  <span>Codeforces</span>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="text-[11px] font-mono text-slate-400 hover:text-white transition-colors underline-offset-2 hover:underline"
                    title="Click to edit handle"
                  >
                    @{acc?.handle || 'sairam_cf'}
                  </button>
                </div>
                <div className="text-2xl font-bold font-mono text-white tabular-nums">
                  {acc?.rating || 1928}
                </div>
                <div className="text-xs text-purple-400 mt-1">
                  {acc?.rankTitle || 'Candidate Master'}
                </div>
              </div>
              <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
                <span>Solved</span>
                <span className="font-mono font-semibold text-slate-200 tabular-nums">
                  {acc?.totalSolved || 518}
                </span>
              </div>
            </div>
          );
        })()}

        {/* CodeChef Card */}
        {(() => {
          const acc = accounts.find(a => a.platform === 'codechef');
          return (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-emerald-400 mb-2 font-medium">
                  <span>CodeChef</span>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="text-[11px] font-mono text-slate-400 hover:text-white transition-colors underline-offset-2 hover:underline"
                    title="Click to edit handle"
                  >
                    @{acc?.handle || 'sairam_cc'}
                  </button>
                </div>
                <div className="text-2xl font-bold font-mono text-white tabular-nums">
                  {acc?.rating || 2065}
                </div>
                <div className="text-xs text-emerald-300/90 mt-1">
                  {acc?.rankTitle || '5★ · Div 1'}
                </div>
              </div>
              <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
                <span>Solved</span>
                <span className="font-mono font-semibold text-slate-200 tabular-nums">
                  {acc?.totalSolved || 315}
                </span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Grid: Next Contest Countdown & Topic Engine Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Contest Live Countdown Banner */}
        <div className="lg:col-span-1 bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
              <span className="font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Next Upcoming Contest
              </span>
              <span className="font-mono text-[11px] text-slate-500 uppercase">
                {nextContest?.platform || 'Codeforces'}
              </span>
            </div>

            <h3 className="text-base font-semibold text-white mb-1 line-clamp-1">
              {nextContest?.name || 'Codeforces Round 998 (Div. 2)'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Rated for Div. 2 · Duration: {Math.round((nextContest?.durationSeconds || 7200) / 60)} mins
            </p>

            {/* Big Ticking Countdown */}
            <div className="grid grid-cols-3 gap-2 bg-slate-950 border border-slate-800/80 rounded-lg p-3 text-center mb-4">
              <div>
                <div className="text-2xl font-bold font-mono text-indigo-400 tabular-nums">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Hours</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-indigo-400 tabular-nums">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Mins</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-indigo-400 tabular-nums">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Secs</div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800/60">
            {nextContest && (
              <a
                href={generateGoogleCalendarUrl(nextContest)}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-md transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Add to Google Calendar</span>
                <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
              </a>
            )}

            <button
              onClick={() => setActiveTab('contests')}
              className="w-full flex items-center justify-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 py-1 font-medium transition-colors"
            >
              <span>View all scheduled contests</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Topic Mastery Engine Health */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
              <span className="font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Canonical Topic Mastery Engine
              </span>
              <span className="text-xs text-amber-400 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {weaknessCount} Lagging Areas Flagged
              </span>
            </div>

            <div className="space-y-3 mb-4">
              {topicMetrics.map((topic) => (
                <div key={topic.topicId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium flex items-center gap-2">
                      {topic.topicName}
                      {topic.isWeakness && (
                        <span className="text-[10px] text-amber-400 font-normal">
                          · Attention Required
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-3 font-mono tabular-nums text-slate-400">
                      <span>{topic.totalSolved} solved</span>
                      <span className={`font-semibold ${topic.difficultyWeightedMastery >= 80 ? 'text-emerald-400' : topic.difficultyWeightedMastery >= 65 ? 'text-indigo-300' : 'text-amber-400'}`}>
                        {topic.difficultyWeightedMastery}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        topic.difficultyWeightedMastery >= 80
                          ? 'bg-emerald-500'
                          : topic.difficultyWeightedMastery >= 65
                          ? 'bg-indigo-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${topic.difficultyWeightedMastery}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400">
              Difficulty-weighted scoring based on attempt ratio &amp; rating
            </span>
            <button
              onClick={() => setActiveTab('topics')}
              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              <span>Inspect Weakness Breakdown</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* SM-2 Spaced Repetition Callout & Quick Drill */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-white">
                SuperMemo SM-2 Revision Queue
              </h4>
              <span className="text-xs font-mono font-bold text-amber-400 tabular-nums bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.5 rounded">
                {dueSm2Count} Due Today
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Consolidate high-yield algorithm patterns before memory decays. Rating problems updates intervals dynamically.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('sm2')}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-md transition-colors whitespace-nowrap"
        >
          <span>Start Daily Revision Deck</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
