"use client";

import { useEffect, useState, useCallback } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import RecordForm, { RecordFormData } from "@/components/RecordForm";
import { getToken, getUserRole, getUserEmail, UserRole } from "@/lib/auth";
import api from "@/lib/api";

interface RecordItem {
  id: number;
  amount: string;
  type: "income" | "expense";
  category: string;
  date: string;
  notes: string | null;
}

interface PaginatedRecords {
  items: RecordItem[];
  total: number;
  has_more: boolean;
}

const PAGE_SIZE = 20;

function RecordsContent() {
  const [role, setRole] = useState<UserRole>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  
  // Filter states
  const [typeFilter, setTypeFilter] = useState<"" | "income" | "expense">("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RecordItem | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
  const isAdmin = role === "admin";

  const fetchRecords = useCallback(
    async (off: number) => {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(off),
      });
      if (typeFilter) params.set("type", typeFilter);
      if (categoryFilter) params.set("category", categoryFilter);
      if (startDate) params.set("start_date", startDate);
      if (endDate) params.set("end_date", endDate);

      try {
        const response = await api.get<PaginatedRecords>(
          `/records/?${params}`
        );
        setRecords(response.data.items);
        setTotal(response.data.total);
        setHasMore(response.data.has_more);
      } catch (err: any) {
        console.error("Records fetch error:", err);
        setError("Failed to load records. Check the backend is running.");
      } finally {
        setLoading(false);
      }
    },
    [typeFilter, categoryFilter, startDate, endDate]
  );

  useEffect(() => {
    setRole(getUserRole());
    setEmail(getUserEmail());
    fetchRecords(0);
    setOffset(0);
  }, [typeFilter, categoryFilter, startDate, endDate, fetchRecords]);

  const handleCreate = async (data: RecordFormData) => {
    try {
      await api.post("/records/", {
        amount: parseFloat(data.amount),
        type: data.type,
        category: data.category.trim(),
        date: data.date,
        notes: data.notes.trim() || null,
      });
      setShowForm(false);
      setOffset(0);
      fetchRecords(0);
    } catch (err: any) {
      const message = err.response?.data?.detail || `Error ${err.response?.status}`;
      alert(`Failed to create record: ${message}`);
    }
  };

  const handleUpdate = async (data: RecordFormData) => {
    if (!editingRecord) return;
    try {
      await api.put(`/records/${editingRecord.id}`, {
        amount: parseFloat(data.amount),
        type: data.type,
        category: data.category.trim(),
        date: data.date,
        notes: data.notes.trim() || null,
      });
      setEditingRecord(null);
      fetchRecords(offset);
    } catch (err: any) {
      const message = err.response?.data?.detail || `Error ${err.response?.status}`;
      alert(`Failed to update record: ${message}`);
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await api.delete(`/records/${deleteId}`);
      setDeleteId(null);
      fetchRecords(offset);
    } catch (err: any) {
      setError("Failed to delete record.");
    } finally {
      setDeleting(false);
    }
  };

  const editInitial: RecordFormData | undefined = editingRecord
    ? {
        amount: editingRecord.amount,
        type: editingRecord.type,
        category: editingRecord.category,
        date: editingRecord.date,
        notes: editingRecord.notes ?? "",
      }
    : undefined;

  return (
    <>
      {/* Header Row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Records</h1>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? "Loading..." : `${total} record${total !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {role && (
            <span
              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                role === "admin"
                  ? "bg-blue-100 text-blue-800"
                  : role === "analyst"
                  ? "bg-green-100 text-green-800"
                  : "bg-purple-100 text-purple-800"
              }`}
            >
              {role}
            </span>
          )}
          {isAdmin && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span className="text-base leading-none">+</span> Add Record
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-sm">
        <p className="text-xs font-semibold text-gray-600 uppercase mb-3">Filters</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as "" | "income" | "expense")}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          {/* Category Filter */}
          <input
            type="text"
            placeholder="Filter by category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Start Date Filter */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* End Date Filter */}
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Clear Filters Button */}
          <button
            onClick={() => {
              setTypeFilter("");
              setCategoryFilter("");
              setStartDate("");
              setEndDate("");
            }}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg px-3 py-2 transition-colors"
          >
            Clear filters
          </button>
        </div>
      </div>

      {/* Summary Strip */}
      {!loading && records.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            {
              label: "Showing",
              value: `${records.length} of ${total}`,
              color: "text-gray-900",
            },
            {
              label: "Income",
              value: `₹${records
                .filter((r) => r.type === "income")
                .reduce((a, r) => a + parseFloat(r.amount), 0)
                .toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
              color: "text-green-700",
            },
            {
              label: "Expense",
              value: `₹${records
                .filter((r) => r.type === "expense")
                .reduce((a, r) => a + parseFloat(r.amount), 0)
                .toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
              color: "text-red-700",
            },
            {
              label: "Net",
              value: `₹${(
                records
                  .filter((r) => r.type === "income")
                  .reduce((a, r) => a + parseFloat(r.amount), 0) -
                records
                  .filter((r) => r.type === "expense")
                  .reduce((a, r) => a + parseFloat(r.amount), 0)
              ).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
              color: "text-blue-700",
            },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-400 mb-0.5">{s.label}</p>
              <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="h-9 bg-gray-100 rounded-lg animate-pulse w-24" />
                <div className="h-9 bg-gray-100 rounded-lg animate-pulse flex-1" />
                <div className="h-9 bg-gray-100 rounded-lg animate-pulse w-20" />
                <div className="h-9 bg-gray-100 rounded-lg animate-pulse w-28" />
              </div>
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="py-24 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-700 font-semibold mb-1">
              {typeFilter || categoryFilter || startDate || endDate
                ? "No records match your filters"
                : "No records available yet"}
            </p>
            <p className="text-sm text-gray-400 mb-6">
              {typeFilter || categoryFilter || startDate || endDate
                ? "Try adjusting your filters to see results."
                : "Financial records will appear here once added."}
            </p>
            <div className="flex gap-3 justify-center">
              {(typeFilter || categoryFilter || startDate || endDate) && (
                <button
                  onClick={() => {
                    setTypeFilter("");
                    setCategoryFilter("");
                    setStartDate("");
                    setEndDate("");
                    setOffset(0);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Clear filters
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  Add first record
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Category
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Type
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Amount
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
                    Notes
                  </th>
                  {isAdmin && (
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {records.map((rec, i) => (
                  <tr
                    key={rec.id}
                    className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} border-b border-gray-100 hover:bg-blue-50 transition-colors`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {new Date(rec.date).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {rec.category}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          rec.type === "income"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {rec.type}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 text-sm font-semibold text-right ${
                        rec.type === "income"
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {rec.type === "income" ? "+" : "-"}₹
                      {parseFloat(rec.amount).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell truncate">
                      {rec.notes || "-"}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-sm text-right">
                        <button
                          onClick={() => setEditingRecord(rec)}
                          className="text-blue-600 hover:text-blue-800 font-medium mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(rec.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && records.length > 0 && (hasMore || offset > 0) && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            disabled={offset === 0}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            {Math.floor(offset / PAGE_SIZE) + 1} of{" "}
            {Math.ceil(total / PAGE_SIZE)}
          </span>
          <button
            onClick={() => setOffset(offset + PAGE_SIZE)}
            disabled={!hasMore}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Forms */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-md w-full mx-4 p-6">
            <RecordForm
              initial={undefined}
              onSubmit={handleCreate}
              onCancel={() => setShowForm(false)}
              title="Add Record"
            />
          </div>
        </div>
      )}

      {editingRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-md w-full mx-4 p-6">
            <RecordForm
              initial={editInitial}
              onSubmit={handleUpdate}
              onCancel={() => setEditingRecord(null)}
              title="Edit Record"
            />
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full mx-4 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Delete Record?</h2>
            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function RecordsPage() {
  return (
    <ProtectedRoute>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-6">
        <RecordsContent />
      </div>
    </ProtectedRoute>
  );
}