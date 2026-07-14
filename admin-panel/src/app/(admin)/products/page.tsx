/* eslint-disable @next/next/no-img-element */
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });

  async function addProduct(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const priceCNY = parseFloat(formData.get("priceCNY") as string);
    const description = formData.get("description") as string;
    const imageFiles = formData.getAll("images") as File[];
    
    let mainImageStr = null;
    const allImageStrs: string[] = [];

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      if (file && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const base64 = buffer.toString("base64");
        const mimeType = file.type || "image/jpeg";
        const imageStr = `data:${mimeType};base64,${base64}`;
        allImageStrs.push(imageStr);
        if (i === 0) {
          mainImageStr = imageStr;
        }
      }
    }

    await prisma.product.create({
      data: {
        title,
        priceCNY,
        description: description || null,
        image: mainImageStr,
        images: allImageStrs,
        isActive: true
      }
    });

    revalidatePath("/products");
  }

  async function deleteProduct(formData: FormData) {
    "use server";
    const id = parseInt(formData.get("id") as string);
    await prisma.product.delete({ where: { id } });
    revalidatePath("/products");
  }

  async function updateRate(formData: FormData) {
    "use server";
    const rate = parseFloat(formData.get("exchangeRate") as string);
    await prisma.settings.upsert({
      where: { id: 1 },
      update: { exchangeRate: rate },
      create: { id: 1, exchangeRate: rate }
    });
    revalidatePath("/products");
  }

  let settings = await prisma.settings.findUnique({ where: { id: 1 } });
  if (!settings) {
    settings = await prisma.settings.create({ data: { id: 1, exchangeRate: 1.50 } });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Мағозаи Чин (Products)</h1>
        <form action={updateRate} className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border shadow-sm">
          <label className="text-sm font-medium text-slate-600">Қурби Юан (¥ -&gt; TJS):</label>
          <input name="exchangeRate" type="number" step="0.01" defaultValue={settings.exchangeRate} className="w-20 border rounded p-1 outline-none text-sm" />
          <button type="submit" className="bg-slate-800 text-white px-3 py-1 rounded text-sm hover:bg-slate-700">Сабт</button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold mb-4 text-slate-700">Иловаи моли нав (Тезкор)</h2>
        <form action={addProduct} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Номи Мол (Title)</label>
            <input name="title" required className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-red-500 outline-none" placeholder="Масалан: Кроссовка Nike" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-600 mb-1">Нарх (Юан - ¥)</label>
              <input name="priceCNY" type="number" step="0.01" required className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-red-500 outline-none" placeholder="100" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-600 mb-1">Тафсилот ё Ссылка (ихтиёрӣ)</label>
              <input name="description" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-red-500 outline-none" placeholder="Маълумот ё ссылкаи Pinduoduo..." />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-600 mb-1">Боркунии Аксҳо (Images)</label>
              <input type="file" multiple accept="image/*" name="images" className="w-full border rounded-lg p-1.5 focus:ring-2 focus:ring-red-500 outline-none bg-white file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer" />
            </div>
          </div>
          <button type="submit" className="bg-red-600 text-white font-medium py-2 rounded-lg hover:bg-red-700 transition">
            ➕ Илова Кардан
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Мобильная версия (Компактные карточки) */}
        <div className="md:hidden divide-y divide-slate-100">
            {products.map((p: any) => {
              const allImages = p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []);
              return (
            <div key={p.id} className="flex gap-4 p-4 hover:bg-slate-50 transition-colors">
              <div className="shrink-0">
                {allImages.length > 0 ? (
                  <div className="relative">
                    <img src={allImages[0]} alt={p.title} className="w-20 h-20 object-cover rounded-lg shadow-sm border border-slate-100" />
                    {allImages.length > 1 && <span className="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] px-1 rounded">+{allImages.length - 1}</span>}
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-400 border border-slate-200">Бе акс</div>
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col">
                <h3 className="font-semibold text-slate-800 text-sm mb-1 leading-snug">{p.title}</h3>
                <div className="text-emerald-600 font-bold text-sm mb-auto">{p.priceCNY} ¥</div>
                <div className="mt-3 flex justify-end">
                  <form action={deleteProduct}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="text-red-500 hover:text-red-700 text-xs font-medium bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">
                      Нест кардан
                    </button>
                  </form>
                </div>
              </div>
            </div>
              );
            })}
          {products.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">Ҳоло ягон мол илова нашудааст.</div>
          )}
        </div>

        {/* Десктопная версия (Таблица) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Акс</th>
                <th className="px-6 py-3 font-medium min-w-[200px]">Ном</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Нарх (¥)</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap text-right">Амал</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p: any) => {
                const allImages = p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []);
                return (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3">
                    {allImages.length > 0 ? (
                      <div className="relative inline-block">
                        <img src={allImages[0]} alt={p.title} className="w-12 h-12 object-cover rounded shadow-sm border border-slate-100" />
                        {allImages.length > 1 && <span className="absolute -bottom-1 -right-1 bg-black/50 text-white text-[10px] px-1 rounded">+{allImages.length - 1}</span>}
                      </div>
                    ) : <div className="w-12 h-12 bg-slate-100 rounded border border-slate-200"></div>}
                  </td>
                  <td className="px-6 py-3 font-medium text-slate-700">{p.title}</td>
                  <td className="px-6 py-3 text-emerald-600 font-semibold">{p.priceCNY} ¥</td>
                  <td className="px-6 py-3 text-right">
                    <form action={deleteProduct}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="text-red-500 hover:text-red-700 text-sm font-medium bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded transition-colors">Нест кардан</button>
                    </form>
                  </td>
                </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Ҳоло ягон мол илова нашудааст.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
