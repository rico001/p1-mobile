import { useMutation, useQuery } from '@tanstack/react-query';
import {
    movePrintHead,
    movePrintHeadHome,
    setLight,
    getAmsState,
    getLightState,
    stopPrint,
    pausePrint,
    resumePrint,
    setPrintSpeed
} from '../api/printer.js';


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

    //speed-modes: 1 = silent, 2 = standard, 3 = sport, 4 = ludicrous
    const speedMutation = useMutation({
        mutationFn: setPrintSpeed,
        onError: err => {
            console.error('Print-head speed error:', err);
        }
    });

    const stopMutation = useMutation({
        mutationFn: stopPrint,
        onError: err => console.error('Stop print error:', err)
    });

    const pauseMutation = useMutation({
        mutationFn: pausePrint,
        onError: err => console.error('Pause print error:', err)
    });

    const resumeMutation = useMutation({
        mutationFn: resumePrint,
        onError: err => console.error('Resume print error:', err)
    });

    // Queries for state
    const stateQuery = useQuery({
        queryKey: ['amsState'],
        queryFn: getAmsState,
        onError: err => {
            console.error('Get AMS state error:', err);
        },
        staleTime: 1000 * 60, // 1 Minute
    });

    const lightStateQuery = useQuery({
        queryKey: ['lightState'],
        queryFn: getLightState,
        onError: err => {
            console.error('Get light state error:', err);
        },
        staleTime: 1000 * 60, // 1 Minute
    });

    return {
        // Move control
        move: moveMutation.mutate,
        isMoving: moveMutation.isLoading,
        home: homeMutation.mutate,
        isHoming: homeMutation.isLoading,

        // Light control
        setLight: lightMutation.mutate,
        isSettingLight: lightMutation.isLoading,

        // Speed control
        setSpeed: speedMutation.mutate,
        isSettingSpeed: speedMutation.isLoading,

        // Print control
        stopPrint: stopMutation.mutate,
        isStopping: stopMutation.isLoading,
        pausePrint: pauseMutation.mutate,
        isPausing: pauseMutation.isLoading,
        resumePrint: resumeMutation.mutate,
        isResuming: resumeMutation.isLoading,

        // several queries for state
        amsState: stateQuery.data,
        isAmsStateLoading: stateQuery.isLoading,
        lightState: lightStateQuery.data,
        isLightStateLoading: lightStateQuery.isLoading
    };
}