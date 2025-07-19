import { NextRequest, NextResponse } from 'next/server';
import chatDatabase from '@/lib/database';

export async function GET() {
  try {
    const conversations = chatDatabase.getConversations();
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Conversations GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('id');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    chatDatabase.deleteConversation(parseInt(conversationId));
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Conversations DELETE API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, title } = await request.json();

    if (!id || !title) {
      return NextResponse.json(
        { error: 'ID and title are required' },
        { status: 400 }
      );
    }

    chatDatabase.updateConversationTitle(id, title);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Conversations PUT API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}