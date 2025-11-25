
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent' | 'system';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
  isLast?: boolean; 
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: 'online' | 'busy' | 'offline';
  role: string;
}

export enum ChatActionType {
  ADD_MESSAGE,
  SET_TYPING,
  SET_ERROR
}

export interface WebhookResponse {
  output?: string;
  text?: string;
  message?: string;
  [key: string]: any;
}
