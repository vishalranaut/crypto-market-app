import { useState, useEffect, useRef } from 'react';
import { Candle, ExchangeConfig } from '../types/exchange';

export const useExchangeData = (
  exchange: ExchangeConfig,
  symbol: string,
  interval: string = '1m'
) => {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout>();
  const isComponentMounted = useRef(true);

  useEffect(() => {
    isComponentMounted.current = true;

    const fetchHistorical = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const historicalData = await exchange.fetchHistoricalData(symbol, interval, 1000);
        
        if (isComponentMounted.current) {
          setCandles(historicalData);
        }
      } catch (err) {
        if (isComponentMounted.current) {
          setError(err instanceof Error ? err.message : 'Failed to fetch historical data');
          console.error('Historical data error:', err);
        }
      } finally {
        if (isComponentMounted.current) {
          setIsLoading(false);
        }
      }
    };

    const connectWebSocket = () => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.close();
      }

      try {
        ws.current = new WebSocket(exchange.wsUrl);

        ws.current.onopen = () => {
          if (ws.current?.readyState === WebSocket.OPEN) {
            const subscription = exchange.candleSubscription(symbol, interval);
            ws.current.send(JSON.stringify(subscription));
            if (isComponentMounted.current) {
              setError(null);
            }
          }
        };

        ws.current.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            const candle = exchange.parseWsMessage(message);
            
            if (candle && isComponentMounted.current) {
              setCandles(prev => {
                const updated = [...prev];
                const index = updated.findIndex(c => c.timestamp === candle.timestamp);
                
                if (index !== -1) {
                  updated[index] = candle;
                } else {
                  updated.push(candle);
                }
                
                // Keep only the last 1000 candles and ensure they're sorted
                const sorted = updated
                  .sort((a, b) => a.timestamp - b.timestamp)
                  .slice(-1000);
                
                return sorted;
              });
            }
          } catch (err) {
            console.error('WebSocket message parsing error:', err);
          }
        };

        ws.current.onerror = (event) => {
          console.error('WebSocket error:', event);
          if (isComponentMounted.current) {
            setError('WebSocket connection error');
          }
          reconnect();
        };

        ws.current.onclose = () => {
          if (isComponentMounted.current) {
            reconnect();
          }
        };
      } catch (err) {
        console.error('WebSocket creation error:', err);
        if (isComponentMounted.current) {
          setError('Failed to create WebSocket connection');
        }
        reconnect();
      }
    };

    const reconnect = () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (isComponentMounted.current) {
        reconnectTimeout.current = setTimeout(connectWebSocket, 5000);
      }
    };

    fetchHistorical();
    connectWebSocket();

    return () => {
      isComponentMounted.current = false;
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [exchange, symbol, interval]);

  return { candles, isLoading, error };
};