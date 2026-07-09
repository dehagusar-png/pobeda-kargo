"use client";

import { Save, Bell, Globe, Lock, User, Truck } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Танзимот (Settings)</h1>
        <p className="text-sm text-slate-500 mt-1">Идоракунии танзимоти асосии система ва профил.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-blue-200 text-blue-700 rounded-xl font-medium shadow-sm transition-colors">
            <User size={18} /> Профили Ман
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-transparent text-slate-600 hover:bg-white hover:shadow-sm rounded-xl font-medium transition-all">
            <Truck size={18} /> Танзимоти Логистика
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-transparent text-slate-600 hover:bg-white hover:shadow-sm rounded-xl font-medium transition-all">
            <Bell size={18} /> Огоҳиномаҳо (Notifications)
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-transparent text-slate-600 hover:bg-white hover:shadow-sm rounded-xl font-medium transition-all">
            <Lock size={18} /> Амният ва Рамз
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-transparent text-slate-600 hover:bg-white hover:shadow-sm rounded-xl font-medium transition-all">
            <Globe size={18} /> Забони Система
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Маълумоти Профил</h2>
              <p className="text-sm text-slate-500">Маълумоти шахсии худро тағйир диҳед.</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Ном</label>
                  <input type="text" defaultValue="Администратор" className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Насаб</label>
                  <input type="text" defaultValue="Победа" className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Почтаи электронӣ (Email)</label>
                <input type="email" defaultValue="admin@pobedakargo.tj" className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Рақами телефон</label>
                <input type="text" defaultValue="+992 90 000 00 00" className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Танзимоти Нархгузорӣ (Логистика)</h2>
              <p className="text-sm text-slate-500">Нархи 1 кг ва 1 кубро муқаррар кунед (ин ба ҳисобкунаки бот таъсир мерасонад).</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Нарх барои 1 кг ($)</label>
                  <input type="number" defaultValue="4.5" className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Нарх барои 1 м³ ($)</label>
                  <input type="number" defaultValue="350" className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button className="px-5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
              Бекор кардан
            </button>
            <button className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
              <Save size={16} /> Сабт кардан
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
