import { useState, useEffect } from 'react';
import { Package, QrCode, X, CheckCircle, AlertCircle } from 'lucide-react';
import Scanner from './Scanner';

const tg = (window as any).Telegram?.WebApp || {};

function App() {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [logs, setLogs] = useState<{id: number, text: string, type: 'success'|'error'}[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    if (tg.ready) {
      tg.ready();
      tg.expand();
    }
  }, []);

  const playBeep = () => {
    try {
      // Кӯтоҳ садои бип ҳангоми скан кардан
      const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Audio play failed:', e));
    } catch {}
  };

  const addLog = (text: string, type: 'success'|'error') => {
    const id = Date.now();
    setLogs(prev => [{id, text, type}, ...prev].slice(0, 5)); // Keep only last 5 logs
  };

  const handleScanSuccess = async (decodedText: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    playBeep();
    
    // Telegram ID-и корбар аз WebApp
    const telegramId = tg.initDataUnsafe?.user?.id;
    
    try {
      addLog(`Фиристода истодааст: ${decodedText}...`, 'success');
      
      const response = await fetch('https://pobeda-admin-panel.onrender.com/api/parcels/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trackCode: decodedText,
          telegramId: telegramId || '0' // Агар берун аз ТГ бошад, барои тест 0 меравад (вале хатогӣ медиҳад)
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        addLog(`✅ ${decodedText} - ${result.message}`, 'success');
      } else {
        addLog(`❌ ${decodedText} - ${result.error || 'Хатогӣ'}`, 'error');
      }
    } catch {
      addLog(`❌ ${decodedText} - Хатогии шабака`, 'error');
    } finally {
      // Худи ҳамон лаҳза барои коди навбатӣ омода мешавад
      setTimeout(() => setIsProcessing(false), 500); 
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-gray-50 text-gray-900" style={{ backgroundColor: 'var(--tg-theme-bg-color, #f9fafb)', color: 'var(--tg-theme-text-color, #111827)' }}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden mb-6 mt-4 border border-gray-100" style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color, #ffffff)' }}>
        <div className="bg-blue-600 p-4 flex items-center justify-between text-white">
          <div className="flex items-center">
            <Package className="mr-2" />
            <h1 className="text-xl font-bold">Сканери Борҳо (Автоматӣ)</h1>
          </div>
          {isScanning && (
            <button onClick={() => setIsScanning(false)} className="text-white hover:text-gray-200">
              <X size={24} />
            </button>
          )}
        </div>
        
        {isScanning ? (
          <div className="p-4 flex flex-col">
            <p className="text-sm mb-4 text-center text-gray-600">
              Камераро ба сӯи штрих-код равона кунед. <br/>
              <b>Сканер ба таври худкор пуштиҳам кор мекунад!</b>
            </p>
            
            <div className="relative">
              <Scanner onScanSuccess={handleScanSuccess} />
              
              {/* Нишондиҳандаи ҳолат дар болои камера */}
              {isProcessing && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 backdrop-blur-sm rounded-xl">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                </div>
              )}
            </div>

            {/* Рӯйхати борҳои охирин сканшуда */}
            <div className="mt-4 flex-1">
              <h3 className="text-sm font-bold text-gray-700 mb-2">Натиҷаҳо:</h3>
              <div className="space-y-2 max-h-[150px] overflow-y-auto">
                {logs.length === 0 && <p className="text-xs text-gray-400 text-center py-2">Ҳоло ҳеҷ чиз скан нашудааст</p>}
                {logs.map(log => (
                  <div key={log.id} className={`p-2 rounded border text-xs font-medium flex items-start gap-2 ${log.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    {log.type === 'success' ? <CheckCircle size={14} className="mt-0.5 shrink-0" /> : <AlertCircle size={14} className="mt-0.5 shrink-0" />}
                    <span>{log.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setIsScanning(false)}
              className="mt-4 w-full bg-red-100 hover:bg-red-200 text-red-700 font-medium py-3 rounded-xl transition-colors"
            >
              Пӯшидани Сканер
            </button>
          </div>
        ) : (
          <div className="p-8 flex flex-col items-center">
            <p className="text-sm mb-8 text-center" style={{ color: 'var(--tg-theme-hint-color, #6b7280)' }}>
              Барои пайдарпай скан кардани штрих-кодҳо тугмаи зерро пахш кунед. Маълумот худкор ба сервер меравад.
            </p>
            <button 
              onClick={() => setIsScanning(true)}
              className="w-full h-32 bg-blue-50 border-2 border-dashed border-blue-400 hover:bg-blue-100 text-blue-600 font-medium rounded-2xl flex flex-col justify-center items-center transition-colors"
            >
              <QrCode size={48} className="mb-2" />
              <span>Кушодани Сканери Автоматӣ</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
