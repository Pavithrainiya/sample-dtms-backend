import { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Search, Filter, Clock, CheckCircle, AlertCircle, PlusCircle, Trash2, Calendar, Edit, Save, X, LayoutDashboard, Users, Settings, Menu, Sparkles, Upload, ExternalLink, CalendarPlus } from 'lucide-react';
import { generateGoogleCalendarLink } from '../utils/CalendarUtils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, CartesianGrid } from 'recharts';
import MissionAnalyst from '../components/MissionAnalyst';

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_tasks: 0, completed_tasks: 0, pending_tasks: 0, completion_rate: 0, task_completion_data: [], submission_status_data: [], assignment_metrics: [] });
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activeView, setActiveView] = useState('center'); // center, members, audit, profile
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Task & Filter States
  const [searchTaskTerm, setSearchTaskTerm] = useState('');
  const [searchSubTerm, setSearchSubTerm] = useState('');
  const [subFilter, setSubFilter] = useState('All');
  
  const [newTask, setNewTask] = useState({ title: '', description: '', deadline: '', assigned_users: [] });
  const [taskAttachment, setTaskAttachment] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  // Get current local date-time string for the 'min' attribute
  const minDateTime = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16);

  useEffect(() => {
    fetchData();
    fetchUsers();
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

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users/');
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users");
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (newTask.assigned_users.length === 0) {
       toast.error("You must assign the task to at least one user.");
       return;
    }
    try {
      const formData = new FormData();
      formData.append('title', newTask.title);
      formData.append('description', newTask.description);
      formData.append('deadline', newTask.deadline);
      
      newTask.assigned_users.forEach(uid => {
         formData.append('assigned_users', uid);
      });

      if (taskAttachment) {
        formData.append('attachment', taskAttachment);
      }

      const res = await api.post('/tasks/tasks/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const createdTask = res.data;
      toast.success((t) => (
        <div className="flex flex-col gap-2">
          <span className="font-bold text-slate-800">Task securely assigned to users!</span>
          <a href={generateGoogleCalendarLink(createdTask)} 
             target="_blank" rel="noopener noreferrer"
             onClick={() => toast.dismiss(t.id)}
             className="text-xs flex items-center gap-1.5 text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1.5 rounded-md border border-blue-100 w-fit transition-colors">
            <CalendarPlus size={14}/> Sync to your Google Calendar
          </a>
        </div>
      ), { duration: 6000 });
      setNewTask({ title: '', description: '', deadline: '', assigned_users: [] });
      setTaskAttachment(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to assign task');
    }
  };

  const handleDeleteTask = async (id) => {
    if(!window.confirm("Are you sure you want to permanently delete this task?")) return;
    try {
      await api.delete(`/tasks/tasks/${id}/`);
      toast.success('Task safely removed');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/tasks/tasks/${editingTask.id}/`, editingTask);
      toast.success('Task assignments successfully updated!');
      setEditingTask(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to update task. Ensure deadline is correctly formatted.');
    }
  };

  const handleReview = async (id, status) => {
    try {
      await api.put(`/tasks/submissions/${id}/review/`, { status });
      toast.success(`Submission marked as ${status}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update submission');
    }
  };

  const handleAIEvaluate = async (id) => {
    const toastId = toast.loading('Mission Intelligence is analyzing context...');
    try {
      const res = await api.post(`/tasks/submissions/${id}/evaluate/`);
      toast.dismiss(toastId);
      const aiData = res.data.ai_evaluation;
      alert(`🤖 Mission Intelligence Feedback:\n\nScore: ${aiData.score}/100\nRecommended Action: ${aiData.recommended_status}\n\nFeedback:\n${aiData.feedback}`);
      toast.success('Analysis complete');
    } catch (err) {
      toast.dismiss(toastId);
      toast.error('AI Intelligence assessment failed. Check system logs.');
    }
  };

  // Searching logic
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => t.title.toLowerCase().includes(searchTaskTerm.toLowerCase()) || 
                             t.description.toLowerCase().includes(searchTaskTerm.toLowerCase()));
  }, [tasks, searchTaskTerm]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(s => {
      // Only show submissions that have been submitted (not Pending)
      if (s.status === 'Pending') return false;
      
      const matchesSearch = s.user_details?.name.toLowerCase().includes(searchSubTerm.toLowerCase()) || 
                            s.task_details?.title.toLowerCase().includes(searchSubTerm.toLowerCase());
      const matchesFilter = subFilter === 'All' || s.status === subFilter;
      return matchesSearch && matchesFilter;
    });
  }, [submissions, searchSubTerm, subFilter]);


  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 18) return 'Good Afternoon';
    if (hour >= 18 && hour < 22) return 'Good Evening';
    return 'Good Night';
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
              <p className="text-xs text-slate-500">Administrator Vault</p>
            </div>
          </div>
         </div>
        <nav className="flex-1 mt-6 px-4 space-y-2">
           <button onClick={() => setActiveView('center')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeView === 'center' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
             <LayoutDashboard size={18} /> Command Center
           </button>
           <button onClick={() => setActiveView('members')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeView === 'members' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
             <Users size={18} /> Team Members
           </button>
           <button onClick={() => setActiveView('audit')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeView === 'audit' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
             <CheckCircle size={18} /> Audit Logs
           </button>
           <button onClick={() => setActiveView('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeView === 'profile' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
             <Settings size={18} /> System Profile
           </button>
        </nav>
        <div className="p-4 border-t bg-slate-50/50">
          <button onClick={logout} className="w-full text-left px-4 py-2.5 text-slate-600 font-bold hover:bg-white hover:text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-100 hover:shadow-sm flex items-center gap-3">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto w-full mx-auto">
        
        {/* Mobile Header Navbar */}
        <div className="mb-6 flex justify-between items-center lg:hidden bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
             <button className="text-slate-500 hover:text-blue-600"><Menu size={24}/></button>
             <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs">D</div> DTMS
             </h2>
           </div>
          <button onClick={logout} className="text-red-600 font-bold text-sm bg-red-50 px-4 py-2 rounded-lg border border-red-100">Logout</button>
        </div>

        <div className="mb-8 animate-fade-in flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-slate-500 mt-2 font-medium">Manage broad system workloads and audit team progression.</p>
          </div>
          <p className="text-sm font-bold text-slate-400 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 inline-flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-500"/> System Online
          </p>
        </div>

        {activeView === 'center' && (
          <>
            {/* Global Statistics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-200 transition-colors group">
                <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2 group-hover:text-indigo-500 transition-colors">Total Broadcasts</h3>
                <p className="text-4xl font-black text-slate-800">{stats.total_tasks}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-200 transition-colors group">
                <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2 group-hover:border-emerald-500 transition-colors">Approved Data</h3>
                <p className="text-4xl font-black text-emerald-600">{stats.completed_tasks}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-amber-200 transition-colors group">
                <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2 group-hover:text-amber-500 transition-colors">Pending Review</h3>
                <p className="text-4xl font-black text-amber-500">{stats.pending_tasks}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden text-white bg-gradient-to-br from-indigo-600 to-indigo-800">
                <h3 className="text-indigo-200 text-xs font-black uppercase tracking-widest mb-2">Network Yield</h3>
                <p className="text-4xl font-black">{stats.completion_rate}%</p>
                <div className="absolute right-0 bottom-0 opacity-10">
                   <AlertCircle size={100} className="-mr-6 -mb-6"/>
                </div>
              </div>
            </div>

            {/* Graphical Analytics Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                 <h3 className="text-sm font-bold text-slate-800 mb-6">Task Completion (%)</h3>
                 <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={stats.task_completion_data}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} />
                       <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                       <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                       <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                       <Bar dataKey="completedPercentage" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                     </BarChart>
                   </ResponsiveContainer>
                 </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                 <h3 className="text-sm font-bold text-slate-800 mb-6">Submission Audit</h3>
                 <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie data={stats.submission_status_data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                         {(stats.submission_status_data || []).map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                         ))}
                       </Pie>
                       <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                       <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '12px', fontWeight: 'bold'}} />
                     </PieChart>
                   </ResponsiveContainer>
                 </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                 <h3 className="text-sm font-bold text-slate-800 mb-6">Network Assignment</h3>
                 <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={stats.assignment_metrics}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} />
                       <XAxis dataKey="taskName" fontSize={11} tickLine={false} axisLine={false} />
                       <YAxis fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                       <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                       <Line type="monotone" dataKey="assignedUsers" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                     </LineChart>
                   </ResponsiveContainer>
                 </div>
              </div>
            </div>

            {/* Task Creator */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 mb-8 max-w-7xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><PlusCircle size={20}/></div>
                 <h3 className="text-xl font-black text-slate-800">Assign New Task</h3>
              </div>
              <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Task Title</label>
                  <input type="text" placeholder="..." required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow font-medium" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
                </div>
                <div className="md:col-span-6">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Detailed Description</label>
                  <input type="text" placeholder="..." required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow font-medium" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deadline</label>
                  <input type="datetime-local" required min={minDateTime} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow text-sm text-slate-600 font-bold" value={newTask.deadline} onChange={e => setNewTask({...newTask, deadline: e.target.value})} />
                </div>
                
                <div className="md:col-span-8">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assign To Specific Users</label>
                  <div className="border border-slate-200 rounded-xl bg-slate-50 p-3 flex flex-col gap-1.5 min-h-[48px] max-h-[160px] overflow-y-auto">
                    {users.filter(u => u.role === 'User').length === 0 && <span className="text-xs text-slate-400 p-1">No talent available to assign.</span>}
                    {users.filter(u => u.role === 'User').map(u => (
                      <label key={u.id} className={`flex items-center gap-3 text-xs border-b border-slate-100 last:border-0 pb-1.5 pt-0.5 cursor-pointer transition-colors ${newTask.assigned_users.includes(u.id) ? 'text-indigo-700 font-bold' : 'text-slate-600'}`}>
                        <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                               checked={newTask.assigned_users.includes(u.id)}
                               onChange={(e) => {
                                 if(e.target.checked) setNewTask({...newTask, assigned_users: [...newTask.assigned_users, u.id]});
                                 else setNewTask({...newTask, assigned_users: newTask.assigned_users.filter(id => id !== u.id)});
                               }} />
                        <span className="flex-1">{u.name} <span className="opacity-50 font-normal ml-2">({u.email})</span></span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Attachment</label>
                  <div className="border border-slate-200 rounded-xl bg-slate-50 relative cursor-pointer hover:bg-slate-100 flex items-center justify-center h-[48px] text-slate-500 transition-colors">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setTaskAttachment(e.target.files[0])} title="Attach Context File" />
                    <Upload size={20} className={taskAttachment ? "text-indigo-600" : ""} />
                    {taskAttachment && <span className="ml-2 text-xs font-bold text-indigo-600 truncate max-w-[60px]">{taskAttachment.name}</span>}
                  </div>
                </div>
                
                <div className="md:col-span-2 flex flex-col justify-end pt-5">
                  <button type="submit" className="w-full h-[48px] bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
                    Deploy <PlusCircle size={18}/>
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col min-h-[600px] h-full">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><Calendar size={20} className="text-indigo-500"/> Active Broadcasts</h3>
                <div className="relative w-full sm:w-auto">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   <input type="text" placeholder="Search tasks..." className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg w-full sm:w-48 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium" value={searchTaskTerm} onChange={e => setSearchTaskTerm(e.target.value)} />
                </div>
              </div>
              <ul className="overflow-y-auto flex-1 divide-y divide-slate-100 p-2">
                {filteredTasks.map(t => (
                  <li key={t.id} className="p-4 hover:bg-slate-50 rounded-xl transition-colors group select-none">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1 cursor-pointer">{t.title}</h4>
                        <p className="text-xs font-semibold text-slate-500 mb-2 truncate max-w-md">{t.description}</p>
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                           <span>Due: {new Date(t.deadline).toLocaleDateString([], {month:'short', day:'numeric'})} at {new Date(t.deadline).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                           <span>• Assigned to {t.assigned_users?.length || 0} user(s)</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => {
                          const d = new Date(t.deadline);
                          const localDeadline = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
                          setEditingTask({...t, deadline: localDeadline, assigned_users: t.assigned_users || []});
                        }} className="p-2 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"><Edit size={18} /></button>
                        <button onClick={() => handleDeleteTask(t.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {activeView === 'members' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><Users size={20} className="text-blue-500"/> Team Members</h3>
               <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">{users.length} Total</span>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest font-black border-b border-slate-100">
                     <th className="px-6 py-4">Identity</th>
                     <th className="px-6 py-4">Role</th>
                     <th className="px-6 py-4">Phone / Region</th>
                     <th className="px-4 py-4 text-center">Approved</th>
                     <th className="px-4 py-4 text-center">Rejected</th>
                     <th className="px-4 py-4 text-center">Pending</th>
                     <th className="px-6 py-4">Joined</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                   {users.map(u => (
                     <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">{u.name.charAt(0)}</div>
                           <div>
                             <p className="text-sm font-black text-slate-900 leading-none mb-1">{u.name}</p>
                             <p className="text-xs text-slate-400 font-medium">{u.email}</p>
                           </div>
                         </div>
                       </td>
                       <td className="px-6 py-4">
                         <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${u.role === 'Admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>{u.role}</span>
                       </td>
                       <td className="px-6 py-4">
                         <p className="text-xs font-bold text-slate-700">{u.phone_number}</p>
                         <p className="text-[10px] text-slate-400 font-medium">{u.country}</p>
                       </td>
                       <td className="px-4 py-4 text-center">
                         <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-xs ${u.approved_count > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-50 text-slate-300'}`}>
                           {u.approved_count || 0}
                         </span>
                       </td>
                       <td className="px-4 py-4 text-center">
                         <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-xs ${u.rejected_count > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-50 text-slate-300'}`}>
                           {u.rejected_count || 0}
                         </span>
                       </td>
                       <td className="px-4 py-4 text-center">
                         <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-xs ${u.pending_count > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-50 text-slate-300'}`}>
                           {u.pending_count || 0}
                         </span>
                       </td>
                       <td className="px-6 py-4 text-xs font-medium text-slate-400">{u.date_joined ? new Date(u.date_joined).toLocaleDateString() : 'Active'}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {activeView === 'audit' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><CheckCircle size={20} className="text-emerald-500"/> Audit Logs</h3>
               <div className="flex gap-2">
                 <select className="border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold bg-white" value={subFilter} onChange={e => setSubFilter(e.target.value)}>
                    <option value="All">All Events</option>
                    <option value="Submitted">New Submissions</option>
                    <option value="Reviewed">Approved</option>
                    <option value="Rejected">Rejected</option>
                 </select>
               </div>
             </div>
             <div className="divide-y divide-slate-50">
               {filteredSubmissions.length === 0 ? (
                 <div className="p-12 text-center">
                   <CheckCircle size={48} className="mx-auto text-slate-300 mb-4" />
                   <p className="text-slate-400 font-bold">No submissions found matching the selected filter.</p>
                   <p className="text-slate-400 text-sm mt-2">Try selecting a different filter or check back later.</p>
                 </div>
               ) : (
                 filteredSubmissions.map(s => (
                   <div key={s.id} className="p-6 hover:bg-slate-50 transition-all flex flex-col sm:flex-row justify-between gap-4">
                     <div className="flex-1">
                       <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-black text-slate-900">{s.user_details?.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">• Submitted Task:</span>
                          <span className="text-xs font-bold text-indigo-600">{s.task_details?.title}</span>
                          {/* Status Badge */}
                          {s.status === 'Reviewed' && <span className="text-[10px] px-2 py-1 bg-emerald-100 text-emerald-700 font-black rounded-full">APPROVED</span>}
                          {s.status === 'Rejected' && <span className="text-[10px] px-2 py-1 bg-red-100 text-red-700 font-black rounded-full">REJECTED</span>}
                          {s.status === 'Submitted' && <span className="text-[10px] px-2 py-1 bg-amber-100 text-amber-700 font-black rounded-full">PENDING</span>}
                       </div>
                       <p className="text-sm text-slate-500 font-medium line-clamp-1">{s.content || "Code/Text submission"}</p>
                       <div className="flex items-center gap-4 mt-3">
                          <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1"><Clock size={12}/> {new Date(s.submitted_at).toLocaleString()}</span>
                          {s.attachment && <span className="text-[10px] text-emerald-600 font-black flex items-center gap-1"><Upload size={12}/> Document Attached</span>}
                       </div>
                     </div>
                     <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={() => handleAIEvaluate(s.id)} className="p-2 bg-slate-900 text-amber-300 rounded-lg hover:bg-black transition-colors" title="AI Review"><Sparkles size={16}/></button>
                        {s.status !== 'Reviewed' && (
                          <button onClick={() => handleReview(s.id, 'Reviewed')} className="px-3 py-2 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 shadow-sm transition-all flex items-center gap-1">
                            <CheckCircle size={14}/> Approve
                          </button>
                        )}
                        {s.status !== 'Rejected' && (
                          <button onClick={() => handleReview(s.id, 'Rejected')} className="px-3 py-2 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 shadow-sm transition-all flex items-center gap-1">
                            <X size={14}/> Reject
                          </button>
                        )}
                        {(s.status === 'Reviewed' || s.status === 'Rejected') && (
                          <button onClick={() => handleReview(s.id, 'Submitted')} className="px-3 py-2 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 shadow-sm transition-all flex items-center gap-1">
                            <AlertCircle size={14}/> Reset
                          </button>
                        )}
                     </div>
                   </div>
                 ))
               )}
             </div>
          </div>
        )}

        {activeView === 'profile' && (
          <div className="max-w-2xl mx-auto animate-fade-in">
             <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5"><LayoutDashboard size={120}/></div>
                <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black mb-6 shadow-lg shadow-indigo-600/30">
                  {user?.name.charAt(0)}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-1">{user?.name}</h3>
                <p className="text-indigo-600 font-black text-xs uppercase tracking-widest mb-6">System Security Administrator</p>
                
                <div className="space-y-4 border-t border-slate-100 pt-6">
                  <div className="flex justify-between">
                    <span className="text-sm font-bold text-slate-400">Account Status</span>
                    <span className="text-sm font-black text-emerald-500 flex items-center gap-1"><CheckCircle size={14}/> ACTIVE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-bold text-slate-400">Security Clearance</span>
                    <span className="text-sm font-black text-slate-900">LEVEL 4 (Global)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-bold text-slate-400">Email</span>
                    <span className="text-sm font-black text-slate-900">{user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-bold text-slate-400">Role</span>
                    <span className="text-sm font-black text-slate-900">{user?.role}</span>
                  </div>
                </div>
             </div>
          </div>
        )}
      </main>

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900">Modify Task</h3>
              <button onClick={() => setEditingTask(null)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Task Title</label>
                <input type="text" required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium" 
                       value={editingTask.title} onChange={e => setEditingTask({...editingTask, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                <textarea required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium min-h-[100px]" 
                          value={editingTask.description} onChange={e => setEditingTask({...editingTask, description: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Deadline</label>
                <input type="datetime-local" required min={minDateTime} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-600" 
                       value={editingTask.deadline} onChange={e => setEditingTask({...editingTask, deadline: e.target.value})} />
              </div>

              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-1">Modify User Assignments</label>
                 <div className="border border-slate-200 rounded-xl bg-slate-50 p-3 flex flex-col gap-1.5 max-h-[160px] overflow-y-auto">
                    {users.filter(u => u.role === 'User').length === 0 && <span className="text-xs text-slate-400 p-1">No talent available.</span>}
                    {users.filter(u => u.role === 'User').map(u => (
                      <label key={u.id} className={`flex items-center gap-3 text-xs border-b border-slate-100 last:border-0 pb-1.5 pt-0.5 cursor-pointer transition-colors ${editingTask.assigned_users.includes(u.id) ? 'text-indigo-700 font-bold' : 'text-slate-600'}`}>
                        <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                               checked={editingTask.assigned_users.includes(u.id)}
                               onChange={(e) => {
                                 if(e.target.checked) setEditingTask({...editingTask, assigned_users: [...editingTask.assigned_users, u.id]});
                                 else setEditingTask({...editingTask, assigned_users: editingTask.assigned_users.filter(id => id !== u.id)});
                               }} />
                        <span className="flex-1">{u.name} <span className="opacity-50 font-normal ml-2">({u.email})</span></span>
                      </label>
                    ))}
                 </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setEditingTask(null)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md transition-all flex items-center gap-2">
                  <Save size={16} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
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
