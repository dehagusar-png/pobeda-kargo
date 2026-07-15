"use client";

import { signIn, getSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

export default function LoginPage() {
  const [telegramId, setTelegramId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [debugMsg, setDebugMsg] = useState("Оғози тафтиш...");
  const router = useRouter();

  useEffect(() => {
    const checkTelegramAuth = async () => {
      // First, check if already logged in via NextAuth session
      const session = await getSession();
      if (session?.user) {
        setDebugMsg("Шумо аллакай ворид шудаед!");
        router.push("/");
        return;
      }

      if (typeof window !== "undefined") {
        const tg = (window as any).Telegram?.WebApp;
        if (!tg) {
          setDebugMsg("Хатогӣ: Телеграм ёфт нашуд.");
          setLoading(false);
          return;
        }

        let initData = tg.initData;
        
        // Recover from sessionStorage if Next.js stripped the hash
        if (!initData) {
          const storedHash = sessionStorage.getItem("tgWebAppData");
          if (storedHash) {
            const params = new URLSearchParams(storedHash.replace("#", ""));
            initData = params.get("tgWebAppData") || "";
          }
        }

        if (!initData) {
          setDebugMsg("Хатогӣ: initData холӣ аст. (Аз тугмаи WebApp кушоед)");
          setLoading(false);
          return;
        }

        setDebugMsg("Маълумот ёфт шуд. Дар ҳоли воридшавӣ...");
        try {
          const res = await signIn("credentials", {
            initData,
            redirect: false,
          });
          
          if (res?.error) {
            setError("Хатогии сервер: " + res.error);
            setDebugMsg("Вуруд қатъ шуд.");
            setLoading(false);
          } else {
            setDebugMsg("Вуруд бомуваффақият!");
            router.push("/");
          }
        } catch (e: any) {
          setError("Хатогии система: " + e.message);
          setLoading(false);
        }
      }
    };

    setTimeout(checkTelegramAuth, 500);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      telegramId,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError(res?.error);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Вуруд ба Админ-Панел</h1>
          <p className="text-slate-500 mt-2">Барои идома додан Telegram ID ва паролро ворид кунед.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        {/* Debug Message */}
        <div className="text-center text-xs text-slate-400 mb-4">
          Система: {debugMsg}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Telegram ID</label>
            <input
              type="text"
              required
              value={telegramId}
              onChange={(e) => setTelegramId(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="123456789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Парол</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Дар ҳоли санҷиш..." : "Даромад"}
          </button>
        </form>
      </div>
    </div>
  );
}
