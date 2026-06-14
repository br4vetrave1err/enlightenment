import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: any[];
}

interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  activeSessionId: string | null;
  addMessage: (message: ChatMessage) => void;
  updateLastMessage: (chunk: string) => void;
  setStreaming: (isStreaming: boolean) => void;
  setSessionId: (id: string) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isStreaming: false,
  activeSessionId: null,

  addMessage: (message) => 
    set((state) => ({ messages: [...state.messages, message] })),

  updateLastMessage: (chunk) =>
    set((state) => {
      const newMessages = [...state.messages];
      if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'assistant') {
        newMessages[newMessages.length - 1].content += chunk;
      }
      return { messages: newMessages };
    }),

  setStreaming: (isStreaming) => set({ isStreaming }),
  
  setSessionId: (activeSessionId) => set({ activeSessionId }),

  clearChat: () => set({ messages: [], activeSessionId: null, isStreaming: false }),
}));
