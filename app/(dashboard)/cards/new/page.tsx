'use client';

import { useRouter } from 'next/navigation';
import { CardEditor } from '@/components/CardEditor';

export default function NewCardPage() {
  const router = useRouter();

  const handleSave = async (data: {
    front: string;
    back: string;
    noteId?: string | null;
    collectionId?: string;
  }) => {
    const res = await fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const card = await res.json();
      router.push(`/collections/${card.collectionId}`);
      router.refresh();
    } else {
      const error = await res.json();
      alert(error.error || 'Failed to create card');
    }
  };

  return (
    <div className="p-4 md:p-8 md:pl-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 mt-10 md:mt-0">New Card</h1>
      <CardEditor
        onSave={handleSave}
        onCancel={() => router.back()}
        submitLabel="Create Card"
      />
    </div>
  );
}
