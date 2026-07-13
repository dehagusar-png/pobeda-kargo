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
    
    await prisma.order.update({ where: { id }, data: { status } });
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

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-left text-sm min-w-max">
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
                    <a 
                      href={`https://t.me/${o.user.phone}`} 
                      className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1 mt-1"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      💬 Навиштан
                    </a>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {o.product?.image && <img src={o.product.image} className="w-8 h-8 rounded object-cover" />}
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
                    <select name="status" defaultValue={o.status} className="border text-xs rounded p-1 outline-none focus:border-blue-500">
                      <option value="PENDING">PENDING</option>
                      <option value="PURCHASED">PURCHASED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                    <button type="submit" className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-medium hover:bg-blue-100">Сабт</button>
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
  );
}
