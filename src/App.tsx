import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ActivityTracker from './components/ActivityTracker';
import AnimatedBackground from './components/AnimatedBackground';
import BladderTracker from './components/BladderTracker';
import BPTracker from './components/BPTracker';
import Dashboard from './components/Dashboard';
import DentalTracker from './components/DentalTracker';
import FoodManager from './components/FoodManager';
import GlucoseTracker from './components/GlucoseTracker';
import HabitTracker from './components/HabitTracker';
import HearingTracker from './components/HearingTracker';
import IntestinesTracker from './components/IntestinesTracker';
import LanguageSwitcher from './components/LanguageSwitcher';
import LiverTracker from './components/LiverTracker';
import NailsTracker from './components/NailsTracker';
import PremiumCard from './components/PremiumCard';
import ReproductiveTracker from './components/ReproductiveTracker';
import SettingsDialog from './components/SettingsDialog';
import SkeletonCard from './components/SkeletonCard';
import SkinTracker from './components/SkinTracker';
import SleepTracker from './components/SleepTracker';
import SmartTools from './components/SmartTools';
import { ToastProvider } from './components/Toast';
import VisionTracker from './components/VisionTracker';
import WaterTracker from './components/WaterTracker';
import WeightTracker from './components/WeightTracker';
import { getSettings, saveSettings } from './utils/dataManager';

const organs = [
  { id: 'brain', iconClass: 'fas fa-brain', defaultIcon: 'fa-brain' },
  { id: 'eyes', iconClass: 'fas fa-eye', defaultIcon: 'fa-eye' },
  { id: 'ears', iconClass: 'fas fa-ear-deaf', defaultIcon: 'fa-ear-deaf' },
  { id: 'heart', iconClass: 'fas fa-heartbeat', defaultIcon: 'fa-heartbeat' },
  { id: 'lungs', iconClass: 'fas fa-lungs', defaultIcon: 'fa-lungs' },
  { id: 'pancreas', iconClass: 'fas fa-tachometer-alt', defaultIcon: 'fa-tachometer-alt' },
  { id: 'stomach', iconClass: 'fas fa-utensils', defaultIcon: 'fa-utensils' },
  { id: 'liver', iconClass: 'fas fa-filter', defaultIcon: 'fa-filter' },
  { id: 'kidneys', iconClass: 'fas fa-tint', defaultIcon: 'fa-tint' },
  { id: 'intestines', iconClass: 'fas fa-grip-lines', defaultIcon: 'fa-grip-lines' },
  { id: 'bladder', iconClass: 'fas fa-toilet', defaultIcon: 'fa-toilet' },
  { id: 'reproductive', iconClass: 'fas fa-venus-mars', defaultIcon: 'fa-venus-mars' },
  { id: 'teeth', iconClass: 'fas fa-tooth', defaultIcon: 'fa-tooth' },
  { id: 'bones', iconClass: 'fas fa-weight-scale', defaultIcon: 'fa-weight-scale' },
  { id: 'muscles', iconClass: 'fas fa-dumbbell', defaultIcon: 'fa-dumbbell' },
  { id: 'skin', iconClass: 'fas fa-allergies', defaultIcon: 'fa-allergies' },
  { id: 'nails', iconClass: 'fas fa-hand-peace', defaultIcon: 'fa-hand-peace' },
];

const getHealthStatus = (value: number): 'green' | 'yellow' | 'red' => {
  if (value < 70) return 'red';
  if (value < 100) return 'green';
  if (value < 140) return 'yellow';
  return 'red';
};

const getLastGlucoseReading = (): {
  value: number;
  status: 'green' | 'yellow' | 'red';
} | null => {
  const saved = localStorage.getItem('omni_glucose');
  if (!saved) return null;
  const readings = JSON.parse(saved);
  if (readings.length === 0) return null;
  const lastValue = readings[0].value;
  return { value: lastValue, status: getHealthStatus(lastValue) };
};

const getLastBPReading = (): {
  systolic: number;
  diastolic: number;
  status: 'green' | 'yellow' | 'red';
} | null => {
  const saved = localStorage.getItem('omni_bp');
  if (!saved) return null;
  const readings = JSON.parse(saved);
  if (readings.length === 0) return null;
  const last = readings[0];
  let status: 'green' | 'yellow' | 'red' = 'green';
  if (last.systolic >= 140 || last.diastolic >= 90) status = 'red';
  else if (last.systolic >= 130 || last.diastolic >= 80) status = 'yellow';
  return { systolic: last.systolic, diastolic: last.diastolic, status };
};

const getLastWaterTotal = (): {
  total: number;
  status: 'green' | 'yellow' | 'red';
} | null => {
  const saved = localStorage.getItem('omni_water');
  if (!saved) return null;
  const entries = JSON.parse(saved);
  const today = new Date().toISOString().split('T')[0];
  const todayTotal = entries
    .filter((e: any) => e.date === today)
    .reduce((sum: number, e: any) => sum + e.amount, 0);
  let status: 'green' | 'yellow' | 'red' = 'red';
  if (todayTotal >= 2000) status = 'green';
  else if (todayTotal >= 1000) status = 'yellow';
  return { total: todayTotal, status };
};

function AppContent() {
  const { t, i18n } = useTranslation();
  
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showSmartTools, setShowSmartTools] = useState(false);
  const [showOrganGrid, setShowOrganGrid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [organStatuses, setOrganStatuses] = useState<Record<string, any>>({});

  // Apply theme on mount and when darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Load settings on mount
  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000);
    
    const settings = getSettings();
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark';
    setDarkMode(isDark);
    
    if (settings.language && settings.language !== i18n.language) {
      i18n.changeLanguage(settings.language);
      if (settings.language === 'fa' || settings.language === 'ar') {
        document.documentElement.dir = 'rtl';
      } else {
        document.documentElement.dir = 'ltr';
      }
    }
  }, []);

  useEffect(() => {
    const glucoseData = getLastGlucoseReading();
    const bpData = getLastBPReading();
    const waterData = getLastWaterTotal();

    setOrganStatuses({
      pancreas: glucoseData
        ? { status: glucoseData.status, lastValue: `${glucoseData.value} mg/dL` }
        : { status: 'green', lastValue: t('status.no_data') },
      heart: bpData
        ? { status: bpData.status, lastValue: `${bpData.systolic}/${bpData.diastolic} mmHg` }
        : { status: 'green', lastValue: t('status.no_data') },
      kidneys: waterData
        ? { status: waterData.status, lastValue: `${waterData.total} ml` }
        : { status: 'green', lastValue: t('status.no_data') },
      brain: { status: 'green', lastValue: <i className='fas fa-bed'></i> },
      eyes: { status: 'green', lastValue: <i className='fas fa-eye'></i> },
      ears: { status: 'green', lastValue: <i className='fas fa-ear-deaf'></i> },
      lungs: { status: 'green', lastValue: <i className='fas fa-lungs'></i> },
      stomach: { status: 'green', lastValue: <i className='fas fa-utensils'></i> },
      liver: { status: 'green', lastValue: <i className='fas fa-filter'></i> },
      intestines: { status: 'green', lastValue: <i className='fas fa-grip-lines'></i> },
      bladder: { status: 'green', lastValue: <i className='fas fa-toilet'></i> },
      reproductive: { status: 'green', lastValue: <i className='fas fa-venus-mars'></i> },
      teeth: { status: 'green', lastValue: <i className='fas fa-tooth'></i> },
      bones: { status: 'green', lastValue: <i className='fas fa-bone'></i> },
      muscles: { status: 'green', lastValue: <i className='fas fa-dumbbell'></i> },
      skin: { status: 'green', lastValue: <i className='fas fa-allergies'></i> },
      nails: { status: 'green', lastValue: <i className='fas fa-hand-peace'></i> },
    });
  }, [t]);

  const handleThemeChange = useCallback((newTheme: string) => {
    const isDark = newTheme === 'dark';
    setDarkMode(isDark);
  }, []);

  const handleLanguageChange = useCallback((langCode: string) => {
    i18n.changeLanguage(langCode);
    if (langCode === 'fa' || langCode === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
    const settings = getSettings();
    settings.language = langCode;
    saveSettings(settings);
  }, [i18n]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleNavigation = (callback: () => void) => {
    setMobileMenuOpen(false);
    setTimeout(() => callback(), 100);
  };

  useEffect(() => {
    window.history.pushState({ screen: 'main' }, '');
    
    const handlePopState = () => {
      if (showSettings) {
        setShowSettings(false);
        window.history.pushState({ screen: 'main' }, '');
        return;
      }
      if (showSmartTools) {
        setShowSmartTools(false);
        window.history.pushState({ screen: 'main' }, '');
        return;
      }
      if (selectedOrgan !== null) {
        setSelectedOrgan(null);
        window.history.pushState({ screen: 'organs' }, '');
        return;
      }
      if (showOrganGrid) {
        setShowOrganGrid(false);
        window.history.pushState({ screen: 'dashboard' }, '');
        return;
      }
      window.history.pushState({ screen: 'main' }, '');
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedOrgan, showOrganGrid, showSettings, showSmartTools]);

  const handleTrackerBack = () => {
    setSelectedOrgan(null);
    window.history.pushState({ screen: 'organs' }, '');
  };

  if (showSmartTools) {
    return <SmartTools onBack={() => {
      setShowSmartTools(false);
      window.history.pushState({ screen: 'main' }, '');
    }} />;
  }

  return (
    <div key={i18n.language} className='min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 relative' translate="no">
      <AnimatedBackground />

      <div className='relative z-10'>
        <header className='sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800'>
          <div className='px-3 py-2 sm:px-4 sm:py-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2 sm:gap-3'>
                  <img 
                    src='public/logo/logo.png'
                    alt='Omni Logo'
                    className='h-8 w-auto sm:h-10'
                  />
              </div>

              <div className='flex items-center gap-1 sm:gap-2'>
                <div className='hidden md:flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1'>
                  <button
                    onClick={() => setShowOrganGrid(false)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      !showOrganGrid
                        ? 'bg-white dark:bg-gray-900 shadow-sm text-primary-600'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <i className='fas fa-tachometer-alt mr-1 sm:mr-2'></i>
                    <span className='hidden sm:inline'>{t('nav.dashboard')}</span>
                  </button>
                  <button
                    onClick={() => setShowOrganGrid(true)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      showOrganGrid
                        ? 'bg-white dark:bg-gray-900 shadow-sm text-primary-600'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <i className='fas fa-brain mr-1 sm:mr-2'></i>
                    <span className='hidden sm:inline'>{t('nav.organs')}</span>
                  </button>
                </div>

                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className='md:hidden p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                  aria-label='Menu'
                >
                  <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'} text-sm`}></i>
                </button>

                <div className='hidden md:flex items-center gap-2'>
                  <LanguageSwitcher onLanguageChange={handleLanguageChange} />
                  <button
                    onClick={() => handleThemeChange(darkMode ? 'light' : 'dark')}
                    className='p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:scale-105 transition-transform text-gray-600 dark:text-gray-300'
                  >
                    <i className={`${darkMode ? 'fas fa-sun' : 'fas fa-moon'} text-sm`}></i>
                  </button>
                  <button
                    onClick={() => setShowSettings(true)}
                    className='p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:scale-105 transition-transform text-gray-600 dark:text-gray-300'
                  >
                    <i className='fas fa-cog text-sm'></i>
                  </button>
                  <button
                    onClick={() => setShowSmartTools(true)}
                    className='p-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:scale-105 transition-transform text-white shadow-md'
                  >
                    <i className='fas fa-gem text-sm'></i>
                  </button>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className='md:hidden mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 overflow-hidden'
                >
                  <div className='flex gap-2 mb-4'>
                    <button
                      onClick={() => handleNavigation(() => setShowOrganGrid(false))}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                        !showOrganGrid
                          ? 'bg-primary-500 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <i className='fas fa-tachometer-alt text-xl'></i>
                      <span>{t('nav.dashboard')}</span>
                    </button>
                    <button
                      onClick={() => handleNavigation(() => setShowOrganGrid(true))}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                        showOrganGrid
                          ? 'bg-primary-500 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <i className='fas fa-brain text-xl'></i>
                      <span>{t('nav.organs')}</span>
                    </button>
                  </div>

                  <div className='grid grid-cols-2 gap-3'>
                    <div className='w-full'>
                      <LanguageSwitcher onLanguageChange={handleLanguageChange} />
                    </div>

                    <button
                      onClick={() => {
                        handleThemeChange(darkMode ? 'light' : 'dark');
                        closeMobileMenu();
                      }}
                      className='w-full py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all flex items-center justify-center gap-2 active:scale-95'
                    >
                      <i className={`${darkMode ? 'fas fa-sun' : 'fas fa-moon'} text-sm`}></i>
                      <span className='text-sm font-medium'>{darkMode ? t('settings.light') : t('settings.dark')}</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowSettings(true);
                        closeMobileMenu();
                      }}
                      className='w-full py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all flex items-center justify-center gap-2 active:scale-95'
                    >
                      <i className='fas fa-cog text-sm'></i>
                      <span className='text-sm font-medium'>{t('nav.settings')}</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowSmartTools(true);
                        closeMobileMenu();
                      }}
                      className='w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md transition-all flex items-center justify-center gap-2 active:scale-95'
                    >
                      <i className='fas fa-gem text-sm'></i>
                      <span className='text-sm font-medium'>{t('nav.smart_tools')}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {selectedOrgan && !showSettings && !showSmartTools && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className='mt-2 pt-2 border-t border-gray-200 dark:border-gray-700'
              >
                <button
                  onClick={handleTrackerBack}
                  className='flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all py-1 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 w-full'
                >
                  <i className='fas fa-arrow-left text-xs'></i>
                  <span>{t('nav.back')} to {t('nav.organs')}</span>
                </button>
              </motion.div>
            )}
          </div>
        </header>

        <main className='container mx-auto px-3 sm:px-4 py-4 sm:py-8'>
          {!showOrganGrid ? (
            <Dashboard
              onNavigate={(organId) => {
                setShowOrganGrid(true);
                setSelectedOrgan(organId);
                window.history.pushState({ screen: 'organ_detail' }, '');
              }}
              onOpenSettings={() => setShowSettings(true)}
            />
          ) : (
            <AnimatePresence mode='wait'>
              {isLoading ? (
                <div className='grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5'>
                  {[...Array(8)].map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : selectedOrgan === 'pancreas' ? (
                <GlucoseTracker onBack={handleTrackerBack} />
              ) : selectedOrgan === 'heart' ? (
                <BPTracker onBack={handleTrackerBack} />
              ) : selectedOrgan === 'kidneys' ? (
                <WaterTracker onBack={handleTrackerBack} />
              ) : selectedOrgan === 'stomach' ? (
                <FoodManager onBack={handleTrackerBack} />
              ) : selectedOrgan === 'brain' ? (
                <SleepTracker onBack={handleTrackerBack} />
              ) : selectedOrgan === 'muscles' ? (
                <ActivityTracker onBack={handleTrackerBack} />
              ) : selectedOrgan === 'lungs' ? (
                <HabitTracker onBack={handleTrackerBack} />
              ) : selectedOrgan === 'teeth' ? (
                <DentalTracker onBack={handleTrackerBack} />
              ) : selectedOrgan === 'bones' ? (
                <WeightTracker onBack={handleTrackerBack} />
              ) : selectedOrgan === 'eyes' ? (
                <VisionTracker onBack={handleTrackerBack} />
              ) : selectedOrgan === 'ears' ? (
                <HearingTracker onBack={handleTrackerBack} />
              ) : selectedOrgan === 'skin' ? (
                <SkinTracker onBack={handleTrackerBack} />
              ) : selectedOrgan === 'reproductive' ? (
                <ReproductiveTracker onBack={handleTrackerBack} />
              ) : selectedOrgan === 'bladder' ? (
                <BladderTracker onBack={handleTrackerBack} />
              ) : selectedOrgan === 'nails' ? (
                <NailsTracker onBack={handleTrackerBack} />
              ) : selectedOrgan === 'liver' ? (
                <LiverTracker onBack={handleTrackerBack} />
              ) : selectedOrgan === 'intestines' ? (
                <IntestinesTracker onBack={handleTrackerBack} />
              ) : selectedOrgan ? (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <button onClick={handleTrackerBack} className='mb-4 sm:mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-all'>
                    <i className='fas fa-arrow-left text-sm'></i> {t('nav.back')}
                  </button>
                  <div className='bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 shadow-sm border text-center'>
                    <i className={`${organs.find((o) => o.id === selectedOrgan)?.iconClass} text-5xl sm:text-6xl mb-4 text-gray-500 dark:text-gray-400`}></i>
                    <h2 className='text-xl sm:text-2xl font-light mb-2'>{t(`organs.${selectedOrgan}`)} {t('nav.tracker')}</h2>
                    <p className='text-gray-500 text-sm sm:text-base'>{t('coming_soon')}</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className='grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5'
                >
                  {organs.map((organ) => {
                    const statusData = organStatuses[organ.id] || {
                      status: 'green',
                      lastValue: <i className={`fas ${organ.defaultIcon}`}></i>,
                    };
                    return (
                      <PremiumCard
                        key={organ.id}
                        iconClass={organ.iconClass}
                        title={t(`organs.${organ.id}`)}
                        subtitle={t(`subtitle.${organ.id}`)}
                        status={statusData.status}
                        lastValue={statusData.lastValue}
                        onClick={() => {
                          setSelectedOrgan(organ.id);
                          window.history.pushState({ screen: 'tracker' }, '');
                        }}
                      />
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </main>

        <footer className='mt-16 py-4 sm:py-6 text-center text-xs text-gray-400 dark:text-gray-600 border-t border-gray-100 dark:border-gray-800'>
          <p><i className='fas fa-chart-line mr-1'></i> Omni – {t('app.tagline')}</p>
        </footer>

        {showSettings && (
          <SettingsDialog
            onClose={() => {
              setShowSettings(false);
              window.history.pushState({ screen: 'main' }, '');
            }}
            onLanguageChange={() => window.location.reload()}
            onThemeChange={handleThemeChange}
            currentTheme={darkMode ? 'dark' : 'light'}
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}