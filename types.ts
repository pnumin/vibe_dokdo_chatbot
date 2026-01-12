export interface Source {
  title: string;
  uri: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  sources?: Source[];
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}