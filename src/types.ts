export interface UserAccount {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
}

export interface Reply {
  id: string;
  author: string;
  authorId?: string;
  avatar?: string;
  content: string;
  time: string;
  timestamp: number;
}

export interface Thread {
  id: string;
  category: string;
  time: string;
  timestamp: number;
  title: string;
  preview: string;
  content: string;
  replies: Reply[];
  views: number;
  catColor: string;
  author: string;
  authorId?: string;
  authorAvatar?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  participants: {
    id: string;
    username: string;
    avatar?: string;
  }[];
  messages: ChatMessage[];
  lastMessage?: string;
  updatedAt: number;
}

export type FilterType = 'All' | 'IT' | 'Events' | 'Academic' | 'Freedom Wall';

export interface ForumNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  isRead: boolean;
  timestamp: number;
  link?: {
    type: 'thread' | 'message' | 'profile';
    id: string;
  };
  avatar?: string;
}
