import type { Group } from "./group.types";

export interface InviteFormProps {
    fetchGroups: () => void;
    groups: Group[];
    onCancel?: () => void;
  }