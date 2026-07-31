import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera } from 'lucide-react';

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
      verbose: true,
      useBarCodeDetectorIfSupported: true, // Муҳим барои Android
      formatsToSupport: [ 1 ] // 1 = CODE_128 (аз рӯи Html5QrcodeSupportedFormats)
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
          const width = Math.min(videoWidth * 0.95, 450);
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
      // scanFile(file, true) = true means it will try to handle image rotation
      const decodedText = await html5QrCodeRef.current.scanFile(file, true);
      const text = decodedText.trim();
      if (text && text.length >= 8) {
        onScanSuccessRef.current(text);
      }
    } catch (err) {
      console.error("File scan error:", err);
      alert("Штрих-код ёфт нашуд ё сифати расм паст аст. Лутфан аз наздик ва равшантар расм гиред!");
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto overflow-hidden rounded-xl bg-black flex flex-col gap-4 pb-4">
      <div id="reader" className="w-full" style={{ minHeight: '250px' }}></div>
      
      <div className="px-4">
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <p className="text-gray-300 text-sm mb-3">
            Агар камераи зинда нахонад, расм гиред:
          </p>
          
          <div className="relative w-full">
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            />
            <button 
              disabled={isProcessingFile}
              className="w-full py-3 bg-blue-600 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-colors"
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
    </div>
  );
};

export default Scanner;
