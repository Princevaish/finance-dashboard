"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  // Three states: "checking" | "authed" | "rejected"
  const [status, setStatus] = useState<"checking" | "authed" | "rejected">("checking");

  useEffect(() => {
    // This runs only on the client, after hydration — localStorage is safe here
    const token = getToken();
    console.debug("[ProtectedRoute] token found:", !!token);
    if (token) {
      setStatus("authed");
    } else {
      setStatus("rejected");
      router.replace("/login");
    }
  }, []); // Empty deps — runs exactly once on mount, never again

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "rejected") {
    // Render nothing while redirect is in flight
    return null;
  }

  // status === "authed" — render children unconditionally
  return <>{children}</>;
}