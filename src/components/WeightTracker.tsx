import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  height: number;
  bmi: number;
  bodyFat?: number;
  waist?: number;
  hip?: number;
  muscle?: number;
  notes?: string;
}

interface WeightTrackerProps {
  onBack: () => void;
}

export default function WeightTracker({ onBack }: WeightTrackerProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [userHeight, setUserHeight] = useState(170);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');
  const [muscle, setMuscle] = useState('');
  const [notes, setNotes] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'chart' | 'table'>('chart');

  useEffect(() => {
    const saved = localStorage.getItem('omni_weight');
    if (saved) {
      setEntries(JSON.parse(saved));
    }
    const savedHeight = localStorage.getItem('omni_user_height');
    if (savedHeight) {
      setUserHeight(parseInt(savedHeight));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('omni_weight', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('omni_user_height', userHeight.toString());
  }, [userHeight]);

  const calculateBMI = (weightKg: number, heightCm: number): number => {
    const heightM = heightCm / 100;
    return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
  };

  const getBMICategory = (
    bmi: number,
  ): { text: string; color: string; emoji: string } => {
    if (bmi < 18.5)
      return {
        text: t('weight.underweight'),
        color: 'text-blue-600 dark:text-blue-400',
        emoji: '📉',
      };
    if (bmi < 25)
      return {
        text: t('weight.normal'),
        color: 'text-green-600 dark:text-green-400',
        emoji: '✅',
      };
    if (bmi < 30)
      return {
        text: t('weight.overweight'),
        color: 'text-yellow-600 dark:text-yellow-400',
        emoji: '⚠️',
      };
    return {
      text: t('weight.obese'),
      color: 'text-red-600 dark:text-red-400',
      emoji: '⚠️⚠️',
    };
  };

  const saveEntry = () => {
    if (!weight) return;

    const weightNum = parseFloat(weight);
    const bmi = calculateBMI(weightNum, userHeight);

    const entry: WeightEntry = {
      id: editingId || Date.now().toString(),
      date: selectedDate,
      weight: weightNum,
      height: userHeight,
      bmi,
      bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
      waist: waist ? parseFloat(waist) : undefined,
      hip: hip ? parseFloat(hip) : undefined,
      muscle: muscle ? parseFloat(muscle) : undefined,
      notes: notes || undefined,
    };

    if (editingId) {
      setEntries(entries.map((e) => (e.id === editingId ? entry : e)));
    } else {
      const filtered = entries.filter((e) => e.date !== selectedDate);
      setEntries([entry, ...filtered]);
    }

    resetForm();
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  const editEntry = (entry: WeightEntry) => {
    setEditingId(entry.id);
    setSelectedDate(entry.date);
    setWeight(entry.weight.toString());
    setBodyFat(entry.bodyFat?.toString() || '');
    setWaist(entry.waist?.toString() || '');
    setHip(entry.hip?.toString() || '');
    setMuscle(entry.muscle?.toString() || '');
    setNotes(entry.notes || '');
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setWeight('');
    setBodyFat('');
    setWaist('');
    setHip('');
    setMuscle('');
    setNotes('');
    setShowForm(false);
  };

  const getLast30DaysEntries = () => {
    const last30 = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const entry = entries.find((e) => e.date === dateStr);
      last30.push({
        date: dateStr,
        entry,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      });
    }
    return last30;
  };

  const weeklyData = getLast30DaysEntries();
  const latestEntry = entries.length > 0 ? entries[0] : null;
  const weightChange =
    entries.length >= 2
      ? (entries[0].weight - entries[entries.length - 1].weight).toFixed(1)
      : null;
  const totalLost =
    weightChange && parseFloat(weightChange) < 0
      ? Math.abs(parseFloat(weightChange))
      : null;
  const totalGained =
    weightChange && parseFloat(weightChange) > 0
      ? parseFloat(weightChange)
      : null;
  const bmiCategory = latestEntry ? getBMICategory(latestEntry.bmi) : null;
  const maxWeight = Math.max(...entries.map((e) => e.weight), 1);
  const minWeight = Math.min(...entries.map((e) => e.weight), maxWeight);

  const healthyMinWeight = (
    18.5 *
    ((userHeight / 100) * (userHeight / 100))
  ).toFixed(1);
  const healthyMaxWeight = (
    24.9 *
    ((userHeight / 100) * (userHeight / 100))
  ).toFixed(1);

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
            className='px-3 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-900'
          />
          <button
            onClick={() => setShowForm(true)}
            className='px-4 py-1.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all flex items-center gap-2 text-sm'
          >
            <i className='fas fa-plus text-xs'></i> {t('weight.add')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('weight.current_weight')}
          </div>
          <div className='text-2xl font-light text-gray-700 dark:text-gray-300 mt-1'>
            {latestEntry ? `${latestEntry.weight} kg` : '—'}
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('weight.bmi')}
          </div>
          <div
            className={`text-2xl font-light mt-1 ${bmiCategory?.color || 'text-gray-700'}`}
          >
            {latestEntry ? latestEntry.bmi : '—'}
          </div>
          <div className='text-xs text-gray-400'>{bmiCategory?.text || ''}</div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('weight.total_change')}
          </div>
          <div
            className={`text-2xl font-light mt-1 ${totalLost ? 'text-green-600' : totalGained ? 'text-red-600' : 'text-gray-500'}`}
          >
            {totalLost
              ? `-${totalLost} kg`
              : totalGained
                ? `+${totalGained} kg`
                : '—'}
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('weight.range')}
          </div>
          <div className='text-lg font-light text-gray-700 dark:text-gray-300 mt-1'>
            {minWeight.toFixed(1)} - {maxWeight.toFixed(1)} kg
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className='flex gap-2 border-b border-gray-200'>
        <button
          onClick={() => setSelectedView('chart')}
          className={`px-4 py-2 text-sm transition-all ${
            selectedView === 'chart'
              ? 'text-gray-800 border-b-2 border-gray-800'
              : 'text-gray-400'
          }`}
        >
          <i className='fas fa-chart-line mr-2'></i>
          {t('weight.chart')}
        </button>
        <button
          onClick={() => setSelectedView('table')}
          className={`px-4 py-2 text-sm transition-all ${
            selectedView === 'table'
              ? 'text-gray-800 border-b-2 border-gray-800'
              : 'text-gray-400'
          }`}
        >
          <i className='fas fa-table mr-2'></i>
          {t('weight.table')}
        </button>
      </div>

      {/* Weight Chart */}
      {selectedView === 'chart' ? (
        <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border'>
          <h3 className='font-medium text-gray-700 mb-6 flex items-center gap-2'>
            <i className='fas fa-chart-line text-gray-400'></i>
            {t('weight.weight_trend')}
          </h3>
          <div className='relative h-64'>
            <svg
              className='w-full h-full'
              viewBox='0 0 800 250'
              preserveAspectRatio='none'
            >
              {[...Array(5)].map((_, i) => (
                <line
                  key={i}
                  x1='0'
                  y1={i * 50}
                  x2='800'
                  y2={i * 50}
                  stroke='#e5e7eb'
                  strokeWidth='1'
                  className='dark:stroke-gray-800'
                />
              ))}
              {weeklyData.filter((d) => d.entry).length > 1 && (
                <polyline
                  points={weeklyData
                    .map((d, idx) => {
                      if (!d.entry) return '';
                      const x = (idx / 29) * 800;
                      const y =
                        ((maxWeight + 5 - d.entry.weight) /
                          (maxWeight - minWeight + 10)) *
                        200;
                      return `${x},${Math.min(Math.max(y, 0), 200)}`;
                    })
                    .filter((p) => p)
                    .join(' ')}
                  fill='none'
                  stroke='#3b82f6'
                  strokeWidth='3'
                />
              )}
              {weeklyData.map((d, idx) => {
                if (!d.entry) return null;
                const x = (idx / 29) * 800;
                const y =
                  ((maxWeight + 5 - d.entry.weight) /
                    (maxWeight - minWeight + 10)) *
                  200;
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={Math.min(Math.max(y, 0), 200)}
                    r='4'
                    fill='#3b82f6'
                    stroke='white'
                    strokeWidth='2'
                  />
                );
              })}
            </svg>
          </div>
          <div className='flex justify-between mt-2 text-xs text-gray-500'>
            {weeklyData
              .filter((_, i) => i % 5 === 0)
              .map((d, idx) => (
                <span key={idx}>{d.date.slice(5)}</span>
              ))}
          </div>
          <div className='mt-4 pt-4 border-t'>
            <div className='flex justify-between text-sm'>
              <div>{t('weight.target_bmi')}</div>
              <div>
                {t('weight.healthy_weight_range', { height: userHeight })}:{' '}
                {healthyMinWeight} - {healthyMaxWeight} kg
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className='bg-white dark:bg-gray-900 rounded-xl shadow-sm border overflow-hidden'>
          <div className='px-6 py-4 border-b'>
            <h3 className='font-medium flex items-center gap-2'>
              <i className='fas fa-history text-gray-400 text-sm'></i>
              {t('weight.history')}
              <span className='text-xs text-gray-400 ml-2'>
                ({entries.length} {t('weight.entries')})
              </span>
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
                    {t('weight.weight')} (kg)
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase'>
                    {t('weight.bmi')}
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase'>
                    {t('weight.body_fat')} (%)
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase'>
                    {t('weight.waist')} (cm)
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase'></th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {entries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className='px-6 py-8 text-center text-gray-400'
                    >
                      <i className='fas fa-weight-scale text-2xl mb-2 opacity-50'></i>
                      <p>{t('weight.no_entries')}</p>
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => {
                    const category = getBMICategory(entry.bmi);
                    return (
                      <tr
                        key={entry.id}
                        className='hover:bg-gray-50 transition'
                      >
                        <td className='px-6 py-3 text-sm text-gray-600'>
                          {entry.date}
                        </td>
                        <td className='px-6 py-3 text-sm font-medium text-gray-800'>
                          {entry.weight} kg
                        </td>
                        <td className='px-6 py-3 text-sm'>
                          <span className={category.color}>
                            {entry.bmi} ({category.text})
                          </span>
                        </td>
                        <td className='px-6 py-3 text-sm text-gray-600'>
                          {entry.bodyFat || '—'}%
                        </td>
                        <td className='px-6 py-3 text-sm text-gray-600'>
                          {entry.waist || '—'} cm
                        </td>
                        <td className='px-6 py-3 text-sm'>
                          <button
                            onClick={() => editEntry(entry)}
                            className='text-gray-400 hover:text-blue-500 mr-2'
                          >
                            <i className='fas fa-edit text-xs'></i>
                          </button>
                          <button
                            onClick={() => deleteEntry(entry.id)}
                            className='text-gray-400 hover:text-red-500'
                          >
                            <i className='fas fa-trash-alt text-xs'></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tip Card */}
      <div className='bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border'>
        <div className='flex gap-3'>
          <i className='fas fa-info-circle text-gray-400 text-sm mt-0.5'></i>
          <div>
            <h4 className='font-medium text-sm text-gray-700 mb-1'>
              {t('weight.tip_title')}
            </h4>
            <p className='text-xs text-gray-500'>{t('weight.tip_text')}</p>
          </div>
        </div>
      </div>

      {/* Weight Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
            onClick={() => resetForm()}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className='bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md'
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className='font-medium text-gray-800 dark:text-gray-200 mb-4'>
                {editingId ? t('weight.edit') : t('weight.add')}
              </h3>
              <div className='space-y-4'>
                <div>
                  <label className='block text-xs text-gray-500 mb-1'>
                    {t('glucose.date_time')?.split(' ')[0] || 'Date'}
                  </label>
                  <input
                    type='date'
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  />
                </div>
                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs text-gray-500 mb-1'>
                      {t('weight.height')}
                    </label>
                    <input
                      type='number'
                      value={userHeight}
                      onChange={(e) => setUserHeight(parseInt(e.target.value))}
                      className='w-full px-3 py-2 text-sm border rounded-lg'
                    />
                  </div>
                  <div>
                    <label className='block text-xs text-gray-500 mb-1'>
                      {t('weight.weight')}
                    </label>
                    <input
                      type='number'
                      step='0.1'
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder='e.g., 72.5'
                      className='w-full px-3 py-2 text-sm border rounded-lg'
                    />
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs text-gray-500 mb-1'>
                      {t('weight.body_fat')}
                    </label>
                    <input
                      type='number'
                      step='0.1'
                      value={bodyFat}
                      onChange={(e) => setBodyFat(e.target.value)}
                      placeholder='e.g., 22'
                      className='w-full px-3 py-2 text-sm border rounded-lg'
                    />
                  </div>
                  <div>
                    <label className='block text-xs text-gray-500 mb-1'>
                      {t('weight.muscle')}
                    </label>
                    <input
                      type='number'
                      step='0.1'
                      value={muscle}
                      onChange={(e) => setMuscle(e.target.value)}
                      placeholder='e.g., 30'
                      className='w-full px-3 py-2 text-sm border rounded-lg'
                    />
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs text-gray-500 mb-1'>
                      {t('weight.waist')}
                    </label>
                    <input
                      type='number'
                      step='0.5'
                      value={waist}
                      onChange={(e) => setWaist(e.target.value)}
                      placeholder='e.g., 80'
                      className='w-full px-3 py-2 text-sm border rounded-lg'
                    />
                  </div>
                  <div>
                    <label className='block text-xs text-gray-500 mb-1'>
                      {t('weight.hip')}
                    </label>
                    <input
                      type='number'
                      step='0.5'
                      value={hip}
                      onChange={(e) => setHip(e.target.value)}
                      placeholder='e.g., 95'
                      className='w-full px-3 py-2 text-sm border rounded-lg'
                    />
                  </div>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('weight.notes')}
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
                  {t('weight.save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
