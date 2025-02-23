export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ExchangeConfig {
  name: string;
  wsUrl: string;
  restUrl: string;
  candleSubscription: (symbol: string, interval: string) => any;
  parseWsMessage: (message: any) => Candle | null;
  fetchHistoricalData: (symbol: string, interval: string, limit: number) => Promise<Candle[]>;
}

export type ExchangeName = 'binance' | 'bybit' | 'mexc' | 'kucoin';