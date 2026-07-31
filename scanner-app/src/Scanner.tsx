import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, DecodeHintType } from '@zxing/library';

interface ScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: any) => void;
}

const Scanner = ({ onScanSuccess, onScanFailure }: ScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  
  const onScanSuccessRef = useRef(onScanSuccess);
  const onScanFailureRef = useRef(onScanFailure);

  const [hasCamera, setHasCamera] = useState(true);

  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
    onScanFailureRef.current = onScanFailure;
  }, [onScanSuccess, onScanFailure]);

  useEffect(() => {
    let isScanning = true;
    let lastScannedCode = "";
    let lastScanTime = 0;

    // Танзимоти махсус барои iPhone ва штрих-кодҳои чинӣ (Code 128)
    const hints = new Map();
    // 1 = CODE_128, 2 = CODE_39, 3 = EAN_13, 11 = QR_CODE (дар @zxing/library BarcodeFormat enum)
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      1, // CODE_128
      2, // CODE_39
      11 // QR_CODE
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);

    const codeReader = new BrowserMultiFormatReader(hints);
    readerRef.current = codeReader;

    const startCamera = async () => {
      try {
        if (!videoRef.current) return;
        
        // Кӯшиши кушодани камера бо сифати баландтарин (барои iPhone)
        const constraints = {
          video: {
            facingMode: 'environment',
            width: { min: 1280, ideal: 1920, max: 2560 },
            height: { min: 720, ideal: 1080, max: 1440 },
            focusMode: 'continuous'
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (!isScanning || !videoRef.current) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true"); // Муҳим барои iOS Safari
        videoRef.current.play();

        const decodeLoop = () => {
          if (!isScanning || !videoRef.current) return;

          codeReader.decodeFromVideoElement(videoRef.current)
            .then((result) => {
              if (result && result.getText()) {
                const text = result.getText().trim();
                
                if (text && text.length >= 8) {
                  const now = Date.now();
                  if (text === lastScannedCode && (now - lastScanTime) < 3000) {
                    // Рад кардани такрор
                  } else {
                    lastScannedCode = text;
                    lastScanTime = now;
                    if (onScanSuccessRef.current) {
                      onScanSuccessRef.current(text);
                    }
                  }
                }
              }
              // Давом додани ҷустуҷӯ
              setTimeout(decodeLoop, 200);
            })
            .catch((err) => {
              // Хатогиҳои NotFoundException-ро сарфи назар мекунем (вақте ки код нест)
              setTimeout(decodeLoop, 300);
            });
        };

        // Оғози сикли хониш
        decodeLoop();

      } catch (err) {
        console.error("Camera access error:", err);
        setHasCamera(false);
        if (onScanFailureRef.current) onScanFailureRef.current(err);
      }
    };

    startCamera();

    return () => {
      isScanning = false;
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="w-full max-w-sm mx-auto overflow-hidden rounded-xl bg-black relative">
      {!hasCamera ? (
        <div className="p-8 text-center text-red-500">
          Камера дастрас нест ё иҷозат дода нашудааст.
        </div>
      ) : (
        <>
          <video 
            ref={videoRef} 
            className="w-full h-full object-cover" 
            style={{ minHeight: '300px', maxHeight: '500px' }}
            muted
            playsInline
          />
          {/* Чорчӯбаи сканер барои роҳнамоии корбар */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[90%] h-[150px] border-2 border-white/50 rounded-lg relative">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
              {/* Хатти сурхи сканер */}
              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-red-500 shadow-[0_0_8px_red] animate-pulse"></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Scanner;
