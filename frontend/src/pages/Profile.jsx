import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, User, Mail, Award, Edit3, Save, Phone, FileText, Download, Upload, ExternalLink, Briefcase, CheckCircle, Globe } from 'lucide-react';

export default function Profile() {
  const { user: authUser, checkAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: '', email: '', role: '', bio: '', skills: '', phone_number: '', country: '', experience: '', resume: null });
  const [resumeFile, setResumeFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile/');
      setProfile({
        name: res.data.name || '',
        email: res.data.email || '',
        role: res.data.role || '',
        bio: res.data.bio || '',
        skills: res.data.skills || '',
        phone_number: res.data.phone_number || '',
        country: res.data.country || '',
        experience: res.data.experience || '',
        resume: res.data.resume || null
      });
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', profile.name);
      formData.append('bio', profile.bio);
      formData.append('skills', profile.skills);
      formData.append('phone_number', profile.phone_number);
      formData.append('country', profile.country);
      formData.append('experience', profile.experience);
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }

      await api.patch('/auth/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Professional Identity Updated');
      setIsEditing(false);
      fetchProfile();
      await checkAuth(); // Refresh global auth state
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  const exportCSV = () => {
    const csvContent = [
      ["Name", "Email", "Role", "Phone", "Country", "Skills", "Experience", "Bio"],
      [profile.name, profile.email, profile.role, profile.phone_number, profile.country, `"${profile.skills}"`, `"${profile.experience}"`, `"${profile.bio}"`]
    ].map(e => e.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${profile.name.replace(/\s+/g, '_')}_Profile.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Export downloaded!');
  };

  const exportPDF = () => {
    window.print();
    toast.success('PDF Export generated!');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin h-10 w-10 border-b-2 border-indigo-600 rounded-full"></div></div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans overflow-x-hidden print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation & Controls */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors">
             <ArrowLeft size={18} /> Return to Dashboard
          </button>
          <div className="flex gap-3">
             <button onClick={exportCSV} className="bg-emerald-50 text-emerald-700 px-4 py-2 font-bold rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-2 text-sm shadow-sm">
               <Download size={16}/> Export CSV
             </button>
             <button onClick={exportPDF} className="bg-indigo-50 text-indigo-700 px-4 py-2 font-bold rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors flex items-center gap-2 text-sm shadow-sm">
               <Download size={16}/> Export PDF
             </button>
          </div>
        </div>

        {/* Profile Card Architecture */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 print:shadow-none print:border-none print:rounded-none">
           <div className="h-40 bg-gradient-to-r from-indigo-600 to-purple-600 relative print:hidden">
              <div className="absolute -bottom-16 left-8 sm:left-12">
                 <div className="w-32 h-32 bg-white rounded-2xl p-2 shadow-lg">
                    <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-4xl font-black text-indigo-600">
                       {profile.name.charAt(0).toUpperCase()}
                    </div>
                 </div>
              </div>
           </div>

           <div className="pt-20 px-8 sm:px-12 pb-12 print:pt-4">
              <div className="flex justify-between items-start mb-8 border-b border-slate-100 pb-8">
                 <div>
                    <h1 className="text-4xl font-black text-slate-900 mb-2">{profile.name}</h1>
                    <div className="flex flex-col gap-2 mt-4 text-slate-500 font-medium">
                       <p className="flex items-center gap-3"><Mail size={16} className="text-indigo-400"/> {profile.email}</p>
                       <div className="flex items-center gap-6">
                          <p className="flex items-center gap-3"><Phone size={16} className="text-indigo-400"/> {profile.phone_number || 'No phone number'}</p>
                          <p className="flex items-center gap-2"><Globe size={16} className="text-indigo-400"/> {profile.country || 'No country given'}</p>
                       </div>
                    </div>
                 </div>
                 <div className="flex flex-col items-end gap-3">
                   <span className={`px-4 py-2 rounded-xl text-sm font-black tracking-widest uppercase border ${profile.role === 'Admin' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
                      {profile.role}
                   </span>
                   {profile.resume && !isEditing && (
                     <a href={profile.resume} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-indigo-600 font-bold bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors print:hidden">
                       <FileText size={16}/> View Resume Document
                     </a>
                   )}
                 </div>
              </div>

              {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-8">
                      <div>
                         <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3"><User size={16}/> Biography</h3>
                         <p className="text-slate-700 font-medium leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100 print:bg-white print:border-transparent print:p-0">{profile.bio || "No biography provided yet."}</p>
                      </div>
                      <div>
                         <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3"><Award size={16}/> Core Skills</h3>
                         {profile.skills ? (
                           <div className="flex flex-wrap gap-2">
                             {profile.skills.split(',').map((skill, i) => (
                               <span key={i} className="px-3 py-1 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-lg shadow-sm print:shadow-none print:border-slate-300">{skill.trim()}</span>
                             ))}
                           </div>
                         ) : <p className="text-slate-500 italic">No skills listed.</p>}
                      </div>
                   </div>
                   
                   <div className="space-y-8">
                      <div>
                         <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3"><Briefcase size={16}/> Professional Experience</h3>
                         <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 print:bg-white print:border-transparent print:p-0">
                           {profile.experience ? (
                             <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">{profile.experience}</p>
                           ) : (
                             <p className="text-slate-500 italic">No experience data provided.</p>
                           )}
                         </div>
                      </div>
                   </div>

                   <div className="md:col-span-2 flex justify-end mt-4 print:hidden">
                      <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95">
                         <Edit3 size={18}/> Update System Profile
                      </button>
                   </div>
                </div>
              ) : (
                <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in bg-slate-50 p-6 rounded-3xl border border-indigo-100">
                   <div className="md:col-span-2 flex justify-between items-center mb-2 border-b border-indigo-100 pb-4">
                     <h3 className="text-xl font-black text-indigo-900 flex items-center gap-2"><Edit3 size={20}/> Edit Professional Details</h3>
                   </div>
                   
                   <div>
                     <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                     <input type="text" required className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-medium bg-white" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
                   </div>
                   <div>
                     <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                     <input type="text" className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-medium bg-white" value={profile.phone_number} onChange={e => setProfile({...profile, phone_number: e.target.value})} placeholder="+1 (555) 000-0000" />
                   </div>
                   <div>
                     <label className="block text-sm font-bold text-slate-700 mb-2">Country</label>
                     <input type="text" className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-medium bg-white" value={profile.country} onChange={e => setProfile({...profile, country: e.target.value})} placeholder="United States" />
                   </div>
                   
                   <div className="md:col-span-2">
                     <label className="block text-sm font-bold text-slate-700 mb-2">Biography</label>
                     <textarea rows="3" className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-medium bg-white" value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} placeholder="Tell us about your professional background..." />
                   </div>

                   <div className="md:col-span-2">
                     <label className="block text-sm font-bold text-slate-700 mb-2">Professional Experience</label>
                     <textarea rows="4" className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-medium bg-white" value={profile.experience} onChange={e => setProfile({...profile, experience: e.target.value})} placeholder="List your previous roles, achievements, and responsibilities..." />
                   </div>

                   <div className="md:col-span-2">
                     <label className="block text-sm font-bold text-slate-700 mb-2">Technical Skills <span className="text-slate-400 font-normal">(Comma separated)</span></label>
                     <input type="text" className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-medium bg-white" value={profile.skills} onChange={e => setProfile({...profile, skills: e.target.value})} placeholder="e.g. React, Django, UI Design, Marketing" />
                   </div>

                   <div className="md:col-span-2 bg-white p-4 rounded-xl border border-slate-200">
                     <label className="block text-sm font-bold text-slate-700 mb-2">Resume / CV Upload (PDF, DOCX)</label>
                     <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-3 rounded-lg font-bold cursor-pointer hover:bg-indigo-100 transition-colors border border-indigo-200 w-full sm:w-auto">
                           <Upload size={18}/>
                           <span className="truncate max-w-[200px]">{resumeFile ? resumeFile.name : 'Select File To Upload'}</span>
                           <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={e => setResumeFile(e.target.files[0])} />
                        </label>
                        {profile.resume && !resumeFile && <span className="text-sm font-medium text-emerald-600 flex items-center gap-1"><CheckCircle size={14}/> Active Resume on file</span>}
                     </div>
                   </div>

                   <div className="md:col-span-2 flex gap-3 justify-end mt-4 pt-4 border-t border-indigo-100">
                     <button type="button" onClick={() => { setIsEditing(false); setResumeFile(null); }} className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                     <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200">
                         <Save size={18}/> Commit Identity Changes
                     </button>
                   </div>
                </form>
              )}
           </div>
        </div>
      </div>
      
      {/* Print CSS hiding non-essential UI */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @media print {
          body * { visibility: hidden; }
          .max-w-4xl, .max-w-4xl * { visibility: visible; }
          .max-w-4xl { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; }
          .print\\:hidden { display: none !important; }
        }
      `}} />
    </div>
  );
}
