import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export const metadata: Metadata = {
  title: "pobedacargo1 - Admin Panel",
  description: "Системаи идоракунии логистикии Победа Карго",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-slate-50 text-slate-900 flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen w-full min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto overflow-x-hidden w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
