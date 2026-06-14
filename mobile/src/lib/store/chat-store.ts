import { create } from 'zustand';
import { ChatMessage, ChatSession, getChatHistory, getChatMessages } from '../api-client';
import { createSSEConnection } from '../sse';

interface ChatState {
  messages: ChatMessage[];
  sessions: ChatSession[];
  currentSessionId: string | null;
  isStreaming: boolean;
  error: string | null;
  fetchSessions: () => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  sendMessage: (content: string, courseId?: string) => Promise<void>;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  sessions: [],
  currentSessionId: null,
  isStreaming: false,
  error: null,

  fetchSessions: async () => {
    try {
      const sessions = await getChatHistory();
      set({ sessions });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  loadSession: async (sessionId) => {
    try {
      const messages = await getChatMessages(sessionId);
      set({ messages, currentSessionId: sessionId });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  sendMessage: async (content, courseId) => {
    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    set((state) => ({ messages: [...state.messages, userMessage], isStreaming: true }));

    let assistantMessage = '';

    await createSSEConnection({
      endpoint: '/api/chat/completions',
      body: {
        messages: get().messages,
        course_context: courseId,
      },
      onMessage: (data) => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.choices?.[0]?.delta?.content) {
            assistantMessage += parsed.choices[0].delta.content;
            set((state) => {
              const messages = [...state.messages];
              const lastIndex = messages.length - 1;
              if (messages[lastIndex]?.role === 'assistant') {
                messages[lastIndex] = {
                  ...messages[lastIndex],
                  content: assistantMessage,
                };
              } else {
                messages.push({
                  role: 'assistant',
                  content: assistantMessage,
                  timestamp: new Date().toISOString(),
                });
              }
              return { messages };
            });
          }
        } catch (error) {
          console.error('Error parsing SSE data:', error);
        }
      },
      onError: (error) => {
        set({ isStreaming: false, error: error.message });
      },
      onComplete: () => {
        set({ isStreaming: false });
      },
    });
  },

  clearMessages: () => {
    set({ messages: [], currentSessionId: null });
  },
}));
