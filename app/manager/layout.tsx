"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { TokenManager } from "@/services/http";
import {
  LogOut,
  Settings,
  Users,
  BookOpen,
  Layers,
  FileText,
  BarChart3,
  ClipboardCheck,
} from "lucide-react";
import { Toaster } from "react-hot-toast";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // Kiểm tra token đăng nhập
  useEffect(() => {
    const accessToken = TokenManager.getAccess();
    if (!accessToken) {
      router.push("/login");
    }
  }, [router]);

  // Hàm xác định route hiện tại
  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`);

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800">
      {/* Sidebar */}
      <Toaster position="top-right" reverseOrder={false} />
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-xl font-bold text-indigo-600">VocabGo</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/manager/dashboard"
            className={`flex items-center px-3 py-2 rounded-lg transition ${
              isActive("/manager/dashboard")
                ? "bg-indigo-100 text-indigo-700 font-medium"
                : "hover:bg-indigo-50 hover:text-indigo-600"
            }`}
          >
            <BarChart3 className="w-5 h-5 mr-3" />
            Dashboard
          </Link>

          <Link
            href="/manager/users"
            className={`flex items-center px-3 py-2 rounded-lg transition ${
              isActive("/manager/users")
                ? "bg-indigo-100 text-indigo-700 font-medium"
                : "hover:bg-indigo-50 hover:text-indigo-600"
            }`}
          >
            <Users className="w-5 h-5 mr-3" />
            Users
          </Link>

          <Link
            href="/manager/vocabulary"
            className={`flex items-center px-3 py-2 rounded-lg transition ${
              isActive("/manager/vocabulary")
                ? "bg-indigo-100 text-indigo-700 font-medium"
                : "hover:bg-indigo-50 hover:text-indigo-600"
            }`}
          >
            <BookOpen className="w-5 h-5 mr-3" />
            Vocabulary
          </Link>

          <Link
            href="/manager/learning"
            className={`flex items-center px-3 py-2 rounded-lg transition ${
              isActive("/manager/learning")
                ? "bg-indigo-100 text-indigo-700 font-medium"
                : "hover:bg-indigo-50 hover:text-indigo-600"
            }`}
          >
            <Layers className="w-5 h-5 mr-3" />
            Learning Path
          </Link>

          {/* <Link
            href="/manager/reports"
            className={`flex items-center px-3 py-2 rounded-lg transition ${
              isActive("/manager/reports")
                ? "bg-indigo-100 text-indigo-700 font-medium"
                : "hover:bg-indigo-50 hover:text-indigo-600"
            }`}
          >
            <BarChart3 className="w-5 h-5 mr-3" />
            Reports
          </Link> */}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-gray-200">
          {/* <Link
            href="/manager/settings"
            className={`flex items-center px-3 py-2 rounded-lg transition ${
              isActive("/manager/settings")
                ? "bg-indigo-100 text-indigo-700 font-medium"
                : "hover:bg-indigo-50 hover:text-indigo-600"
            }`}
          >
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </Link> */}

          <button
            onClick={() => {
              TokenManager.clearAccess();
              router.push("/login");
            }}
            className="flex w-full cursor-pointer items-center px-3 py-2 mt-2 text-left rounded-lg hover:bg-red-50 hover:text-red-600 transition"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-white flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-gray-200 bg-white">
          <h1 className="text-xl font-semibold text-gray-800">Manager Panel</h1>
          <div className="flex items-center space-x-4">
            <div className="text-gray-600">Xin chào, Admin</div>
            <div className="w-10 h-10 rounded-full bg-gray-300" />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">{children}</div>

        {/* Footer */}
        <footer className="h-12 flex items-center justify-center border-t border-gray-200 bg-white text-sm text-gray-500">
          © {new Date().getFullYear()} VocabGo – Manager System
        </footer>
      </main>
    </div>
  );
}
