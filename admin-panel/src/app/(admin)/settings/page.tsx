"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Settings, Plus, Trash2, Save } from "lucide-react";

type Tier = { min: number; max: number; price: number };

interface CityConfig {
  weightTiers: Tier[];
  volumeTiers: Tier[];
}

interface Config {
  dushanbe: CityConfig;
  panjakent: CityConfig;
}

export default function SettingsPage() {
  const [config, setConfig] = useState<Config>({ 
    dushanbe: { weightTiers: [], volumeTiers: [] }, 
    panjakent: { weightTiers: [], volumeTiers: [] } 
  });
  const [activeCity, setActiveCity] = useState<'dushanbe' | 'panjakent'>('dushanbe');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    const pin = prompt("ПИН-КОД-и Суперадминро ворид кунед то ки танзимотро сабт кунед:");
    if (!pin) return;

    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin, config }),
    });

    if (res.ok) {
      alert("Танзимот бомуваффақият сабт шуд!");
    } else {
      const data = await res.json();
      if (data.error === "PIN_REQUIRED") {
        alert("ПИН-КОД нодуруст аст!");
      } else {
        alert("Хатогӣ ҳангоми сабти танзимот!");
      }
    }
  };

  const addTier = (type: 'weightTiers' | 'volumeTiers') => {
    const newTier = { min: 0, max: 999999, price: 0 };
    setConfig({
      ...config,
      [activeCity]: {
        ...config[activeCity],
        [type]: [...config[activeCity][type], newTier]
      }
    });
  };

  const updateTier = (type: 'weightTiers' | 'volumeTiers', index: number, field: string, value: number) => {
    const newTiers = [...config[activeCity][type]];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setConfig({
      ...config,
      [activeCity]: {
        ...config[activeCity],
        [type]: newTiers
      }
    });
  };

  const removeTier = (type: 'weightTiers' | 'volumeTiers', index: number) => {
    const newTiers = config[activeCity][type].filter((_: any, i: number) => i !== index);
    setConfig({
      ...config,
      [activeCity]: {
        ...config[activeCity],
        [type]: newTiers
      }
    });
  };

  if (loading) return <div>Боркунӣ...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <Settings className="mr-2 text-slate-500" /> Танзимоти Нарх (Зинаҳо)
          </h1>
          <p className="text-sm text-slate-500 mt-1">Танзими нархҳо барои вазн ва ҳаҷми бор. Фақат барои Суперадмин.</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center"
        >
          <Save size={16} className="mr-2" /> Сабт Кардан
        </button>
      </div>

      {/* Tabs for cities */}
      <div className="flex border-b border-slate-200 gap-4 mb-6">
        <button
          onClick={() => setActiveCity('dushanbe')}
          className={`pb-2 px-2 text-sm font-medium transition-colors border-b-2 ${activeCity === 'dushanbe' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          📍 Душанбе
        </button>
        <button
          onClick={() => setActiveCity('panjakent')}
          className={`pb-2 px-2 text-sm font-medium transition-colors border-b-2 ${activeCity === 'panjakent' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          📍 Панҷакент
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Tiers */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800">⚖️ Зинаҳои Вазн (Кг)</h2>
            <button onClick={() => addTier('weightTiers')} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors">
              <Plus size={18} />
            </button>
          </div>
          
          <div className="space-y-3">
            {config[activeCity].weightTiers.map((tier: any, i: number) => (
              <div key={i} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-sm text-slate-500">Аз</span>
                  <input type="number" value={tier.min} onChange={(e) => updateTier('weightTiers', i, 'min', Number(e.target.value))} className="w-16 px-2 py-1 text-sm border rounded" />
                  <span className="text-sm text-slate-500">То</span>
                  <input type="number" value={tier.max} onChange={(e) => updateTier('weightTiers', i, 'max', Number(e.target.value))} className="w-20 px-2 py-1 text-sm border rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-700">$</span>
                  <input type="number" value={tier.price} step="0.1" onChange={(e) => updateTier('weightTiers', i, 'price', Number(e.target.value))} className="w-16 px-2 py-1 text-sm border rounded border-green-300 focus:ring-green-500 font-bold text-green-700" />
                </div>
                <button onClick={() => removeTier('weightTiers', i)} className="text-red-400 hover:text-red-600 p-1">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Volume Tiers */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800">📦 Зинаҳои Ҳаҷм (Куб / М³)</h2>
            <button onClick={() => addTier('volumeTiers')} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors">
              <Plus size={18} />
            </button>
          </div>
          
          <div className="space-y-3">
            {config[activeCity].volumeTiers.map((tier: any, i: number) => (
              <div key={i} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-sm text-slate-500">Аз</span>
                  <input type="number" value={tier.min} step="0.1" onChange={(e) => updateTier('volumeTiers', i, 'min', Number(e.target.value))} className="w-16 px-2 py-1 text-sm border rounded" />
                  <span className="text-sm text-slate-500">То</span>
                  <input type="number" value={tier.max} step="0.1" onChange={(e) => updateTier('volumeTiers', i, 'max', Number(e.target.value))} className="w-20 px-2 py-1 text-sm border rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-700">$</span>
                  <input type="number" value={tier.price} step="1" onChange={(e) => updateTier('volumeTiers', i, 'price', Number(e.target.value))} className="w-16 px-2 py-1 text-sm border rounded border-green-300 focus:ring-green-500 font-bold text-green-700" />
                </div>
                <button onClick={() => removeTier('volumeTiers', i)} className="text-red-400 hover:text-red-600 p-1">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
