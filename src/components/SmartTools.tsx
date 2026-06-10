import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AntiStressHub from './smart/AntiStressHub';
import BarbershopTracker from './smart/BarbershopTracker';
import BoneCrackingChecker from './smart/BoneCrackingChecker';
import CaffeineTracker from './smart/CaffeineTracker';
import CloudBackup from './smart/CloudBackup';
import DoctorAppointments from './smart/DoctorAppointments';
import FootDiary from './smart/FootDiary';
import ForgetfulnessTracker from './smart/ForgetfulnessTracker';
import GrowthTracker from './smart/GrowthTracker';
import HairChecker from './smart/HairChecker';
import HandGestureTracker from './smart/HandGestureTracker';
import InsulinRotator from './smart/InsulinRotator';
import LabResults from './smart/LabResults';
import LocalBackupManager from './smart/LocalBackup';
import NotificationCenter from './smart/NotificationCenter';
import PerfumeTracker from './smart/PerfumeTracker';
import PillTracker from './smart/PillTracker';
import SaltSugarTracker from './smart/SaltSugarTracker';
import SmartAlerts from './smart/SmartAlerts';
import VoiceLog from './smart/VoiceLog';

interface SmartTool {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  category:
    | 'medication'
    | 'appointments'
    | 'wellness'
    | 'tracking'
    | 'backup'
    | 'health';
  component: React.ReactNode;
}

interface SmartToolsProps {
  onBack: () => void;
}

export default function SmartTools({ onBack }: SmartToolsProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [recentTools, setRecentTools] = useState<string[]>([]);

  // Load recently used tools from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('omni_recent_smart_tools');
    if (saved) {
      setRecentTools(JSON.parse(saved));
    }
  }, []);

  const saveRecentTool = (toolId: string) => {
    const updated = [
      toolId,
      ...recentTools.filter((id) => id !== toolId),
    ].slice(0, 5);
    setRecentTools(updated);
    localStorage.setItem('omni_recent_smart_tools', JSON.stringify(updated));
  };

  const smartTools: SmartTool[] = [
    {
      id: 'pill',
      name: t('smart_tools.pill_tracker'),
      icon: 'fas fa-pills',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      category: 'medication',
      component: <PillTracker />,
    },
    {
      id: 'doctor',
      name: t('smart_tools.doctor_appointments'),
      icon: 'fas fa-stethoscope',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      category: 'appointments',
      component: <DoctorAppointments />,
    },
    {
      id: 'foot',
      name: t('smart_tools.foot_diary'),
      icon: 'fas fa-shoe-prints',
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      category: 'tracking',
      component: <FootDiary />,
    },
    {
      id: 'labs',
      name: t('smart_tools.lab_results'),
      icon: 'fas fa-flask',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950/30',
      category: 'health',
      component: <LabResults />,
    },
    {
      id: 'voice',
      name: t('smart_tools.voice_log'),
      icon: 'fas fa-microphone',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      category: 'tracking',
      component: <VoiceLog />,
    },
    {
      id: 'insulin',
      name: t('smart_tools.insulin_rotator'),
      icon: 'fas fa-syringe',
      color: 'text-rose-500',
      bgColor: 'bg-rose-50 dark:bg-rose-950/30',
      category: 'medication',
      component: <InsulinRotator />,
    },
    {
      id: 'alerts',
      name: t('smart_tools.smart_alerts'),
      icon: 'fas fa-bell',
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      category: 'health',
      component: <SmartAlerts />,
    },
    {
      id: 'stress',
      name: t('smart_tools.anti_stress'),
      icon: 'fas fa-spa',
      color: 'text-teal-500',
      bgColor: 'bg-teal-50 dark:bg-teal-950/30',
      category: 'wellness',
      component: <AntiStressHub />,
    },
    {
      id: 'growth',
      name: t('smart_tools.growth_tracker'),
      icon: 'fas fa-book',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
      category: 'wellness',
      component: <GrowthTracker />,
    },
    {
      id: 'notifications',
      name: t('smart_tools.notifications'),
      icon: 'fas fa-bell',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
      category: 'health',
      component: <NotificationCenter />,
    },
    {
      id: 'hair',
      name: t('smart_tools.hair_checker'),
      icon: 'fas fa-hand-peace',
      color: 'text-pink-500',
      bgColor: 'bg-pink-50 dark:bg-pink-950/30',
      category: 'tracking',
      component: <HairChecker />,
    },
    {
      id: 'bones',
      name: t('smart_tools.bone_cracking'),
      icon: 'fas fa-bone',
      color: 'text-stone-500',
      bgColor: 'bg-stone-50 dark:bg-stone-950/30',
      category: 'tracking',
      component: <BoneCrackingChecker />,
    },
    {
      id: 'caffeine',
      name: t('smart_tools.caffeine_tracker'),
      icon: 'fas fa-mug-hot',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
      category: 'tracking',
      component: <CaffeineTracker />,
    },
    {
      id: 'saltsugar',
      name: t('smart_tools.salt_sugar'),
      icon: 'fas fa-balance-scale',
      color: 'text-lime-500',
      bgColor: 'bg-lime-50 dark:bg-lime-950/30',
      category: 'tracking',
      component: <SaltSugarTracker />,
    },
    {
      id: 'memory',
      name: t('smart_tools.forgetfulness'),
      icon: 'fas fa-brain',
      color: 'text-violet-500',
      bgColor: 'bg-violet-50 dark:bg-violet-950/30',
      category: 'wellness',
      component: <ForgetfulnessTracker />,
    },
    {
      id: 'barber',
      name: t('smart_tools.barbershop'),
      icon: 'fas fa-cut',
      color: 'text-gray-500',
      bgColor: 'bg-gray-50 dark:bg-gray-800',
      category: 'tracking',
      component: <BarbershopTracker />,
    },
    {
      id: 'hands',
      name: t('smart_tools.hand_therapy'),
      icon: 'fas fa-hand-peace',
      color: 'text-sky-500',
      bgColor: 'bg-sky-50 dark:bg-sky-950/30',
      category: 'wellness',
      component: <HandGestureTracker />,
    },
    {
      id: 'hygiene',
      name: t('smart_tools.hygiene'),
      icon: 'fas fa-spa',
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      category: 'tracking',
      component: <PerfumeTracker />,
    },
    {
      id: 'cloud',
      name: t('smart_tools.cloud_backup'),
      icon: 'fas fa-cloud-upload-alt',
      color: 'text-slate-500',
      bgColor: 'bg-slate-50 dark:bg-slate-950/30',
      category: 'backup',
      component: <CloudBackup />,
    },
    {
      id: 'localbackup',
      name: t('smart_tools.local_backup'),
      icon: 'fas fa-database',
      color: 'text-zinc-500',
      bgColor: 'bg-zinc-50 dark:bg-zinc-950/30',
      category: 'backup',
      component: <LocalBackupManager />,
    },
  ];

  const categories = [
    {
      id: 'all',
      name: t('smart_tools.all'),
      icon: 'fas fa-th-large',
      color: 'text-gray-500',
    },
    {
      id: 'medication',
      name: t('smart_tools.medication'),
      icon: 'fas fa-pills',
      color: 'text-blue-500',
    },
    {
      id: 'appointments',
      name: t('smart_tools.appointments'),
      icon: 'fas fa-stethoscope',
      color: 'text-purple-500',
    },
    {
      id: 'tracking',
      name: t('smart_tools.tracking'),
      icon: 'fas fa-chart-line',
      color: 'text-emerald-500',
    },
    {
      id: 'wellness',
      name: t('smart_tools.wellness'),
      icon: 'fas fa-spa',
      color: 'text-teal-500',
    },
    {
      id: 'health',
      name: t('smart_tools.health'),
      icon: 'fas fa-heartbeat',
      color: 'text-red-500',
    },
    {
      id: 'backup',
      name: t('smart_tools.backup'),
      icon: 'fas fa-database',
      color: 'text-slate-500',
    },
  ];

  const filteredTools = smartTools.filter((tool) => {
    const matchesSearch = tool.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const recentToolsList = recentTools
    .map((id) => smartTools.find((t) => t.id === id))
    .filter((tool) => tool !== undefined);

  if (activeTool) {
    const currentTool = smartTools.find((t) => t.id === activeTool);
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-950'>
        <div className='sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800'>
          <div className='px-4 py-3'>
            <button
              onClick={() => {
                setActiveTool(null);
                if (currentTool) saveRecentTool(currentTool.id);
              }}
              className='flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all'
            >
              <i className='fas fa-arrow-left text-sm'></i>{' '}
              {t('smart_tools.back_to_tools')}
            </button>
            <div className='mt-2 flex items-center gap-3'>
              <div
                className={`w-10 h-10 rounded-xl ${currentTool?.bgColor} flex items-center justify-center`}
              >
                <i
                  className={`${currentTool?.icon} ${currentTool?.color} text-xl`}
                ></i>
              </div>
              <h1 className='text-xl font-semibold text-gray-800 dark:text-gray-200'>
                {currentTool?.name}
              </h1>
            </div>
          </div>
        </div>
        <div className='p-4'>{currentTool?.component}</div>
      </div>
    );
  }

  return (
    <div
      className='min-h-screen bg-gray-50 dark:bg-gray-950'
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className='sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800'>
        <div className='px-4 py-3'>
          <button
            onClick={onBack}
            className='flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all mb-3'
          >
            <i className='fas fa-arrow-left text-sm'></i> {t('nav.back')}
          </button>

          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg'>
              <i className='fas fa-gem text-white text-xl'></i>
            </div>
            <div>
              <h1 className='text-xl font-semibold text-gray-800 dark:text-gray-200'>
                {t('smart_tools.title')}
              </h1>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                {t('smart_tools.subtitle')}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className='relative mt-4'>
            <i className='fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm'></i>
            <input
              type='text'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('smart_tools.search_placeholder')}
              className='w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500'
            />
          </div>
        </div>
      </div>

      <div className='p-4'>
        {/* Category Chips - Horizontal scroll but better with touch */}
        <div className='overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide'>
          <div className='flex gap-2 min-w-max'>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <i
                  className={`${cat.icon} text-xs ${selectedCategory === cat.id ? 'text-white' : cat.color}`}
                ></i>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Recently Used Section */}
        {recentToolsList.length > 0 &&
          searchTerm === '' &&
          selectedCategory === 'all' && (
            <div className='mt-6'>
              <div className='flex items-center gap-2 mb-3'>
                <i className='fas fa-clock text-amber-500 text-sm'></i>
                <h2 className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  {t('smart_tools.recently_used')}
                </h2>
              </div>
              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'>
                {recentToolsList.map((tool) => (
                  <motion.button
                    key={tool!.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTool(tool!.id)}
                    className={`p-4 rounded-xl text-center transition-all ${tool!.bgColor} border border-gray-100 dark:border-gray-800 hover:shadow-md`}
                  >
                    <div
                      className={`w-12 h-12 mx-auto rounded-full ${tool!.bgColor} flex items-center justify-center mb-2`}
                    >
                      <i
                        className={`${tool!.icon} ${tool!.color} text-2xl`}
                      ></i>
                    </div>
                    <span className='text-sm font-medium text-gray-700 dark:text-gray-300 line-clamp-2'>
                      {tool!.name}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

        {/* All Tools Grid */}
        <div className='mt-6'>
          <div className='flex items-center gap-2 mb-3'>
            <i className='fas fa-grid-2 text-amber-500 text-sm'></i>
            <h2 className='text-sm font-medium text-gray-600 dark:text-gray-400'>
              {searchTerm
                ? t('smart_tools.search_results')
                : t('smart_tools.all_tools')}
            </h2>
            <span className='text-xs text-gray-400'>
              ({filteredTools.length})
            </span>
          </div>

          {filteredTools.length === 0 ? (
            <div className='text-center py-12'>
              <i className='fas fa-search text-5xl text-gray-300 dark:text-gray-700 mb-3'></i>
              <p className='text-gray-500 dark:text-gray-400'>
                {t('smart_tools.no_tools_found')}
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'>
              {filteredTools.map((tool) => (
                <motion.button
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTool(tool.id)}
                  className='p-4 rounded-xl text-center transition-all bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-amber-200 dark:hover:border-amber-800'
                >
                  <div
                    className={`w-12 h-12 mx-auto rounded-xl ${tool.bgColor} flex items-center justify-center mb-2 transition-transform group-hover:scale-110`}
                  >
                    <i className={`${tool.icon} ${tool.color} text-2xl`}></i>
                  </div>
                  <span className='text-sm font-medium text-gray-700 dark:text-gray-300 line-clamp-2'>
                    {tool.name}
                  </span>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Stats Footer */}
        <div className='mt-8 pt-4 border-t border-gray-100 dark:border-gray-800'>
          <div className='flex justify-between text-xs text-gray-400'>
            <span>
              {t('smart_tools.total_tools')}: {smartTools.length}
            </span>
            <span>
              <i className='fas fa-gem text-amber-500 mr-1'></i>
              {t('smart_tools.powered_by')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
