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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!canvasRef.current || trends.length === 0) return;

    // Destroy previous instance before creating a new one
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const labels = trends.map((t) => t.month);
    const incomes = trends.map((t) => parseFloat(t.income));
    const expenses = trends.map((t) => parseFloat(t.expense));
    const nets = trends.map((t) => parseFloat(t.net));

    const data: ChartData = {
      labels,
      datasets: [
        {
          type: "bar" as const,
          label: "Income",
          data: incomes,
          backgroundColor: "rgba(34,197,94,0.7)",
          borderColor: "rgba(22,163,74,1)",
          borderWidth: 1,
          borderRadius: 4,
          order: 2,
        },
        {
          type: "bar" as const,
          label: "Expense",
          data: expenses,
          backgroundColor: "rgba(239,68,68,0.7)",
          borderColor: "rgba(220,38,38,1)",
          borderWidth: 1,
          borderRadius: 4,
          order: 2,
        },
        {
          type: "line" as const,
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

    const options: ChartOptions = {
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
          ticks: { font: { size: 11 }, color: "#6b7280" },
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
    } as const satisfies ChartOptions;

    const config = {
      type: "bar" as const,
      data,
      options,
    } satisfies ChartConfiguration<"bar">;

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