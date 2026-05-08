import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { User, Lock, Mail, UserPlus, LogIn } from 'lucide-react';
import { UserAccount } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserAccount) => void;
  mode: 'login' | 'signup';
  setMode: (mode: 'login' | 'signup') => void;
}

export function AuthModal({ isOpen, onClose, onAuthSuccess, mode, setMode }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password || (mode === 'signup' && !username)) {
      setError('Please fill in all fields');
      return;
    }

    // Local Logic Simulation
    if (mode === 'signup') {
      const users = JSON.parse(localStorage.getItem('campus-users') || '[]');
      if (users.find((u: any) => u.email === email)) {
        setError('Email already exists');
        return;
      }
      const newUser: UserAccount = {
        id: Date.now().toString(),
        email,
        username,
        displayName: username,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
      };
      users.push({ ...newUser, password });
      localStorage.setItem('campus-users', JSON.stringify(users));
      onAuthSuccess(newUser);
    } else {
      const users = JSON.parse(localStorage.getItem('campus-users') || '[]');
      const user = users.find((u: any) => u.email === email && u.password === password);
      if (!user) {
        setError('Invalid email or password');
        return;
      }
      onAuthSuccess({
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-navy/60 dark:bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm bg-background-card rounded-[32px] p-8 shadow-2xl border border-border"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-navy w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl shadow-navy/20">
            {mode === 'login' ? <LogIn className="text-white" size={32} /> : <UserPlus className="text-white" size={32} />}
          </div>
        </div>

        <h2 className="text-2xl font-black text-navy text-center mb-8 tracking-tight">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
             <div className="space-y-1">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Username</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                <input 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="name"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-search-bg border border-transparent focus:bg-white focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-all font-bold text-navy"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === 'signup' ? 'gmail' : 'email'}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-search-bg border border-transparent focus:bg-white focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-all font-bold text-navy"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-search-bg border border-transparent focus:bg-white focus:border-navy focus:ring-1 focus:ring-navy outline-none transition-all font-bold text-navy"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-center text-xs font-bold">{error}</p>}

          <button 
            type="submit"
            className="w-full py-4 mt-4 font-black text-white bg-navy text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-navy/30 active:scale-95 transition-all cursor-pointer"
          >
            {mode === 'login' ? 'Login' : 'Sign Up'}
          </button>

          <div className="relative py-4 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <span className="relative px-4 bg-white text-[10px] font-black text-text-muted uppercase tracking-widest">or</span>
          </div>

          <button 
            type="button"
            onClick={() => {
              const guestId = Math.random().toString(36).substring(2, 7);
              const guestUser: UserAccount = {
                id: `guest_${guestId}`,
                email: `guest_${guestId}@campus.anonymous`,
                username: `Guest_${guestId}`,
                avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=Guest_${guestId}`,
                bio: 'Browsing anonymously'
              };
              onAuthSuccess(guestUser);
            }}
            className="w-full py-4 font-black text-navy bg-slate-50 border border-slate-100 text-sm uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all cursor-pointer"
          >
            Go Anonymous
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-text-secondary font-medium lowercase">
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
              }}
              className="ml-2 font-black text-navy uppercase text-xs tracking-widest hover:underline cursor-pointer"
            >
              {mode === 'login' ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
