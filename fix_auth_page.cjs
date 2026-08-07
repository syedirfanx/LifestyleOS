const fs = require('fs');

const code = `import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { StarsBackground } from './StarsBackground';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

interface AuthPageProps {
  initialMode: 'login' | 'register';
  onBack: () => void;
  onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode, onBack, onSuccess }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#03050a] text-slate-100 font-sans antialiased flex flex-col relative overflow-hidden items-center justify-center p-4">
      <StarsBackground />
      
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 sm:top-10 sm:left-10 text-slate-400 hover:text-white flex items-center space-x-2 transition-colors z-20 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-semibold">Back to Home</span>
      </button>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl"
      >
        <div className="flex justify-center mb-8">
          <div className="relative overflow-hidden group">
            <motion.h1 
              initial={{ backgroundPosition: '200% center' }}
              animate={{ backgroundPosition: '-200% center' }}
              transition={{ 
                repeat: Infinity, 
                duration: 8, 
                ease: "linear"
              }}
              className="text-xl sm:text-2xl font-extrabold tracking-widest uppercase select-none font-logo bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-400 bg-[length:200%_auto]"
            >
              LIFESTYLE OS
            </motion.h1>
          </div>
        </div>
        
        <h2 className="text-2xl font-black text-center mb-2 text-white">
          Welcome to Lifestyle OS
        </h2>
        <p className="text-slate-400 text-center text-sm mb-8 font-medium">
          Sign in to access your dream setups and save your progress securely in the cloud.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold p-3 rounded-xl mb-6 text-center">
            {error}
          </div>
        )}
        
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-slate-100 hover:bg-white text-slate-900 disabled:opacity-50 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg flex items-center justify-center space-x-3 group"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
        </button>
      </motion.div>
    </div>
  );
};
`;

fs.writeFileSync('./src/components/AuthPage.tsx', code);
console.log('Fixed AuthPage.tsx to use Google Auth');
