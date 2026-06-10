import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface IntakeEntry {
  id: string;
  date: string;
  salt_g: number;
  sugar_g: number;
  notes?: string;
}

export default function SaltSugarTracker() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [entries, setEntries] = useState<IntakeEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [salt, setSalt] = useState('');
  const [sugar, setSugar] = useState('');
  const [notes, setNotes] = useState('');

  const SALT_LIMIT = 5;
  const SUGAR_LIMIT = 25;

  useEffect(() => {
    const saved = localStorage.getItem('omni_salt_sugar');
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('omni_salt_sugar', JSON.stringify(entries));
  }, [entries]);

  const saveEntry = () => {
    if (!salt && !sugar) return;
    const entry: IntakeEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      salt_g: parseFloat(salt) || 0,
      sugar_g: parseFloat(sugar) || 0,
      notes: notes || undefined,
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
    setSalt('');
    setSugar('');
    setNotes('');
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
      last7.push({
        date: dateStr,
        salt: entry?.salt_g || 0,
        sugar: entry?.sugar_g || 0,
      });
    }
    const avgSalt = last7.reduce((sum, d) => sum + d.salt, 0) / 7;
    const avgSugar = last7.reduce((sum, d) => sum + d.sugar, 0) / 7;
    return { avgSalt: avgSalt.toFixed(1), avgSugar: avgSugar.toFixed(1) };
  };

  const weeklyAvg = getWeeklyAverage();

  const getSaltStatus = (value: number) => {
    if (value === 0)
      return { text: t('salt_sugar.not_logged'), color: 'text-gray-500' };
    if (value <= SALT_LIMIT)
      return { text: t('status.good'), color: 'text-green-600' };
    return { text: t('salt_sugar.exceeds_limit'), color: 'text-red-600' };
  };

  const getSugarStatus = (value: number) => {
    if (value === 0)
      return { text: t('salt_sugar.not_logged'), color: 'text-gray-500' };
    if (value <= SUGAR_LIMIT)
      return { text: t('status.good'), color: 'text-green-600' };
    return { text: t('salt_sugar.exceeds_limit'), color: 'text-red-600' };
  };

  return (
    <div className='space-y-6' dir={isRTL ? 'rtl' : 'ltr'}>
      <div className='flex justify-between items-center'>
        <h2 className='text-xl font-semibold text-gray-800 dark:text-gray-200'>
          <i className='fas fa-balance-scale mr-2 text-primary-500'></i>{' '}
          {t('salt_sugar.title')}
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className='px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2'
        >
          <i className='fas fa-plus'></i> {t('salt_sugar.log_today')}
        </button>
      </div>

      <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border'>
        <h3 className='font-medium text-gray-700 dark:text-gray-300 mb-4'>
          <i className='fas fa-calendar-day mr-2 text-primary-500'></i>{' '}
          {selectedDate}
        </h3>
        {getTodayEntry() ? (
          <div className='grid grid-cols-2 gap-4'>
            <div
              className={`p-4 rounded-lg text-center ${
                getTodayEntry()!.salt_g > SALT_LIMIT
                  ? 'bg-red-100 text-red-700'
                  : getTodayEntry()!.salt_g > 0
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
              }`}
            >
              <div className='text-3xl font-bold'>
                {getTodayEntry()!.salt_g}g
              </div>
              <p className='text-sm mt-1'>
                <i className='fas fa-thermometer-half mr-1'></i>{' '}
                {t('salt_sugar.salt')}
              </p>
              <p className='text-xs mt-1'>{t('salt_sugar.salt_limit')}</p>
              <p className='text-xs mt-1 font-medium'>
                {getSaltStatus(getTodayEntry()!.salt_g).text}
              </p>
            </div>
            <div
              className={`p-4 rounded-lg text-center ${
                getTodayEntry()!.sugar_g > SUGAR_LIMIT
                  ? 'bg-red-100 text-red-700'
                  : getTodayEntry()!.sugar_g > 0
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
              }`}
            >
              <div className='text-3xl font-bold'>
                {getTodayEntry()!.sugar_g}g
              </div>
              <p className='text-sm mt-1'>
                <i className='fas fa-cube mr-1'></i> {t('salt_sugar.sugar')}
              </p>
              <p className='text-xs mt-1'>{t('salt_sugar.sugar_limit')}</p>
              <p className='text-xs mt-1 font-medium'>
                {getSugarStatus(getTodayEntry()!.sugar_g).text}
              </p>
            </div>
          </div>
        ) : (
          <div className='text-center py-8 text-gray-500'>
            <i className='fas fa-balance-scale text-3xl mb-2 opacity-50'></i>
            <p>{t('salt_sugar.no_entries')}</p>
          </div>
        )}
        {getTodayEntry()?.notes && (
          <div className='text-sm text-gray-500 italic mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
            <i className='fas fa-quote-left mr-1 text-gray-400'></i>{' '}
            {getTodayEntry()!.notes}
          </div>
        )}
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border text-center'>
          <div className='text-xs text-gray-400'>
            <i className='fas fa-chart-line mr-1'></i>{' '}
            {t('salt_sugar.weekly_avg_salt')}
          </div>
          <div
            className={`text-2xl font-light mt-1 ${
              parseFloat(weeklyAvg.avgSalt) > SALT_LIMIT
                ? 'text-red-600'
                : 'text-green-600'
            }`}
          >
            {weeklyAvg.avgSalt}g
          </div>
          <div className='text-xs text-gray-500'>
            {t('salt_sugar.salt_limit')}
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border text-center'>
          <div className='text-xs text-gray-400'>
            <i className='fas fa-chart-line mr-1'></i>{' '}
            {t('salt_sugar.weekly_avg_sugar')}
          </div>
          <div
            className={`text-2xl font-light mt-1 ${
              parseFloat(weeklyAvg.avgSugar) > SUGAR_LIMIT
                ? 'text-red-600'
                : 'text-green-600'
            }`}
          >
            {weeklyAvg.avgSugar}g
          </div>
          <div className='text-xs text-gray-500'>
            {t('salt_sugar.sugar_limit')}
          </div>
        </div>
      </div>

      <div className='bg-white dark:bg-gray-900 rounded-xl shadow-sm border overflow-hidden'>
        <div className='px-6 py-4 border-b'>
          <h3 className='font-medium'>
            <i className='fas fa-history mr-2 text-primary-500'></i>{' '}
            {t('salt_sugar.intake_history')}
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
                  {t('salt_sugar.salt')} (g)
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase'>
                  {t('salt_sugar.sugar')} (g)
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase'></th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100 dark:divide-gray-800'>
              {entries.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className='px-6 py-8 text-center text-gray-500'
                  >
                    <i className='fas fa-chart-line text-4xl mb-2 opacity-50'></i>
                    <p>{t('salt_sugar.no_entries')}</p>
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className='hover:bg-gray-50 transition'>
                    <td className='px-6 py-3 text-sm'>{entry.date}</td>
                    <td className='px-6 py-3 text-sm'>
                      <span
                        className={
                          entry.salt_g > SALT_LIMIT
                            ? 'text-red-600 font-medium'
                            : entry.salt_g > 0
                              ? 'text-green-600'
                              : 'text-gray-500'
                        }
                      >
                        {entry.salt_g}g
                      </span>
                    </td>
                    <td className='px-6 py-3 text-sm'>
                      <span
                        className={
                          entry.sugar_g > SUGAR_LIMIT
                            ? 'text-red-600 font-medium'
                            : entry.sugar_g > 0
                              ? 'text-green-600'
                              : 'text-gray-500'
                        }
                      >
                        {entry.sugar_g}g
                      </span>
                    </td>
                    <td className='px-6 py-3 text-sm'>
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
            <h4 className='font-medium text-sm'>{t('salt_sugar.tip_title')}</h4>
            <p className='text-xs text-gray-500'>{t('salt_sugar.tip_text')}</p>
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
              <h3 className='font-medium mb-4'>{t('salt_sugar.log_today')}</h3>
              <div className='space-y-4'>
                <input
                  type='date'
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                />
                <div>
                  <label className='block text-xs text-gray-500 mb-1'>
                    <i className='fas fa-thermometer-half mr-1'></i>{' '}
                    {t('salt_sugar.salt')} ({t('salt_sugar.grams')})
                  </label>
                  <input
                    type='number'
                    step='0.5'
                    value={salt}
                    onChange={(e) => setSalt(e.target.value)}
                    placeholder='e.g., 4.5'
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  />
                </div>
                <div>
                  <label className='block text-xs text-gray-500 mb-1'>
                    <i className='fas fa-cube mr-1'></i> {t('salt_sugar.sugar')}{' '}
                    ({t('salt_sugar.grams')})
                  </label>
                  <input
                    type='number'
                    step='0.5'
                    value={sugar}
                    onChange={(e) => setSugar(e.target.value)}
                    placeholder='e.g., 20'
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  />
                </div>
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
