'use client';
import React from 'react';
import { User, Shield, CreditCard, Sparkles, Building2, Mail, MapPin, Briefcase } from 'lucide-react';

export default function ProfilePage() {
  const recruiter = {
    name: 'Jane Recruiter',
    email: 'tech@umurava.africa',
    role: 'Admin',
    company: 'Umurava',
    companyCode: 'UMURAVA-26',
    location: 'Kigali, Rwanda',
    joinDate: 'January 2026',
    plan: 'Pro',
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Profile</h1>
        <p className="text-slate-500 mt-1">Manage your account settings and preferences.</p>
      </header>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
          <div className="absolute -bottom-10 left-6">
            <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center text-3xl font-bold text-blue-600">
              {recruiter.name.charAt(0)}
            </div>
          </div>
        </div>
        <div className="pt-14 px-6 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{recruiter.name}</h2>
              <p className="text-slate-500 text-sm">{recruiter.role} at {recruiter.company}</p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
              ✅ Active
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-400" /> {recruiter.email}</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> {recruiter.location}</span>
            <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-slate-400" /> {recruiter.company}</span>
            <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-slate-400" /> Joined {recruiter.joinDate}</span>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
          <Shield className="w-5 h-5 text-slate-600" /> Account Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Company Code</label>
            <input type="text" disabled defaultValue={recruiter.companyCode} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-500 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Contact Email</label>
            <input type="email" defaultValue={recruiter.email} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Display Name</label>
            <input type="text" defaultValue={recruiter.name} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Role</label>
            <input type="text" disabled defaultValue={recruiter.role} className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-500 text-sm" />
          </div>
        </div>
      </div>

      {/* AI Engine Defaults */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 shadow-sm space-y-5">
        <h2 className="text-lg font-bold text-indigo-900 border-b border-indigo-200/50 pb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" /> AI Engine Preferences
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Gemini Model</label>
            <select className="w-full px-3 py-2 border border-indigo-200 rounded-lg bg-white text-sm">
              <option>gemini-2.5-flash</option>
              <option>gemini-2.0-pro</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Default Top-N Shortlist</label>
            <select className="w-full px-3 py-2 border border-indigo-200 rounded-lg bg-white text-sm">
              <option>10 candidates</option>
              <option>5 candidates</option>
              <option>15 candidates</option>
              <option>20 candidates</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-slate-600" /> Subscription
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-700">Current Plan: <span className="font-bold text-blue-600">Umurava {recruiter.plan}</span></p>
            <p className="text-xs text-slate-500 mt-1">Unlimited AI screenings · Unlimited jobs · Priority support</p>
          </div>
          <button className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm">
            Manage Plan
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm shadow-blue-200">
          Save Changes
        </button>
      </div>
    </div>
  );
}
