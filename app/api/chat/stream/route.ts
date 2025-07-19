import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/database';
import AIService from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const { message, conversationId } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const db = Database.getInstance();
    let currentConversationId = conversationId;
    let conversationHistory: any[] = [];

    // Get conversation history if conversationId is provided
    if (currentConversationId) {
      conversationHistory = await db.getMessages(currentConversationId);
    }

    // Create a ReadableStream for streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let fullResponse = '';
        let startTime = Date.now();
        let tokenCount = 0;

        try {
          // Save user message first
          if (!currentConversationId) {
            // Create new conversation
            const title = await AIService.generateConversationTitle(message);
            currentConversationId = await db.createConversation(title);
          }

          const userMessage = await db.saveMessage(currentConversationId, 'user', message);

          // Send initial data with conversation info
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'start',
            conversationId: currentConversationId,
            userMessage
          })}\n\n`));

          // Stream AI response
          const aiService = AIService.getInstance();
          for await (const chunk of aiService.generateStreamingResponse(message, conversationHistory)) {
            fullResponse += chunk;
            tokenCount++;
            
            const currentTime = Date.now();
            const elapsedTime = (currentTime - startTime) / 1000; // seconds
            const tokensPerSecond = tokenCount / elapsedTime;

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'token',
              content: chunk,
              stats: {
                tokens: tokenCount,
                elapsed: elapsedTime.toFixed(2),
                tokensPerSecond: tokensPerSecond.toFixed(1)
              }
            })}\n\n`));
          }

          // Save complete AI response
          const assistantMessage = await db.saveMessage(currentConversationId, 'assistant', fullResponse);

          // Send completion data
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'complete',
            assistantMessage,
            finalStats: {
              totalTokens: tokenCount,
              totalTime: ((Date.now() - startTime) / 1000).toFixed(2),
              avgTokensPerSecond: (tokenCount / ((Date.now() - startTime) / 1000)).toFixed(1)
            }
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