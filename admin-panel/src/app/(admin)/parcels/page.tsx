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

  useEffect(() => {
    fetch("/api/parcels")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setParcels(data);
        }
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Борҳо (Parcels)</h1>
          <p className="text-sm text-slate-500 mt-1">Идоракунии борҳои мизоҷон ва тағйири статусҳо.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
            <FileDown size={16} /> Экспорт
          </button>
          <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
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

        <div className="overflow-x-hidden md:overflow-x-auto p-4 md:p-0">
          <table className="w-full text-left border-collapse block md:table">
            <thead className="hidden md:table-header-group">
              <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500">
                <th className="py-4 px-6 font-medium">Трек-код</th>
                <th className="py-4 px-6 font-medium">Мизоҷ</th>
                <th className="py-4 px-6 font-medium">Вазн</th>
                <th className="py-4 px-6 font-medium">Сана</th>
                <th className="py-4 px-6 font-medium">Ҳолат (Status)</th>
                <th className="py-4 px-6 font-medium text-right">Амалҳо</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 block md:table-row-group">
              {loading ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate-500 block md:table-cell">Боркунӣ...</td></tr>
              ) : parcels.filter(p => p.track.includes(searchTerm)).map((parcel) => (
                <tr key={parcel.id} className="hover:bg-slate-50 transition-colors block md:table-row bg-white border border-slate-100 rounded-xl mb-4 md:mb-0 md:border-none p-4 md:p-0 shadow-sm md:shadow-none">
                  <td className="py-2 md:py-4 md:px-6 font-mono font-medium text-slate-900 block md:table-cell border-b border-slate-100 md:border-none">
                    <span className="md:hidden text-slate-500 mr-2 text-sm">Трек-код:</span>
                    {parcel.track}
                  </td>
                  <td className="py-2 md:py-4 md:px-6 block md:table-cell border-b border-slate-100 md:border-none">
                    <span className="md:hidden text-slate-500 mr-2 text-sm">Мизоҷ:</span>
                    <span className="bg-red-50 text-red-700 px-2 py-1 rounded text-xs font-semibold">{parcel.client}</span>
                  </td>
                  <td className="py-2 md:py-4 md:px-6 text-sm text-slate-600 block md:table-cell border-b border-slate-100 md:border-none">
                    <span className="md:hidden text-slate-500 mr-2">Вазн:</span>
                    {parcel.weight}
                  </td>
                  <td className="py-2 md:py-4 md:px-6 text-sm text-slate-500 block md:table-cell border-b border-slate-100 md:border-none">
                    <span className="md:hidden text-slate-500 mr-2">Сана:</span>
                    {parcel.date}
                  </td>
                  <td className="py-2 md:py-4 md:px-6 block md:table-cell border-b border-slate-100 md:border-none">
                    <span className="md:hidden text-slate-500 mr-2 text-sm">Ҳолат:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[parcel.status] || "bg-gray-100"}`}>
                      {statusLabels[parcel.status] || parcel.status}
                    </span>
                  </td>
                  <td className="py-2 md:py-4 md:px-6 md:text-right block md:table-cell">
                    <button className="w-full md:w-auto p-2 bg-slate-50 text-slate-600 md:bg-transparent md:text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex justify-center items-center">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-200 text-sm text-slate-500 flex justify-between items-center">
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
