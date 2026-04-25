import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <div className="text-center max-w-md animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-100">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">404</h1>
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Page Not Found</h2>
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-5 py-3 mb-8">
          <p className="text-sm text-amber-800 font-medium">
            ⚠️ This feature has been deactivated for the hackathon demo.
          </p>
        </div>
        <Link 
          href="/" 
          className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg shadow-blue-200"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
