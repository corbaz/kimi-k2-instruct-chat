"use client";

import { useState, useCallback } from 'react';
import { Message } from '@/lib/database';

interface StreamingStats {
  tokens: number;
  elapsed: string;
  tokensPerSecond: string;
}

interface StreamingMessage extends Message {
  isStreaming?: boolean;
  streamingStats?: StreamingStats;
}

interface UseStreamingChatResult {
  sendStreamingMessage: (content: string, conversationId?: number) => Promise<{
    conversationId: number;
    userMessage: Message;
    assistantMessage: StreamingMessage;
  }>;
  isStreaming: boolean;
  currentStats: StreamingStats | null;
}

export function useStreamingChat(): UseStreamingChatResult {
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStats, setCurrentStats] = useState<StreamingStats | null>(null);

  const sendStreamingMessage = useCallback(async (
    content: string,
    conversationId?: number
  ) => {
    setIsStreaming(true);
    setCurrentStats(null);

    return new Promise<{
      conversationId: number;
      userMessage: Message;
      assistantMessage: StreamingMessage;
    }>((resolve, reject) => {
      const eventSource = new EventSource('/api/chat/stream', {
        // Note: EventSource doesn't support POST directly, we'll need to use fetch with ReadableStream
      });

      // We'll use fetch instead of EventSource for POST support
      fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          conversationId,
        }),
      }).then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Response body is not readable');
        }

        let buffer = '';
        let conversationData: { conversationId: number; userMessage: Message } | null = null;
        let assistantMessage: StreamingMessage = {
          id: 0,
          conversation_id: 0,
          role: 'assistant',
          content: '',
          created_at: new Date().toISOString(),
          isStreaming: true
        };

        const processStream = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              
              if (done) {
                setIsStreaming(false);
                setCurrentStats(null);
                break;
              }

              buffer += new TextDecoder().decode(value);
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  
                  if (data === '[DONE]') {
                    assistantMessage.isStreaming = false;
                    if (conversationData) {
                      resolve({
                        conversationId: conversationData.conversationId,
                        userMessage: conversationData.userMessage,
                        assistantMessage
                      });
                    }
                    return;
                  }

                  try {
                    const parsed = JSON.parse(data);
                    
                    switch (parsed.type) {
                      case 'start':
                        conversationData = {
                          conversationId: parsed.conversationId,
                          userMessage: parsed.userMessage
                        };
                        assistantMessage.conversation_id = parsed.conversationId;
                        break;
                        
                      case 'token':
                        assistantMessage.content += parsed.content;
                        setCurrentStats(parsed.stats);
                        assistantMessage.streamingStats = parsed.stats;
                        
                        // Trigger re-render by creating new object
                        assistantMessage = { ...assistantMessage };
                        break;
                        
                      case 'complete':
                        assistantMessage.id = parsed.assistantMessage.id;
                        assistantMessage.created_at = parsed.assistantMessage.created_at;
                        assistantMessage.isStreaming = false;
                        setCurrentStats(null);
                        break;
                        
                      case 'error':
                        reject(new Error(parsed.error));
                        return;
                    }
                  } catch (parseError) {
                    console.error('Error parsing SSE data:', parseError);
                  }
                }
              }
            }
          } catch (error) {
            setIsStreaming(false);
            setCurrentStats(null);
            reject(error);
          }
        };

        processStream();
      }).catch(error => {
        setIsStreaming(false);
        setCurrentStats(null);
        reject(error);
      });
    });
  }, []);

  return {
    sendStreamingMessage,
    isStreaming,
    currentStats
  };
}