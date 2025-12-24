import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTimelapses, deleteTimelapse } from '../api/timelapses.js';

export function useTimelapses() {
  const queryClient = useQueryClient();

  const timelapsesQuery = useQuery({
    queryKey: ['timelapses'],
    queryFn: fetchTimelapses,
    staleTime: 1000 * 60, // 1 Minute
    retry: 2,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTimelapse,
    onSuccess: () => {
      queryClient.invalidateQueries(['timelapses']);
    }
  });

  return {
    timelapses: timelapsesQuery.data || [],
    isLoading: timelapsesQuery.isLoading,
    isError: timelapsesQuery.isError,
    error: timelapsesQuery.error,
    deleteTimelapse: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    refetch: timelapsesQuery.refetch,
  };
}
