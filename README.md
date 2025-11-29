# 💰 Hệ Thống Hiển Thị Giá Vàng Realtime

Dự án Next.js 14+ với App Router, TypeScript, Tailwind CSS và SWR cho cập nhật realtime.

## 🚀 Cài Đặt và Chạy

### Bước 1: Cài đặt dependencies
```bash
npm install
```

### Bước 2: Tạo file .env.local
Tạo file `.env.local` trong thư mục gốc với nội dung:

```env
ADMIN_PASSWORD=password
NEXT_PUBLIC_ADMIN_PASSWORD=password
SHOP_NAME=Tiệm Vàng ABC
NEXT_PUBLIC_SHOP_NAME=Tiệm Vàng ABC
SHOP_HOTLINE=090xxxxxxx
NEXT_PUBLIC_SHOP_HOTLINE=090xxxxxxx
SHOP_ADDRESS=123 Đường Vàng, Q.1, TP.HCM
NEXT_PUBLIC_SHOP_ADDRESS=123 Đường Vàng, Q.1, TP.HCM
SHOP_ZALO=https://zalo.me/xxxx
NEXT_PUBLIC_SHOP_ZALO=https://zalo.me/xxxx
SHOP_FANPAGE=https://facebook.com/xxxx
NEXT_PUBLIC_SHOP_FANPAGE=https://facebook.com/xxxx
```

### Bước 3: Chạy dự án
```bash
npm run dev
```

Mở trình duyệt: `http://localhost:3000`

## 📁 Cấu Trúc Dự Án

```
gold-price-display/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Layout chính
│   ├── page.tsx             # Trang chủ
│   ├── globals.css          # CSS toàn cục
│   ├── admin/
│   │   └── page.tsx         # Trang quản trị
│   └── api/
│       └── gold-price/
│           └── route.ts     # API endpoint
├── components/              # React components
│   ├── HomePage.tsx         # Component trang chủ
│   ├── AdminPage.tsx        # Component trang admin
│   ├── Clock.tsx            # Đồng hồ thời gian thực
│   ├── GoldPriceTable.tsx   # Bảng giá vàng
│   ├── AdminLoginModal.tsx  # Modal đăng nhập admin
│   └── Toast.tsx            # Thông báo toast
├── data/
│   └── gold-prices.json     # Dữ liệu giá vàng
├── types/
│   └── gold.ts              # TypeScript types
├── lib/
│   └── utils.ts             # Utility functions
└── public/
    └── logo.png             # Logo (thay thế)
```

## 🎯 Tính Năng

### Trang Chủ (/)
- ✅ Hiển thị giá vàng cực lớn (responsive từ mobile đến TV 4K)
- ✅ Đồng hồ thời gian thực cập nhật mỗi giây
- ✅ Ngày dương lịch + âm lịch
- ✅ Giá tự động format có dấu chấm (83.500.000)
- ✅ Hiệu ứng nhấp nháy khi giá thay đổi (xanh=tăng, đỏ=giảm)
- ✅ Thông tin liên hệ: Hotline, Zalo, Facebook, Địa chỉ
- ✅ Cập nhật realtime trên tất cả tab/TV (< 1 giây)
- ✅ **Chế độ TV**: Nhấn phím **T** để ẩn footer, chỉ hiển thị bảng giá + đồng hồ
- ✅ Nút ẩn truy cập admin (góc dưới phải, nhấp đúp)

### Trang Admin (/admin)
- ✅ Chỉ truy cập qua modal mật khẩu từ trang chủ
- ✅ Chỉnh sửa inline tất cả loại vàng
- ✅ Thêm/xóa loại vàng
- ✅ Lưu từng dòng hoặc lưu tất cả
- ✅ Toast thông báo thành công
- ✅ Sau khi lưu → tất cả client cập nhật ngay lập tức

### Realtime Update
- ✅ Sử dụng **SWR** với global mutate
- ✅ Polling mỗi 3 giây
- ✅ Khi admin lưu → mutate toàn cục → tất cả tab/TV nhận dữ liệu mới ngay
- ✅ Không cần WebSocket, hoạt động ổn định trên mọi môi trường

## 🔧 Tùy Chỉnh

### 1. Thay đổi Logo
Thay file `public/logo.png` bằng logo của bạn (khuyến nghị 200x200px)

Hoặc trong `components/HomePage.tsx`, dòng 86-88:
```tsx
<div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center shadow-md">
  <span className="text-3xl md:text-4xl font-bold text-yellow-600">💰</span>
</div>
```

Thay bằng:
```tsx
<img src="/logo.png" alt="Logo" className="w-16 h-16 md:w-20 md:h-20 rounded-full" />
```

### 2. Thay đổi thông tin shop và mật khẩu
Chỉnh file `.env.local`:

```env
ADMIN_PASSWORD=matkhaumoi123
NEXT_PUBLIC_ADMIN_PASSWORD=matkhaumoi123
SHOP_NAME=Vàng Bạc Đá Quý XYZ
NEXT_PUBLIC_SHOP_NAME=Vàng Bạc Đá Quý XYZ
SHOP_HOTLINE=0909123456
NEXT_PUBLIC_SHOP_HOTLINE=0909123456
```

**Lưu ý:** Sau khi thay đổi `.env.local`, restart server:
```bash
# Dừng server (Ctrl+C)
npm run dev
```

### 3. Thay đổi dữ liệu mẫu
Chỉnh file `data/gold-prices.json`:

```json
{
  "data": [
    {
      "id": 1,
      "name": "SJC 9999",
      "buy": 82500000,
      "sell": 83500000
    }
  ],
  "updatedAt": "2025-11-29T10:30:00.000Z"
}
```

### 4. Thay đổi màu sắc
File `app/globals.css` và các component sử dụng Tailwind CSS classes.

Ví dụ thay màu header vàng thành xanh, trong `components/HomePage.tsx`:
```tsx
// Từ
<header className="bg-gradient-to-r from-yellow-600 to-yellow-700 ...">

// Thành
<header className="bg-gradient-to-r from-blue-600 to-blue-700 ...">
```

## 🧪 Test Realtime

### Test trên nhiều tab:
1. Mở `http://localhost:3000` trên 2-3 tab/cửa sổ khác nhau
2. Trên 1 tab, nhấp đúp góc dưới phải → nhập mật khẩu → vào admin
3. Thay đổi giá và nhấn "LƯU TẤT CẢ"
4. **Quan sát:** Tất cả tab còn lại cập nhật giá mới trong < 1 giây!

### Test trên TV:
1. Mở `http://localhost:3000` trên Smart TV hoặc màn hình lớn
2. Nhấn F11 để fullscreen
3. Nhấn phím **T** để bật chế độ TV (ẩn footer, chỉ hiện bảng giá + đồng hồ)
4. Từ máy tính/điện thoại khác, vào admin và thay đổi giá
5. TV sẽ tự cập nhật ngay lập tức!

## 🛠️ Nâng Cấp (Tương Lai)

### Chuyển sang SQLite:
Thay `data/gold-prices.json` bằng SQLite database:
- Cài `better-sqlite3` hoặc `prisma`
- Chỉnh API route `app/api/gold-price/route.ts`
- Logic SWR và frontend giữ nguyên

### Thêm Authentication:
- Sử dụng NextAuth.js
- Bảo mật trang admin tốt hơn

### WebSocket (nếu cần):
- Hiện tại dùng SWR polling (3 giây) đã đủ tốt
- Nếu cần update instant hơn, dùng Socket.IO hoặc Pusher

## 📝 Ghi Chú

### Tại sao dùng SWR thay vì WebSocket?
- ✅ Đơn giản, không cần server WebSocket
- ✅ Hoạt động tốt với Vercel, Netlify (serverless)
- ✅ Tự động retry khi mất kết nối
- ✅ Ít bug hơn, dễ debug
- ✅ Đủ nhanh cho use case hiển thị giá vàng (3 giây polling)

### Mật khẩu mặc định
- Mật khẩu: `password`
- **QUAN TRỌNG:** Đổi mật khẩu trong production!

### Responsive
- Mobile: text nhỏ hơn, layout 1 cột
- Tablet: text trung bình
- Desktop: text lớn
- TV 4K: text cực lớn (text-7xl, text-8xl)

## 🐛 Troubleshooting

### Lỗi "Cannot find module"
```bash
npm install
```

### Realtime không hoạt động
- Kiểm tra console log
- Đảm bảo API `/api/gold-price` trả về data
- Kiểm tra SWR đang fetch đúng endpoint

### Không vào được trang admin
- Kiểm tra mật khẩu trong `.env.local`
- Đảm bảo có `NEXT_PUBLIC_ADMIN_PASSWORD`
- Restart server sau khi thay đổi `.env.local`

## 📦 Build Production

```bash
npm run build
npm start
```

Hoặc deploy lên Vercel:
```bash
vercel
```

## 📄 License

MIT License - Sử dụng tự do cho dự án thương mại và cá nhân.

---

**Phát triển bởi:** Next.js 14 + TypeScript + Tailwind + SWR  
**Version:** 1.0.0  
**Ngày:** 29/11/2025