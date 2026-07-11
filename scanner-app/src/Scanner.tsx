import { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface ScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: any) => void;
}

const Scanner = ({ onScanSuccess, onScanFailure }: ScannerProps) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 150 }, rememberLastUsedCamera: true },
      false
    );

    const handleSuccess = (decodedText: string) => {
      scanner.clear();
      onScanSuccess(decodedText);
    };

    const handleFailure = (error: any) => {
      if (onScanFailure) {
        onScanFailure(error);
      }
    };

    scanner.render(handleSuccess, handleFailure);

    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, [onScanSuccess, onScanFailure]);

  return <div id="reader" className="w-full max-w-sm mx-auto overflow-hidden rounded-xl"></div>;
};

export default Scanner;
