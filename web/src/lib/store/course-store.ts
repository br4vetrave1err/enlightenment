import { create } from 'zustand';
import { authFetch } from '../api';

export interface Course {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

interface CourseState {
  courses: Course[];
  isLoading: boolean;
  error: string | null;
  fetchCourses: () => Promise<void>;
}

export const useCourseStore = create<CourseState>((set) => ({
  courses: [],
  isLoading: false,
  error: null,

  fetchCourses: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await authFetch('/api/courses/');
      const data = await response.json();
      set({ courses: data.courses || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch courses', isLoading: false });
    }
  },
}));
