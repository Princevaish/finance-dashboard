"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, getUserRole, UserRole } from "@/lib/auth";

interface Props {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

export default function RoleProtectedRoute({ children, allowedRoles, fallbackPath = "/dashboard" }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "authed" | "rejected">("checking");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setStatus("rejected");
      router.replace("/login");
      return;
    }

    const role = getUserRole();
    if (!role || !allowedRoles.includes(role)) {
      setStatus("rejected");
      router.replace(fallbackPath);
      return;
    }

    setStatus("authed");
  }, []);

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
    return null;
  }

  return <>{children}</>;
}
