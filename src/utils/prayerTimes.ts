import {
  PrayerName,
  PrayerStatus,
  CalculationMethodId,
  JuristicMethodId,
  PrayerTimeSlot,
} from '../types';

export interface CalculationMethodParams {
  id: CalculationMethodId;
  name: string;
  fajrAngle: number;
  ishaAngle: number;
  isIshaInterval?: boolean;
  ishaIntervalMinutes?: number;
}

export const CALCULATION_METHODS: Record<CalculationMethodId, CalculationMethodParams> = {
  MWL: {
    id: 'MWL',
    name: 'Muslim World League',
    fajrAngle: 18.0,
    ishaAngle: 17.0,
  },
  ISNA: {
    id: 'ISNA',
    name: 'Islamic Society of North America',
    fajrAngle: 15.0,
    ishaAngle: 15.0,
  },
  MAKKAH: {
    id: 'MAKKAH',
    name: 'Umm Al-Qura University, Makkah',
    fajrAngle: 18.5,
    ishaAngle: 0,
    isIshaInterval: true,
    ishaIntervalMinutes: 90,
  },
  KARACHI: {
    id: 'KARACHI',
    name: 'University of Islamic Sciences, Karachi',
    fajrAngle: 18.0,
    ishaAngle: 18.0,
  },
  EGYPT: {
    id: 'EGYPT',
    name: 'Egyptian General Authority of Survey',
    fajrAngle: 19.5,
    ishaAngle: 17.5,
  },
  DUBAI: {
    id: 'DUBAI',
    name: 'Dubai / UAE Authority',
    fajrAngle: 18.2,
    ishaAngle: 18.2,
  },
};

export const PRAYER_METADATA: Record<PrayerName | 'sunrise', { name: string; arabicName: string }> = {
  fajr: { name: 'Fajr', arabicName: 'الفجر' },
  sunrise: { name: 'Sunrise', arabicName: 'الشروق' },
  dhuhr: { name: 'Dhuhr', arabicName: 'الظهر' },
  asr: { name: 'Asr', arabicName: 'العصر' },
  maghrib: { name: 'Maghrib', arabicName: 'المغرب' },
  isha: { name: 'Isha', arabicName: 'العشاء' },
};

export const DEFAULT_PRAYERS_STATE: Record<PrayerName, PrayerStatus> = {
  fajr: 'not_prayed',
  dhuhr: 'not_prayed',
  asr: 'not_prayed',
  maghrib: 'not_prayed',
  isha: 'not_prayed',
};

// Calculate astronomical prayer times
export function calculatePrayerTimes(
  date: Date,
  lat: number,
  lng: number,
  methodId: CalculationMethodId = 'MWL',
  juristicId: JuristicMethodId = 'STANDARD'
): { slots: PrayerTimeSlot[]; rawMinutes: Record<string, number> } {
  const method = CALCULATION_METHODS[methodId] || CALCULATION_METHODS.MWL;
  const asrRatio = juristicId === 'HANAFI' ? 2 : 1;

  const tz = -date.getTimezoneOffset() / 60;
  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;

  // Day of year
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Fractional year
  const gamma = (2 * Math.PI / 365) * (dayOfYear - 1 + (12 - tz) / 24);

  // Equation of time in minutes
  const eqtime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));

  // Solar declination in radians
  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  // Solar noon in minutes from midnight local time
  const solarNoon = 720 - 4 * lng - eqtime + tz * 60;

  function hourAngleForSunAngle(angleDeg: number): number | null {
    const cosHA =
      (Math.cos((90 + angleDeg) * rad) - Math.sin(lat * rad) * Math.sin(decl)) /
      (Math.cos(lat * rad) * Math.cos(decl));
    if (cosHA > 1 || cosHA < -1) return null;
    return Math.acos(cosHA) * deg * 4;
  }

  function hourAngleForAsr(ratio: number): number | null {
    const d = Math.abs(lat * rad - decl);
    const alt = Math.atan(1 / (ratio + Math.tan(d)));
    const cosHA =
      (Math.sin(alt) - Math.sin(lat * rad) * Math.sin(decl)) /
      (Math.cos(lat * rad) * Math.cos(decl));
    if (cosHA > 1 || cosHA < -1) return null;
    return Math.acos(cosHA) * deg * 4;
  }

  const fajrHA = hourAngleForSunAngle(method.fajrAngle) ?? 105;
  const sunriseHA = hourAngleForSunAngle(0.8333) ?? 90;
  const asrHA = hourAngleForAsr(asrRatio) ?? 45;
  const sunsetHA = sunriseHA;

  let ishaMin: number;
  if (method.isIshaInterval && method.ishaIntervalMinutes) {
    ishaMin = solarNoon + sunsetHA + method.ishaIntervalMinutes;
  } else {
    const ishaHA = hourAngleForSunAngle(method.ishaAngle) ?? 105;
    ishaMin = solarNoon + ishaHA;
  }

  const rawMinutes: Record<PrayerName | 'sunrise', number> = {
    fajr: normalizeMinutes(solarNoon - fajrHA),
    sunrise: normalizeMinutes(solarNoon - sunriseHA),
    dhuhr: normalizeMinutes(solarNoon),
    asr: normalizeMinutes(solarNoon + asrHA),
    maghrib: normalizeMinutes(solarNoon + sunsetHA),
    isha: normalizeMinutes(ishaMin),
  };

  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const currentMinutes = isToday ? now.getHours() * 60 + now.getMinutes() : -1;

  const order: (PrayerName | 'sunrise')[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

  let nextPrayerId: PrayerName | null = null;
  let activePrayerId: PrayerName | null = null;

  if (isToday) {
    if (currentMinutes < rawMinutes.fajr) {
      // 12:00 AM midnight to Fajr: Isha ended at midnight, Fajr has not started yet
      activePrayerId = null;
      nextPrayerId = 'fajr';
    } else if (currentMinutes < rawMinutes.sunrise) {
      // Fajr waqt: from Fajr until Sunrise
      activePrayerId = 'fajr';
      nextPrayerId = 'dhuhr';
    } else if (currentMinutes < rawMinutes.dhuhr) {
      // Sunrise to Dhuhr: Fajr waqt ended at sunrise, Dhuhr has not started yet
      activePrayerId = null;
      nextPrayerId = 'dhuhr';
    } else if (currentMinutes < rawMinutes.asr) {
      // Dhuhr waqt: from Dhuhr until Asr
      activePrayerId = 'dhuhr';
      nextPrayerId = 'asr';
    } else if (currentMinutes < rawMinutes.maghrib) {
      // Asr waqt: from Asr until Maghrib
      activePrayerId = 'asr';
      nextPrayerId = 'maghrib';
    } else if (currentMinutes < rawMinutes.isha) {
      // Maghrib waqt: from Maghrib until Isha
      activePrayerId = 'maghrib';
      nextPrayerId = 'isha';
    } else {
      // Isha waqt: from Isha until 12:00 AM midnight
      activePrayerId = 'isha';
      nextPrayerId = 'fajr';
    }
  }

  const isFriday = date.getDay() === 5;

  const slots: PrayerTimeSlot[] = order.map((id) => {
    const mins = rawMinutes[id];
    const isSunrise = id === 'sunrise';
    const isJummah = isFriday && id === 'dhuhr';

    return {
      id,
      name: isJummah ? 'Jummah' : PRAYER_METADATA[id].name,
      arabicName: isJummah ? 'الجمعة' : PRAYER_METADATA[id].arabicName,
      timeStr: formatMinutesTo12Hour(mins),
      minutesFromMidnight: mins,
      isPassed: isToday ? mins < currentMinutes : false,
      isCurrent: isToday && !isSunrise && activePrayerId === id,
      isNext: isToday && !isSunrise && nextPrayerId === id,
    };
  });

  return { slots, rawMinutes };
}

function normalizeMinutes(mins: number): number {
  let m = Math.round(mins);
  while (m < 0) m += 1440;
  while (m >= 1440) m -= 1440;
  return m;
}

export function formatMinutesTo12Hour(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
}

// Calculate Qibla bearing from user coordinates to Makkah (Kaaba)
export function getQiblaBearing(lat: number, lng: number): { bearing: number; cardinal: string } {
  const makkahLat = 21.422487;
  const makkahLng = 39.826206;

  const rad = Math.PI / 180;
  const phi1 = lat * rad;
  const phi2 = makkahLat * rad;
  const deltaLambda = (makkahLng - lng) * rad;

  const y = Math.sin(deltaLambda);
  const x =
    Math.cos(phi1) * Math.tan(phi2) -
    Math.sin(phi1) * Math.cos(deltaLambda);

  let bearing = Math.atan2(y, x) * (180 / Math.PI);
  bearing = (bearing + 360) % 360;

  const cardinals = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(bearing / 22.5) % 16;

  return {
    bearing: Math.round(bearing),
    cardinal: cardinals[index],
  };
}

// Format Hijri Date
export function getHijriDate(date: Date): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return formatter.format(date);
  } catch (e) {
    return '1448 AH';
  }
}

// Format countdown to next prayer
export function getCountdownToNextPrayer(targetMinutes: number): string {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  let diff = targetMinutes - currentMinutes;
  if (diff < 0) diff += 1440;

  const hours = Math.floor(diff / 60);
  const mins = diff % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

export interface MonthStatsResult {
  totalPrayersDue: number;
  totalCompleted: number;
  completionRate: number;
  jamaahCount: number;
  jamaahRate: number;
  lateCount: number;
  missedCount: number;
  excusedCount: number;
  perfectDaysCount: number;
  currentStreak: number;
  longestStreak: number;
  prayerBreakdown: Record<PrayerName, { completed: number; total: number; percentage: number }>;
  weeklyBreakdown: { weekNumber: number; completed: number; total: number; percentage: number }[];
}

export function calculateMonthStats(
  records: Record<string, { prayers?: Record<string, string> }>,
  year: number,
  monthIndex: number
): MonthStatsResult {
  const monthStr = String(monthIndex + 1).padStart(2, '0');
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() === monthIndex;
  const maxDay = isCurrentMonth ? Math.min(daysInMonth, now.getDate()) : daysInMonth;

  const prayers: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

  const totalPrayersDue = maxDay * 5;
  let totalCompleted = 0;
  let jamaahCount = 0;
  let lateCount = 0;
  let missedCount = 0;
  let excusedCount = 0;
  let perfectDaysCount = 0;

  const prayerCounts: Record<PrayerName, { completed: number; total: number }> = {
    fajr: { completed: 0, total: maxDay },
    dhuhr: { completed: 0, total: maxDay },
    asr: { completed: 0, total: maxDay },
    maghrib: { completed: 0, total: maxDay },
    isha: { completed: 0, total: maxDay },
  };

  const weeksMap: Record<number, { completed: number; total: number }> = {};

  let currentStreakCounter = 0;
  let longestStreakCounter = 0;
  let tempStreak = 0;

  for (let day = 1; day <= maxDay; day++) {
    const dayStr = String(day).padStart(2, '0');
    const key = `${year}-${monthStr}-${dayStr}`;
    const rec = records[key];
    const weekNum = Math.min(5, Math.ceil(day / 7));

    if (!weeksMap[weekNum]) {
      weeksMap[weekNum] = { completed: 0, total: 0 };
    }
    weeksMap[weekNum].total += 5;

    let dayCompleted = 0;

    if (rec && rec.prayers) {
      for (const p of prayers) {
        const st = rec.prayers[p];
        if (st === 'prayed' || st === 'jamaah' || st === 'late') {
          totalCompleted++;
          dayCompleted++;
          weeksMap[weekNum].completed++;
          prayerCounts[p].completed++;
          if (st === 'jamaah') jamaahCount++;
          if (st === 'late') lateCount++;
        } else if (st === 'excused') {
          excusedCount++;
        } else {
          missedCount++;
        }
      }
    } else {
      missedCount += 5;
    }

    if (dayCompleted === 5) {
      perfectDaysCount++;
      tempStreak++;
      if (tempStreak > longestStreakCounter) {
        longestStreakCounter = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  }

  let backDay = maxDay;
  while (backDay >= 1) {
    const dayStr = String(backDay).padStart(2, '0');
    const key = `${year}-${monthStr}-${dayStr}`;
    const rec = records[key];
    if (rec && rec.prayers) {
      const c = prayers.filter((p) => {
        const st = rec.prayers[p];
        return st === 'prayed' || st === 'jamaah' || st === 'late';
      }).length;
      if (c === 5) {
        currentStreakCounter++;
        backDay--;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  const completionRate = totalPrayersDue > 0 ? Math.round((totalCompleted / totalPrayersDue) * 100) : 0;
  const jamaahRate = totalCompleted > 0 ? Math.round((jamaahCount / totalCompleted) * 100) : 0;

  const prayerBreakdown: Record<PrayerName, { completed: number; total: number; percentage: number }> = {
    fajr: {
      completed: prayerCounts.fajr.completed,
      total: maxDay,
      percentage: maxDay > 0 ? Math.round((prayerCounts.fajr.completed / maxDay) * 100) : 0,
    },
    dhuhr: {
      completed: prayerCounts.dhuhr.completed,
      total: maxDay,
      percentage: maxDay > 0 ? Math.round((prayerCounts.dhuhr.completed / maxDay) * 100) : 0,
    },
    asr: {
      completed: prayerCounts.asr.completed,
      total: maxDay,
      percentage: maxDay > 0 ? Math.round((prayerCounts.asr.completed / maxDay) * 100) : 0,
    },
    maghrib: {
      completed: prayerCounts.maghrib.completed,
      total: maxDay,
      percentage: maxDay > 0 ? Math.round((prayerCounts.maghrib.completed / maxDay) * 100) : 0,
    },
    isha: {
      completed: prayerCounts.isha.completed,
      total: maxDay,
      percentage: maxDay > 0 ? Math.round((prayerCounts.isha.completed / maxDay) * 100) : 0,
    },
  };

  const weeklyBreakdown = Object.keys(weeksMap).map((wKey) => {
    const wNum = parseInt(wKey, 10);
    const w = weeksMap[wNum];
    return {
      weekNumber: wNum,
      completed: w.completed,
      total: w.total,
      percentage: w.total > 0 ? Math.round((w.completed / w.total) * 100) : 0,
    };
  });

  return {
    totalPrayersDue,
    totalCompleted,
    completionRate,
    jamaahCount,
    jamaahRate,
    lateCount,
    missedCount,
    excusedCount,
    perfectDaysCount,
    currentStreak: currentStreakCounter,
    longestStreak: longestStreakCounter,
    prayerBreakdown,
    weeklyBreakdown,
  };
}

