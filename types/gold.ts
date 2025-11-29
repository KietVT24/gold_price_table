export interface GoldPrice {
  id: number;
  name: string;
  buy: number;
  sell: number;
}

export interface GoldPriceData {
  data: GoldPrice[];
  updatedAt: string;
}

export interface PriceChange {
  [key: number]: {
    buyChange: 'up' | 'down' | 'none';
    sellChange: 'up' | 'down' | 'none';
  };
}