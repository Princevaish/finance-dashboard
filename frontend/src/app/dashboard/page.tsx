"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { getToken, getUserRole, getUserEmail, UserRole } from "@/lib/auth";
import api from "@/lib/api";
import Link from "next/link";

const TrendChart = dynamic(() => import("@/components/TrendChart"), { 
  ssr: false, 
  loading: () => <div className="h-72 bg-gray-100 rounded-xl animate-pulse" /> 
});

interface CategoryBreakdown {
  category: string;
  total: string;
}

interface RecordItem {
  id: number;
  amount: string;
  type: string;
  category: string;
  date: string;
  notes: string | null;
}

interface DashboardSummary {
  total_income: string;
  total_expense: string;
  net_balance: string;
  income_by_category: CategoryBreakdown[];
  expense_by_category: CategoryBreakdown[];
  recent_transactions: RecordItem[];
}

interface TrendPoint {
  month: string;
  income: string;
  expense: string;
  net: string;
}

interface TrendResponse {
  trends: TrendPoint[];
  total_months: number;
}

function SkeletonCard() {
  return <div className="h-28 bg-gray-200 rounded-2xl animate-pulse" />;
}

function StatCard({ 
  label, 
  value, 
  sub, 
  colorCls 
}: { 
  label: string; 
  value: string; 
  sub?: string; 
  colorCls: string 
}) {
  return (
    <div className={`rounded-2xl p-5 border ${colorCls} flex flex-col justify-between`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-2">{label}</p>
      <p className="text-2xl font-bold">₹{parseFloat(value || "0").toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
      {sub && <p className="text-xs opacity-60 mt-1">{sub}</p>}
    </div>
  );
}

function DonutBar({ 
  label, 
  value, 
  max, 
  color 
}: { 
  label: string; 
  value: number; 
  max: number; 
  color: string 
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-28 truncate">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-500 w-10 text-right">{pct}%</span>
    </div>
  );
}

function DashboardContent() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userRole = getUserRole();
    const userEmail = getUserEmail();
    setRole(userRole);
    setEmail(userEmail);

    // Viewers cannot access dashboard — redirect to records
    if (userRole === "viewer") {
      router.replace("/records");
      return;
    }

    // Analysts and admins can access dashboard
    if (!userRole || (userRole !== "analyst" && userRole !== "admin")) {
      setError("unauthorized");
      setLoading(false);
      return;
    }

    // Fetch dashboard data for analyst/admin
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const [summaryRes, trendsRes] = await Promise.all([
          api.get<DashboardSummary>("/dashboard/summary"),
          api.get<TrendResponse>("/dashboard/trends"),
        ]);

        setSummary(summaryRes.data);
        setTrends(trendsRes.data.trends ?? []);
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        if (err.response?.status === 403) {
          setError("forbidden");
        } else if (err.response?.status === 401) {
          setError("unauthorized");
        } else {
          setError("fetch-failed");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [router]);

  // ── Loading State ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="h-80 bg-gray-200 rounded-2xl animate-pulse mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="h-56 bg-gray-200 rounded-2xl animate-pulse" />
          <div className="h-56 bg-gray-200 rounded-2xl animate-pulse" />
        </div>
      </>
    );
  }

  // ── Forbidden/Unauthorized ─────────────────────────────────────────────────
  if (error === "forbidden" || error === "unauthorized") {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🚫</span>
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">Access Denied</h3>
        <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
          you don't have permission to view this dashboard. Contact an admin to upgrade your role.
        </p>
        <Link href="/records" className="inline-block px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors">
          View Records →
        </Link>
      </div>
    );
  }

  // ── Fetch Error ────────────────────────────────────────────────────────────
  if (error === "fetch-failed") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl">⚠️</span>
        </div>
        <p className="text-red-700 font-semibold mb-1">Failed to load dashboard</p>
        <p className="text-sm text-red-600 mb-4">
          The backend server may not be running. Try accessing:{" "}
          <code className="bg-red-100 px-2 py-1 rounded text-xs">
            {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}
          </code>
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const income = parseFloat(summary.total_income || "0");
  const expense = parseFloat(summary.total_expense || "0");
  const net = parseFloat(summary.net_balance || "0");
  const hasData = income > 0 || expense > 0;
  const maxCat = Math.max(
    ...(summary.income_by_category.map(i => parseFloat(i.total)) || [1]),
    ...(summary.expense_by_category.map(i => parseFloat(i.total)) || [1]),
    1
  );

  return (
    <>
      {/* Role & User Info */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Viewing as</span>
          <span
            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              role === "admin"
                ? "bg-blue-100 text-blue-800"
                : role === "analyst"
                ? "bg-green-100 text-green-800"
                : "bg-purple-100 text-purple-800"
            }`}
          >
            {role}
          </span>
          {email && <span className="text-xs text-gray-500">({email})</span>}
        </div>
        <Link
          href="/records"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View Records →
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Total Income"
          value={summary.total_income}
          colorCls="bg-green-50 border-green-200 text-green-800"
          sub={`${summary.income_by_category.length} categories`}
        />
        <StatCard
          label="Total Expense"
          value={summary.total_expense}
          colorCls="bg-red-50 border-red-200 text-red-800"
          sub={`${summary.expense_by_category.length} categories`}
        />
        <StatCard
          label="Net Balance"
          value={summary.net_balance}
          colorCls={`border ${
            net >= 0
              ? "bg-blue-50 border-blue-200 text-blue-800"
              : "bg-orange-50 border-orange-200 text-orange-800"
          }`}
          sub={net >= 0 ? "Positive balance" : "Negative balance"}
        />
      </div>

      {/* No Data Nudge */}
      {!hasData && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6 flex items-center gap-4">
          <span className="text-3xl">💡</span>
          <div>
            <p className="text-sm font-semibold text-blue-800">No financial data yet</p>
            <p className="text-xs text-blue-600 mt-0.5">
              {role === "admin" ? (
                <>
                  <Link href="/records" className="underline font-medium">
                    Add records
                  </Link>{" "}
                  to populate your charts and analytics.
                </>
              ) : (
                "Ask an admin to add records to see insights."
              )}
            </p>
          </div>
        </div>
      )}

      {/* Monthly Trend Chart */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Monthly trends</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Income vs Expense vs Net over time
            </p>
          </div>
          {trends.length > 0 && (
            <span className="text-xs text-gray-400">
              {trends.length} month{trends.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div style={{ height: "280px", position: "relative" }}>
          {trends.length > 0 ? (
            <TrendChart trends={trends} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <p className="text-sm">No trend data available yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {[
          {
            title: "Income breakdown",
            items: summary.income_by_category,
            barColor: "bg-green-500",
            amtCls: "text-green-700",
          },
          {
            title: "Expense breakdown",
            items: summary.expense_by_category,
            barColor: "bg-red-500",
            amtCls: "text-red-700",
          },
        ].map((section) => (
          <div
            key={section.title}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
          >
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              {section.title}
            </h2>
            {section.items.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                No data available
              </p>
            ) : (
              <div className="space-y-3">
                {section.items.map((item) => (
                  <div key={item.category}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">
                        {item.category}
                      </span>
                      <span className={`text-sm font-semibold ${section.amtCls}`}>
                        ₹{parseFloat(item.total).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <DonutBar
                      label=""
                      value={parseFloat(item.total)}
                      max={maxCat}
                      color={section.barColor}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      {summary.recent_transactions.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Recent transactions
          </h2>
          <div className="space-y-2">
            {summary.recent_transactions.slice(0, 5).map((txn) => (
              <div
                key={txn.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {txn.category}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{txn.date}</p>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    txn.type === "income"
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {txn.type === "income" ? "+" : "-"}₹
                  {parseFloat(txn.amount).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
        <DashboardContent />
      </div>
    </ProtectedRoute>
  );
}