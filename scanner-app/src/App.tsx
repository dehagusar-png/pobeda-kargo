import { useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';
import { Package, Send, QrCode } from 'lucide-react';

const tg = WebApp as any;

function App() {
  const [data, setData] = useState<string>('');
  const [scanned, setScanned] = useState<boolean>(false);

  useEffect(() => {
    tg.ready();
    tg.expand();
  }, []);

  const startScan = () => {
    if (tg.showScanQrPopup) {
      tg.showScanQrPopup({ text: "Лутфан трек-кодро скан кунед" }, (result: string) => {
        if (result) {
          setData(result);
          setScanned(true);
          // Return true to close the popup
          return true;
        }
      });
    } else {
      // Fallback for older Telegram versions
      tg.showAlert("Версияи Телеграми шумо сканери автоматиро дастгирӣ намекунад. Лутфан Телеграмро навсозӣ кунед.");
    }
  };

  const sendToBot = () => {
    if (data) {
      tg.sendData(JSON.stringify({ trackCode: data }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-gray-50 text-gray-900" style={{ backgroundColor: 'var(--tg-theme-bg-color, #f9fafb)', color: 'var(--tg-theme-text-color, #111827)' }}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden mb-6 mt-4 border border-gray-100" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #ffffff)' }}>
        <div className="bg-blue-600 p-4 flex items-center justify-center text-white">
          <Package className="mr-2" />
          <h1 className="text-xl font-bold">Сканери Борҳо</h1>
        </div>
        
        {!scanned ? (
          <div className="p-8 flex flex-col items-center">
            <p className="text-sm mb-8 text-center" style={{ color: 'var(--tg-theme-hint-color, #6b7280)' }}>
              Барои скан кардани штрих-код ё QR-коди бор тугмаи зерро пахш кунед.
            </p>
            <button 
              onClick={startScan}
              className="w-full h-32 bg-blue-50 border-2 border-dashed border-blue-400 hover:bg-blue-100 text-blue-600 font-medium rounded-2xl flex flex-col justify-center items-center transition-colors"
            >
              <QrCode size={48} className="mb-2" />
              <span>Кушодани Сканер</span>
            </button>
          </div>
        ) : (
          <div className="p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <Package size={32} />
            </div>
            <h2 className="text-lg font-semibold mb-2">Бор ёфт шуд!</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--tg-theme-hint-color, #6b7280)' }}>Трек-коди зерин скан карда шуд:</p>
            <div className="bg-gray-100 px-4 py-3 rounded-lg font-mono text-lg font-bold text-gray-800 w-full mb-6 break-all">
              {data}
            </div>
            
            <button 
              onClick={sendToBot}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl flex justify-center items-center transition-colors shadow-md"
            >
              <Send size={18} className="mr-2" />
              Фиристодан ба Бот
            </button>
            <button 
              onClick={() => { setScanned(false); setData(''); }}
              className="mt-3 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 rounded-xl transition-colors"
            >
              Аз нав скан кардан
            </button>
          </div>
        )}
      </div>
      <p className="text-xs text-center" style={{ color: 'var(--tg-theme-hint-color, #9ca3af)' }}>Pobeda Kargo © 2026</p>
    </div>
  );
}

export default App;
