export type Role = "Owner" | "Admin" | "Member" | "Viewer";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "User" | "Admin"; // System role (for Admin Dashboard)
  avatar?: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface WorkspaceMember {
  userId: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: WorkspaceMember[];
  customColumns?: string[]; // e.g. ["To Do", "In Progress", "Review", "Completed"]
  theme?: string;
  tagColors?: Record<string, string>;
  createdAt: string;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  status: "Planning" | "Active" | "Completed" | "On Hold";
  dueDate?: string;
  progress: number; // 0-100% computed or manual
  team: string[]; // User IDs
  createdAt: string;
}

export interface TemplateTask {
  title: string;
  description?: string;
  status: string;
  priority: Priority;
  subtasks: { title: string; completed: boolean }[];
  tags: string[];
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description?: string;
  tasks: TemplateTask[];
  createdAt: string;
}

export type Priority = "Low" | "Medium" | "High" | "Critical";
export type TaskStatus = "To Do" | "In Progress" | "Review" | "Completed";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  workspaceId: string;
  title: string;
  description?: string;
  status: TaskStatus | string; // support custom columns
  priority: Priority;
  dueDate?: string;
  assignees: string[]; // User IDs
  tags: string[];
  subtasks: Subtask[];
  attachments: Attachment[];
  dependencies: string[]; // Task IDs that must be completed first
  recurring?: {
    frequency: "Daily" | "Weekly" | "Monthly" | "None";
  };
  createdAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "alert";
  read: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  workspaceId: string;
  projectId?: string;
  taskId?: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  createdAt: string;
}
