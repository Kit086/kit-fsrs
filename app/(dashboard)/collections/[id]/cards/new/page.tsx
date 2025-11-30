'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { CardEditor } from '@/components/CardEditor';

type Props = {
  params: Promise<{ id: string }>;
};

export default function NewCardPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();

  const handleSave = async (data: { front: string; back: string; noteId?: string | null }) => {
    const res = await fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, collectionId: id }),
    });

    if (res.ok) {
      router.push(`/collections/${id}`);
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
        collectionId={id}
        onSave={handleSave}
        onCancel={() => router.back()}
        submitLabel="Create Card"
      />
    </div>
  );
}
