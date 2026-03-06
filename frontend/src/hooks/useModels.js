import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchModels, performModelAction, createFolder, moveItem, deleteFolder, renameFolder } from '../api/models.js';
import { toast } from 'react-toastify';

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
      toast.success('Erfolgreich verschoben!', {
        position: 'top-right',
        autoClose: 3000
      });
    },
    onError: (error) => {
      toast.error(`Verschieben fehlgeschlagen: ${error.message}`, {
        position: 'top-right',
        autoClose: 5000
      });
    }
  });

  const deleteFolderMutation = useMutation({
    mutationFn: deleteFolder,
    onSuccess: () => {
      queryClient.invalidateQueries(['models', currentPath]);
    }
  });

  const renameFolderMutation = useMutation({
    mutationFn: renameFolder,
    onSuccess: () => {
      queryClient.invalidateQueries(['models', currentPath]);
      toast.success('Ordner erfolgreich umbenannt!', {
        position: 'top-right',
        autoClose: 3000
      });
    },
    onError: (error) => {
      toast.error(`Umbenennen fehlgeschlagen: ${error.message}`, {
        position: 'top-right',
        autoClose: 5000
      });
    }
  });

  return {
    models: modelsQuery.data || [],
    isLoading: modelsQuery.isLoading,
    isError: modelsQuery.isError,
    error: modelsQuery.error,
    performAction: actionMutation.mutateAsync,
    isActionPending: actionMutation.isPending,
    refetch: modelsQuery.refetch,
    currentPath,
    setCurrentPath,
    createFolder: createFolderMutation.mutate,
    moveItem: moveItemMutation.mutate,
    deleteFolder: deleteFolderMutation.mutate,
    renameFolder: renameFolderMutation.mutate,
    isFolderActionPending: createFolderMutation.isPending || moveItemMutation.isPending || deleteFolderMutation.isPending || renameFolderMutation.isPending,
  };
}