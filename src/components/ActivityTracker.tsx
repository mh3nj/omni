import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ActivityEntry {
  id: string;
  date: string;
  type:
    | 'walking'
    | 'running'
    | 'gym'
    | 'cycling'
    | 'swimming'
    | 'yoga'
    | 'other';
  duration: number;
  intensity: 'low' | 'medium' | 'high';
  calories?: number;
  steps?: number;
  distance?: number;
  heartRate?: number;
  bloodSugarBefore?: number;
  bloodSugarAfter?: number;
  notes?: string;
}

interface ActivityTrackerProps {
  onBack: () => void;
}

const activityTypes = [
  { id: 'walking', icon: 'fas fa-walking' },
  { id: 'running', icon: 'fas fa-running' },
  { id: 'gym', icon: 'fas fa-dumbbell' },
  { id: 'cycling', icon: 'fas fa-bicycle' },
  { id: 'swimming', icon: 'fas fa-swimmer' },
  { id: 'yoga', icon: 'fas fa-pray' },
  { id: 'other', icon: 'fas fa-heartbeat' },
];

export default function ActivityTracker({ onBack }: ActivityTrackerProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [activityType, setActivityType] =
    useState<ActivityEntry['type']>('walking');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] =
    useState<ActivityEntry['intensity']>('medium');
  const [steps, setSteps] = useState('');
  const [distance, setDistance] = useState('');
  const [calories, setCalories] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [bloodSugarBefore, setBloodSugarBefore] = useState('');
  const [bloodSugarAfter, setBloodSugarAfter] = useState('');
  const [notes, setNotes] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'list' | 'chart'>('list');

  useEffect(() => {
    const saved = localStorage.getItem('omni_activity');
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('omni_activity', JSON.stringify(entries));
  }, [entries]);

  const getEntryForDate = (date: string): ActivityEntry[] => {
    return entries.filter((e) => e.date === date);
  };

  const calculateCalories = (
    type: string,
    duration: number,
    intensity: string,
  ): number => {
    const multipliers: Record<
      string,
      { low: number; medium: number; high: number }
    > = {
      walking: { low: 3, medium: 4, high: 5 },
      running: { low: 8, medium: 10, high: 12 },
      gym: { low: 4, medium: 6, high: 8 },
      cycling: { low: 5, medium: 7, high: 9 },
      swimming: { low: 6, medium: 8, high: 10 },
      yoga: { low: 2, medium: 3, high: 4 },
      other: { low: 3, medium: 5, high: 7 },
    };
    const multiplier = multipliers[type]?.medium || 5;
    const intensityMult =
      intensity === 'low' ? 0.8 : intensity === 'high' ? 1.2 : 1;
    return Math.round(duration * multiplier * intensityMult);
  };

  const saveEntry = () => {
    if (!duration) return;

    const durationNum = parseInt(duration);
    const caloriesNum = calories
      ? parseInt(calories)
      : calculateCalories(activityType, durationNum, intensity);

    const entry: ActivityEntry = {
      id: editingId || Date.now().toString(),
      date: selectedDate,
      type: activityType,
      duration: durationNum,
      intensity,
      calories: caloriesNum,
      steps: steps ? parseInt(steps) : undefined,
      distance: distance ? parseFloat(distance) : undefined,
      heartRate: heartRate ? parseInt(heartRate) : undefined,
      bloodSugarBefore: bloodSugarBefore
        ? parseInt(bloodSugarBefore)
        : undefined,
      bloodSugarAfter: bloodSugarAfter ? parseInt(bloodSugarAfter) : undefined,
      notes: notes || undefined,
    };

    if (editingId) {
      setEntries(entries.map((e) => (e.id === editingId ? entry : e)));
    } else {
      setEntries([entry, ...entries]);
    }

    resetForm();
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  const editEntry = (entry: ActivityEntry) => {
    setEditingId(entry.id);
    setSelectedDate(entry.date);
    setActivityType(entry.type);
    setDuration(entry.duration.toString());
    setIntensity(entry.intensity);
    setSteps(entry.steps?.toString() || '');
    setDistance(entry.distance?.toString() || '');
    setCalories(entry.calories?.toString() || '');
    setHeartRate(entry.heartRate?.toString() || '');
    setBloodSugarBefore(entry.bloodSugarBefore?.toString() || '');
    setBloodSugarAfter(entry.bloodSugarAfter?.toString() || '');
    setNotes(entry.notes || '');
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setActivityType('walking');
    setDuration('');
    setIntensity('medium');
    setSteps('');
    setDistance('');
    setCalories('');
    setHeartRate('');
    setBloodSugarBefore('');
    setBloodSugarAfter('');
    setNotes('');
    setShowForm(false);
  };

  const getWeeklyStats = () => {
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayEntries = entries.filter((e) => e.date === dateStr);
      const totalDuration = dayEntries.reduce((sum, e) => sum + e.duration, 0);
      const totalCalories = dayEntries.reduce(
        (sum, e) => sum + (e.calories || 0),
        0,
      );
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      last7.push({
        date: dateStr,
        dayName,
        totalDuration,
        totalCalories,
        count: dayEntries.length,
      });
    }
    return last7;
  };

  const weeklyData = getWeeklyStats();
  const totalActivities = entries.length;
  const totalDuration = entries.reduce((sum, e) => sum + e.duration, 0);
  const totalCalories = entries.reduce((sum, e) => sum + (e.calories || 0), 0);
  const avgDuration =
    totalActivities > 0 ? Math.round(totalDuration / totalActivities) : 0;
  const todayActivities = getEntryForDate(selectedDate);
  const maxWeeklyDuration = Math.max(
    ...weeklyData.map((d) => d.totalDuration),
    1,
  );

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
            <i className='fas fa-plus text-xs'></i> {t('activity.add')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800'>
          <div className='text-xs text-gray-400 uppercase tracking-wide'>
            {t('activity.total_activities')}
          </div>
          <div className='text-2xl font-light text-gray-700 dark:text-gray-300 mt-1'>
            {totalActivities}
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800'>
          <div className='text-xs text-gray-400 uppercase tracking-wide'>
            {t('activity.total_duration')}
          </div>
          <div className='text-2xl font-light text-gray-700 dark:text-gray-300 mt-1'>
            {totalDuration} min
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800'>
          <div className='text-xs text-gray-400 uppercase tracking-wide'>
            {t('activity.total_calories')}
          </div>
          <div className='text-2xl font-light text-gray-700 dark:text-gray-300 mt-1'>
            {totalCalories}
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800'>
          <div className='text-xs text-gray-400 uppercase tracking-wide'>
            {t('activity.avg_duration')}
          </div>
          <div className='text-2xl font-light text-gray-700 dark:text-gray-300 mt-1'>
            {avgDuration} min
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className='flex gap-2 border-b border-gray-200 dark:border-gray-800'>
        <button
          onClick={() => setSelectedView('list')}
          className={`px-4 py-2 text-sm transition-all ${
            selectedView === 'list'
              ? 'text-gray-800 dark:text-gray-200 border-b-2 border-gray-800 dark:border-gray-200'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <i className='fas fa-list mr-2'></i> List
        </button>
        <button
          onClick={() => setSelectedView('chart')}
          className={`px-4 py-2 text-sm transition-all ${
            selectedView === 'chart'
              ? 'text-gray-800 dark:text-gray-200 border-b-2 border-gray-800 dark:border-gray-200'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <i className='fas fa-chart-bar mr-2'></i> {t('activity.weekly')}
        </button>
      </div>

      {/* Weekly Chart */}
      {selectedView === 'chart' ? (
        <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800'>
          <h3 className='font-medium text-gray-700 dark:text-gray-300 mb-6 flex items-center gap-2'>
            <i className='fas fa-chart-line text-gray-400'></i>
            {t('activity.weekly')}
          </h3>
          <div className='flex items-end justify-between gap-2 h-48'>
            {weeklyData.map((day) => (
              <div
                key={day.date}
                className='flex-1 flex flex-col items-center gap-2'
              >
                <div className='text-xs text-gray-400'>{day.dayName}</div>
                <div
                  className='w-full bg-gray-100 dark:bg-gray-800 rounded-t-lg transition-all duration-300'
                  style={{
                    height: `${(day.totalDuration / maxWeeklyDuration) * 120}px`,
                  }}
                >
                  <div
                    className='w-full bg-blue-500 rounded-t-lg transition-all duration-300'
                    style={{
                      height: `${(day.totalDuration / maxWeeklyDuration) * 100}%`,
                    }}
                  />
                </div>
                <div className='text-xs font-medium text-gray-600 dark:text-gray-400'>
                  {day.totalDuration > 0 ? `${day.totalDuration}m` : '—'}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800'>
          <h3 className='font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2'>
            <i className='fas fa-calendar-day text-gray-400'></i>
            {t('activity.title')} - {selectedDate}
          </h3>
          {todayActivities.length === 0 ? (
            <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
              <i className='fas fa-running text-3xl mb-2 opacity-50'></i>
              <p className='text-sm'>{t('activity.history')}</p>
              <button
                onClick={() => setShowForm(true)}
                className='mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline'
              >
                {t('activity.add')} →
              </button>
            </div>
          ) : (
            <div className='space-y-3'>
              {todayActivities.map((activity) => (
                <div
                  key={activity.id}
                  className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'
                >
                  <div className='flex items-center gap-3'>
                    <div className='text-2xl'>
                      <i
                        className={
                          activityTypes.find((t) => t.id === activity.type)
                            ?.icon
                        }
                      ></i>
                    </div>
                    <div>
                      <div className='font-medium text-gray-800 dark:text-gray-200'>
                        {t(`activity.${activity.type}`, activity.type)}
                      </div>
                      <div className='text-xs text-gray-500'>
                        {activity.duration} min •{' '}
                        {t(`activity.${activity.intensity}`)} •{' '}
                        {activity.calories} kcal
                      </div>
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => editEntry(activity)}
                      className='text-gray-400 hover:text-blue-500 transition'
                    >
                      <i className='fas fa-edit text-xs'></i>
                    </button>
                    <button
                      onClick={() => deleteEntry(activity.id)}
                      className='text-gray-400 hover:text-red-500 transition'
                    >
                      <i className='fas fa-trash-alt text-xs'></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tip Card */}
      <div className='bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800'>
        <div className='flex gap-3'>
          <i className='fas fa-info-circle text-gray-400 text-sm mt-0.5'></i>
          <div>
            <h4 className='font-medium text-sm text-gray-700 dark:text-gray-300 mb-1'>
              {t('activity.tip_title')}
            </h4>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              {t('activity.tip_text')}
            </p>
          </div>
        </div>
      </div>

      {/* Activity Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto'
            onClick={() => resetForm()}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className='bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto'
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className='font-medium text-gray-800 dark:text-gray-200 mb-4'>
                {editingId ? t('activity.edit') : t('activity.add')}
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
                    className='w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800'
                  />
                </div>

                <div>
                  <label className='block text-xs text-gray-500 mb-1'>
                    {t('activity.type')}
                  </label>
                  <div className='grid grid-cols-4 gap-2'>
                    {activityTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() =>
                          setActivityType(type.id as ActivityEntry['type'])
                        }
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition ${
                          activityType === type.id
                            ? 'bg-gray-800 dark:bg-gray-700 text-white'
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}
                      >
                        <i className={`${type.icon} text-lg`}></i>
                        <span className='text-xs'>
                          {t(`activity.${type.id}`, type.id)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs text-gray-500 mb-1'>
                      {t('activity.duration')}
                    </label>
                    <input
                      type='number'
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder='minutes'
                      className='w-full px-3 py-2 text-sm border rounded-lg'
                    />
                  </div>
                  <div>
                    <label className='block text-xs text-gray-500 mb-1'>
                      {t('activity.intensity')}
                    </label>
                    <select
                      value={intensity}
                      onChange={(e) => setIntensity(e.target.value as any)}
                      className='w-full px-3 py-2 text-sm border rounded-lg'
                    >
                      <option value='low'>{t('activity.light')}</option>
                      <option value='medium'>{t('activity.moderate')}</option>
                      <option value='high'>{t('activity.intense')}</option>
                    </select>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs text-gray-500 mb-1'>
                      {t('activity.steps')}
                    </label>
                    <input
                      type='number'
                      value={steps}
                      onChange={(e) => setSteps(e.target.value)}
                      placeholder='optional'
                      className='w-full px-3 py-2 text-sm border rounded-lg'
                    />
                  </div>
                  <div>
                    <label className='block text-xs text-gray-500 mb-1'>
                      {t('activity.distance')}
                    </label>
                    <input
                      type='number'
                      step='0.1'
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                      placeholder='km'
                      className='w-full px-3 py-2 text-sm border rounded-lg'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs text-gray-500 mb-1'>
                      {t('activity.calories')}
                    </label>
                    <input
                      type='number'
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                      placeholder='auto'
                      className='w-full px-3 py-2 text-sm border rounded-lg'
                    />
                  </div>
                  <div>
                    <label className='block text-xs text-gray-500 mb-1'>
                      {t('activity.heart_rate')}
                    </label>
                    <input
                      type='number'
                      value={heartRate}
                      onChange={(e) => setHeartRate(e.target.value)}
                      placeholder='bpm'
                      className='w-full px-3 py-2 text-sm border rounded-lg'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs text-gray-500 mb-1'>
                      {t('activity.blood_sugar_before')}
                    </label>
                    <input
                      type='number'
                      value={bloodSugarBefore}
                      onChange={(e) => setBloodSugarBefore(e.target.value)}
                      placeholder='mg/dL'
                      className='w-full px-3 py-2 text-sm border rounded-lg'
                    />
                  </div>
                  <div>
                    <label className='block text-xs text-gray-500 mb-1'>
                      {t('activity.blood_sugar_after')}
                    </label>
                    <input
                      type='number'
                      value={bloodSugarAfter}
                      onChange={(e) => setBloodSugarAfter(e.target.value)}
                      placeholder='mg/dL'
                      className='w-full px-3 py-2 text-sm border rounded-lg'
                    />
                  </div>
                </div>

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('activity.notes')}
                  rows={2}
                  className='w-full px-3 py-2 text-sm border rounded-lg resize-none'
                />
              </div>

              <div className='flex gap-3 mt-6'>
                <button
                  onClick={resetForm}
                  className='flex-1 px-4 py-2 border rounded-lg text-sm'
                >
                  {t('glucose.cancel')}
                </button>
                <button
                  onClick={saveEntry}
                  className='flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm'
                >
                  {t('activity.save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
