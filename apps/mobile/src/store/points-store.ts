import { create } from 'zustand';

interface PointsState {
  balance: number;
  addPoints: (amount: number) => void;
  spendPoints: (amount: number) => boolean;
}

export const usePointsStore = create<PointsState>((set, get) => ({
  balance: 0,

  addPoints: (amount) => {
    set((state) => ({ balance: state.balance + amount }));
  },

  spendPoints: (amount) => {
    const { balance } = get();
    if (balance < amount) return false;
    set({ balance: balance - amount });
    return true;
  },
}));
