import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  userName: string | null;
  setUserName: (name: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userName: null,
      setUserName: (name) => set({ userName: name }),
    }),
    {
      name: 'user-storage',
    },
  ),
);
