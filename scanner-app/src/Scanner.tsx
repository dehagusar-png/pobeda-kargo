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
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
    onScanFailureRef.current = onScanFailure;
  }, [onScanSuccess, onScanFailure]);

  useEffect(() => {
    let isScanning = true;
    let html5QrCode: Html5Qrcode | null = null;

    const handleSuccess = (decodedText: string) => {
      if (!isScanning || !onScanSuccessRef.current) return;
      
      const cleanedText = decodedText.trim();
      // Трек-кодҳо одатан фақат ҳарфҳои англисӣ, рақамҳо ва баъзан тире (-) доранд.
      // Рамзҳои аҷиб ба монанди %, &, ? қабул намешаванд (чунки инҳо хатогиҳои сканер мебошанд)
      const isValidTracking = /^[A-Za-z0-9\-]+$/.test(cleanedText) && cleanedText.length >= 6;
      
      if (isValidTracking) {
        onScanSuccessRef.current(cleanedText);
      } else {
        console.log("Ignored invalid/garbage barcode:", cleanedText);
      }
    };

    html5QrCode = new Html5Qrcode("reader", { 
      verbose: false,
      useBarCodeDetectorIfSupported: true
    });

    html5QrCode.start(
      { facingMode: "environment" },
      {
        fps: 15,
        qrbox: (videoWidth, _videoHeight) => {
          const width = Math.min(videoWidth * 0.9, 450);
          return { width: width, height: 150 };
        },
        aspectRatio: window.innerWidth / window.innerHeight,
      },
      (decodedText) => handleSuccess(decodedText),
      (_errorMessage) => {
        // ignore normal scanning errors to avoid spam
      }
    ).catch((err) => {
      console.error("Camera start error:", err);
    });

    return () => {
      isScanning = false;
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingFile(true);
      
      const html5QrCode = new Html5Qrcode("reader");
      const result = await html5QrCode.scanFile(file, true);
      
      if (onScanSuccessRef.current && result) {
        const cleanedText = result.trim();
        const isValidTracking = /^[A-Za-z0-9\-]+$/.test(cleanedText) && cleanedText.length >= 6;
        if (isValidTracking) {
          onScanSuccessRef.current(cleanedText);
        } else {
          alert("Штрих-коди нодуруст ёфт шуд. Лутфан аз наздиктар расм гиред.");
        }
      }
    } catch (err) {
      console.error("File scan error:", err);
      alert("Штрих-код ёфт нашуд. Лутфан расми равшантаре гиред.");
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto overflow-hidden rounded-xl bg-black flex flex-col gap-4 pb-4 relative">
      
      {/* Container барои камера */}
      <div className="w-full relative bg-black" style={{ minHeight: '250px' }}>
        <div id="reader" className="w-full"></div>
      </div>

      <div className="px-4 flex flex-col gap-4">
        {/* Тугмаи фавқулода барои расм гирифтан */}
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <p className="text-slate-300 text-sm mb-3">
            Агар камераи зинда нахонад, расм гиред:
          </p>
          <div className="relative overflow-hidden inline-block w-full">
            <button 
              className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                isProcessingFile 
                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20'
              }`}
            >
              {isProcessingFile ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
                  Коркард...
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5" />
                  <span>Расм гирифтан / Галерея</span>
                </>
              )}
            </button>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isProcessingFile}
            />
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Scanner;
