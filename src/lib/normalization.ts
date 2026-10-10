import { Platform, LeetCodeDifficulty, CodeChefStar } from '../types';

/**
 * Normalizes problem difficulty into internal unified CP scale (800 to 3500).
 * Codeforces is the anchor baseline (800 to 3500).
 */
export function normalizeLeetCodeDifficulty(
  tier: LeetCodeDifficulty,
  contestRating?: number
): number {
  if (contestRating && contestRating > 0) {
    // LeetCode contest rating is typically ~1200 to 3300
    // Linear transformation anchoring 1200 LC -> 800 Unified, 3300 LC -> 3500 Unified
    const normalized = 800 + ((contestRating - 1200) / (3300 - 1200)) * (3500 - 800);
    return Math.round(Math.max(800, Math.min(3500, normalized)));
  }

  switch (tier) {
    case 'Easy':
      return 1000; // CF 800 - 1200 equivalent
    case 'Medium':
      return 1600; // CF 1300 - 1900 equivalent
    case 'Hard':
      return 2350; // CF 2000 - 3000 equivalent
    default:
      return 1400;
  }
}

export function normalizeCodeforcesDifficulty(rating: number): number {
  return Math.max(800, Math.min(3500, Math.round(rating)));
}

export function normalizeCodeChefDifficulty(
  stars: CodeChefStar | string,
  numericRating?: number
): number {
  if (numericRating && numericRating > 0) {
    // CodeChef rating ranges ~1000 to 3000+
    const normalized = 800 + ((numericRating - 1000) / (2800 - 1000)) * (3400 - 800);
    return Math.round(Math.max(800, Math.min(3500, normalized)));
  }

  const starMap: Record<string, number> = {
    '1★': 950,
    '2★': 1300,
    '3★': 1600,
    '4★': 1950,
    '5★': 2250,
    '6★': 2550,
    '7★': 2950,
  };

  return starMap[stars] || 1400;
}

/**
 * Unified conversion helper allowing bi-directional lookup.
 */
export function unifiedToPlatformEquivalents(unifiedRating: number): {
  leetcode: { tier: string; approxContestRating: number };
  codeforces: { rating: number; title: string; color: string };
  codechef: { stars: string; approxRating: number };
} {
  const clamped = Math.max(800, Math.min(3500, Math.round(unifiedRating)));

  // LeetCode estimate
  let lcTier = 'Easy';
  if (clamped >= 1900) lcTier = 'Hard';
  else if (clamped >= 1300) lcTier = 'Medium';
  const approxLcContest = Math.round(1200 + ((clamped - 800) / (3500 - 800)) * (3300 - 1200));

  // Codeforces estimate & titles
  let cfTitle = 'Newbie';
  let cfColor = '#94a3b8'; // gray
  if (clamped >= 3000) { cfTitle = 'Legendary Grandmaster'; cfColor = '#ef4444'; }
  else if (clamped >= 2600) { cfTitle = 'International Grandmaster'; cfColor = '#ef4444'; }
  else if (clamped >= 2400) { cfTitle = 'Grandmaster'; cfColor = '#ef4444'; }
  else if (clamped >= 2300) { cfTitle = 'International Master'; cfColor = '#f59e0b'; }
  else if (clamped >= 2100) { cfTitle = 'Master'; cfColor = '#f59e0b'; }
  else if (clamped >= 1900) { cfTitle = 'Candidate Master'; cfColor = '#a855f7'; }
  else if (clamped >= 1600) { cfTitle = 'Expert'; cfColor = '#3b82f6'; }
  else if (clamped >= 1400) { cfTitle = 'Specialist'; cfColor = '#06b6d4'; }
  else if (clamped >= 1200) { cfTitle = 'Pupil'; cfColor = '#10b981'; }

  // CodeChef estimate
  let ccStars = '1★';
  if (clamped >= 2700) ccStars = '7★';
  else if (clamped >= 2400) ccStars = '6★';
  else if (clamped >= 2100) ccStars = '5★';
  else if (clamped >= 1800) ccStars = '4★';
  else if (clamped >= 1500) ccStars = '3★';
  else if (clamped >= 1200) ccStars = '2★';

  const approxCcRating = Math.round(1000 + ((clamped - 800) / (3400 - 800)) * (2800 - 1000));

  return {
    leetcode: { tier: lcTier, approxContestRating: approxLcContest },
    codeforces: { rating: clamped, title: cfTitle, color: cfColor },
    codechef: { stars: ccStars, approxRating: approxCcRating },
  };
}

/**
 * Standardize heterogeneous platform tags into a canonical topic hierarchy.
 */
export interface CanonicalHierarchyNode {
  id: string;
  name: string;
  category: string;
  subTopics: {
    id: string;
    name: string;
    synonyms: string[];
    description: string;
  }[];
}

export const CANONICAL_TOPIC_HIERARCHY: CanonicalHierarchyNode[] = [
  {
    id: 'dynamic-programming',
    name: 'Dynamic Programming',
    category: 'Algorithms',
    subTopics: [
      {
        id: 'dp-trees',
        name: 'DP on Trees & DAGs',
        synonyms: ['dp on trees', 'tree-dp', 'tree dp', 'treedp', 'trees-dp'],
        description: 'Subtree aggregations, in-out rerooting DP, and state transitions along tree edges.',
      },
      {
        id: 'dp-bitmask',
        name: 'Bitmask & State DP',
        synonyms: ['bitmask-dp', 'bitmask', 'state-compression', 'sos-dp', 'sum-over-subsets'],
        description: 'Exponential subset states compressed into integer bit representations.',
      },
      {
        id: 'dp-knapsack',
        name: 'Knapsack & Combinatorial DP',
        synonyms: ['knapsack', 'subset-sum', 'coin-change', 'bounded-knapsack'],
        description: '0/1, unbounded, bounded knapsack variants and subset partition problems.',
      },
      {
        id: 'dp-digit',
        name: 'Digit DP',
        synonyms: ['digit-dp', 'digit dp', 'digits-dp'],
        description: 'Counting integers under specific numeric constraints up to large bounds (10^18).',
      },
      {
        id: 'dp-intervals',
        name: 'Interval & Matrix DP',
        synonyms: ['matrix-chain', 'interval-dp', 'range-dp', 'palindrome-partitioning'],
        description: 'Optimizing range queries and partitions over intervals [L, R].',
      },
    ],
  },
  {
    id: 'graphs',
    name: 'Graph Theory & Networks',
    category: 'Algorithms',
    subTopics: [
      {
        id: 'graph-shortest-path',
        name: 'Shortest Path Algorithms',
        synonyms: ['shortest-paths', 'dijkstra', 'bellman-ford', 'spfa', 'floyd-warshall'],
        description: 'Single-source and all-pairs shortest paths on weighted directed/undirected graphs.',
      },
      {
        id: 'graph-tree-algos',
        name: 'Tree Structures & LCA',
        synonyms: ['lca', 'binary-lifting', 'heavy-light-decomposition', 'euler-tour', 'centroid'],
        description: 'Binary lifting, lowest common ancestor, heavy-light decomposition, and centroid decomposition.',
      },
      {
        id: 'graph-flow-matching',
        name: 'Network Flow & Bipartite Matching',
        synonyms: ['max-flow', 'dinic', 'hopcroft-karp', 'hungarian', 'min-cost-max-flow', 'matching'],
        description: 'Maximum flow, minimum cut theorems, and matching algorithms in bipartite graphs.',
      },
      {
        id: 'graph-connectivity',
        name: 'Strong Connectivity & Bridges',
        synonyms: ['tarjan', 'kosaraju', 'bridges', 'articulation-points', '2-sat', 'scc'],
        description: 'Tarjan and Kosaraju algorithms, 2-SAT satisfiability, and bridge detection.',
      },
    ],
  },
  {
    id: 'data-structures',
    name: 'Advanced Data Structures',
    category: 'Data Structures',
    subTopics: [
      {
        id: 'ds-trees',
        name: 'Segment Tree & Fenwick (BIT)',
        synonyms: ['segment-tree', 'lazy-propagation', 'fenwick-tree', 'binary-indexed-tree', 'bit'],
        description: 'Range sum/min/max queries with point and interval updates in O(log N).',
      },
      {
        id: 'ds-dsu',
        name: 'Disjoint Set Union (DSU)',
        synonyms: ['dsu', 'union-find', 'disjoint-set', 'dsu-with-rollbacks'],
        description: 'Partition tracking, Kruskal MST, connected component maintenance with path compression.',
      },
      {
        id: 'ds-monotonic',
        name: 'Monotonic Queue & Stack',
        synonyms: ['monotonic-stack', 'monotonic-queue', 'sliding-window-maximum', 'next-greater-element'],
        description: 'Linear time bounding for range extrema and histogram area calculations.',
      },
      {
        id: 'ds-tries',
        name: 'Trie & String Automata',
        synonyms: ['trie', 'prefix-tree', 'xor-trie', 'aho-corasick', 'suffix-automaton'],
        description: 'Prefix lookups, bitwise XOR maximum matching, and multi-pattern string matching.',
      },
    ],
  },
  {
    id: 'math-number-theory',
    name: 'Mathematics & Number Theory',
    category: 'Mathematics',
    subTopics: [
      {
        id: 'math-modular',
        name: 'Modular Arithmetic & Combinatorics',
        synonyms: ['modular-arithmetic', 'fermat-little-theorem', 'combinations', 'ncr', 'lucas-theorem'],
        description: 'Modular inverses, binomial coefficients, permutations, and Catalan numbers.',
      },
      {
        id: 'math-primes',
        name: 'Prime Sieve & Factoring',
        synonyms: ['sieve-of-eratosthenes', 'prime-factorization', 'miller-rabin', 'pollard-rho', 'euler-totient'],
        description: 'Linear sieve, primality testing, totient function, and Pollard-Rho factorization.',
      },
      {
        id: 'math-matrix-fft',
        name: 'Matrix Exponentiation & NTT/FFT',
        synonyms: ['matrix-exponentiation', 'fast-fourier-transform', 'ntt', 'fft', 'polynomials'],
        description: 'Recurrence relation acceleration in O(K^3 log N) and polynomial multiplication in O(N log N).',
      },
    ],
  },
  {
    id: 'greedy-search',
    name: 'Greedy & Search Paradigms',
    category: 'Algorithms',
    subTopics: [
      {
        id: 'search-binary',
        name: 'Binary Search on Answer',
        synonyms: ['binary-search', 'monotonic-predicate', 'ternary-search', 'meet-in-the-middle'],
        description: 'Inverting optimization to decision problems via monotonic predicate testing.',
      },
      {
        id: 'algo-two-pointers',
        name: 'Two Pointers & Sliding Window',
        synonyms: ['two-pointers', 'sliding-window', 'two-pointer', 'subarray-sum'],
        description: 'Linear two-finger scan on sorted sequences or monotonic intervals.',
      },
      {
        id: 'algo-greedy',
        name: 'Constructive & Exchange Arguments',
        synonyms: ['greedy', 'constructive-algorithms', 'exchange-argument', 'sorting'],
        description: 'Locally optimal choices and proof by exchange argument or invariant preservation.',
      },
    ],
  },
];

/**
 * Maps a raw tag string from any platform to its canonical topic and sub-topic.
 */
export function mapPlatformTagToCanonical(
  tag: string
): { canonicalTopicId: string; canonicalTopicName: string; subTopicId: string; subTopicName: string } {
  const normalizedTag = tag.trim().toLowerCase().replace(/[_\s]+/g, '-');

  for (const parent of CANONICAL_TOPIC_HIERARCHY) {
    for (const sub of parent.subTopics) {
      if (
        sub.id === normalizedTag ||
        sub.name.toLowerCase().includes(normalizedTag) ||
        sub.synonyms.some(syn => syn.replace(/[_\s]+/g, '-') === normalizedTag || normalizedTag.includes(syn))
      ) {
        return {
          canonicalTopicId: parent.id,
          canonicalTopicName: parent.name,
          subTopicId: sub.id,
          subTopicName: sub.name,
        };
      }
    }
  }

  // Fallback defaults
  if (normalizedTag.includes('dp') || normalizedTag.includes('dynamic')) {
    return {
      canonicalTopicId: 'dynamic-programming',
      canonicalTopicName: 'Dynamic Programming',
      subTopicId: 'dp-knapsack',
      subTopicName: 'Knapsack & Combinatorial DP',
    };
  }
  if (normalizedTag.includes('graph') || normalizedTag.includes('tree') || normalizedTag.includes('bfs') || normalizedTag.includes('dfs')) {
    return {
      canonicalTopicId: 'graphs',
      canonicalTopicName: 'Graph Theory & Networks',
      subTopicId: 'graph-shortest-path',
      subTopicName: 'Shortest Path Algorithms',
    };
  }
  if (normalizedTag.includes('math') || normalizedTag.includes('number')) {
    return {
      canonicalTopicId: 'math-number-theory',
      canonicalTopicName: 'Mathematics & Number Theory',
      subTopicId: 'math-modular',
      subTopicName: 'Modular Arithmetic & Combinatorics',
    };
  }

  return {
    canonicalTopicId: 'greedy-search',
    canonicalTopicName: 'Greedy & Search Paradigms',
    subTopicId: 'algo-greedy',
    subTopicName: 'Constructive & Exchange Arguments',
  };
}
