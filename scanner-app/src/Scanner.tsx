import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Upload, Camera } from 'lucide-react';

interface ScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: any) => void;
}

const Scanner = ({ onScanSuccess, onScanFailure }: ScannerProps) => {
  const onScanSuccessRef = useRef(onScanSuccess);
  const onScanFailureRef = useRef(onScanFailure);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
    onScanFailureRef.current = onScanFailure;
  }, [onScanSuccess, onScanFailure]);

  useEffect(() => {
    // Сканери оддӣ ва устувор
    const html5QrCode = new Html5Qrcode("reader", { 
      verbose: false,
      useBarCodeDetectorIfSupported: true // Муҳим барои Android
    });
    html5QrCodeRef.current = html5QrCode;

    let isScanning = true;
    let lastScannedCode = "";
    let lastScanTime = 0;

    html5QrCode.start(
      { facingMode: "environment" },
      {
        fps: 15,
        qrbox: (videoWidth, _videoHeight) => {
          const width = Math.min(videoWidth * 0.9, 350);
          return { width: width, height: 150 };
        },
        aspectRatio: window.innerWidth / window.innerHeight,
        disableFlip: false
      },
      (decodedText) => {
        if (!isScanning) return;
        const text = decodedText.trim();
        
        if (text && text.length >= 8) {
          const now = Date.now();
          if (text === lastScannedCode && (now - lastScanTime) < 3000) {
            return;
          }
          lastScannedCode = text;
          lastScanTime = now;
          onScanSuccessRef.current(text);
        }
      },
      () => {
        // Ignore normal scan failures
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !html5QrCodeRef.current) return;

    setIsProcessingFile(true);
    try {
      const decodedText = await html5QrCodeRef.current.scanFile(file, true);
      const text = decodedText.trim();
      if (text && text.length >= 8) {
        onScanSuccessRef.current(text);
      }
    } catch (err) {
      console.error("File scan error:", err);
      alert("Штрих-код ёфт нашуд. Лутфан акси равшантар ва наздиктар гиред!");
    } finally {
      setIsProcessingFile(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto overflow-hidden rounded-xl bg-black flex flex-col gap-4 pb-4">
      <div id="reader" className="w-full" style={{ minHeight: '250px' }}></div>
      
      <div className="px-4">
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <p className="text-gray-300 text-sm mb-3">
            Агар камераи зинда дар Айфон хуб нахонад:
          </p>
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessingFile}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {isProcessingFile ? (
              <span className="animate-pulse">Хониш рафта истодааст...</span>
            ) : (
              <>
                <Camera size={20} />
                <span>Расм гирифтан / Галерея</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Scanner;
