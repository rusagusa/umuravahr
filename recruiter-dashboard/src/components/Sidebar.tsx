'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Briefcase, 
  Users, 
  LayoutDashboard, 
  CreditCard, 
  FileText, 
  Settings, 
  LogOut, 
  User, 
  MessageSquare, 
  UserCircle,
  Menu,
  X
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/jobs', label: 'Job Board', icon: Briefcase },
    { href: '/candidates', label: 'My Workforce', icon: Users },
    { href: '/talents', label: 'Talents', icon: User },
    { href: '#', label: 'Management', icon: Settings },
    { href: '#', label: 'Payments', icon: CreditCard },
    { href: '#', label: 'Messages', icon: MessageSquare },
    { href: '#', label: 'Reports', icon: FileText },
    { href: '/profile', label: 'Profile', icon: UserCircle },
  ];

  const navContent = (
    <>
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
              <span className="text-blue-600 font-bold text-xl leading-none">U</span>
            </div>
            <span className="font-bold tracking-tight text-white text-xl">Umurava</span>
          </div>
          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-white/80 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <nav className="px-4 pb-4 mt-6 space-y-1 overflow-y-auto flex-1 flex flex-col gap-1 text-blue-100">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== '#' && pathname.startsWith(link.href));
          return (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-md transition-colors ${
                isActive
                  ? 'bg-white/10 text-white font-bold'
                  : 'hover:bg-blue-500 hover:text-white'
              }`}
            >
              <link.icon className={`w-[18px] h-[18px] ${isActive ? 'text-white' : 'text-blue-200'}`} />
              <span className="text-[13px]">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-4">
        <hr className="border-blue-400/30 mb-4" />
      </div>

      <div className="pb-8 px-4">
         <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center w-full space-x-3 px-4 py-2.5 text-blue-100 hover:bg-white/10 hover:text-white rounded-md transition-colors"
         >
            <LogOut className="w-[18px] h-[18px] text-blue-200" />
            <span className="text-[13px]">Logout</span>
         </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        style={{ display: mobileOpen ? 'none' : undefined }}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — always visible on md+, drawer on mobile */}
      <aside className={`
        bg-blue-600 flex-shrink-0 flex flex-col text-white min-h-screen text-sm font-medium
        fixed md:relative z-50 md:z-auto
        w-[260px] md:w-[230px]
        transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {navContent}
      </aside>
    </>
  );
}
