import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Award,
} from 'lucide-react';
import { SM2Item } from '../types';
import { SM2_QUALITY_RATINGS, formatIntervalDays } from '../lib/sm2';

interface RevisionQueueTabProps {
  items: SM2Item[];
  onReviewItem: (id: string, quality: number) => Promise<void>;
}

export const RevisionQueueTab: React.FC<RevisionQueueTabProps> = ({
  items,
  onReviewItem,
}) => {
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const dueItems = items.filter((it) => it.isDue);
  const scheduledItems = items.filter((it) => !it.isDue);

  const currentItem: SM2Item | undefined = dueItems[activeItemIndex] || dueItems[0];

  const handleRate = async (quality: number) => {
    if (!currentItem || isSubmitting) return;
    setIsSubmitting(true);

    try {
      await onReviewItem(currentItem.id, quality);
      setShowHint(false);
      setFeedbackMessage(
        `Problem rated ${quality}/5. SuperMemo SM-2 recalculated interval for ${currentItem.title}.`
      );
      setTimeout(() => setFeedbackMessage(null), 3500);

      if (activeItemIndex >= dueItems.length - 1) {
        setActiveItemIndex(0);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
              <BookOpen className="w-4 h-4" />
              <span>SuperMemo SM-2 Spaced Repetition Engine</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Daily Problem Revision &amp; Memory Consolidation Deck
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Prevents algorithm decay before your placement drive. Evaluates recall quality to exponentially
              expand review intervals or trigger immediate remedial repetition.
            </p>
          </div>

          <div className="flex items-center gap-4 text-right">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider">Due Today</div>
              <div className="text-sm font-mono font-bold text-amber-400 tabular-nums">
                {dueItems.length} Cards
              </div>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider">Total in Deck</div>
              <div className="text-sm font-mono font-bold text-slate-200 tabular-nums">
                {items.length} Cards
              </div>
            </div>
          </div>
        </div>

        {/* Algorithm Mechanics Notice */}
        <div className="mt-4 flex flex-wrap items-center gap-6 text-xs text-slate-400">
          <span>
            Formula: <span className="font-mono text-indigo-300">EF' = EF + (0.1 - (5 - q) × (0.08 + (5 - q) × 0.02))</span>
          </span>
          <span>·</span>
          <span>Minimum Ease Factor: 1.30</span>
          <span>·</span>
          <span>Passing threshold: Quality ≥ 3</span>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 text-xs text-emerald-200 rounded-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {feedbackMessage}
          </span>
        </div>
      )}

      {/* Main Flashcard Review Space */}
      {currentItem ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-6">
          {/* Card Top Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold uppercase tracking-wider text-indigo-400 font-mono">
                Card {activeItemIndex + 1} of {dueItems.length}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">{currentItem.canonicalTopic}</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-300 font-medium">{currentItem.subTopic}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-amber-300 bg-amber-950/60 border border-amber-800/50 px-2 py-0.5 rounded tabular-nums">
                Rating: {currentItem.normalizedRating}
              </span>
              <span className="text-xs uppercase font-mono text-slate-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded">
                {currentItem.platform}
              </span>
            </div>
          </div>

          {/* Problem Title & Practice Link */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl font-bold text-white tracking-tight">
                {currentItem.title}
              </h3>
              <a
                href={currentItem.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap shrink-0"
              >
                <span>Open Arena</span>
                <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
              </a>
            </div>

            {/* Current SM-2 State metrics */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-950 border border-slate-800/80 rounded-lg text-xs font-mono tabular-nums">
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Current Interval</span>
                <span className="text-slate-200 font-semibold">{currentItem.intervalDays} day(s)</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Repetitions</span>
                <span className="text-slate-200 font-semibold">{currentItem.repetitionNumber} completed</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Ease Factor (EF)</span>
                <span className="text-indigo-400 font-semibold">{currentItem.easeFactor}</span>
              </div>
            </div>
          </div>

          {/* Reflection Prompt / Hints */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                Recall Verification Checklist:
              </span>
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                {showHint ? 'Hide Invariants' : 'Reveal Solution Invariants'}
              </button>
            </div>

            {showHint ? (
              <div className="pt-2 text-xs text-slate-300 space-y-1.5 border-t border-slate-800/80">
                <p>
                  1. Can you derive the subproblem recurrence state without checking the editorial?
                </p>
                <p>
                  2. What are the space/time bounds? Are there corner cases with bounds 0, 1, or negatives?
                </p>
                <p className="text-slate-400 text-[11px]">
                  Topic Pattern: Subtree aggregation and optimal state transitions along tree edges.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Mentally reconstruct your algorithm approach before grading your recall below.
              </p>
            )}
          </div>

          {/* Rating Buttons 0 - 5 */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Grade Your Recall Quality (SuperMemo SM-2 Input):
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {SM2_QUALITY_RATINGS.map((rating) => (
                <button
                  key={rating.score}
                  onClick={() => handleRate(rating.score)}
                  disabled={isSubmitting}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    rating.score >= 4
                      ? 'bg-slate-950 hover:bg-emerald-950/40 border-slate-800 hover:border-emerald-600/60'
                      : rating.score === 3
                      ? 'bg-slate-950 hover:bg-indigo-950/40 border-slate-800 hover:border-indigo-600/60'
                      : 'bg-slate-950 hover:bg-rose-950/40 border-slate-800 hover:border-rose-600/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                    <span>{rating.score}</span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {rating.score >= 3 ? 'PASS' : 'REPEAT'}
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-slate-300 line-clamp-1">
                    {rating.label.split('-')[1]?.trim()}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                    {rating.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Daily Revision Deck Completed!</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            You have reviewed all problem cards due for today. All scheduled memory intervals have been updated.
          </p>
        </div>
      )}

      {/* Scheduled Future Queue Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl divide-y divide-slate-800/80">
        <div className="p-5 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Upcoming Scheduled Revisions
          </h3>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            {scheduledItems.length} items scheduled
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-500 bg-slate-950/40 border-b border-slate-800/80 text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-5 font-medium">Problem</th>
                <th className="py-2.5 px-3 font-medium">Topic</th>
                <th className="py-2.5 px-3 font-medium text-right">Rating</th>
                <th className="py-2.5 px-3 font-medium text-right">Repetitions</th>
                <th className="py-2.5 px-3 font-medium text-right">Ease Factor</th>
                <th className="py-2.5 px-5 font-medium text-right">Next Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {scheduledItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-5 font-medium text-slate-200">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-indigo-300 transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>{item.title}</span>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    {item.canonicalTopic}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-300 tabular-nums">
                    {item.normalizedRating}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-400 tabular-nums">
                    {item.repetitionNumber}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-indigo-400 tabular-nums">
                    {item.easeFactor}
                  </td>
                  <td className="py-3 px-5 text-right font-mono text-slate-300 tabular-nums">
                    {formatIntervalDays(item.intervalDays)}
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
