import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import HbA1cEstimator from './HbA1cEstimator';

interface GlucoseReading {
  id: string;
  timestamp: Date;
  value: number;
  type: 'fasting' | 'pre_meal' | 'post_meal' | 'bedtime';
  insulinDose?: number;
  notes?: string;
}

interface GlucoseTrackerProps {
  onBack: () => void;
}

export default function GlucoseTracker({ onBack }: GlucoseTrackerProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [readings, setReadings] = useState<GlucoseReading[]>([]);
  const [newValue, setNewValue] = useState('');
  const [newType, setNewType] = useState<GlucoseReading['type']>('fasting');
  const [newInsulin, setNewInsulin] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState({
    avg: 0,
    min: 0,
    max: 0,
    lastReading: 0,
  });

  useEffect(() => {
    const saved = localStorage.getItem('omni_glucose');
    if (saved) {
      const parsed = JSON.parse(saved);
      const withDates = parsed.map((r: any) => ({
        ...r,
        timestamp: new Date(r.timestamp),
      }));
      setReadings(withDates);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('omni_glucose', JSON.stringify(readings));
    updateStats();
  }, [readings]);

  const updateStats = () => {
    if (readings.length === 0) {
      setStats({ avg: 0, min: 0, max: 0, lastReading: 0 });
      return;
    }
    const values = readings.map((r) => r.value);
    const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const lastReading = readings[0]?.value || 0;
    setStats({ avg, min, max, lastReading });
  };

  const addReading = () => {
    if (!newValue) return;

    const reading: GlucoseReading = {
      id: Date.now().toString(),
      timestamp: new Date(),
      value: parseFloat(newValue),
      type: newType,
      insulinDose: newInsulin ? parseFloat(newInsulin) : undefined,
      notes: newNotes || undefined,
    };

    setReadings([reading, ...readings]);
    setNewValue('');
    setNewInsulin('');
    setNewNotes('');
    setShowForm(false);
  };

  const deleteReading = (id: string) => {
    setReadings(readings.filter((r) => r.id !== id));
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      fasting: t('glucose.fasting'),
      pre_meal: t('glucose.pre_meal'),
      post_meal: t('glucose.post_meal'),
      bedtime: t('glucose.bedtime'),
    };
    return labels[type] || type;
  };

  const getStatusColor = (value: number): string => {
    if (value < 70) return 'text-red-600 dark:text-red-400';
    if (value < 100) return 'text-green-600 dark:text-green-400';
    if (value < 140) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStatusText = (value: number): string => {
    if (value < 70) return `⚠️ ${t('glucose.low')}`;
    if (value < 100) return `✓ ${t('glucose.normal')}`;
    if (value < 140) return `⚠️ ${t('glucose.elevated')}`;
    return `⚠️ ${t('glucose.high')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className='space-y-6'
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className='flex items-center justify-between flex-wrap gap-4'>
        <button
          onClick={onBack}
          className='flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all'
        >
          <i className='fas fa-arrow-left text-sm'></i> {t('nav.back')}
        </button>
        <button
          onClick={() => setShowForm(!showForm)}
          className='px-4 py-1.5 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-all flex items-center gap-2 text-sm'
        >
          <i className='fas fa-plus text-xs'></i> {t('glucose.add')}
        </button>
      </div>

      {/* HbA1c Estimator */}
      <HbA1cEstimator glucoseReadings={readings} />

      {/* Stats Cards */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800'>
          <div className='text-xs text-gray-400 uppercase tracking-wide'>
            {t('glucose.last')}
          </div>
          <div className='text-3xl font-light text-gray-700 dark:text-gray-300 mt-1'>
            {stats.lastReading || '—'}
          </div>
          <div className='text-xs text-gray-400'>mg/dL</div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800'>
          <div className='text-xs text-gray-400 uppercase tracking-wide'>
            {t('glucose.average')}
          </div>
          <div className='text-3xl font-light text-gray-700 dark:text-gray-300 mt-1'>
            {stats.avg || '—'}
          </div>
          <div className='text-xs text-gray-400'>mg/dL</div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800'>
          <div className='text-xs text-gray-400 uppercase tracking-wide'>
            {t('glucose.min_max')}
          </div>
          <div className='text-2xl font-light text-gray-700 dark:text-gray-300 mt-1'>
            {stats.min} / {stats.max}
          </div>
          <div className='text-xs text-gray-400'>mg/dL</div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800'>
          <div className='text-xs text-gray-400 uppercase tracking-wide'>
            {t('glucose.target')}
          </div>
          <div className='text-xl font-light text-gray-700 dark:text-gray-300 mt-1'>
            70-140 mg/dL
          </div>
          <div className='text-xs text-gray-400'>{t('glucose.pre_meal')}</div>
        </div>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800'
          >
            <h3 className='text-lg font-medium mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200'>
              <i className='fas fa-notes-medical text-gray-500'></i>
              {t('glucose.add')}
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  {t('glucose.value')}
                </label>
                <input
                  type='number'
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  placeholder='e.g., 118'
                  autoFocus
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  {t('glucose.type')}
                </label>
                <select
                  value={newType}
                  onChange={(e) =>
                    setNewType(e.target.value as GlucoseReading['type'])
                  }
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                >
                  <option value='fasting'>{t('glucose.fasting')}</option>
                  <option value='pre_meal'>{t('glucose.pre_meal')}</option>
                  <option value='post_meal'>{t('glucose.post_meal')}</option>
                  <option value='bedtime'>{t('glucose.bedtime')}</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  {t('glucose.insulin')}
                </label>
                <input
                  type='number'
                  value={newInsulin}
                  onChange={(e) => setNewInsulin(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  placeholder='e.g., 4'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  {t('glucose.notes')}
                </label>
                <input
                  type='text'
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  placeholder={t('glucose.notes')}
                />
              </div>
            </div>
            <div className='flex justify-end gap-3 mt-6'>
              <button
                onClick={() => setShowForm(false)}
                className='px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition'
              >
                {t('glucose.cancel')}
              </button>
              <button
                onClick={addReading}
                className='px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-700 dark:hover:bg-gray-600 transition'
              >
                {t('glucose.save')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Table */}
      <div className='bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden'>
        <div className='px-6 py-4 border-b border-gray-200 dark:border-gray-800'>
          <h3 className='font-medium flex items-center gap-2 text-gray-800 dark:text-gray-200'>
            <i className='fas fa-history text-gray-500'></i>
            {t('glucose.history')}
            <span className='text-sm text-gray-400 font-normal ml-2'>
              ({readings.length} {t('glucose.entries')})
            </span>
          </h3>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50 dark:bg-gray-800/50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase'>
                  {t('glucose.date_time')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase'>
                  {t('glucose.value')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase'>
                  {t('glucose.status_label')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase'>
                  {t('glucose.type')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase'>
                  {t('glucose.insulin')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase'>
                  {t('glucose.notes')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase'></th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100 dark:divide-gray-800'>
              {readings.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className='px-6 py-8 text-center text-gray-500 dark:text-gray-400'
                  >
                    <i className='fas fa-chart-line text-4xl mb-2 opacity-50'></i>
                    <p>
                      {t('glucose.history')} {t('glucose.entries')}
                    </p>
                  </td>
                </tr>
              ) : (
                readings.map((reading) => (
                  <tr
                    key={reading.id}
                    className='hover:bg-gray-50 dark:hover:bg-gray-800/50 transition'
                  >
                    <td className='px-6 py-3 text-sm text-gray-600 dark:text-gray-400'>
                      {reading.timestamp.toLocaleDateString()}{' '}
                      {reading.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className='px-6 py-3 text-sm font-bold'>
                      <span className={getStatusColor(reading.value)}>
                        {reading.value}
                      </span>
                    </td>
                    <td className='px-6 py-3 text-sm'>
                      <span className={getStatusColor(reading.value)}>
                        {getStatusText(reading.value)}
                      </span>
                    </td>
                    <td className='px-6 py-3 text-sm'>
                      {getTypeLabel(reading.type)}
                    </td>
                    <td className='px-6 py-3 text-sm'>
                      {reading.insulinDose
                        ? `${reading.insulinDose} units`
                        : '—'}
                    </td>
                    <td className='px-6 py-3 text-sm text-gray-500'>
                      {reading.notes || '—'}
                    </td>
                    <td className='px-6 py-3 text-sm'>
                      <button
                        onClick={() => deleteReading(reading.id)}
                        className='text-red-500 hover:text-red-700 transition'
                      >
                        <i className='fas fa-trash-alt'></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tip Card */}
      <div className='bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800'>
        <div className='flex gap-3'>
          <i className='fas fa-lightbulb text-blue-600 text-xl'></i>
          <div>
            <h4 className='font-medium text-gray-800 dark:text-gray-200 mb-1'>
              {t('glucose.tip_title')}
            </h4>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              {t('glucose.tip_text')}
            </p>
            <p className='text-xs text-gray-500 mt-2'>
              <i className='fas fa-shield-alt'></i> {t('glucose.tip_consult')}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
