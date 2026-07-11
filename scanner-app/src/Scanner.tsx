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
    
    // Танзимоти сканер барои хондани танҳо форматҳои асосии трек-код
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.QR_CODE
    ]);

    const codeReader = new BrowserMultiFormatReader(hints);
    let isScanning = true;

    codeReader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
      if (!isScanning) return;
      if (result) {
        const text = result.getText();
        // Трек-кодҳо одатан дароз ҳастанд. Кодҳои аз 8 рамз кӯтоҳро нодида мегирем, 
        // то ки хатогиҳо (штрих-кодҳои ёрирасон ё хониши хато) пешгирӣ шаванд.
        if (text.length >= 8) {
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
