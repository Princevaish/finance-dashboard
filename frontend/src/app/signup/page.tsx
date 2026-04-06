"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

type Role = "viewer" | "analyst" | "admin";

const ROLES: { value: Role; label: string; description: string; icon: string; color: string }[] = [
  {
    value:       "viewer",
    label:       "Viewer",
    description: "Read-only access to financial records.",
    icon:        "👁️",
    color:       "border-purple-200 bg-purple-50 text-purple-800",
  },
  {
    value:       "analyst",
    label:       "Analyst",
    description: "View records and access dashboard analytics.",
    icon:        "📊",
    color:       "border-green-200 bg-green-50 text-green-800",
  },
  {
    value:       "admin",
    label:       "Admin",
    description: "Full access — create, update, and delete records.",
    icon:        "⚙️",
    color:       "border-blue-200 bg-blue-50 text-blue-800",
  },
];

export default function SignupPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [role,     setRole]     = useState<Role>("viewer");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      await axios.post(
        `${BASE}/auth/register`,
        { email, password, role },
        { headers: { "Content-Type": "application/json" } }
      );
      router.replace(`/login?registered=1&role=${role}`);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          setError("Cannot reach server. Make sure the backend is running.");
        } else if (err.response.status === 400) {
          const detail = err.response.data?.detail;
          setError(typeof detail === "string" ? detail : "Registration failed.");
        } else {
          setError(`Error ${err.response.status}. Please try again.`);
        }
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = ROLES.find(r => r.value === role)!;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 mb-4 cursor-pointer">
              <span className="text-white text-xl font-bold">F</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">Choose your role and start managing finances</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email" required autoComplete="email"
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
                <span className="ml-1 text-xs font-normal text-gray-400">(min 8 characters)</span>
              </label>
              <input
                type="password" required autoComplete="new-password"
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              />
              {/* Password strength indicator */}
              <div className="flex gap-1 mt-2">
                {[1, 2, 3].map(level => (
                  <div key={level} className={`h-1 flex-1 rounded-full transition-colors ${
                    password.length === 0 ? "bg-gray-200" :
                    password.length < 8  ? (level === 1 ? "bg-red-400" : "bg-gray-200") :
                    password.length < 12 ? (level <= 2 ? "bg-yellow-400" : "bg-gray-200") :
                    "bg-green-500"
                  }`} />
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {password.length === 0 ? "" : password.length < 8 ? "Too short" : password.length < 12 ? "Good" : "Strong"}
              </p>
            </div>

            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select your role</label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${
                      role === r.value
                        ? `border-blue-500 bg-blue-50`
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-xl">{r.icon}</span>
                    <span className={`text-xs font-semibold ${role === r.value ? "text-blue-700" : "text-gray-700"}`}>
                      {r.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Selected role description card */}
              <div className={`mt-3 rounded-xl border px-4 py-3 flex items-start gap-3 ${selectedRole.color}`}>
                <span className="text-lg mt-0.5">{selectedRole.icon}</span>
                <div>
                  <p className="text-xs font-semibold">{selectedRole.label}</p>
                  <p className="text-xs opacity-80 mt-0.5">{selectedRole.description}</p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                `Create ${selectedRole.label} Account`
              )}
            </button>

          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}