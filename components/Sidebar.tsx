'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { useState, useEffect } from 'react';

type CollectionWithStats = {
  id: string;
  name: string;
  cardCount: number;
};

type Stats = {
  totalCards: number;
  dueCards: number;
  newCards: number;
};

export function Sidebar() {
  const pathname = usePathname();
  const [collections, setCollections] = useState<CollectionWithStats[]>([]);
  const [stats, setStats] = useState<Stats>({ totalCards: 0, dueCards: 0, newCards: 0 });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [colRes, statsRes] = await Promise.all([
          fetch('/api/collections'),
          fetch('/api/stats'),
        ]);
        if (colRes.ok) setCollections(await colRes.json());
        if (statsRes.ok) {
          const s = await statsRes.json();
          setStats({ totalCards: s.totalCards, dueCards: s.dueCards, newCards: s.newCards });
        }
      } catch {
        // Ignore errors for now
      }
    };
    fetchData();
  }, [pathname]);

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/review', label: `Due Today (${stats.dueCards})`, icon: '📚' },
    { href: '/cards/new', label: `New Cards (${stats.newCards})`, icon: '✨' },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40
        w-64 min-h-screen
        bg-[var(--sidebar-bg)] border-r border-[var(--border-color)]
        flex flex-col
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-4 border-b border-[var(--border-color)]">
          <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
            <span className="text-2xl">🧠</span>
            <span className="font-bold text-lg">FSRS Cards</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1 mb-6">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  ${isActive(item.href)
                    ? 'bg-[var(--primary)] text-white'
                    : 'hover:bg-[var(--border-color)]'
                  }
                `}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Collections section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-[var(--foreground)] opacity-60 uppercase tracking-wider">
                Collections
              </h3>
              <Link
                href="/collections/new"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-[var(--border-color)] transition-colors"
                title="New Collection"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </Link>
            </div>
            <div className="space-y-1">
              {collections.length === 0 ? (
                <p className="text-sm opacity-50 px-3 py-2">No collections yet</p>
              ) : (
                collections.map(col => (
                  <Link
                    key={col.id}
                    href={`/collections/${col.id}`}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center justify-between px-3 py-2 rounded-lg transition-colors
                      ${pathname === `/collections/${col.id}` || pathname.startsWith(`/collections/${col.id}/`)
                        ? 'bg-[var(--primary)] text-white'
                        : 'hover:bg-[var(--border-color)]'
                      }
                    `}
                  >
                    <span className="truncate">📁 {col.name}</span>
                    <span className="text-xs opacity-70">{col.cardCount}</span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-color)] flex items-center justify-between">
          <ThemeToggle />
          <Link
            href="/settings"
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-[var(--border-color)] transition-colors"
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
          <form action="/api/auth" method="DELETE">
            <button
              type="button"
              onClick={async () => {
                await fetch('/api/auth', { method: 'DELETE' });
                window.location.href = '/login';
              }}
              className="p-2 rounded-lg hover:bg-[var(--border-color)] transition-colors"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
