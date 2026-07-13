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
    const imageFile = formData.get("image") as File | null;
    
    let imageStr = null;
    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const base64 = buffer.toString("base64");
      const mimeType = imageFile.type || "image/jpeg";
      imageStr = `data:${mimeType};base64,${base64}`;
    }

    await prisma.product.create({
      data: {
        title,
        priceCNY,
        description: description || null,
        image: imageStr,
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
            <input name="title" required className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Масалан: Кроссовка Nike" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-600 mb-1">Нарх (Юан - ¥)</label>
              <input name="priceCNY" type="number" step="0.01" required className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="100" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-600 mb-1">Тафсилот ё Ссылка (ихтиёрӣ)</label>
              <input name="description" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Маълумот ё ссылкаи Pinduoduo..." />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-600 mb-1">Боркунии Акс (Image)</label>
              <input type="file" accept="image/*" name="image" className="w-full border rounded-lg p-1.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer" />
            </div>
          </div>
          <button type="submit" className="bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition">
            ➕ Илова Кардан
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-left min-w-max">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="px-6 py-3 font-medium whitespace-nowrap">Акс</th>
              <th className="px-6 py-3 font-medium min-w-[200px]">Ном</th>
              <th className="px-6 py-3 font-medium whitespace-nowrap">Нарх (¥)</th>
              <th className="px-6 py-3 font-medium whitespace-nowrap">Амал</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p: any) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-6 py-3">
                  {p.image ? <img src={p.image} alt={p.title} className="w-12 h-12 object-cover rounded" /> : <div className="w-12 h-12 bg-slate-200 rounded"></div>}
                </td>
                <td className="px-6 py-3 font-medium text-slate-700">{p.title}</td>
                <td className="px-6 py-3 text-emerald-600 font-semibold">{p.priceCNY} ¥</td>
                <td className="px-6 py-3">
                  <form action={deleteProduct}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="text-red-500 hover:text-red-700 text-sm font-medium bg-red-50 px-3 py-1 rounded">Нест кардан</button>
                  </form>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Ҳоло ягон мол илова нашудааст.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
