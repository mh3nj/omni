import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface WaterEntry {
  id: string;
  date: string;
  amount: number;
  timestamp: string;
}

const DAILY_GOAL = 2000;
const GLASS_SIZE = 250;

interface WaterTrackerProps {
  onBack: () => void;
}

export default function WaterTracker({ onBack }: WaterTrackerProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [entries, setEntries] = useState<WaterEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('omni_water');
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('omni_water', JSON.stringify(entries));
  }, [entries]);

  const getTodayTotal = (): number => {
    const today = new Date().toISOString().split('T')[0];
    return entries
      .filter((e) => e.date === today)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const getTotalForDate = (date: string): number => {
    return entries
      .filter((e) => e.date === date)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const addWater = (amount: number) => {
    const newEntry: WaterEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      amount,
      timestamp: new Date().toLocaleTimeString(),
    };
    setEntries([...entries, newEntry]);
  };

  const addCustomAmount = () => {
    const amount = parseInt(customAmount);
    if (!isNaN(amount) && amount > 0) {
      addWater(amount);
      setCustomAmount('');
      setShowAddModal(false);
    }
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  const todayTotal = getTodayTotal();
  const progressPercent = Math.min((todayTotal / DAILY_GOAL) * 100, 100);
  const isGoalMet = todayTotal >= DAILY_GOAL;

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const total = getTotalForDate(dateStr);
      days.push({
        date: dateStr,
        total,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      });
    }
    return days;
  };

  const weeklyData = getLast7Days();
  const maxWeekly = Math.max(...weeklyData.map((d) => d.total), 500);

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
        <div className='flex items-center gap-3'>
          <input
            type='date'
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className='px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300'
          />
          <button
            onClick={() => setShowAddModal(true)}
            className='px-4 py-1.5 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-all flex items-center gap-2 text-sm'
          >
            <i className='fas fa-plus text-xs'></i> {t('water.add')}
          </button>
        </div>
      </div>

      {/* Today's Progress Circle */}
      <div className='bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800'>
        <h3 className='font-medium text-gray-700 dark:text-gray-300 mb-6 flex items-center gap-2'>
          <i className='fas fa-tint text-blue-500'></i>
          {t('water.today')}
        </h3>

        <div className='flex flex-col md:flex-row items-center justify-between gap-8'>
          <div className='relative w-40 h-40'>
            <svg className='w-full h-full transform -rotate-90'>
              <circle
                cx='80'
                cy='80'
                r='70'
                stroke='#e5e7eb'
                strokeWidth='12'
                fill='none'
                className='dark:stroke-gray-800'
              />
              <circle
                cx='80'
                cy='80'
                r='70'
                stroke={isGoalMet ? '#22c55e' : '#3b82f6'}
                strokeWidth='12'
                fill='none'
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - progressPercent / 100)}`}
                className='transition-all duration-500'
              />
            </svg>
            <div className='absolute inset-0 flex flex-col items-center justify-center'>
              <span className='text-3xl font-light text-gray-800 dark:text-gray-200'>
                {todayTotal}
              </span>
              <span className='text-xs text-gray-400'>{t('water.ml')}</span>
              <span className='text-xs text-gray-400 mt-1'>
                / {DAILY_GOAL} {t('water.ml')}
              </span>
            </div>
          </div>

          <div className='flex-1'>
            <p className='text-sm text-gray-500 dark:text-gray-400 mb-3'>
              {t('water.quick_add')}
            </p>
            <div className='flex flex-wrap gap-2'>
              <button
                onClick={() => addWater(GLASS_SIZE)}
                className='px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition'
              >
                <i className='fas fa-glass-water mr-2'></i> 1 {t('water.glass')}{' '}
                (250{t('water.ml')})
              </button>
              <button
                onClick={() => addWater(GLASS_SIZE * 2)}
                className='px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition'
              >
                <i className='fas fa-glass-water mr-2'></i> 2{' '}
                {t('water.glasses')} (500{t('water.ml')})
              </button>
              <button
                onClick={() => addWater(500)}
                className='px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition'
              >
                <i className='fas fa-bottle-water mr-2'></i> {t('water.bottle')}
              </button>
            </div>
            {isGoalMet && (
              <div className='mt-4 text-sm text-green-600 dark:text-green-400 flex items-center gap-2'>
                <i className='fas fa-check-circle'></i>{' '}
                {t('water.goal_achieved')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Bar Chart */}
      <div className='bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800'>
        <h3 className='font-medium text-gray-700 dark:text-gray-300 mb-6 flex items-center gap-2'>
          <i className='fas fa-chart-simple'></i>
          {t('water.weekly')}
        </h3>
        <div className='flex items-end justify-between gap-2 h-48'>
          {weeklyData.map((day) => (
            <div
              key={day.date}
              className='flex-1 flex flex-col items-center gap-2'
            >
              <div className='text-xs text-gray-400'>{day.dayName}</div>
              <div
                className='w-full bg-blue-500/20 dark:bg-blue-500/10 rounded-t-lg transition-all duration-300'
                style={{ height: `${(day.total / maxWeekly) * 120}px` }}
              >
                <div
                  className='w-full bg-blue-500 rounded-t-lg transition-all duration-300'
                  style={{ height: `${(day.total / maxWeekly) * 100}%` }}
                />
              </div>
              <div className='text-xs font-medium text-gray-600 dark:text-gray-400'>
                {Math.round(day.total / 1000)}L
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* History Table */}
      <div className='bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden'>
        <div className='px-6 py-4 border-b border-gray-100 dark:border-gray-800'>
          <h3 className='font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300'>
            <i className='fas fa-history text-gray-400 text-sm'></i>
            {t('water.history')}
            <span className='text-xs text-gray-400 font-normal ml-2'>
              ({entries.length} {t('water.glasses')})
            </span>
          </h3>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50 dark:bg-gray-800/50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase'>
                  {t('glucose.date_time')?.split(' ')[0] || 'Date'}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase'>
                  {t('water.amount')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase'>
                  {t('water.time')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase'></th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-50 dark:divide-gray-800'>
              {entries.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className='px-6 py-8 text-center text-gray-400 text-sm'
                  >
                    <i className='fas fa-tint text-2xl mb-2 opacity-50'></i>
                    <p>{t('water.history')}</p>
                  </td>
                </tr>
              ) : (
                [...entries].reverse().map((entry) => (
                  <tr
                    key={entry.id}
                    className='hover:bg-gray-50 dark:hover:bg-gray-800/50 transition'
                  >
                    <td className='px-6 py-3 text-sm text-gray-600 dark:text-gray-400'>
                      {entry.date}
                    </td>
                    <td className='px-6 py-3 text-sm font-medium text-gray-800 dark:text-gray-200'>
                      {entry.amount} {t('water.ml')}
                    </td>
                    <td className='px-6 py-3 text-sm text-gray-500'>
                      {entry.timestamp}
                    </td>
                    <td className='px-6 py-3 text-sm'>
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className='text-gray-400 hover:text-red-500 transition'
                      >
                        <i className='fas fa-trash-alt text-xs'></i>
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
      <div className='bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800'>
        <div className='flex gap-3'>
          <i className='fas fa-lightbulb text-gray-400 text-sm mt-0.5'></i>
          <div>
            <h4 className='font-medium text-sm text-gray-700 dark:text-gray-300 mb-1'>
              {t('water.tip_title')}
            </h4>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              {t('water.tip_text')}
            </p>
          </div>
        </div>
      </div>

      {/* Add Custom Amount Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className='bg-white dark:bg-gray-900 rounded-2xl p-6 w-80 shadow-xl'
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className='font-medium text-gray-800 dark:text-gray-200 mb-4'>
                {t('water.custom_amount')}
              </h3>
              <input
                type='number'
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder={`${t('water.amount')} (${t('water.ml')})`}
                className='w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 mb-4'
                autoFocus
              />
              <div className='flex gap-3'>
                <button
                  onClick={() => setShowAddModal(false)}
                  className='flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition'
                >
                  {t('glucose.cancel')}
                </button>
                <button
                  onClick={addCustomAmount}
                  className='flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition'
                >
                  {t('water.add')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
