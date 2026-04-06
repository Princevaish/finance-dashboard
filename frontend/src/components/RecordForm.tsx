"use client";

import { useState, useEffect, FormEvent } from "react";

export interface RecordFormData {
  amount: string;
  type: "income" | "expense";
  category: string;
  date: string;
  notes: string;
}

interface RecordFormProps {
  initial?: RecordFormData;
  onSubmit: (data: RecordFormData) => Promise<void>;
  onCancel: () => void;
  title: string;
}

const EMPTY: RecordFormData = {
  amount: "", type: "income", category: "", date: new Date().toISOString().slice(0, 10), notes: "",
};

export default function RecordForm({ initial, onSubmit, onCancel, title }: RecordFormProps) {
  const [form,    setForm]    = useState<RecordFormData>(initial ?? EMPTY);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => { setForm(initial ?? EMPTY); }, [initial]);

  const set = (k: keyof RecordFormData, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.amount || isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0) {
      setError("Amount must be a positive number."); return;
    }
    if (!form.category.trim()) { setError("Category is required."); return; }
    if (!form.date)             { setError("Date is required."); return; }
    setSaving(true);
    try {
      await onSubmit(form);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save record.");
    } finally {
      setSaving(false);
    }
  };

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount + Type row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Amount (₹)</label>
              <input
                type="number" step="0.01" min="0.01" required
                value={form.amount} onChange={e => set("amount", e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
              <select
                value={form.type} onChange={e => set("type", e.target.value as "income" | "expense")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
            <input
              type="text" required maxLength={100}
              value={form.category} onChange={e => set("category", e.target.value)}
              placeholder="e.g. Salary, Rent, Groceries"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
            <input
              type="date" required
              value={form.date} onChange={e => set("date", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes <span className="text-gray-400">(optional)</span></label>
            <textarea
              rows={2} maxLength={1000}
              value={form.notes} onChange={e => set("notes", e.target.value)}
              placeholder="Any additional details..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onCancel} className="flex-1 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors flex items-center justify-center gap-2">
              {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</> : "Save Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}