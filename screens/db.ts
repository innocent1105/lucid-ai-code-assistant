import Dexie, { type Table } from 'dexie';
    
export interface Message {
  id?: number;
  conversationId: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id?: number;
  title: string;
  createdAt: number;
}

export class MyDatabase extends Dexie {
  messages!: Table<Message>;
  conversations!: Table<Conversation>;

  constructor() {
    super('LucidAIDB');
    this.version(1).stores({
      conversations: '++id, title, createdAt',
      messages: '++id, conversationId, role'
    });
  }
}


export const db = new MyDatabase();
