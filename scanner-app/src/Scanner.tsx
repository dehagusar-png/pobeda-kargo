import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
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
  
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isScanningRef = useRef(false);
  const isStartingRef = useRef(false);

  // CODE_39 боз фаъол шуд, вале бо "Филтри ҳушманд" назорат карда мешавад.
  const supportedFormats = [
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.CODE_39
  ];

  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
    onScanFailureRef.current = onScanFailure;
  }, [onScanSuccess, onScanFailure]);

  const handleSuccess = (decodedText: string, decodedResult?: any) => {
    if (!isScanningRef.current || !onScanSuccessRef.current) return;
    
    // Тоза кардани фосила ва ситорачаҳо
    const finalCode = decodedText.trim().replace(/[\s*]+/g, '');
    
    // Филтри Ҳушманд барои CODE_39
    const formatName = decodedResult?.result?.format?.formatName;
    if (formatName === "CODE_39") {
      // Агар формат CODE_39 бошад, он бояд ҳадди ақал як ҳарф дошта бошад (масалан JT...).
      // Агар фақат рақам бошад, ин 100% галлютсинатсияи сканер аз CODE_128 аст.
      const hasLetters = /[A-Za-z]/.test(finalCode);
      if (!hasLetters) {
        return; // Ин натиҷаи хаторо партофта, кори сканерро давом медиҳем.
      }
    }
    
    // Трек-код бояд танҳо аз ҳарфу рақам иборат бошад ва дарозиаш аз 5 зиёд бошад
    const isValidTracking = /^[A-Za-z0-9]+$/.test(finalCode) && finalCode.length >= 5;
    
    if (isValidTracking) {
      onScanSuccessRef.current(finalCode);
    }
  };

  const startCamera = async () => {
    if (isStartingRef.current) return;
    
    try {
      isStartingRef.current = true;
      
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
      }
      
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

      const config: any = {
        fps: 15,
        qrbox: (videoWidth: number, _videoHeight: number) => {
          // Монанди сканери лазерӣ: паҳноиаш калон, баландиаш хеле хурд
          const width = Math.min(videoWidth * 0.9, 350);
          return { width: width, height: 60 }; 
        },
        aspectRatio: window.innerWidth / window.innerHeight,
      };

      if (isIOS) {
        config.videoConstraints = { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } };
      }

      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode("reader", { 
          verbose: false,
          useBarCodeDetectorIfSupported: true,
          formatsToSupport: supportedFormats
        });
      }

      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        config,
        handleSuccess,
        () => {} // ignore normal errors
      );
      
      isScanningRef.current = true;
    } catch (err) {
      console.error("Camera start error:", err);
    } finally {
      isStartingRef.current = false;
    }
  };

  useEffect(() => {
    startCamera();

    return () => {
      isScanningRef.current = false;
      if (html5QrCodeRef.current) {
        try {
          if (html5QrCodeRef.current.isScanning) {
            html5QrCodeRef.current.stop().catch(console.error);
          } else {
            html5QrCodeRef.current.clear();
          }
        } catch {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingFile(true);
      
      const fileScanner = new Html5Qrcode("file-reader", {
        verbose: false,
        useBarCodeDetectorIfSupported: true,
        formatsToSupport: supportedFormats
      });
      
      const result = await fileScanner.scanFile(file, true);
      
      if (onScanSuccessRef.current && result) {
        const finalCode = result.trim().replace(/[\s*]+/g, '');
        const isValidTracking = /^[A-Za-z0-9]+$/.test(finalCode) && finalCode.length >= 8;
        
        if (isValidTracking) {
          onScanSuccessRef.current(finalCode);
        } else {
          alert("Ин штрих-коди дуруст барои трек-код нест (дарозиаш кам ё аломатҳои номафҳум дорад).");
        }
      }
      
      fileScanner.clear();
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
      
      <div className="w-full relative bg-black flex flex-col" style={{ minHeight: '300px' }}>
        
        {/* Маслиҳат барои Айфон */}
        <div className="absolute top-2 left-0 right-0 z-10 text-center px-4">
          <div className="bg-black/60 text-white text-xs px-3 py-2 rounded-lg backdrop-blur-sm border border-white/20">
            Камера хира аст? Телефонро <b>дуртар (15-20 см)</b> гиред!
          </div>
        </div>

        <div className="relative w-full mt-2">
          <div id="reader" className="w-full"></div>
          {/* Хатти сурхи сканери лазерӣ */}
          <div className="absolute top-1/2 left-[10%] right-[10%] h-[2px] bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)] z-20 pointer-events-none animate-pulse"></div>
          <p className="absolute top-[55%] left-0 right-0 text-center text-red-100 text-[11px] font-bold z-20 pointer-events-none drop-shadow-md uppercase tracking-wider">
            Хатро ба болои трек-код рост кунед
          </p>
        </div>
        {/* Сканери пинҳонӣ барои хондани расмҳо */}
        <div id="file-reader" style={{ display: 'none' }}></div>
      </div>

      <div className="px-4 flex flex-col gap-4">
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <p className="text-slate-300 text-sm mb-3">
            Агар зинда нахонад, бо камераи телефон расми тоза гиред ва инҷо бор кунед:
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
                  <span>Расми тоза бор кардан</span>
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
