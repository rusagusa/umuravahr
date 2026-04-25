"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Building, Briefcase, ChevronRight, Loader2 } from "lucide-react";

type Step = 1 | 2;

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    companyName: "",
    role: "Recruiter",
    talent: {
      software: false,
      data: false,
      uiux: false,
    }
  });

  const nextStep = () => setStep(2);
  const prevStep = () => setStep(1);

  const handleComplete = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-20 px-4 pb-12 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Progress Header */}
      <div className="w-full max-w-2xl mb-12">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${step >= 1 ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-slate-200 text-slate-500'}`}>
              1
            </div>
            <span className={`text-sm font-medium ${step >= 1 ? 'text-slate-900' : 'text-slate-500'}`}>Workspace</span>
          </div>
          <div className={`flex-1 h-1 mx-4 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${step >= 2 ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-slate-200 text-slate-500'}`}>
              2
            </div>
            <span className={`text-sm font-medium ${step >= 2 ? 'text-slate-900' : 'text-slate-500'}`}>Talent</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        {step === 1 ? (
          <div className="p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Set up your workspace</h2>
            <p className="text-slate-500 mb-8 border-b border-slate-100 pb-8 tracking-wide">
              Tell us a bit about your company to personalize your experience.
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Company Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-slate-900"
                    placeholder="e.g. Acme Inc"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Role
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-slate-400" />
                  </div>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-slate-900 appearance-none bg-white"
                  >
                    <option value="Recruiter">Technical Recruiter</option>
                    <option value="Hiring Manager">Hiring Manager</option>
                    <option value="Founder/CEO">Founder / CEO</option>
                    <option value="HR Director">HR Director</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={nextStep}
                  disabled={!formData.companyName.trim()}
                  className="w-full bg-blue-600 text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all flex justify-center items-center gap-2 disabled:bg-blue-300 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">What talent are you sourcing?</h2>
            <p className="text-slate-500 mb-8 border-b border-slate-100 pb-8 tracking-wide">
              Select the disciplines you are actively hiring for.
            </p>

            <div className="space-y-4 mb-8">
              {/* Option 1 */}
              <label className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.talent.software ? 'border-blue-600 bg-blue-50/50 shadow-md shadow-blue-100' : 'border-slate-100 hover:border-slate-200 bg-white'}`}>
                <div className="flex items-center h-6">
                  <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${formData.talent.software ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                    {formData.talent.software && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                </div>
                <div className="ml-4">
                  <span className={`block text-sm font-semibold ${formData.talent.software ? 'text-blue-900' : 'text-slate-900'}`}>Software Engineering</span>
                  <span className="block text-sm text-slate-500 mt-1">Full-stack, frontend, backend &amp; mobile devs.</span>
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={formData.talent.software}
                  onChange={() => setFormData({...formData, talent: {...formData.talent, software: !formData.talent.software}})}
                />
              </label>

              {/* Option 2 */}
              <label className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.talent.data ? 'border-blue-600 bg-blue-50/50 shadow-md shadow-blue-100' : 'border-slate-100 hover:border-slate-200 bg-white'}`}>
                <div className="flex items-center h-6">
                  <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${formData.talent.data ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                    {formData.talent.data && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                </div>
                <div className="ml-4">
                  <span className={`block text-sm font-semibold ${formData.talent.data ? 'text-blue-900' : 'text-slate-900'}`}>Data &amp; AI</span>
                  <span className="block text-sm text-slate-500 mt-1">Data scientists, ML engineers, analysts.</span>
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={formData.talent.data}
                  onChange={() => setFormData({...formData, talent: {...formData.talent, data: !formData.talent.data}})}
                />
              </label>

              {/* Option 3 */}
              <label className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.talent.uiux ? 'border-blue-600 bg-blue-50/50 shadow-md shadow-blue-100' : 'border-slate-100 hover:border-slate-200 bg-white'}`}>
                <div className="flex items-center h-6">
                  <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${formData.talent.uiux ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                    {formData.talent.uiux && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                </div>
                <div className="ml-4">
                  <span className={`block text-sm font-semibold ${formData.talent.uiux ? 'text-blue-900' : 'text-slate-900'}`}>Product &amp; UX/UI</span>
                  <span className="block text-sm text-slate-500 mt-1">Product managers, UX researchers, designers.</span>
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={formData.talent.uiux}
                  onChange={() => setFormData({...formData, talent: {...formData.talent, uiux: !formData.talent.uiux}})}
                />
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={prevStep}
                className="px-6 py-3.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all border border-slate-200"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={isLoading || (!formData.talent.software && !formData.talent.data && !formData.talent.uiux)}
                className="flex-1 bg-blue-600 text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all flex justify-center items-center gap-2 disabled:bg-blue-300 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Finishing setup...
                  </>
                ) : (
                  "Complete Setup"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
