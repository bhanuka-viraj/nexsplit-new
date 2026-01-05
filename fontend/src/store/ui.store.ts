import { create } from 'zustand';

interface UIStore {
  isAddTransactionOpen: boolean;
  openAddTransaction: () => void;
  closeAddTransaction: () => void;

  isCreateGroupOpen: boolean;
  openCreateGroup: () => void;
  closeCreateGroup: () => void;

  currency: string;
  setCurrency: (currency: string) => void;

  monthlyLimit: number;
  setMonthlyLimit: (limit: number) => void;

  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  // Invite Member Drawer
  isInviteMemberOpen: boolean;
  inviteGroupId: string | null;
  openInviteMember: (groupId: string) => void;
  closeInviteMember: () => void;

  isInvitationsOpen: boolean;
  openInvitations: () => void;
  closeInvitations: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isAddTransactionOpen: false,
  openAddTransaction: () => set({ isAddTransactionOpen: true }),
  closeAddTransaction: () => set({ isAddTransactionOpen: false }),

  isCreateGroupOpen: false,
  openCreateGroup: () => set({ isCreateGroupOpen: true }),
  closeCreateGroup: () => set({ isCreateGroupOpen: false }),

  currency: 'USD',
  setCurrency: (currency) => set({ currency }),

  monthlyLimit: 2000,
  setMonthlyLimit: (monthlyLimit) => set({ monthlyLimit }),

  theme: 'dark',
  setTheme: (theme) => set({ theme }),

  isInviteMemberOpen: false,
  inviteGroupId: null,
  openInviteMember: (groupId) => set({ isInviteMemberOpen: true, inviteGroupId: groupId }),
  closeInviteMember: () => set({ isInviteMemberOpen: false, inviteGroupId: null }),

  isInvitationsOpen: false,
  openInvitations: () => set({ isInvitationsOpen: true }),
  closeInvitations: () => set({ isInvitationsOpen: false }),
}));
