import { NextResponse } from 'next/server';
import type { GoldPriceData } from '@/types/gold';

// ⚠️ In-memory storage - Dữ liệu sẽ reset khi serverless cold start
// Nhưng vẫn hoạt động tốt cho demo/testing
let goldPricesData: GoldPriceData = {
  data: [
    { id: 1, name: "SJC 9999", buy: 82500000, sell: 83500000 },
    { id: 2, name: "SJC 980", buy: 80200000, sell: 82200000 },
    { id: 3, name: "PNJ 9999", buy: 82400000, sell: 83400000 },
    { id: 4, name: "DOJI 9999", buy: 82300000, sell: 83600000 },
    { id: 5, name: "Bảo Tín 9999", buy: 82100000, sell: 83500000 }
  ],
  updatedAt: new Date().toISOString(),
};

export async function GET() {
  try {
    return NextResponse.json(goldPricesData);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to read gold prices' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.data || !Array.isArray(body.data)) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }
    
    goldPricesData = {
      data: body.data,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data: goldPricesData });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to update gold prices' },
      { status: 500 }
    );
  }
}

// Config for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';






