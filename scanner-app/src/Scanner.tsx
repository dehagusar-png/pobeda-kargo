import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Camera, RefreshCw } from 'lucide-react';

interface ScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: any) => void;
}

const Scanner = ({ onScanSuccess, onScanFailure }: ScannerProps) => {
  const onScanSuccessRef = useRef(onScanSuccess);
  const onScanFailureRef = useRef(onScanFailure);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  
  // Барои иваз кардани камераҳо
  const [cameras, setCameras] = useState<{id: string, label: string}[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState<number>(0);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isScanningRef = useRef(false);

  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
    onScanFailureRef.current = onScanFailure;
  }, [onScanSuccess, onScanFailure]);

  const handleSuccess = (decodedText: string) => {
    if (!isScanningRef.current || !onScanSuccessRef.current) return;
    
    const cleanedText = decodedText.trim();
    const isValidTracking = /^[A-Za-z0-9\-]+$/.test(cleanedText) && cleanedText.length >= 6;
    
    if (isValidTracking) {
      onScanSuccessRef.current(cleanedText);
    }
  };

  const startCamera = async (cameraId?: string) => {
    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
      }
      
      const config = {
        fps: 15,
        qrbox: (videoWidth: number, _videoHeight: number) => {
          const width = Math.min(videoWidth * 0.9, 450);
          return { width: width, height: 150 };
        },
        aspectRatio: window.innerWidth / window.innerHeight,
      };

      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode("reader", { 
          verbose: false,
          useBarCodeDetectorIfSupported: true 
        });
      }

      if (cameraId) {
        await html5QrCodeRef.current.start(
          cameraId,
          config,
          handleSuccess,
          () => {} // ignore normal errors
        );
      } else {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        const videoConstraints: any = { facingMode: "environment" };
        
        if (isIOS) {
          // Барои Айфон сифати баландтар мепурсем то ки хира нашавад
          videoConstraints.width = { ideal: 1280 };
          videoConstraints.height = { ideal: 720 };
        }

        await html5QrCodeRef.current.start(
          videoConstraints,
          config,
          handleSuccess,
          () => {} // ignore normal errors
        );
      }
      isScanningRef.current = true;
    } catch (err) {
      console.error("Camera start error:", err);
    }
  };

  useEffect(() => {
    // Пайдо кардани ҳамаи камераҳо ҳангоми кушодан
    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length > 0) {
        // Фақат камераҳои қафоро ҷудо мекунем (агар имкон бошад)
        const backCameras = devices.filter(c => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('environment'));
        const availableCameras = backCameras.length > 0 ? backCameras : devices;
        setCameras(availableCameras);
      }
    }).catch(console.error);

    startCamera();

    return () => {
      isScanningRef.current = false;
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const switchCamera = () => {
    if (cameras.length <= 1) return;
    const nextIndex = (currentCameraIndex + 1) % cameras.length;
    setCurrentCameraIndex(nextIndex);
    startCamera(cameras[nextIndex].id);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingFile(true);
      
      // Барои файлҳо мо ZXing истифода мебарем, чунки Html5Qrcode бо reader id мушкил мекунад
      const reader = new BrowserMultiFormatReader();
      const imageUrl = URL.createObjectURL(file);
      const result = await reader.decodeFromImageUrl(imageUrl);
      URL.revokeObjectURL(imageUrl);
      
      if (onScanSuccessRef.current && result) {
        const cleanedText = result.getText().trim();
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
      
      <div className="w-full relative bg-black flex flex-col" style={{ minHeight: '300px' }}>
        
        {/* Маслиҳат барои Айфон */}
        <div className="absolute top-2 left-0 right-0 z-10 text-center px-4">
          <div className="bg-black/60 text-white text-xs px-3 py-2 rounded-lg backdrop-blur-sm border border-white/20">
            Камера хира аст? Телефонро <b>дуртар (15-20 см)</b> гиред!
          </div>
        </div>

        {/* Тугмаи Ивази Камера */}
        {cameras.length > 1 && (
          <button 
            onClick={switchCamera}
            className="absolute bottom-4 right-4 z-10 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-95"
            title="Иваз кардани камера"
          >
            <RefreshCw className="w-6 h-6" />
          </button>
        )}

        <div id="reader" className="w-full mt-2"></div>
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
