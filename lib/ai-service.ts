import Groq from 'groq-sdk';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export class AIService {
  private static instance: AIService;
  private groq: Groq;

  private constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async generateResponse(
    userMessage: string,
    conversationHistory: ChatMessage[] = []
  ): Promise<string> {
    try {
      // General purpose system prompt
      const systemPrompt = `You are a helpful AI assistant. You can help with a wide variety of tasks including:

- Answering questions on various topics
- Helping with programming and development
- Providing explanations and tutorials
- Assisting with problem-solving
- Creative writing and brainstorming
- General conversation and support

Please be helpful, accurate, and provide clear explanations. If you're unsure about something, let the user know. Provide code examples when relevant and helpful.`;

      // Prepare messages for the AI
      const messages = [
        { role: 'system' as const, content: systemPrompt },
        ...conversationHistory.slice(-10), // Keep last 10 messages for context
        { role: 'user' as const, content: userMessage }
      ];

      const completion = await this.groq.chat.completions.create({
        model: 'moonshotai/kimi-k2-instruct',
        messages,
        temperature: 0.6,
        max_tokens: 4000, // Kimi-2 supports up to 16K output tokens
        top_p: 0.9,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response generated');
      }

      return response;
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw new Error('Error generating response. Please try again.');
    }
  }

  async *generateStreamingResponse(
    userMessage: string,
    conversationHistory: ChatMessage[] = []
  ): AsyncGenerator<string, void, unknown> {
    try {
      // General purpose system prompt
      const systemPrompt = `You are a helpful AI assistant. You can help with a wide variety of tasks including:

- Answering questions on various topics
- Helping with programming and development
- Providing explanations and tutorials
- Assisting with problem-solving
- Creative writing and brainstorming
- General conversation and support

Please be helpful, accurate, and provide clear explanations. If you're unsure about something, let the user know. Provide code examples when relevant and helpful.`;

      // Prepare messages for the AI
      const messages = [
        { role: 'system' as const, content: systemPrompt },
        ...conversationHistory.slice(-10), // Keep last 10 messages for context
        { role: 'user' as const, content: userMessage }
      ];

      const stream = await this.groq.chat.completions.create({
        model: 'moonshotai/kimi-k2-instruct',
        messages,
        temperature: 0.6,
        max_tokens: 4000,
        top_p: 0.9,
        stream: true,
        stream_options: {
          include_usage: true
        }
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      console.error('Error generating streaming AI response:', error);
      throw new Error('Error generating streaming response. Please try again.');
    }
  }

  // Generate a conversation title based on the first user message
  async generateConversationTitle(firstMessage: string): Promise<string> {
    try {
      const completion = await this.groq.chat.completions.create({
        model: 'moonshotai/kimi-k2-instruct',
        messages: [
          {
            role: 'system',
            content: 'Create a short, concise title (maximum 6 words) for a conversation based on the user\'s first message. The title should capture the main topic or theme of the question.'
          },
          {
            role: 'user',
            content: firstMessage
          }
        ],
        temperature: 0.5,
        max_tokens: 50,
      });

      const title = completion.choices[0]?.message?.content?.trim();
      return title || 'New Conversation';
    } catch (error) {
      console.error('Error generating conversation title:', error);
      return 'New Conversation';
    }
  }

  // Test connection to Groq API
  async testConnection(): Promise<boolean> {
    try {
      const completion = await this.groq.chat.completions.create({
        model: 'moonshotai/kimi-k2-instruct',
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 10,
      });
      return !!completion.choices[0]?.message?.content;
    } catch (error) {
      console.error('Groq API connection test failed:', error);
      return false;
    }
  }
}

export default AIService.getInstance();