import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  suggestion: string;
  dismissed: boolean;
  createdAt: string;
}

export default function SmartAlerts() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkHealthData = () => {
    const newAlerts: Alert[] = [];
    const now = new Date();
    setLastCheck(now);

    // Check glucose
    const glucoseData = JSON.parse(
      localStorage.getItem('omni_glucose') || '[]',
    );
    if (glucoseData.length > 0) {
      const lastGlucose = glucoseData[0].value;
      if (lastGlucose > 180) {
        newAlerts.push({
          id: Date.now().toString(),
          type: 'critical',
          title: t('alerts.high_glucose'),
          message: t('alerts.high_glucose_msg', { value: lastGlucose }),
          suggestion: t('alerts.high_glucose_suggestion'),
          dismissed: false,
          createdAt: new Date().toISOString(),
        });
      } else if (lastGlucose < 70) {
        newAlerts.push({
          id: Date.now().toString(),
          type: 'critical',
          title: t('alerts.low_glucose'),
          message: t('alerts.low_glucose_msg', { value: lastGlucose }),
          suggestion: t('alerts.low_glucose_suggestion'),
          dismissed: false,
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Check water intake
    const waterData = JSON.parse(localStorage.getItem('omni_water') || '[]');
    const today = new Date().toISOString().split('T')[0];
    const todayWater = waterData
      .filter((w: any) => w.date === today)
      .reduce((sum: number, w: any) => sum + w.amount, 0);
    if (todayWater < 1000 && todayWater > 0) {
      newAlerts.push({
        id: Date.now().toString(),
        type: 'warning',
        title: t('alerts.low_water'),
        message: t('alerts.low_water_msg', { value: todayWater }),
        suggestion: t('alerts.low_water_suggestion'),
        dismissed: false,
        createdAt: new Date().toISOString(),
      });
    }

    // Check activity
    const activityData = JSON.parse(
      localStorage.getItem('omni_activity') || '[]',
    );
    const lastWeekActivity = activityData.filter((a: any) => {
      const date = new Date(a.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo;
    });
    if (lastWeekActivity.length === 0) {
      newAlerts.push({
        id: Date.now().toString(),
        type: 'warning',
        title: t('alerts.no_activity'),
        message: t('alerts.no_activity_msg'),
        suggestion: t('alerts.no_activity_suggestion'),
        dismissed: false,
        createdAt: new Date().toISOString(),
      });
    }

    // Check sleep
    const sleepData = JSON.parse(localStorage.getItem('omni_sleep') || '[]');
    if (sleepData.length > 0) {
      const lastSleep = sleepData[0];
      if (lastSleep.duration < 6) {
        newAlerts.push({
          id: Date.now().toString(),
          type: 'warning',
          title: t('alerts.poor_sleep'),
          message: t('alerts.poor_sleep_msg', { value: lastSleep.duration }),
          suggestion: t('alerts.poor_sleep_suggestion'),
          dismissed: false,
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Check blood pressure
    const bpData = JSON.parse(localStorage.getItem('omni_bp') || '[]');
    if (bpData.length > 0) {
      const lastBP = bpData[0];
      if (lastBP.systolic >= 140 || lastBP.diastolic >= 90) {
        newAlerts.push({
          id: Date.now().toString(),
          type: 'warning',
          title: 'High Blood Pressure',
          message: `Your BP is ${lastBP.systolic}/${lastBP.diastolic} mmHg`,
          suggestion:
            'Monitor your BP regularly and consult your doctor if consistently high.',
          dismissed: false,
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Combine with existing non-dismissed alerts
    const existingAlerts = alerts.filter((a) => !a.dismissed);
    setAlerts([...newAlerts, ...existingAlerts]);
  };

  useEffect(() => {
    checkHealthData();
    const interval = setInterval(checkHealthData, 3600000); // Check every hour
    return () => clearInterval(interval);
  }, []);

  const dismissAlert = (id: string) => {
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, dismissed: true } : a)));
  };

  const dismissAll = () => {
    setAlerts(alerts.map((a) => ({ ...a, dismissed: true })));
  };

  const activeAlerts = alerts.filter((a) => !a.dismissed);
  const criticalAlerts = activeAlerts.filter((a) => a.type === 'critical');
  const warningAlerts = activeAlerts.filter((a) => a.type === 'warning');
  const infoAlerts = activeAlerts.filter((a) => a.type === 'info');

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return 'fas fa-exclamation-triangle';
      case 'warning':
        return 'fas fa-exclamation-circle';
      default:
        return 'fas fa-info-circle';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'from-red-500 to-rose-500';
      case 'warning':
        return 'from-yellow-500 to-amber-500';
      default:
        return 'from-blue-500 to-cyan-500';
    }
  };

  const getAlertBg = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div className='space-y-6' dir={isRTL ? 'rtl' : 'ltr'}>
      <div className='flex justify-between items-center'>
        <h2 className='text-xl font-semibold text-gray-800 dark:text-gray-200'>
          <i className='fas fa-bell mr-2 text-primary-500'></i>{' '}
          {t('alerts.title')}
        </h2>
        <div className='flex gap-2'>
          {activeAlerts.length > 0 && (
            <button
              onClick={dismissAll}
              className='px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition flex items-center gap-1'
            >
              <i className='fas fa-check-double'></i> Dismiss All
            </button>
          )}
          <button
            onClick={checkHealthData}
            className='px-3 py-1.5 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition flex items-center gap-1'
          >
            <i className='fas fa-sync-alt'></i> {t('alerts.refresh')}
          </button>
        </div>
      </div>

      {activeAlerts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className='bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl p-12 text-center border border-green-200 dark:border-green-800'
        >
          <div className='w-20 h-20 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4'>
            <i className='fas fa-check-circle text-4xl text-green-500'></i>
          </div>
          <h3 className='text-xl font-semibold text-green-700 dark:text-green-300 mb-2'>
            {t('alerts.all_clear')}
          </h3>
          <p className='text-gray-600 dark:text-gray-400'>
            {t('alerts.all_clear_text')}
          </p>
          {lastCheck && (
            <p className='text-xs text-gray-400 mt-4'>
              <i className='far fa-clock mr-1'></i> Last checked:{' '}
              {lastCheck.toLocaleTimeString()}
            </p>
          )}
        </motion.div>
      ) : (
        <div className='space-y-4'>
          {/* Critical Alerts */}
          {criticalAlerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`rounded-xl p-5 border-2 ${getAlertBg(alert.type)} relative overflow-hidden`}
            >
              <div
                className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${getAlertColor(alert.type)}`}
              ></div>
              <div className='flex justify-between items-start'>
                <div className='flex gap-3 flex-1'>
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAlertColor(alert.type)} flex items-center justify-center text-white shadow-lg`}
                  >
                    <i className={getAlertIcon(alert.type)}></i>
                  </div>
                  <div className='flex-1'>
                    <h3 className='font-semibold text-gray-800 dark:text-gray-200'>
                      {alert.title}
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                      {alert.message}
                    </p>
                    <div className='mt-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg flex items-start gap-2'>
                      <i className='fas fa-lightbulb text-yellow-500 text-sm mt-0.5'></i>
                      <p className='text-sm text-gray-700 dark:text-gray-300'>
                        {alert.suggestion}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition p-1'
                >
                  <i className='fas fa-times'></i>
                </button>
              </div>
            </motion.div>
          ))}

          {/* Warning Alerts */}
          {warningAlerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`rounded-xl p-5 border ${getAlertBg(alert.type)} relative overflow-hidden`}
            >
              <div className='flex justify-between items-start'>
                <div className='flex gap-3 flex-1'>
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAlertColor(alert.type)} flex items-center justify-center text-white shadow-lg`}
                  >
                    <i className={getAlertIcon(alert.type)}></i>
                  </div>
                  <div className='flex-1'>
                    <h3 className='font-semibold text-gray-800 dark:text-gray-200'>
                      {alert.title}
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                      {alert.message}
                    </p>
                    <div className='mt-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg flex items-start gap-2'>
                      <i className='fas fa-lightbulb text-yellow-500 text-sm mt-0.5'></i>
                      <p className='text-sm text-gray-700 dark:text-gray-300'>
                        {alert.suggestion}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition p-1'
                >
                  <i className='fas fa-times'></i>
                </button>
              </div>
            </motion.div>
          ))}

          {/* Info Alerts */}
          {infoAlerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`rounded-xl p-5 border ${getAlertBg(alert.type)} relative overflow-hidden`}
            >
              <div className='flex justify-between items-start'>
                <div className='flex gap-3 flex-1'>
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAlertColor(alert.type)} flex items-center justify-center text-white shadow-lg`}
                  >
                    <i className={getAlertIcon(alert.type)}></i>
                  </div>
                  <div className='flex-1'>
                    <h3 className='font-semibold text-gray-800 dark:text-gray-200'>
                      {alert.title}
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                      {alert.message}
                    </p>
                    <div className='mt-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg flex items-start gap-2'>
                      <i className='fas fa-lightbulb text-yellow-500 text-sm mt-0.5'></i>
                      <p className='text-sm text-gray-700 dark:text-gray-300'>
                        {alert.suggestion}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition p-1'
                >
                  <i className='fas fa-times'></i>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Summary Card */}
      {activeAlerts.length > 0 && (
        <div className='bg-gray-100 dark:bg-gray-800 rounded-xl p-4'>
          <div className='flex justify-between items-center text-sm'>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 rounded-full bg-red-500'></div>
                <span className='text-gray-600 dark:text-gray-400'>
                  {criticalAlerts.length} {t('alerts.critical_count')}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 rounded-full bg-yellow-500'></div>
                <span className='text-gray-600 dark:text-gray-400'>
                  {warningAlerts.length} {t('alerts.warnings_count')}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 rounded-full bg-blue-500'></div>
                <span className='text-gray-600 dark:text-gray-400'>
                  {infoAlerts.length} {t('alerts.info_count')}
                </span>
              </div>
            </div>
            {lastCheck && (
              <span className='text-xs text-gray-400'>
                <i className='far fa-clock mr-1'></i> {t('alerts.updated')}:{' '}
                {lastCheck.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
