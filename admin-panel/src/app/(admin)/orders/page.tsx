/* eslint-disable @next/next/no-img-element */
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({ 
    include: { user: true, product: true },
    orderBy: { createdAt: 'desc' } 
  });

  async function updateStatus(formData: FormData) {
    "use server";
    const id = parseInt(formData.get("id") as string);
    const status = formData.get("status") as any;
    
    const order = await prisma.order.update({ 
      where: { id }, 
      data: { status },
      include: { user: true, product: true }
    });
    
    if (status === "PURCHASED" && order.user?.telegramId) {
      const botToken = process.env.BOT_TOKEN;
      if (botToken) {
        let text = `✅ <b>Фармоиши шумо тасдиқ ва харида шуд!</b>\n\n` +
                   `📦 <b>Мол:</b> ${order.product?.title || 'Моли шумо'}\n\n` +
                   `<i>Дар наздиктарин фурсат трек-коди бор ба шумо равон карда мешавад.</i>`;
        
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: order.user.telegramId.toString(),
            text: text,
            parse_mode: "HTML"
          })
        }).catch(console.error);
      }
    }

    revalidatePath("/orders");
  }

  const statusMap: Record<string, string> = {
    "PENDING": "Мунтазири баррасӣ (Pending)",
    "PURCHASED": "Харида шуд (Purchased)",
    "CANCELLED": "Бекор карда шуд (Cancelled)"
  };

  const statusColors: Record<string, string> = {
    "PENDING": "bg-yellow-100 text-yellow-800",
    "PURCHASED": "bg-emerald-100 text-emerald-800",
    "CANCELLED": "bg-red-100 text-red-800"
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Фармоишҳо аз Чин (Orders)</h1>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Мобильная версия */}
        <div className="md:hidden divide-y divide-slate-100">
          {orders.map((o: any) => (
            <div key={o.id} className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="font-bold text-slate-800 text-sm">Фармоиш #{o.id}</div>
                <span className={`px-2 py-1 rounded text-[10px] font-bold ${statusColors[o.status] || ''}`}>
                  {statusMap[o.status] || o.status}
                </span>
              </div>
              
              <div className="flex gap-3 mb-3">
                {o.product?.image ? (
                  <img src={o.product.image} alt="" className="w-16 h-16 rounded-lg object-cover shadow-sm border border-slate-100 shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 shrink-0"></div>
                )}
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="font-semibold text-slate-700 text-sm leading-tight truncate mb-1">{o.product?.title || "Моли номаълум"}</div>
                  <div className="font-bold text-emerald-600 text-sm mt-auto">{o.totalTJS} TJS</div>
                </div>
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg mb-3">
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Мизоҷ:</span>
                  <span className="font-semibold">{o.user?.clientCode}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Тамос:</span>
                  <span className="font-medium">{o.user?.firstName} ({o.user?.phone})</span>
                </div>
                {o.user?.phone && (
                  <a href={`https://t.me/${o.user.phone}`} className="text-red-600 font-medium hover:underline flex items-center justify-end gap-1 mt-1.5" target="_blank" rel="noopener noreferrer">
                    💬 Навиштан
                  </a>
                )}
              </div>

              <form action={updateStatus} className="flex items-center gap-2">
                <input type="hidden" name="id" value={o.id} />
                <select name="status" defaultValue={o.status} className="border border-slate-200 text-xs rounded-lg p-2 outline-none focus:border-red-500 bg-white flex-1 font-medium">
                  <option value="PENDING">PENDING</option>
                  <option value="PURCHASED">PURCHASED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
                <button type="submit" className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors">Сабт</button>
              </form>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">Ҳоло ягон фармоиш нест.</div>
          )}
        </div>

        {/* Десктопная версия */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium whitespace-nowrap">ID</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Мизоҷ</th>
                <th className="px-4 py-3 font-medium min-w-[200px]">Мол</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Нарх (Сомонӣ)</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Ҳолат (Status)</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Амалҳо</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o: any) => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500">#{o.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{o.user?.clientCode}</div>
                    <div className="text-xs text-slate-500">{o.user?.firstName} ({o.user?.phone})</div>
                    {o.user?.phone && (
                      <a href={`https://t.me/${o.user.phone}`} className="text-xs text-red-600 font-medium hover:underline flex items-center gap-1 mt-1" target="_blank" rel="noopener noreferrer">
                        💬 Навиштан
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {o.product?.image && <img src={o.product.image} alt="" className="w-8 h-8 rounded object-cover shadow-sm border border-slate-100" />}
                      <div className="font-medium text-slate-700">{o.product?.title}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-emerald-600">{o.totalTJS} TJS</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[o.status] || ''}`}>
                      {statusMap[o.status] || o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <form action={updateStatus} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={o.id} />
                      <select name="status" defaultValue={o.status} className="border border-slate-200 text-xs rounded p-1.5 outline-none focus:border-red-500 bg-white">
                        <option value="PENDING">PENDING</option>
                        <option value="PURCHASED">PURCHASED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                      <button type="submit" className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded text-xs font-medium transition-colors">Сабт</button>
                    </form>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">Ҳоло ягон фармоиш нест.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
