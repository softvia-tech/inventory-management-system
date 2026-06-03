import { useEffect, useRef } from 'react';

export const useBarcodeScanner = (onScan) => {
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    let barcodeBuffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e) => {
      // Don't intercept if focus is on a field where user might rapidly type, but usually physical scanners are much faster than humans (< 50ms per key)
      const currentTime = Date.now();
      
      // If time between keystrokes is too long (> 50ms), it's probably a human. Reset buffer.
      if (currentTime - lastKeyTime > 50) {
        barcodeBuffer = '';
      }
      
      if (e.key === 'Enter' && barcodeBuffer.length > 3) {
        e.preventDefault();
        onScanRef.current(barcodeBuffer);
        barcodeBuffer = '';
      } else if (e.key.length === 1) {
        // Only capture printable characters
        barcodeBuffer += e.key;
      }
      
      lastKeyTime = currentTime;
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};
