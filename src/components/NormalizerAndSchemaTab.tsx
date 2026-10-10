import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Database,
  Copy,
  Check,
  Search,
  BookOpen,
  ArrowRight,
  Terminal,
} from 'lucide-react';
import { unifiedToPlatformEquivalents, mapPlatformTagToCanonical } from '../lib/normalization';

interface NormalizerAndSchemaTabProps {
  initialRating?: number;
}

export const NormalizerAndSchemaTab: React.FC<NormalizerAndSchemaTabProps> = ({
  initialRating = 1980,
}) => {
  const [unifiedRating, setUnifiedRating] = useState<number>(initialRating);
  const [tagQuery, setTagQuery] = useState<string>('dp on trees');
  const [copied, setCopied] = useState<boolean>(false);
  const [ddlSchema, setDdlSchema] = useState<string>('Loading PostgreSQL schema...');

  useEffect(() => {
    fetch('/api/schema/ddl')
      .then((res) => res.json())
      .then((data) => {
        if (data.ddl) setDdlSchema(data.ddl);
      })
      .catch(() => {
        setDdlSchema('-- Schema available in /src/data/schema.sql');
      });
  }, []);

  const equivalents = unifiedToPlatformEquivalents(unifiedRating);
  const tagMapping = mapPlatformTagToCanonical(tagQuery);

  const handleCopy = () => {
    navigator.clipboard.writeText(ddlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Interactive Difficulty Normalization Scale Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <Sliders className="w-4 h-4" />
            <span>Multi-Platform Difficulty Normalization Engine</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Unified Rating Scale (800 to 3500)
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Harmonizes LeetCode tiers, Codeforces Elo, and CodeChef stars into a continuous anchor.
            Drag the slider to test difficulty equivalence across platforms.
          </p>
        </div>

        {/* Rating Slider */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Unified Internal Rating</span>
            <span className="text-lg font-mono font-bold text-indigo-400 tabular-nums">
              {unifiedRating}
            </span>
          </div>
          <input
            type="range"
            min={800}
            max={3500}
            step={25}
            value={unifiedRating}
            onChange={(e) => setUnifiedRating(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>800 (Newbie / Easy)</span>
            <span>1600 (Expert / Medium)</span>
            <span>2400 (Grandmaster / Hard)</span>
            <span>3500 (LGM / International)</span>
          </div>
        </div>

        {/* Equivalent Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* LeetCode Equivalent */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-1">
            <div className="text-[11px] font-semibold text-amber-400 uppercase">
              LeetCode Equivalent
            </div>
            <div className="text-base font-bold text-white">
              {equivalents.leetcode.tier} Tier
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Contest Rating: ~{equivalents.leetcode.approxContestRating}
            </div>
          </div>

          {/* Codeforces Equivalent */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-1">
            <div className="text-[11px] font-semibold text-cyan-400 uppercase">
              Codeforces Anchor (1:1)
            </div>
            <div className="text-base font-bold" style={{ color: equivalents.codeforces.color }}>
              {equivalents.codeforces.title}
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Rating: {equivalents.codeforces.rating}
            </div>
          </div>

          {/* CodeChef Equivalent */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-1">
            <div className="text-[11px] font-semibold text-emerald-400 uppercase">
              CodeChef Equivalent
            </div>
            <div className="text-base font-bold text-white">
              {equivalents.codechef.stars} Division
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Rating: ~{equivalents.codechef.approxRating}
            </div>
          </div>
        </div>
      </div>

      {/* Canonical Tag Normalizer Lookup */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Search className="w-4 h-4 text-indigo-400" />
            Heterogeneous Tag to Canonical Hierarchy Resolver
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Type any raw tag from LeetCode, Codeforces, or CodeChef (e.g. <code>tree-dp</code>, <code>coin-change</code>, <code>dijkstra</code>, <code>bitmask</code>, <code>matrix-exponentiation</code>).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={tagQuery}
            onChange={(e) => setTagQuery(e.target.value)}
            placeholder="Search or test raw tag..."
            className="flex-1 bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-md px-3.5 py-2.5 focus:border-indigo-500 focus:outline-none font-mono"
          />
        </div>

        <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Resolved Canonical Topic</span>
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <span>{tagMapping.canonicalTopicName}</span>
              <span className="text-slate-600">→</span>
              <span className="text-indigo-400">{tagMapping.subTopicName}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Canonical Slug</span>
            <span className="font-mono text-slate-400 text-xs">{tagMapping.subTopicId}</span>
          </div>
        </div>
      </div>

      {/* Complete PostgreSQL Relational Schema DDL Viewer */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" />
              Complete PostgreSQL Relational Schema DDL
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              8 Production tables: users, platform_accounts, canonical_topics, problems, user_submissions, topic_mastery, contests, reminders.
            </p>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied DDL</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy SQL DDL</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-4 bg-slate-950 border border-slate-800 rounded-lg font-mono text-[11px] text-slate-300 max-h-[480px] overflow-y-auto leading-relaxed scrollbar-thin">
          {ddlSchema}
        </pre>
      </div>
    </div>
  );
};
