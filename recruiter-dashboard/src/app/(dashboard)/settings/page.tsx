import { User, Shield, CreditCard, Bell } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage organizational configurations and AI engine defaults.</p>
      </header>

      <div className="grid grid-cols-4 gap-8">
        <aside className="col-span-1 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg bg-slate-100 text-slate-900">
            <User className="w-4 h-4" /> Account
          </button>
        </aside>

        <div className="col-span-3 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-2">Profile Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="text-sm font-medium text-slate-700 block mb-1">Company Code</label>
                 <input type="text" disabled defaultValue="UMURAVA-26" className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-500" />
              </div>
              <div>
                 <label className="text-sm font-medium text-slate-700 block mb-1">Contact Email</label>
                 <input type="email" defaultValue="admin@umurava.com" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-indigo-900 border-b border-indigo-200/50 pb-2">AI Engine Defaults</h2>
            <div>
               <label className="text-sm font-medium text-slate-700 block mb-1">Gemini Model</label>
               <select className="w-full px-3 py-2 border border-indigo-200 rounded-lg bg-white">
                 <option>gemini-2.5-flash</option>
                 <option>gemini-2.0-pro</option>
               </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
