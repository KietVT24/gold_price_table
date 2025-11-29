import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { GoldPriceData } from '@/types/gold';

const dataFilePath = path.join(process.cwd(), 'data', 'gold-prices.json');

export async function GET() {
  try {
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    const data: GoldPriceData = JSON.parse(fileContents);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading gold prices:', error);
    return NextResponse.json(
      { error: 'Failed to read gold prices' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    const newData: GoldPriceData = {
      data: body.data,
      updatedAt: new Date().toISOString(),
    };

    await fs.writeFile(dataFilePath, JSON.stringify(newData, null, 2), 'utf8');

    return NextResponse.json({ success: true, data: newData });
  } catch (error) {
    console.error('Error updating gold prices:', error);
    return NextResponse.json(
      { error: 'Failed to update gold prices' },
      { status: 500 }
    );
  }
}