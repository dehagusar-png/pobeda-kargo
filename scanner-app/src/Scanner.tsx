import { useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface ScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: any) => void;
}

const Scanner = ({ onScanSuccess, onScanFailure }: ScannerProps) => {
  
  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    let isScanning = true;

    html5QrCode.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: { width: 300, height: 150 },
      },
      (decodedText) => {
        if (!isScanning) return;
        const text = decodedText.trim();
        
        // Санҷиши дарозӣ барои пешгирии хатогиҳо
        if (text && text.length >= 8) {
          isScanning = false;
          onScanSuccess(text);
          html5QrCode.stop().catch(console.error);
        }
      },
      () => {
        // Одатан хатогиҳои хурд ҳангоми наёфтани штрих-код мебароянд, мо онҳоро нодида мегирем
      }
    ).catch((err) => {
      console.error("Camera error:", err);
      if (onScanFailure) onScanFailure(err);
    });

    return () => {
      isScanning = false;
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [onScanSuccess, onScanFailure]);

  return (
    <div className="w-full max-w-sm mx-auto overflow-hidden rounded-xl bg-black">
      <div id="reader" className="w-full" style={{ minHeight: '250px' }}></div>
    </div>
  );
};

export default Scanner;
