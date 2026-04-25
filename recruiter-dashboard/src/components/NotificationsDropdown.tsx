'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Sparkles, CreditCard, AlertCircle, CheckCircle, X, Briefcase } from 'lucide-react';

const ICON_MAP: Record<string, { icon: any; bg: string }> = {
  screening: { icon: Sparkles, bg: 'bg-indigo-100 text-indigo-600' },
  payment: { icon: CreditCard, bg: 'bg-amber-100 text-amber-600' },
  system: { icon: Briefcase, bg: 'bg-blue-100 text-blue-600' },
};

export default function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch real notifications from backend
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
      const res = await fetch(`${API}/api/notifications`, { cache: 'no-store' });
      const json = await res.json();
      if (json.data) setNotifications(json.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on first open
  const handleToggle = () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) fetchNotifications();
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleToggle}
        className="p-2 text-slate-400 hover:text-slate-600 relative transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[340px] sm:w-[380px] bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/80">
            <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-[11px] text-blue-600 font-semibold hover:underline">
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="p-6 text-center text-slate-400 text-sm">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">No notifications yet.</div>
            ) : notifications.map(notif => {
              const iconConfig = ICON_MAP[notif.type] || ICON_MAP.system;
              const Icon = iconConfig.icon;
              return (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                    !notif.read ? 'bg-blue-50/30' : ''
                  }`}
                  onClick={() => setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${iconConfig.bg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800 truncate">{notif.title}</p>
                      {!notif.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.description}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">{notif.time}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/80 text-center">
            <p className="text-[11px] text-slate-400 font-medium">You&apos;re all caught up! 🎉</p>
          </div>
        </div>
      )}
    </div>
  );
}
