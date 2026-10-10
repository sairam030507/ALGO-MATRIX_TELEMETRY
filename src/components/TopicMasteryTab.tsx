import React, { useState } from 'react';
import {
  Trophy,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Target,
  Sparkles,
  BarChart2,
  TrendingDown,
} from 'lucide-react';
import { TopicMetric, SubTopicMetric } from '../types';

interface TopicMasteryTabProps {
  topicMetrics: TopicMetric[];
  onAddToSm2: (title: string, topic: string, rating: number) => void;
}

export const TopicMasteryTab: React.FC<TopicMasteryTabProps> = ({
  topicMetrics,
  onAddToSm2,
}) => {
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({
    'dynamic-programming': true,
    'math-number-theory': true,
  });

  const toggleExpand = (topicId: string) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  };

  // Weak sub-topics flat list
  const weakSubTopics: { parentName: string; sub: SubTopicMetric }[] = [];
  topicMetrics.forEach((tm) => {
    tm.subTopics.forEach((st) => {
      if (st.isWeakness) {
        weakSubTopics.push({ parentName: tm.topicName, sub: st });
      }
    });
  });

  // Sort by priority score descending
  weakSubTopics.sort((a, b) => b.sub.priorityScore - a.sub.priorityScore);

  return (
    <div className="space-y-6">
      {/* Top Header Card & Weakness Alert Strip */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Topic Mastery &amp; Automated Weakness Engine</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Canonical Topic Hierarchy &amp; Attempt Analytics
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Cross-platform submissions normalized into canonical 2-tier topics. Tracks Attempt-to-AC ratio,
              solve duration velocity, and difficulty-weighted mastery.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-right shrink-0">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider">Automated Alerts</div>
            <div className="text-sm font-mono font-bold text-amber-400 tabular-nums">
              {weakSubTopics.length} Lagging Sub-Topics Flagged
            </div>
          </div>
        </div>

        {/* Mathematical Formula Card */}
        <div className="mt-5 p-4 bg-slate-950/70 border border-slate-800/80 rounded-lg text-xs space-y-1.5">
          <div className="font-semibold text-slate-300 flex items-center gap-2">
            <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Mastery Formula Specification:</span>
          </div>
          <div className="font-mono text-indigo-300 text-[11px] overflow-x-auto py-1">
            M(topic) = min(100, ( ∑ [ Difficulty(p) × w(attempts_p) ] / Benchmark_Target ) × 100 )
          </div>
          <p className="text-slate-400 text-[11px]">
            Where w(attempts) = max(0.40, 1.0 - 0.15 × (attempts - 1)). Sub-topics are flagged as weaknesses when
            attempt ratio exceeds 2.0, solve time exceeds 35 minutes, or mastery falls below 55%.
          </p>
        </div>
      </div>

      {/* Lagging Sub-Topics Priority Alert Grid */}
      {weakSubTopics.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
            <span className="flex items-center gap-1.5 text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              Urgent Remedial Queue (Priority Ranked)
            </span>
            <span className="text-slate-500">Auto-flagged from submission telemetry</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {weakSubTopics.map(({ parentName, sub }) => (
              <div
                key={sub.id}
                className="bg-slate-900/90 border border-amber-900/40 rounded-xl p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="truncate">{parentName}</span>
                    <span className="font-mono text-amber-400 font-bold tabular-nums">
                      Priority {sub.priorityScore}/100
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white">{sub.name}</h4>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-center">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Attempt:AC</div>
                      <div className="text-xs font-mono font-semibold text-amber-300 tabular-nums">
                        {sub.attemptToAcRatio}:1
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Avg Time</div>
                      <div className="text-xs font-mono font-semibold text-slate-300 tabular-nums">
                        {sub.averageSolveTimeMinutes}m
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Mastery</div>
                      <div className="text-xs font-mono font-semibold text-amber-400 tabular-nums">
                        {sub.masteryScore}%
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onAddToSm2(sub.name, parentName, 2100)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-800/60 rounded-md transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Push Topic Drill to SM-2</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Canonical Topic Hierarchy Interactive Accordion */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl divide-y divide-slate-800/80">
        <div className="p-5 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Full Canonical Topic Hierarchy &amp; Sub-Topic Telemetry
          </h3>
          <span className="text-xs text-slate-500">
            5 Root Categories · 19 Normalized Sub-Topics
          </span>
        </div>

        {topicMetrics.map((topic) => {
          const isExpanded = expandedTopics[topic.topicId];

          return (
            <div key={topic.topicId} className="transition-colors">
              {/* Parent Topic Row */}
              <div
                onClick={() => toggleExpand(topic.topicId)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <button className="text-slate-400 hover:text-white transition-colors">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {topic.topicName}
                      </span>
                      {topic.isWeakness && (
                        <span className="text-[11px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/50 px-2 py-0.5 rounded">
                          Lagging Topic
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      Category: {topic.category} · {topic.subTopics.length} sub-topics
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6 font-mono text-xs tabular-nums">
                  <div className="text-right hidden sm:block">
                    <div className="text-slate-400">Total Solved</div>
                    <div className="font-semibold text-slate-200">{topic.totalSolved}</div>
                  </div>

                  <div className="text-right hidden sm:block">
                    <div className="text-slate-400">Attempt Ratio</div>
                    <div className={`font-semibold ${topic.attemptToAcRatio > 2.0 ? 'text-amber-400' : 'text-slate-200'}`}>
                      {topic.attemptToAcRatio}:1
                    </div>
                  </div>

                  <div className="text-right min-w-[80px]">
                    <div className="text-slate-400">Mastery Score</div>
                    <div className={`font-bold ${topic.difficultyWeightedMastery >= 80 ? 'text-emerald-400' : topic.difficultyWeightedMastery >= 65 ? 'text-indigo-300' : 'text-amber-400'}`}>
                      {topic.difficultyWeightedMastery}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-Topics Expanded Table */}
              {isExpanded && (
                <div className="bg-slate-950/60 px-5 py-4 border-t border-slate-800/60">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-slate-500 border-b border-slate-800/80 text-[11px] uppercase tracking-wider">
                          <th className="py-2 font-medium">Sub-Topic</th>
                          <th className="py-2 font-medium text-right">Solved</th>
                          <th className="py-2 font-medium text-right">Attempt:AC</th>
                          <th className="py-2 font-medium text-right">Avg Time</th>
                          <th className="py-2 font-medium text-right">Mastery Score</th>
                          <th className="py-2 font-medium text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900">
                        {topic.subTopics.map((sub) => (
                          <tr key={sub.id} className="hover:bg-slate-900/40">
                            <td className="py-2.5 font-medium text-slate-200">
                              <div className="flex items-center gap-2">
                                <span>{sub.name}</span>
                                {sub.isWeakness && (
                                  <span className="text-[10px] text-amber-400 font-normal">
                                    (Weakness)
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 text-right font-mono text-slate-300 tabular-nums">
                              {sub.totalSolved}
                            </td>
                            <td className={`py-2.5 text-right font-mono tabular-nums ${sub.attemptToAcRatio > 2.0 ? 'text-amber-400 font-semibold' : 'text-slate-300'}`}>
                              {sub.attemptToAcRatio}:1
                            </td>
                            <td className="py-2.5 text-right font-mono text-slate-300 tabular-nums">
                              {sub.averageSolveTimeMinutes}m
                            </td>
                            <td className="py-2.5 text-right font-mono tabular-nums">
                              <span className={`font-semibold ${sub.masteryScore >= 80 ? 'text-emerald-400' : sub.masteryScore >= 60 ? 'text-indigo-300' : 'text-amber-400'}`}>
                                {sub.masteryScore}%
                              </span>
                            </td>
                            <td className="py-2.5 text-right">
                              <button
                                onClick={() => onAddToSm2(sub.name, topic.topicName, 2000)}
                                className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                              >
                                Drill
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
