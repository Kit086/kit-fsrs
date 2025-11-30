'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Stats = {
  totalCollections: number;
  totalCards: number;
  dueCards: number;
  newCards: number;
  collections: {
    id: string;
    name: string;
    totalCards: number;
    dueCards: number;
    newCards: number;
  }[];
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--border-color)] rounded w-48"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-[var(--border-color)] rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 md:pl-8">
      <h1 className="text-2xl font-bold mb-6 mt-10 md:mt-0">Dashboard</h1>

      {/* Stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link
          href="/review"
          className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-[var(--primary)] transition-colors"
        >
          <div className="text-3xl font-bold text-red-500">{stats?.dueCards || 0}</div>
          <div className="text-sm opacity-60">Due Today</div>
        </Link>
        <Link
          href="/cards/new"
          className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-[var(--primary)] transition-colors"
        >
          <div className="text-3xl font-bold text-green-500">{stats?.newCards || 0}</div>
          <div className="text-sm opacity-60">New Cards</div>
        </Link>
        <div className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)]">
          <div className="text-3xl font-bold text-blue-500">{stats?.totalCards || 0}</div>
          <div className="text-sm opacity-60">Total Cards</div>
        </div>
        <div className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)]">
          <div className="text-3xl font-bold text-purple-500">{stats?.totalCollections || 0}</div>
          <div className="text-sm opacity-60">Collections</div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {stats?.dueCards && stats.dueCards > 0 ? (
            <Link
              href="/review"
              className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors"
            >
              Start Review ({stats.dueCards} cards)
            </Link>
          ) : (
            <span className="px-4 py-2 rounded-lg bg-[var(--border-color)] opacity-50">
              No cards due for review
            </span>
          )}
          <Link
            href="/collections/new"
            className="px-4 py-2 rounded-lg border border-[var(--border-color)] hover:bg-[var(--border-color)] transition-colors"
          >
            + New Collection
          </Link>
        </div>
      </div>

      {/* Collections overview */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Collections</h2>
        {stats?.collections && stats.collections.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.collections.map(col => (
              <Link
                key={col.id}
                href={`/collections/${col.id}`}
                className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-[var(--primary)] transition-colors"
              >
                <div className="font-medium mb-2">{col.name}</div>
                <div className="flex gap-4 text-sm opacity-60">
                  <span>{col.totalCards} cards</span>
                  {col.dueCards > 0 && (
                    <span className="text-red-500">{col.dueCards} due</span>
                  )}
                  {col.newCards > 0 && (
                    <span className="text-green-500">{col.newCards} new</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 opacity-60">
            <p>No collections yet.</p>
            <Link href="/collections/new" className="text-[var(--primary)] hover:underline">
              Create your first collection
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
