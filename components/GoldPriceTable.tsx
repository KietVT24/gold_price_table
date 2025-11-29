// components/GoldPriceTable.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import type { GoldPrice, PriceChange } from '@/types/gold';

// Hook usePrevious - React 18 Safe
function usePreviousSafe<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  const [prev, setPrev] = useState<T | undefined>(undefined);

  useEffect(() => {
    setPrev(ref.current);
    ref.current = value;
  }, [value]);

  return prev;
}

interface GoldPriceTableProps {
  prices: GoldPrice[];
  tvMode?: boolean;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN').format(price);
}

export default function GoldPriceTable({ prices, tvMode = false }: GoldPriceTableProps) {
  const prevPrices = usePreviousSafe(prices);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [needsScroll, setNeedsScroll] = useState(false);

  // Price changes
  const priceChanges: PriceChange = {};

  if (prevPrices) {
    for (const item of prices) {
      const prev = prevPrices.find((p) => p.id === item.id);
      if (!prev) continue;

      priceChanges[item.id] = {
        buyChange:
          item.buy > prev.buy ? 'up' : item.buy < prev.buy ? 'down' : 'none',
        sellChange:
          item.sell > prev.sell ? 'up' : item.sell < prev.sell ? 'down' : 'none',
      };
    }
  }

  // Check if content overflows and enable auto-scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !tvMode) return;

    const checkOverflow = () => {
      const hasOverflow = container.scrollHeight > container.clientHeight;
      setNeedsScroll(hasOverflow);
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [prices, tvMode]);

  // Auto-scroll logic
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !needsScroll || !tvMode) return;

    let scrollInterval: NodeJS.Timeout;
    let direction = 1; // 1 = down, -1 = up
    let pauseTimeout: NodeJS.Timeout;

    const scroll = () => {
      const maxScroll = container.scrollHeight - container.clientHeight;
      const currentScroll = container.scrollTop;

      // Scroll down
      if (direction === 1) {
        container.scrollTop += 1;
        
        // Reached bottom, pause then reverse
        if (container.scrollTop >= maxScroll - 5) {
          clearInterval(scrollInterval);
          pauseTimeout = setTimeout(() => {
            direction = -1;
            scrollInterval = setInterval(scroll, 50);
          }, 2000); // Pause 2s at bottom
        }
      } 
      // Scroll up
      else {
        container.scrollTop -= 1;
        
        // Reached top, pause then reverse
        if (container.scrollTop <= 5) {
          clearInterval(scrollInterval);
          pauseTimeout = setTimeout(() => {
            direction = 1;
            scrollInterval = setInterval(scroll, 50);
          }, 2000); // Pause 2s at top
        }
      }
    };

    scrollInterval = setInterval(scroll, 50); // Smooth 50ms interval

    return () => {
      clearInterval(scrollInterval);
      clearTimeout(pauseTimeout);
    };
  }, [needsScroll, tvMode]);

  // Responsive text sizes with mobile support (tăng độ lớn như code mẫu)
  const textSize = tvMode
    ? 'text-[clamp(2rem,4vw,5rem)]'  // TV mode - giống mẫu
    : 'text-[clamp(1rem,2.5vw,3rem)]';  // Normal mode - giống mẫu

  const headerSize = tvMode
    ? 'text-[clamp(1.5rem,3vw,3rem)]'  // TV mode - giống mẫu
    : 'text-[clamp(0.875rem,1.8vw,1.5rem)]';  // Normal mode - giống mẫu

  const paddingSize = tvMode ? 'py-4 px-4' : 'py-4 px-4';  // Padding đồng nhất như mẫu

  return (
    <div className="w-full rounded-lg overflow-hidden shadow-2xl bg-gradient-to-b from-[#970000] to-[#7a0000] p-1">

      {/* ==== HEADER ==== */}
      <div className="grid grid-cols-[45%_27.5%_27.5%] text-center font-black">
        <div className={`bg-[#ffd27f] text-red-900 py-4 border-r border-white ${headerSize} rounded-l-lg`}>
          LOẠI VÀNG
        </div>
        <div className={`bg-[#ffb347] text-red-900 py-4 border-r border-white ${headerSize}`}>
          GIÁ MUA
        </div>
        <div className={`bg-[#ffb347] text-red-900 py-4 ${headerSize} rounded-r-lg`}>
          GIÁ BÁN
        </div>
      </div>

      {/* ==== BODY with Auto-scroll ==== */}
      <div
        ref={scrollContainerRef}
        className={`mt-1 w-full border border-white/20 rounded-md overflow-hidden
                    ${tvMode ? 'max-h-[75vh] overflow-y-auto scrollbar-hide' : 'max-h-[70vh] sm:max-h-none overflow-y-auto sm:overflow-visible scrollbar-hide'}`}
        style={{
          scrollBehavior: 'smooth'
        }}
      >
        {prices.map((item) => {
          const change = priceChanges[item.id];

          const buyClass =
            change?.buyChange === 'up'
              ? 'animate-pulse bg-green-100/30'
              : change?.buyChange === 'down'
              ? 'animate-pulse bg-red-100/30'
              : '';

          const sellClass =
            change?.sellChange === 'up'
              ? 'animate-pulse bg-green-100/30'
              : change?.sellChange === 'down'
              ? 'animate-pulse bg-red-100/30'
              : '';

          return (
            <div
              key={item.id}
              className="grid grid-cols-[45%_27.5%_27.5%] border-b border-white/20 text-yellow-200"
            >
              {/* tên vàng */}
              <div className={`${textSize} ${paddingSize} text-left font-semibold text-yellow-100 border-r border-white/20 flex items-center`}>
                {item.name}
              </div>

              {/* giá mua */}
              <div className={`${textSize} ${paddingSize} text-center font-bold border-r border-white/20 ${buyClass} flex items-center justify-center break-all`}>
                {formatPrice(item.buy)}
              </div>

              {/* giá bán */}
              <div className={`${textSize} ${paddingSize} text-center font-bold text-[#ffcc66] ${sellClass} flex items-center justify-center break-all`}>
                {formatPrice(item.sell)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hide scrollbar CSS */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}


// 'use client';

// import { useEffect, useRef, useState } from 'react';
// import type { GoldPrice, PriceChange } from '@/types/gold';

// // Hook usePrevious - React 18 Safe
// function usePreviousSafe<T>(value: T): T | undefined {
//   const ref = useRef<T | undefined>(undefined);
//   const [prev, setPrev] = useState<T | undefined>(undefined);

//   useEffect(() => {
//     setPrev(ref.current);
//     ref.current = value;
//   }, [value]);

//   return prev;
// }

// interface GoldPriceTableProps {
//   prices: GoldPrice[];
//   tvMode?: boolean;
// }

// function formatPrice(price: number): string {
//   return new Intl.NumberFormat('vi-VN').format(price);
// }

// export default function GoldPriceTable({ prices, tvMode = false }: GoldPriceTableProps) {
//   const prevPrices = usePreviousSafe(prices);

//   // Price changes
//   const priceChanges: PriceChange = {};

//   if (prevPrices) {
//     for (const item of prices) {
//       const prev = prevPrices.find((p) => p.id === item.id);
//       if (!prev) continue;

//       priceChanges[item.id] = {
//         buyChange:
//           item.buy > prev.buy ? 'up' : item.buy < prev.buy ? 'down' : 'none',
//         sellChange:
//           item.sell > prev.sell ? 'up' : item.sell < prev.sell ? 'down' : 'none',
//       };
//     }
//   }

//   // Fluid typography: chữ tự co giãn theo màn hình
//   const textSize = tvMode
//     ? 'text-[clamp(2rem,4vw,5rem)]'
//     : 'text-[clamp(1rem,2.5vw,3rem)]';

//   const headerSize = tvMode
//     ? 'text-[clamp(1.5rem,3vw,3rem)]'
//     : 'text-[clamp(0.875rem,1.8vw,1.5rem)]';

//   return (
//     <div className="w-full rounded-lg overflow-hidden shadow-2xl bg-gradient-to-b from-[#970000] to-[#7a0000] p-1">

//       {/* ==== HEADER ==== */}
//       <div className="grid grid-cols-[45%_27.5%_27.5%] text-center font-black">
//         <div className={`bg-[#ffd27f] text-red-900 py-4 border-r border-white ${headerSize} rounded-l-lg`}>
//           LOẠI VÀNG 
//         </div>
//         <div className={`bg-[#ffb347] text-red-900 py-4 border-r border-white ${headerSize}`}>
//           GIÁ MUA
//         </div>
//         <div className={`bg-[#ffb347] text-red-900 py-4 ${headerSize} rounded-r-lg`}>
//           GIÁ BÁN
//         </div>
//       </div>

//       {/* ==== BODY ==== */}
//       <div
//         className={`mt-1 w-full border border-white/20 rounded-md overflow-hidden
//                     grid auto-rows-fr ${tvMode ? 'min-h-[60vh]' : ''}`}
//       >
//         {prices.map((item) => {
//           const change = priceChanges[item.id];

//           const buyClass =
//             change?.buyChange === 'up'
//               ? 'animate-pulse bg-green-100/30'
//               : change?.buyChange === 'down'
//               ? 'animate-pulse bg-red-100/30'
//               : '';

//           const sellClass =
//             change?.sellChange === 'up'
//               ? 'animate-pulse bg-green-100/30'
//               : change?.sellChange === 'down'
//               ? 'animate-pulse bg-red-100/30'
//               : '';

//           return (
//             <div
//               key={item.id}
//               className="grid grid-cols-[45%_27.5%_27.5%] border-b border-white/20 text-yellow-200"
//             >
//               {/* tên vàng */}
//               <div className={`${textSize} py-4 px-4 text-left font-semibold text-yellow-100 border-r border-white/20`}>
//                 {item.name}
//               </div>

//               {/* giá mua */}
//               <div className={`${textSize} py-4 text-center font-bold border-r border-white/20 ${buyClass}`}>
//                 {formatPrice(item.buy)}
//               </div>

//               {/* giá bán */}
//               <div className={`${textSize} py-4 text-center font-bold text-[#ffcc66] ${sellClass}`}>
//                 {formatPrice(item.sell)}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }






// 'use client';

// import { useEffect, useRef, useState } from 'react';
// import type { GoldPrice, PriceChange } from '@/types/gold';

// // Hook usePrevious - React 18 Safe
// function usePreviousSafe<T>(value: T): T | undefined {
//   const ref = useRef<T | undefined>(undefined);
//   const [prev, setPrev] = useState<T | undefined>(undefined);

//   useEffect(() => {
//     setPrev(ref.current);
//     ref.current = value;
//   }, [value]);

//   return prev;
// }

// interface GoldPriceTableProps {
//   prices: GoldPrice[];
//   tvMode?: boolean;
// }

// function formatPrice(price: number): string {
//   return new Intl.NumberFormat('vi-VN').format(price);
// }

// export default function GoldPriceTable({ prices, tvMode = false }: GoldPriceTableProps) {
//   const prevPrices = usePreviousSafe(prices);

//   // Price changes
//   const priceChanges: PriceChange = {};

//   if (prevPrices) {
//     for (const item of prices) {
//       const prev = prevPrices.find((p) => p.id === item.id);
//       if (!prev) continue;

//       priceChanges[item.id] = {
//         buyChange:
//           item.buy > prev.buy ? 'up' : item.buy < prev.buy ? 'down' : 'none',
//         sellChange:
//           item.sell > prev.sell ? 'up' : item.sell < prev.sell ? 'down' : 'none',
//       };
//     }
//   }

//   // Text sizes giống mẫu SBJ
//   const textSize = tvMode
//     ? 'text-3xl md:text-4xl lg:text-5xl'
//     : 'text-xl md:text-2xl lg:text-3xl';

//   const headerSize = tvMode
//     ? 'text-2xl md:text-3xl'
//     : 'text-lg md:text-xl';

//   return (
//     <div className="w-full rounded-lg overflow-hidden shadow-2xl bg-gradient-to-b from-[#970000] to-[#7a0000] p-1">

//       {/* ==== HEADER ==== */}
//       <div className="grid grid-cols-[45%_27.5%_27.5%] text-center font-black">
//         <div className="bg-[#ffd27f] text-red-900 py-4 border-r border-white text-lg md:text-2xl rounded-l-lg">
//           LOẠI VÀNG 
//         </div>
//         <div className="bg-[#ffb347] text-red-900 py-4 border-r border-white text-lg md:text-2xl">
//           GIÁ MUA
//         </div>
//         <div className="bg-[#ffb347] text-red-900 py-4 text-lg md:text-2xl rounded-r-lg">
//           GIÁ BÁN
//         </div>
//       </div>

//       {/* ==== BODY ==== */}
//       <div className="mt-1 w-full border border-white/20 rounded-md overflow-hidden">
//         {prices.map((item) => {
//           const change = priceChanges[item.id];

//           const buyClass =
//             change?.buyChange === 'up'
//               ? 'animate-pulse bg-green-100/30'
//               : change?.buyChange === 'down'
//               ? 'animate-pulse bg-red-100/30'
//               : '';

//           const sellClass =
//             change?.sellChange === 'up'
//               ? 'animate-pulse bg-green-100/30'
//               : change?.sellChange === 'down'
//               ? 'animate-pulse bg-red-100/30'
//               : '';

//           return (
//             <div
//               key={item.id}
//               className="grid grid-cols-[45%_27.5%_27.5%] border-b border-white/20 text-yellow-200"
//             >
//               {/* tên vàng */}
//               <div className={`${textSize} py-4 px-4 text-left font-semibold text-yellow-100 border-r border-white/20`}>
//                 {item.name}
//               </div>

//               {/* giá mua */}
//               <div className={`${textSize} py-4 text-center font-bold border-r border-white/20 ${buyClass}`}>
//                 {formatPrice(item.buy)}
//               </div>

//               {/* giá bán */}
//               <div className={`${textSize} py-4 text-center font-bold text-[#ffcc66] ${sellClass}`}>
//                 {formatPrice(item.sell)}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }



