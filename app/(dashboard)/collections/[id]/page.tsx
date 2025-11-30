'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

type Collection = {
  id: string;
  name: string;
  description?: string;
};

type Card = {
  id: string;
  front: string;
  back: string;
  due: string;
  reps: number;
  state: number;
  createdAt: string;
};

type Props = {
  params: Promise<{ id: string }>;
};

export default function CollectionDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`/api/collections/${id}`).then(res => res.json()),
      fetch(`/api/cards?collectionId=${id}`).then(res => res.json()),
    ])
      .then(([col, cards]) => {
        setCollection(col);
        setCards(cards);
        setEditName(col.name || '');
        setEditDescription(col.description || '');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const filteredCards = cards.filter(
    card =>
      card.front.toLowerCase().includes(search.toLowerCase()) ||
      card.back.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteCollection = async () => {
    await fetch(`/api/collections/${id}`, { method: 'DELETE' });
    router.push('/');
    router.refresh();
  };

  const handleUpdateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/collections/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, description: editDescription }),
    });
    if (res.ok) {
      const updated = await res.json();
      setCollection(updated);
      setShowEditModal(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Delete this card?')) return;
    await fetch(`/api/cards/${cardId}`, { method: 'DELETE' });
    setCards(cards.filter(c => c.id !== cardId));
  };

  const getStateLabel = (state: number) => {
    switch (state) {
      case 0: return <span className="text-green-500">New</span>;
      case 1: return <span className="text-yellow-500">Learning</span>;
      case 2: return <span className="text-blue-500">Review</span>;
      case 3: return <span className="text-orange-500">Relearning</span>;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--border-color)] rounded w-48"></div>
          <div className="h-4 bg-[var(--border-color)] rounded w-96"></div>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="p-4 md:p-8">
        <h1 className="text-2xl font-bold mb-4">Collection not found</h1>
        <Link href="/" className="text-[var(--primary)] hover:underline">
          Return to dashboard
        </Link>
      </div>
    );
  }

  const dueCards = cards.filter(c => new Date(c.due) <= new Date());

  return (
    <div className="p-4 md:p-8 md:pl-8">
      {/* Header */}
      <div className="mb-6 mt-10 md:mt-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <h1 className="text-2xl font-bold">{collection.name}</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="px-3 py-1.5 rounded text-sm border border-[var(--border-color)] hover:bg-[var(--border-color)] transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-3 py-1.5 rounded text-sm text-red-500 border border-red-500 hover:bg-red-500 hover:text-white transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
        {collection.description && (
          <p className="text-sm opacity-60">{collection.description}</p>
        )}
        <div className="flex gap-4 mt-2 text-sm">
          <span>{cards.length} cards</span>
          {dueCards.length > 0 && (
            <span className="text-red-500">{dueCards.length} due</span>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search cards..."
          className="flex-1 px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />
        <div className="flex gap-2">
          {dueCards.length > 0 && (
            <Link
              href={`/collections/${id}/review`}
              className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors whitespace-nowrap"
            >
              Review ({dueCards.length})
            </Link>
          )}
          <Link
            href={`/collections/${id}/cards/new`}
            className="px-4 py-2 rounded-lg border border-[var(--border-color)] hover:bg-[var(--border-color)] transition-colors whitespace-nowrap"
          >
            + Add Card
          </Link>
        </div>
      </div>

      {/* Cards list */}
      {filteredCards.length === 0 ? (
        <div className="text-center py-12 opacity-60">
          {cards.length === 0 ? (
            <>
              <p className="mb-2">No cards in this collection yet.</p>
              <Link
                href={`/collections/${id}/cards/new`}
                className="text-[var(--primary)] hover:underline"
              >
                Add your first card
              </Link>
            </>
          ) : (
            <p>No cards match your search.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCards.map(card => (
            <div
              key={card.id}
              className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)]"
            >
              <div className="flex justify-between items-start gap-4 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs uppercase tracking-wider opacity-50 mb-1">Front</div>
                  <div className="line-clamp-2 overflow-hidden">
                    <MarkdownRenderer content={card.front} />
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link
                    href={`/collections/${id}/cards/${card.id}`}
                    className="px-2 py-1 text-xs rounded border border-[var(--border-color)] hover:bg-[var(--border-color)] transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    className="px-2 py-1 text-xs rounded text-red-500 border border-red-500 hover:bg-red-500 hover:text-white transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="flex gap-4 text-xs opacity-60">
                {getStateLabel(card.state)}
                <span>Reps: {card.reps}</span>
                {new Date(card.due) <= new Date() && <span className="text-red-500">Due</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card-bg)] rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-bold mb-2">Delete Collection?</h2>
            <p className="text-sm opacity-60 mb-4">
              This will delete the collection and all {cards.length} cards in it. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCollection}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg border border-[var(--border-color)] hover:bg-[var(--border-color)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card-bg)] rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4">Edit Collection</h2>
            <form onSubmit={handleUpdateCollection} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-y"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-lg border border-[var(--border-color)] hover:bg-[var(--border-color)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
