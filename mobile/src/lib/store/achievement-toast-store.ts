import { create } from 'zustand';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface AchievementToastState {
  visible: boolean;
  achievement: Achievement | null;
  show: (achievement: Achievement) => void;
  hide: () => void;
}

export const useAchievementToastStore = create<AchievementToastState>((set) => ({
  visible: false,
  achievement: null,
  show: (achievement) => set({ visible: true, achievement }),
  hide: () => set({ visible: false, achievement: null }),
}));
