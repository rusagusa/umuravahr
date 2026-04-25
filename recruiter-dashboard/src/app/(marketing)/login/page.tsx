"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate 1-second loading state
    setTimeout(() => {
      setIsLoading(false);
      router.push("/onboarding");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 selection:bg-indigo-100 selection:text-indigo-900">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-2xl leading-none">U</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">Welcome back</h2>
          <p className="text-center text-slate-500 mb-8 border-b border-slate-100 pb-8">
            Log in to your Umurava account to continue
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                defaultValue="recruiter@example.com"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-slate-900"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-slate-700" htmlFor="password">
                  Password
                </label>
                <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-700">
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                type="password"
                required
                defaultValue="password123"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-slate-900"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all flex justify-center items-center gap-2 mt-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <div className="bg-slate-50 px-8 py-5 text-center text-sm text-slate-600 border-t border-slate-100">
          Don&apos;t have an account?{" "}
          <a href="#" className="font-semibold text-blue-600 hover:text-blue-700">
            Start hiring now
          </a>
        </div>
      </div>
    </div>
  );
}
