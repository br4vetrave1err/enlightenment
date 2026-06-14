import { useCourseStore } from '../../src/lib/store/course-store';

jest.mock('../../src/lib/api-client', () => ({
  getCourses: jest.fn(),
  getCourse: jest.fn(),
  getNodeContent: jest.fn(),
  trackNodeView: jest.fn(),
  completeNode: jest.fn(),
  rateNode: jest.fn(),
}));

const { getCourses, getCourse } = require('../../src/lib/api-client');

const mockCourses = [
  {
    course_id: '1',
    title: 'Course 1',
    description: 'Description 1',
    icon: 'book',
    total_nodes: 10,
    completed_nodes: 5,
    completion_percentage: 50,
    last_accessed: '2024-01-01',
  },
];

const mockCourse = {
  course_id: '1',
  title: 'Course 1',
  nodes: [],
  edges: [],
};

describe('Course Store', () => {
  beforeEach(() => {
    useCourseStore.setState({
      courses: [],
      currentCourse: null,
      isLoading: false,
      error: null,
    });
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useCourseStore.getState();
      expect(state.courses).toEqual([]);
      expect(state.currentCourse).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('fetchCourses', () => {
    it('should fetch courses successfully', async () => {
      (getCourses as jest.Mock).mockResolvedValue(mockCourses);

      await useCourseStore.getState().fetchCourses();

      const state = useCourseStore.getState();
      expect(state.courses).toEqual(mockCourses);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle fetch error', async () => {
      (getCourses as jest.Mock).mockRejectedValue(new Error('Network error'));

      await useCourseStore.getState().fetchCourses();

      const state = useCourseStore.getState();
      expect(state.courses).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Network error');
    });
  });

  describe('fetchCourse', () => {
    it('should fetch single course successfully', async () => {
      (getCourse as jest.Mock).mockResolvedValue(mockCourse);

      await useCourseStore.getState().fetchCourse('1');

      const state = useCourseStore.getState();
      expect(state.currentCourse).toEqual(mockCourse);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle fetch error', async () => {
      (getCourse as jest.Mock).mockRejectedValue(new Error('Course not found'));

      await useCourseStore.getState().fetchCourse('999');

      const state = useCourseStore.getState();
      expect(state.currentCourse).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Course not found');
    });
  });

  describe('clearCurrentCourse', () => {
    it('should clear current course', () => {
      useCourseStore.setState({ currentCourse: mockCourse });

      useCourseStore.getState().clearCurrentCourse();

      const state = useCourseStore.getState();
      expect(state.currentCourse).toBeNull();
    });
  });
});
