import React from "react";
import { format } from "date-fns";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Building2,
  BarChart4,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
} from "lucide-react";
import { Candle } from "../types/exchange";

interface CryptoDetailsProps {
  symbol: string;
  exchange: string;
  interval: string;
  latestCandle?: Candle;
  className?: string;
}

export const CryptoDetails: React.FC<CryptoDetailsProps> = ({
  symbol,
  exchange,
  interval,
  latestCandle,
  className = "",
}) => {
  if (!latestCandle) {
    return (
      <div
        className={`bg-slate-800 rounded-lg p-4 md:p-6 shadow-xl ${className}`}
      >
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-700 rounded"></div>
            <div className="h-4 bg-slate-700 rounded w-5/6"></div>
            <div className="h-4 bg-slate-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const priceChange = latestCandle.close - latestCandle.open;
  const priceChangePercent = (priceChange / latestCandle.open) * 100;
  const isPositive = priceChange >= 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(volume);
  };

  return (
    <div
      className={`bg-slate-800 rounded-lg p-4 md:p-6 shadow-xl ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{symbol}</h2>
          <p className="text-slate-400 flex items-center gap-1 mt-1">
            <Building2 className="w-4 h-4" />
            {exchange}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">
            ${formatPrice(latestCandle.close)}
          </div>
          <div
            className={`flex items-center gap-1 ${
              isPositive ? "text-green-500" : "text-red-500"
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            <span>{Math.abs(priceChangePercent).toFixed(2)}%</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">High</span>
            </div>
            <div className="text-lg font-semibold">
              ${formatPrice(latestCandle.high)}
            </div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <TrendingDown className="w-4 h-4" />
              <span className="text-sm">Low</span>
            </div>
            <div className="text-lg font-semibold">
              ${formatPrice(latestCandle.low)}
            </div>
          </div>
        </div>

        <div className="bg-slate-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Wallet className="w-4 h-4" />
            <span className="text-sm">Volume</span>
          </div>
          <div className="text-lg font-semibold">
            {formatVolume(latestCandle.volume)}
          </div>
        </div>

        <div className="bg-slate-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Last Update</span>
          </div>
          <div className="text-lg font-semibold">
            {format(new Date(latestCandle.timestamp), "HH:mm:ss, MMM d")}
          </div>
        </div>

        <div className="bg-slate-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <BarChart4 className="w-4 h-4" />
            <span className="text-sm">Interval</span>
          </div>
          <div className="text-lg font-semibold">{interval}</div>
        </div>
      </div>
    </div>
  );
};
