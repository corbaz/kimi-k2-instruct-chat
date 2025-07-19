import { NextRequest, NextResponse } from 'next/server';
import chatDatabase from '@/lib/database';
import aiService from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const { message, conversationId } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    let currentConversationId = conversationId;

    // If no conversation ID provided, create a new conversation
    if (!currentConversationId) {
      const title = await aiService.generateConversationTitle(message);
      const conversation = chatDatabase.createConversation(title);
      currentConversationId = conversation.id;
    }

    // Add user message to database
    const userMessage = chatDatabase.addMessage(currentConversationId, 'user', message);

    // Get conversation history for context
    const conversationHistory = chatDatabase.getRecentMessages(currentConversationId, 10)
      .map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));

    // Generate AI response
    const aiResponse = await aiService.generateResponse(message, conversationHistory.slice(0, -1)); // Exclude the just-added message

    // Add AI response to database
    const assistantMessage = chatDatabase.addMessage(currentConversationId, 'assistant', aiResponse);

    return NextResponse.json({
      conversationId: currentConversationId,
      userMessage,
      assistantMessage,
      response: aiResponse
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    const messages = chatDatabase.getMessages(parseInt(conversationId));
    const conversation = chatDatabase.getConversation(parseInt(conversationId));

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      conversation,
      messages
    });

  } catch (error) {
    console.error('Chat GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}