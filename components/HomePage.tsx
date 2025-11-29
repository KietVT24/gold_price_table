// components/HomePage.tsx
"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import Clock from "./Clock";
import GoldPriceTable from "./GoldPriceTable";
import AdminLoginModal from "./AdminLoginModal";
import type { GoldPriceData } from "@/types/gold";
import { getLunarDate } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function HomePage() {
  const { data, error, isLoading } = useSWR<GoldPriceData>("/api/gold-price", fetcher, {
    refreshInterval: 3000,
    revalidateOnFocus: true,
  });

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [tvMode, setTvMode] = useState(false);
  const [doubleClickTimeout, setDoubleClickTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "t") {
        setTvMode(!tvMode);
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [tvMode]);

  const handleAdminClick = () => {
    if (doubleClickTimeout) {
      clearTimeout(doubleClickTimeout);
      setDoubleClickTimeout(null);
      setShowAdminModal(true);
    } else {
      const timeout = setTimeout(() => {
        setDoubleClickTimeout(null);
      }, 300);
      setDoubleClickTimeout(timeout);
    }
  };

  // Error state với thông tin chi tiết
  if (error) {
    console.error("API Error:", error);
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-red-700 text-white p-8">
        <div className="bg-red-900 p-8 rounded-lg shadow-2xl max-w-2xl">
          <h1 className="text-3xl font-bold mb-4">⚠️ Lỗi kết nối API</h1>
          <p className="text-xl mb-4">Không thể tải dữ liệu giá vàng</p>
          <div className="bg-black/30 p-4 rounded text-sm font-mono mb-4">
            <p>Error: {error?.message || "Unknown error"}</p>
            <p className="mt-2 text-yellow-300">
              Kiểm tra:
              <br />• MongoDB connection string trong .env.local
              <br />• Network Access whitelist (0.0.0.0/0)
              <br />• Database User đã tạo chưa
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold"
          >
            🔄 Tải lại trang
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-red-700">
        <div className="text-yellow-400 text-6xl mb-4 animate-bounce">💰</div>
        <div className="text-3xl text-white font-bold">Đang tải giá vàng...</div>
        <div className="mt-4 flex gap-2">
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse delay-100"></div>
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse delay-200"></div>
        </div>
      </div>
    );
  }

  // Kiểm tra data có hợp lệ không
  if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-red-700 text-white">
        <div className="text-6xl mb-4">📭</div>
        <div className="text-2xl font-bold">Chưa có dữ liệu giá vàng</div>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold"
        >
          🔄 Tải lại
        </button>
      </div>
    );
  }

  const shopName = process.env.NEXT_PUBLIC_SHOP_NAME || "Hiệu vàng Kiều Anh";
  const shopAddress = process.env.NEXT_PUBLIC_SHOP_ADDRESS || "442 Quang Trung, Vân Canh";
  const shopHotline = process.env.NEXT_PUBLIC_SHOP_HOTLINE || "0914012392";

  return (
    <div className="min-h-screen bg-red-700">
      <header className="bg-red-800 shadow-xl sticky top-0 z-40">
        {/* PHẦN TRÊN */}
        <div className="px-4 py-4 text-center">
          {/* TÊN TIỆM */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-yellow-400 tracking-wider drop-shadow-lg">
            {shopName.toUpperCase()}
          </h1>

          {/* GIÁ VÀNG HÔM NAY + NGÀY + GIỜ */}
          <div className="mt-2 flex justify-center items-center gap-3 text-xl md:text-2xl lg:text-3xl font-bold text-yellow-300 tracking-wide">
            <span>GIÁ VÀNG HÔM NAY</span>
            <Clock mode="inline" />
          </div>
        </div>

        {/* THANH DƯỚI */}
        <div className="bg-green-700 px-4 py-2 flex items-center justify-between text-sm md:text-base">
          {/* ĐỊA CHỈ + SĐT */}
          <div className="text-white font-medium">
            {shopAddress} | {shopHotline}
          </div>

          {/* ÂM LỊCH */}
          <div className="text-yellow-200 text-right">
            Âm lịch: {getLunarDate(new Date())}
          </div>
        </div>
      </header>

      {/* Main Content - Gold Price Table */}
      <main className="w-full mx-auto py-6 px-4">
        <div className="bg-red-600 overflow-hidden rounded-lg shadow-2xl">
          <GoldPriceTable prices={data.data} tvMode={tvMode} />
        </div>
      </main>

      {/* TV Mode Toggle Button */}
      {tvMode && (
        <button
          onClick={() => setTvMode(false)}
          className="fixed bottom-8 left-8 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 text-xl font-bold z-50"
        >
          Thoát chế độ TV
        </button>
      )}

      {/* Hidden Admin Access Button */}
      <div
        onClick={handleAdminClick}
        className="fixed bottom-0 right-0 w-32 h-32 cursor-pointer hover:border-2 hover:border-gray-400 opacity-0 hover:opacity-20 transition-all z-30"
        title="Nhấp đúp để truy cập quản trị"
      />

      {/* Admin Login Modal */}
      {showAdminModal && (
        <AdminLoginModal onClose={() => setShowAdminModal(false)} />
      )}
    </div>
  );
}

// "use client";

// import { useState, useEffect } from "react";
// import useSWR from "swr";
// import Clock from "./Clock";
// import GoldPriceTable from "./GoldPriceTable";
// import AdminLoginModal from "./AdminLoginModal";
// import type { GoldPriceData } from "@/types/gold";
// import { getLunarDate } from "@/lib/utils";

// const fetcher = (url: string) => fetch(url).then((res) => res.json());

// export default function HomePage() {
//   const { data, error } = useSWR<GoldPriceData>("/api/gold-price", fetcher, {
//     refreshInterval: 3000, // Poll every 3 seconds
//     revalidateOnFocus: true,
//   });

//   const [showAdminModal, setShowAdminModal] = useState(false);
//   const [tvMode, setTvMode] = useState(false);
//   const [doubleClickTimeout, setDoubleClickTimeout] =
//     useState<NodeJS.Timeout | null>(null);
//   const [currentTime, setCurrentTime] = useState(new Date());
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentTime(new Date());
//     }, 1000);
//     return () => clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     const handleKeyPress = (e: KeyboardEvent) => {
//       if (e.key.toLowerCase() === "t") {
//         setTvMode(!tvMode);
//       }
//     };
//     window.addEventListener("keydown", handleKeyPress);
//     return () => window.removeEventListener("keydown", handleKeyPress);
//   }, [tvMode]);

//   const handleAdminClick = () => {
//     if (doubleClickTimeout) {
//       clearTimeout(doubleClickTimeout);
//       setDoubleClickTimeout(null);
//       setShowAdminModal(true);
//     } else {
//       const timeout = setTimeout(() => {
//         setDoubleClickTimeout(null);
//       }, 300);
//       setDoubleClickTimeout(timeout);
//     }
//   };

//   if (error)
//     return (
//       <div className="flex items-center justify-center h-screen text-2xl text-red-600">
//         Lỗi tải dữ liệu!
//       </div>
//     );
//   if (!data)
//     return (
//       <div className="flex items-center justify-center h-screen text-2xl">
//         Đang tải...
//       </div>
//     );

//   const shopName = process.env.NEXT_PUBLIC_SHOP_NAME || "Hiệu vàng Kiều Anh";
//   const shopAddress = process.env.NEXT_PUBLIC_SHOP_ADDRESS || "442 Quang Trung, Vân Canh";
//   const shopHotline = process.env.NEXT_PUBLIC_SHOP_HOTLINE || "0914012392";

//   return (
//     <div className="min-h-screen bg-red-700">
//       <header className="bg-red-800 shadow-xl sticky top-0 z-40">
//         {/* PHẦN TRÊN */}
//         <div className="px-4 py-4 text-center">
//           {/* TÊN TIỆM */}
//           <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-yellow-400 tracking-wider drop-shadow-lg">
//             {shopName.toUpperCase()}
//           </h1>

//           {/* GIÁ VÀNG HÔM NAY + NGÀY + GIỜ */}
//           <div
//             className="mt-2 flex justify-center items-center gap-3 text-xl md:text-2xl lg:text-3xl font-bold text-yellow-300 tracking-wide">
//             <span>GIÁ VÀNG HÔM NAY</span>
//             <Clock mode="inline" />
//           </div>
//         </div>

//         {/* THANH DƯỚI */}
//         <div
//           className="bg-green-700 px-4 py-2 flex items-center justify-between text-sm md:text-base">
//           {/* ĐỊA CHỈ + SĐT */}
//           <div className="text-white font-medium">
//             {shopAddress} | {shopHotline}
//           </div>

//           {/* ÂM LỊCH */}
//           <div className="text-yellow-200 text-right">
//             Âm lịch: {getLunarDate(new Date())}
//           </div>
//         </div>
//       </header>

//       {/* Main Content - Gold Price Table */}
//       <main className="w-full mx-auto py-6 px-4">
//         <div className="bg-red-600 overflow-hidden rounded-lg shadow-2xl">
//           <GoldPriceTable prices={data.data} tvMode={tvMode} />
//         </div>
//       </main>

//       {/* TV Mode Toggle Button */}
//       {tvMode && (
//         <button
//           onClick={() => setTvMode(false)}
//           className="fixed bottom-8 left-8 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 text-xl font-bold z-50"
//         >
//           Thoát chế độ TV
//         </button>
//       )}

//       {/* Hidden Admin Access Button */}
//       <div
//         onClick={handleAdminClick}
//         className="fixed bottom-0 right-0 w-32 h-32 cursor-pointer hover:border-2 hover:border-gray-400 opacity-0 hover:opacity-20 transition-all z-30"
//         title="Nhấp đúp để truy cập quản trị"
//       />

//       {/* Admin Login Modal */}
//       {showAdminModal && (
//         <AdminLoginModal onClose={() => setShowAdminModal(false)} />
//       )}
//     </div>
//   );
// }
