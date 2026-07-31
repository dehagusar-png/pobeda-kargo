import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { BrowserMultiFormatReader, DecodeHintType } from '@zxing/library';
import { Camera } from 'lucide-react';

interface ScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: any) => void;
}

const Scanner = ({ onScanSuccess, onScanFailure }: ScannerProps) => {
  const onScanSuccessRef = useRef(onScanSuccess);
  const onScanFailureRef = useRef(onScanFailure);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [engine, setEngine] = useState<'html5' | 'zxing' | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const zxingReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const zxingControlsRef = useRef<any>(null);

  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
    onScanFailureRef.current = onScanFailure;
  }, [onScanSuccess, onScanFailure]);

  useEffect(() => {
    // Пахш кардани огоҳиҳои бемаънии ZXing дар консол
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('non-ReaderException')) return;
      originalWarn.apply(console, args);
    };

    let isScanning = true;
    let html5QrCode: Html5Qrcode | null = null;
    let zxingReader: BrowserMultiFormatReader | null = null;

    const handleSuccess = (decodedText: string) => {
      if (isScanning && onScanSuccessRef.current) {
        onScanSuccessRef.current(decodedText);
      }
    };

    const hasBarcodeDetector = 'BarcodeDetector' in window;

    if (hasBarcodeDetector) {
      // ==========================================
      // ENGINE: HTML5-QRCODE (БАРОИ АНДРОИД)
      // ==========================================
      setEngine('html5');
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
          // ignore normal errors
        }
      ).catch((err) => {
        console.error("Android camera error:", err);
      });
    } else {
      // ==========================================
      // ENGINE: ZXING (БАРОИ АЙФОН)
      // ==========================================
      setEngine('zxing');
      const hints = new Map();
      hints.set(DecodeHintType.TRY_HARDER, true);
      
      zxingReader = new BrowserMultiFormatReader(hints);
      zxingReaderRef.current = zxingReader;

      if (videoRef.current) {
        const constraints = {
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };

        import('@zxing/browser').then(({ BrowserMultiFormatReader: BrowserReader }) => {
          const modernReader = new BrowserReader(hints);
          zxingReaderRef.current = modernReader as any;
          
          modernReader.decodeFromConstraints(constraints, videoRef.current!, (result, _error) => {
            if (result && result.getText()) {
              handleSuccess(result.getText());
            }
          }).then(controls => {
            zxingControlsRef.current = controls;
          }).catch(err => {
            console.error("iPhone camera error:", err);
          });
        });
      }
    }

    return () => {
      isScanning = false;
      console.warn = originalWarn; // Барқарор кардани console.warn
      
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
      if (zxingControlsRef.current) {
        zxingControlsRef.current.stop();
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
        
        {/* Барои Андроид (Html5Qrcode) */}
        <div 
          id="reader" 
          className="w-full" 
          style={{ display: engine === 'html5' || engine === null ? 'block' : 'none' }}
        ></div>

        {/* Барои Айфон (ZXing) */}
        <video 
          ref={videoRef} 
          className="w-full object-cover" 
          style={{ 
            minHeight: '250px', 
            maxHeight: '450px',
            display: engine === 'zxing' ? 'block' : 'none' 
          }}
          autoPlay
          muted
          playsInline
        />

        {/* Хатти сурхи сканер барои Айфон */}
        {engine === 'zxing' && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
            <div className="w-[90%] h-[150px] border-2 border-white/50 rounded-lg relative">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-red-500 shadow-[0_0_8px_red] animate-pulse"></div>
            </div>
          </div>
        )}
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
