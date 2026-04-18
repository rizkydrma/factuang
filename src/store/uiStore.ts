import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  isAddModalOpen: boolean;
  openAddModal: () => void;
  closeAddModal: () => void;
  editingTransactionId: number | null;
  openEditModal: (id: number) => void;
  closeEditModal: () => void;
  selectedDateRange: { from: string; to: string } | null;
  setDateRange: (range: { from: string; to: string } | null) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      isAddModalOpen: false,
      openAddModal: () =>
        set({ isAddModalOpen: true, editingTransactionId: null }),
      closeAddModal: () =>
        set({ isAddModalOpen: false, editingTransactionId: null }),
      editingTransactionId: null,
      openEditModal: (id) =>
        set({ isAddModalOpen: true, editingTransactionId: id }),
      closeEditModal: () =>
        set({ isAddModalOpen: false, editingTransactionId: null }),
      selectedDateRange: null,
      setDateRange: (range) => set({ selectedDateRange: range }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ theme: state.theme }), // Hanya simpan theme di localStorage
    },
  ),
);
