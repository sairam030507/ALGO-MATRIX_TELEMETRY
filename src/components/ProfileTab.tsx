import React, { useState } from 'react';
import {
  User,
  Mail,
  GraduationCap,
  Award,
  ExternalLink,
  Save,
  CheckCircle2,
  RefreshCw,
  Bell,
  Code2,
  Sparkles,
  Link as LinkIcon,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import { PlatformAccount } from '../types';

interface ProfileTabProps {
  user: {
    id: string;
    name?: string;
    username: string;
    email: string;
    college?: string;
    gradYear?: string;
    targetRating: number;
    preferredLanguage: string;
    currentUnifiedRating: number;
    bio?: string;
    discordWebhookUrl?: string;
    telegramChatId?: string;
    avatarUrl?: string;
  };
  accounts: PlatformAccount[];
  onUpdateProfile: (updatedData: any) => Promise<void>;
  onTriggerSync: (platform?: string) => Promise<void>;
  isSyncing: boolean;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  user,
  accounts,
  onUpdateProfile,
  onTriggerSync,
  isSyncing,
}) => {
  // Form state initialized with user props
  const [formData, setFormData] = useState({
    name: user.name || 'Sairam Nallabelly',
    username: user.username || 'sairam_cp',
    email: user.email || 'sairam2007.nallabelly@gmail.com',
    college: user.college || 'B.Tech Computer Science & Engineering',
    gradYear: user.gradYear || '2026 / 2027',
    preferredLanguage: user.preferredLanguage || 'C++20',
    targetRating: user.targetRating || 2100,
    bio:
      user.bio ||
      'Competitive programmer & DSA enthusiast preparing for campus placement drives. Aiming for 2100+ rating on Codeforces & Guardian on LeetCode.',
    discordWebhookUrl: user.discordWebhookUrl || '',
    telegramChatId: user.telegramChatId || '',
  });

  // Handles state
  const lcAccount = accounts.find((a) => a.platform === 'leetcode');
  const cfAccount = accounts.find((a) => a.platform === 'codeforces');
  const ccAccount = accounts.find((a) => a.platform === 'codechef');

  const [handles, setHandles] = useState({
    leetcode: lcAccount?.handle || 'sairam_lc',
    codeforces: cfAccount?.handle || 'sairam_cf',
    codechef: ccAccount?.handle || 'sairam_cc',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateProfile({
        ...formData,
        handles,
      });
      setSuccessMessage('Profile and platform connections saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncPlatform = async (platform: string) => {
    // Save current handles first then trigger sync
    await onUpdateProfile({ handles });
    await onTriggerSync(platform);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Overview */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div className="flex items-start sm:items-center gap-4">
            <img
              src={user.avatarUrl || '/src/assets/images/avatar_user_cp_1791613418726.jpg'}
              alt={formData.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-xl object-cover ring-2 ring-indigo-500/40 shadow-md"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {formData.name}
                </h2>
                <span className="text-xs font-mono font-semibold text-indigo-400 bg-indigo-950/60 border border-indigo-800/50 px-2 py-0.5 rounded">
                  @{formData.username}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  {formData.email}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                  {formData.college} ({formData.gradYear})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => handleSaveAll()}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-md transition-colors shadow-sm shadow-indigo-600/30 whitespace-nowrap"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-800/60 text-xs text-emerald-200 rounded-md flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Profile Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Unified CP Rating</span>
            <span className="text-base font-bold font-mono text-indigo-300 tabular-nums">
              {user.currentUnifiedRating} / 3500
            </span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Target CP Goal</span>
            <span className="text-base font-bold font-mono text-amber-300 tabular-nums">
              {formData.targetRating} (Candidate Master)
            </span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Primary Language</span>
            <span className="text-base font-bold font-mono text-slate-200">
              {formData.preferredLanguage}
            </span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Placement Horizon</span>
            <span className="text-base font-bold text-emerald-400">
              7 Months (213 Days)
            </span>
          </div>
        </div>
      </div>

      {/* Connected CP Platforms Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <LinkIcon className="w-4 h-4" />
            <span>Platform Connections &amp; Handle Linking</span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Connect Your LeetCode, Codeforces, and CodeChef Handles
          </h3>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Enter your exact usernames on each platform. AlgoPulse will map your submission logs, compute difficulty ratings,
            and monitor upcoming contest events under your handles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* LeetCode Account Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5" />
                  LeetCode
                </span>
                <a
                  href={`https://leetcode.com/u/${handles.leetcode}/`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <span>Profile</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 uppercase tracking-wider block">
                  Username / Handle
                </label>
                <input
                  type="text"
                  value={handles.leetcode}
                  onChange={(e) => setHandles({ ...handles, leetcode: e.target.value })}
                  placeholder="e.g. sairam_lc"
                  className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-1.5 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span>Current Rating:</span>
                  <span className="text-slate-200">{lcAccount?.rating || 2185} ({lcAccount?.rankTitle || 'Guardian'})</span>
                </div>
                <div className="flex justify-between">
                  <span>Solved Count:</span>
                  <span className="text-slate-200">{lcAccount?.totalSolved || 642}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSyncPlatform('leetcode')}
              disabled={isSyncing}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold text-amber-300 hover:text-white bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/60 rounded-md transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Verify &amp; Sync LeetCode</span>
            </button>
          </div>

          {/* Codeforces Account Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5" />
                  Codeforces
                </span>
                <a
                  href={`https://codeforces.com/profile/${handles.codeforces}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <span>Profile</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 uppercase tracking-wider block">
                  Username / Handle
                </label>
                <input
                  type="text"
                  value={handles.codeforces}
                  onChange={(e) => setHandles({ ...handles, codeforces: e.target.value })}
                  placeholder="e.g. sairam_cf"
                  className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-1.5 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span>Current Rating:</span>
                  <span className="text-purple-300">{cfAccount?.rating || 1928} ({cfAccount?.rankTitle || 'Candidate Master'})</span>
                </div>
                <div className="flex justify-between">
                  <span>Solved Count:</span>
                  <span className="text-slate-200">{cfAccount?.totalSolved || 518}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSyncPlatform('codeforces')}
              disabled={isSyncing}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold text-cyan-300 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/60 rounded-md transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Verify &amp; Sync Codeforces</span>
            </button>
          </div>

          {/* CodeChef Account Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5" />
                  CodeChef
                </span>
                <a
                  href={`https://www.codechef.com/users/${handles.codechef}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <span>Profile</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 uppercase tracking-wider block">
                  Username / Handle
                </label>
                <input
                  type="text"
                  value={handles.codechef}
                  onChange={(e) => setHandles({ ...handles, codechef: e.target.value })}
                  placeholder="e.g. sairam_cc"
                  className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-1.5 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span>Current Rating:</span>
                  <span className="text-emerald-300">{ccAccount?.rating || 2065} ({ccAccount?.rankTitle || '5★'})</span>
                </div>
                <div className="flex justify-between">
                  <span>Solved Count:</span>
                  <span className="text-slate-200">{ccAccount?.totalSolved || 315}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSyncPlatform('codechef')}
              disabled={isSyncing}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/60 rounded-md transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Verify &amp; Sync CodeChef</span>
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Profile Edit Form */}
      <form onSubmit={handleSaveAll} className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-6">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            Personal &amp; Academic Settings
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Keep your profile details current for your placement roadmap and resume targets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">Degree / College</label>
            <input
              type="text"
              value={formData.college}
              onChange={(e) => setFormData({ ...formData, college: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">Graduation Batch / Year</label>
            <input
              type="text"
              value={formData.gradYear}
              onChange={(e) => setFormData({ ...formData, gradYear: e.target.value })}
              placeholder="e.g. 2026 or 2027"
              className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">Preferred Language</label>
            <select
              value={formData.preferredLanguage}
              onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none font-mono"
            >
              <option value="C++20">C++20 (GCC 13 / Clang)</option>
              <option value="Java 21">Java 21 (OpenJDK)</option>
              <option value="Python 3.12">Python 3.12 (PyPy3)</option>
              <option value="Rust">Rust (2021 Edition)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 font-medium block mb-1">Bio &amp; Placement Target Statement</label>
          <textarea
            rows={3}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none leading-relaxed"
          />
        </div>

        {/* Webhook URLs for Automated Reminders */}
        <div className="pt-4 border-t border-slate-800/80 space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-indigo-400" />
            Contest Reminder Endpoints
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1 font-medium">
                Discord Webhook URL (Optional)
              </label>
              <input
                type="url"
                value={formData.discordWebhookUrl}
                onChange={(e) => setFormData({ ...formData, discordWebhookUrl: e.target.value })}
                placeholder="https://discord.com/api/webhooks/..."
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1 font-medium">
                Telegram Chat ID / Channel (Optional)
              </label>
              <input
                type="text"
                value={formData.telegramChatId}
                onChange={(e) => setFormData({ ...formData, telegramChatId: e.target.value })}
                placeholder="@my_contest_alerts or -100xxxx"
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-md transition-colors shadow-sm shadow-indigo-600/30"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save All Profile Changes'}</span>
          </button>
        </div>
      </form>

      {/* Step-by-Step Onboarding Guide */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-400" />
          How to Link and Sync Your Personal Profile (3 Easy Steps)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <span className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Find Your Public Usernames</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Open your profiles on LeetCode, Codeforces, and CodeChef. Verify that your submission history and contest ratings are public.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <span className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Input &amp; Save Handles</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Paste your handles in the cards above and click <strong>"Save Changes"</strong>. Your profile links and handles will be updated immediately.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <span className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px]">
                3
              </span>
              <span>Sync All Telemetry</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Click <strong>"Sync Platforms"</strong> in the top header. The background ingestion worker will harvest your solved problems and calibrate your 7-Month Placement roadmap!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
