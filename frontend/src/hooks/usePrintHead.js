// src/hooks/usePrintHead.js
import { useMutation } from '@tanstack/react-query';
import { movePrintHead } from '../api/printHead';

export function usePrintHead() {
  return useMutation({
    mutationFn: movePrintHead,
    onError: (err) => {
      console.error('Print-head move error:', err);
    }
  });
}
