jest.mock('../src/lib/api', () => ({
  authFetch: jest.fn(),
  getCourses: jest.fn(),
  getCourse: jest.fn(),
  getNodeContent: jest.fn(),
  API_URL: 'http://localhost:8000',
}));

const { authFetch } = require('../src/lib/api');

import {
  getCourses,
  getCourse,
  getNodeContent,
  trackNodeView,
  completeNode,
  rateNode,
  getChatHistory,
  getChatMessages,
  getLearningStats,
  getKnowledgeProfile,
} from '../src/lib/api-client';

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCourses', () => {
    it('should fetch courses successfully', async () => {
      const mockCourses = [
        {
          course_id: '1',
          title: 'Course 1',
          description: 'Description',
          icon: 'book',
          total_nodes: 10,
          completed_nodes: 5,
          completion_percentage: 50,
          last_accessed: '2024-01-01',
        },
      ];

      (authFetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({ courses: mockCourses }),
      });

      const courses = await getCourses();
      expect(courses).toEqual(mockCourses);
      expect(authFetch).toHaveBeenCalledWith('/api/courses');
    });
  });

  describe('getCourse', () => {
    it('should fetch single course', async () => {
      const mockCourse = {
        course_id: '1',
        title: 'Course 1',
        nodes: [],
        edges: [],
      };

      (authFetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockCourse),
      });

      const course = await getCourse('1');
      expect(course).toEqual(mockCourse);
      expect(authFetch).toHaveBeenCalledWith('/api/courses/1');
    });
  });

  describe('getNodeContent', () => {
    it('should fetch node content', async () => {
      const mockContent = {
        node_id: 'n1',
        title: 'Node 1',
        content: 'Content here',
        links: [],
        prerequisites: [],
        estimated_minutes: 30,
      };

      (authFetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockContent),
      });

      const content = await getNodeContent('1', 'n1');
      expect(content).toEqual(mockContent);
      expect(authFetch).toHaveBeenCalledWith('/api/courses/1/nodes/n1');
    });
  });

  describe('trackNodeView', () => {
    it('should track node view', async () => {
      (authFetch as jest.Mock).mockResolvedValue({});

      await trackNodeView('1', 'n1', 60);
      expect(authFetch).toHaveBeenCalledWith(
        '/api/user/progress/1/node',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            node_id: 'n1',
            action: 'view',
            time_spent_seconds: 60,
          }),
        })
      );
    });
  });

  describe('completeNode', () => {
    it('should mark node as complete', async () => {
      (authFetch as jest.Mock).mockResolvedValue({});

      await completeNode('1', 'n1');
      expect(authFetch).toHaveBeenCalledWith(
        '/api/user/progress/1/node',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            node_id: 'n1',
            action: 'complete',
          }),
        })
      );
    });
  });

  describe('rateNode', () => {
    it('should rate a node', async () => {
      (authFetch as jest.Mock).mockResolvedValue({});

      await rateNode('1', 'n1', 4);
      expect(authFetch).toHaveBeenCalledWith(
        '/api/user/progress/1/node',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            node_id: 'n1',
            action: 'rate',
            rating: 4,
          }),
        })
      );
    });
  });

  describe('getChatHistory', () => {
    it('should fetch chat history', async () => {
      const mockSessions = [
        {
          session_id: '1',
          course_context: null,
          summary: 'Test',
          created_at: '2024-01-01',
          message_count: 5,
        },
      ];

      (authFetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({ sessions: mockSessions }),
      });

      const sessions = await getChatHistory();
      expect(sessions).toEqual(mockSessions);
      expect(authFetch).toHaveBeenCalledWith('/api/chat/history');
    });
  });

  describe('getChatMessages', () => {
    it('should fetch chat messages', async () => {
      const mockMessages = [
        { role: 'user', content: 'Hi', timestamp: '2024-01-01' },
      ];

      (authFetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({ messages: mockMessages }),
      });

      const messages = await getChatMessages('1');
      expect(messages).toEqual(mockMessages);
      expect(authFetch).toHaveBeenCalledWith('/api/chat/history/1');
    });
  });

  describe('getLearningStats', () => {
    it('should fetch learning stats', async () => {
      const mockStats = {
        total_nodes_completed: 10,
        courses_in_progress: 2,
        current_streak_days: 5,
        nodes_per_week: 3,
        time_spent_total_hours: 20,
      };

      (authFetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockStats),
      });

      const stats = await getLearningStats();
      expect(stats).toEqual(mockStats);
      expect(authFetch).toHaveBeenCalledWith('/api/user/learning-stats');
    });
  });

  describe('getKnowledgeProfile', () => {
    it('should fetch knowledge profile', async () => {
      const mockProfile = {
        topics: [],
        knowledge_gaps: [],
        learning_velocity: {
          nodes_per_week: 3,
          current_streak_days: 5,
        },
      };

      (authFetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockProfile),
      });

      const profile = await getKnowledgeProfile();
      expect(profile).toEqual(mockProfile);
      expect(authFetch).toHaveBeenCalledWith('/api/user/knowledge-profile');
    });
  });
});
