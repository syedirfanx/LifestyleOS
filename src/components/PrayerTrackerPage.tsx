import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Compass,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Circle,
  Clock,
  Calendar as CalendarIcon,
  Moon,
  MapPin,
  Check,
  X,
  BarChart3,
  TrendingUp,
  Layers,
  Award,
  Flame,
  CheckSquare,
  Navigation,
} from 'lucide-react';
import {
  PrayerName,
  PrayerStatus,
  DailyPrayerRecord,
  SunnahName,
  CalculationMethodId,
  JuristicMethodId,
} from '../types';
import {
  calculatePrayerTimes,
  getQiblaBearing,
  getHijriDate,
  getCountdownToNextPrayer,
  calculateMonthStats,
  CALCULATION_METHODS,
  DEFAULT_PRAYERS_STATE,
  PRAYER_METADATA,
} from '../utils/prayerTimes';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { sanitizeForFirestore } from '../utils/firestore';

interface PrayerTrackerPageProps {
  onBack: () => void;
  initialLatitude?: number;
  initialLongitude?: number;
  countryName?: string;
  cityName?: string;
  user?: User | null;
}

const DHIKR_PRESETS = [
  { id: 'subhanallah', text: 'SubhanAllah', target: 33 },
  { id: 'alhamdulillah', text: 'Alhamdulillah', target: 33 },
  { id: 'allahuakbar', text: 'Allahu Akbar', target: 34 },
  { id: 'astaghfirullah', text: 'Astaghfirullah', target: 100 },
  { id: 'lailahaillallah', text: 'La ilaha illallah', target: 100 },
];

const PRAYER_KEYS: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

// Default empty records - new users start clean at 0
export const PrayerTrackerPage: React.FC<PrayerTrackerPageProps> = ({
  onBack,
  initialLatitude = 23.8103,
  initialLongitude = 90.4125,
  countryName = 'Bangladesh',
  cityName = 'Dhaka',
  user,
}) => {
  // Navigation tabs: tracker | calendar | analytics
  const [activeTab, setActiveTab] = useState<'tracker' | 'calendar' | 'analytics'>('tracker');
  const [analyticsScope, setAnalyticsScope] = useState<'month' | 'day'>('month');

  // Track active user state (prop or auth listener)
  const [currentUser, setCurrentUser] = useState<User | null>(user || auth.currentUser);

  useEffect(() => {
    if (user !== undefined) {
      setCurrentUser(user);
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setCurrentUser(u);
    });
    return () => unsubscribe();
  }, []);

  // Date selection state
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  // Calendar month state (for calendar view and month analytics)
  const [calendarDate, setCalendarDate] = useState<Date>(() => new Date());

  // Location & Calculation settings
  const [latitude, setLatitude] = useState<number>(() => {
    const saved = localStorage.getItem('lifestyle_prayer_lat');
    return saved ? parseFloat(saved) : initialLatitude;
  });

  const [longitude, setLongitude] = useState<number>(() => {
    const saved = localStorage.getItem('lifestyle_prayer_lng');
    return saved ? parseFloat(saved) : initialLongitude;
  });

  const [calcMethod, setCalcMethod] = useState<CalculationMethodId>(() => {
    return (localStorage.getItem('lifestyle_prayer_method') as CalculationMethodId) || 'MWL';
  });

  const [juristicMethod, setJuristicMethod] = useState<JuristicMethodId>(() => {
    return (localStorage.getItem('lifestyle_prayer_juristic') as JuristicMethodId) || 'STANDARD';
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Daily records map by YYYY-MM-DD - starts empty for new users
  const [records, setRecords] = useState<Record<string, DailyPrayerRecord>>(() => {
    try {
      const cached = localStorage.getItem('lifestyle_prayer_records');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {
      // fallback
    }
    return {};
  });

  // Digital Tasbih state
  const [tasbihCount, setTasbihCount] = useState<number>(0);
  const [selectedDhikrIndex, setSelectedDhikrIndex] = useState<number>(0);

  // Status selector modal for specific prayer
  const [editingPrayer, setEditingPrayer] = useState<PrayerName | null>(null);

  // Date key YYYY-MM-DD
  const dateKey = useMemo(() => {
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [selectedDate]);

  // Current day record
  const currentRecord: DailyPrayerRecord = useMemo(() => {
    return (
      records[dateKey] || {
        date: dateKey,
        prayers: { ...DEFAULT_PRAYERS_STATE },
        sunnah: {},
      }
    );
  }, [records, dateKey]);

  // Calculated prayer times for the selected date
  const prayerTimes = useMemo(() => {
    return calculatePrayerTimes(selectedDate, latitude, longitude, calcMethod, juristicMethod);
  }, [selectedDate, latitude, longitude, calcMethod, juristicMethod]);

  // Qibla Direction
  const qibla = useMemo(() => {
    return getQiblaBearing(latitude, longitude);
  }, [latitude, longitude]);

  // Live Qibla Compass state
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [isCompassActive, setIsCompassActive] = useState<boolean>(false);
  const [compassError, setCompassError] = useState<string | null>(null);
  const [isQiblaModalOpen, setIsQiblaModalOpen] = useState<boolean>(false);

  // Live device orientation listener
  useEffect(() => {
    if (!isCompassActive) {
      setDeviceHeading(null);
      return;
    }

    let lastVibrate = 0;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      let heading: number | null = null;

      // iOS Safari provides webkitCompassHeading (0 = North, clockwise)
      if ((e as any).webkitCompassHeading !== undefined && (e as any).webkitCompassHeading !== null) {
        heading = (e as any).webkitCompassHeading;
      } else if (e.alpha !== null && e.alpha !== undefined) {
        // Android / standard: alpha is degrees counterclockwise from North
        heading = (360 - e.alpha) % 360;
      }

      if (heading !== null && !isNaN(heading)) {
        const rounded = Math.round(heading);
        setDeviceHeading(rounded);

        // Check if facing within 5 degrees of Kaaba
        const diff = Math.abs(((qibla.bearing - rounded + 540) % 360) - 180);
        if (diff <= 5) {
          const now = Date.now();
          if (now - lastVibrate > 2000) {
            lastVibrate = now;
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate([35, 25, 35]);
            }
          }
        }
      }
    };

    window.addEventListener('deviceorientationabsolute', handleOrientation as any, true);
    window.addEventListener('deviceorientation', handleOrientation, true);

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation as any, true);
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [isCompassActive, qibla.bearing]);

  const startLiveCompass = useCallback(async () => {
    setCompassError(null);

    // iOS 13+ requires explicit permission via user interaction
    if (
      typeof window !== 'undefined' &&
      typeof (DeviceOrientationEvent as any) !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      try {
        const res = await (DeviceOrientationEvent as any).requestPermission();
        if (res !== 'granted') {
          setCompassError('Motion sensor permission denied in browser.');
          return;
        }
      } catch (err) {
        setCompassError('Sensor permission request failed.');
        return;
      }
    }

    setIsCompassActive(true);
  }, []);

  const handleOpenQiblaModal = async () => {
    setIsQiblaModalOpen(true);
    await startLiveCompass();
  };

  const handleCloseQiblaModal = () => {
    setIsQiblaModalOpen(false);
    setIsCompassActive(false);
    setDeviceHeading(null);
  };

  // Hijri Date
  const hijriDate = useMemo(() => {
    return getHijriDate(selectedDate);
  }, [selectedDate]);

  // Sync prayer settings from Firestore
  useEffect(() => {
    if (!currentUser) return;
    const settingsDocRef = doc(db, 'prayerSettings', currentUser.uid);
    getDoc(settingsDocRef)
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.calculationMethod) {
            setCalcMethod(data.calculationMethod);
            localStorage.setItem('lifestyle_prayer_method', data.calculationMethod);
          }
          if (data.juristicMethod) {
            setJuristicMethod(data.juristicMethod);
            localStorage.setItem('lifestyle_prayer_juristic', data.juristicMethod);
          }
          if (typeof data.latitude === 'number') {
            setLatitude(data.latitude);
            localStorage.setItem('lifestyle_prayer_lat', String(data.latitude));
          }
          if (typeof data.longitude === 'number') {
            setLongitude(data.longitude);
            localStorage.setItem('lifestyle_prayer_lng', String(data.longitude));
          }
        }
      })
      .catch((err) => {
        console.warn('Could not read prayerSettings from Firestore:', err);
      });
  }, [currentUser]);

  // Real-time synchronization for prayer logs with Firestore
  useEffect(() => {
    if (!currentUser) return;

    const prayerLogsRef = collection(db, 'prayerLogs');
    const q = query(prayerLogsRef, where('userId', '==', currentUser.uid));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded: Record<string, DailyPrayerRecord> = {};
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as DailyPrayerRecord;
          if (data && data.date) {
            loaded[data.date] = data;
          }
        });

        // If snapshot comes back, sync user's actual saved records (empty if brand new user)
        setRecords(loaded);
        try {
          localStorage.setItem('lifestyle_prayer_records', JSON.stringify(loaded));
        } catch (e) {
          console.error(e);
        }
      },
      (err) => {
        console.warn('Real-time sync error with Firestore prayerLogs:', err);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Save changes to state, localStorage, and Firestore
  const saveDailyRecord = useCallback(
    async (updatedRecord: DailyPrayerRecord) => {
      setRecords((prev) => {
        const next = { ...prev, [updatedRecord.date]: updatedRecord };
        try {
          localStorage.setItem('lifestyle_prayer_records', JSON.stringify(next));
        } catch (e) {
          console.error(e);
        }
        return next;
      });

      const activeUser = currentUser || auth.currentUser;
      if (activeUser) {
        try {
          const docRef = doc(db, 'prayerLogs', `${activeUser.uid}_${updatedRecord.date}`);
          const payload = sanitizeForFirestore({
            ...updatedRecord,
            userId: activeUser.uid,
            updatedAt: new Date().toISOString(),
          });
          await setDoc(docRef, payload, { merge: true });
        } catch (err) {
          console.warn('Could not sync prayer log to Firestore:', err);
        }
      }
    },
    [currentUser]
  );

  // Quick toggle prayer status (not_prayed <-> prayed)
  const handleQuickTogglePrayer = (prayer: PrayerName) => {
    const currentStatus = currentRecord.prayers[prayer] || 'not_prayed';
    const nextStatus: PrayerStatus = currentStatus === 'not_prayed' ? 'prayed' : 'not_prayed';

    const updated: DailyPrayerRecord = {
      ...currentRecord,
      prayers: {
        ...currentRecord.prayers,
        [prayer]: nextStatus,
      },
    };
    saveDailyRecord(updated);
  };

  // Set specific status
  const handleSetPrayerStatus = (prayer: PrayerName, status: PrayerStatus) => {
    const updated: DailyPrayerRecord = {
      ...currentRecord,
      prayers: {
        ...currentRecord.prayers,
        [prayer]: status,
      },
    };
    saveDailyRecord(updated);
    setEditingPrayer(null);
  };

  // Toggle sunnah prayer
  const handleToggleSunnah = (sunnah: SunnahName) => {
    const currentVal = currentRecord.sunnah?.[sunnah] || false;
    const updated: DailyPrayerRecord = {
      ...currentRecord,
      sunnah: {
        ...(currentRecord.sunnah || {}),
        [sunnah]: !currentVal,
      },
    };
    saveDailyRecord(updated);
  };

  // Date navigation handlers
  const handleStepDate = (days: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + days);
    setSelectedDate(next);
  };

  const handleSetToday = () => {
    const now = new Date();
    setSelectedDate(now);
    setCalendarDate(now);
  };

  // Month navigation handlers for Calendar and Month Analytics
  const handleStepMonth = (months: number) => {
    const next = new Date(calendarDate);
    next.setMonth(next.getMonth() + months);
    setCalendarDate(next);
  };

  // Daily statistics for selectedDate
  const completedCount = useMemo(() => {
    const p = currentRecord.prayers;
    return PRAYER_KEYS.filter((k) => p[k] === 'prayed' || p[k] === 'jamaah' || p[k] === 'late').length;
  }, [currentRecord]);

  // Active or next prayer info
  const nextSlot = useMemo(() => {
    return prayerTimes.slots.find((s) => s.isNext);
  }, [prayerTimes]);

  // Monthly statistics for calendarDate
  const monthStats = useMemo(() => {
    return calculateMonthStats(records, calendarDate.getFullYear(), calendarDate.getMonth());
  }, [records, calendarDate]);

  // Tasbih click handler
  const handleTasbihTap = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15);
    }
    const activeTarget = DHIKR_PRESETS[selectedDhikrIndex].target;
    setTasbihCount((prev) => (prev + 1 > activeTarget ? 1 : prev + 1));
  };

  const handleTasbihReset = () => {
    setTasbihCount(0);
  };

  // Save settings
  const handleSaveSettings = (
    newMethod: CalculationMethodId,
    newJuristic: JuristicMethodId,
    newLat: number,
    newLng: number
  ) => {
    setCalcMethod(newMethod);
    setJuristicMethod(newJuristic);
    setLatitude(newLat);
    setLongitude(newLng);

    localStorage.setItem('lifestyle_prayer_method', newMethod);
    localStorage.setItem('lifestyle_prayer_juristic', newJuristic);
    localStorage.setItem('lifestyle_prayer_lat', String(newLat));
    localStorage.setItem('lifestyle_prayer_lng', String(newLng));
    setIsSettingsOpen(false);

    const activeUser = currentUser || auth.currentUser;
    if (activeUser) {
      const settingsDocRef = doc(db, 'prayerSettings', activeUser.uid);
      setDoc(
        settingsDocRef,
        sanitizeForFirestore({
          userId: activeUser.uid,
          calculationMethod: newMethod,
          juristicMethod: newJuristic,
          latitude: newLat,
          longitude: newLng,
          cityName: cityName,
          updatedAt: new Date().toISOString(),
        }),
        { merge: true }
      ).catch((err) => {
        console.warn('Could not sync prayer settings to Firestore:', err);
      });
    }
  };

  // Calendar matrix computation
  const calendarCells = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: {
      day: number;
      month: number;
      year: number;
      dateKey: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      completedCount: number;
      status: 'full' | 'partial' | 'none' | 'future';
    }[] = [];

    const now = new Date();
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Leading days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevM = month === 0 ? 11 : month - 1;
      const prevY = month === 0 ? year - 1 : year;
      const k = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const rec = records[k];
      const count = rec?.prayers
        ? PRAYER_KEYS.filter((p) => rec.prayers[p] === 'prayed' || rec.prayers[p] === 'jamaah' || rec.prayers[p] === 'late').length
        : 0;

      cells.push({
        day: d,
        month: prevM,
        year: prevY,
        dateKey: k,
        isCurrentMonth: false,
        isToday: k === todayKey,
        isSelected: k === dateKey,
        completedCount: count,
        status: count === 5 ? 'full' : count > 0 ? 'partial' : 'none',
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const k = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isFuture = new Date(year, month, d) > now;
      const rec = records[k];
      const count = rec?.prayers
        ? PRAYER_KEYS.filter((p) => rec.prayers[p] === 'prayed' || rec.prayers[p] === 'jamaah' || rec.prayers[p] === 'late').length
        : 0;

      let cellStatus: 'full' | 'partial' | 'none' | 'future' = 'none';
      if (isFuture) {
        cellStatus = 'future';
      } else if (count === 5) {
        cellStatus = 'full';
      } else if (count > 0) {
        cellStatus = 'partial';
      }

      cells.push({
        day: d,
        month,
        year,
        dateKey: k,
        isCurrentMonth: true,
        isToday: k === todayKey,
        isSelected: k === dateKey,
        completedCount: count,
        status: cellStatus,
      });
    }

    // Trailing days to round to multiple of 7
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextM = month === 11 ? 0 : month + 1;
      const nextY = month === 11 ? year + 1 : year;
      const k = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isFuture = new Date(nextY, nextM, d) > now;
      const rec = records[k];
      const count = rec?.prayers
        ? PRAYER_KEYS.filter((p) => rec.prayers[p] === 'prayed' || rec.prayers[p] === 'jamaah' || rec.prayers[p] === 'late').length
        : 0;

      cells.push({
        day: d,
        month: nextM,
        year: nextY,
        dateKey: k,
        isCurrentMonth: false,
        isToday: k === todayKey,
        isSelected: k === dateKey,
        completedCount: count,
        status: isFuture ? 'future' : count === 5 ? 'full' : count > 0 ? 'partial' : 'none',
      });
    }

    return cells;
  }, [calendarDate, records, dateKey]);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto pb-20 sm:pb-16">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between pt-1 sm:pt-2 gap-2">
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'instant' });
            onBack();
          }}
          className="inline-flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-3.5 py-2 bg-[#0c141d] rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all text-xs font-bold cursor-pointer min-h-[40px] shrink-0"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sm:hidden">Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-[#0c141d] rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all text-xs font-semibold cursor-pointer min-h-[40px] shrink-0"
          >
            <Sliders className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">Calculation Settings</span>
            <span className="sm:hidden">Settings</span>
          </button>
        </div>
      </div>

      {/* Hero Banner with Islamic Emerald Theme */}
      <div className="bg-gradient-to-br from-[#061e1a] via-[#0b2923] to-[#041613] rounded-2xl sm:rounded-3xl p-4 sm:p-7 md:p-8 relative overflow-hidden text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="inline-flex flex-wrap items-center gap-1.5 sm:gap-2 px-2.5 py-1 rounded-md bg-black/65 backdrop-blur-sm text-emerald-300 text-xs font-medium shadow-sm">
              <Moon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{hijriDate}</span>
              <span className="text-emerald-600">|</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate max-w-[130px] sm:max-w-none">{cityName || countryName}</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
              Prayer Tracker
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/70 max-w-xl">
              Daily prayer records, calendar overview, solar timings, and monthly performance analysis.
            </p>
          </div>

          {/* Quick Stat Pill */}
          <div className="bg-[#031512]/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 w-full md:w-auto md:min-w-[220px] flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between text-xs text-emerald-400/80 mb-1">
              <span className="font-semibold uppercase tracking-wider">This Month</span>
              <Award className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white">{monthStats.completionRate}%</div>
                <div className="text-xs text-emerald-300/80">
                  {monthStats.totalCompleted} of {monthStats.totalPrayersDue} completed
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1 justify-end">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{monthStats.currentStreak}d Streak</span>
                </div>
                <div className="text-2xs text-emerald-300/70">
                  {monthStats.perfectDaysCount} perfect days
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main View Mode Selector */}
      <div className="bg-[#0c141d] p-1 sm:p-1.5 rounded-2xl shadow-md">
        <div className="grid grid-cols-3 gap-1 w-full">
          <button
            onClick={() => setActiveTab('tracker')}
            className={`inline-flex items-center justify-center space-x-1.5 px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[42px] ${
              activeTab === 'tracker'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Daily Tracker</span>
            <span className="sm:hidden">Tracker</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`inline-flex items-center justify-center space-x-1.5 px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[42px] ${
              activeTab === 'calendar'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
            <span>Calendar</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`inline-flex items-center justify-center space-x-1.5 px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[42px] ${
              activeTab === 'analytics'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Stats & Analysis</span>
            <span className="sm:hidden">Stats</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: DAILY TRACKER */}
      {activeTab === 'tracker' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Date Navigation Bar */}
          <div className="bg-[#0c141d] rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button
                  onClick={() => handleStepDate(-1)}
                  className="p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
                  title="Previous Day"
                  aria-label="Previous Day"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSetToday}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer min-h-[38px]"
                >
                  Today
                </button>
                <button
                  onClick={() => handleStepDate(1)}
                  className="p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
                  title="Next Day"
                  aria-label="Next Day"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-right sm:text-left">
                <CalendarIcon className="w-4 h-4 text-emerald-400 shrink-0 hidden sm:block" />
                <span className="text-xs sm:text-sm font-bold text-slate-100">
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Progress Tracker Pill */}
            <div className="flex items-center justify-between sm:justify-start gap-3 bg-slate-900/90 px-3.5 py-2 rounded-xl w-full sm:w-auto">
              <span className="text-xs text-slate-400 font-medium">Daily Obligatory</span>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-emerald-400">
                  {completedCount} / 5
                </span>
                <div className="w-20 bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(completedCount / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid: 5 Daily Prayers + Side Panels (Qibla & Tasbih) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
            {/* Five Obligatory Prayers List */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between pb-1">
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300">
                  Obligatory Prayers (Fardh)
                </h2>
                <span className="text-2xs text-slate-400">Tap to toggle</span>
              </div>

              {(() => {
                const hasCurrentPrayer = prayerTimes.slots.some((s) => s.isCurrent);
                return prayerTimes.slots
                  .filter((slot) => slot.id !== 'sunrise')
                  .map((slot) => {
                    const prayerKey = slot.id as PrayerName;
                    const status: PrayerStatus = currentRecord.prayers[prayerKey] || 'not_prayed';
                    const isCompleted = status === 'prayed' || status === 'jamaah' || status === 'late';
                    const isCurrent = slot.isCurrent;
                    const isNext = !hasCurrentPrayer && slot.isNext;

                    let statusLabel = 'Not Prayed';
                    let badgeColor = 'bg-[#050910] text-slate-300 hover:bg-[#09111e] hover:text-white shadow-sm';

                    if (status === 'prayed') {
                      statusLabel = 'Individual';
                      badgeColor = 'bg-emerald-950/90 text-emerald-300 hover:bg-emerald-900';
                    } else if (status === 'jamaah') {
                      statusLabel = 'In Jamaah';
                      badgeColor = 'bg-teal-950/90 text-teal-300 hover:bg-teal-900';
                    } else if (status === 'late') {
                      statusLabel = 'Late (Qada)';
                      badgeColor = 'bg-amber-950/90 text-amber-300 hover:bg-amber-900';
                    } else if (status === 'excused') {
                      statusLabel = 'Excused';
                      badgeColor = 'bg-purple-950/90 text-purple-300 hover:bg-purple-900';
                    }

                    return (
                      <div
                        key={slot.id}
                        className={`rounded-2xl p-3.5 sm:p-5 transition-all duration-200 flex items-center justify-between gap-3 sm:gap-4 shadow-sm ${
                          isCompleted
                            ? 'bg-gradient-to-r from-[#08201a] to-[#0a1620]'
                            : isCurrent
                            ? 'bg-[#0d221e] ring-1 ring-emerald-500/40'
                            : isNext
                            ? 'bg-[#0c141d] ring-1 ring-sky-500/30'
                            : 'bg-[#0c141d] hover:bg-[#101a26]'
                        }`}
                      >
                        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                          <button
                            type="button"
                            onClick={() => setEditingPrayer(prayerKey)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95 ${
                              status === 'jamaah'
                                ? 'bg-teal-600 text-white shadow-[0_0_15px_rgba(13,148,136,0.4)]'
                                : status === 'late'
                                ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.4)]'
                                : status === 'prayed'
                                ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(5,150,105,0.4)]'
                                : status === 'excused'
                                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-emerald-400'
                            }`}
                            aria-label={`Select status for ${slot.name}`}
                            title={`Select status for ${slot.name}`}
                          >
                            {isCompleted ? (
                              <Check className="w-5 h-5 stroke-[2.5]" />
                            ) : (
                              <Circle className="w-5 h-5 stroke-[1.5]" />
                            )}
                          </button>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                              <span className="text-sm sm:text-lg font-bold text-slate-100">
                                {slot.name}
                              </span>
                              <span className="text-xs sm:text-sm text-slate-400 font-arabic">
                                {slot.arabicName}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400">
                                  Current
                                </span>
                              )}
                              {isNext && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-sky-950 text-sky-400">
                                  Next
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-mono text-slate-400 mt-0.5">
                              {slot.timeStr}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={() => setEditingPrayer(prayerKey)}
                            className={`text-2xs sm:text-xs font-medium px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors cursor-pointer min-h-[36px] flex items-center whitespace-nowrap ${badgeColor}`}
                          >
                            {statusLabel}
                          </button>
                        </div>
                      </div>
                    );
                  });
              })()}

              {/* Sunrise card */}
              {prayerTimes.slots.find((s) => s.id === 'sunrise') && (
                <div className="bg-[#0c141d] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-300">Sunrise</span>
                    <span>(Shuruq)</span>
                  </div>
                  <span className="font-mono text-slate-300">
                    {prayerTimes.slots.find((s) => s.id === 'sunrise')?.timeStr}
                  </span>
                </div>
              )}

              {/* Sunnah / Voluntary Section */}
              <div className="pt-3 sm:pt-4 space-y-2.5 sm:space-y-3">
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300">
                  Sunnah & Voluntary Prayers
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                  {[
                    { id: 'tahajjud', name: 'Tahajjud', sub: 'Night Prayer' },
                    { id: 'duha', name: 'Duha', sub: 'Forenoon' },
                    { id: 'rawatib', name: 'Rawatib', sub: 'Sunnah Muakkadah' },
                    { id: 'witr', name: 'Witr', sub: 'Night Conclusion' },
                  ].map((item) => {
                    const sKey = item.id as SunnahName;
                    const isChecked = currentRecord.sunnah?.[sKey] || false;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleToggleSunnah(sKey)}
                        className={`p-2.5 sm:p-3 rounded-xl text-left transition-all cursor-pointer min-h-[60px] ${
                          isChecked
                            ? 'bg-emerald-950/70 text-white shadow-sm'
                            : 'bg-[#0c141d] text-slate-400 hover:bg-[#101a26]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-200">{item.name}</span>
                          {isChecked ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                          )}
                        </div>
                        <div className="text-2xs text-slate-500">{item.sub}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Sidebar: Qibla & Tasbih */}
            <div className="space-y-4 sm:space-y-6">
              {/* Qibla Direction Button */}
              <button
                type="button"
                onClick={handleOpenQiblaModal}
                className="w-full bg-[#0c141d] hover:bg-[#111c29] border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 sm:p-5 text-white shadow-md transition-all cursor-pointer text-left group flex items-center justify-between gap-3 active:scale-[0.99]"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-200 group-hover:text-emerald-300 transition-colors">
                      Qibla Direction
                    </div>
                    <div className="text-xs font-semibold text-emerald-400 mt-0.5">
                      Towards Mecca
                    </div>
                  </div>
                </div>

                <div className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-slate-950 group-hover:bg-emerald-400 transition-all flex items-center gap-1.5 shrink-0 shadow-sm">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Compass</span>
                </div>
              </button>

              {/* Digital Tasbih (Dhikr Companion) */}
              <div className="bg-[#0c141d] rounded-2xl p-4 sm:p-5 text-white space-y-4 shadow-md">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Digital Tasbih
                  </h3>
                  <button
                    onClick={handleTasbihReset}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                    title="Reset counter"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {DHIKR_PRESETS.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedDhikrIndex(idx);
                        setTasbihCount(0);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-2xs font-medium transition-colors cursor-pointer min-h-[30px] ${
                        selectedDhikrIndex === idx
                          ? 'bg-emerald-900/90 text-emerald-200'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {item.text} ({item.target})
                    </button>
                  ))}
                </div>

                <div className="flex flex-col items-center justify-center pt-2">
                  <button
                    onClick={handleTasbihTap}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-b from-[#0e2722] to-[#061814] flex flex-col items-center justify-center active:scale-95 transition-all shadow-[0_0_25px_rgba(5,150,105,0.25)] ring-2 ring-emerald-500/30 hover:ring-emerald-400/50 cursor-pointer group"
                    aria-label="Tap to count Dhikr"
                  >
                    <span className="text-3xl font-black text-white font-mono group-hover:scale-105 transition-transform">
                      {tasbihCount}
                    </span>
                    <span className="text-2xs text-emerald-400 font-semibold mt-1">
                      of {DHIKR_PRESETS[selectedDhikrIndex].target}
                    </span>
                  </button>
                  <div className="text-2xs text-slate-500 mt-2">Tap circle to count</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: CALENDAR MATRIX */}
      {activeTab === 'calendar' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Calendar Header with Month Navigation */}
          <div className="bg-[#0c141d] rounded-2xl p-3 sm:p-5 flex items-center justify-between gap-2 shadow-md">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => handleStepMonth(-1)}
                className="p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
                title="Previous Month"
                aria-label="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCalendarDate(new Date())}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer min-h-[38px]"
              >
                <span className="hidden sm:inline">Current Month</span>
                <span className="sm:hidden">Current</span>
              </button>
              <button
                onClick={() => handleStepMonth(1)}
                className="p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
                title="Next Month"
                aria-label="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center">
              <h2 className="text-xs sm:text-base md:text-lg font-bold text-white whitespace-nowrap">
                {calendarDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </h2>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 text-xs text-slate-400 font-medium shrink-0">
              <span className="text-emerald-400 font-bold">{monthStats.completionRate}%</span>
              <span className="hidden sm:inline">completed</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-[#0c141d] rounded-2xl p-2.5 sm:p-6 shadow-md">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName) => (
                <div key={dayName} className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 py-1">
                  {dayName}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {calendarCells.map((cell) => {
                let badgeClass = 'text-slate-500 bg-slate-900/60';

                if (cell.status === 'full') {
                  badgeClass = 'bg-emerald-950/80 text-emerald-200';
                } else if (cell.status === 'partial') {
                  badgeClass = 'bg-teal-950/70 text-teal-300';
                } else if (cell.status === 'future') {
                  badgeClass = 'opacity-30 bg-transparent';
                }

                return (
                  <button
                    key={cell.dateKey}
                    onClick={() => {
                      const d = new Date(cell.year, cell.month, cell.day);
                      setSelectedDate(d);
                    }}
                    className={`min-h-[54px] sm:min-h-[82px] p-1 sm:p-2.5 rounded-lg sm:rounded-xl flex flex-col justify-between transition-all cursor-pointer text-left relative ${
                      cell.isSelected
                        ? 'ring-2 ring-emerald-400 bg-emerald-950/40 shadow-lg'
                        : cell.isCurrentMonth
                        ? 'bg-[#080d14] hover:bg-[#101a26]'
                        : 'opacity-30 bg-slate-950/40'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-[11px] sm:text-sm font-bold ${
                          cell.isToday
                            ? 'text-emerald-400 underline underline-offset-2'
                            : cell.isCurrentMonth
                            ? 'text-slate-200'
                            : 'text-slate-500'
                        }`}
                      >
                        {cell.day}
                      </span>
                      {cell.isToday && (
                        <>
                          <span className="hidden sm:inline-block text-[9px] uppercase font-bold text-emerald-400 bg-emerald-950/80 px-1 rounded">
                            Today
                          </span>
                          <span className="sm:hidden w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        </>
                      )}
                    </div>

                    <div className="mt-0.5 sm:mt-1">
                      {cell.status !== 'future' ? (
                        <div className={`px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold inline-block ${badgeClass}`}>
                          {cell.completedCount}/5
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-600">-</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day Inspector Card for Selected Date */}
          <div className="bg-[#0c141d] rounded-2xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-2xs font-semibold uppercase tracking-wider text-slate-400">
                Selected Day Overview
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h3>
              <div className="text-xs text-emerald-400 font-medium">
                {completedCount} of 5 obligatory prayers completed
              </div>
            </div>

            <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('tracker')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer text-center min-h-[40px] flex items-center justify-center"
              >
                Log in Daily Tracker
              </button>
              <button
                onClick={() => {
                  setActiveTab('analytics');
                  setAnalyticsScope('day');
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer text-center min-h-[40px] flex items-center justify-center"
              >
                View Day Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: STATS & ANALYSIS */}
      {activeTab === 'analytics' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Scope Selector: Month Analysis vs Day Analysis */}
          <div className="bg-[#0c141d] p-2 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 w-full sm:w-auto">
              <button
                onClick={() => setAnalyticsScope('month')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center min-h-[38px] ${
                  analyticsScope === 'month'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                Month Analysis
              </button>
              <button
                onClick={() => setAnalyticsScope('day')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center min-h-[38px] ${
                  analyticsScope === 'day'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                Day Analysis
              </button>
            </div>

            {analyticsScope === 'month' ? (
              <div className="flex items-center justify-between sm:justify-end space-x-1.5 w-full sm:w-auto">
                <button
                  onClick={() => handleStepMonth(-1)}
                  className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                  title="Previous Month"
                  aria-label="Previous Month"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold text-slate-200 px-2">
                  {calendarDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
                <button
                  onClick={() => handleStepMonth(1)}
                  className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                  title="Next Month"
                  aria-label="Next Month"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between sm:justify-end space-x-1.5 w-full sm:w-auto">
                <button
                  onClick={() => handleStepDate(-1)}
                  className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                  title="Previous Day"
                  aria-label="Previous Day"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold text-slate-200 px-2">
                  {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <button
                  onClick={() => handleStepDate(1)}
                  className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                  title="Next Day"
                  aria-label="Next Day"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* MONTH ANALYSIS CONTENT */}
          {analyticsScope === 'month' && (
            <div className="space-y-4 sm:space-y-6">
              {/* 4 Metric Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                <div className="bg-[#0c141d] rounded-2xl p-3.5 sm:p-5">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-slate-400">
                    Monthly Completion
                  </span>
                  <div className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-400 mt-1">
                    {monthStats.completionRate}%
                  </div>
                  <div className="text-2xs text-slate-400 mt-1">
                    {monthStats.totalCompleted} of {monthStats.totalPrayersDue} prayers
                  </div>
                </div>

                <div className="bg-[#0c141d] rounded-2xl p-3.5 sm:p-5">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-slate-400">
                    In Jamaah
                  </span>
                  <div className="text-xl sm:text-2xl md:text-3xl font-black text-teal-400 mt-1">
                    {monthStats.jamaahRate}%
                  </div>
                  <div className="text-2xs text-slate-400 mt-1">
                    {monthStats.jamaahCount} prayers in jamaah
                  </div>
                </div>

                <div className="bg-[#0c141d] rounded-2xl p-3.5 sm:p-5">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-slate-400">
                    Current Streak
                  </span>
                  <div className="text-xl sm:text-2xl md:text-3xl font-black text-amber-400 mt-1">
                    {monthStats.currentStreak} Days
                  </div>
                  <div className="text-2xs text-slate-400 mt-1">
                    Longest: {monthStats.longestStreak} days
                  </div>
                </div>

                <div className="bg-[#0c141d] rounded-2xl p-3.5 sm:p-5">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-slate-400">
                    Perfect Days
                  </span>
                  <div className="text-xl sm:text-2xl md:text-3xl font-black text-white mt-1">
                    {monthStats.perfectDaysCount}
                  </div>
                  <div className="text-2xs text-slate-400 mt-1">
                    All 5 prayers completed
                  </div>
                </div>
              </div>

              {/* Individual Prayer Consistency Breakdown */}
              <div className="bg-[#0c141d] rounded-2xl p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200">
                    Prayer Consistency Breakdown
                  </h3>
                  <span className="text-2xs text-slate-400">Monthly breakdown</span>
                </div>

                <div className="space-y-3.5">
                  {PRAYER_KEYS.map((key) => {
                    const meta = PRAYER_METADATA[key];
                    const stat = monthStats.prayerBreakdown[key];
                    const prayerDisplayName = key === 'dhuhr' ? 'Dhuhr / Jummah' : meta.name;
                    const prayerArabicName = key === 'dhuhr' ? 'الظهر / الجمعة' : meta.arabicName;

                    return (
                      <div key={key} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-200">{prayerDisplayName}</span>
                            <span className="text-slate-500 font-arabic">{prayerArabicName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 text-2xs">
                              {stat.completed} / {stat.total} days
                            </span>
                            <span className="font-bold text-emerald-400 font-mono">
                              {stat.percentage}%
                            </span>
                          </div>
                        </div>

                        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-emerald-600 to-teal-400 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${stat.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Weekly Performance Overview */}
              <div className="bg-[#0c141d] rounded-2xl p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200">
                    Weekly Progress
                  </h3>
                  <span className="text-2xs text-slate-400">Performance by week</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {monthStats.weeklyBreakdown.map((w) => (
                    <div key={w.weekNumber} className="bg-slate-900/60 p-3.5 rounded-xl">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-bold text-slate-300">Week {w.weekNumber}</span>
                        <span className="font-mono font-bold text-emerald-400">{w.percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mb-2">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full"
                          style={{ width: `${w.percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-2xs text-slate-400">
                        {w.completed} of {w.total} prayers completed
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* DAY ANALYSIS CONTENT */}
          {analyticsScope === 'day' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Day Score Header */}
              <div className="bg-[#0c141d] rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-2xs font-semibold uppercase tracking-wider text-slate-400">
                    Daily Analysis
                  </span>
                  <h2 className="text-base sm:text-xl font-bold text-white mt-0.5">
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </h2>
                  <div className="text-xs text-emerald-300 mt-1">{hijriDate}</div>
                </div>

                <div className="flex items-center justify-between sm:justify-start gap-4 bg-slate-900/80 px-4 py-3 rounded-xl w-full sm:w-auto">
                  <div>
                    <div className="text-2xs text-slate-400 uppercase font-semibold">Obligatory Score</div>
                    <div className="text-lg sm:text-xl font-black text-emerald-400">
                      {completedCount} / 5 <span className="text-xs text-slate-400 font-normal">({Math.round((completedCount / 5) * 100)}%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown for the 5 Prayers on this date */}
              <div className="space-y-2.5 sm:space-y-3">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300">
                  Prayer Status Breakdown
                </h3>

                {prayerTimes.slots
                  .filter((s) => s.id !== 'sunrise')
                  .map((slot) => {
                    const pKey = slot.id as PrayerName;
                    const st = currentRecord.prayers[pKey] || 'not_prayed';

                    let stText = 'Not Prayed';
                    let stStyle = 'bg-[#050910] text-slate-300 shadow-sm';

                    if (st === 'prayed') {
                      stText = 'Completed';
                      stStyle = 'bg-emerald-950/90 text-emerald-300';
                    } else if (st === 'jamaah') {
                      stText = 'In Jamaah';
                      stStyle = 'bg-teal-950/90 text-teal-300';
                    } else if (st === 'late') {
                      stText = 'Late (Qada)';
                      stStyle = 'bg-amber-950/90 text-amber-300';
                    } else if (st === 'excused') {
                      stText = 'Excused';
                      stStyle = 'bg-purple-950/90 text-purple-300';
                    }

                    return (
                      <div
                        key={slot.id}
                        className="bg-[#0c141d] p-3.5 sm:p-4 rounded-xl flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-white">{slot.name}</span>
                            <span className="text-xs text-slate-400 font-arabic">{slot.arabicName}</span>
                          </div>
                          <div className="text-2xs text-slate-400 font-mono mt-0.5">
                            Scheduled: {slot.timeStr}
                          </div>
                        </div>

                        <span className={`px-2.5 sm:px-3 py-1 rounded-lg text-2xs sm:text-xs font-medium shrink-0 whitespace-nowrap ${stStyle}`}>
                          {stText}
                        </span>
                      </div>
                    );
                  })}
              </div>

              {/* Sunnah Record for this day */}
              <div className="bg-[#0c141d] rounded-2xl p-4 sm:p-5 space-y-3">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300">
                  Voluntary & Sunnah Prayers
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                  {[
                    { id: 'tahajjud', name: 'Tahajjud' },
                    { id: 'duha', name: 'Duha' },
                    { id: 'rawatib', name: 'Rawatib' },
                    { id: 'witr', name: 'Witr' },
                  ].map((sItem) => {
                    const done = currentRecord.sunnah?.[sItem.id as SunnahName] || false;
                    return (
                      <div
                        key={sItem.id}
                        className={`p-2.5 sm:p-3 rounded-xl flex items-center justify-between ${
                          done
                            ? 'bg-emerald-950/70 text-emerald-200'
                            : 'bg-slate-900 text-slate-500'
                        }`}
                      >
                        <span className="text-xs font-semibold">{sItem.name}</span>
                        {done ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status Selection Modal */}
      {editingPrayer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0e1622] rounded-2xl max-w-sm w-full p-4 sm:p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  Update {selectedDate.getDay() === 5 && editingPrayer === 'dhuhr' ? 'Jummah' : PRAYER_METADATA[editingPrayer].name}
                </h3>
                <p className="text-xs text-slate-400">Select status</p>
              </div>
              <button
                onClick={() => setEditingPrayer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {[
                { id: 'jamaah', label: 'In Jamaah', desc: 'Congregation with group or mosque' },
                { id: 'prayed', label: 'Individual', desc: 'Prayed on time individually' },
                { id: 'late', label: 'Qada (Late)', desc: 'Prayed after prayer time' },
                { id: 'not_prayed', label: 'Not Prayed', desc: 'Pending or missed' },
                { id: 'excused', label: 'Excused', desc: 'Valid exemption' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSetPrayerStatus(editingPrayer, opt.id as PrayerStatus)}
                  className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer min-h-[44px] ${
                    currentRecord.prayers[editingPrayer] === opt.id
                      ? 'bg-emerald-950/90 text-white shadow-sm ring-1 ring-emerald-500/50'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold">{opt.label}</div>
                  <div className="text-2xs text-slate-400">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Calculation Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0e1622] rounded-2xl max-w-md w-full p-4 sm:p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">Prayer Calculation Settings</h3>
                <p className="text-xs text-slate-400">Configure methods and geographic coordinates</p>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Calculation Method
                </label>
                <select
                  value={calcMethod}
                  onChange={(e) => setCalcMethod(e.target.value as CalculationMethodId)}
                  className="w-full bg-slate-900 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer min-h-[42px]"
                >
                  {Object.values(CALCULATION_METHODS).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Asr Juristic Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setJuristicMethod('STANDARD')}
                    className={`py-2.5 px-3 rounded-xl text-center transition-colors cursor-pointer min-h-[42px] ${
                      juristicMethod === 'STANDARD'
                        ? 'bg-emerald-950 text-emerald-300 font-bold ring-1 ring-emerald-500/50'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Standard (Shafii / Maliki)
                  </button>
                  <button
                    type="button"
                    onClick={() => setJuristicMethod('HANAFI')}
                    className={`py-2.5 px-3 rounded-xl text-center transition-colors cursor-pointer min-h-[42px] ${
                      juristicMethod === 'HANAFI'
                        ? 'bg-emerald-950 text-emerald-300 font-bold ring-1 ring-emerald-500/50'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Hanafi
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[42px]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[42px]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer min-h-[40px]"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleSaveSettings(calcMethod, juristicMethod, latitude, longitude)
                }
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 cursor-pointer min-h-[40px]"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Qibla Direction Live Compass Modal */}
      {isQiblaModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseQiblaModal();
            }
          }}
        >
          <div className="bg-[#0c141d] border border-slate-800 rounded-3xl max-w-sm w-full p-5 sm:p-6 space-y-4 shadow-2xl relative">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Compass className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
                  Qibla Direction
                </h3>
              </div>
              <button
                onClick={handleCloseQiblaModal}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Readout */}
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-slate-400 font-medium">Qibla</span>
              <span className="font-bold text-emerald-400">
                Towards Mecca
              </span>
            </div>

            {/* Compass Dial */}
            {(() => {
              const isHeadingValid = isCompassActive && deviceHeading !== null;
              const diffAngle = isHeadingValid
                ? ((qibla.bearing - deviceHeading + 540) % 360) - 180
                : 0;
              const isFacingKaaba = isHeadingValid && Math.abs(diffAngle) <= 5;
              const needleRotation = isHeadingValid ? diffAngle : 0;

              return (
                <div className="space-y-4">
                  <div
                    className={`relative w-56 h-56 sm:w-60 sm:h-60 mx-auto flex items-center justify-center select-none rounded-full transition-all duration-300 ${
                      isFacingKaaba ? 'ring-4 ring-emerald-400/80 shadow-[0_0_35px_rgba(16,185,129,0.4)]' : ''
                    }`}
                  >
                    {/* Fixed Outer Degree Track & Precision Dial */}
                    <div className="w-56 h-56 sm:w-60 sm:h-60 rounded-full bg-[#060a10] border-2 border-slate-800 flex items-center justify-center relative shadow-inner overflow-hidden">
                      {/* Dial Markings */}
                      <svg viewBox="0 0 200 200" className="w-full h-full absolute inset-0 pointer-events-none">
                        <circle cx="100" cy="100" r="92" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="2 6" />
                        <circle cx="100" cy="100" r="80" fill="none" stroke="#1e293b" strokeWidth="0.75" />
                        <circle cx="100" cy="100" r="48" fill="none" stroke="#0f172a" strokeWidth="0.75" />
                        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                          <line
                            key={deg}
                            x1="100"
                            y1="8"
                            x2="100"
                            y2={deg === 0 ? "20" : deg % 90 === 0 ? "17" : "14"}
                            stroke={deg === 0 ? "#10b981" : deg % 90 === 0 ? "#475569" : "#1e293b"}
                            strokeWidth={deg === 0 ? "2.5" : deg % 90 === 0 ? "1.5" : "1"}
                            transform={`rotate(${deg} 100 100)`}
                          />
                        ))}
                      </svg>

                      {/* Cardinal Indicators */}
                      <span className="absolute bottom-2.5 text-2xs font-bold text-slate-500">S</span>
                      <span className="absolute left-3 text-2xs font-bold text-slate-500">W</span>
                      <span className="absolute right-3 text-2xs font-bold text-slate-500">E</span>
                    </div>

                    {/* Mecca Direction Marker at Top Center */}
                    <div className="absolute top-2 z-20 flex flex-col items-center pointer-events-none">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg ${
                          isFacingKaaba
                            ? 'bg-[#091512] border-2 border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.8)] scale-110'
                            : 'bg-[#0a121e] border border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                        }`}
                      >
                        {/* Kaaba Icon */}
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
                          <rect
                            x="3"
                            y="3"
                            width="18"
                            height="18"
                            rx="2.5"
                            fill="#070a10"
                            stroke={isFacingKaaba ? '#34d399' : '#10b981'}
                            strokeWidth="1.25"
                          />
                          <path d="M3 8.5H21" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
                          <path d="M4 8.5H20" stroke="#fef08a" strokeWidth="1" strokeDasharray="1.5 1.5" />
                          <rect x="6.5" y="11.5" width="4" height="6.5" rx="0.5" fill="#f59e0b" stroke="#d97706" strokeWidth="0.5" />
                          <line x1="14" y1="12" x2="19" y2="12" stroke="#1e293b" strokeWidth="0.75" />
                          <line x1="14" y1="15" x2="19" y2="15" stroke="#1e293b" strokeWidth="0.75" />
                        </svg>
                      </div>

                      <span
                        className={`text-[8px] font-bold tracking-wider uppercase mt-1 px-1.5 py-0.5 rounded shadow-sm border transition-colors ${
                          isFacingKaaba
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/80 font-extrabold'
                            : 'bg-slate-900/90 text-slate-300 border-slate-700 font-semibold'
                        }`}
                      >
                        Mecca
                      </span>

                      {/* Direction pointer tick towards center */}
                      <div
                        className={`w-0.5 h-2 rounded-full mt-0.5 transition-all ${
                          isFacingKaaba
                            ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]'
                            : 'bg-emerald-500/80'
                        }`}
                      ></div>
                    </div>

                    {/* Precision Compass Needle */}
                    <div
                      className="w-full h-full absolute inset-0 pointer-events-none transition-transform duration-200 ease-out z-10"
                      style={{ transform: `rotate(${needleRotation}deg)` }}
                    >
                      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)]">
                        {/* Forward Tip (pointing towards Mecca) */}
                        <polygon
                          points="100,42 93,100 100,100"
                          fill={isFacingKaaba ? '#34d399' : '#f43f5e'}
                        />
                        <polygon
                          points="100,42 107,100 100,100"
                          fill={isFacingKaaba ? '#059669' : '#e11d48'}
                        />
                        <line
                          x1="100"
                          y1="42"
                          x2="100"
                          y2="100"
                          stroke={isFacingKaaba ? '#a7f3d0' : '#fda4af'}
                          strokeWidth="0.75"
                        />

                        {/* South Counterweight */}
                        <polygon
                          points="100,154 94,100 100,100"
                          fill="#64748b"
                        />
                        <polygon
                          points="100,154 106,100 100,100"
                          fill="#475569"
                        />
                        <line
                          x1="100"
                          y1="100"
                          x2="100"
                          y2="154"
                          stroke="#94a3b8"
                          strokeWidth="0.75"
                        />

                        {/* Central Pivot Hub */}
                        <circle cx="100" cy="100" r="11" fill="#0b111a" stroke="#475569" strokeWidth="2" />
                        <circle cx="100" cy="100" r="6" fill="#1e293b" />
                        <circle cx="100" cy="100" r="3" fill={isFacingKaaba ? '#34d399' : '#f43f5e'} />
                        <circle cx="99" cy="99" r="1" fill="#ffffff" />
                      </svg>
                    </div>
                  </div>

                  {/* Status & Guidance Readout */}
                  <div className="text-center space-y-1">
                    {isHeadingValid ? (
                      <div className="space-y-0.5">
                        {isFacingKaaba ? (
                          <div className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5 py-1">
                            <Check className="w-4 h-4" />
                            <span>Facing Mecca</span>
                          </div>
                        ) : (
                          <div className="text-xs font-semibold text-sky-400 py-1">
                            {diffAngle !== null && diffAngle > 0
                              ? 'Turn Right'
                              : 'Turn Left'}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <div className="text-xs text-slate-300 font-medium">
                          Point towards the Mecca marker
                        </div>
                        <div className="text-2xs text-slate-500">
                          Hold phone flat to align
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Sensor Notice or Error */}
            {compassError && (
              <div className="text-2xs text-rose-300 bg-rose-950/40 border border-rose-800/40 rounded-xl p-2.5 text-center flex items-center justify-between gap-2">
                <span>{compassError}</span>
                <button
                  type="button"
                  onClick={startLiveCompass}
                  className="px-2 py-1 bg-rose-900/60 hover:bg-rose-900 text-rose-100 rounded-lg text-2xs font-semibold shrink-0 cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Close Button */}
            <div className="pt-2 flex items-center justify-end border-t border-slate-800/80">
              <button
                type="button"
                onClick={handleCloseQiblaModal}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer transition-colors text-center"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
