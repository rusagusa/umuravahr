import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-blue-600 selection:bg-white/20 selection:text-white">
      {/* Navigation */}
      <header className="flex h-24 items-center justify-between px-6 lg:px-16 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
            <span className="text-blue-600 font-extrabold text-2xl leading-none">U</span>
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">Umurava</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-white/90">
          <Link href="#" className="flex items-center hover:text-white transition-colors">
            For Companies <ChevronDown className="w-4 h-4 ml-1 opacity-70" />
          </Link>
          <Link href="#" className="flex items-center hover:text-white transition-colors">
            For Talents <ChevronDown className="w-4 h-4 ml-1 opacity-70" />
          </Link>
          <Link href="#" className="flex items-center hover:text-white transition-colors">
            For Ecosystem <ChevronDown className="w-4 h-4 ml-1 opacity-70" />
          </Link>
          <Link href="#" className="flex items-center hover:text-white transition-colors">
            About Us <ChevronDown className="w-4 h-4 ml-1 opacity-70" />
          </Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="text-[15px] font-medium bg-white text-blue-600 px-7 py-2.5 rounded-full hover:bg-slate-50 hover:shadow-lg transition-all"
          >
            Login
          </Link>
          <Link
            href="/login"
            className="text-[15px] font-medium bg-blue-500/50 text-white px-7 py-2.5 rounded-full hover:bg-blue-500 hover:shadow-lg transition-all border border-blue-400/30 backdrop-blur-md"
          >
            Hire Now
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center px-6 lg:px-16 pt-10 pb-20 relative overflow-hidden">
        
        {/* Subtle background glow to add depth */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/30 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-3xl -z-10"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full max-w-7xl mx-auto z-10">
          
          {/* Left Content */}
          <div className="space-y-8 max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.15] tracking-tight">
              Your Talent Marketplace Platform to Hire Africa&apos;s Vetted Digital Talents
            </h1>
            
            <p className="text-lg md:text-xl text-blue-100/90 leading-relaxed font-medium max-w-xl">
              Umurava is where companies hire and outsource Africa&apos;s vetted talents and teams specialized in digital careers, ready for full-time, freelance, or outsourced projects. <span className="font-bold text-white">Faster. Easier. More cost-effective.</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-5 pt-2">
              <Link
                href="/login"
                className="flex items-center justify-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-bold hover:bg-slate-50 hover:shadow-xl hover:-translate-y-0.5 transition-all w-full sm:w-auto"
              >
                Hire Talents <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="https://umurava.africa/talent/job-board/explore"
                className="flex items-center justify-center gap-3 bg-transparent text-white px-8 py-4 rounded-full text-lg font-bold border-2 border-white/30 hover:border-white hover:bg-white/5 transition-all w-full sm:w-auto"
              >
                Apply for Jobs <ArrowRight className="w-5 h-5 opacity-70" />
              </Link>
            </div>
          </div>

          {/* Right Visual (Abstract Dotted Map & Nodes) */}
          <div className="hidden lg:flex relative h-[600px] w-full justify-center items-center">
            
            {/* The dotted map visualization simulation */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.2)_1px,_transparent_1.5px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_at_center,_black_30%,_transparent_70%)] opacity-80" />
            
            {/* Connecting lines */}
            <svg className="absolute inset-0 w-full h-full" style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' }}>
              <path d="M 200,150 Q 350,250 450,200 T 500,350 T 400,450 T 250,300 Z" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" />
              <path d="M 200,150 Q 150,300 250,300" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse delay-75" />
            </svg>
            
            {/* Avatar Nodes */}
            <div className="absolute top-[20%] left-[30%] animate-bounce" style={{ animationDuration: '4s' }}>
              <div className="w-12 h-12 bg-white rounded-full p-1 shadow-2xl relative">
                <div className="absolute -inset-2 bg-white/20 rounded-full animate-ping opacity-50" />
                <img src="https://ui-avatars.com/api/?name=MK&background=random" className="w-full h-full rounded-full" alt="Talent" />
              </div>
            </div>

            <div className="absolute top-[45%] left-[20%] animate-bounce" style={{ animationDuration: '5s', animationDelay: '1s' }}>
              <div className="w-14 h-14 bg-white rounded-full p-1 shadow-2xl relative">
                <div className="absolute -inset-2 bg-white/20 rounded-full animate-ping opacity-50 delay-700" />
                <img src="https://ui-avatars.com/api/?name=JD&background=random" className="w-full h-full rounded-full" alt="Talent" />
              </div>
            </div>

            <div className="absolute top-[30%] right-[25%] animate-bounce" style={{ animationDuration: '4.5s', animationDelay: '0.5s' }}>
              <div className="w-10 h-10 bg-white rounded-full p-1 shadow-2xl relative">
                 <img src="https://ui-avatars.com/api/?name=AR&background=random" className="w-full h-full rounded-full" alt="Talent" />
              </div>
            </div>
            
            <div className="absolute bottom-[20%] right-[30%] animate-bounce" style={{ animationDuration: '5.5s', animationDelay: '1.5s' }}>
              <div className="w-16 h-16 bg-white rounded-full p-1 shadow-2xl relative">
                <div className="absolute -inset-2 bg-white/20 rounded-full animate-ping opacity-50 delay-1000" />
                <img src="https://ui-avatars.com/api/?name=EK&background=random" className="w-full h-full rounded-full" alt="Talent" />
              </div>
            </div>

            <div className="absolute bottom-[40%] left-[45%] animate-bounce" style={{ animationDuration: '4.2s', animationDelay: '0.8s' }}>
              <div className="w-12 h-12 bg-white rounded-full p-1 shadow-2xl relative">
                <img src="https://ui-avatars.com/api/?name=ST&background=random" className="w-full h-full rounded-full" alt="Talent" />
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
