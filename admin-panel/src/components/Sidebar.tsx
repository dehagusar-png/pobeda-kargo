"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Users, Settings, ShoppingBag, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { name: "Омор", href: "/", icon: LayoutDashboard },
  { name: "Борҳо (Parcels)", href: "/parcels", icon: Package },
  { name: "Мизоҷон (Users)", href: "/users", icon: Users },
  { name: "Мағоза (Store)", href: "/products", icon: ShoppingBag },
  { name: "Фармоишҳо (Orders)", href: "/orders", icon: ShoppingCart },
  { name: "Танзимот", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 h-screen text-slate-300 flex flex-col shadow-2xl z-20 hidden md:flex sticky top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Package className="text-red-500" />
          <span>pobedacargo1</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Панели Маъмурият</p>
      </div>

      <nav className="flex-1 mt-6 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="block relative">
              {isActive && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute inset-0 bg-red-600 rounded-lg"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "text-white font-medium" : "hover:bg-slate-800 hover:text-white"}`}>
                <item.icon size={20} />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 text-center">
        <p className="text-xs text-slate-500">Системаи стандарти ҷаҳонӣ</p>
      </div>
    </aside>
  );
}
