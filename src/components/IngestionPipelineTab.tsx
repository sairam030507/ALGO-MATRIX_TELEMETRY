import React, { useState } from 'react';
import {
  Cpu,
  RefreshCw,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Database,
  Terminal,
} from 'lucide-react';
import { WorkerJobStatus } from '../types';

interface IngestionPipelineTabProps {
  jobs: WorkerJobStatus[];
  onTriggerSync: (platform?: string) => Promise<void>;
  isSyncing: boolean;
}

export const IngestionPipelineTab: React.FC<IngestionPipelineTabProps> = ({
  jobs,
  onTriggerSync,
  isSyncing,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  const handleSync = async () => {
    if (selectedPlatform === 'all') {
      await onTriggerSync();
    } else {
      await onTriggerSync(selectedPlatform);
    }
  };

  return (
    <div className="space-y-6">
      {/* Architecture Overview Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
              <Cpu className="w-4 h-4" />
              <span>Resilient Background Ingestion Architecture (BullMQ + Redis)</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Rate-Limited Ingestion Workers &amp; Exponential Backoff
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Asynchronous worker pool configured with leaky token-bucket limiters, idempotency keys,
              and exponential retry backoff to harvest submissions and ratings without IP blocks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-md px-3 py-2 focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">All Platforms</option>
              <option value="leetcode">LeetCode Only</option>
              <option value="codeforces">Codeforces Only</option>
              <option value="codechef">CodeChef Only</option>
            </select>

            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-md transition-colors whitespace-nowrap shadow-sm shadow-indigo-600/30"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Ingesting...' : 'Trigger Sync Job'}</span>
            </button>
          </div>
        </div>

        {/* Worker Pool Pipeline Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-amber-400">
              <span>LeetCode Worker (GraphQL)</span>
              <span className="font-mono text-[11px] text-slate-400">18 / 20 Tokens</span>
            </div>
            <div className="text-xs text-slate-300">
              Limit: 1 req / 1.5s with query batching (max 50 submissions per GraphQL payload).
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full rounded-full" style={{ width: '90%' }} />
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-cyan-400">
              <span>Codeforces Worker (REST API)</span>
              <span className="font-mono text-[11px] text-slate-400">4 / 5 Tokens</span>
            </div>
            <div className="text-xs text-slate-300">
              Limit: 1 req / 2.0s strictly conforming to the 5 req/s hard burst cap.
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div className="bg-cyan-400 h-full rounded-full" style={{ width: '80%' }} />
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-emerald-400">
              <span>CodeChef Worker (API &amp; Scraper)</span>
              <span className="font-mono text-[11px] text-slate-400">9 / 10 Tokens</span>
            </div>
            <div className="text-xs text-slate-300">
              Limit: 1 req / 3.0s with randomized user-agent rotation and session cache.
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full" style={{ width: '90%' }} />
            </div>
          </div>
        </div>

        {/* Retry & Idempotency Rules */}
        <div className="mt-5 p-4 bg-slate-950/40 border border-slate-800/60 rounded-lg text-xs space-y-1 text-slate-400">
          <div className="text-slate-200 font-semibold flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
            <span>Fault Tolerance &amp; Deduplication Guarantees:</span>
          </div>
          <p>
            1. <strong>Exponential Backoff:</strong> Retries with formula: <code className="text-indigo-300">T_wait = 2^attempt × 500ms + random_jitter(0, 200ms)</code> up to 3 retries.
          </p>
          <p>
            2. <strong>Idempotency Constraint:</strong> Unique composite key <code className="text-indigo-300">(user_id, platform, submission_id)</code> enforces zero duplicate insertion.
          </p>
        </div>
      </div>

      {/* Live Worker Queue Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl divide-y divide-slate-800/80">
        <div className="p-5 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Active &amp; Historic BullMQ Jobs
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {jobs.length} jobs recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-500 bg-slate-950/40 border-b border-slate-800/80 text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-5 font-medium">Job ID</th>
                <th className="py-2.5 px-3 font-medium">Platform</th>
                <th className="py-2.5 px-3 font-medium">Action</th>
                <th className="py-2.5 px-3 font-medium text-center">Status</th>
                <th className="py-2.5 px-3 font-medium text-right">Retries</th>
                <th className="py-2.5 px-3 font-medium text-right">Execution Time</th>
                <th className="py-2.5 px-5 font-medium text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-5 font-mono text-slate-300 tabular-nums">
                    {job.id}
                  </td>
                  <td className="py-3 px-3 uppercase font-mono text-[11px] text-slate-400">
                    {job.platform}
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {job.action.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" />
                      {job.state}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-400 tabular-nums">
                    {job.retryCount} / {job.maxRetries}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-300 tabular-nums">
                    {job.durationMs}ms
                  </td>
                  <td className="py-3 px-5 text-right font-mono text-slate-400 tabular-nums">
                    {new Date(job.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
