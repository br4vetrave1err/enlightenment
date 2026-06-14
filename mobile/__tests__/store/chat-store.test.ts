import { useChatStore } from '../../src/lib/store/chat-store';

jest.mock('../../src/lib/api-client', () => ({
  getChatHistory: jest.fn(),
  getChatMessages: jest.fn(),
}));

jest.mock('../../src/lib/sse', () => ({
  createSSEConnection: jest.fn(),
}));

const { getChatHistory, getChatMessages } = require('../../src/lib/api-client');
const { createSSEConnection } = require('../../src/lib/sse');

const mockSessions = [
  {
    session_id: '1',
    course_context: null,
    summary: 'Test session',
    created_at: '2024-01-01',
    message_count: 5,
  },
];

const mockMessages = [
  { role: 'user' as const, content: 'Hello', timestamp: '2024-01-01' },
  { role: 'assistant' as const, content: 'Hi there', timestamp: '2024-01-01' },
];

describe('Chat Store', () => {
  beforeEach(() => {
    useChatStore.setState({
      messages: [],
      sessions: [],
      currentSessionId: null,
      isStreaming: false,
      error: null,
    });
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useChatStore.getState();
      expect(state.messages).toEqual([]);
      expect(state.sessions).toEqual([]);
      expect(state.currentSessionId).toBeNull();
      expect(state.isStreaming).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('fetchSessions', () => {
    it('should fetch sessions successfully', async () => {
      (getChatHistory as jest.Mock).mockResolvedValue(mockSessions);

      await useChatStore.getState().fetchSessions();

      const state = useChatStore.getState();
      expect(state.sessions).toEqual(mockSessions);
      expect(state.error).toBeNull();
    });

    it('should handle fetch error', async () => {
      (getChatHistory as jest.Mock).mockRejectedValue(new Error('Failed to load'));

      await useChatStore.getState().fetchSessions();

      const state = useChatStore.getState();
      expect(state.sessions).toEqual([]);
      expect(state.error).toBe('Failed to load');
    });
  });

  describe('loadSession', () => {
    it('should load session messages', async () => {
      (getChatMessages as jest.Mock).mockResolvedValue(mockMessages);

      await useChatStore.getState().loadSession('1');

      const state = useChatStore.getState();
      expect(state.messages).toEqual(mockMessages);
      expect(state.currentSessionId).toBe('1');
    });

    it('should handle load error', async () => {
      (getChatMessages as jest.Mock).mockRejectedValue(new Error('Session not found'));

      await useChatStore.getState().loadSession('999');

      const state = useChatStore.getState();
      expect(state.messages).toEqual([]);
      expect(state.error).toBe('Session not found');
    });
  });

  describe('clearMessages', () => {
    it('should clear messages and session', () => {
      useChatStore.setState({
        messages: mockMessages,
        currentSessionId: '1',
      });

      useChatStore.getState().clearMessages();

      const state = useChatStore.getState();
      expect(state.messages).toEqual([]);
      expect(state.currentSessionId).toBeNull();
    });
  });

  describe('sendMessage', () => {
    it('should add user message and start streaming', async () => {
      const mockSSE = {
        onMessage: jest.fn(),
        onError: jest.fn(),
        onComplete: jest.fn(),
      };

      (createSSEConnection as jest.Mock).mockImplementation(async (callbacks) => {
        callbacks.onComplete();
      });

      await useChatStore.getState().sendMessage('Hello AI');

      const state = useChatStore.getState();
      expect(state.messages).toHaveLength(1);
      expect(state.messages[0].role).toBe('user');
      expect(state.messages[0].content).toBe('Hello AI');
    });

    it('should handle SSE errors', async () => {
      const testError = new Error('Connection failed');
      (createSSEConnection as jest.Mock).mockImplementation(async (callbacks) => {
        callbacks.onError(testError);
      });

      await useChatStore.getState().sendMessage('Hello');

      const state = useChatStore.getState();
      expect(state.error).toBe('Connection failed');
      expect(state.isStreaming).toBe(false);
    });
  });
});
