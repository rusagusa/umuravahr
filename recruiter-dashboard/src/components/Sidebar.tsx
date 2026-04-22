'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, Users, Settings, Target } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Small utility combined for Tailwind class merging
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Sidebar() {
  const pathname = usePathname();

  const routes = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Jobs Hub', href: '/jobs', icon: Briefcase },
    { name: 'Candidates', href: '/candidates', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 shadow-2xl z-20">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3 text-white">
          <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight">Umurava</h1>
            <p className="text-xs text-blue-400 font-medium tracking-wide">Recruiter Engine</p>
          </div>
        </Link>
      </div>

      <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Main Menu
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-2">
        {routes.map((route) => {
          const isActive = pathname === route.href || (pathname.startsWith('/jobs') && route.href === '/jobs');
          return (
            <Link
              key={route.name}
              href={route.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-medium',
                isActive
                  ? 'bg-blue-600/10 text-blue-400 font-semibold'
                  : 'hover:bg-slate-800 hover:text-white'
              )}
            >
              <route.icon className={cn('w-5 h-5', isActive ? 'text-blue-500' : 'text-slate-400')} />
              {route.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-700 border border-slate-600 overflow-hidden flex items-center justify-center font-bold text-sm text-white">
            JD
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">Jane Doe</span>
            <span className="text-xs text-slate-500">Recruitment Dir.</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
