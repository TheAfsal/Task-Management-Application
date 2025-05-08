import { create } from "zustand";
import type { Group } from "../types/group.types";

interface GroupState {
  groups: Group[];
  setGroups: (groups: Group[]) => void;
  addGroup: (group: Group) => void;
}

export const useGroupStore = create<GroupState>((set) => ({
  groups: [],
  setGroups: (groups) => set({ groups }),
  addGroup: (group) => set((state) => ({ groups: [...state.groups, group] })),
}));
