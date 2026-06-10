import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface MeditationSession {
  id: string;
  date: string;
  duration: number;
  type: 'breathing' | 'meditation' | 'yoga';
  notes?: string;
}

export default function AntiStressHub() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [selectedDuration, setSelectedDuration] = useState(5);
  const [selectedType, setSelectedType] = useState<
    'breathing' | 'meditation' | 'yoga'
  >('breathing');
  const [stressLevel, setStressLevel] = useState(5);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>(
    'inhale',
  );
  const [breathCount, setBreathCount] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('omni_meditation_sessions');
    if (saved) setSessions(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('omni_meditation_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let breathInterval: ReturnType<typeof setInterval>;

    if (isActive && selectedType === 'breathing') {
      const breathSteps = [
        { phase: 'inhale', duration: 4000 },
        { phase: 'hold', duration: 7000 },
        { phase: 'exhale', duration: 8000 },
      ];
      let stepIndex = 0;

      breathInterval = setInterval(() => {
        setBreathPhase(breathSteps[stepIndex].phase as any);
        stepIndex = (stepIndex + 1) % breathSteps.length;
        setBreathCount((c) => c + 1);
      }, breathSteps[0].duration);
    }

    if (isActive) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            saveSession();
            return selectedDuration * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(interval);
      clearInterval(breathInterval);
    };
  }, [isActive, selectedDuration, selectedType]);

  const saveSession = () => {
    const session: MeditationSession = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      duration: selectedDuration,
      type: selectedType,
      notes: `${t('stress.stress_level_before')}: ${stressLevel}/10`,
    };
    setSessions([session, ...sessions]);
  };

  const startSession = () => {
    setTimeLeft(selectedDuration * 60);
    setIsActive(true);
    setBreathCount(0);
    setBreathPhase('inhale');
  };

  const stopSession = () => {
    setIsActive(false);
    if (selectedDuration * 60 - timeLeft > 30) {
      saveSession();
    }
    setTimeLeft(selectedDuration * 60);
    setBreathPhase('inhale');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBreathInstruction = () => {
    switch (breathPhase) {
      case 'inhale':
        return t('stress.breath_in');
      case 'hold':
        return t('stress.hold');
      case 'exhale':
        return t('stress.breath_out');
      default:
        return 'Breathe...';
    }
  };

  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const totalSessions = sessions.length;
  const weeklyMinutes = sessions
    .filter((s) => {
      const date = new Date(s.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo;
    })
    .reduce((sum, s) => sum + s.duration, 0);

  const getStressEmoji = (level: number) => {
    if (level <= 2) return '😌';
    if (level <= 4) return '🙂';
    if (level <= 6) return '😐';
    if (level <= 8) return '😟';
    return '😫';
  };

  const getStressColor = (level: number) => {
    if (level <= 3) return 'text-green-500';
    if (level <= 6) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className='space-y-6' dir={isRTL ? 'rtl' : 'ltr'}>
      <div className='flex justify-between items-center'>
        <h2 className='text-xl font-semibold text-gray-800 dark:text-gray-200'>
          <i className='fas fa-spa mr-2 text-primary-500'></i>{' '}
          {t('stress.title')}
        </h2>
      </div>

      {/* Stress Level Check */}
      <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800'>
        <h3 className='font-medium text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2'>
          <i className='fas fa-chart-line text-primary-500'></i>{' '}
          {t('stress.feeling')}
        </h3>
        <div className='flex items-center gap-4 flex-wrap'>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-gray-500'>{t('stress.calm')}</span>
            <span className='text-2xl'>😌</span>
          </div>
          <div className='flex-1'>
            <input
              type='range'
              min='1'
              max='10'
              value={stressLevel}
              onChange={(e) => setStressLevel(parseInt(e.target.value))}
              className='w-full accent-primary-500'
            />
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-2xl'>{getStressEmoji(stressLevel)}</span>
            <span
              className={`text-lg font-semibold ${getStressColor(stressLevel)}`}
            >
              {stressLevel}/10
            </span>
            <span className='text-sm text-gray-500'>
              {t('stress.stressed')}
            </span>
          </div>
        </div>
      </div>

      {/* Active Session */}
      {isActive ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-2xl p-8 text-white text-center relative overflow-hidden ${
            selectedType === 'breathing'
              ? 'bg-gradient-to-br from-teal-500 to-emerald-600'
              : selectedType === 'meditation'
                ? 'bg-gradient-to-br from-purple-500 to-pink-600'
                : 'bg-gradient-to-br from-orange-500 to-red-600'
          }`}
        >
          <div className='absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3'></div>
          <div className='absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4'></div>

          <div className='relative z-10'>
            {selectedType === 'breathing' ? (
              <div className='space-y-6'>
                <p className='text-xl font-light tracking-wide'>
                  {getBreathInstruction()}
                </p>
                <motion.div
                  animate={{
                    scale:
                      breathPhase === 'inhale'
                        ? 1.5
                        : breathPhase === 'exhale'
                          ? 0.8
                          : 1.2,
                  }}
                  transition={{
                    duration:
                      breathPhase === 'inhale'
                        ? 4
                        : breathPhase === 'exhale'
                          ? 8
                          : 7,
                    ease: 'easeInOut',
                  }}
                  className='w-40 h-40 mx-auto rounded-full bg-white/20 flex items-center justify-center'
                >
                  <div className='w-28 h-28 rounded-full bg-white/30 flex items-center justify-center'>
                    <i className='fas fa-lungs text-4xl text-white/80'></i>
                  </div>
                </motion.div>
                <div className='text-6xl font-mono font-bold tracking-wider'>
                  {formatTime(timeLeft)}
                </div>
                <p className='text-sm opacity-80'>
                  <i className='fas fa-waveform mr-1'></i>{' '}
                  {t('stress.breath_count')}: {Math.floor(breathCount / 3)}{' '}
                  cycles
                </p>
              </div>
            ) : (
              <div className='space-y-6'>
                <div className='w-24 h-24 mx-auto rounded-full bg-white/20 flex items-center justify-center'>
                  <i
                    className={`fas ${selectedType === 'meditation' ? 'fa-pray' : 'fa-praying-hands'} text-5xl`}
                  ></i>
                </div>
                <div className='text-6xl font-mono font-bold tracking-wider'>
                  {formatTime(timeLeft)}
                </div>
                <p className='text-lg font-light max-w-md mx-auto'>
                  {selectedType === 'meditation'
                    ? 'Focus on your breath. Let thoughts pass without judgment.'
                    : 'Connect with your body. Breathe deeply and stretch gently.'}
                </p>
              </div>
            )}
            <button
              onClick={stopSession}
              className='mt-8 px-8 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full font-medium hover:bg-white/30 transition-all'
            >
              <i className='fas fa-stop mr-2'></i> {t('stress.stop')}
            </button>
          </div>
        </motion.div>
      ) : (
        <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800'>
          <h3 className='font-medium text-gray-800 dark:text-gray-200 mb-4'>
            <i className='fas fa-play-circle text-primary-500 mr-2'></i>{' '}
            {t('stress.start_session')}
          </h3>
          <div className='space-y-5'>
            <div>
              <label className='block text-sm text-gray-600 dark:text-gray-400 mb-2'>
                <i className='fas fa-tag mr-1'></i> {t('stress.session_type')}
              </label>
              <div className='grid grid-cols-3 gap-3'>
                {(['breathing', 'meditation', 'yoga'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`py-3 rounded-xl capitalize transition-all flex flex-col items-center gap-2 ${
                      selectedType === type
                        ? 'bg-primary-500 text-white shadow-lg scale-105'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <i
                      className={`fas ${
                        type === 'breathing'
                          ? 'fa-lungs'
                          : type === 'meditation'
                            ? 'fa-pray'
                            : 'fa-praying-hands'
                      } text-xl`}
                    ></i>
                    <span className='text-sm capitalize'>
                      {t(`stress.${type}`)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className='block text-sm text-gray-600 dark:text-gray-400 mb-2'>
                <i className='fas fa-hourglass-half mr-1'></i>{' '}
                {t('stress.duration')}: {selectedDuration} {t('stress.min')}
              </label>
              <input
                type='range'
                min='1'
                max='30'
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(parseInt(e.target.value))}
                className='w-full accent-primary-500'
              />
              <div className='flex justify-between text-xs text-gray-400 mt-1'>
                <span>1 {t('stress.min')}</span>
                <span>10 {t('stress.min')}</span>
                <span>20 {t('stress.min')}</span>
                <span>30 {t('stress.min')}</span>
              </div>
            </div>

            <button
              onClick={startSession}
              className='w-full py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all flex items-center justify-center gap-2 font-medium'
            >
              <i className='fas fa-play'></i> {t('stress.start')}
            </button>
          </div>
        </div>
      )}

      {/* Quick Relief Tips */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all group'>
          <i className='fas fa-walking text-2xl text-blue-500 mb-2 group-hover:scale-110 transition-transform'></i>
          <p className='text-sm font-medium'>{t('stress.quick_walk')}</p>
          <p className='text-xs text-gray-400'>5-10 min</p>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all group'>
          <i className='fas fa-music text-2xl text-purple-500 mb-2 group-hover:scale-110 transition-transform'></i>
          <p className='text-sm font-medium'>{t('stress.calm_music')}</p>
          <p className='text-xs text-gray-400'>5 min</p>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all group'>
          <i className='fas fa-journal-whills text-2xl text-green-500 mb-2 group-hover:scale-110 transition-transform'></i>
          <p className='text-sm font-medium'>{t('stress.journaling')}</p>
          <p className='text-xs text-gray-400'>10 min</p>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all group'>
          <i className='fas fa-tea text-2xl text-orange-500 mb-2 group-hover:scale-110 transition-transform'></i>
          <p className='text-sm font-medium'>{t('stress.herbal_tea')}</p>
          <p className='text-xs text-gray-400'>15 min</p>
        </div>
      </div>

      {/* Progress Stats */}
      <div className='bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-950/30 dark:to-secondary-950/30 rounded-xl p-6 border border-primary-100 dark:border-primary-800'>
        <h3 className='font-medium text-gray-800 dark:text-gray-200 mb-4'>
          <i className='fas fa-chart-simple mr-2 text-primary-500'></i>{' '}
          {t('stress.your_progress')}
        </h3>
        <div className='grid grid-cols-3 gap-4 text-center'>
          <div>
            <div className='text-3xl font-bold text-primary-600'>
              {totalSessions}
            </div>
            <div className='text-xs text-gray-500'>{t('stress.sessions')}</div>
          </div>
          <div>
            <div className='text-3xl font-bold text-primary-600'>
              {totalMinutes}
            </div>
            <div className='text-xs text-gray-500'>
              {t('stress.total_minutes')}
            </div>
          </div>
          <div>
            <div className='text-3xl font-bold text-primary-600'>
              {weeklyMinutes}
            </div>
            <div className='text-xs text-gray-500'>
              {t('stress.weekly_minutes')}
            </div>
          </div>
        </div>
        {sessions.length > 0 && (
          <div className='mt-4 pt-3 border-t border-primary-200 dark:border-primary-800'>
            <p className='text-xs text-gray-500 text-center'>
              <i className='far fa-calendar-alt mr-1'></i>{' '}
              {t('stress.last_session')}:{' '}
              {new Date(sessions[0].date).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
