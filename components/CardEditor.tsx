'use client';

import { useState, useEffect } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';

type Props = {
  initialFront?: string;
  initialBack?: string;
  initialNoteId?: string | null;
  collectionId?: string;
  onSave: (data: { front: string; back: string; noteId?: string | null; collectionId?: string }) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
};

export function CardEditor({
  initialFront = '',
  initialBack = '',
  initialNoteId = null,
  collectionId,
  onSave,
  onCancel,
  submitLabel = 'Save',
}: Props) {
  const [front, setFront] = useState(initialFront);
  const [back, setBack] = useState(initialBack);
  const [noteId, setNoteId] = useState(initialNoteId || '');
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [collections, setCollections] = useState<{ id: string; name: string }[]>([]);
  const [selectedCollection, setSelectedCollection] = useState(collectionId || '');

  useEffect(() => {
    if (!collectionId) {
      fetch('/api/collections')
        .then(res => res.json())
        .then(setCollections)
        .catch(() => {});
    }
  }, [collectionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        front,
        back,
        noteId: noteId || null,
        collectionId: selectedCollection || collectionId,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Collection selector (only if not provided) */}
      {!collectionId && collections.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">Collection</label>
          <select
            value={selectedCollection}
            onChange={e => setSelectedCollection(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="">Select a collection...</option>
            {collections.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Preview toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowPreview(false)}
          className={`px-3 py-1 rounded text-sm ${!showPreview ? 'bg-[var(--primary)] text-white' : 'bg-[var(--border-color)]'}`}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className={`px-3 py-1 rounded text-sm ${showPreview ? 'bg-[var(--primary)] text-white' : 'bg-[var(--border-color)]'}`}
        >
          Preview
        </button>
      </div>

      {showPreview ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Front</label>
            <div className="p-4 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] min-h-[120px] overflow-auto">
              <MarkdownRenderer content={front || '*No content*'} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Back</label>
            <div className="p-4 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] min-h-[120px] overflow-auto">
              <MarkdownRenderer content={back || '*No content*'} />
            </div>
          </div>
        </div>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">Front (Markdown)</label>
            <textarea
              value={front}
              onChange={e => setFront(e.target.value)}
              required
              rows={6}
              placeholder="Enter the question or prompt..."
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-y min-h-[120px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Back (Markdown)</label>
            <textarea
              value={back}
              onChange={e => setBack(e.target.value)}
              required
              rows={6}
              placeholder="Enter the answer..."
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-y min-h-[120px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Note ID (optional)</label>
            <input
              type="text"
              value={noteId}
              onChange={e => setNoteId(e.target.value)}
              placeholder="External reference (e.g., Obsidian note ID)"
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
        </>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || !front || !back || (!collectionId && !selectedCollection)}
          className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving...' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-[var(--border-color)] hover:bg-[var(--border-color)] transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
