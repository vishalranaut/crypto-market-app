import WebSocket from 'ws';
import l from '../../common/logger';
import http from 'http';

type ExchangeMarket = 'spot' | 'futures';

const exchangeWebSockets: Record<string, Record<ExchangeMarket, string>> = {
  binance: {
    spot: 'wss://stream.binance.com:9443/ws',
    futures: 'wss://fstream.binance.com/ws',
  },
  bybit: {
    spot: 'wss://stream.bybit.com/v5/public/spot',
    futures: 'wss://stream.bybit.com/v5/public/linear',
  },
  kucoin: {
    spot: 'wss://ws-api.kucoin.com/endpoint',
    futures: 'wss://futures-public-ws.kucoin.com/endpoint',
  },
  mexc: {
    spot: 'wss://wbs.mexc.com/ws',
    futures: 'wss://contract.mexc.com/ws',
  },
  bitfinex: {
    spot: 'wss://api-pub.bitfinex.com/ws/2',
    futures: 'wss://api.bitfinex.com/ws/2',
  },
  kraken: {
    spot: 'wss://ws.kraken.com',
    futures: 'wss://futures.kraken.com/ws/v1',
  },
  okx: {
    spot: 'wss://ws.okx.com:8443/ws/v5/public',
    futures: 'wss://ws.okx.com:8443/ws/v5/public',
  },
  gateio: {
    spot: 'wss://ws.gate.io/v3',
    futures: 'wss://fx-ws.gate.io/v3',
  },
};

class WebSocketServer {
  private wss: WebSocket.Server;
  private connections: Record<string, WebSocket> = {};

  constructor(server: http.Server) {
    this.wss = new WebSocket.Server({ server });

    this.wss.on('connection', (ws) => {
      ws.on('message', (message) => {
        try {
          const payload = JSON.parse(message.toString());
          if (payload.market === 'spot' || payload.market === 'futures') {
            this.startWebSockets(payload.market);
          }
        } catch (error) {
          l.error('Invalid JSON received:', error);
        }
      });
    });
  }

  private startWebSockets(market: ExchangeMarket) {
    Object.entries(exchangeWebSockets).forEach(([exchange, types]) => {
      if (types[market]) {
        const name = `${exchange}.${market}`;
        this.connectToExchange(name, types[market]);
      }
    });
  }

  private connectToExchange(name: string, url: string) {
    if (this.connections[name]) return;

    l.info(`Attempting to connect to: ${name} at ${url}`);

    const ws = new WebSocket(url);
    this.connections[name] = ws;

    ws.on('open', () => {
      l.info(`${name} WebSocket connected.`);
      const subscriptionMessage = this.getSubscriptionMessage(name);
      if (subscriptionMessage) {
        ws.send(subscriptionMessage);
      }
    });

    ws.on('error', (error) => {
      l.error(`${name} WebSocket error: ${error.message}`);
    });

    ws.on('close', (code, reason) => {
      l.warn(
        `${name} WebSocket closed (Code: ${code}, Reason: ${reason}). Reconnecting...`
      );
      setTimeout(() => this.connectToExchange(name, url), 5000);
    });

    ws.on('message', (data) => {
      const parsedData = this.formatCandleData(
        name,
        JSON.parse(data.toString())
      );
      if (parsedData) {
        this.broadcastData(parsedData);
      }
    });
  }

  private getSubscriptionMessage(name: string): string | null {
    const subMessages: Record<string, any> = {
      'binance.spot': {
        method: 'SUBSCRIBE',
        params: ['btcusdt@kline_1m'],
        id: 1,
      },
      'binance.futures': {
        method: 'SUBSCRIBE',
        params: ['btcusdt@kline_1m'],
        id: 1,
      },
      'bybit.spot': { op: 'subscribe', args: ['kline.1.BTCUSDT'] },
      'bybit.futures': { op: 'subscribe', args: ['kline.1.BTCUSDT'] },
      'kraken.spot': {
        event: 'subscribe',
        pair: ['XBT/USD'],
        subscription: { name: 'ohlc', interval: 1 },
      },
    };
    return subMessages[name] ? JSON.stringify(subMessages[name]) : null;
  }

  private formatCandleData(name: string, data: any) {
    if (!data) return null;
    const [exchange, market] = name.split('.');
    return {
      exchange,
      market,
      timestamp: data?.timestamp || data?.k?.t || data?.data?.ts,
      open: data?.open || data?.k?.o || data?.data?.o,
      high: data?.high || data?.k?.h || data?.data?.h,
      low: data?.low || data?.k?.l || data?.data?.l,
      close: data?.close || data?.k?.c || data?.data?.c,
      volume: data?.volume || data?.k?.v || data?.data?.v,
    };
  }

  private broadcastData(data: any) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
}

export default WebSocketServer;
