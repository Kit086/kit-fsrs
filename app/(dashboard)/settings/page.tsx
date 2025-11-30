'use client';

import { useTheme } from '@/components/ThemeProvider';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-4 md:p-8 md:pl-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-6 mt-10 md:mt-0">Settings</h1>

      <div className="space-y-6">
        {/* Theme setting */}
        <div className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)]">
          <h2 className="font-semibold mb-3">Theme</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setTheme('light')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                theme === 'light'
                  ? 'bg-[var(--primary)] text-white'
                  : 'border border-[var(--border-color)] hover:bg-[var(--border-color)]'
              }`}
            >
              ☀️ Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'bg-[var(--primary)] text-white'
                  : 'border border-[var(--border-color)] hover:bg-[var(--border-color)]'
              }`}
            >
              🌙 Dark
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                theme === 'system'
                  ? 'bg-[var(--primary)] text-white'
                  : 'border border-[var(--border-color)] hover:bg-[var(--border-color)]'
              }`}
            >
              💻 System
            </button>
          </div>
        </div>

        {/* API Info */}
        <div className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)]">
          <h2 className="font-semibold mb-3">API Access</h2>
          <p className="text-sm opacity-60 mb-3">
            You can use the API to create or update cards from external tools like Obsidian or Logseq.
          </p>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Endpoint:</span>{' '}
              <code className="bg-[var(--border-color)] px-2 py-0.5 rounded">/api/cards</code>
            </div>
            <div>
              <span className="font-medium">Auth Header:</span>{' '}
              <code className="bg-[var(--border-color)] px-2 py-0.5 rounded">Authorization: Bearer YOUR_TOKEN</code>
            </div>
            <div className="mt-3 text-xs opacity-50">
              Configure the API token in config.json
            </div>
          </div>
        </div>

        {/* About */}
        <div className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)]">
          <h2 className="font-semibold mb-3">About</h2>
          <p className="text-sm opacity-60">
            FSRS Flash Cards is a personal flashcard application using the FSRS
            (Free Spaced Repetition Scheduler) algorithm for optimal memory retention.
          </p>
          <p className="text-sm opacity-60 mt-2">
            Built with Next.js, TypeScript, and Tailwind CSS.
          </p>
        </div>
      </div>
    </div>
  );
}
