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
    let lastScannedCode = "";
    let lastScanTime = 0;
    
    // Муайян кардани дастгирии BarcodeDetector (одатан дар Андроид ҳаст, дар Айфон нест)
    const hasBarcodeDetector = 'BarcodeDetector' in window;
    
    const handleSuccess = (text: string) => {
      text = text.trim();
      if (text && text.length >= 8) {
        const now = Date.now();
        if (text === lastScannedCode && (now - lastScanTime) < 3000) return;
        lastScannedCode = text;
        lastScanTime = now;
        if (onScanSuccessRef.current) onScanSuccessRef.current(text);
      }
    };

    let html5QrCode: Html5Qrcode | null = null;
    let zxingReader: BrowserMultiFormatReader | null = null;
    let localStream: MediaStream | null = null;

    if (hasBarcodeDetector) {
      // ==========================================
      // ENGINE: HTML5-QRCODE (БАРОИ АНДРОИД)
      // ==========================================
      setEngine('html5');
      html5QrCode = new Html5Qrcode("reader", { 
        verbose: false,
        useBarCodeDetectorIfSupported: true, // Истифодаи сканери худии телефон
        formatsToSupport: [ 1 ] // CODE_128
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
        (decodedText) => {
          if (isScanning) handleSuccess(decodedText);
        },
        () => {} // ignore normal errors
      ).catch(err => {
        console.error("Android camera error:", err);
        if (onScanFailureRef.current) onScanFailureRef.current(err);
      });

    } else {
      // ==========================================
      // ENGINE: ZXING (БАРОИ АЙФОН)
      // ==========================================
      setEngine('zxing');
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [1]); // CODE_128
      hints.set(DecodeHintType.TRY_HARDER, true);
      
      zxingReader = new BrowserMultiFormatReader(hints);
      zxingReaderRef.current = zxingReader;

      const startZxingCamera = async () => {
        try {
          if (!videoRef.current) return;
          
          // Танзимоти сифати баланд барои Айфон то ки хира нашавад
          const constraints = {
            video: {
              facingMode: 'environment',
              width: { min: 1280, ideal: 1920, max: 2560 },
              height: { min: 720, ideal: 1080, max: 1440 }
            }
          };

          localStream = await navigator.mediaDevices.getUserMedia(constraints);
          
          if (!isScanning || !videoRef.current) {
            localStream.getTracks().forEach(t => t.stop());
            return;
          }

          videoRef.current.srcObject = localStream;
          videoRef.current.setAttribute("playsinline", "true");
          videoRef.current.play();

          const decodeLoop = () => {
            if (!isScanning || !videoRef.current) return;

            zxingReader?.decodeFromVideoElement(videoRef.current)
              .then((result) => {
                if (result && result.getText()) {
                  handleSuccess(result.getText());
                }
                setTimeout(decodeLoop, 200); // Баъди ёфтан боз идома медиҳад
              })
              .catch(() => {
                setTimeout(decodeLoop, 250); // Наёфт, идома медиҳад
              });
          };

          decodeLoop();
        } catch (err) {
          console.error("iPhone camera error:", err);
          if (onScanFailureRef.current) onScanFailureRef.current(err);
        }
      };
      
      // Сабр мекунем то video render шавад
      setTimeout(startZxingCamera, 100);
    }

    return () => {
      isScanning = false;
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    try {
      // Истифода аз zxingReader агар бошад (айфон), вагарна сохтани нав
      let reader = zxingReaderRef.current;
      if (!reader) {
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [1]);
        hints.set(DecodeHintType.TRY_HARDER, true);
        reader = new BrowserMultiFormatReader(hints);
      }
      
      const fileUrl = URL.createObjectURL(file);
      const result = await reader.decodeFromImageUrl(fileUrl);
      
      const text = result.getText().trim();
      if (text && text.length >= 8) {
        if (onScanSuccessRef.current) onScanSuccessRef.current(text);
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
    <div className="w-full max-w-sm mx-auto overflow-hidden rounded-xl bg-black flex flex-col gap-4 pb-4 relative">
      
      {/* Container барои камера */}
      <div className="w-full relative bg-black flex items-center justify-center" style={{ minHeight: '250px' }}>
        
        {/* Ҳамеша reader-ро render мекунем, то ки дар вақти initialize ёфт шавад */}
        <div 
          id="reader" 
          className="w-full h-full" 
          style={{ display: engine === 'html5' || engine === null ? 'block' : 'none' }}
        ></div>

        <video 
          ref={videoRef} 
          className="w-full h-full object-cover" 
          style={{ 
            minHeight: '250px', 
            maxHeight: '450px',
            display: engine === 'zxing' ? 'block' : 'none' 
          }}
          muted
          playsInline
        />

        {engine === 'zxing' && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
            <div className="w-[90%] h-[150px] border-2 border-white/50 rounded-lg relative">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
              {/* Хатти сурхи сканер */}
              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-red-500 shadow-[0_0_8px_red] animate-pulse"></div>
            </div>
          </div>
        )}
      </div>
      
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
