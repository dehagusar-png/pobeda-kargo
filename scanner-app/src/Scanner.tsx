import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library';
import { Camera } from 'lucide-react';

interface ScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: any) => void;
}

const Scanner = ({ onScanSuccess, onScanFailure }: ScannerProps) => {
  const onScanSuccessRef = useRef(onScanSuccess);
  const onScanFailureRef = useRef(onScanFailure);
  
  // File upload state for fallback
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const zxingReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
    onScanFailureRef.current = onScanFailure;
  }, [onScanSuccess, onScanFailure]);

  useEffect(() => {
    let isScanning = true;
    let html5QrCode: Html5Qrcode | null = null;

    const handleSuccess = (decodedText: string) => {
      if (isScanning && onScanSuccessRef.current) {
        onScanSuccessRef.current(decodedText);
      }
    };

    const hasBarcodeDetector = 'BarcodeDetector' in window;

    // Универсальный старт Html5Qrcode для iOS ва Android
    html5QrCode = new Html5Qrcode("reader", { 
      verbose: false,
      useBarCodeDetectorIfSupported: true, // Дар Андроид BarcodeDetector-ро истифода мебарад
      formatsToSupport: [ Html5QrcodeSupportedFormats.CODE_128, Html5QrcodeSupportedFormats.CODE_39 ]
    });

    const config: any = {
      fps: 15,
      qrbox: (videoWidth: number, _videoHeight: number) => {
        const width = Math.min(videoWidth * 0.9, 450);
        return { width: width, height: 150 };
      },
      aspectRatio: window.innerWidth / window.innerHeight,
    };

    // Барои Айфон сифати камераро баланд мекунем то хира нашавад
    if (!hasBarcodeDetector) {
      config.videoConstraints = {
        facingMode: "environment",
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      };
    }

    html5QrCode.start(
      { facingMode: "environment" },
      config,
      (decodedText) => handleSuccess(decodedText),
      (_errorMessage) => {
        // html5-qrcode хатогиҳоро хомӯшона коркард мекунад
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
      const imageUrl = URL.createObjectURL(file);
      
      let reader = zxingReaderRef.current;
      if (!reader) {
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.CODE_128, BarcodeFormat.CODE_39]);
        hints.set(DecodeHintType.TRY_HARDER, true);
        reader = new BrowserMultiFormatReader(hints);
        zxingReaderRef.current = reader;
      }
      
      const result = await reader.decodeFromImageUrl(imageUrl);
      
      if (onScanSuccessRef.current) {
        onScanSuccessRef.current(result.getText());
      }
      
      URL.revokeObjectURL(imageUrl);
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
        
        {/* html5-qrcode ҳамеша инҷо кор мекунад */}
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
