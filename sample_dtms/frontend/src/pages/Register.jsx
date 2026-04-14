import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Lock, ArrowRight, ArrowLeft, Upload, Phone, Globe, Award, Briefcase, CheckCircle, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';

export default function Register() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone_number: '', country: '',
    skills: '', experience: ''
  });

  const phoneValidationRules = {
    "India": 10,
    "United States": 10,
    "Canada": 10,
    "United Kingdom": 10,
    "China": 11,
    "Brazil": 11,
    "Japan": 10,
    "Germany": 10,
    "Australia": 9,
    "France": 9,
    "South Africa": 9
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateStep1 = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.password || !formData.phone_number.trim() || !formData.country) {
      toast.error('All primary identification fields are required');
      return false;
    }
    
    // Country-specific Phone Validation
    const numericPhone = formData.phone_number.replace(/\D/g, '');
    const requiredLength = phoneValidationRules[formData.country];
    
    if (requiredLength && numericPhone.length !== requiredLength) {
      toast.error(`${formData.country} phone numbers must be exactly ${requiredLength} digits long.`);
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Identity security mismatch: Passwords do not match');
      return false;
    }
    if (formData.password.length < 8) {
      toast.error('Security Protocol: Password must be at least 8 characters');
      return false;
    }
    return true;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => setStep(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('email', formData.email);
      payload.append('password', formData.password);
      payload.append('phone_number', formData.phone_number);
      payload.append('country', formData.country);
      payload.append('skills', formData.skills);
      payload.append('experience', formData.experience);
      payload.append('role', 'User'); // Default to standard user 
      
      if (resumeFile) {
        payload.append('resume', resumeFile);
      }

      // Register the user
      await api.post('/auth/register/', payload, { headers: { 'Content-Type': 'multipart/form-data' }});
      toast.success('Professional Identity Created successfully!');
      
      // Auto-login
      const res = await api.post('/auth/login/', { email: formData.email, password: formData.password });
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      await login(formData.email, formData.password); // Triggers AuthContext router logic
    } catch (err) {
      if (err.response?.data) {
        const errors = err.response.data;
        Object.keys(errors).forEach(field => {
          const messages = errors[field];
          if (Array.isArray(messages)) {
            messages.forEach(msg => toast.error(`${field.replace('_', ' ')}: ${msg}`));
          } else {
            toast.error(messages);
          }
        });
      } else {
        toast.error('Registration sequence failed. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md md:max-w-xl">
        <div className="flex justify-center mb-6">
           <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <span className="text-white font-black text-2xl">D</span>
           </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-black text-slate-900 tracking-tight">Create Professional Identity</h2>
        <p className="mt-2 text-center text-sm text-slate-600 font-medium">Join the Digital Talent Management platform</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md md:max-w-xl">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100 relative overflow-hidden">
          
          {/* Progress Bar Header */}
          <div className="flex justify-between items-center mb-8 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 rounded-full z-0"></div>
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 rounded-full z-0 transition-all duration-500`} style={{ width: step === 1 ? '50%' : '100%' }}></div>
            
            <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
            <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
          </div>

          <form onSubmit={step === 1 ? handleNext : handleSubmit} className="space-y-6">
            
            {/* ----------------- STEP 1: Basic Authentication & Contact ----------------- */}
            <div className={`transition-all duration-300 ${step === 1 ? 'block animate-fade-in' : 'hidden'}`}>
                <h3 className="text-lg font-black text-slate-800 mb-6 border-b border-slate-100 pb-2">Primary Contact Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-5 w-5 text-slate-400" /></div>
                      <input name="name" type="text" required value={formData.name} onChange={handleChange} className="pl-10 block w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium bg-slate-50" placeholder="John Doe" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-slate-400" /></div>
                      <input name="email" type="email" required value={formData.email} onChange={handleChange} className="pl-10 block w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium bg-slate-50" placeholder="john@example.com" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-slate-400" /></div>
                      <input name="password" type={showPassword ? "text" : "password"} required value={formData.password} onChange={handleChange} className="pl-10 pr-10 block w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium bg-slate-50" placeholder="••••••••" />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-5 w-5 text-slate-400 hover:text-indigo-500 transition-colors" /> : <Eye className="h-5 w-5 text-slate-400 hover:text-indigo-500 transition-colors" />}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Confirm Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-slate-400" /></div>
                      <input name="confirmPassword" type={showConfirmPassword ? "text" : "password"} required value={formData.confirmPassword} onChange={handleChange} className="pl-10 pr-10 block w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium bg-slate-50" placeholder="••••••••" />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOff className="h-5 w-5 text-slate-400 hover:text-indigo-500 transition-colors" /> : <Eye className="h-5 w-5 text-slate-400 hover:text-indigo-500 transition-colors" />}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone className="h-5 w-5 text-slate-400" /></div>
                      <input name="phone_number" type="tel" required value={formData.phone_number} onChange={handleChange} className="pl-10 block w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium bg-slate-50" placeholder="+1 (555) 000-0000" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Country</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Globe className="h-5 w-5 text-slate-400" /></div>
                      <select name="country" required value={formData.country} onChange={handleChange} className="pl-10 block w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium bg-slate-50 appearance-none">
                        <option value="">Select Country</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                        <option value="India">India</option>
                        <option value="Japan">Japan</option>
                        <option value="China">China</option>
                        <option value="Brazil">Brazil</option>
                        <option value="South Africa">South Africa</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <button type="submit" className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-95">
                    Proceed to Technical Profile <ArrowRight size={18} />
                  </button>
                </div>
            </div>

            {/* ----------------- STEP 2: Professional Identity Data ----------------- */}
            <div className={`transition-all duration-300 ${step === 2 ? 'block animate-fade-in' : 'hidden'}`}>
                <h3 className="text-lg font-black text-slate-800 mb-6 border-b border-slate-100 pb-2">Technical Qualifications</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2"><Award size={16} className="text-indigo-500"/> Core Skills</label>
                    <input name="skills" type="text" value={formData.skills} onChange={handleChange} className="block w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium bg-slate-50" placeholder="React, Python, Project Management, Analytics (Comma separated)" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2"><Briefcase size={16} className="text-indigo-500"/> Professional Experience</label>
                    <textarea name="experience" rows="3" value={formData.experience} onChange={handleChange} className="block w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium bg-slate-50" placeholder="Detail your most recent roles, responsibilities, and key achievements..." />
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Resume / Curriculum Vitae Upload</label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                       <label className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-3 rounded-xl font-bold cursor-pointer hover:bg-indigo-100 transition-colors border border-indigo-200 w-full sm:w-auto justify-center">
                          <Upload size={18}/>
                          <span className="truncate max-w-[200px]">{resumeFile ? resumeFile.name : 'Select PDF or DOCX'}</span>
                          <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={e => setResumeFile(e.target.files[0])} />
                       </label>
                       {resumeFile && <span className="text-sm font-black text-emerald-600 flex items-center gap-1"><CheckCircle size={16}/> File prepared</span>}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button type="button" onClick={handleBack} className="w-1/3 flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 focus:outline-none transition-colors">
                    <ArrowLeft size={16} /> Edit Details
                  </button>
                  <button type="submit" disabled={loading} className="w-2/3 flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? 'Transmitting Data...' : 'Complete Profile & Enlist'}
                  </button>
                </div>
            </div>

          </form>
          
          {step === 1 && (
             <div className="mt-8 border-t border-slate-100 pt-6">
                <div className="text-center text-sm font-medium text-slate-600">
                  Already hold an active clearance?{' '}
                  <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500">Log in here</Link>
                </div>
             </div>
          )}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
      `}} />
    </div>
  );
}
