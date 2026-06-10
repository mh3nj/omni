import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface InjectionSite {
  id: string;
  name: string;
  area: 'abdomen' | 'arm' | 'thigh';
  side: 'left' | 'right';
  lastUsed: string | null;
  usageCount: number;
}

export default function InsulinRotator() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [sites, setSites] = useState<InjectionSite[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);

  // Initialize sites after translation is loaded
  useEffect(() => {
    setSites([
      {
        id: 'abdomen-left',
        name: t('insulin.abdomen_left'),
        area: 'abdomen',
        side: 'left',
        lastUsed: null,
        usageCount: 0,
      },
      {
        id: 'abdomen-right',
        name: t('insulin.abdomen_right'),
        area: 'abdomen',
        side: 'right',
        lastUsed: null,
        usageCount: 0,
      },
      {
        id: 'arm-left',
        name: t('insulin.arm_left'),
        area: 'arm',
        side: 'left',
        lastUsed: null,
        usageCount: 0,
      },
      {
        id: 'arm-right',
        name: t('insulin.arm_right'),
        area: 'arm',
        side: 'right',
        lastUsed: null,
        usageCount: 0,
      },
      {
        id: 'thigh-left',
        name: t('insulin.thigh_left'),
        area: 'thigh',
        side: 'left',
        lastUsed: null,
        usageCount: 0,
      },
      {
        id: 'thigh-right',
        name: t('insulin.thigh_right'),
        area: 'thigh',
        side: 'right',
        lastUsed: null,
        usageCount: 0,
      },
    ]);
  }, [t]);

  // Load saved data
  useEffect(() => {
    const saved = localStorage.getItem('omni_insulin_sites');
    if (saved && sites.length > 0) {
      const parsed = JSON.parse(saved);
      // Merge saved data with current sites
      const merged = sites.map((site) => {
        const savedSite = parsed.find((s: InjectionSite) => s.id === site.id);
        return savedSite || site;
      });
      setSites(merged);
    }
  }, [sites.length]); // Only run when sites are initialized

  // Save to localStorage whenever sites change
  useEffect(() => {
    if (sites.length > 0) {
      localStorage.setItem('omni_insulin_sites', JSON.stringify(sites));
    }
  }, [sites]);

  const logInjection = (siteId: string) => {
    setSites(
      sites.map((site) =>
        site.id === siteId
          ? {
              ...site,
              lastUsed: new Date().toISOString(),
              usageCount: site.usageCount + 1,
            }
          : site,
      ),
    );
    setShowLogModal(false);
    setSelectedSite(null);
  };

  const getRecommendedSite = () => {
    if (sites.length === 0) return null;
    const unusedSites = sites.filter((s) => s.lastUsed === null);
    if (unusedSites.length > 0) return unusedSites[0];
    const sortedByDate = [...sites].sort((a, b) => {
      if (!a.lastUsed) return -1;
      if (!b.lastUsed) return 1;
      return new Date(a.lastUsed).getTime() - new Date(b.lastUsed).getTime();
    });
    return sortedByDate[0];
  };

  const getDaysSince = (date: string | null) => {
    if (!date) return t('insulin.never_used');
    const days = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24),
    );
    if (days === 0) return t('insulin.today');
    if (days === 1) return `1 ${t('insulin.day_ago')}`;
    return `${days} ${t('insulin.days_ago')}`;
  };

  const getUsagePercentage = (count: number) => {
    const maxCount = Math.max(...sites.map((s) => s.usageCount), 1);
    return (count / maxCount) * 100;
  };

  const recommended = getRecommendedSite();

  if (sites.length === 0) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-pulse text-gray-500'>{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className='space-y-6' dir={isRTL ? 'rtl' : 'ltr'}>
      <div className='flex justify-between items-center'>
        <h2 className='text-xl font-semibold text-gray-800 dark:text-gray-200'>
          <i className='fas fa-syringe mr-2 text-primary-500'></i>{' '}
          {t('insulin.title')}
        </h2>
      </div>

      {/* Recommendation Card */}
      {recommended && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden'
        >
          <div className='absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3'></div>
          <div className='absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4'></div>

          <div className='relative z-10'>
            <p className='text-sm opacity-90'>
              <i className='fas fa-star mr-1'></i> {t('insulin.recommended')}
            </p>
            <h3 className='text-2xl font-bold mt-1 flex items-center gap-2'>
              {recommended.area === 'abdomen' && (
                <i className='fas fa-stethoscope'></i>
              )}
              {recommended.area === 'arm' && (
                <i className='fas fa-hand-peace'></i>
              )}
              {recommended.area === 'thigh' && (
                <i className='fas fa-walking'></i>
              )}
              {recommended.name}
            </h3>
            <p className='text-sm opacity-80 mt-2'>
              <i className='fas fa-clock mr-1'></i> {t('insulin.last_used')}:{' '}
              {getDaysSince(recommended.lastUsed)}
            </p>
            <button
              onClick={() => {
                setSelectedSite(recommended.id);
                setShowLogModal(true);
              }}
              className='mt-4 px-6 py-2 bg-white text-gray-800 rounded-xl hover:bg-gray-100 transition flex items-center gap-2 shadow-lg'
            >
              <i className='fas fa-syringe'></i> {t('insulin.log_injection')}
            </button>
          </div>
        </motion.div>
      )}

      {/* Injection Sites Diagram */}
      <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800'>
        <h3 className='font-medium text-gray-800 dark:text-gray-200 mb-4 text-center'>
          <i className='fas fa-map-marker-alt mr-2 text-primary-500'></i>{' '}
          {t('insulin.injection_sites')}
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {['abdomen', 'arm', 'thigh'].map((area) => (
            <div key={area} className='text-center'>
              <div className='bg-gray-50 dark:bg-gray-800 rounded-xl p-4 hover:shadow-md transition'>
                <div className='mb-3'>
                  <div className='w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center'>
                    <i
                      className={`fas ${
                        area === 'abdomen'
                          ? 'fa-stethoscope'
                          : area === 'arm'
                            ? 'fa-hand-peace'
                            : 'fa-walking'
                      } text-2xl text-primary-500`}
                    ></i>
                  </div>
                  <h4 className='font-medium capitalize mt-2'>
                    {area === 'abdomen'
                      ? t('insulin.abdomen')
                      : area === 'arm'
                        ? t('insulin.arm')
                        : t('insulin.thigh')}
                  </h4>
                </div>
                <div className='grid grid-cols-2 gap-2'>
                  {sites
                    .filter((s) => s.area === area)
                    .map((site) => (
                      <button
                        key={site.id}
                        onClick={() => {
                          setSelectedSite(site.id);
                          setShowLogModal(true);
                        }}
                        className={`p-3 rounded-xl text-sm transition-all ${
                          site.lastUsed &&
                          new Date(site.lastUsed).toDateString() ===
                            new Date().toDateString()
                            ? 'bg-green-500 text-white shadow-md'
                            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        <div className='flex items-center justify-center gap-1'>
                          {site.side === 'left' ? (
                            <>
                              <i className='fas fa-arrow-left text-xs'></i>{' '}
                              {t('insulin.left')}
                            </>
                          ) : (
                            <>
                              {t('insulin.right')}{' '}
                              <i className='fas fa-arrow-right text-xs'></i>
                            </>
                          )}
                        </div>
                        <div className='text-xs mt-1 opacity-75'>
                          {getDaysSince(site.lastUsed)}
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Statistics */}
      <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800'>
        <h3 className='font-medium text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2'>
          <i className='fas fa-chart-bar text-primary-500'></i>{' '}
          {t('insulin.usage_stats')}
        </h3>
        <div className='space-y-3'>
          {sites.map((site) => (
            <div key={site.id} className='flex items-center gap-3'>
              <div className='w-24 text-sm text-gray-600 dark:text-gray-400'>
                {site.name}
              </div>
              <div className='flex-1'>
                <div className='h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${getUsagePercentage(site.usageCount)}%`,
                    }}
                    transition={{ duration: 0.5 }}
                    className='h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full'
                  />
                </div>
              </div>
              <div className='w-16 text-sm text-gray-500 text-right'>
                {site.usageCount} {t('insulin.uses')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tip Card */}
      <div className='bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl p-4 border border-amber-200 dark:border-amber-800'>
        <div className='flex gap-3'>
          <i className='fas fa-lightbulb text-amber-500 text-lg mt-0.5'></i>
          <div>
            <h4 className='font-medium text-sm text-gray-800 dark:text-gray-200'>
              <i className='fas fa-syringe mr-1'></i> {t('insulin.tip_title')}
            </h4>
            <p className='text-xs text-gray-600 dark:text-gray-400 mt-1'>
              {t('insulin.tip_text')}
            </p>
          </div>
        </div>
      </div>

      {/* Log Injection Modal */}
      <AnimatePresence>
        {showLogModal && selectedSite && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
            onClick={() => setShowLogModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className='bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl'
              onClick={(e) => e.stopPropagation()}
            >
              <div className='text-center mb-4'>
                <div className='w-16 h-16 mx-auto rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-3'>
                  <i className='fas fa-syringe text-2xl text-primary-500'></i>
                </div>
                <h3 className='font-semibold text-gray-800 dark:text-gray-200'>
                  {t('insulin.log_injection')}
                </h3>
                <p className='text-sm text-gray-500 mt-1'>
                  {t('insulin.record_injection')}{' '}
                  <strong>
                    {sites.find((s) => s.id === selectedSite)?.name}
                  </strong>
                  ?
                </p>
              </div>
              <div className='flex gap-3 mt-4'>
                <button
                  onClick={() => setShowLogModal(false)}
                  className='flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition'
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={() => logInjection(selectedSite)}
                  className='flex-1 px-4 py-2 bg-primary-500 text-white rounded-xl text-sm hover:bg-primary-600 transition flex items-center justify-center gap-2'
                >
                  <i className='fas fa-check-circle'></i> {t('common.save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
