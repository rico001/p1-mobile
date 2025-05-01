import { useMutation, useQuery } from '@tanstack/react-query';
import { movePrintHead, movePrintHeadHome, setLight, getAmsState } from '../api/printer';

export function usePrintHead() {
    const moveMutation = useMutation({
        mutationFn: movePrintHead,
        onError: err => {
            console.error('Print-head move error:', err);
        }
    });

    const homeMutation = useMutation({
        mutationFn: movePrintHeadHome,
        onError: err => {
            console.error('Print-head home error:', err);
        }
    });

    const lightMutation = useMutation({
        mutationFn: setLight,
        onError: err => {
            console.error('Print-head light error:', err);
        }
    });

    const stateQuery = useQuery({
        queryKey: ['amsState'],
        queryFn: getAmsState,
        onError: err => {
            console.error('Get AMS state error:', err);
        },
        staleTime: 1000 * 60, // 1 Minute
    });

    return {
        // Mutations
        move: moveMutation.mutate,
        isMoving: moveMutation.isLoading,
        home: homeMutation.mutate,
        isHoming: homeMutation.isLoading,
        setLight: lightMutation.mutate,
        isSettingLight: lightMutation.isLoading,
        // Queries
        amsState: stateQuery.data,
        isAmsStateLoading: stateQuery.isLoading,
    };
}
