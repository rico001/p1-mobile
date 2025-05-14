// src/useTasmota.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTasmotaSwitch,
  toggleTasmotaSwitch,
  turnOnTasmotaSwitch,
  turnOffTasmotaSwitch,
} from '../api/tasmota.js';  

export function useTasmota() {
  const qc = useQueryClient();

  const statusQuery = useQuery({
    queryKey: ['tasmota'],
    queryFn: getTasmotaSwitch,
    staleTime: 5_000,
    retry: 1,
  });

  const toggleMutation = useMutation({
    mutationFn: toggleTasmotaSwitch,
    onSuccess: () => qc.invalidateQueries(['tasmota']),
  });
  const onMutation = useMutation({
    mutationFn: turnOnTasmotaSwitch,
    onSuccess: () => qc.invalidateQueries(['tasmota']),
  });
  const offMutation = useMutation({
    mutationFn: turnOffTasmotaSwitch,
    onSuccess: () => qc.invalidateQueries(['tasmota']),
  });

  return {
    // Status
    isOn: statusQuery.data,
    isLoading: statusQuery.isLoading,
    error: statusQuery.error,
    // Aktionen
    toggle: toggleMutation.mutate,
    turnOn: onMutation.mutate,
    turnOff: offMutation.mutate,
    // Loading-Flags
    isToggling: toggleMutation.isPending,
    isTurningOn: onMutation.isPending,
    isTurningOff: offMutation.isPending,
  };
}
