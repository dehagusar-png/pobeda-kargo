"use client";

import { Search, Mail, Phone, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const mockUsers = [
  { id: "1", clientCode: "PB-1025", name: "Сабир Махмудов", phone: "+992987654321", role: "ADMIN", language: "tg", date: "2026-07-01" },
  { id: "2", clientCode: "PB-1026", name: "Алиҷон Валиев", phone: "+992900112233", role: "USER", language: "ru", date: "2026-07-02" },
  { id: "3", clientCode: "PB-1027", name: "Фирӯз Салимов", phone: "+992888999000", role: "WORKER", language: "uz", date: "2026-07-03" },
  { id: "4", clientCode: "PB-1028", name: "Li Wei", phone: "+8613800138000", role: "USER", language: "zh", date: "2026-07-04" },
];

const roleColors: any = {
  "SUPERADMIN": "bg-purple-100 text-purple-700 border-purple-200",
  "ADMIN": "bg-red-100 text-red-700 border-red-200",
  "WORKER": "bg-blue-100 text-blue-700 border-blue-200",
  "USER": "bg-slate-100 text-slate-700 border-slate-200",
};

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUsers(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Мизоҷон (Users)</h1>
          <p className="text-sm text-slate-500 mt-1">Рӯйхати ҳамаи мизоҷон ва кормандони система.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
          + Иловаи Корманд
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Ҷустуҷӯ аз рӯи Ном, Телефон ё Client ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {loading ? (
            <div className="col-span-3 text-center py-8 text-slate-500">Боркунӣ...</div>
          ) : users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.clientCode.includes(searchTerm)).map((user) => (
            <div key={user.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 font-bold text-lg flex items-center justify-center uppercase">
                  {user.name.charAt(0)}
                </div>
                <select 
                  disabled={user.role === "SUPERADMIN"}
                  className={`px-2 py-1 border rounded text-xs font-semibold outline-none ${user.role === "SUPERADMIN" ? "cursor-not-allowed opacity-80" : "cursor-pointer"} ${roleColors[user.role] || "bg-gray-100"}`}
                  value={user.role}
                  onChange={async (e) => {
                    const newRole = e.target.value;
                    let pin = undefined;
                    
                    if (user.phone === "79801868277") {
                      const userPin = prompt("ПИН-КОД-и Суперадминро ворид кунед то ки вазифаи ин админро иваз кунед:");
                      if (userPin === null) return; // User cancelled
                      pin = userPin;
                    }
                    
                    const res = await fetch(`/api/users/${user.id}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ role: newRole, pin }),
                    });
                    
                    if (res.ok) {
                      setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
                    } else {
                      const data = await res.json();
                      if (data.error === "PIN_REQUIRED") {
                        alert("ПИН-КОД нодуруст аст!");
                      } else {
                        alert("Хатогӣ ҳангоми иваз кардани вазифа!");
                      }
                    }
                  }}
                >
                  <option value="USER">USER</option>
                  <option value="WORKER">WORKER</option>
                  <option value="ADMIN">ADMIN</option>
                  {user.role === "SUPERADMIN" && <option value="SUPERADMIN">SUPERADMIN</option>}
                </select>
              </div>
              <h3 className="font-bold text-slate-900 text-lg">{user.name}</h3>
              <p className="text-blue-600 font-mono font-medium text-sm mt-1">{user.clientCode}</p>
              
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center text-sm text-slate-600">
                  <Phone size={14} className="mr-2 text-slate-400" />
                  {user.phone}
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Shield size={14} className="mr-2 text-slate-400" />
                  Бақайдгирӣ: {user.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
