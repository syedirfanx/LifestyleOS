import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, ShieldCheck, Box, Target } from 'lucide-react';
import { StarsBackground } from './StarsBackground';

interface LandingPageProps {
  onNavigateToAuth: (mode: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToAuth }) => {
  return (
    <div className="min-h-screen bg-[#03050a] text-slate-100 font-sans antialiased flex flex-col relative overflow-hidden">
      <StarsBackground />
      
      {/* Header */}
      <header className="relative z-10 py-6 px-6 sm:px-10 flex justify-between items-center w-full max-w-7xl mx-auto">
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
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => onNavigateToAuth('login')}
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Log In
          </button>
          <button 
            onClick={() => onNavigateToAuth('register')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.3)] border border-indigo-500/30"
          >
            Register
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center max-w-4xl mx-auto mt-16 sm:mt-24 mb-24">


        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-7xl font-black text-white tracking-tight leading-tight mb-6"
        >
          Design Your Dream <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
            Lifestyle Setups
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed font-medium"
        >
          Plan, track, and budget your dream setup. All your goals, beautifully organized to bring self-awareness, clarity, and reliability to your lifestyle.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4"
        >
          <button 
            onClick={() => onNavigateToAuth('register')}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-4 rounded-xl text-base font-bold transition-all duration-300 shadow-[0_0_30px_rgba(79,70,229,0.4)] border border-indigo-500/30 flex items-center justify-center space-x-2 group"
          >
            <span>Get Started for Free</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={() => onNavigateToAuth('login')}
            className="w-full sm:w-auto bg-slate-900/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-white px-8 py-4 rounded-xl text-base font-bold transition-all duration-300"
          >
            Sign In
          </button>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-24"
        >
          <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-3xl text-left backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-900/30 flex items-center justify-center mb-4 border border-blue-500/20">
              <Box className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-2">Visual Organization</h3>
            <p className="text-sm text-slate-400 font-medium leading-relaxed">Categorize your items visually. Track what you own and what you want to buy.</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-3xl text-left backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-indigo-900/30 flex items-center justify-center mb-4 border border-indigo-500/20">
              <Target className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-2">Smart Budgeting</h3>
            <p className="text-sm text-slate-400 font-medium leading-relaxed">Calculate total costs, manage EMIs, and track your monthly subscriptions easily.</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-3xl text-left backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-purple-900/30 flex items-center justify-center mb-4 border border-purple-500/20">
              <ShieldCheck className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-2">Secure & Private</h3>
            <p className="text-sm text-slate-400 font-medium leading-relaxed">Your data is stored securely. Access your setups anytime, anywhere.</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
