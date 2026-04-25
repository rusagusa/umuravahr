'use client';
import React from 'react';
import Link from 'next/link';
import { User } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import NotificationsDropdown from '@/components/NotificationsDropdown';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 lg:px-10 flex-shrink-0">
          <div className="flex items-center">
            {/* Mobile menu placeholder */}
          </div>
          <div className="flex items-center space-x-4">
            <NotificationsDropdown />
            <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200 overflow-hidden">
                <User className="w-5 h-5" />
              </div>
              <div className="hidden md:block text-sm">
                <p className="font-medium text-slate-700">Jane Recruiter</p>
                <p className="text-slate-500 text-xs">Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
