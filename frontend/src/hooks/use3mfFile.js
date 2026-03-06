import { useState, useEffect, useCallback } from 'react';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';
import { parse3mfFile, cleanup3mfData } from '../utils/3mf-parser';

export function use3mfFile(downloadUrl, enabled = false) {
  const [state, setState] = useState({
    isLoading: false,
    error: null,
    data: null, // { images, modelXml, metadata, zipFile }
    progress: 0
  });

  const load = useCallback(async () => {
    if (!downloadUrl) return;

    setState(prev => ({ ...prev, isLoading: true, error: null, progress: 0 }));

    try {
      // Fetch .3mf file as ArrayBuffer
      const response = await fetchWithTimeout(downloadUrl, {}, 120000); // 60s timeout for large files

      if (!response.ok) {
        throw new Error(`Download fehlgeschlagen: ${response.statusText}`);
      }

      setState(prev => ({ ...prev, progress: 30 }));

      // Read as ArrayBuffer for JSZip
      const arrayBuffer = await response.arrayBuffer();

      setState(prev => ({ ...prev, progress: 60 }));

      // Parse 3MF file
      const data = await parse3mfFile(arrayBuffer);

      setState({
        isLoading: false,
        error: null,
        data,
        progress: 100
      });
    } catch (err) {
      console.error('Failed to load 3MF file:', err);
      setState({
        isLoading: false,
        error: err.message,
        data: null,
        progress: 0
      });
    }
  }, [downloadUrl]);

  // Load when enabled changes to true
  useEffect(() => {
    if (enabled && downloadUrl) {
      load();
    }

    // Cleanup on unmount
    return () => {
      if (state.data) {
        cleanup3mfData(state.data);
      }
    };
  }, [enabled, downloadUrl, load]);

  return {
    ...state,
    reload: load
  };
}
