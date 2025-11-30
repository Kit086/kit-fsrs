import { NextRequest, NextResponse } from 'next/server';
import { getCard, updateCard, deleteCard } from '@/lib/storage';
import { isAuthenticated, validateApiToken } from '@/lib/auth';

// Check authentication
const checkAuth = async (request: NextRequest): Promise<boolean> => {
  if (await isAuthenticated()) return true;
  
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    return validateApiToken(token);
  }
  
  return false;
};

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  if (!await checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { id } = await params;
  const card = getCard(id);
  
  if (!card) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 });
  }
  
  return NextResponse.json(card);
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  if (!await checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { id } = await params;
  
  try {
    const updates = await request.json();
    
    // Only allow updating certain fields
    const allowedUpdates: Record<string, unknown> = {};
    if (updates.front !== undefined) allowedUpdates.front = updates.front;
    if (updates.back !== undefined) allowedUpdates.back = updates.back;
    if (updates.noteId !== undefined) allowedUpdates.noteId = updates.noteId;
    if (updates.collectionId !== undefined) allowedUpdates.collectionId = updates.collectionId;
    
    const updated = updateCard(id, allowedUpdates);
    
    if (!updated) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }
    
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: 'Failed to update card' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  if (!await checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { id } = await params;
  
  if (!deleteCard(id)) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 });
  }
  
  return NextResponse.json({ success: true });
}
