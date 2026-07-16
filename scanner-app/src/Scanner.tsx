import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface ScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: any) => void;
}

const Scanner = ({ onScanSuccess, onScanFailure }: ScannerProps) => {
  const onScanSuccessRef = useRef(onScanSuccess);
  const onScanFailureRef = useRef(onScanFailure);

  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
    onScanFailureRef.current = onScanFailure;
  }, [onScanSuccess, onScanFailure]);

  useEffect(() => {
    // Истифодаи BarcodeDetector-и телефони мобилӣ (агар дастгирӣ шавад)
    // Ин хатогиҳои хониши штрих-кодҳои Чинро (Code 128 Subset C) пурра бартараф мекунад!
    const html5QrCode = new Html5Qrcode("reader", { 
      verbose: false,
      useBarCodeDetectorIfSupported: true 
    });
    let isScanning = true;
    let lastScannedCode = "";
    let lastScanTime = 0;

    html5QrCode.start(
      { 
        facingMode: "environment",
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 }
      },
      {
        fps: 20,
        qrbox: { width: 300, height: 150 },
      },
      (decodedText) => {
        if (!isScanning) return;
        const text = decodedText.trim();
        
        // Санҷиши дарозӣ барои пешгирии хатогиҳо
        if (text && text.length >= 8) {
          const now = Date.now();
          // Нагузоред, ки як код дар давоми 3 сония дубора скан шавад
          if (text === lastScannedCode && (now - lastScanTime) < 3000) {
            return;
          }
          
          lastScannedCode = text;
          lastScanTime = now;
          onScanSuccessRef.current(text);
          // html5QrCode.stop() хориҷ карда шуд барои сканери доимӣ
        }
      },
      () => {
        // Одатан хатогиҳои хурд ҳангоми наёфтани штрих-код мебароянд, мо онҳоро нодида мегирем
      }
    ).catch((err) => {
      console.error("Camera error:", err);
      if (onScanFailureRef.current) onScanFailureRef.current(err);
    });

    return () => {
      isScanning = false;
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, []);

  return (
    <div className="w-full max-w-sm mx-auto overflow-hidden rounded-xl bg-black">
      <div id="reader" className="w-full" style={{ minHeight: '250px' }}></div>
    </div>
  );
};

export default Scanner;
