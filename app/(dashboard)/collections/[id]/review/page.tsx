'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ReviewCard } from '@/components/ReviewCard';

type Card = {
  id: string;
  front: string;
  back: string;
  collectionId: string;
};

type Collection = {
  id: string;
  name: string;
};

type Props = {
  params: Promise<{ id: string }>;
};

export default function CollectionReviewPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch(`/api/cards?collectionId=${id}&due=true`).then(res => res.json()),
      fetch(`/api/collections/${id}`).then(res => res.json()),
    ])
      .then(([c, col]) => {
        setCards(c);
        setCollection(col);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleReview = async (cardId: string, rating: number) => {
    await fetch(`/api/cards/${cardId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating }),
    });

    setCompleted(prev => prev + 1);

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // All cards reviewed
      setCards([]);
    }
  };

  const handleSkip = () => {
    if (currentIndex < cards.length - 1) {
      // Move current card to end
      const newCards = [...cards];
      const [skipped] = newCards.splice(currentIndex, 1);
      newCards.push(skipped);
      setCards(newCards);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="p-4 md:p-8 md:pl-8 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold mb-2">All done!</h1>
        <p className="text-sm opacity-60 mb-6">
          {completed > 0
            ? `You reviewed ${completed} card${completed !== 1 ? 's' : ''} from ${collection?.name || 'this collection'}.`
            : `No cards due for review in ${collection?.name || 'this collection'}.`}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/collections/${id}`)}
            className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors"
          >
            Back to Collection
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 rounded-lg border border-[var(--border-color)] hover:bg-[var(--border-color)] transition-colors"
          >
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const remaining = cards.length - currentIndex;

  return (
    <div className="p-4 md:p-8 md:pl-8 flex flex-col min-h-screen">
      {/* Progress */}
      <div className="mb-4 mt-10 md:mt-0">
        <div className="flex justify-between text-sm mb-2">
          <span className="opacity-60">
            Card {currentIndex + 1} of {cards.length}
          </span>
          <span className="opacity-60">{remaining} remaining</span>
        </div>
        <div className="w-full h-2 bg-[var(--border-color)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--primary)] transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Review card */}
      <div className="flex-1">
        <ReviewCard
          card={currentCard}
          collectionName={collection?.name}
          onReview={handleReview}
          onSkip={handleSkip}
        />
      </div>
    </div>
  );
}
