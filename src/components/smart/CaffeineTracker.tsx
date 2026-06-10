import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface CaffeineEntry {
  id: string;
  date: string;
  source: string;
  mg: number;
  time: string;
  notes?: string;
}

const getCaffeineSources = (t: (key: string) => string) => [
  { name: t('caffeine.coffee'), mg: 95 },
  { name: t('caffeine.espresso'), mg: 63 },
  { name: t('caffeine.black_tea'), mg: 47 },
  { name: t('caffeine.green_tea'), mg: 28 },
  { name: t('caffeine.soda'), mg: 34 },
  { name: t('caffeine.energy_drink'), mg: 80 },
  { name: t('caffeine.dark_chocolate'), mg: 20 },
  { name: t('caffeine.matcha'), mg: 70 },
];

export default function CaffeineTracker() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [entries, setEntries] = useState<CaffeineEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [source, setSource] = useState('');
  const [customMg, setCustomMg] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  const caffeineSources = getCaffeineSources(t);
  const RECOMMENDED_LIMIT = 400;

  useEffect(() => {
    const saved = localStorage.getItem('omni_caffeine');
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('omni_caffeine', JSON.stringify(entries));
  }, [entries]);

  const saveEntry = () => {
    if (!source) return;
    const selectedSource = caffeineSources.find((s) => s.name === source);
    const mg = customMg ? parseInt(customMg) : selectedSource?.mg || 0;
    const entry: CaffeineEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      source,
      mg,
      time:
        time ||
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      notes: notes || undefined,
    };
    setEntries([entry, ...entries]);
    resetForm();
  };

  const deleteEntry = (id: string) =>
    setEntries(entries.filter((e) => e.id !== id));

  const resetForm = () => {
    setShowForm(false);
    setSource('');
    setCustomMg('');
    setTime('');
    setNotes('');
  };

  const getTodayTotal = () => {
    const today = new Date().toISOString().split('T')[0];
    return entries
      .filter((e) => e.date === today)
      .reduce((sum, e) => sum + e.mg, 0);
  };

  const getWeeklyTotal = () => {
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const total = entries
        .filter((e) => e.date === dateStr)
        .reduce((sum, e) => sum + e.mg, 0);
      last7.push({
        date: dateStr,
        total,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      });
    }
    return last7;
  };

  const dailyTotal = getTodayTotal();
  const weeklyData = getWeeklyTotal();
  const maxTotal = Math.max(...weeklyData.map((d) => d.total), 100);
  const isOverLimit = dailyTotal > RECOMMENDED_LIMIT;

  return (
    <div className='space-y-6' dir={isRTL ? 'rtl' : 'ltr'}>
      <div className='flex justify-between items-center'>
        <h2 className='text-xl font-semibold text-gray-800 dark:text-gray-200'>
          <i className='fas fa-mug-hot mr-2 text-primary-500'></i>{' '}
          {t('caffeine.title')}
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className='px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2'
        >
          <i className='fas fa-plus'></i> {t('caffeine.log_intake')}
        </button>
      </div>

      <div
        className={`rounded-xl p-6 text-white ${
          isOverLimit
            ? 'bg-gradient-to-r from-red-500 to-orange-500'
            : 'bg-gradient-to-r from-green-500 to-teal-500'
        }`}
      >
        <p className='text-sm opacity-90'>
          <i className='fas fa-chart-line mr-1'></i>{' '}
          {t('caffeine.today_caffeine')}
        </p>
        <div className='text-5xl font-bold mt-1'>{dailyTotal} mg</div>
        <p className='text-sm opacity-80 mt-2'>
          {t('caffeine.recommended_limit')}: {RECOMMENDED_LIMIT} mg/day
        </p>
        {isOverLimit && (
          <p className='text-xs mt-2'>
            <i className='fas fa-exclamation-triangle mr-1'></i>{' '}
            {t('caffeine.exceeds_limit')}
          </p>
        )}
      </div>

      <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border'>
        <h3 className='font-medium mb-4'>
          <i className='fas fa-chart-line mr-2 text-primary-500'></i>{' '}
          {t('caffeine.weekly')}
        </h3>
        <div className='flex items-end justify-between gap-2 h-48'>
          {weeklyData.map((day) => (
            <div
              key={day.date}
              className='flex-1 flex flex-col items-center gap-2'
            >
              <div className='text-xs text-gray-400'>{day.dayName}</div>
              <div
                className='w-full bg-gray-100 dark:bg-gray-800 rounded-t-lg transition-all'
                style={{ height: `${(day.total / maxTotal) * 120}px` }}
              >
                <div
                  className='w-full bg-orange-500 rounded-t-lg transition-all'
                  style={{ height: `${(day.total / maxTotal) * 100}%` }}
                />
              </div>
              <div className='text-xs font-medium'>{day.total}mg</div>
            </div>
          ))}
        </div>
      </div>

      <div className='bg-white dark:bg-gray-900 rounded-xl shadow-sm border overflow-hidden'>
        <div className='px-6 py-4 border-b'>
          <h3 className='font-medium'>
            <i className='fas fa-history mr-2 text-primary-500'></i>{' '}
            {t('caffeine.history')}
          </h3>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase'>
                  {t('glucose.date_time')?.split(' ')[0] || 'Date'}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase'>
                  {t('caffeine.source')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase'>
                  {t('caffeine.amount_mg')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase'>
                  {t('caffeine.time')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase'></th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100 dark:divide-gray-800'>
              {entries.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className='px-6 py-8 text-center text-gray-500'
                  >
                    <i className='fas fa-mug-hot text-4xl mb-2 opacity-50'></i>
                    <p>{t('caffeine.no_entries')}</p>
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className='hover:bg-gray-50 transition'>
                    <td className='px-6 py-3 text-sm'>{entry.date}</td>
                    <td className='px-6 py-3 text-sm'>{entry.source}</td>
                    <td className='px-6 py-3 text-sm font-medium'>
                      {entry.mg} mg
                    </td>
                    <td className='px-6 py-3 text-sm text-gray-500'>
                      {entry.time}
                    </td>
                    <td className='px-6 py-3'>
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className='text-red-500 hover:text-red-700'
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

      <div className='bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border'>
        <div className='flex gap-3'>
          <i className='fas fa-info-circle text-gray-400 text-sm mt-0.5'></i>
          <div>
            <h4 className='font-medium text-sm'>{t('caffeine.tip_title')}</h4>
            <p className='text-xs text-gray-500'>{t('caffeine.tip_text')}</p>
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
              <h3 className='font-medium mb-4'>{t('caffeine.log_intake')}</h3>
              <div className='space-y-4'>
                <input
                  type='date'
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                />
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                >
                  <option value=''>{t('caffeine.select_source')}</option>
                  {caffeineSources.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name} ({s.mg}mg)
                    </option>
                  ))}
                </select>
                <input
                  type='time'
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                />
                <input
                  type='number'
                  value={customMg}
                  onChange={(e) => setCustomMg(e.target.value)}
                  placeholder={t('caffeine.custom_mg_placeholder')}
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                />
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('common.notes')}
                  rows={2}
                  className='w-full px-3 py-2 text-sm border rounded-lg resize-none'
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
