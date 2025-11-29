// pages/api/gold-price/route.ts
import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import type { GoldPrice, GoldPriceData } from "@/types/gold";

// MongoDB URI từ env
const uri = process.env.MONGODB_URI!;

// Singleton MongoClient để tránh tạo nhiều kết nối trên serverless
let cachedClient: MongoClient | null = null;
async function getMongoClient() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

// Dữ liệu mặc định nếu collection rỗng
const defaultPrices: GoldPrice[] = [
  { id: 1, name: "SJC 9999", buy: 82500000, sell: 83500000 },
  { id: 2, name: "SJC 980", buy: 80200000, sell: 82200000 },
  { id: 3, name: "PNJ 9999", buy: 82400000, sell: 83400000 },
  { id: 4, name: "DOJI 9999", buy: 82300000, sell: 83600000 },
  { id: 5, name: "Bảo Tín 9999", buy: 82100000, sell: 83500000 },
];

// GET: Lấy dữ liệu
export async function GET() {
  try {
    const client = await getMongoClient();
    const db = client.db("gold_prices_db");
    const collection = db.collection<GoldPrice>("prices");

    let pricesWithId = await collection.find({}).toArray();

    // Nếu rỗng, insert default và lấy lại
    if (pricesWithId.length === 0) {
      await collection.insertMany(defaultPrices);
      pricesWithId = await collection.find({}).toArray();
    }

    // Loại bỏ _id trước khi trả về frontend
    const prices: GoldPrice[] = pricesWithId.map(({ _id, ...rest }) => rest);

    const response: GoldPriceData = {
      data: prices,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch gold prices" },
      { status: 500 }
    );
  }
}

// PUT: Cập nhật dữ liệu
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body.data || !Array.isArray(body.data)) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    const client = await getMongoClient();
    const db = client.db("gold_prices_db");
    const collection = db.collection<GoldPrice>("prices");

    // Xóa tất cả và insert dữ liệu mới
    await collection.deleteMany({});
    await collection.insertMany(body.data);

    const response: GoldPriceData = {
      data: body.data,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json(
      { error: "Failed to update gold prices" },
      { status: 500 }
    );
  }
}

// Config Vercel
export const runtime = "nodejs";
export const dynamic = "force-dynamic";




// import { NextResponse } from 'next/server';
// import type { GoldPriceData } from '@/types/gold';

// // ⚠️ In-memory storage - Dữ liệu sẽ reset khi serverless cold start
// // Nhưng vẫn hoạt động tốt cho demo/testing
// let goldPricesData: GoldPriceData = {
//   data: [
//     { id: 1, name: "SJC 9999", buy: 82500000, sell: 83500000 },
//     { id: 2, name: "SJC 980", buy: 80200000, sell: 82200000 },
//     { id: 3, name: "PNJ 9999", buy: 82400000, sell: 83400000 },
//     { id: 4, name: "DOJI 9999", buy: 82300000, sell: 83600000 },
//     { id: 5, name: "Bảo Tín 9999", buy: 82100000, sell: 83500000 }
//   ],
//   updatedAt: new Date().toISOString(),
// };

// export async function GET() {
//   try {
//     return NextResponse.json(goldPricesData);
//   } catch (error) {
//     console.error('Error:', error);
//     return NextResponse.json(
//       { error: 'Failed to read gold prices' },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(request: Request) {
//   try {
//     const body = await request.json();
    
//     if (!body.data || !Array.isArray(body.data)) {
//       return NextResponse.json(
//         { error: 'Invalid data format' },
//         { status: 400 }
//       );
//     }
    
//     goldPricesData = {
//       data: body.data,
//       updatedAt: new Date().toISOString(),
//     };

//     return NextResponse.json({ success: true, data: goldPricesData });
//   } catch (error) {
//     console.error('Error:', error);
//     return NextResponse.json(
//       { error: 'Failed to update gold prices' },
//       { status: 500 }
//     );
//   }
// }

// // Config for Vercel
// export const runtime = 'nodejs';
// export const dynamic = 'force-dynamic';






