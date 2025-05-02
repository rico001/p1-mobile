import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchModels, performModelAction } from '../api/models.js';

export function useModels() {
  const queryClient = useQueryClient();

  const modelsQuery = useQuery({
    queryKey: ['models'],
    queryFn: fetchModels,
    staleTime: 1000 * 60, // 1 Minute
    retry: 2,
  });

  const actionMutation = useMutation({
    mutationFn: performModelAction,
    onSuccess: () => {
      queryClient.invalidateQueries(['models']);
    }
  });

  return {
    models: modelsQuery.data || [],
    isLoading: modelsQuery.isLoading,
    isError: modelsQuery.isError,
    error: modelsQuery.error,
    performAction: actionMutation.mutate,
    isActionLoading: actionMutation.isLoading,
    refetch: modelsQuery.refetch,
  };
}