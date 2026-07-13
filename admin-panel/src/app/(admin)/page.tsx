"use client";

import { Package, Users, ArrowUpRight, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";

interface ActivityItem {
  trackCode: string;
  message: string;
  time: string;
}

interface StatsData {
  totalParcels: number;
  totalUsers: number;
  inTransit: number;
  expected: number;
  trends: {
    parcels: string;
    users: string;
    expected: string;
    inTransit: string;
  };
  chartData: { name: string; parcels: number }[];
  recentActivity: ActivityItem[];
}

export default function Dashboard() {
  const [statsData, setStatsData] = useState<StatsData>({
    totalParcels: 0,
    totalUsers: 0,
    inTransit: 0,
    expected: 0,
    trends: { parcels: "0%", users: "0%", expected: "0%", inTransit: "0%" },
    chartData: [],
    recentActivity: []
  });

  useEffect(() => {
    fetch("/api/stats")
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setStatsData(data);
        }
      });
  }, []);

  const stats = [
    { title: "Борҳои умумӣ", value: statsData.totalParcels.toString(), icon: Package, trend: statsData.trends.parcels, color: "blue" },
    { title: "Мизоҷон", value: statsData.totalUsers.toString(), icon: Users, trend: statsData.trends.users, color: "green" },
    { title: "Мунтазири қабул", value: statsData.expected.toString(), icon: Activity, trend: statsData.trends.expected, color: "orange" },
    { title: "Дар роҳ", value: statsData.inTransit.toString(), icon: Package, trend: statsData.trends.inTransit, color: "purple" },
  ];

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diffMins < 60) return `${diffMins} дақиқа пеш`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} соат пеш`;
    return d.toLocaleDateString("ru-RU");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Омор</h1>
          <p className="text-sm text-slate-500 mt-1">Хулосаи фаъолияти логистикии ширкат дар як нигоҳ.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
          Ҳисобот (Export)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.title} 
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                <stat.icon size={24} />
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stat.trend.startsWith("-") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{stat.title}</h3>
            <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">Динамикаи қабули борҳо</h2>
            <select className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-1 outline-none text-slate-600">
              <option>7 рӯзи охир</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={statsData.chartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorParcels" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                />
                <Area type="monotone" dataKey="parcels" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorParcels)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
        >
          <h2 className="text-lg font-bold text-slate-800 mb-6">Фаъолияти охирин</h2>
          <div className="space-y-6">
            {statsData.recentActivity.map((activity, i) => (
              <div key={i} className="flex gap-4">
                <div className="relative">
                  <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full z-10 relative"></div>
                  {i !== statsData.recentActivity.length - 1 && <div className="absolute top-4 left-1 w-[2px] h-12 bg-slate-100 -translate-x-1/2"></div>}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{activity.message}</p>
                  <p className="text-xs text-slate-500 mt-1">{formatTime(activity.time)}</p>
                </div>
              </div>
            ))}
            {statsData.recentActivity.length === 0 && (
              <p className="text-sm text-slate-500">Ягон фаъолият ёфт нашуд.</p>
            )}
          </div>
          <button className="w-full mt-6 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1">
            Ҳамаро дидан <ArrowUpRight size={16} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
