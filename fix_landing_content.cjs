const fs = require('fs');

let code = fs.readFileSync('./src/components/LandingPage.tsx', 'utf-8');

// Replace imports
code = code.replace(
  "import { Sparkles, ArrowRight, ShieldCheck, Box, Target } from 'lucide-react';",
  "import { Sparkles, ArrowRight, ShieldCheck, Box, Target, Eye, Compass } from 'lucide-react';"
);

// Remove "The Ultimate Setup Tracker"
const badgeStr = `        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center space-x-2 bg-blue-900/20 border border-blue-500/20 rounded-full px-4 py-1.5 mb-8"
        >
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">The Ultimate Setup Tracker</span>
        </motion.div>`;
code = code.replace(badgeStr, "");

// Replace Description
const oldDesc = `Plan, track, and budget your dream gaming room, home studio, fashion wardrobe, or automotive garage. All your goals, beautifully organized.`;
const newDesc = `Plan, track, and budget your dream setup. All your goals, beautifully organized.`;
code = code.replace(oldDesc, newDesc);

// Replace Features Grid
const oldFeatures = `        <motion.div 
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
        </motion.div>`;

const newFeatures = `        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-24"
        >
          <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-3xl text-left backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-900/30 flex items-center justify-center mb-4 border border-blue-500/20">
              <Eye className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-2">Self-Awareness</h3>
            <p className="text-sm text-slate-400 font-medium leading-relaxed">Understand your desires and goals by mapping them out visually and structurally.</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-3xl text-left backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-indigo-900/30 flex items-center justify-center mb-4 border border-indigo-500/20">
              <Compass className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-2">Clarity</h3>
            <p className="text-sm text-slate-400 font-medium leading-relaxed">Achieve crystal-clear transparency on your budgeting, EMIs, and priorities.</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-3xl text-left backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-purple-900/30 flex items-center justify-center mb-4 border border-purple-500/20">
              <ShieldCheck className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-2">Reliability</h3>
            <p className="text-sm text-slate-400 font-medium leading-relaxed">A dependable, secure system that keeps your data safe and accessible everywhere.</p>
          </div>
        </motion.div>`;

code = code.replace(oldFeatures, newFeatures);

fs.writeFileSync('./src/components/LandingPage.tsx', code);
console.log('Fixed landing page content');
