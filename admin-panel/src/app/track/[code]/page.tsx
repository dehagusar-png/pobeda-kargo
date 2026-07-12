import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Package, Truck, MapPin, CheckCircle } from "lucide-react";

export default async function TrackPage({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = await params;
  const parcel = await prisma.parcel.findUnique({
    where: { trackCode: resolvedParams.code }
  });

  if (!parcel) {
    return notFound();
  }

  // ParcelStatus enum: EXPECTED, IN_CHINA, IN_TRANSIT, ARRIVED, DELIVERED
  const statusLevels: Record<string, number> = {
    EXPECTED: 0,
    IN_CHINA: 1,
    IN_TRANSIT: 2,
    ARRIVED: 3,
    DELIVERED: 4
  };

  const currentLevel = statusLevels[parcel.status] || 0;

  const steps = [
    { label: "Дар анбори Чин", icon: Package, status: "IN_CHINA", level: 1 },
    { label: "Дар роҳ ба Тоҷикистон", icon: Truck, status: "IN_TRANSIT", level: 2 },
    { label: "Омода дар Душанбе", icon: MapPin, status: "ARRIVED", level: 3 },
    { label: "Супорида шуд", icon: CheckCircle, status: "DELIVERED", level: 4 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 py-8 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold mb-1">Пайгирии Бор</h1>
          <p className="text-blue-100 opacity-90 font-mono text-sm tracking-widest">{parcel.trackCode}</p>
        </div>
        
        <div className="p-6">
          <div className="mb-8 bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col gap-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Вазн:</span>
              <span className="font-semibold text-slate-800 bg-white px-2 py-1 rounded shadow-sm">
                {parcel.weight ? `${parcel.weight} кг` : "Номаълум"}
              </span>
            </div>
            {parcel.price && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Нарх:</span>
                <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded shadow-sm">
                  ${parcel.price}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Навсозӣ:</span>
              <span className="font-medium text-slate-700">
                {new Date(parcel.updatedAt).toLocaleString("ru-RU", { 
                  timeZone: "Asia/Dushanbe",
                  day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
                })}
              </span>
            </div>
          </div>

          <div className="relative pl-4 py-2">
            {/* Vertical Line */}
            <div className="absolute left-[2.25rem] top-6 bottom-6 w-0.5 bg-slate-200"></div>
            
            <div className="space-y-8 relative z-10">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = currentLevel >= step.level;
                const isCurrent = currentLevel === step.level;
                
                return (
                  <div key={index} className="flex items-center gap-5">
                    <div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 transition-all duration-500 ease-out
                      ${isCompleted ? "bg-blue-600 border-blue-100 text-white shadow-md shadow-blue-200" : "bg-white border-slate-200 text-slate-400"}
                      ${isCurrent ? "ring-4 ring-blue-50 scale-110" : ""}`}
                    >
                      <Icon size={20} className={isCurrent ? "animate-pulse" : ""} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-base font-semibold transition-colors duration-300 ${isCompleted ? "text-slate-800" : "text-slate-400"}`}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-xs text-blue-600 font-medium mt-1 inline-block bg-blue-50 px-2 py-0.5 rounded-full">
                          Марҳилаи ҷорӣ
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-slate-400 text-xs mt-8 text-center max-w-xs font-medium">
        Системаи пайгирии Pobeda Cargo &copy; {new Date().getFullYear()}
      </p>
    </div>
  );
}
