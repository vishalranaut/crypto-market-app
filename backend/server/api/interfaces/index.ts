export interface PromiseResponse {
  error: boolean;
  message: string;
  status: number;
  data?: any;
  list?: any;
}

export interface FetchMarketDataRequest {
  exchange: string;
  symbol: string;
  interval: string;
  limit: number;
}
