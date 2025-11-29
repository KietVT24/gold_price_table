import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import type { GoldPriceData, GoldPriceDocument } from '@/types/gold';

const DB_NAME = 'gold_prices_db';
const COLLECTION_NAME = 'prices';

// Dữ liệu mặc định
const defaultPrices = [
  { id: 1, name: "SJC 9999", buy: 82500000, sell: 83500000 },
  { id: 2, name: "SJC 980", buy: 80200000, sell: 82200000 },
  { id: 3, name: "PNJ 9999", buy: 82400000, sell: 83400000 },
  { id: 4, name: "DOJI 9999", buy: 82300000, sell: 83600000 },
  { id: 5, name: "Bảo Tín 9999", buy: 82100000, sell: 83500000 }
];

// =============================
//        GET / API
// =============================
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection<GoldPriceDocument>(COLLECTION_NAME);

    // Lấy dữ liệu hiện tại
    const prices = await collection.find({}).sort({ id: 1 }).toArray();

    // Nếu chưa có dữ liệu → khởi tạo mặc định
    if (prices.length === 0) {
      const now = new Date();

      const defaultDocs = defaultPrices.map((p) => ({
        ...p,
        updatedAt: now
      }));

      await collection.insertMany(defaultDocs);

      const result: GoldPriceData = {
        data: defaultPrices,
        updatedAt: now.toISOString()
      };

      return NextResponse.json(result);
    }

    // Tìm updatedAt mới nhất
    const latestUpdate = prices.reduce(
      (latest, price) => (price.updatedAt > latest ? price.updatedAt : latest),
      prices[0].updatedAt
    );

    const result: GoldPriceData = {
      data: prices.map((p) => ({
        id: p.id,
        name: p.name,
        buy: p.buy,
        sell: p.sell
      })),
      updatedAt: latestUpdate.toISOString()
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error reading gold prices:', error);
    return NextResponse.json(
      { error: 'Failed to read gold prices', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// =============================
//        PUT / API
// =============================
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const newPrices = body.data;

    if (!Array.isArray(newPrices) || newPrices.length === 0) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection<GoldPriceDocument>(COLLECTION_NAME);

    const now = new Date();

    // Xóa dữ liệu cũ
    await collection.deleteMany({});

    // Kiểu dữ liệu phần tử
    type PriceInput = GoldPriceData["data"][number];

    // Chèn dữ liệu mới
    const docs = newPrices.map((p: PriceInput): GoldPriceDocument => ({
      id: p.id,
      name: p.name,
      buy: p.buy,
      sell: p.sell,
      updatedAt: now
    }));

    await collection.insertMany(docs);

    const result: GoldPriceData = {
      data: newPrices,
      updatedAt: now.toISOString()
    };

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating gold prices:', error);
    return NextResponse.json(
      { error: 'Failed to update gold prices', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}






// import { NextResponse } from 'next/server';
// import { promises as fs } from 'fs';
// import path from 'path';
// import type { GoldPriceData } from '@/types/gold';

// const dataFilePath = path.join(process.cwd(), 'data', 'gold-prices.json');

// export async function GET() {
//   try {
//     const fileContents = await fs.readFile(dataFilePath, 'utf8');
//     const data: GoldPriceData = JSON.parse(fileContents);
    
//     return NextResponse.json(data);
//   } catch (error) {
//     console.error('Error reading gold prices:', error);
//     return NextResponse.json(
//       { error: 'Failed to read gold prices' },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(request: Request) {
//   try {
//     const body = await request.json();
    
//     const newData: GoldPriceData = {
//       data: body.data,
//       updatedAt: new Date().toISOString(),
//     };

//     await fs.writeFile(dataFilePath, JSON.stringify(newData, null, 2), 'utf8');

//     return NextResponse.json({ success: true, data: newData });
//   } catch (error) {
//     console.error('Error updating gold prices:', error);
//     return NextResponse.json(
//       { error: 'Failed to update gold prices' },
//       { status: 500 }
//     );
//   }
// }