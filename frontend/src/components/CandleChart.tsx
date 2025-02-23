import React from "react";
import ApexCharts from "react-apexcharts";
import { Candle } from "../types/exchange";

interface CandleChartProps {
  data: Candle[];
  width?: number;
  height?: number;
}

export const CandleChart: React.FC<CandleChartProps> = ({
  data,
  width = 800,
  height = 400,
}) => {
  const series = [
    {
      data: data.map((candle) => ({
        x: new Date(candle.timestamp),
        y: [candle.open, candle.high, candle.low, candle.close],
      })),
    },
  ];

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "candlestick",
      background: "#1E293B",
      toolbar: { show: false },
    },
    xaxis: {
      type: "datetime",
      labels: { style: { colors: "#CBD5E1" } },
    },
    yaxis: {
      tooltip: { enabled: true },
      labels: { style: { colors: "#CBD5E1" } },
    },
    grid: { borderColor: "#334155" },
    tooltip: {
      theme: "dark",
    },
  };

  return (
    <ApexCharts
      options={options}
      series={series}
      type="candlestick"
      width={width}
      height={height}
    />
  );
};
