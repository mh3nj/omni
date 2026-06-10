import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SleepEntry {
  id: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  duration: number;
  quality: 1 | 2 | 3 | 4 | 5;
  deepSleep?: number;
  wakeups?: number;
  notes?: string;
  snoringRecording?: string;
}

interface SleepTrackerProps {
  onBack: () => void;
}

const qualityLabels = {
  1: { emoji: '😫' },
  2: { emoji: '😔' },
  3: { emoji: '😐' },
  4: { emoji: '🙂' },
  5: { emoji: '😊' },
};

export default function SleepTracker({ onBack }: SleepTrackerProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [entries, setEntries] = useState<SleepEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [quality, setQuality] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [deepSleep, setDeepSleep] = useState('');
  const [wakeups, setWakeups] = useState('');
  const [notes, setNotes] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('omni_sleep');
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('omni_sleep', JSON.stringify(entries));
  }, [entries]);

  const calculateDuration = (bed: string, wake: string): number => {
    const [bedHour, bedMin] = bed.split(':').map(Number);
    const [wakeHour, wakeMin] = wake.split(':').map(Number);
    let duration = wakeHour * 60 + wakeMin - (bedHour * 60 + bedMin);
    if (duration < 0) duration += 24 * 60;
    return Math.round((duration / 60) * 10) / 10;
  };

  const getEntryForDate = (date: string): SleepEntry | undefined => {
    return entries.find((e) => e.date === date);
  };

  const saveEntry = () => {
    const duration = calculateDuration(bedtime, wakeTime);
    const entry: SleepEntry = {
      id: editingId || Date.now().toString(),
      date: selectedDate,
      bedtime,
      wakeTime,
      duration,
      quality,
      deepSleep: deepSleep ? parseInt(deepSleep) : undefined,
      wakeups: wakeups ? parseInt(wakeups) : undefined,
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

  const editEntry = (entry: SleepEntry) => {
    setEditingId(entry.id);
    setSelectedDate(entry.date);
    setBedtime(entry.bedtime);
    setWakeTime(entry.wakeTime);
    setQuality(entry.quality);
    setDeepSleep(entry.deepSleep?.toString() || '');
    setWakeups(entry.wakeups?.toString() || '');
    setNotes(entry.notes || '');
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setBedtime('23:00');
    setWakeTime('07:00');
    setQuality(3);
    setDeepSleep('');
    setWakeups('');
    setNotes('');
    setShowForm(false);
  };

  const getLast7DaysStats = () => {
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const entry = entries.find((e) => e.date === dateStr);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      last7.push({ date: dateStr, dayName, entry });
    }
    return last7;
  };

  const weeklyData = getLast7DaysStats();
  const avgDuration =
    entries.length > 0
      ? Math.round(
          (entries.reduce((sum, e) => sum + e.duration, 0) / entries.length) *
            10,
        ) / 10
      : 0;
  const avgQuality =
    entries.length > 0
      ? (
          entries.reduce((sum, e) => sum + e.quality, 0) / entries.length
        ).toFixed(1)
      : '0';
  const totalHours = entries.reduce((sum, e) => sum + e.duration, 0);

  const currentEntry = getEntryForDate(selectedDate);

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
            onClick={() => setShowForm(true)}
            className='px-4 py-1.5 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-all flex items-center gap-2 text-sm'
          >
            <i className='fas fa-plus text-xs'></i> {t('sleep.add')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800'>
          <div className='text-xs text-gray-400 uppercase tracking-wide'>
            {t('sleep.avg_sleep')}
          </div>
          <div className='text-2xl font-light text-gray-700 dark:text-gray-300 mt-1'>
            {avgDuration}h
          </div>
          <div className='text-xs text-gray-400'>{t('sleep.avg_quality')}</div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800'>
          <div className='text-xs text-gray-400 uppercase tracking-wide'>
            {t('sleep.avg_quality')}
          </div>
          <div className='text-2xl font-light text-gray-700 dark:text-gray-300 mt-1'>
            {avgQuality}/5
          </div>
          <div className='text-xs text-gray-400'>
            {entries.length} {t('sleep.history')}
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800'>
          <div className='text-xs text-gray-400 uppercase tracking-wide'>
            {t('sleep.total_sleep')}
          </div>
          <div className='text-2xl font-light text-gray-700 dark:text-gray-300 mt-1'>
            {totalHours}h
          </div>
          <div className='text-xs text-gray-400'>all time</div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800'>
          <div className='text-xs text-gray-400 uppercase tracking-wide'>
            {t('sleep.target')}
          </div>
          <div className='text-xl font-light text-gray-700 dark:text-gray-300 mt-1'>
            7-9 hours
          </div>
          <div className='text-xs text-gray-400'>recommended</div>
        </div>
      </div>

      {/* Weekly Sleep Chart */}
      <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800'>
        <h3 className='font-medium text-gray-700 dark:text-gray-300 mb-6 flex items-center gap-2'>
          <i className='fas fa-chart-line text-gray-400'></i>
          {t('sleep.weekly')}
        </h3>
        <div className='flex items-end justify-between gap-2 h-48'>
          {weeklyData.map((day) => {
            const height = day.entry ? (day.entry.duration / 12) * 100 : 0;
            const qualityColor = day.entry
              ? day.entry.quality >= 4
                ? 'bg-green-500'
                : day.entry.quality >= 3
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              : 'bg-gray-300 dark:bg-gray-700';
            return (
              <div
                key={day.date}
                className='flex-1 flex flex-col items-center gap-2'
              >
                <div className='text-xs text-gray-400'>{day.dayName}</div>
                <div
                  className='w-full bg-gray-100 dark:bg-gray-800 rounded-t-lg transition-all duration-300'
                  style={{ height: `${Math.min(height, 100)}px` }}
                >
                  <div
                    className={`w-full ${qualityColor} rounded-t-lg transition-all duration-300`}
                    style={{ height: `${Math.min(height, 100)}%` }}
                  />
                </div>
                <div className='text-xs font-medium text-gray-600 dark:text-gray-400'>
                  {day.entry ? `${day.entry.duration}h` : '—'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Day Entry Display */}
      <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800'>
        <h3 className='font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2'>
          <i className='fas fa-moon text-gray-400'></i>
          {t('sleep.title')} - {selectedDate}
        </h3>
        {currentEntry ? (
          <div>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
              <div>
                <div className='text-xs text-gray-400'>
                  {t('sleep.bedtime')}
                </div>
                <div className='text-lg font-medium text-gray-800 dark:text-gray-200'>
                  {currentEntry.bedtime}
                </div>
              </div>
              <div>
                <div className='text-xs text-gray-400'>
                  {t('sleep.waketime')}
                </div>
                <div className='text-lg font-medium text-gray-800 dark:text-gray-200'>
                  {currentEntry.wakeTime}
                </div>
              </div>
              <div>
                <div className='text-xs text-gray-400'>
                  {t('sleep.duration')}
                </div>
                <div className='text-lg font-medium text-gray-800 dark:text-gray-200'>
                  {currentEntry.duration} hours
                </div>
              </div>
              <div>
                <div className='text-xs text-gray-400'>
                  {t('sleep.quality')}
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-lg font-medium text-gray-800 dark:text-gray-200'>
                    {currentEntry.quality}/5
                  </span>
                  <span className='text-xl'>
                    {qualityLabels[currentEntry.quality].emoji}
                  </span>
                </div>
              </div>
            </div>
            {currentEntry.deepSleep && (
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                {t('sleep.deep_sleep')}: {currentEntry.deepSleep} min
              </div>
            )}
            {currentEntry.wakeups !== undefined && (
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                {t('sleep.wakeups')}: {currentEntry.wakeups}
              </div>
            )}
            {currentEntry.notes && (
              <div className='text-sm text-gray-500 italic mt-2'>
                "{currentEntry.notes}"
              </div>
            )}
            <div className='flex gap-2 mt-4'>
              <button
                onClick={() => editEntry(currentEntry)}
                className='px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition'
              >
                <i className='fas fa-edit mr-1'></i> {t('sleep.edit')}
              </button>
              <button
                onClick={() => deleteEntry(currentEntry.id)}
                className='px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition'
              >
                <i className='fas fa-trash-alt mr-1'></i> Delete
              </button>
            </div>
          </div>
        ) : (
          <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
            <i className='fas fa-bed text-3xl mb-2 opacity-50'></i>
            <p className='text-sm'>{t('sleep.history')}</p>
            <button
              onClick={() => setShowForm(true)}
              className='mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline'
            >
              {t('sleep.add')} →
            </button>
          </div>
        )}
      </div>

      {/* History Table */}
      <div className='bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden'>
        <div className='px-6 py-4 border-b border-gray-100 dark:border-gray-800'>
          <h3 className='font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300'>
            <i className='fas fa-history text-gray-400 text-sm'></i>
            {t('sleep.history')}
            <span className='text-xs text-gray-400 font-normal ml-2'>
              ({entries.length} entries)
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
                  {t('sleep.bedtime')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase'>
                  {t('sleep.waketime')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase'>
                  {t('sleep.duration')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase'>
                  {t('sleep.quality')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase'></th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-50 dark:divide-gray-800'>
              {entries.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className='px-6 py-8 text-center text-gray-400 text-sm'
                  >
                    <i className='fas fa-bed text-2xl mb-2 opacity-50'></i>
                    <p>{t('sleep.history')}</p>
                  </td>
                </tr>
              ) : (
                entries.slice(0, 10).map((entry) => (
                  <tr
                    key={entry.id}
                    className='hover:bg-gray-50 dark:hover:bg-gray-800/50 transition'
                  >
                    <td className='px-6 py-3 text-sm text-gray-600 dark:text-gray-400'>
                      {entry.date}
                    </td>
                    <td className='px-6 py-3 text-sm text-gray-800 dark:text-gray-200'>
                      {entry.bedtime}
                    </td>
                    <td className='px-6 py-3 text-sm text-gray-800 dark:text-gray-200'>
                      {entry.wakeTime}
                    </td>
                    <td className='px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300'>
                      {entry.duration}h
                    </td>
                    <td className='px-6 py-3 text-sm'>
                      <div className='flex items-center gap-2'>
                        <span className='text-lg'>
                          {qualityLabels[entry.quality].emoji}
                        </span>
                        <span className='text-gray-600 dark:text-gray-400'>
                          {entry.quality}/5
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-3 text-sm'>
                      <button
                        onClick={() => editEntry(entry)}
                        className='text-gray-400 hover:text-blue-500 transition mr-2'
                      >
                        <i className='fas fa-edit text-xs'></i>
                      </button>
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
          <i className='fas fa-info-circle text-gray-400 text-sm mt-0.5'></i>
          <div>
            <h4 className='font-medium text-sm text-gray-700 dark:text-gray-300 mb-1'>
              {t('sleep.tip_title')}
            </h4>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              {t('sleep.tip_text')}
            </p>
          </div>
        </div>
      </div>

      {/* Sleep Form Modal */}
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
                {editingId ? t('sleep.edit') : t('sleep.add')}
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
                    className='w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800'
                  />
                </div>

                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs text-gray-500 mb-1'>
                      {t('sleep.bedtime')}
                    </label>
                    <input
                      type='time'
                      value={bedtime}
                      onChange={(e) => setBedtime(e.target.value)}
                      className='w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800'
                    />
                  </div>
                  <div>
                    <label className='block text-xs text-gray-500 mb-1'>
                      {t('sleep.waketime')}
                    </label>
                    <input
                      type='time'
                      value={wakeTime}
                      onChange={(e) => setWakeTime(e.target.value)}
                      className='w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-xs text-gray-500 mb-1'>
                    {t('sleep.quality')}
                  </label>
                  <div className='flex gap-2'>
                    {[1, 2, 3, 4, 5].map((q) => (
                      <button
                        key={q}
                        onClick={() => setQuality(q as 1 | 2 | 3 | 4 | 5)}
                        className={`flex-1 py-2 rounded-lg text-sm transition ${
                          quality === q
                            ? 'bg-gray-800 dark:bg-gray-700 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {qualityLabels[q as 1 | 2 | 3 | 4 | 5].emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs text-gray-500 mb-1'>
                      {t('sleep.deep_sleep')}
                    </label>
                    <input
                      type='number'
                      value={deepSleep}
                      onChange={(e) => setDeepSleep(e.target.value)}
                      placeholder={t('sleep.deep_sleep')}
                      className='w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800'
                    />
                  </div>
                  <div>
                    <label className='block text-xs text-gray-500 mb-1'>
                      {t('sleep.wakeups')}
                    </label>
                    <input
                      type='number'
                      value={wakeups}
                      onChange={(e) => setWakeups(e.target.value)}
                      placeholder={t('sleep.wakeups')}
                      className='w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-xs text-gray-500 mb-1'>
                    {t('sleep.notes')}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('sleep.notes')}
                    rows={2}
                    className='w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 resize-none'
                  />
                </div>
              </div>

              <div className='flex gap-3 mt-6'>
                <button
                  onClick={resetForm}
                  className='flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition'
                >
                  {t('glucose.cancel')}
                </button>
                <button
                  onClick={saveEntry}
                  className='flex-1 px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-700 dark:hover:bg-gray-600 transition'
                >
                  {t('sleep.save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
