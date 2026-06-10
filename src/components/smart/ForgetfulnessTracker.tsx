import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ForgetEntry {
  id: string;
  date: string;
  incidents: number;
  description?: string;
  context?: string;
}

export default function ForgetfulnessTracker() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [entries, setEntries] = useState<ForgetEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [incidents, setIncidents] = useState('');
  const [description, setDescription] = useState('');
  const [context, setContext] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('omni_forgetfulness');
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('omni_forgetfulness', JSON.stringify(entries));
  }, [entries]);

  const saveEntry = () => {
    if (!incidents) return;
    const entry: ForgetEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      incidents: parseInt(incidents),
      description: description || undefined,
      context: context || undefined,
    };
    const existing = entries.findIndex((e) => e.date === selectedDate);
    if (existing !== -1) {
      const updated = [...entries];
      updated[existing] = entry;
      setEntries(updated);
    } else {
      setEntries([entry, ...entries]);
    }
    resetForm();
  };

  const deleteEntry = (id: string) =>
    setEntries(entries.filter((e) => e.id !== id));

  const resetForm = () => {
    setShowForm(false);
    setIncidents('');
    setDescription('');
    setContext('');
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const getTodayEntry = () => entries.find((e) => e.date === selectedDate);

  const getWeeklyAverage = () => {
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const entry = entries.find((e) => e.date === dateStr);
      last7.push(entry?.incidents || 0);
    }
    return (last7.reduce((sum, v) => sum + v, 0) / 7).toFixed(1);
  };

  const getTrend = () => {
    if (entries.length < 2) return 'stable';
    const last = entries[0].incidents;
    const prev = entries[1].incidents;
    if (last < prev) return 'improving';
    if (last > prev) return 'worsening';
    return 'stable';
  };

  const getTrendIcon = () => {
    const trend = getTrend();
    if (trend === 'improving')
      return (
        <span className='text-green-500'>
          <i className='fas fa-arrow-down'></i> {t('forgetfulness.improving')}
        </span>
      );
    if (trend === 'worsening')
      return (
        <span className='text-red-500'>
          <i className='fas fa-arrow-up'></i> {t('forgetfulness.worsening')}
        </span>
      );
    return (
      <span className='text-gray-500'>
        <i className='fas fa-minus'></i> {t('forgetfulness.stable')}
      </span>
    );
  };

  return (
    <div className='space-y-6' dir={isRTL ? 'rtl' : 'ltr'}>
      <div className='flex justify-between items-center'>
        <h2 className='text-xl font-semibold text-gray-800 dark:text-gray-200'>
          <i className='fas fa-brain mr-2 text-primary-500'></i>{' '}
          {t('forgetfulness.title')}
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className='px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2'
        >
          <i className='fas fa-plus'></i> {t('forgetfulness.log_today')}
        </button>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400'>
            {t('forgetfulness.total_incidents')}
          </div>
          <div className='text-2xl font-light mt-1'>
            {entries.reduce((sum, e) => sum + e.incidents, 0)}
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400'>
            {t('forgetfulness.weekly_avg')}
          </div>
          <div className='text-2xl font-light mt-1'>{getWeeklyAverage()}</div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400'>
            {t('forgetfulness.days_tracked')}
          </div>
          <div className='text-2xl font-light mt-1'>{entries.length}</div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400'>
            {t('forgetfulness.trend')}
          </div>
          <div className='text-sm font-medium mt-1'>{getTrendIcon()}</div>
        </div>
      </div>

      <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border'>
        <h3 className='font-medium text-gray-700 dark:text-gray-300 mb-4'>
          <i className='fas fa-calendar-day mr-2 text-primary-500'></i>{' '}
          {t('common.today')} - {selectedDate}
        </h3>
        {getTodayEntry() ? (
          <div
            className={`p-4 rounded-lg ${
              getTodayEntry()!.incidents === 0
                ? 'bg-green-100'
                : getTodayEntry()!.incidents <= 2
                  ? 'bg-yellow-100'
                  : 'bg-red-100'
            }`}
          >
            <div className='text-center'>
              <div className='text-3xl font-bold'>
                {getTodayEntry()!.incidents}
              </div>
              <p className='text-sm mt-1'>{t('forgetfulness.memory_lapses')}</p>
            </div>
            {getTodayEntry()!.description && (
              <p className='text-sm mt-3 text-gray-600'>
                <i className='fas fa-pen mr-1'></i>{' '}
                {getTodayEntry()!.description}
              </p>
            )}
            {getTodayEntry()!.context && (
              <p className='text-xs text-gray-500 mt-2'>
                <i className='fas fa-tag mr-1'></i> {t('forgetfulness.context')}
                : {getTodayEntry()!.context}
              </p>
            )}
          </div>
        ) : (
          <div className='text-center py-8 text-gray-500'>
            <i className='fas fa-brain text-3xl mb-2 opacity-50'></i>
            <p>{t('forgetfulness.no_entries')}</p>
          </div>
        )}
      </div>

      <div className='bg-white dark:bg-gray-900 rounded-xl shadow-sm border overflow-hidden'>
        <div className='px-6 py-4 border-b'>
          <h3 className='font-medium'>
            <i className='fas fa-history mr-2 text-primary-500'></i>{' '}
            {t('forgetfulness.history')}
          </h3>
        </div>
        <div className='divide-y divide-gray-100 dark:divide-gray-800'>
          {entries.length === 0 ? (
            <div className='px-6 py-8 text-center text-gray-500'>
              <i className='fas fa-calendar-alt text-4xl mb-2 opacity-50'></i>
              <p>{t('forgetfulness.no_entries')}</p>
            </div>
          ) : (
            entries.slice(0, 20).map((entry) => (
              <div
                key={entry.id}
                className='px-6 py-3 flex justify-between items-center hover:bg-gray-50 transition'
              >
                <div>
                  <div className='font-medium'>{entry.date}</div>
                  <div className='text-sm text-gray-500'>
                    {entry.incidents} {t('forgetfulness.memory_lapses')}
                    {entry.description &&
                      ` • ${entry.description.substring(0, 50)}`}
                  </div>
                </div>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className='text-red-500 hover:text-red-700'
                >
                  <i className='fas fa-trash-alt'></i>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className='bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border'>
        <div className='flex gap-3'>
          <i className='fas fa-info-circle text-gray-400 text-sm mt-0.5'></i>
          <div>
            <h4 className='font-medium text-sm'>
              {t('forgetfulness.tip_title')}
            </h4>
            <p className='text-xs text-gray-500'>
              {t('forgetfulness.tip_text')}
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
            onClick={resetForm}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className='bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md'
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className='font-medium mb-4'>
                {t('forgetfulness.log_today')} - {selectedDate}
              </h3>
              <div className='space-y-4'>
                <input
                  type='date'
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                />
                <input
                  type='number'
                  value={incidents}
                  onChange={(e) => setIncidents(e.target.value)}
                  placeholder={t('forgetfulness.incidents_placeholder')}
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                />
                <input
                  type='text'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('forgetfulness.what_forgotten')}
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                />
                <input
                  type='text'
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder={t('forgetfulness.context_placeholder')}
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                />
              </div>
              <div className='flex gap-3 mt-6'>
                <button
                  onClick={resetForm}
                  className='flex-1 px-4 py-2 border rounded-lg text-sm'
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={saveEntry}
                  className='flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm'
                >
                  {t('common.save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
