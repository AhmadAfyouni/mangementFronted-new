export type TaskTree = {
  id: string;
  name: string;
  parentId: string | null;
  status?: string;
  priority?: string;
  assignee?: {
    name?: string;
  };
  is_over_due?: boolean;
};
