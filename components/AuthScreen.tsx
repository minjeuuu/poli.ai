
import React, { useState } from 'react';
import Logo from './Logo';
import { ArrowRight, User, Lock, Mail, Globe, ShieldCheck } from 'lucide-react';
import { playSFX } from '../services/soundService';
import { db } from '../services/database';
import { auth, googleProvider, facebookProvider } from '../services/firebaseService';
import { signInWithPopup } from 'firebase/auth';
import { DEFAULT_STATS, DEFAULT_PREFS } from '../types';
import { motion } from 'framer-motion';

interface AuthScreenProps {
  onLogin: (user: any) => void;
  onGuest: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onGuest }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({ email: '', password: '', username: '' });
  const [loading, setLoading] = useState(false);

    const handleOAuth = async (provider: any) => {
        playSFX('click');
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, provider);
            const fbUser = result.user;
            
            const existing = await db.execute(`SELECT * FROM users WHERE email = '${fbUser.email}'`);
            if (existing.rows.length > 0) {
                playSFX('success');
                onLogin(existing.rows[0]);
            } else {
                let profile = {
                    id: fbUser.uid,
                    username: fbUser.displayName || 'Scholar',
                    email: fbUser.email || '',
                    level: 1,
                    xp: 0,
                    coins: 100,
                    joinedDate: new Date().toISOString(),
                    stats: { ...DEFAULT_STATS },
                    preferences: { ...DEFAULT_PREFS }
                };
                
                await db.saveItem('users', profile);
                playSFX('success');
                onLogin(profile);
            }
        } catch (err: any) {
            console.error(err);
            alert(err.message || 'Authentication Error');
        } finally {
            setLoading(false);
        }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playSFX('click');
    setLoading(true);
    
    try {
        if (mode === 'signup') {
            const existing = await db.execute(`SELECT * FROM users WHERE email = '${formData.email}'`);
            if (existing.rows.length > 0) {
                alert("User already exists!");
                setLoading(false);
                return;
            }
            
            const newUser = {
                id: Date.now().toString(),
                username: formData.username || 'Scholar',
                email: formData.email,
                password: formData.password, 
                level: 1,
                xp: 0,
                coins: 100,
                joinedDate: new Date().toISOString(),
                stats: { ...DEFAULT_STATS },
                preferences: { ...DEFAULT_PREFS }
            };
            
            await db.saveItem('users', newUser);
            playSFX('success');
            onLogin(newUser);
        } else {
            const result = await db.execute(`SELECT * FROM users WHERE email = '${formData.email}' AND password = '${formData.password}'`);
            if (result.rows.length > 0) {
                playSFX('success');
                onLogin(result.rows[0]);
            } else {
                alert("Invalid credentials");
                playSFX('error');
            }
        }
    } catch (err) {
        console.error(err);
        alert("Database Error");
    } finally {
        setLoading(false);
    }
  };

  const switchMode = (m: 'login' | 'signup') => {
      playSFX('click');
      setMode(m);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-academic-bg dark:bg-stone-950 flex flex-col items-center justify-center p-6 transition-colors duration-700">
       
       <motion.div 
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
           className="w-full max-w-md"
       >
           <div className="text-center mb-10">
               <motion.div
                   initial={{ scale: 0.9, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   transition={{ duration: 1, delay: 0.2 }}
               >
                   <Logo size="xl" className="mx-auto mb-6" />
               </motion.div>
               <motion.h1 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.8, delay: 0.4 }}
                   className="text-5xl font-serif font-bold text-academic-text dark:text-stone-100 mb-2 tracking-tight"
               >
                   POLI
               </motion.h1>
               <motion.p
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ duration: 0.8, delay: 0.6 }}
                   className="text-sm text-stone-500 font-mono uppercase tracking-widest"
               >
                   Academic Intelligence
               </motion.p>
           </div>

           <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl overflow-hidden relative">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-academic-accent via-academic-gold to-academic-accent opacity-80"></div>

               <div className="p-6 md:p-8">
                   <div className="flex gap-4 mb-8 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
                       <button 
                        onClick={() => switchMode('login')}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${mode === 'login' ? 'bg-white dark:bg-stone-700 shadow-sm text-academic-text dark:text-white' : 'text-stone-400 hover:text-stone-600'}`}
                       >
                           Log In
                       </button>
                       <button 
                        onClick={() => switchMode('signup')}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${mode === 'signup' ? 'bg-white dark:bg-stone-700 shadow-sm text-academic-text dark:text-white' : 'text-stone-400 hover:text-stone-600'}`}
                       >
                           Sign Up
                       </button>
                   </div>

                   <form onSubmit={handleSubmit} className="space-y-4">
                       {mode === 'signup' && (
                           <motion.div 
                               initial={{ opacity: 0, height: 0 }} 
                               animate={{ opacity: 1, height: 'auto' }} 
                               exit={{ opacity: 0, height: 0 }}
                               className="relative group"
                           >
                               <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-academic-gold transition-colors" />
                               <input 
                                type="text" 
                                placeholder="Username"
                                className="w-full pl-10 pr-4 py-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm font-medium outline-none focus:border-academic-gold focus:ring-4 focus:ring-academic-gold/10 transition-all text-academic-text dark:text-white"
                                value={formData.username}
                                onChange={e => setFormData({...formData, username: e.target.value})}
                                onFocus={() => playSFX('hover')}
                                required
                               />
                           </motion.div>
                       )}
                       <div className="relative group">
                           <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-academic-gold transition-colors" />
                           <input 
                            type="email" 
                            placeholder="Email Address"
                            className="w-full pl-10 pr-4 py-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm font-medium outline-none focus:border-academic-gold focus:ring-4 focus:ring-academic-gold/10 transition-all text-academic-text dark:text-white"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            onFocus={() => playSFX('hover')}
                            required
                           />
                       </div>
                       <div className="relative group">
                           <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-academic-gold transition-colors" />
                           <input 
                            type="password" 
                            placeholder="Password"
                            className="w-full pl-10 pr-4 py-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm font-medium outline-none focus:border-academic-gold focus:ring-4 focus:ring-academic-gold/10 transition-all text-academic-text dark:text-white"
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                            onFocus={() => playSFX('hover')}
                            required
                           />
                       </div>

                       <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-4 bg-academic-accent dark:bg-indigo-600 text-white font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-stone-800 dark:hover:bg-indigo-500 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 mt-4"
                       >
                           {loading ? 'Authenticating...' : (mode === 'login' ? 'Access Archive' : 'Enter Network')} <ArrowRight className="w-4 h-4" />
                       </button>
                   </form>

                   <div className="mt-8 flex flex-col items-center space-y-4 border-t border-stone-200 dark:border-stone-800 pt-6">
                       <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest bg-white dark:bg-stone-900 px-2 -mt-9">Or Authenticate via</span>
                       <div className="flex gap-4 w-full">
                           <button 
                               type="button"
                               onClick={() => handleOAuth(googleProvider)}
                               disabled={loading}
                               className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 py-3 rounded-xl text-xs font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all active:translate-y-0 text-stone-600 dark:text-stone-300"
                           >
                               <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                               Google
                           </button>
                           <button 
                               type="button"
                               onClick={() => handleOAuth(facebookProvider)}
                               disabled={loading}
                               className="flex-1 flex items-center justify-center gap-2 bg-[#1877F2] text-white border border-[#1877F2] py-3 rounded-xl text-xs font-bold shadow-sm hover:shadow-md hover:bg-[#166fe5] hover:-translate-y-0.5 transition-all active:translate-y-0"
                           >
                               <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                               Facebook
                           </button>
                       </div>
                   </div>
               </div>
           </div>

           <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.8 }}
               className="mt-8 text-center space-y-4"
           >
               <button 
                onClick={() => { playSFX('click'); onGuest(); }}
                className="text-stone-500 dark:text-stone-400 text-xs font-bold uppercase tracking-widest hover:text-academic-accent dark:hover:text-white transition-colors flex items-center justify-center gap-2 w-full"
                onMouseEnter={() => playSFX('hover')}
               >
                   <Globe className="w-4 h-4" /> Continue as Guest
               </button>
               <div className="flex items-center justify-center gap-2 text-[10px] text-stone-400">
                   <ShieldCheck className="w-3 h-3" /> Secure Encrypted Connection
               </div>
           </motion.div>
       </motion.div>
    </div>
  );
};

export default AuthScreen;


