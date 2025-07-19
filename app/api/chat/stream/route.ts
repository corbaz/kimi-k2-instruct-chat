import { NextRequest, NextResponse } from 'next/server';
import { ChatDatabase } from '@/lib/database';
import aiService from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const { message, conversationId } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const db = ChatDatabase.getInstance();
    let currentConversationId = conversationId;
    let conversationHistory: any[] = [];

    // Get conversation history if conversationId is provided
    if (currentConversationId) {
      const messages = await db.getMessages(currentConversationId);
      conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
    }

    // Create a ReadableStream for streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let fullResponse = '';

        try {
          // Save user message first
          if (!currentConversationId) {
            // Create new conversation
            const title = await aiService.generateConversationTitle(message);
            const conversation = await db.createConversation(title);
            currentConversationId = conversation.id;
          }

          const userMessage = await db.addMessage(currentConversationId, 'user', message);

          // Send initial data with conversation info
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'start',
            conversationId: currentConversationId,
            userMessage
          })}\n\n`));

          // Stream AI response
          for await (const chunk of aiService.generateStreamingResponse(message, conversationHistory)) {
            fullResponse += chunk;

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'token',
              content: chunk
            })}\n\n`));
          }

          // Save complete AI response
          const assistantMessage = await db.addMessage(currentConversationId, 'assistant', fullResponse);

          // Send completion data
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'complete',
            assistantMessage
          })}\n\n`));

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (error) {
          console.error('Streaming error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'error',
            error: 'Error generating response'
          })}\n\n`));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}