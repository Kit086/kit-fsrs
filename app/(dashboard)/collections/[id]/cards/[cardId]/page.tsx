'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { CardEditor } from '@/components/CardEditor';

type Card = {
  id: string;
  front: string;
  back: string;
  noteId?: string | null;
};

type Props = {
  params: Promise<{ id: string; cardId: string }>;
};

export default function EditCardPage({ params }: Props) {
  const { id, cardId } = use(params);
  const router = useRouter();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/cards/${cardId}`)
      .then(res => res.json())
      .then(setCard)
      .finally(() => setLoading(false));
  }, [cardId]);

  const handleSave = async (data: { front: string; back: string; noteId?: string | null }) => {
    const res = await fetch(`/api/cards/${cardId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push(`/collections/${id}`);
      router.refresh();
    } else {
      const error = await res.json();
      alert(error.error || 'Failed to update card');
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--border-color)] rounded w-48"></div>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="p-4 md:p-8">
        <h1 className="text-2xl font-bold mb-4">Card not found</h1>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 md:pl-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 mt-10 md:mt-0">Edit Card</h1>
      <CardEditor
        initialFront={card.front}
        initialBack={card.back}
        initialNoteId={card.noteId}
        collectionId={id}
        onSave={handleSave}
        onCancel={() => router.back()}
        submitLabel="Update Card"
      />
    </div>
  );
}
