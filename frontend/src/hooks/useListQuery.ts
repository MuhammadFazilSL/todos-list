import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import type { TodoList } from '../types';

export const useListQuery = () => {
  const queryClient = useQueryClient();

  const useGetLists = () => {
    return useQuery<TodoList[], Error>({
      queryKey: ['todo-lists'],
      queryFn: async () => {
        const response = await api.get('/todo-lists');
        return response.data;
      },
    });
  };

  const useGetListDetail = (listId: string | undefined) => {
    return useQuery<TodoList, Error>({
      queryKey: ['todo-lists', listId],
      queryFn: async () => {
        if (!listId) throw new Error('List ID is required');
        const response = await api.get(`/todo-lists/${listId}`);
        return response.data;
      },
      enabled: !!listId,
    });
  };

  const createListMutation = useMutation<
    TodoList,
    Error,
    { name: string; description: string }
  >({
    mutationFn: async (newList) => {
      const response = await api.post('/todo-lists', newList);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todo-lists'] });
    },
  });

  const updateListMutation = useMutation<
    TodoList,
    Error,
    { id: string; name: string; description: string }
  >({
    mutationFn: async ({ id, name, description }) => {
      const response = await api.patch(`/todo-lists/${id}`, { name, description });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['todo-lists'] });
      queryClient.invalidateQueries({ queryKey: ['todo-lists', data.id] });
    },
  });

  const deleteListMutation = useMutation<boolean, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/todo-lists/${id}`);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todo-lists'] });
    },
  });

  return {
    useGetLists,
    useGetListDetail,
    createListMutation,
    updateListMutation,
    deleteListMutation,
  };
};
