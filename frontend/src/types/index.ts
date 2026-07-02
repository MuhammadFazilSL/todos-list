export interface User {
  uid: string;
  email: string;
  displayName: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface TodoList {
  id: string;
  userId: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface TodoItem {
  id: string;
  listId: string;
  userId: string;
  title: string;
  description: string;
  isCompleted: boolean;
  dueDate?: string;
  attachmentUrl?: string;
  createdAt: string;
}
