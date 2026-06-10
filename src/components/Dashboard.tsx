import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface HealthData {
  glucose: { value: number; timestamp: string }[];
  bloodPressure: { systolic: number; diastolic: number; timestamp: string }[];
  water: { amount: number; date: string }[];
  sleep: { duration: number; quality: number; date: string }[];
  activity: { duration: number; calories: number; date: string }[];
  habits: { noSmoking: boolean; noAlcohol: boolean; date: string }[];
}

interface DashboardProps {
  onNavigate?: (organId: string) => void;
  onOpenSettings?: () => void;
}

export default function Dashboard({ onNavigate, onOpenSettings }: DashboardProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [healthScore, setHealthScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [userName, setUserName] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [tempName, setTempName] = useState('');

  useEffect(() => {
    const savedName = localStorage.getItem('omni_user_name');
    if (savedName) {
      setUserName(savedName);
    } else {
      setShowNameDialog(true);
    }
    
    loadHealthData();
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const saveUserName = () => {
    if (tempName.trim()) {
      setUserName(tempName.trim());
      localStorage.setItem('omni_user_name', tempName.trim());
      setShowNameDialog(false);
    }
  };

  const loadHealthData = () => {
    const glucose = JSON.parse(localStorage.getItem('omni_glucose') || '[]');
    const bloodPressure = JSON.parse(localStorage.getItem('omni_bp') || '[]');
    const water = JSON.parse(localStorage.getItem('omni_water') || '[]');
    const sleep = JSON.parse(localStorage.getItem('omni_sleep') || '[]');
    const activity = JSON.parse(localStorage.getItem('omni_activity') || '[]');
    const habits = JSON.parse(localStorage.getItem('omni_habits') || '[]');

    setHealthData({ glucose, bloodPressure, water, sleep, activity, habits });
    calculateHealthScore(
      glucose,
      bloodPressure,
      water,
      sleep,
      activity,
      // habits,
    );
    calculateStreak(habits);
  };

  const calculateHealthScore = (
    glucose: any[],
    bp: any[],
    water: any[],
    sleep: any[],
    activity: any[],
    // habits: any[],
  ) => {
    let score = 100;

    const lastGlucose = glucose[0]?.value;
    if (lastGlucose) {
      if (lastGlucose >= 70 && lastGlucose <= 140) score += 0;
      else if (lastGlucose > 140) score -= 10;
      else if (lastGlucose < 70) score -= 15;
    }

    const lastBP = bp[0];
    if (lastBP) {
      if (lastBP.systolic < 120 && lastBP.diastolic < 80) score += 0;
      else if (lastBP.systolic < 130) score -= 5;
      else if (lastBP.systolic < 140) score -= 10;
      else score -= 15;
    }

    const today = new Date().toISOString().split('T')[0];
    const todayWater = water
      .filter((w: any) => w.date === today)
      .reduce((sum: number, w: any) => sum + w.amount, 0);
    if (todayWater >= 2000) score += 0;
    else if (todayWater >= 1500) score -= 5;
    else if (todayWater >= 1000) score -= 10;
    else score -= 15;

    const lastSleep = sleep[0];
    if (lastSleep) {
      if (lastSleep.duration >= 7 && lastSleep.duration <= 9) score += 0;
      else if (lastSleep.duration >= 6) score -= 5;
      else score -= 10;
    }

    const lastWeekActivity = activity.filter((a: any) => {
      const date = new Date(a.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo;
    });
    const totalMinutes = lastWeekActivity.reduce(
      (sum: number, a: any) => sum + a.duration,
      0,
    );
    if (totalMinutes >= 150) score += 0;
    else if (totalMinutes >= 75) score -= 5;
    else if (totalMinutes > 0) score -= 10;
    else score -= 15;

    setHealthScore(Math.max(0, Math.min(100, score)));
  };

  const calculateStreak = (habits: any[]) => {
    let streak = 0;
    const sorted = [...habits].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    for (const habit of sorted) {
      if (habit.noSmoking && habit.noAlcohol) streak++;
      else break;
    }
    setStreak(streak);
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return t('dashboard.greeting_morning');
    if (hour < 18) return t('dashboard.greeting_afternoon');
    return t('dashboard.greeting_evening');
  };

  const getHealthScoreColor = () => {
    if (healthScore >= 80) return 'text-green-600 dark:text-green-400';
    if (healthScore >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreStatusIcon = () => {
    if (healthScore >= 80) return 'fas fa-trophy text-yellow-500';
    if (healthScore >= 60) return 'fas fa-smile-wink text-green-500';
    return 'fas fa-frown text-red-500';
  };

  const getGlucoseStatus = (value: number) => {
    if (value >= 70 && value <= 140) return t('dashboard.good');
    return t('dashboard.check');
  };

  const getGlucoseStatusColor = (value: number | undefined) => {
    if (!value) return 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400';
    if (value >= 70 && value <= 140) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
    return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
  };

  const getBPStatus = (systolic: number) => {
    if (systolic < 120) return t('status.normal');
    return t('status.elevated');
  };

  const getBPStatusColor = (systolic: number | undefined) => {
    if (!systolic) return 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400';
    if (systolic < 120) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
    return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
  };

  const getWaterStatus = (amount: number) => {
    if (amount >= 2000) return t('dashboard.goal_met');
    if (amount > 0) return t('dashboard.in_progress');
    return t('dashboard.log_water');
  };

  const getWaterStatusColor = (amount: number) => {
    if (amount >= 2000) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
    if (amount > 0) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
    return 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400';
  };

  const lastGlucose = healthData?.glucose[0]?.value;
  const lastBP = healthData?.bloodPressure[0];
  const todayWater =
    healthData?.water
      .filter((w) => w.date === new Date().toISOString().split('T')[0])
      .reduce((sum, w) => sum + w.amount, 0) || 0;

  const handleQuickAction = (action: string, organId: string) => {
    if (action === 'settings' && onOpenSettings) {
      onOpenSettings();
      return;
    }
    if (onNavigate) {
      onNavigate(organId);
    }
  };

    const quickActions = [
    { icon: 'fas fa-tachometer-alt', key: 'glucose', action: 'pancreas' },
    { icon: 'fas fa-heartbeat', key: 'blood_pressure', action: 'heart' },
    { icon: 'fas fa-tint', key: 'water', action: 'kidneys' },
    { icon: 'fas fa-utensils', key: 'food', action: 'stomach' },
    { icon: 'fas fa-bed', key: 'sleep', action: 'brain' },
    { icon: 'fas fa-running', key: 'sport', action: 'muscles' },
    { icon: 'fas fa-brain', key: 'mood', action: 'brain' },
    { icon: 'fas fa-cog', key: 'settings', action: 'settings' },
  ];

  const streakText = streak === 1 ? t('common.day') : t('common.days');

  const NameDialog = () => (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md'>
        <h2 className='text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4'>
          <i className='fas fa-user mr-2 text-primary-500'></i>
          {t('dashboard.welcome_title')}
        </h2>
        <p className='text-gray-600 dark:text-gray-400 mb-4'>
          {t('dashboard.welcome_message')}
        </p>
        <input
          type='text'
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          placeholder={t('dashboard.name_placeholder')}
          className='w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 mb-4'
          autoFocus
        />
        <button
          onClick={saveUserName}
          className='w-full py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition'
        >
          {t('common.save')}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {showNameDialog && <NameDialog />}
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='space-y-6 max-w-7xl mx-auto'
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Welcome Header */}
        <div className='bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-6 text-white relative overflow-hidden'>
          <div className='absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3'></div>
          <div className='absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4'></div>

          <div className='relative z-10'>
            <div className='flex justify-between items-start'>
              <div>
                <h1 className='text-2xl font-bold mb-1'>
                  {getGreeting()}{userName ? `, ${userName}!` : '!'}{' '}
                  <i className='fas fa-hand-peace'></i>
                </h1>
                <p className='text-white/80 text-sm'>
                  <i className='fas fa-calendar-alt mr-2'></i>
                  {currentTime.toLocaleDateString(isRTL ? 'fa-IR' : 'en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className='text-right'>
                <div className='text-3xl font-bold'>{streak}</div>
                <div className='text-sm opacity-80'>
                  {streak} {streakText} <i className='fas fa-fire'></i>
                </div>
              </div>
            </div>

            {lastGlucose && (
              <div className='mt-4 inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2'>
                <i className='fas fa-tachometer-alt text-sm'></i>
                <span className='text-sm'>{t('dashboard.current_glucose')}</span>
                <span className='font-bold'>{lastGlucose} mg/dL</span>
                {lastGlucose >= 70 && lastGlucose <= 140 ? (
                  <span className='text-xs bg-green-500 px-2 py-0.5 rounded-full'>
                    <i className='fas fa-check-circle mr-1'></i>
                    {t('dashboard.within_target')}
                  </span>
                ) : (
                  <span className='text-xs bg-yellow-500 px-2 py-0.5 rounded-full'>
                    <i className='fas fa-exclamation-triangle mr-1'></i>
                    {t('dashboard.needs_attention')}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Health Score Card */}
        <div className='bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800'>
          <div className='flex items-center justify-between flex-wrap gap-4'>
            <div>
              <p className='text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide'>
                <i className='fas fa-chart-line mr-1'></i>
                {t('dashboard.health_score')}
              </p>
              <div className='flex items-baseline gap-2'>
                <span className={`text-5xl font-bold ${getHealthScoreColor()}`}>
                  {healthScore}
                </span>
                <span className='text-2xl'>
                  <i className={getScoreStatusIcon()}></i>
                </span>
              </div>
              <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                {t('dashboard.health_score_desc')}
              </p>
            </div>

            <div className='flex-1 max-w-md'>
              <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${healthScore}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className='h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full'
                />
              </div>
              <div className='flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2'>
                <span>{t('dashboard.poor')}</span>
                <span>{t('dashboard.fair')}</span>
                <span>{t('dashboard.good')}</span>
                <span>{t('dashboard.excellent')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800'
          >
            <div className='flex items-center justify-between'>
              <div className='text-2xl text-blue-500 dark:text-blue-400'>
                <i className='fas fa-tachometer-alt'></i>
              </div>
              <div
                className={`text-sm font-medium px-2 py-0.5 rounded-full ${getGlucoseStatusColor(lastGlucose)}`}
              >
                {lastGlucose ? getGlucoseStatus(lastGlucose) : t('common.no_data')}
              </div>
            </div>
            <div className='mt-2'>
              <div className='text-2xl font-semibold text-gray-800 dark:text-gray-100'>{lastGlucose || '—'}</div>
              <div className='text-xs text-gray-500 dark:text-gray-400'>
                {t('dashboard.glucose')}
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800'
          >
            <div className='flex items-center justify-between'>
              <div className='text-2xl text-red-500 dark:text-red-400'>
                <i className='fas fa-heartbeat'></i>
              </div>
              <div
                className={`text-sm font-medium px-2 py-0.5 rounded-full ${getBPStatusColor(lastBP?.systolic)}`}
              >
                {lastBP ? getBPStatus(lastBP.systolic) : t('common.no_data')}
              </div>
            </div>
            <div className='mt-2'>
              <div className='text-2xl font-semibold text-gray-800 dark:text-gray-100'>
                {lastBP ? `${lastBP.systolic}/${lastBP.diastolic}` : '—'}
              </div>
              <div className='text-xs text-gray-500 dark:text-gray-400'>
                {t('dashboard.blood_pressure')}
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800'
          >
            <div className='flex items-center justify-between'>
              <div className='text-2xl text-cyan-500 dark:text-cyan-400'>
                <i className='fas fa-tint'></i>
              </div>
              <div
                className={`text-sm font-medium px-2 py-0.5 rounded-full ${getWaterStatusColor(todayWater)}`}
              >
                {getWaterStatus(todayWater)}
              </div>
            </div>
            <div className='mt-2'>
              <div className='text-2xl font-semibold text-gray-800 dark:text-gray-100'>{todayWater}</div>
              <div className='text-xs text-gray-500 dark:text-gray-400'>{t('dashboard.water')}</div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800'
          >
            <div className='flex items-center justify-between'>
              <div className='text-2xl text-orange-500 dark:text-orange-400'>
                <i className='fas fa-fire'></i>
              </div>
              <div className='text-sm font-medium px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'>
                {streak} {streakText}
              </div>
            </div>
            <div className='mt-2'>
              <div className='text-2xl font-semibold text-gray-800 dark:text-gray-100'>{streak}</div>
              <div className='text-xs text-gray-500 dark:text-gray-400'>
                {t('dashboard.current_streak')}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className='bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800'>
          <h3 className='font-semibold text-gray-800 dark:text-gray-200 mb-4'>
            <i className='fas fa-bolt mr-2 text-primary-500'></i>
            {t('dashboard.quick_actions')}
          </h3>
          <div className='grid grid-cols-4 md:grid-cols-8 gap-3'>
            {quickActions.map((item) => (
              <motion.button
                key={item.key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickAction(item.key, item.action)}
                className='flex flex-col items-center gap-1 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group'
              >
                <div className='text-2xl text-gray-600 dark:text-gray-400 group-hover:text-primary-500 transition-colors'>
                  <i className={item.icon}></i>
                </div>
                <span className='text-xs font-medium text-gray-700 dark:text-gray-300'>
                  {t(`dashboard.${item.key}`)}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}