import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Box, 
  Target, 
  Sparkles, 
  CheckCircle2, 
  ChevronDown,
  Monitor,
  Dumbbell,
  Camera,
  Coffee,
  Wallet,
  Calendar,
  Layers,
  ChevronRight,
  TrendingDown,
  Compass,
  Zap,
  Clock
} from 'lucide-react';
import { StarsBackground } from './StarsBackground';

interface LandingPageProps {
  onNavigateToAuth: (mode: 'login' | 'register') => void;
}

interface DemoItem {
  id: string;
  name: string;
  category: string;
  price: number;
  icon: string;
  isMonthly?: boolean;
}

interface DemoArchetype {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tag: string;
  items: DemoItem[];
}

const DEMO_ARCHETYPES: DemoArchetype[] = [
  {
    id: 'workstation',
    title: 'Minimalist Desk Setup',
    subtitle: 'High-focus workstation for coding and creative work',
    tag: 'Workspace',
    icon: <Monitor className="w-5 h-5 text-blue-400" />,
    items: [
      { id: '1', name: 'Curved Ultrawide Monitor', category: 'Hardware', price: 42000, icon: '🖥️' },
      { id: '2', name: 'Solid Wood Standing Desk', category: 'Furniture', price: 28000, icon: '🪵' },
      { id: '3', name: 'Ergonomic Task Chair', category: 'Ergonomics', price: 34000, icon: '🪑' },
      { id: '4', name: 'Low-Profile Mechanical Keyboard', category: 'Peripherals', price: 9500, icon: '⌨️' },
      { id: '5', name: 'High-Speed Fiber Internet', category: 'Subscription', price: 1800, isMonthly: true, icon: '🌐' }
    ]
  },
  {
    id: 'fitness',
    title: 'Home Strength Studio',
    subtitle: 'Compact high-intensity training corner for daily routines',
    tag: 'Fitness',
    icon: <Dumbbell className="w-5 h-5 text-emerald-400" />,
    items: [
      { id: '6', name: 'Adjustable Dumbbells Set', category: 'Equipment', price: 22000, icon: '🏋️' },
      { id: '7', name: 'Multi-Angle Incline Bench', category: 'Bench', price: 14500, icon: '📐' },
      { id: '8', name: 'High-Density Rubber Floor Tiles', category: 'Flooring', price: 6000, icon: '⬛' },
      { id: '9', name: 'Wall Mounted Pull-Up Rig', category: 'Strength', price: 8500, icon: '🪜' },
      { id: '10', name: 'Workout App Membership', category: 'Subscription', price: 1200, isMonthly: true, icon: '📱' }
    ]
  },
  {
    id: 'creator',
    title: 'Content Creator Rig',
    subtitle: 'Studio lighting, camera gear, and pristine audio capture',
    tag: 'Studio',
    icon: <Camera className="w-5 h-5 text-purple-400" />,
    items: [
      { id: '11', name: 'Mirrorless 4K Camera Body', category: 'Camera', price: 85000, icon: '📷' },
      { id: '12', name: 'Studio Cardioid Condenser Mic', category: 'Audio', price: 16000, icon: '🎙️' },
      { id: '13', name: 'Key Light Softbox Duo', category: 'Lighting', price: 11500, icon: '💡' },
      { id: '14', name: 'Adjustable Articulating Boom Arm', category: 'Audio Mount', price: 4500, icon: '🦾' },
      { id: '15', name: 'Cloud Storage 2TB Tier', category: 'Subscription', price: 990, isMonthly: true, icon: '☁️' }
    ]
  },
  {
    id: 'lounge',
    title: 'Mindful Reading Corner',
    subtitle: 'Quiet corner tailored for deep focus and reading books',
    tag: 'Living',
    icon: <Coffee className="w-5 h-5 text-amber-400" />,
    items: [
      { id: '16', name: 'Lounge Armchair & Ottoman', category: 'Furniture', price: 32000, icon: '🛋️' },
      { id: '17', name: 'Warm LED Floor Reading Lamp', category: 'Lighting', price: 6500, icon: '💡' },
      { id: '18', name: 'Minimalist Teak Bookshelf', category: 'Storage', price: 18000, icon: '📚' },
      { id: '19', name: 'Pure Wool Braided Area Rug', category: 'Textiles', price: 7500, icon: '🧶' },
      { id: '20', name: 'Book Club & Magazine Pass', category: 'Subscription', price: 850, isMonthly: true, icon: '📖' }
    ]
  }
];

const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Choose or Name Your Setup',
    description: 'Pick from curated setup archetypes or define a custom space tailored to your lifestyle and room layout.'
  },
  {
    step: '02',
    title: 'Add Items & AI Estimates',
    description: 'List your gear, specify brand, quantity, and cost, or let AI predict market price ranges instantly.'
  },
  {
    step: '03',
    title: 'Calculate Commitments & EMIs',
    description: 'Distribute capital across one-time purchases, monthly EMIs, and recurring subscriptions with live totals.'
  },
  {
    step: '04',
    title: 'Track Milestones to Completion',
    description: 'Mark acquired equipment as Purchased and monitor exact completion percentages as your dream takes shape.'
  }
];

const FAQS = [
  {
    question: 'How does Lifestyle OS calculate total setup costs?',
    answer: 'The platform separates one-time investments from monthly commitments like subscriptions, EMIs, and personal loans, giving you both the total capital worth and an accurate monthly burn rate.'
  },
  {
    question: 'Can I use my local currency?',
    answer: 'Yes. Lifestyle OS automatically detects your local currency based on your location and offers full manual selection with live conversion support across global currencies.'
  },
  {
    question: 'How does the AI Price Estimator work?',
    answer: 'When you type an item name or brand, the built-in AI models evaluate current retail markets to suggest an accurate price range, estimated value, and confidence rating.'
  },
  {
    question: 'Is my setup data saved across devices?',
    answer: 'Yes. Authenticated users have their setups, items, payment schedules, and progress synced in real time to secure cloud storage.'
  },
  {
    question: 'Can I track monthly recurring costs separately from one-time items?',
    answer: 'Yes. Every setup item can be configured as a one-time cash purchase, an EMI plan with custom tenure and interest, a personal loan, or an ongoing monthly subscription.'
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToAuth }) => {
  // Live Simulator state
  const [selectedArchetypeIndex, setSelectedArchetypeIndex] = useState(0);
  const currentArchetype = DEMO_ARCHETYPES[selectedArchetypeIndex];
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(() => 
    currentArchetype.items.slice(0, 4).map(i => i.id)
  );
  const [tenureMonths, setTenureMonths] = useState<number>(12);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Switch archetype handler
  const handleSelectArchetype = (index: number) => {
    setSelectedArchetypeIndex(index);
    setSelectedItemIds(DEMO_ARCHETYPES[index].items.slice(0, 4).map(i => i.id));
  };

  // Toggle item in live calculator
  const toggleItem = (itemId: string) => {
    setSelectedItemIds(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  // Calculations
  const activeItems = currentArchetype.items.filter(item => selectedItemIds.includes(item.id));
  const oneTimeCost = activeItems
    .filter(i => !i.isMonthly)
    .reduce((sum, i) => sum + i.price, 0);
  const monthlySubscriptionCost = activeItems
    .filter(i => i.isMonthly)
    .reduce((sum, i) => sum + i.price, 0);

  const monthlyEmi = tenureMonths > 0 ? Math.round(oneTimeCost / tenureMonths) : 0;
  const totalMonthlyCommitment = monthlySubscriptionCost + monthlyEmi;
  const dailyCoffeeCost = Math.round(totalMonthlyCommitment / 30);

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
            className="hidden sm:block text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Log In
          </button>
          <button 
            onClick={() => onNavigateToAuth('register')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 shadow-[0_10px_25px_-5px_rgba(79,70,229,0.5)]"
          >
            Register
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center max-w-5xl mx-auto mt-14 sm:mt-20">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-tight mb-6"
        >
          Design Your{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
            Dream
          </span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
            Lifestyle
          </span>{' '}
          Setups
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mb-8 leading-relaxed font-medium"
        >
          Plan, track, and budget your setups. All your gear, EMIs, and monthly subscriptions organized with clarity and reliability.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-20"
        >
          <button 
            onClick={() => onNavigateToAuth('register')}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-4 rounded-xl text-base font-bold transition-all duration-300 shadow-[0_15px_30px_-5px_rgba(79,70,229,0.5)] flex items-center justify-center space-x-2 group"
          >
            <span>Get Started for Free</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={() => onNavigateToAuth('login')}
            className="w-full sm:w-auto bg-slate-800/80 hover:bg-slate-750 text-white px-8 py-4 rounded-xl text-base font-bold transition-all duration-300 shadow-lg shadow-black/40 hover:shadow-black/60"
          >
            Sign In
          </button>
        </motion.div>

        {/* Why Lifestyle OS Section */}
        <section className="w-full text-left my-12">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">
            The Purpose
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
            Why Lifestyle OS?
          </h2>
          <p className="text-sm text-slate-400 mb-8 max-w-xl">
            Most people plan dream spaces in scattered notes or make impulsive purchases without knowing the real financial picture. Here is how Lifestyle OS changes that.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-6 sm:p-7 rounded-3xl shadow-xl shadow-black/50 backdrop-blur-md flex flex-col justify-between hover:from-slate-850 hover:to-slate-900 transition-all duration-300">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-5 font-bold shadow-inner shadow-blue-500/10">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  No More Blind Purchases
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Buying one piece at a time often leads to incompatible gear and regret. Lifestyle OS maps every item in context so you build spaces intentionally.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 text-2xs text-slate-400 font-semibold">
                Holistic space inventory
              </div>
            </div>

            <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-6 sm:p-7 rounded-3xl shadow-xl shadow-black/50 backdrop-blur-md flex flex-col justify-between hover:from-slate-850 hover:to-slate-900 transition-all duration-300">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-5 font-bold shadow-inner shadow-indigo-500/10">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Full Monthly Commitment Clarity
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Hardware is only half the cost. Subscriptions, cloud services, and EMIs quietly add up. See your true monthly burn rate beside total setup value.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 text-2xs text-slate-400 font-semibold">
                EMIs and recurring breakdown
              </div>
            </div>

            <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-6 sm:p-7 rounded-3xl shadow-xl shadow-black/50 backdrop-blur-md flex flex-col justify-between hover:from-slate-850 hover:to-slate-900 transition-all duration-300">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-5 font-bold shadow-inner shadow-emerald-500/10">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  Actionable Milestone Progress
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Mark items as planned, active, or purchased. Track your exact completion rate and stay motivated as your vision turns into reality.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 text-2xs text-slate-400 font-semibold">
                Clear checklist execution
              </div>
            </div>
          </div>
        </section>

        {/* Lucrative & Engaging Live Calculator */}
        <section className="w-full text-left my-12">
          {/* Header row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                Interactive Cost Reality
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Can You Afford Your Dream Setup?
              </h2>
              <p className="text-sm text-slate-400 mt-1 max-w-xl">
                Tap items to toggle your gear. Watch the total capital break down into realistic monthly installments and daily coffee numbers.
              </p>
            </div>

            {/* Quick Preset Selector */}
            <div className="flex flex-wrap gap-2">
              {DEMO_ARCHETYPES.map((arch, idx) => {
                const isActive = selectedArchetypeIndex === idx;
                return (
                  <button
                    key={arch.id}
                    onClick={() => handleSelectArchetype(idx)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer shadow-md ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25 scale-102' 
                        : 'bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-750 shadow-black/40'
                    }`}
                  >
                    <span>{arch.icon}</span>
                    <span>{arch.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Interactive Stage */}
          <div className="bg-gradient-to-b from-slate-900/95 to-[#060a12] p-6 sm:p-8 rounded-3xl shadow-2xl shadow-black/70 backdrop-blur-xl">
            {/* Top Interactive Banner: Real-Time Results */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {/* Card 1: Total Upfront */}
              <div className="bg-slate-850/90 p-5 rounded-2xl flex flex-col justify-between shadow-lg shadow-black/40">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Value</span>
                  <Wallet className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  ৳{oneTimeCost.toLocaleString()}
                </div>
                <div className="text-2xs text-slate-400 mt-1 font-medium">
                  {activeItems.filter(i => !i.isMonthly).length} hardware components
                </div>
              </div>

              {/* Card 2: Realistic Monthly */}
              <div className="bg-gradient-to-br from-indigo-900/50 via-indigo-950/40 to-blue-950/50 p-5 rounded-2xl flex flex-col justify-between shadow-xl shadow-indigo-950/30">
                <div className="flex items-center justify-between text-indigo-300 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Monthly Breakdown</span>
                  <Calendar className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-indigo-300 tracking-tight">
                  ৳{totalMonthlyCommitment.toLocaleString()}
                  <span className="text-sm font-medium text-indigo-400/80 ml-1">/mo</span>
                </div>
                <div className="text-2xs text-indigo-300/80 mt-1 font-medium">
                  EMI (৳{monthlyEmi.toLocaleString()}) + Subscriptions (৳{monthlySubscriptionCost.toLocaleString()})
                </div>
              </div>

              {/* Card 3: Daily Coffee Equivalent */}
              <div className="bg-slate-850/90 p-5 rounded-2xl flex flex-col justify-between shadow-lg shadow-black/40">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Daily Feasibility</span>
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
                  ৳{dailyCoffeeCost.toLocaleString()}
                  <span className="text-sm font-medium text-slate-400 ml-1">/day</span>
                </div>
                <div className="text-2xs text-slate-400 mt-1 font-medium">
                  Equivalent to one daily beverage
                </div>
              </div>
            </div>

            {/* Middle Section: Tenure Slider & Interactive Item Chips */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Interactive Item Cards */}
              <div className="lg:col-span-8 flex flex-col space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
                  <span>Tap items to add or remove from your budget:</span>
                  <span className="text-blue-400 font-semibold">{activeItems.length} of {currentArchetype.items.length} active</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentArchetype.items.map((item) => {
                    const isSelected = selectedItemIds.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={`p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer flex items-center justify-between shadow-md ${
                          isSelected 
                            ? 'bg-slate-800 text-white shadow-black/50 scale-101' 
                            : 'bg-slate-900/60 opacity-60 hover:opacity-90 hover:bg-slate-850 shadow-black/30'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0 pr-2">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 shadow-inner ${
                            isSelected ? 'bg-blue-600/30 text-blue-300' : 'bg-slate-800 text-slate-400'
                          }`}>
                            <span role="img" aria-label={item.name}>{item.icon}</span>
                          </div>
                          <div className="truncate">
                            <div className={`text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                              {item.name}
                            </div>
                            <div className="text-2xs text-slate-400 font-medium">
                              {item.category}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className={`text-sm font-black ${isSelected ? 'text-slate-100' : 'text-slate-400'}`}>
                            ৳{item.price.toLocaleString()}
                          </div>
                          <div className="text-2xs font-semibold text-slate-400 uppercase tracking-wider">
                            {item.isMonthly ? '/month' : 'one-time'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Loan Tenure Tuning & Direct Action */}
              <div className="lg:col-span-4 bg-slate-850/90 p-6 rounded-2xl flex flex-col justify-between shadow-xl shadow-black/50">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <span>EMI Tenure Calculator</span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-6 font-medium">
                    Adjust installment duration to see how comfortable your dream setup is month over month.
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-xs font-bold text-slate-300">
                      <span>Tenure Length</span>
                      <span className="text-indigo-400">{tenureMonths} Months</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[3, 6, 12, 24].map((months) => (
                        <button
                          key={months}
                          onClick={() => setTenureMonths(months)}
                          className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
                            tenureMonths === months
                              ? 'bg-indigo-600 text-white shadow-indigo-600/30'
                              : 'bg-slate-750 text-slate-300 hover:text-white hover:bg-slate-700'
                          }`}
                        >
                          {months}m
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900/80 p-4 rounded-xl space-y-2 text-xs text-slate-400 shadow-inner">
                    <div className="flex justify-between items-center">
                      <span>Monthly Installment</span>
                      <span className="text-slate-200 font-bold">৳{monthlyEmi.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Ongoing Services</span>
                      <span className="text-slate-200 font-bold">৳{monthlySubscriptionCost.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center font-bold text-slate-200">
                      <span>Total Monthly</span>
                      <span className="text-emerald-400 text-sm">৳{totalMonthlyCommitment.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-800">
                  <button
                    onClick={() => onNavigateToAuth('register')}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
                  >
                    <span>Save This Setup Plan</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-center text-2xs text-slate-500 mt-2">
                    Free account with real-time cloud sync
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Prebuilt Setup Archetypes */}
        <section className="w-full text-left my-16">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
            Explore Archetypes
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
            Curated Spaces for Every Dimension of Life
          </h2>
          <p className="text-sm text-slate-400 mb-8 max-w-xl">
            Lifestyle OS comes pre-seeded with modular setups tailored to your goals. Choose a space to jumpstart your inventory.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEMO_ARCHETYPES.map((arch) => (
              <div 
                key={arch.id}
                className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-6 rounded-3xl backdrop-blur-sm flex flex-col justify-between shadow-xl shadow-black/40 hover:from-slate-850 hover:to-slate-900 hover:shadow-black/60 transition-all duration-300 group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-200 flex items-center justify-center mb-4 shadow-md shadow-black/40">
                    {arch.icon}
                  </div>
                  <span className="text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 shadow-sm">
                    {arch.tag}
                  </span>
                  <h3 className="text-base font-bold text-white mt-2 mb-1 group-hover:text-blue-400 transition-colors">
                    {arch.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {arch.subtitle}
                  </p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">{arch.items.length} starter items</span>
                  <button 
                    onClick={() => onNavigateToAuth('register')}
                    className="text-blue-400 font-bold hover:text-blue-300 transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Create</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Workflow Steps */}
        <section className="w-full text-left my-16">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
            System Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
            How Lifestyle OS Works
          </h2>
          <p className="text-sm text-slate-400 mb-10 max-w-xl">
            A reliable workflow designed to turn unorganized desires into a calculated, achievable lifestyle roadmap.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WORKFLOW_STEPS.map((step) => (
              <div 
                key={step.step}
                className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-6 rounded-3xl backdrop-blur-sm relative overflow-hidden shadow-xl shadow-black/40"
              >
                <div className="text-3xl font-black text-slate-600 mb-4 font-mono">
                  {step.step}
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="w-full text-left my-16">
          <div className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-1">
            Core Highlights
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-8">
            Engineered for Precision
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-6 rounded-3xl text-left backdrop-blur-sm shadow-xl shadow-black/40">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center mb-4 shadow-inner">
                <Box className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-200 mb-2">Visual Organization</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                Categorize your items visually. Track what you own and what you want to buy across independent spaces.
              </p>
            </div>
            <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-6 rounded-3xl text-left backdrop-blur-sm shadow-xl shadow-black/40">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center mb-4 shadow-inner">
                <Target className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-200 mb-2">Smart Budgeting</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                Calculate total costs, manage EMIs, and track your monthly subscriptions with real-time currency conversions.
              </p>
            </div>
            <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-6 rounded-3xl text-left backdrop-blur-sm shadow-xl shadow-black/40">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 flex items-center justify-center mb-4 shadow-inner">
                <ShieldCheck className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-200 mb-2">Secure & Private</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                Your data is stored securely. Access your setups and synchronizations anytime across devices.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full text-left my-16">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">
            Questions & Answers
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-400 mb-8 max-w-xl">
            Everything you need to know about planning and budgeting your setups in Lifestyle OS.
          </p>

          <div className="space-y-3 max-w-3xl">
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div 
                  key={index}
                  className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 rounded-2xl overflow-hidden shadow-lg shadow-black/30 transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between transition-colors hover:bg-slate-850 cursor-pointer"
                  >
                    <span className="text-sm font-bold text-slate-200 pr-4">
                      {faq.question}
                    </span>
                    <ChevronDown 
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* Final CTA Bar */}
        <section className="w-full my-16 bg-gradient-to-r from-blue-900/40 via-indigo-900/35 to-purple-900/40 p-8 sm:p-12 rounded-3xl text-center flex flex-col items-center shadow-2xl shadow-black/60 backdrop-blur-lg">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-3">
            Ready to Build Your Dream Setup?
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mb-8 font-medium">
            Start organizing your workstation, gym corner, studio, and room spaces with clear financial insight.
          </p>
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => onNavigateToAuth('register')}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-3.5 rounded-xl text-sm font-bold transition-all shadow-[0_10px_25px_-5px_rgba(79,70,229,0.5)] flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateToAuth('login')}
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white px-8 py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-black/40 cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-6 text-center text-xs text-slate-500 border-t border-slate-900/80">
        <p>Lifestyle OS. Built for thoughtful planning and personal clarity.</p>
      </footer>
    </div>
  );
};
