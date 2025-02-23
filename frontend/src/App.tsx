import React, { useState, useEffect } from "react";
import { CandleChart } from "./components/CandleChart";
import { CryptoDetails } from "./components/CryptoDetails";
import { useExchangeData } from "./hooks/useExchangeData";
import { exchanges } from "./config/exchanges";
import { ExchangeName } from "./types/exchange";
import { ArrowUpDown } from "lucide-react";

const intervals = ["1m", "5m", "15m", "1h", "4h", "1d"];
const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT"];

function App() {
  const [selectedExchange, setSelectedExchange] =
    useState<ExchangeName>("binance");
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [selectedInterval, setSelectedInterval] = useState("1m");
  const [chartDimensions, setChartDimensions] = useState({
    width: 800,
    height: 400,
  });

  const { candles, isLoading, error } = useExchangeData(
    exchanges[selectedExchange],
    selectedSymbol,
    selectedInterval
  );

  useEffect(() => {
    const updateDimensions = () => {
      const container = document.getElementById("chart-container");
      if (container) {
        setChartDimensions({
          width: container.clientWidth - 32,
          height: Math.max(400, window.innerHeight * 0.6),
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const latestCandle = candles[candles.length - 1];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-6">
      <div className="max-w-[1920px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-6 h-6 text-slate-400" />
            <h1 className="text-xl md:text-2xl font-bold">Crypto Chart</h1>
          </div>

          <div className="flex flex-wrap gap-2 md:gap-4">
            <select
              value={selectedExchange}
              onChange={(e) =>
                setSelectedExchange(e.target.value as ExchangeName)
              }
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5 md:px-3 md:py-2 text-sm md:text-base min-w-[100px]"
            >
              {Object.keys(exchanges).map((exchange) => (
                <option key={exchange} value={exchange}>
                  {exchanges[exchange].name}
                </option>
              ))}
            </select>

            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5 md:px-3 md:py-2 text-sm md:text-base min-w-[100px]"
            >
              {symbols.map((symbol) => (
                <option key={symbol} value={symbol}>
                  {symbol}
                </option>
              ))}
            </select>

            <select
              value={selectedInterval}
              onChange={(e) => setSelectedInterval(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1.5 md:px-3 md:py-2 text-sm md:text-base min-w-[80px]"
            >
              {intervals.map((interval) => (
                <option key={interval} value={interval}>
                  {interval}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-4 md:gap-6">
          <div
            id="chart-container"
            className="bg-slate-800 rounded-lg p-4 md:p-6 shadow-xl"
          >
            {error ? (
              <div className="text-red-500 text-center py-8">
                Error: {error}
              </div>
            ) : isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <CandleChart
                data={candles}
                width={chartDimensions.width}
                height={chartDimensions.height}
              />
            )}
          </div>

          <CryptoDetails
            symbol={selectedSymbol}
            exchange={exchanges[selectedExchange].name}
            interval={selectedInterval}
            latestCandle={latestCandle}
            className="order-first lg:order-last"
          />
        </div>
      </div>
    </div>
  );
}

export default App;
