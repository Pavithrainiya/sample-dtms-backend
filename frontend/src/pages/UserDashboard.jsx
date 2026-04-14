import { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { 
  Search, CheckCircle, Clock, AlertCircle, Calendar, 
  LayoutDashboard, Settings, Menu, ExternalLink, CalendarPlus
} from 'lucide-react';
import { generateGoogleCalendarLink } from '../utils/CalendarUtils';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie, Legend 
} from 'recharts';
import MissionAnalyst from '../components/MissionAnalyst';

export default function UserDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_tasks: 0, completed_tasks: 0, pending_tasks: 0, completion_rate: 0 });
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab State
  const [activeTab, setActiveTab] = useState('overview'); // overview, assigned, completed
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, tasksRes, subsRes] = await Promise.all([
        api.get('/tasks/dashboard/stats/'),
        api.get('/tasks/tasks/'),
        api.get('/tasks/submissions/')
      ]);
      setStats(statsRes.data);
      setTasks(tasksRes.data);
      setSubmissions(subsRes.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const mySubmissionsMap = useMemo(() => {
    const map = {};
    submissions.forEach(s => map[s.task] = s);
    return map;
  }, [submissions]);

  // Chart Data Preparation
  const chartData = useMemo(() => [
    { name: 'Completed', value: stats.completed_tasks, color: '#10b981' },
    { name: 'In Progress', value: stats.pending_tasks, color: '#f59e0b' },
    { name: 'Available', value: Math.max(0, stats.total_tasks - stats.completed_tasks - stats.pending_tasks), color: '#cbd5e1' }
  ], [stats]);

  // Derived Task Lists
  const assignedTasks = useMemo(() => {
    return tasks.filter(t => !mySubmissionsMap[t.id] || mySubmissionsMap[t.id].status !== 'Reviewed');
  }, [tasks, mySubmissionsMap]);

  const completedTasks = useMemo(() => {
    return tasks.filter(t => mySubmissionsMap[t.id] && mySubmissionsMap[t.id].status === 'Reviewed');
  }, [tasks, mySubmissionsMap]);

  // Display array based on tab & search
  const displayTasks = useMemo(() => {
    let source = [];
    if (activeTab === 'assigned') source = assignedTasks;
    else if (activeTab === 'completed') source = completedTasks;
    else source = tasks; // overview shows all

    return source.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [activeTab, assignedTasks, completedTasks, tasks, searchTerm]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 18) return 'Good Afternoon';
    if (hour >= 18 && hour < 22) return 'Good Evening';
    return 'Good Night';
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-sm border-r flex flex-col hidden lg:flex z-10">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-4">
             <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
               <span className="text-white font-black text-xl leading-none">D</span>
             </div>
             <span className="text-2xl font-black text-slate-800 tracking-tight">DTMS</span>
          </div>
          <div className="flex items-center gap-3 mt-6">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
               {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 leading-tight">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.role}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 mt-6 px-4 space-y-2">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'overview' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
            <LayoutDashboard size={18} /> Overview
          </button>
          <button onClick={() => setActiveTab('assigned')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'assigned' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
            <CheckCircle size={18} /> Assigned Tasks
          </button>
          <button onClick={() => setActiveTab('completed')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'completed' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
            <Calendar size={18} /> Completed Tasks
          </button>
          <Link to="/profile" className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl font-bold transition-all mt-4 border border-transparent hover:border-slate-200">
            <Settings size={18} /> Profile & Identity
          </Link>
        </nav>
        <div className="p-4 border-t bg-slate-50/50">
          <button onClick={logout} className="w-full text-left px-4 py-2.5 text-slate-600 font-bold hover:bg-white hover:text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-100 hover:shadow-sm flex items-center gap-3">
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
        {/* Mobile Header Top Navbar */}
        <div className="mb-6 flex justify-between items-center lg:hidden bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
             <button className="text-slate-500 hover:text-blue-600"><Menu size={24}/></button>
             <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs">D</div> DTMS
             </h2>
          </div>
          <button onClick={logout} className="text-red-600 font-bold text-sm bg-red-50 px-4 py-2 rounded-lg border border-red-100">Logout</button>
        </div>

        {/* Personalized Welcome */}
        <div className="mb-8 animate-fade-in flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              {getGreeting()}, <span className="text-blue-600">{user?.name.split(' ')[0]}</span>
            </h1>
            <p className="text-slate-500 mt-1 font-medium">Ready to tackle your assignments today?</p>
          </div>
          <div className="flex gap-2">
             {/* Mobile Tab nav overrides */}
             <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm lg:hidden">
               <button onClick={() => setActiveTab('assigned')} className={`px-4 py-1.5 rounded-md text-xs font-bold ${activeTab === 'assigned' ? 'bg-slate-100 text-slate-800' : 'text-slate-500'}`}>Assigned</button>
               <button onClick={() => setActiveTab('completed')} className={`px-4 py-1.5 rounded-md text-xs font-bold ${activeTab === 'completed' ? 'bg-slate-100 text-slate-800' : 'text-slate-500'}`}>Completed</button>
             </div>
          </div>
        </div>

        {/* Sprint 3: Advanced Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Dynamic Metric Cards */}
          <div className="lg:col-span-8 grid grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-200 transition-colors group cursor-pointer" onClick={() => setActiveTab('overview')}>
              <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2 group-hover:text-blue-500 transition-colors">Assigned</h3>
              <p className="text-4xl font-black text-slate-800">{stats.total_tasks}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-200 transition-colors group cursor-pointer" onClick={() => setActiveTab('completed')}>
              <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2 group-hover:text-emerald-500 transition-colors">Completed</h3>
              <p className="text-4xl font-black text-emerald-600">{stats.completed_tasks}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-amber-200 transition-colors group cursor-pointer" onClick={() => setActiveTab('assigned')}>
              <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2 group-hover:text-amber-500 transition-colors">Pending</h3>
              <p className="text-4xl font-black text-amber-500">{stats.pending_tasks}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none">
              <h3 className="text-blue-100 text-xs font-black uppercase tracking-widest mb-2">Network Yield</h3>
              <div className="flex items-end gap-2">
                 <p className="text-4xl font-black">{stats.completion_rate}%</p>
              </div>
              <div className="w-full bg-blue-400/30 rounded-full h-1.5 mt-4">
                 <div className="bg-white h-1.5 rounded-full" style={{ width: `${stats.completion_rate}%` }}></div>
              </div>
            </div>
          </div>

          {/* Visual Progress Chart */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Personal Progress</h3>
             <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="flex justify-center gap-4 mt-2">
                {chartData.map(item => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{item.name}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col min-h-[500px]">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 rounded-t-2xl">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 capitalize">
              {activeTab === 'overview' ? 'All Tasks' : `${activeTab} Tasks`}
              <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">{displayTasks.length}</span>
            </h3>
            <div className="relative w-full sm:w-auto">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <input type="text" placeholder="Search parameters..." className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-shadow" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>
          
          <ul className="divide-y divide-slate-100 p-2 lg:p-4">
            {displayTasks.map(t => {
              const sub = mySubmissionsMap[t.id];
              const isSubmitted = !!sub;
              let statusColor = 'text-amber-600 border-amber-200 bg-amber-50';
              if (isSubmitted && sub.status === 'Reviewed') statusColor = 'text-emerald-600 border-emerald-200 bg-emerald-50';
              if (isSubmitted && sub.status === 'Submitted') statusColor = 'text-blue-600 border-blue-200 bg-blue-50';

              return (
                <li key={t.id} className="p-4 sm:p-5 hover:bg-slate-50 rounded-xl transition-colors select-none group border border-transparent hover:border-slate-100 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-black text-slate-900 line-clamp-1">{t.title}</h4>
                      <span className={`px-2 py-1 rounded-md text-[10px] uppercase tracking-widest font-black border ${statusColor}`}>
                        {!isSubmitted ? 'Pending Action' : sub.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 mb-3 line-clamp-2 md:max-w-xl">{t.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400">
                       <span className="flex items-center gap-1"><Clock size={14}/> Due {new Date(t.deadline).toLocaleDateString()}</span>
                       {t.attachment && <span className="flex items-center gap-1 text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md"><AlertCircle size={14}/> Attachment Included</span>}
                       <a href={generateGoogleCalendarLink(t)} target="_blank" rel="noopener noreferrer" 
                          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2.5 py-1 rounded-md transition-colors border border-transparent hover:border-blue-100">
                          <CalendarPlus size={14}/> Add to Google Calendar
                       </a>
                    </div>
                  </div>
                  <div className="w-full md:w-auto mt-2 md:mt-0">
                    <button onClick={() => navigate(`/tasks/${t.id}`)} className="w-full md:w-auto bg-white border border-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all flex items-center justify-center gap-2">
                      Review Mission <ExternalLink size={16}/>
                    </button>
                  </div>
                </li>
              );
            })}
            {displayTasks.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                <CheckCircle size={40} className="mb-4 opacity-30 text-emerald-500"/>
                <p className="font-bold text-lg text-slate-600">No tasks found</p>
                <p className="text-sm mt-1">Try adjusting your search criteria or checking another tab.</p>
              </div>
            )}
          </ul>
        </div>
      </main>

      <MissionAnalyst />

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}} />
    </div>
  );
}
