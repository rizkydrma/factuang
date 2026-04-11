import { create } from 'zustand';

interface UIState {
  isAddModalOpen: boolean;
  openAddModal: () => void;
  closeAddModal: () => void;
  // We can add global filters here later
  selectedDateRange: { from: string; to: string } | null;
  setDateRange: (range: { from: string; to: string } | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isAddModalOpen: false,
  openAddModal: () => set({ isAddModalOpen: true }),
  closeAddModal: () => set({ isAddModalOpen: false }),
  selectedDateRange: null,
  setDateRange: (range) => set({ selectedDateRange: range }),
}));
