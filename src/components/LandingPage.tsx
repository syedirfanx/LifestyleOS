import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight,
  Monitor,
  Dumbbell,
  Camera,
  BookOpen,
  Wallet,
  Calendar,
  Layers,
  Compass,
  Clock,
  ChevronDown,
  BarChart3,
  Home,
  Laptop,
  Car,
  Shirt,
  Plane,
  Gamepad2,
  Palette,
  Heart,
  Briefcase,
  Moon,
  Coins,
  Eye
} from 'lucide-react';
import { StarsBackground } from './StarsBackground';
import { Footer } from './Footer';
import { PWAInstallButton } from './PWAInstallButton';

interface LandingPageProps {
  onNavigateToAuth: (mode: 'login' | 'register') => void;
}

interface DemoItem {
  id: string;
  name: string;
  category: string;
  price: number;
  iconName: string;
  isMonthly?: boolean;
}

interface DemoArchetype {
  id: string;
  title: string;
  tag: string;
  icon: React.ReactNode;
  items: DemoItem[];
}

const DEMO_ARCHETYPES: DemoArchetype[] = [
  {
    id: 'workstation',
    title: 'Minimalist Desk Setup',
    tag: 'Workspace',
    icon: <Monitor className="w-4 h-4 text-blue-400" />,
    items: [
      { id: '1', name: 'Curved Ultrawide Monitor', category: 'Hardware', price: 42000, iconName: 'monitor' },
      { id: '2', name: 'Solid Wood Standing Desk', category: 'Furniture', price: 28000, iconName: 'layers' },
      { id: '3', name: 'Ergonomic Task Chair', category: 'Ergonomics', price: 34000, iconName: 'sliders' },
      { id: '4', name: 'Mechanical Keyboard', category: 'Peripherals', price: 9500, iconName: 'layers' },
      { id: '5', name: 'High-Speed Fiber Internet', category: 'Subscription', price: 1800, isMonthly: true, iconName: 'clock' }
    ]
  },
  {
    id: 'fitness',
    title: 'Home Strength Studio',
    tag: 'Fitness',
    icon: <Dumbbell className="w-4 h-4 text-emerald-400" />,
    items: [
      { id: '6', name: 'Adjustable Dumbbells Set', category: 'Equipment', price: 22000, iconName: 'dumbbell' },
      { id: '7', name: 'Multi-Angle Incline Bench', category: 'Bench', price: 14500, iconName: 'layers' },
      { id: '8', name: 'Rubber Floor Mat', category: 'Flooring', price: 6000, iconName: 'layers' },
      { id: '9', name: 'Wall Mounted Pull-Up Rig', category: 'Strength', price: 8500, iconName: 'layers' },
      { id: '10', name: 'Training App Membership', category: 'Subscription', price: 1200, isMonthly: true, iconName: 'clock' }
    ]
  },
  {
    id: 'creator',
    title: 'Content Creator Rig',
    tag: 'Studio',
    icon: <Camera className="w-4 h-4 text-purple-400" />,
    items: [
      { id: '11', name: 'Mirrorless 4K Camera', category: 'Camera', price: 85000, iconName: 'camera' },
      { id: '12', name: 'Cardioid Condenser Mic', category: 'Audio', price: 16000, iconName: 'layers' },
      { id: '13', name: 'Key Light Softbox Duo', category: 'Lighting', price: 11500, iconName: 'layers' },
      { id: '14', name: 'Articulating Boom Arm', category: 'Mount', price: 4500, iconName: 'layers' },
      { id: '15', name: 'Cloud Storage 2TB', category: 'Subscription', price: 990, isMonthly: true, iconName: 'clock' }
    ]
  },
  {
    id: 'lounge',
    title: 'Mindful Reading Corner',
    tag: 'Living',
    icon: <BookOpen className="w-4 h-4 text-amber-400" />,
    items: [
      { id: '16', name: 'Lounge Armchair and Ottoman', category: 'Furniture', price: 32000, iconName: 'layers' },
      { id: '17', name: 'Floor Reading Lamp', category: 'Lighting', price: 6500, iconName: 'layers' },
      { id: '18', name: 'Teak Bookshelf', category: 'Storage', price: 18000, iconName: 'book' },
      { id: '19', name: 'Wool Area Rug', category: 'Textiles', price: 7500, iconName: 'layers' },
      { id: '20', name: 'Book Club Pass', category: 'Subscription', price: 850, isMonthly: true, iconName: 'clock' }
    ]
  }
];

const LIFE_AREA_SHOWCASES = [
  { id: 'home', name: 'Home & Living', icon: Home, items: 'Bedroom, Living, Kitchen', color: 'text-blue-400' },
  { id: 'tech', name: 'Technology', icon: Laptop, items: 'Desktops, Laptops, Audio', color: 'text-indigo-400' },
  { id: 'fitness', name: 'Fitness & Health', icon: Dumbbell, items: 'Home Gym, Cardio, Yoga', color: 'text-emerald-400' },
  { id: 'creative', name: 'Creator & Studio', icon: Camera, items: 'Cameras, Mics, Lighting', color: 'text-purple-400' },
  { id: 'vehicles', name: 'Vehicles & Garage', icon: Car, items: 'Cars, Bikes, Accessories', color: 'text-amber-400' },
  { id: 'fashion', name: 'Wardrobe & Style', icon: Shirt, items: 'Clothing, Footwear, Watches', color: 'text-rose-400' },
  { id: 'travel', name: 'Travel & Outdoors', icon: Plane, items: 'Luggage, Camping, Hiking', color: 'text-cyan-400' },
  { id: 'gaming', name: 'Gaming Setup', icon: Gamepad2, items: 'Consoles, VR, Peripherals', color: 'text-violet-400' },
  { id: 'hobbies', name: 'Hobbies & Art', icon: Palette, items: 'Music, Books, Painting', color: 'text-yellow-400' },
  { id: 'career', name: 'Office & Career', icon: Briefcase, items: 'Ergonomics, Tools, Desk', color: 'text-teal-400' },
  { id: 'wellness', name: 'Spiritual & Routine', icon: Heart, items: 'Prayer, Dhikr, Habits', color: 'text-emerald-300' },
  { id: 'finance', name: 'Recurring Expenses', icon: Wallet, items: 'EMIs, Loans, Subscriptions', color: 'text-sky-400' }
];

const WHY_LIFESTYLE_OS = [
  {
    icon: Layers,
    title: 'Personal Foundation',
    description: 'Bring order and clarity of mind to your personal spaces, setups, and daily habits. Establish structured self-discipline and intentional systems designed for your life.',
    color: 'text-blue-400',
    bgTint: 'bg-blue-500/10'
  },
  {
    icon: Coins,
    title: 'Financial Truth',
    description: 'Separate one-time purchases from ongoing monthly liabilities like EMIs, loans, and subscriptions to see your true ongoing burn rate.',
    color: 'text-indigo-400',
    bgTint: 'bg-indigo-500/10'
  },
  {
    icon: Eye,
    title: 'Intentional Living',
    description: 'Map out owned versus planned items room by room. Categorize gear visually and curb impulsive purchases through phased investment timelines.',
    color: 'text-purple-400',
    bgTint: 'bg-purple-500/10'
  },
  {
    icon: Moon,
    title: 'Spiritual Anchor',
    description: 'Ground material ambitions with daily spiritual discipline through astronomical solar prayer calculation, Qibla compass, and monthly consistency matrices.',
    color: 'text-emerald-400',
    bgTint: 'bg-emerald-500/10'
  }
];

const EXTENDED_FAQS = [
  {
    question: 'What is Lifestyle OS?',
    answer: 'Lifestyle OS is a personal command system designed to help you visually structure dream setups, evaluate one-time versus monthly financial commitments, predict realistic gear prices with AI, and maintain consistent daily prayer routines.'
  },
  {
    question: 'How does AI price estimation work?',
    answer: 'When entering an item name or brand, the AI estimates current market prices, realistic price ranges (minimum to maximum), and confidence levels based on market benchmarks and your chosen local currency.'
  },
  {
    question: 'How are EMIs, loans, and recurring subscriptions calculated?',
    answer: 'One-time equipment purchases can be assigned cash, EMI, or loan payment methods. The system calculates your monthly installment, adds recurring subscriptions and utility obligations, and presents your exact monthly and daily commitments.'
  },
  {
    question: 'How does the Islamic Prayer Tracker calculate timings?',
    answer: 'It calculates exact solar prayer times (Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha) using verified NOAA astronomical algorithms based on your geographic coordinates, with support for standard calculation conventions.'
  },
  {
    question: 'Does the application support multiple currencies?',
    answer: 'Yes. You can select your currency (such as BDT, USD, EUR, GBP, INR, and others) from the settings menu. All setup values, estimates, and installments reflect your selected currency.'
  },
  {
    question: 'Is my data saved across devices?',
    answer: 'Yes. Once you sign in or register, your setups, custom items, financial commitments, and prayer logs sync securely with the cloud database while maintaining local caching for quick access.'
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToAuth }) => {
  const [selectedArchetypeIndex, setSelectedArchetypeIndex] = useState(0);
  const currentArchetype = DEMO_ARCHETYPES[selectedArchetypeIndex];
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(() => 
    currentArchetype.items.slice(0, 4).map(i => i.id)
  );
  const [tenureMonths, setTenureMonths] = useState<number>(12);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleSelectArchetype = (index: number) => {
    setSelectedArchetypeIndex(index);
    setSelectedItemIds(DEMO_ARCHETYPES[index].items.slice(0, 4).map(i => i.id));
  };

  const toggleItem = (itemId: string) => {
    setSelectedItemIds(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const activeItems = currentArchetype.items.filter(item => selectedItemIds.includes(item.id));
  const oneTimeCost = activeItems
    .filter(i => !i.isMonthly)
    .reduce((sum, i) => sum + i.price, 0);
  const monthlySubscriptionCost = activeItems
    .filter(i => i.isMonthly)
    .reduce((sum, i) => sum + i.price, 0);

  const monthlyEmi = tenureMonths > 0 ? Math.round(oneTimeCost / tenureMonths) : 0;
  const totalMonthlyCommitment = monthlySubscriptionCost + monthlyEmi;
  const dailyBreakdown = Math.round(totalMonthlyCommitment / 30);

  return (
    <div className="min-h-screen bg-[#030610] text-slate-100 font-sans antialiased flex flex-col relative overflow-hidden">
      <StarsBackground />
      
      {/* Top Navigation */}
      <header className="relative z-10 py-5 px-6 sm:px-12 flex justify-between items-center w-full max-w-7xl mx-auto">
        <div className="relative overflow-hidden">
          <motion.h1 
            initial={{ backgroundPosition: '200% center' }}
            animate={{ backgroundPosition: '-200% center' }}
            transition={{ repeat: Infinity, duration: 9, ease: "linear" }}
            className="text-xl sm:text-2xl md:text-[26px] font-bold tracking-wider uppercase select-none font-logo bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-[length:200%_auto]"
          >
            LIFESTYLE OS
          </motion.h1>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <PWAInstallButton />
          <button 
            onClick={() => onNavigateToAuth('login')}
            className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white px-3.5 py-2 transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <button 
            onClick={() => onNavigateToAuth('register')}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 cursor-pointer"
          >
            Register
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center max-w-5xl mx-auto mt-14 sm:mt-20">
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.08] mb-5"
        >
          Pick with purpose.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400">
            Plan with care.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-xs sm:text-sm md:text-base text-slate-300 max-w-xl mb-8 leading-relaxed font-normal"
        >
          Plan, track, and budget setups across rooms and spaces. Calculate real-time EMIs and subscriptions, predict market prices with AI, and maintain daily prayer consistency with full calendar analytics.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 mb-16"
        >
          <button 
            onClick={() => onNavigateToAuth('register')}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-7 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onNavigateToAuth('login')}
            className="w-full sm:w-auto bg-slate-900/70 hover:bg-slate-800/90 text-slate-200 hover:text-white px-7 py-3 rounded-xl text-sm font-semibold transition-all shadow-md cursor-pointer"
          >
            Sign In
          </button>
        </motion.div>

        {/* Why Lifestyle OS Section */}
        <section className="w-full text-left my-8">
          <div className="mb-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1">
              The Purpose
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Why Lifestyle OS?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 font-normal max-w-2xl leading-relaxed">
              Modern life demands attention to jobs, businesses, family, and countless responsibilities, while personal care, discipline, and clarity of mind are often pushed aside. Lifestyle OS exists to restore that balance, helping people manage their own lives with the same care, intention, and discipline they give to everything else.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {WHY_LIFESTYLE_OS.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div 
                  key={idx}
                  className="group relative overflow-hidden bg-slate-900/40 hover:bg-slate-900/60 p-5 rounded-2xl flex flex-col justify-between shadow-lg backdrop-blur-md transition-all duration-200"
                >
                  <div>
                    <div className={`w-9 h-9 rounded-xl ${item.bgTint} flex items-center justify-center mb-3.5 ${item.color}`}>
                      <IconComp className="w-4.5 h-4.5" />
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-white mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Life Areas Directory Showcase */}
        <section className="w-full text-left my-8">
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Explore Life Areas & Setups
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {LIFE_AREA_SHOWCASES.map((area) => {
              const IconComp = area.icon;
              return (
                <div 
                  key={area.id}
                  className="p-3 rounded-xl bg-slate-900/30 hover:bg-slate-900/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <IconComp className={`w-3.5 h-3.5 ${area.color} shrink-0`} />
                    <span className="text-xs sm:text-sm font-medium text-white truncate">{area.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate pl-5.5">{area.items}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* AI Price Estimation Callout */}
        <section className="w-full text-left my-8 bg-gradient-to-r from-blue-950/30 via-slate-900/50 to-slate-950/60 p-6 sm:p-7 rounded-2xl shadow-xl backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                Smart AI Pricing
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Instant Market Price Estimation
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-normal leading-relaxed">
                Add any brand, model, or custom item. The system predicts current market prices, estimated price ranges, and confidence ratings in your selected currency.
              </p>
            </div>

            <div className="bg-slate-950/80 p-4 sm:p-5 rounded-xl min-w-[230px] space-y-2 shadow-inner">
              <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                <span>Sample Item</span>
                <span className="text-emerald-400 font-semibold">High Confidence</span>
              </div>
              <div className="text-sm font-bold text-white">Dell UltraSharp 27" 4K</div>
              <div className="flex items-baseline justify-between text-xs pt-1">
                <span className="text-slate-400 font-normal">Estimated</span>
                <span className="font-bold text-emerald-400 text-sm sm:text-base">৳68,000</span>
              </div>
              <div className="text-xs text-slate-400 font-normal">Range: ৳64,000 to ৳72,000</div>
            </div>
          </div>
        </section>

        {/* Live Interactive Cost & EMI Simulation */}
        <section className="w-full text-left my-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
                Financial Planning
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Interactive Cost Simulation
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl font-normal">
                Toggle items below to calculate total value, monthly installments, and daily breakdown.
              </p>
            </div>

            {/* Archetype Selector */}
            <div className="flex flex-wrap gap-2">
              {DEMO_ARCHETYPES.map((arch, idx) => {
                const isActive = selectedArchetypeIndex === idx;
                return (
                  <button
                    key={arch.id}
                    onClick={() => handleSelectArchetype(idx)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                        : 'bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <span>{arch.icon}</span>
                    <span>{arch.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative overflow-hidden bg-slate-900/35 backdrop-blur-md p-5 sm:p-7 rounded-2xl shadow-2xl">
            {/* Top 3 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="bg-slate-950/70 p-4 sm:p-5 rounded-xl shadow-inner">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total Value
                </span>
                <div className="text-2xl sm:text-3xl font-bold text-white mt-1">
                  ৳{oneTimeCost.toLocaleString()}
                </div>
                <div className="text-xs text-slate-400 font-normal mt-1">
                  {activeItems.filter(i => !i.isMonthly).length} hardware components
                </div>
              </div>

              <div className="bg-slate-950/70 p-4 sm:p-5 rounded-xl shadow-inner">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  Monthly Commitment
                </span>
                <div className="text-2xl sm:text-3xl font-bold text-indigo-300 mt-1">
                  ৳{totalMonthlyCommitment.toLocaleString()}
                  <span className="text-xs font-normal text-slate-400 ml-1">/mo</span>
                </div>
                <div className="text-xs text-slate-400 font-normal mt-1">
                  EMI (৳{monthlyEmi.toLocaleString()}) + Subscriptions (৳{monthlySubscriptionCost.toLocaleString()})
                </div>
              </div>

              <div className="bg-slate-950/70 p-4 sm:p-5 rounded-xl shadow-inner">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Daily Feasibility
                </span>
                <div className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-1">
                  ৳{dailyBreakdown.toLocaleString()}
                  <span className="text-xs font-normal text-slate-400 ml-1">/day</span>
                </div>
                <div className="text-xs text-slate-400 font-normal mt-1">
                  Daily expense equivalent
                </div>
              </div>
            </div>

            {/* Middle Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-2.5">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Tap to add or remove gear
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentArchetype.items.map((item) => {
                    const isSelected = selectedItemIds.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={`p-3.5 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected 
                            ? 'bg-blue-950/40 text-white shadow-sm' 
                            : 'bg-slate-950/40 text-slate-300 hover:bg-slate-900/50'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className={`text-xs sm:text-sm font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                            {item.name}
                          </div>
                          <div className="text-xs text-slate-400 font-normal mt-0.5">
                            {item.category}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-slate-100' : 'text-slate-300'}`}>
                            ৳{item.price.toLocaleString()}
                          </div>
                          <div className="text-xs text-slate-400 font-normal">
                            {item.isMonthly ? '/mo' : 'one-time'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tenure Control Column */}
              <div className="lg:col-span-4 bg-slate-950/60 p-5 rounded-xl flex flex-col justify-between shadow-inner">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    EMI Tenure Tuning
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs font-semibold text-slate-300">
                      <span>Duration</span>
                      <span className="text-indigo-400 font-bold">{tenureMonths} Months</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[3, 6, 12, 24].map((m) => (
                        <button
                          key={m}
                          onClick={() => setTenureMonths(m)}
                          className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            tenureMonths === m
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          {m}m
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-950/90 p-3.5 rounded-lg space-y-2 text-xs shadow-inner">
                    <div className="flex justify-between text-slate-400 font-normal">
                      <span>Monthly Installment</span>
                      <span className="text-slate-100 font-bold">৳{monthlyEmi.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 font-normal">
                      <span>Subscriptions</span>
                      <span className="text-slate-100 font-bold">৳{monthlySubscriptionCost.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 flex justify-between font-semibold border-t border-slate-900">
                      <span className="text-slate-300">Total Monthly</span>
                      <span className="text-emerald-400 font-bold">৳{totalMonthlyCommitment.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateToAuth('register')}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-3 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  <span>Build This Setup</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Islamic Prayer Tracker Preview Highlight */}
        <section className="w-full text-left my-10 bg-gradient-to-br from-[#06241e] via-[#0a3229] to-[#041a15] p-6 sm:p-8 rounded-2xl shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Spiritual Discipline
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Islamic Prayer Tracker
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl font-normal leading-relaxed">
                Astronomical solar calculation for Fajr, Dhuhr, Asr, Maghrib, and Isha. Track congregation status, voluntary Sunnah prayers, and analyze monthly consistency rates.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-[#031915]/90 p-3.5 sm:p-4 rounded-xl min-w-[135px] text-center shadow-inner">
                <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Monthly Goal</div>
                <div className="text-2xl sm:text-3xl font-black text-white mt-0.5">93%</div>
                <div className="text-xs text-emerald-300/70 font-normal">Consistency</div>
              </div>
              <div className="bg-[#031915]/90 p-3.5 sm:p-4 rounded-xl min-w-[135px] text-center shadow-inner">
                <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Active Streak</div>
                <div className="text-2xl sm:text-3xl font-black text-white mt-0.5">7 Days</div>
                <div className="text-xs text-emerald-300/70 font-normal">5 of 5 daily</div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-6 pt-5 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-4 text-emerald-200/90 font-normal">
              <span className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-400" />
                Qibla Compass
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Monthly Calendar Grid
              </span>
              <span className="flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                Day and Month Analysis
              </span>
            </div>

            <button
              onClick={() => onNavigateToAuth('register')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shadow-lg shadow-emerald-600/30 cursor-pointer text-xs sm:text-sm"
            >
              Start Tracking
            </button>
          </div>
        </section>

        {/* Extended FAQs */}
        <section className="w-full text-left my-12">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-2.5 max-w-4xl">
            {EXTENDED_FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div 
                  key={index}
                  className="bg-slate-900/40 hover:bg-slate-900/60 rounded-xl overflow-hidden transition-all duration-200 shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-semibold text-white pr-4">
                      {faq.question}
                    </span>
                    <ChevronDown 
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-white' : ''
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
                        <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal pt-1">
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

        {/* Bottom Call to Action */}
        <section className="w-full my-12 bg-gradient-to-r from-blue-950/30 via-indigo-950/30 to-slate-900/50 p-8 sm:p-10 rounded-2xl text-center flex flex-col items-center shadow-2xl backdrop-blur-md">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
            Start Structuring Your Lifestyle
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mb-6 font-normal">
            Take control of your spaces, equipment budgeting, monthly EMIs, and spiritual rhythm.
          </p>
          <div className="flex flex-col sm:flex-row items-center space-y-2.5 sm:space-y-0 sm:space-x-3">
            <button
              onClick={() => onNavigateToAuth('register')}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-7 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateToAuth('login')}
              className="w-full sm:w-auto bg-slate-900/70 hover:bg-slate-800/90 text-slate-200 hover:text-white px-7 py-3 rounded-xl text-sm font-semibold transition-all shadow-md cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
