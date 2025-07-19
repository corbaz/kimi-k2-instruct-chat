import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'chat.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages (conversation_id);
  CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations (updated_at DESC);
`);

export interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export class ChatDatabase {
  private static instance: ChatDatabase;
  private db: Database.Database;

  private constructor() {
    this.db = db;
  }

  public static getInstance(): ChatDatabase {
    if (!ChatDatabase.instance) {
      ChatDatabase.instance = new ChatDatabase();
    }
    return ChatDatabase.instance;
  }

  // Conversation methods
  createConversation(title: string): Conversation {
    const stmt = this.db.prepare(`
      INSERT INTO conversations (title) 
      VALUES (?) 
      RETURNING *
    `);
    return stmt.get(title) as Conversation;
  }

  getConversations(): Conversation[] {
    const stmt = this.db.prepare(`
      SELECT * FROM conversations 
      ORDER BY updated_at DESC
    `);
    return stmt.all() as Conversation[];
  }

  getConversation(id: number): Conversation | undefined {
    const stmt = this.db.prepare(`
      SELECT * FROM conversations 
      WHERE id = ?
    `);
    return stmt.get(id) as Conversation | undefined;
  }

  updateConversationTitle(id: number, title: string): void {
    const stmt = this.db.prepare(`
      UPDATE conversations 
      SET title = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    stmt.run(title, id);
  }

  deleteConversation(id: number): void {
    const stmt = this.db.prepare(`
      DELETE FROM conversations 
      WHERE id = ?
    `);
    stmt.run(id);
  }

  // Message methods
  addMessage(conversationId: number, role: 'user' | 'assistant', content: string): Message {
    const stmt = this.db.prepare(`
      INSERT INTO messages (conversation_id, role, content) 
      VALUES (?, ?, ?) 
      RETURNING *
    `);
    
    // Update conversation timestamp
    const updateStmt = this.db.prepare(`
      UPDATE conversations 
      SET updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    updateStmt.run(conversationId);

    return stmt.get(conversationId, role, content) as Message;
  }

  getMessages(conversationId: number): Message[] {
    const stmt = this.db.prepare(`
      SELECT * FROM messages 
      WHERE conversation_id = ? 
      ORDER BY created_at ASC
    `);
    return stmt.all(conversationId) as Message[];
  }

  getRecentMessages(conversationId: number, limit: number = 10): Message[] {
    const stmt = this.db.prepare(`
      SELECT * FROM messages 
      WHERE conversation_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `);
    return (stmt.all(conversationId, limit) as Message[]).reverse();
  }

  deleteMessage(id: number): void {
    const stmt = this.db.prepare(`
      DELETE FROM messages 
      WHERE id = ?
    `);
    stmt.run(id);
  }

  // Utility methods
  close(): void {
    this.db.close();
  }

  // Reset database - clear all data
  resetDatabase(): void {
    try {
      this.db.exec(`
        DELETE FROM messages;
        DELETE FROM conversations;
        DELETE FROM sqlite_sequence WHERE name IN ('messages', 'conversations');
      `);
      console.log('Database reset successfully');
    } catch (error) {
      console.error('Error resetting database:', error);
      throw error;
    }
  }

  // Get conversation context for AI
  getConversationContext(conversationId: number, maxMessages: number = 20): string {
    const messages = this.getRecentMessages(conversationId, maxMessages);
    return messages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n\n');
  }
}

export default ChatDatabase.getInstance();