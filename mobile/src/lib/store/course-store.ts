import { create } from 'zustand';
import { Course, RoadmapGraph, getNodeContent, getCourse, getCourses } from '../api-client';

interface CourseState {
  courses: Course[];
  currentCourse: RoadmapGraph | null;
  isLoading: boolean;
  error: string | null;
  fetchCourses: () => Promise<void>;
  fetchCourse: (courseId: string) => Promise<void>;
  clearCurrentCourse: () => void;
}

export const useCourseStore = create<CourseState>((set) => ({
  courses: [],
  currentCourse: null,
  isLoading: false,
  error: null,

  fetchCourses: async () => {
    set({ isLoading: true, error: null });
    try {
      const courses = await getCourses();
      set({ courses, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchCourse: async (courseId) => {
    set({ isLoading: true, error: null });
    try {
      const course = await getCourse(courseId);
      set({ currentCourse: course, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  clearCurrentCourse: () => {
    set({ currentCourse: null });
  },
}));
