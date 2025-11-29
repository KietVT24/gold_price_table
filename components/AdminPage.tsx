'use client';

import { useState, useEffect, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import useSWR, { mutate } from 'swr';
import Toast from './Toast';
import { formatPrice } from '@/lib/utils';
import type { GoldPrice, GoldPriceData } from '@/types/gold';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminPage() {
  const router = useRouter();
  const { data, error, isLoading } = useSWR<GoldPriceData>('/api/gold-price', fetcher);
  
  // ✅ FIX: Khởi tạo từ data ngay từ đầu (derived state)
  const [editedPrices, setEditedPrices] = useState<GoldPrice[]>(() => {
    return data?.data || [];
  });
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // ✅ FIX: Chỉ sync khi data thay đổi và chưa được khởi tạo
    useEffect(() => {
      if (data?.data && !isInitialized) {
        startTransition(() => {
          setEditedPrices(data.data);
          setIsInitialized(true);
        });
      }
    }, [data, isInitialized]);

  const handleInputChange = (id: number, field: 'name' | 'buy' | 'sell', value: string) => {
    setEditedPrices(prev => prev.map(price => {
      if (price.id === id) {
        if (field === 'name') {
          return { ...price, [field]: value };
        } else {
          // Remove non-numeric characters
          const numValue = value.replace(/\D/g, '');
          return { ...price, [field]: numValue ? parseInt(numValue) : 0 };
        }
      }
      return price;
    }));
  };

  const handleSaveOne = async (id: number) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/gold-price', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: editedPrices }),
      });

      if (response.ok) {
        const result = await response.json();
        // Global mutate to update all clients
        await mutate('/api/gold-price', result.data, false);
        setToast({ message: `Đã lưu giá ${editedPrices.find(p => p.id === id)?.name}!`, type: 'success' });
      } else {
        const errorData = await response.json();
        setToast({ message: `Lỗi: ${errorData.error || 'Không thể lưu'}`, type: 'error' });
      }
    } catch (err) {
      console.error('Save error:', err);
      setToast({ message: 'Lỗi kết nối server!', type: 'error' });
    }
    setIsSaving(false);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/gold-price', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: editedPrices }),
      });

      if (response.ok) {
        const result = await response.json();
        // Global mutate to update all clients
        await mutate('/api/gold-price', result.data, false);
        setToast({ 
          message: 'Đã cập nhật giá - tất cả khách hàng đang thấy giá mới!', 
          type: 'success' 
        });
      } else {
        const errorData = await response.json();
        setToast({ message: `Lỗi: ${errorData.error || 'Không thể lưu'}`, type: 'error' });
      }
    } catch (err) {
      console.error('Save error:', err);
      setToast({ message: 'Lỗi kết nối server!', type: 'error' });
    }
    setIsSaving(false);
  };

  const handleAddNew = () => {
    const newId = editedPrices.length > 0 
      ? Math.max(...editedPrices.map(p => p.id)) + 1 
      : 1;
    
    setEditedPrices([...editedPrices, {
      id: newId,
      name: 'Vàng mới',
      buy: 0,
      sell: 0,
    }]);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa loại vàng này?')) return;
    
    const updatedPrices = editedPrices.filter(p => p.id !== id);
    setEditedPrices(updatedPrices);
    
    // Tự động lưu sau khi xóa
    setIsSaving(true);
    try {
      const response = await fetch('/api/gold-price', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: updatedPrices }),
      });

      if (response.ok) {
        const result = await response.json();
        await mutate('/api/gold-price', result.data, false);
        setToast({ message: 'Đã xóa thành công!', type: 'success' });
      } else {
        setToast({ message: 'Lỗi khi xóa!', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Lỗi kết nối!', type: 'error' });
    }
    setIsSaving(false);
  };

  // Error state
  if (error) {
    console.error("Admin API Error:", error);
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-red-50">
        <div className="bg-white p-8 rounded-lg shadow-2xl max-w-2xl">
          <h1 className="text-3xl font-bold mb-4 text-red-600">⚠️ Lỗi tải dữ liệu</h1>
          <p className="text-xl mb-4">Không thể kết nối đến API</p>
          <div className="bg-gray-100 p-4 rounded text-sm font-mono mb-4">
            {error?.message || "Unknown error"}
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold"
            >
              🔄 Tải lại
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold"
            >
              ← Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-6xl mb-4 animate-bounce">🔧</div>
        <div className="text-2xl font-bold text-gray-700">Đang tải dữ liệu...</div>
      </div>
    );
  }

  // Check data validity
  if (!data.data || !Array.isArray(data.data)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-6xl mb-4">📭</div>
        <div className="text-2xl font-bold text-gray-700 mb-4">Chưa có dữ liệu</div>
        <button
          onClick={() => router.push('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold"
        >
          ← Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">
              🔧 Quản Trị Giá Vàng
            </h1>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 text-lg font-medium"
            >
              ← Thoát
            </button>
          </div>

          {editedPrices.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-xl text-gray-600 mb-6">Chưa có loại vàng nào</p>
              <button
                onClick={handleAddNew}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-lg font-medium"
              >
                ➕ Thêm loại vàng đầu tiên
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {editedPrices.map((price) => (
                  <div key={price.id} className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-400 transition-colors">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tên vàng
                        </label>
                        <input
                          type="text"
                          value={price.name}
                          onChange={(e) => handleInputChange(price.id, 'name', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Giá mua vào
                        </label>
                        <input
                          type="text"
                          value={formatPrice(price.buy)}
                          onChange={(e) => handleInputChange(price.id, 'buy', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-green-600 font-semibold"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Giá bán ra
                        </label>
                        <input
                          type="text"
                          value={formatPrice(price.sell)}
                          onChange={(e) => handleInputChange(price.id, 'sell', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-red-600 font-semibold"
                          placeholder="0"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveOne(price.id)}
                          disabled={isSaving}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium"
                        >
                          💾 Lưu
                        </button>
                        <button
                          onClick={() => handleDelete(price.id)}
                          disabled={isSaving}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-medium"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex gap-4">
                <button
                  onClick={handleAddNew}
                  disabled={isSaving}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-lg font-medium disabled:bg-gray-400"
                >
                  ➕ Thêm loại vàng mới
                </button>

                <button
                  onClick={handleSaveAll}
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 text-xl font-bold disabled:from-gray-400 disabled:to-gray-400 shadow-lg"
                >
                  💾 LƯU TẤT CẢ
                </button>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Lưu ý:</strong> Sau khi lưu, tất cả màn hình đang hiển thị sẽ tự động cập nhật giá mới trong vòng 3 giây!
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import useSWR, { mutate } from 'swr';
// import Toast from './Toast';
// import { formatPrice } from '@/lib/utils';
// import type { GoldPrice, GoldPriceData } from '@/types/gold';

// const fetcher = (url: string) => fetch(url).then((res) => res.json());

// export default function AdminPage() {
//   const router = useRouter();
//   const { data, error } = useSWR<GoldPriceData>('/api/gold-price', fetcher);
  
//   const [editedPrices, setEditedPrices] = useState<GoldPrice[]>([]);
//   const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
//   const [isSaving, setIsSaving] = useState(false);

//   useState(() => {
//     if (data) {
//       setEditedPrices(data.data);
//     }
//   });

//   if (data && editedPrices.length === 0) {
//     setEditedPrices(data.data);
//   }

//   const handleInputChange = (id: number, field: 'name' | 'buy' | 'sell', value: string) => {
//     setEditedPrices(prev => prev.map(price => {
//       if (price.id === id) {
//         if (field === 'name') {
//           return { ...price, [field]: value };
//         } else {
//           // Remove non-numeric characters
//           const numValue = value.replace(/\D/g, '');
//           return { ...price, [field]: numValue ? parseInt(numValue) : 0 };
//         }
//       }
//       return price;
//     }));
//   };

//   const handleSaveOne = async (id: number) => {
//     setIsSaving(true);
//     try {
//       const response = await fetch('/api/gold-price', {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ data: editedPrices }),
//       });

//       if (response.ok) {
//         const result = await response.json();
//         // Global mutate to update all clients
//         await mutate('/api/gold-price', result.data, false);
//         setToast({ message: `Đã lưu giá ${editedPrices.find(p => p.id === id)?.name}!`, type: 'success' });
//       } else {
//         setToast({ message: 'Lỗi khi lưu giá!', type: 'error' });
//       }
//     } catch (err) {
//       setToast({ message: 'Lỗi kết nối!', type: 'error' });
//     }
//     setIsSaving(false);
//   };

//   const handleSaveAll = async () => {
//     setIsSaving(true);
//     try {
//       const response = await fetch('/api/gold-price', {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ data: editedPrices }),
//       });

//       if (response.ok) {
//         const result = await response.json();
//         // Global mutate to update all clients
//         await mutate('/api/gold-price', result.data, false);
//         setToast({ 
//           message: 'Đã cập nhật giá - tất cả khách hàng đang thấy giá mới!', 
//           type: 'success' 
//         });
//       } else {
//         setToast({ message: 'Lỗi khi lưu giá!', type: 'error' });
//       }
//     } catch (err) {
//       setToast({ message: 'Lỗi kết nối!', type: 'error' });
//     }
//     setIsSaving(false);
//   };

//   const handleAddNew = () => {
//     const newId = Math.max(...editedPrices.map(p => p.id), 0) + 1;
//     setEditedPrices([...editedPrices, {
//       id: newId,
//       name: 'Vàng mới',
//       buy: 0,
//       sell: 0,
//     }]);
//   };

//   const handleDelete = (id: number) => {
//     if (confirm('Bạn có chắc muốn xóa loại vàng này?')) {
//       setEditedPrices(prev => prev.filter(p => p.id !== id));
//     }
//   };

//   if (error) return <div className="flex items-center justify-center h-screen text-2xl text-red-600">Lỗi tải dữ liệu!</div>;
//   if (!data) return <div className="flex items-center justify-center h-screen text-2xl">Đang tải...</div>;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
//       {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

//       <div className="max-w-6xl mx-auto">
//         <div className="bg-white rounded-2xl shadow-2xl p-8">
//           <div className="flex justify-between items-center mb-8">
//             <h1 className="text-4xl font-bold text-gray-800">
//               🔧 Quản Trị Giá Vàng
//             </h1>
//             <button
//               onClick={() => router.push('/')}
//               className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 text-lg font-medium"
//             >
//               ← Thoát
//             </button>
//           </div>

//           <div className="space-y-4">
//             {editedPrices.map((price) => (
//               <div key={price.id} className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-400 transition-colors">
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Tên vàng
//                     </label>
//                     <input
//                       type="text"
//                       value={price.name}
//                       onChange={(e) => handleInputChange(price.id, 'name', e.target.value)}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Giá mua vào
//                     </label>
//                     <input
//                       type="text"
//                       value={formatPrice(price.buy)}
//                       onChange={(e) => handleInputChange(price.id, 'buy', e.target.value)}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-green-600 font-semibold"
//                       placeholder="0"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Giá bán ra
//                     </label>
//                     <input
//                       type="text"
//                       value={formatPrice(price.sell)}
//                       onChange={(e) => handleInputChange(price.id, 'sell', e.target.value)}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-red-600 font-semibold"
//                       placeholder="0"
//                     />
//                   </div>

//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => handleSaveOne(price.id)}
//                       disabled={isSaving}
//                       className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium"
//                     >
//                       💾 Lưu
//                     </button>
//                     <button
//                       onClick={() => handleDelete(price.id)}
//                       disabled={isSaving}
//                       className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-medium"
//                     >
//                       🗑️
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="mt-8 flex gap-4">
//             <button
//               onClick={handleAddNew}
//               disabled={isSaving}
//               className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-lg font-medium disabled:bg-gray-400"
//             >
//               ➕ Thêm loại vàng mới
//             </button>

//             <button
//               onClick={handleSaveAll}
//               disabled={isSaving}
//               className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 text-xl font-bold disabled:from-gray-400 disabled:to-gray-400 shadow-lg"
//             >
//               💾 LƯU TẤT CẢ
//             </button>
//           </div>

//           <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
//             <p className="text-sm text-yellow-800">
//               <strong>Lưu ý:</strong> Sau khi lưu, tất cả màn hình đang hiển thị sẽ tự động cập nhật giá mới trong vòng 1 giây!
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }