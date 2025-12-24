import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchModels, performModelAction, createFolder, moveItem, deleteFolder } from '../api/models.js';

export function useModels() {
  const queryClient = useQueryClient();
  const [currentPath, setCurrentPath] = useState('/p1-app-models');

  const modelsQuery = useQuery({
    queryKey: ['models', currentPath],
    queryFn: () => fetchModels(currentPath),
    staleTime: 1000 * 60, // 1 Minute
    retry: 2,
  });

  const actionMutation = useMutation({
    mutationFn: performModelAction,
    onSuccess: () => {
      queryClient.invalidateQueries(['models', currentPath]);
    }
  });

  const createFolderMutation = useMutation({
    mutationFn: createFolder,
    onSuccess: () => {
      queryClient.invalidateQueries(['models', currentPath]);
    }
  });

  const moveItemMutation = useMutation({
    mutationFn: moveItem,
    onSuccess: () => {
      queryClient.invalidateQueries(['models']);
    }
  });

  const deleteFolderMutation = useMutation({
    mutationFn: deleteFolder,
    onSuccess: () => {
      queryClient.invalidateQueries(['models', currentPath]);
    }
  });

  return {
    models: modelsQuery.data || [],
    isLoading: modelsQuery.isLoading,
    isError: modelsQuery.isError,
    error: modelsQuery.error,
    performAction: actionMutation.mutate,
    isActionPending: actionMutation.isPending,
    refetch: modelsQuery.refetch,
    currentPath,
    setCurrentPath,
    createFolder: createFolderMutation.mutate,
    moveItem: moveItemMutation.mutate,
    deleteFolder: deleteFolderMutation.mutate,
    isFolderActionPending: createFolderMutation.isPending || moveItemMutation.isPending || deleteFolderMutation.isPending,
  };
}