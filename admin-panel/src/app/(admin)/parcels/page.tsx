"use client";

import { Search, Filter, MoreHorizontal, FileDown } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const _mockParcels = [
  { id: "1", track: "YT890123456", client: "PB-1025", status: "ARRIVED", weight: "12.5 kg", date: "2026-07-08" },
  { id: "2", track: "YT890123457", client: "PB-1025", status: "IN_TRANSIT", weight: "5.0 kg", date: "2026-07-07" },
  { id: "3", track: "YT890123458", client: "PB-1026", status: "IN_CHINA", weight: "1.2 kg", date: "2026-07-09" },
  { id: "4", track: "YT890123459", client: "PB-1027", status: "EXPECTED", weight: "-", date: "2026-07-09" },
  { id: "5", track: "YT890123460", client: "PB-1028", status: "DELIVERED", weight: "45.0 kg", date: "2026-07-05" },
];

const statusColors: any = {
  "EXPECTED": "bg-slate-100 text-slate-700",
  "IN_CHINA": "bg-yellow-100 text-yellow-700",
  "IN_TRANSIT": "bg-blue-100 text-blue-700",
  "ARRIVED": "bg-purple-100 text-purple-700",
  "DELIVERED": "bg-green-100 text-green-700",
};

const statusLabels: any = {
  "EXPECTED": "Мунтазир",
  "IN_CHINA": "Дар Чин",
  "IN_TRANSIT": "Дар роҳ",
  "ARRIVED": "Дар Душанбе",
  "DELIVERED": "Супорида шуд",
};

export default function ParcelsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [parcels, setParcels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTrackCode, setNewTrackCode] = useState("");
  const [newClientCode, setNewClientCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchParcels = () => {
    fetch("/api/parcels")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setParcels(data);
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchParcels();
  }, []);

  const handleAddParcel = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const res = await fetch("/api/parcels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackCode: newTrackCode, clientCode: newClientCode })
      });
      
      const data = await res.json();
      if (res.ok) {
        alert("Бор бомуваффақият сабт шуд ва ба мизоҷ огоҳӣ фиристода шуд!");
        setIsModalOpen(false);
        setNewTrackCode("");
        setNewClientCode("");
        fetchParcels();
      } else {
        alert(data.error || "Хатогӣ рӯй дод!");
      }
    } catch (error) {
      alert("Хатогӣ ҳангоми пайвастшавӣ ба сервер.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-slate-800 mb-4">Бори нав илова кунед</h2>
            <form onSubmit={handleAddParcel} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Трек-код</label>
                <input 
                  type="text" 
                  required
                  value={newTrackCode}
                  onChange={e => setNewTrackCode(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Масалан: YT890..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Client ID (Мизоҷ)</label>
                <input 
                  type="text" 
                  required
                  value={newClientCode}
                  onChange={e => setNewClientCode(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-red-500 uppercase"
                  placeholder="Масалан: PB-1025"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium"
                >
                  Бекор кардан
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Сабт мешавад..." : "Сабт ва Огоҳ кардан"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Борҳо (Parcels)</h1>
          <p className="text-sm text-slate-500 mt-1">Идоракунии борҳои мизоҷон ва тағйири статусҳо.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2 hidden sm:flex">
            <FileDown size={16} /> Экспорт
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            + Бори нав
          </button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Ҷустуҷӯ аз рӯи трек-код..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500 transition-shadow"
            />
          </div>
          <button className="flex items-center gap-2 text-sm text-slate-600 font-medium px-3 py-2 hover:bg-slate-200 rounded-lg transition-colors">
            <Filter size={16} /> Филтрҳо
          </button>
        </div>

        {/* Мобильная версия (Компактные карточки) */}
        <div className="md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-500 text-sm">Боркунӣ...</div>
          ) : parcels.filter(p => p.track.includes(searchTerm)).map((parcel) => (
            <div key={parcel.id} className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="font-mono font-bold text-slate-900">{parcel.track}</div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[parcel.status] || "bg-gray-100"}`}>
                  {statusLabels[parcel.status] || parcel.status}
                </span>
              </div>
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    Мизоҷ: <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-semibold">{parcel.client}</span>
                  </div>
                  <div className="text-xs text-slate-500">Вазн: <span className="font-medium text-slate-700">{parcel.weight}</span></div>
                  <div className="text-xs text-slate-500">Сана: <span className="font-medium text-slate-700">{parcel.date}</span></div>
                </div>
                <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors bg-slate-50">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>
          ))}
          {!loading && parcels.filter(p => p.track.includes(searchTerm)).length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">Боре ёфт нашуд.</div>
          )}
        </div>

        {/* Десктопная версия (Таблица) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500">
                <th className="py-4 px-6 font-medium">Трек-код</th>
                <th className="py-4 px-6 font-medium">Мизоҷ</th>
                <th className="py-4 px-6 font-medium">Вазн</th>
                <th className="py-4 px-6 font-medium">Сана</th>
                <th className="py-4 px-6 font-medium">Ҳолат (Status)</th>
                <th className="py-4 px-6 font-medium text-right">Амалҳо</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate-500">Боркунӣ...</td></tr>
              ) : parcels.filter(p => p.track.includes(searchTerm)).map((parcel) => (
                <tr key={parcel.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 font-mono font-medium text-slate-900">{parcel.track}</td>
                  <td className="py-4 px-6">
                    <span className="bg-red-50 text-red-700 px-2 py-1 rounded text-xs font-semibold">{parcel.client}</span>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">{parcel.weight}</td>
                  <td className="py-4 px-6 text-sm text-slate-500">{parcel.date}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[parcel.status] || "bg-gray-100"}`}>
                      {statusLabels[parcel.status] || parcel.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && parcels.filter(p => p.track.includes(searchTerm)).length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-slate-500">Боре ёфт нашуд.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-200 text-sm text-slate-500 flex justify-between items-center bg-white">
          <span>Намоиш аз 1 то 5 аз 5 бор</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-slate-200 rounded text-slate-400 cursor-not-allowed">Пештара</button>
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 text-slate-700">Оянда</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
