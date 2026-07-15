"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Clock, User, Activity, FileText } from "lucide-react";

type AuditLog = {
  id: number;
  adminName: string;
  action: string;
  target: string;
  details: string | null;
  createdAt: string;
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/audit-logs")
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setLogs(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Боркунӣ...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center">
          <Clock className="mr-2 text-slate-500" /> Таърихи Амалҳо (Audit Logs)
        </h1>
        <p className="text-sm text-slate-500 mt-1">Рӯйхати охирин амалҳое, ки аз тарафи Админҳо ва Суперадминҳо иҷро шудаанд.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500 uppercase tracking-wider">
                <th className="p-4 font-medium">Вақт</th>
                <th className="p-4 font-medium">Админ</th>
                <th className="p-4 font-medium">Амал</th>
                <th className="p-4 font-medium">Ҳадаф</th>
                <th className="p-4 font-medium">Тафсилот</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Ҳоло ягон таърихи амал вуҷуд надорад.
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={log.id} 
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-4 text-sm text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("tg-TJ")}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                          {log.adminName.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-700">{log.adminName}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                        <Activity size={12} /> {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-700">
                      {log.target}
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      {log.details || "-"}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
