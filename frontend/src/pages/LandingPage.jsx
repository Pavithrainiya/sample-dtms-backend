import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Users, LayoutDashboard, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-sans selection:bg-blue-200">
      
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/70 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
               <span className="text-white font-bold text-xl leading-none">D</span>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">DTMS</span>
          </div>
          <div className="flex gap-4 items-center">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="text-sm font-medium bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 hover:shadow-lg transition-all active:scale-95">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            Manage your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Digital Talent</span><br className="hidden md:block"/> seamlessly.
          </h1>
          <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            The ultimate platform to assign tasks, track completions, and effortlessly manage user submissions in a secure, role-based environment.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="inline-flex justify-center items-center gap-2 bg-blue-600 text-white text-lg font-medium px-8 py-3.5 rounded-full hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/20 transition-all active:scale-95">
              Create an Account <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="inline-flex justify-center items-center gap-2 bg-white text-slate-700 text-lg font-medium px-8 py-3.5 rounded-full border border-slate-200 hover:border-blue-200 hover:bg-blue-50 transition-all active:scale-95">
              Sign In to Dashboard
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <LayoutDashboard size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Intuitive Dashboards</h3>
            <p className="text-slate-600 leading-relaxed">Beautifully structured interfaces for both administrators and general users to stay fully organized.</p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow delay-100">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Task Management</h3>
            <p className="text-slate-600 leading-relaxed">Assign tasks with deadlines, view interactive analytics, and easily approve user submissions.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow delay-200">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Role-Based Access</h3>
            <p className="text-slate-600 leading-relaxed">Enterprise-grade JWT authentication securing application routes specifically for Admins or standard Users.</p>
          </div>
        </div>
      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </div>
  );
}
