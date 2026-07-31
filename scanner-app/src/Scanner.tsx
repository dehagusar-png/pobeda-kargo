import { useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

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
      useBarCodeDetectorIfSupported: true,
      formatsToSupport: [
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.QR_CODE
      ]
    });
    let isScanning = true;
    let lastScannedCode = "";
    let lastScanTime = 0;

    html5QrCode.start(
      { facingMode: "environment" },
      {
        fps: 15,
        qrbox: (videoWidth, _videoHeight) => {
          const width = Math.min(videoWidth * 0.9, 300);
          return { width: width, height: 150 };
        },
        aspectRatio: window.innerWidth / window.innerHeight, // Пешгирии кашишхӯрии видео дар iPhone
        disableFlip: false,
        videoConstraints: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
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
