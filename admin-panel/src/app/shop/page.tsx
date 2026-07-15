/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

interface Product {
  id: number;
  title: string;
  priceCNY: number;
  image: string | null;
  images: string[];
  description: string | null;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(1.5);
  const [loading, setLoading] = useState(true);
  const [activeImageIndices, setActiveImageIndices] = useState<Record<number, number>>({});

  useEffect(() => {
    fetch("/api/shop/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.products) {
          setProducts(data.products);
          setExchangeRate(data.exchangeRate || 1.5);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const [buyingProductId, setBuyingProductId] = useState<number | null>(null);

  const handleBuy = (product: Product) => {
    if (buyingProductId === product.id) return;
    setBuyingProductId(product.id);
    
    // Check if running inside Telegram WebApp
    if (typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.sendData(JSON.stringify({ action: "buy", productId: product.id }));
    } else {
      alert("Ин хусусият танҳо дар дохили Телеграм кор мекунад!");
      setBuyingProductId(null);
    }
  };

  const nextImage = (e: any, productId: number, maxIndex: number) => {
    e.stopPropagation();
    setActiveImageIndices(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) + 1) % maxIndex
    }));
  };

  const prevImage = (e: any, productId: number, maxIndex: number) => {
    e.stopPropagation();
    setActiveImageIndices(prev => ({
      ...prev,
      [productId]: prev[productId] ? prev[productId] - 1 : maxIndex - 1
    }));
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-12">
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      
      {/* Header */}
      <div className="sticky top-0 z-50 bg-red-600 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-center">
          <h1 className="text-2xl font-bold text-white tracking-wide">
            Мағозаи Победа 🛍️
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <p className="text-lg">Айни ҳол дар мағоза маҳсулот нест.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((product) => {
              const priceTJS = (product.priceCNY * exchangeRate).toFixed(2);
              const allImages = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);
              const currentImageIndex = activeImageIndices[product.id] || 0;
              
              return (
                <div 
                  key={product.id} 
                  className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col"
                >
                  <div className="relative aspect-square bg-slate-50 w-full overflow-hidden group">
                    {allImages.length > 0 ? (
                      <>
                        <img 
                          src={allImages[currentImageIndex]} 
                          alt={product.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {allImages.length > 1 && (
                          <>
                            <button onClick={(e) => prevImage(e, product.id, allImages.length)} className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-80 hover:opacity-100 hover:bg-black/50 transition">&lt;</button>
                            <button onClick={(e) => nextImage(e, product.id, allImages.length)} className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-80 hover:opacity-100 hover:bg-black/50 transition">&gt;</button>
                            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                              {allImages.map((_, idx) => (
                                <div key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/40'}`}></div>
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        Сурат нест
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 flex flex-col flex-1">
                    <h2 className="font-semibold text-sm md:text-base leading-tight mb-1 line-clamp-2">
                      {product.title}
                    </h2>
                    
                    {product.description && (
                      <p className="text-xs text-slate-500 line-clamp-1 mb-2">
                        {product.description}
                      </p>
                    )}
                    
                    <div className="mt-auto pt-2">
                      <div className="flex flex-col mb-3">
                        <span className="text-red-600 font-bold text-lg leading-none">
                          {priceTJS} TJS
                        </span>
                        <span className="text-slate-400 text-xs mt-1">
                          ~{product.priceCNY} ¥
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => handleBuy(product)}
                        disabled={buyingProductId === product.id}
                        className={`w-full font-medium py-2 rounded-xl transition-colors text-sm shadow-sm hover:shadow active:scale-95 transform duration-150 ${
                          buyingProductId === product.id 
                            ? "bg-slate-300 text-slate-500 cursor-not-allowed" 
                            : "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white"
                        }`}
                      >
                        {buyingProductId === product.id ? "Дар ҳоли ирсол..." : "Фармоиш додан"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
