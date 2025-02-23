import { apiCall } from '../../common/apiCall';
import l from '../../common/logger';

type MarketType = 'spot' | 'futures';

interface ExchangeUrls {
  spot: string;
  futures: string;
}

const EXCHANGES: Record<string, ExchangeUrls> = {
  binance: {
    spot: 'https://api.binance.com/api/v3/klines',
    futures: 'https://fapi.binance.com/fapi/v1/klines',
  },
  bybit: {
    spot: 'https://api.bybit.com/v2/public/kline/list',
    futures: 'https://api.bybit.com/v2/public/kline/list',
  },
  kucoin: {
    spot: 'https://api.kucoin.com/api/v1/market/candles',
    futures: 'https://api-futures.kucoin.com/api/v1/kline/query',
  },
  mexc: {
    spot: 'https://api.mexc.com/api/v3/klines',
    futures: 'https://contract.mexc.com/api/v1/contract/kline',
  },
  coingecko: {
    spot: 'https://api.coingecko.com/api/v3/coins/markets',
    futures: 'https://api.coingecko.com/api/v3/derivatives',
  },
  cryptocompare: {
    spot: 'https://min-api.cryptocompare.com/data/v2/histoday',
    futures: 'https://min-api.cryptocompare.com/data/futures/histoday',
  },
  coinapi: {
    spot: 'https://rest.coinapi.io/v1/ohlcv/',
    futures: 'https://rest.coinapi.io/v1/ohlcv/',
  },
  kraken: {
    spot: 'https://api.kraken.com/0/public/OHLC',
    futures: 'https://futures.kraken.com/derivatives/api/v3/tick',
  },
  bitfinex: {
    spot: 'https://api-pub.bitfinex.com/v2/candles/trade:1m:',
    futures: 'https://api-pub.bitfinex.com/v2/candles/trade:1m:',
  },
};

export class CryptoService {
  public async fetchMarketData(
    exchange: string,
    market: MarketType,
    symbol: string,
    interval: string,
    limit: number
  ): Promise<any> {
    try {
      const lowerExchange = exchange.toLowerCase();

      if (!EXCHANGES[lowerExchange]) {
        throw new Error(`Unsupported exchange: ${exchange}`);
      }

      let url = EXCHANGES[lowerExchange][market];

      const params = new URLSearchParams();

      // Add common parameters
      params.append('symbol', symbol);
      params.append('interval', interval);
      params.append('limit', limit.toString());

      // Customize parameters for specific exchanges
      switch (lowerExchange) {
        case 'kucoin':
          params.delete('interval');
          params.append('type', interval);
          break;
        case 'coingecko':
          params.delete('symbol');
          params.append('vs_currency', 'usd');
          break;
        case 'cryptocompare':
          params.delete('symbol');
          params.append('fsym', symbol.split('/')[0]);
          params.append('tsym', symbol.split('/')[1]);
          break;
        case 'coinapi':
          url += `${symbol}/history`;
          params.delete('symbol');
          params.append('period_id', interval);
          params.append('limit', limit.toString());
          break;
        case 'kraken':
          params.delete('symbol');
          params.append('pair', symbol);
          break;
        case 'bitfinex':
          url += `${symbol}/hist`;
          params.delete('symbol');
          params.append('limit', limit.toString());
          break;
      }

      url += `?${params.toString()}`;

      l.info(`Fetching market data from: ${url}`);

      const marketData = await apiCall({
        url,
        method: 'GET',
      });

      return marketData;
    } catch (error: any) {
      l.error(`Error fetching market data: ${error.message}`);
      throw error;
    }
  }
}

export default new CryptoService();
