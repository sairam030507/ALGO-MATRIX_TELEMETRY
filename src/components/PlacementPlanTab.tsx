import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Target,
  Sparkles,
  BookOpen,
  Building2,
  Download,
  AlertCircle,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { PlacementPhase } from '../data/mockDatabase';

interface PlacementPlanTabProps {
  plan: {
    targetMonths: number;
    targetRating: number;
    companyTier: 'faang' | 'tier2' | 'all';
    dailyProblemGoal: number;
    weeklyHours: number;
    phases: PlacementPhase[];
  };
  onToggleMilestone: (milestoneId: string) => void;
  onUpdateSettings: (settings: {
    targetRating?: number;
    dailyProblemGoal?: number;
    weeklyHours?: number;
    companyTier?: 'faang' | 'tier2' | 'all';
  }) => void;
  onAddToSm2: (title: string, topic: string, rating: number) => void;
}

export const PlacementPlanTab: React.FC<PlacementPlanTabProps> = ({
  plan,
  onToggleMilestone,
  onUpdateSettings,
  onAddToSm2,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Compute stats
  let totalMilestones = 0;
  let completedMilestones = 0;
  let totalProblems = 0;

  plan.phases.forEach((p) => {
    p.milestones.forEach((m) => {
      totalMilestones += 1;
      totalProblems += m.problemsTarget;
      if (m.completed) completedMilestones += 1;
    });
  });

  const progressPct = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
  const currentPhase = plan.phases.find((p) => p.month === selectedMonth) || plan.phases[0];

  const handleExportPlan = () => {
    let md = `# AlgoPulse 7-Month Campus Placement Drive Roadmap\n`;
    md += `Target Rating: ${plan.targetRating} | Daily Goal: ${plan.dailyProblemGoal} problems | Weekly Hours: ${plan.weeklyHours}h\n\n`;

    plan.phases.forEach((p) => {
      md += `## ${p.phaseTitle}\n`;
      md += `Focus: ${p.focusArea}\n`;
      md += `Target Rating Range: ${p.targetRatingRange}\n`;
      if (p.csFundamentalsFocus) md += `CS Fundamentals: ${p.csFundamentalsFocus}\n`;
      if (p.oaStrategy) md += `OA Strategy: ${p.oaStrategy}\n`;
      md += `### Milestones:\n`;
      p.milestones.forEach((m) => {
        md += `- [${m.completed ? 'x' : ' '}] Week ${m.week}: ${m.title} (${m.problemsTarget} problems)\n`;
        md += `  Topics: ${m.topics.join(', ')}\n`;
        md += `  High-Yield Patterns: ${m.highYieldPatterns.join(', ')}\n`;
      });
      md += `\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'algopulse-7-month-placement-plan.md';
    a.click();
    URL.revokeObjectURL(url);

    setExportNotice('Roadmap downloaded as Markdown file.');
    setTimeout(() => setExportNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Plan Header & Goal Configurator */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
              <Target className="w-4 h-4" />
              <span>Campus Placement Strategy Engine · 7 Months Timeline</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              7-Month Structured Placement Mastery Blueprint
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Engineered for high-volume campus hiring drives (FAANG, Tier-1 Product, and High-Frequency Quant roles).
              Structured into 28 progressive weekly milestones with Core CS subjects &amp; OA tactics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportPlan}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-md transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export Roadmap (.md)</span>
            </button>
          </div>
        </div>

        {exportNotice && (
          <div className="mt-4 p-3 bg-indigo-950/60 border border-indigo-800/60 text-xs text-indigo-200 rounded-md">
            {exportNotice}
          </div>
        )}

        {/* Customization Controls Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          {/* Target Rating Selector */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1.5">
              Target Rating
            </label>
            <select
              value={plan.targetRating}
              onChange={(e) => onUpdateSettings({ targetRating: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-md px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none font-mono"
            >
              <option value={1800}>1800 · Specialist / Tier-2 Ready</option>
              <option value={2000}>2000 · Candidate Master / FAANG Bar</option>
              <option value={2100}>2100 · Master / High-Bar Product</option>
              <option value={2300}>2300 · Grandmaster / Quant Bar</option>
            </select>
          </div>

          {/* Company Tier Focus */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1.5">
              Target Company Tier
            </label>
            <select
              value={plan.companyTier}
              onChange={(e) => onUpdateSettings({ companyTier: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-md px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none"
            >
              <option value="faang">Tier 1 · Google, Uber, DE Shaw, Rubrik</option>
              <option value="tier2">Tier 2 · Amazon, Microsoft, Atlassian</option>
              <option value="all">All Top-Tier Product Engineering</option>
            </select>
          </div>

          {/* Daily Problem Target */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1.5">
              Daily Target Problems
            </label>
            <select
              value={plan.dailyProblemGoal}
              onChange={(e) => onUpdateSettings({ dailyProblemGoal: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-md px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none font-mono"
            >
              <option value={2}>2 problems / day (~14/week)</option>
              <option value={3}>3 problems / day (~21/week)</option>
              <option value={4}>4 problems / day (~28/week)</option>
            </select>
          </div>

          {/* Weekly Time Commitment */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1.5">
              Weekly Commitment
            </label>
            <select
              value={plan.weeklyHours}
              onChange={(e) => onUpdateSettings({ weeklyHours: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-md px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none font-mono"
            >
              <option value={12}>12 hours / week (Balanced)</option>
              <option value={18}>18 hours / week (Recommended)</option>
              <option value={25}>25 hours / week (High Velocity)</option>
            </select>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400">
              Total Milestones Completed: <span className="text-white font-mono font-bold tabular-nums">{completedMilestones}</span> of {totalMilestones} ({progressPct}%)
            </span>
            <span className="text-slate-400">
              Target Scope: <span className="text-indigo-300 font-mono font-bold tabular-nums">{totalProblems}</span> Solved Problems across 7 Months
            </span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/60">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(4, progressPct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Month-by-Month Tab Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {plan.phases.map((phase) => {
          const isSelected = selectedMonth === phase.month;
          const phaseCompletedCount = phase.milestones.filter((m) => m.completed).length;
          const allCompleted = phaseCompletedCount === phase.milestones.length;

          return (
            <button
              key={phase.month}
              onClick={() => setSelectedMonth(phase.month)}
              className={`flex-1 min-w-[140px] px-3.5 py-3 rounded-lg border text-left transition-all ${
                isSelected
                  ? 'bg-slate-900 border-indigo-500/80 shadow-sm shadow-indigo-500/10'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className={`font-semibold uppercase tracking-wider ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`}>
                  Month {phase.month}
                </span>
                {allCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span className="font-mono text-slate-500 tabular-nums">
                    {phaseCompletedCount}/{phase.milestones.length}
                  </span>
                )}
              </div>
              <div className="text-xs font-semibold text-slate-200 line-clamp-1">
                {phase.focusArea.split(',')[0]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Month Detail View */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-6">
        {/* Phase Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold">
              Phase {currentPhase.month} of 7
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">
              {currentPhase.phaseTitle}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              {currentPhase.description}
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-right shrink-0">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Difficulty Target</div>
            <div className="text-xs font-mono font-semibold text-amber-300 tabular-nums">
              {currentPhase.targetRatingRange}
            </div>
          </div>
        </div>

        {/* Phase Strategy Cards: CS Fundamentals & OA Tactic */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentPhase.csFundamentalsFocus && (
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
                <BookOpen className="w-3.5 h-3.5" />
                <span>CS Fundamentals Focus for Month {currentPhase.month}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentPhase.csFundamentalsFocus}
              </p>
            </div>
          )}

          {currentPhase.oaStrategy && (
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Online Assessment (OA) Speed Benchmark</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentPhase.oaStrategy}
              </p>
            </div>
          )}
        </div>

        {/* Weekly Milestones Checklist */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Weekly Milestones &amp; High-Yield Algorithmic Patterns
          </h4>

          <div className="grid grid-cols-1 gap-3.5">
            {currentPhase.milestones.map((m) => (
              <div
                key={m.id}
                className={`p-4 rounded-lg border transition-all ${
                  m.completed
                    ? 'bg-slate-950/50 border-emerald-900/40 text-slate-300'
                    : 'bg-slate-950 border-slate-800/80 text-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => onToggleMilestone(m.id)}
                      className="mt-0.5 text-slate-400 hover:text-white transition-colors shrink-0"
                    >
                      {m.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                      )}
                    </button>

                    <div className="space-y-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-semibold text-indigo-400">
                            Week {m.week}
                          </span>
                          <span className="text-xs text-slate-500">·</span>
                          <h5 className={`text-sm font-semibold ${m.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                            {m.title}
                          </h5>
                        </div>
                      </div>

                      {/* Problem Examples */}
                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="text-slate-500 font-medium">Core Problems:</span>
                        {m.topics.map((topic, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px]"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>

                      {/* High Yield Patterns */}
                      <div className="text-xs text-slate-400 space-y-1">
                        <span className="text-slate-500 font-medium">Mastery Invariant:</span>
                        <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-0.5 pl-1">
                          {m.highYieldPatterns.map((pat, idx) => (
                            <li key={idx}>{pat}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-xs font-mono text-slate-400 tabular-nums">
                      {m.problemsTarget} problems
                    </span>

                    <button
                      onClick={() => onAddToSm2(m.title, currentPhase.focusArea.split(',')[0], 1900)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Push to SM-2</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
