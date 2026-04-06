"use client";

import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  BarController,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartConfiguration,
  type ChartData,
  type ChartOptions,
} from "chart.js";

// Register required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  BarController,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler
);

export interface TrendPoint {
  month: string;
  income: string;
  expense: string;
  net: string;
}

interface TrendChartProps {
  trends: TrendPoint[];
}

export default function TrendChart({ trends }: TrendChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<ChartJS<"bar" | "line"> | null>(null);

  useEffect(() => {
    if (!canvasRef.current || trends.length === 0) return;

    // Destroy previous chart instance
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const labels = trends.map((t) => t.month);
    const incomes = trends.map((t) => Number(t.income));
    const expenses = trends.map((t) => Number(t.expense));
    const nets = trends.map((t) => Number(t.net));

    // ✅ FIXED: Proper mixed chart typing
    const data: ChartData<"bar" | "line"> = {
      labels,
      datasets: [
        {
          type: "bar",
          label: "Income",
          data: incomes,
          backgroundColor: "rgba(34,197,94,0.7)",
          borderColor: "rgba(22,163,74,1)",
          borderWidth: 1,
          borderRadius: 4,
          order: 2,
        },
        {
          type: "bar",
          label: "Expense",
          data: expenses,
          backgroundColor: "rgba(239,68,68,0.7)",
          borderColor: "rgba(220,38,38,1)",
          borderWidth: 1,
          borderRadius: 4,
          order: 2,
        },
        {
          type: "line",
          label: "Net",
          data: nets,
          borderColor: "rgba(59,130,246,1)",
          backgroundColor: "rgba(59,130,246,0.1)",
          borderWidth: 2,
          pointBackgroundColor: "rgba(59,130,246,1)",
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: false,
          tension: 0.3,
          order: 1,
        },
      ],
    };

    // ✅ FIXED: Proper generic typing
    const options: ChartOptions<"bar" | "line"> = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          position: "top",
          labels: {
            font: { size: 12 },
            usePointStyle: true,
            padding: 16,
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              ` ${ctx.dataset.label}: ₹${Number(ctx.raw).toLocaleString(
                "en-IN",
                { minimumFractionDigits: 2 }
              )}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { size: 11 },
            color: "#6b7280",
          },
        },
        y: {
          grid: { color: "rgba(0,0,0,0.05)" },
          ticks: {
            font: { size: 11 },
            color: "#6b7280",
            callback: (v) =>
              `₹${Number(v).toLocaleString("en-IN")}`,
          },
        },
      },
    };

    // ✅ FINAL: Clean config
    const config: ChartConfiguration<"bar" | "line"> = {
      type: "bar",
      data,
      options,
    };

    chartRef.current = new ChartJS(canvasRef.current, config);

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [trends]);

  if (trends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400">
        <span className="text-3xl mb-2">📈</span>
        <p className="text-sm">
          No trend data yet — add records to see your chart
        </p>
      </div>
    );
  }

  return <canvas ref={canvasRef} style={{ height: "280px" }} />;
}