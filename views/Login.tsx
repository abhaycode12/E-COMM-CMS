import React, { useState, useMemo } from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('abhaycode12@gmail.com');
  const [password, setPassword] = useState('123456');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({ email: false, password: false });

  const emailError = useMemo(() => {
    if (!touched.email) return null;
    if (!email) return "Email node identity is required.";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Invalid electronic mail protocol.";
    return null;
  }, [email, touched.email]);

  const passwordError = useMemo(() => {
    if (!touched.password) return null;
    if (!password) return "Security passcode is mandatory.";
    if (password.length < 4) return "Passcode below minimum security threshold.";
    return null;
  }, [password, touched.password]);

  const isFormValid = !emailError && !passwordError && email && password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setIsLoading(true);
    setError(null);

    // Simulating API call
    setTimeout(() => {
      if (email === 'abhaycode12@gmail.com' && password === '123456') {
        onLogin({
          id: '1',
          name: 'Abhay',
          email: 'abhaycode12@gmail.com',
          role: 'super-admin',
          roles: ['role-sa'],
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150',
          permissions: ['*'],
          overrides: []
        });
      } else {
        setError('Authorization Failed: Invalid credential pair detected.');
        setIsLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl text-white text-3xl font-bold shadow-xl shadow-indigo-200 mb-4">
            L
          </div>
          <h1 className="text-3xl font-bold text-gray-900">LuminaCommerce</h1>
          <p className="text-gray-500 mt-2 tracking-tight">Enterprise Admin Portal • v4.0</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-gray-200/50 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-100 animate-in fade-in slide-in-from-top-2">
                ⚠️ {error}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Core Identity (Email)</label>
              <input 
                type="email" 
                required
                value={email}
                onBlur={() => setTouched({ ...touched, email: true })}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-gray-50 border ${emailError ? 'border-red-500 ring-4 ring-red-50' : 'border-gray-200 focus:border-indigo-500'} rounded-2xl px-6 py-4 outline-none transition-all text-gray-900 font-bold`}
                placeholder="abhaycode12@gmail.com"
              />
              {emailError && <p className="text-red-500 text-[9px] font-black uppercase mt-2 ml-1">{emailError}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-3 ml-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Security Passcode</label>
                <a href="#" className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Reset Logic</a>
              </div>
              <input 
                type="password" 
                required
                value={password}
                onBlur={() => setTouched({ ...touched, password: true })}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-gray-50 border ${passwordError ? 'border-red-500 ring-4 ring-red-50' : 'border-gray-200 focus:border-indigo-500'} rounded-2xl px-6 py-4 outline-none transition-all text-gray-900 font-bold`}
                placeholder="••••••••"
              />
              {passwordError && <p className="text-red-500 text-[9px] font-black uppercase mt-2 ml-1">{passwordError}</p>}
            </div>

            <div className="flex items-center ml-1">
              <input type="checkbox" id="remember" className="w-5 h-5 text-indigo-600 border-gray-300 rounded-lg focus:ring-indigo-500 cursor-pointer" />
              <label htmlFor="remember" className="ml-3 text-xs font-bold text-gray-500 uppercase tracking-tighter cursor-pointer">Persist Session State</label>
            </div>

            <button 
              type="submit"
              disabled={isLoading || !isFormValid}
              className={`
                w-full py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-3
                ${isFormValid 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100 active:scale-95' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'}
              `}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : 'Execute Portal Entry'}
            </button>
          </form>

          <p className="mt-10 text-center text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-loose">
            &copy; 2025 LuminaCommerce Core Systems.<br/>
            Access monitored via internal audit protocols.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;