"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ConversationSidebar } from "./ConversationSidebar";
import { Conversation, Message } from "@/lib/database";
import { Bot, AlertCircle, Trash2 } from "lucide-react";
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export function ChatInterface() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    try {
      setIsLoadingConversations(true);
      const response = await fetch('/api/conversations');
      if (!response.ok) throw new Error('Failed to load conversations');
      
      const data = await response.json();
      setConversations(data.conversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError('Error loading conversations');
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const loadConversation = async (conversationId: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/chat?conversationId=${conversationId}`);
      if (!response.ok) throw new Error('Failed to load conversation');
      
      const data = await response.json();
      setCurrentConversation(data.conversation);
      setMessages(data.messages);
      setError(null);
    } catch (error) {
      console.error('Error loading conversation:', error);
      setError('Error loading conversation');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    setIsLoading(true);
    setError(null);

    // Add user message immediately
    const tempUserMessage: Message = {
      id: Date.now(),
      conversation_id: currentConversation?.id || 0,
      role: 'user',
      content: content,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, tempUserMessage]);

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          conversationId: currentConversation?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      let buffer = '';
      const assistantMessageId = Date.now() + 1;
      let assistantContent = '';
      let currentStats = { tokens: 0, elapsed: '0.0', tokensPerSecond: '0.0' };

      // Add initial empty assistant message
      const initialAssistantMessage: any = {
        id: assistantMessageId,
        conversation_id: currentConversation?.id || 0,
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString(),
        isStreaming: true,
        streamingStats: currentStats
      };

      setMessages(prev => [...prev, initialAssistantMessage]);

      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              setIsLoading(false);
              break;
            }

            buffer += new TextDecoder().decode(value);
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                
                if (data === '[DONE]') {
                  // Mark streaming as complete
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, isStreaming: false, streamingStats: undefined }
                      : msg
                  ));
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  
                  switch (parsed.type) {
                    case 'start':
                      // Update conversation if new
                      if (!currentConversation && parsed.conversationId) {
                        setCurrentConversation({
                          id: parsed.conversationId,
                          title: content.slice(0, 50) + '...',
                          created_at: parsed.userMessage.created_at,
                          updated_at: parsed.userMessage.created_at,
                        });
                        loadConversations();
                      }

                      // Update user message with real ID
                      setMessages(prev => prev.map(msg => 
                        msg.id === tempUserMessage.id 
                          ? { ...parsed.userMessage }
                          : msg.id === assistantMessageId
                          ? { ...msg, conversation_id: parsed.conversationId }
                          : msg
                      ));
                      break;
                      
                    case 'token':
                      assistantContent += parsed.content;
                      currentStats = parsed.stats;
                      
                      // Throttle updates to reduce re-renders (update every few tokens)
                      if (currentStats.tokens % 3 === 0 || parsed.content.includes(' ')) {
                        setMessages(prev => prev.map(msg => 
                          msg.id === assistantMessageId 
                            ? { 
                                ...msg, 
                                content: assistantContent,
                                streamingStats: currentStats
                              }
                            : msg
                        ));
                      }
                      break;
                      
                    case 'complete':
                      // Final update with real message data
                      setMessages(prev => prev.map(msg => 
                        msg.id === assistantMessageId 
                          ? {
                              ...parsed.assistantMessage,
                              isStreaming: false,
                              streamingStats: undefined
                            }
                          : msg
                      ));
                      break;
                      
                    case 'error':
                      setError(parsed.error);
                      setIsLoading(false);
                      // Remove the empty assistant message on error
                      setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
                      return;
                  }
                } catch (parseError) {
                  console.error('Error parsing SSE data:', parseError);
                }
              }
            }
          }
        } catch (error) {
          setIsLoading(false);
          setError('Error during streaming. Please try again.');
          console.error('Streaming error:', error);
          // Remove the empty assistant message on error
          setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
        }
      };

      processStream();

    } catch (error) {
      console.error('Error sending message:', error);
      setError('Error sending message. Please try again.');
      setIsLoading(false);
      // Remove the user message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempUserMessage.id));
    }
  };

  const startNewConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
    setError(null);
  };

  const selectConversation = (id: number) => {
    if (currentConversation?.id !== id) {
      loadConversation(id);
    }
  };

  const deleteConversation = async (id: number) => {
    try {
      const response = await fetch(`/api/conversations?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete conversation');

      // Remove from local state
      setConversations(prev => prev.filter(conv => conv.id !== id));
      
      // If this was the current conversation, clear it
      if (currentConversation?.id === id) {
        startNewConversation();
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      setError('Error deleting conversation');
    }
  };

  const resetDatabase = async () => {
    if (!confirm('Are you sure you want to reset the database? This will delete ALL conversations and messages permanently.')) {
      return;
    }

    try {
      const response = await fetch('/api/database/reset', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to reset database');

      // Clear local state
      setConversations([]);
      setCurrentConversation(null);
      setMessages([]);
      setError(null);
      
      alert('Database reset successfully!');
    } catch (error) {
      console.error('Error resetting database:', error);
      setError('Error resetting database');
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <ConversationSidebar
        conversations={conversations}
        currentConversationId={currentConversation?.id || null}
        onSelectConversation={selectConversation}
        onNewConversation={startNewConversation}
        onDeleteConversation={deleteConversation}
        isLoading={isLoadingConversations}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b p-4 bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Bot className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-semibold">
                  Kimi K2 Instruct Chat
                </h1>
              </div>
              <Badge variant="default" className="bg-primary text-primary-foreground">
                Powered by Groq
              </Badge>
            </div>
            
            <div className="flex items-center gap-3">
              {currentConversation && (
                <div className="text-sm text-muted-foreground">
                  {currentConversation.title}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={resetDatabase}
                className="text-destructive hover:text-destructive"
                title="Reset Database"
              >
                <Trash2 className="h-4 w-4" />
                Reset DB
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col relative">
          <ScrollArea className="flex-1 p-4 pb-24">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Bot className="w-16 h-16 text-primary mb-4" />
                <h2 className="text-2xl font-semibold mb-2">
                  Welcome to Kimi K2 Instruct Assistant!
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                  I'm Kimi K2, your intelligent assistant. Ask me anything!
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="outline">General AI Assistant</Badge>
                  <Badge variant="outline">Programming Help</Badge>
                  <Badge variant="outline">Problem Solving</Badge>
                  <Badge variant="outline">Creative Writing</Badge>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Error Display */}
          {error && (
            <div className="absolute bottom-24 left-4 right-4 z-10">
              <Card className="p-3 bg-destructive/10 border-destructive/20">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              </Card>
            </div>
          )}

          {/* Sticky Chat Input */}
          <div className="absolute bottom-0 left-0 right-0 z-20">
            <ChatInput
              onSendMessage={sendMessage}
              isLoading={isLoading}
              disabled={isLoadingConversations}
            />
          </div>
        </div>
      </div>
    </div>
  );
}