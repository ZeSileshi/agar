export type MessageType = 'text' | 'image' | 'voice' | 'icebreaker' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface Conversation {
  id: string;
  matchId: string;
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  type: MessageType;
  content: string;
  mediaUrl?: string;
  status: MessageStatus;
  createdAt: string;
  readAt?: string;
}

export interface Icebreaker {
  id: string;
  text: string;
  category: 'compatibility' | 'interest' | 'fun' | 'deep';
  relatedInsight?: string;
}

// WebSocket event types
export type WSEventType =
  | 'message:new'
  | 'message:read'
  | 'message:typing'
  | 'match:new'
  | 'user:online'
  | 'user:offline'
  | 'notification:new';

export interface WSEvent {
  type: WSEventType;
  payload: unknown;
  timestamp: string;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}
