import { ExchangeConfig } from "../types/exchange";
import axios from "axios";

export const exchanges: Record<string, ExchangeConfig> = {
  binance: {
    name: "Binance",
    wsUrl: "wss://stream.binance.com/ws",
    restUrl: "https://api.binance.com",
    candleSubscription: (symbol: string, interval: string) => ({
      method: "SUBSCRIBE",
      params: [`${symbol.toLowerCase()}@kline_${interval}`],
      id: 1,
    }),
    parseWsMessage: (message: any) => {
      if (!message.k) return null;
      const { t, o, h, l, c, v } = message.k;
      return {
        timestamp: t,
        open: parseFloat(o),
        high: parseFloat(h),
        low: parseFloat(l),
        close: parseFloat(c),
        volume: parseFloat(v),
      };
    },
    fetchHistoricalData: async (
      symbol: string,
      interval: string,
      limit: number
    ) => {
      try {
        const response = await axios.get(
          `https://api.binance.com/api/v3/klines`,
          {
            params: { symbol: symbol.toUpperCase(), interval, limit },
          }
        );
        return response.data.map((d: any) => ({
          timestamp: d[0],
          open: parseFloat(d[1]),
          high: parseFloat(d[2]),
          low: parseFloat(d[3]),
          close: parseFloat(d[4]),
          volume: parseFloat(d[5]),
        }));
      } catch (error: any) {
        throw new Error(
          error.response?.data?.msg || "Failed to fetch Binance data"
        );
      }
    },
  },
  kucoin: {
    name: "KuCoin",
    wsUrl: "wss://ws-api.kucoin.com/endpoint",
    restUrl: "https://api.kucoin.com",
    candleSubscription: (symbol: string, interval: string) => ({
      type: "subscribe",
      topic: `/market/candles:${symbol}_${interval}`,
      privateChannel: false,
      response: true,
    }),
    parseWsMessage: (message: any) => {
      if (!message.data) return null;
      const data = message.data;
      return {
        timestamp: parseInt(data[0]),
        open: parseFloat(data[1]),
        high: parseFloat(data[2]),
        low: parseFloat(data[3]),
        close: parseFloat(data[4]),
        volume: parseFloat(data[5]),
      };
    },
    fetchHistoricalData: async (
      symbol: string,
      interval: string,
      limit: number
    ) => {
      try {
        // Correct interval mapping for KuCoin
        const intervalMap: Record<string, string> = {
          "1m": "1min",
          "3m": "3min",
          "5m": "5min",
          "15m": "15min",
          "30m": "30min",
          "1h": "1hour",
          "2h": "2hour",
          "4h": "4hour",
          "6h": "6hour",
          "8h": "8hour",
          "12h": "12hour",
          "1d": "1day",
          "1w": "1week",
        };

        if (!intervalMap[interval]) {
          throw new Error(`Invalid interval: ${interval}`);
        }

        const response = await axios.get(
          `https://api.kucoin.com/api/v1/market/candles`,
          {
            params: {
              symbol: symbol.toUpperCase(),
              type: intervalMap[interval],
              limit: Math.min(limit, 1500),
            },
          }
        );

        if (!response.data?.data)
          throw new Error("Invalid response from KuCoin API");

        return response.data.data
          .map((d: any) => ({
            timestamp: parseInt(d[0]),
            open: parseFloat(d[1]),
            high: parseFloat(d[2]),
            low: parseFloat(d[3]),
            close: parseFloat(d[4]),
            volume: parseFloat(d[5]),
          }))
          .sort(
            (a: { timestamp: number }, b: { timestamp: number }) =>
              a.timestamp - b.timestamp
          );
      } catch (error: any) {
        throw new Error(
          error.response?.data?.msg || "Failed to fetch KuCoin data"
        );
      }
    },
  },
};
