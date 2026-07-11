import { useEffect, useRef } from 'react';
import { BrowserMultiFormatReader, NotFoundException, BarcodeFormat, DecodeHintType } from '@zxing/library';

interface ScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: any) => void;
}

const Scanner = ({ onScanSuccess, onScanFailure }: ScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (!videoRef.current) return;
    
    // Танзимоти сканер: Мо форматҳоро маҳдуд мекунем, то ки "хонишҳои хато"-и кӯтоҳ (ба мисли ITF) пешгирӣ шавад.
    // Штрих-кодҳои Чин одатан Code 128 мебошанд.
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.QR_CODE,
      BarcodeFormat.EAN_13,
    ]);
    const codeReader = new BrowserMultiFormatReader(hints);
    let isScanning = true;

    codeReader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
      if (!isScanning) return;
      if (result) {
        const text = result.getText().trim();
        // Штрих-кодҳои Чин одатан зиёда аз 10 рақам доранд (масалан 15 ё 20). 
        // Рақамҳои кӯтоҳ (5-6 рақама) ин хатогии хониши камера (хаёлоти сканер) мебошанд!
        if (text && text.length >= 8) {
          onScanSuccess(text);
          isScanning = false;
          codeReader.reset();
        }
      }
      if (err && !(err instanceof NotFoundException)) {
        if (onScanFailure) {
          onScanFailure(err);
        }
      }
    }).catch(err => {
      console.error("Camera error:", err);
      if (onScanFailure) onScanFailure(err);
    });

    return () => {
      isScanning = false;
      codeReader.reset();
    };
  }, [onScanSuccess, onScanFailure]);

  return (
    <div className="w-full max-w-sm mx-auto overflow-hidden rounded-xl bg-black relative flex items-center justify-center" style={{ minHeight: '250px' }}>
      <video 
        ref={videoRef} 
        className="w-full h-full object-cover absolute inset-0" 
        autoPlay 
        playsInline 
        muted 
      />
      <div className="absolute inset-0 border-2 border-dashed border-blue-400 m-8 rounded-lg pointer-events-none shadow-[0_0_0_4000px_rgba(0,0,0,0.5)] z-10"></div>
    </div>
  );
};

export default Scanner;
