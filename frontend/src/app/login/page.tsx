"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { setToken, getToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface LoginResponse {
  access_token: string;
  token_type: string;
}

const ROLE_LABELS: Record<string, string> = {
  viewer: "Viewer",
  analyst: "Analyst",
  admin: "Admin",
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // ✅ Safe client-side execution
    if (typeof window === "undefined") return;

    // Redirect if already logged in
    if (getToken()) {
      router.replace("/dashboard");
      return;
    }

    // ✅ Replace useSearchParams with browser-safe logic
    const url = new URL(window.location.href);
    if (url.searchParams.get("registered")) {
      const role = url.searchParams.get("role") ?? "viewer";
      setSuccess(
        `Account created as ${ROLE_LABELS[role] ?? role}. Sign in below.`
      );
    }
  }, [router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const BASE =
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:8000/api/v1";

      const { data } = await axios.post<LoginResponse>(
        `${BASE}/auth/login`,
        new URLSearchParams({
          username: email,
          password,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      setToken(data.access_token);
      router.replace("/dashboard");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          setError("Cannot reach server. Check backend URL.");
        } else if (err.response.status === 401) {
          setError("Invalid email or password.");
        } else {
          setError(`Error ${err.response.status}. Try again.`);
        }
      } else {
        setError("Unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 mb-4 cursor-pointer">
              <span className="text-white text-xl font-bold">F</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">
            Sign in to your account
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          No account?{" "}
          <Link
            href="/signup"
            className="text-blue-600 hover:underline font-medium"
          >
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}