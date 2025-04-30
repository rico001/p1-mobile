import { useMutation } from '@tanstack/react-query';
import { movePrintHead, movePrintHeadHome, setLight } from '../api/printHead';

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

    return {
        move: moveMutation.mutate,
        isMoving: moveMutation.isLoading,
        home: homeMutation.mutate,
        isHoming: homeMutation.isLoading,
        setLight: lightMutation.mutate,
        isSettingLight: lightMutation.isLoading,
    };
}
