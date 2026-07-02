import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import type { TodoItem } from '../types';

export const useTodoQuery = (listId?: string) => {
  const queryClient = useQueryClient();

  const useGetTodos = () => {
    return useQuery<TodoItem[], Error>({
      queryKey: ['todos', 'list', listId],
      queryFn: async () => {
        if (!listId) return [];
        const response = await api.get(`/todos/list/${listId}`);
        return response.data;
      },
      enabled: !!listId,
    });
  };

  const createTodoMutation = useMutation<
    TodoItem,
    Error,
    { title: string; description?: string; dueDate?: string; file?: File }
  >({
    mutationFn: async ({ title, description, dueDate, file }) => {
      if (!listId) throw new Error('List ID is required to create a task');

      // Use FormData to allow file uploads (multipart/form-data)
      const formData = new FormData();
      formData.append('title', title);
      if (description) formData.append('description', description);
      if (dueDate) formData.append('dueDate', dueDate);
      if (file) {
        formData.append('file', file);
      }

      const response = await api.post(`/todos/list/${listId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', 'list', listId] });
    },
  });

  const updateTodoMutation = useMutation<
    TodoItem,
    Error,
    { id: string; title?: string; description?: string; dueDate?: string; isCompleted?: boolean; file?: File }
  >({
    mutationFn: async ({ id, title, description, dueDate, isCompleted, file }) => {
      const formData = new FormData();
      if (title !== undefined) formData.append('title', title);
      if (description !== undefined) formData.append('description', description);
      if (dueDate !== undefined) formData.append('dueDate', dueDate);
      if (isCompleted !== undefined) formData.append('isCompleted', String(isCompleted));
      if (file) {
        formData.append('file', file);
      }

      const response = await api.patch(`/todos/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', 'list', listId] });
    },
  });

  const deleteTodoMutation = useMutation<boolean, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/todos/${id}`);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', 'list', listId] });
    },
  });

  return {
    useGetTodos,
    createTodoMutation,
    updateTodoMutation,
    deleteTodoMutation,
  };
};
