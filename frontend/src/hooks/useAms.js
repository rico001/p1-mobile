// src/hooks/useAms.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setAmsTrayApi } from '../api/ams.js';

export function useAms() {
  const queryClient = useQueryClient();

  const setTrayMutation = useMutation({
    mutationFn: setAmsTrayApi,
    onSuccess: () => {
      queryClient.invalidateQueries(['ams']);
    },
    onError: (error) => {
      console.error('useAms:setTray Error', error);
    },
  });

  const unloadAmsMutation = useMutation({
    mutationFn: () => {
      return fetch(`api/mqtt/print/ams/unload`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ams']);
    },
    onError: (error) => {
      console.error('useAms:unloadAms Error', error);
    },
  });

  return {
    setTray: setTrayMutation.mutate,
    isSettingTray: setTrayMutation.isPending,
    errorSettingTray: setTrayMutation.error,

    unloadAms: unloadAmsMutation.mutate,
    isUnloadingAms: unloadAmsMutation.isPending,
    errorUnloadingAms: unloadAmsMutation.error,
  };
}
