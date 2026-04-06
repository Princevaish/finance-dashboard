"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getUserRole, removeToken, UserRole } from "@/lib/auth";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<UserRole>(null);

  useEffect(() => {
    setRole(getUserRole());
  }, []);

  const logout = () => {
    removeToken();
    router.replace("/login");
  };

  // Base links — all authenticated users can see these
  const baseLinks = [{ href: "/dashboard", label: "Dashboard" }];

  // Add Records link for analyst and admin
  const hasRecords = role === "analyst" || role === "admin";
  const links = hasRecords
    ? [...baseLinks, { href: "/records", label: "Records" }]
    : baseLinks;

  // Add Users link for admin only
  const hasUsers = role === "admin";
  const allLinks = hasUsers
    ? [...links, { href: "/users", label: "Users" }]
    : links;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-semibold">F</span>
          </div>
          <span className="font-semibold text-gray-900 text-sm">FinanceDash</span>
        </Link>

        {/* Navigation Links + Logout */}
        <div className="flex items-center gap-1">
          {allLinks.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={
                  active
                    ? "px-3 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-700"
                    : "px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }
              >
                {l.label}
              </Link>
            );
          })}

          {/* Role Badge */}
          {role && (
            <div
              className={`ml-3 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                role === "admin"
                  ? "bg-blue-100 text-blue-800"
                  : role === "analyst"
                  ? "bg-green-100 text-green-800"
                  : "bg-purple-100 text-purple-800"
              }`}
            >
              {role}
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={logout}
            className="ml-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}