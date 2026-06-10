import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface HabitEntry {
  id: string;
  date: string;
  noSmoking: boolean;
  noAlcohol: boolean;
  noGambling: boolean;
  noFastFood: boolean;
  didSports: boolean;
  meditation?: boolean;
  reading?: boolean;
  customHabits?: { name: string; completed: boolean }[];
  notes?: string;
}

interface HabitTrackerProps {
  onBack: () => void;
}

const defaultHabits = [
  { id: 'noSmoking', key: 'noSmoking', icon: 'fas fa-smoking-ban' },
  { id: 'noAlcohol', key: 'noAlcohol', icon: 'fas fa-wine-bottle' },
  { id: 'noGambling', key: 'noGambling', icon: 'fas fa-dice' },
  { id: 'noFastFood', key: 'noFastFood', icon: 'fas fa-hamburger' },
  { id: 'didSports', key: 'didSports', icon: 'fas fa-running' },
];

export default function HabitTracker({ onBack }: HabitTrackerProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [habits, setHabits] = useState({
    noSmoking: false,
    noAlcohol: false,
    noGambling: false,
    noFastFood: false,
    didSports: false,
    meditation: false,
    reading: false,
  });
  const [customHabits, setCustomHabits] = useState<
    { name: string; completed: boolean }[]
  >([]);
  const [newCustomHabit, setNewCustomHabit] = useState('');
  const [notes, setNotes] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [selectedView, setSelectedView] = useState<
    'daily' | 'weekly' | 'monthly'
  >('daily');

  useEffect(() => {
    const saved = localStorage.getItem('omni_habits');
    if (saved) {
      setEntries(JSON.parse(saved));
    }
    const savedCustom = localStorage.getItem('omni_custom_habits');
    if (savedCustom) {
      setCustomHabits(JSON.parse(savedCustom));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('omni_habits', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('omni_custom_habits', JSON.stringify(customHabits));
  }, [customHabits]);

  const getEntryForDate = (date: string): HabitEntry | undefined => {
    return entries.find((e) => e.date === date);
  };

  const calculateStreak = (
    habitKey: keyof Omit<HabitEntry, 'id' | 'date' | 'customHabits' | 'notes'>,
  ): number => {
    let streak = 0;
    const sortedEntries = [...entries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    for (const entry of sortedEntries) {
      if (entry[habitKey]) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const getWeeklyCompletions = (habitKey: string) => {
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const entry = entries.find((e) => e.date === dateStr);
      let completed = false;
      if (habitKey === 'custom') {
        completed = false;
      } else {
        completed = entry
          ? (entry[habitKey as keyof HabitEntry] as boolean)
          : false;
      }
      last7.push({ date: dateStr, completed });
    }
    return last7;
  };

  const saveEntry = () => {
    const existingEntry = getEntryForDate(selectedDate);

    const entry: HabitEntry = {
      id: editingId || existingEntry?.id || Date.now().toString(),
      date: selectedDate,
      noSmoking: habits.noSmoking,
      noAlcohol: habits.noAlcohol,
      noGambling: habits.noGambling,
      noFastFood: habits.noFastFood,
      didSports: habits.didSports,
      meditation: habits.meditation,
      reading: habits.reading,
      customHabits: customHabits.filter((h) => h.completed),
      notes: notes || undefined,
    };

    if (editingId || existingEntry) {
      setEntries(entries.map((e) => (e.date === selectedDate ? entry : e)));
    } else {
      setEntries([entry, ...entries]);
    }

    resetForm();
  };

  const deleteEntry = (date: string) => {
    setEntries(entries.filter((e) => e.date !== date));
  };

  const editEntry = (entry: HabitEntry) => {
    setEditingId(entry.id);
    setSelectedDate(entry.date);
    setHabits({
      noSmoking: entry.noSmoking,
      noAlcohol: entry.noAlcohol,
      noGambling: entry.noGambling,
      noFastFood: entry.noFastFood,
      didSports: entry.didSports,
      meditation: entry.meditation || false,
      reading: entry.reading || false,
    });
    setNotes(entry.notes || '');
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setHabits({
      noSmoking: false,
      noAlcohol: false,
      noGambling: false,
      noFastFood: false,
      didSports: false,
      meditation: false,
      reading: false,
    });
    setNotes('');
    setShowForm(false);
  };

  const addCustomHabit = () => {
    if (newCustomHabit.trim()) {
      setCustomHabits([
        ...customHabits,
        { name: newCustomHabit.trim(), completed: false },
      ]);
      setNewCustomHabit('');
      setShowAddHabit(false);
    }
  };

  // const toggleCustomHabit = (index: number) => {
  //   const updated = [...customHabits];
  //   updated[index].completed = !updated[index].completed;
  //   setCustomHabits(updated);
  // };

  // const deleteCustomHabit = (index: number) => {
  //   setCustomHabits(customHabits.filter((_, i) => i !== index));
  // };

  const currentEntry = getEntryForDate(selectedDate);
  const totalDaysLogged = entries.length;
  const successRate =
    entries.length > 0
      ? Math.round(
          (entries.filter(
            (e) =>
              e.noSmoking &&
              e.noAlcohol &&
              e.noGambling &&
              e.noFastFood &&
              e.didSports,
          ).length /
            entries.length) *
            100,
        )
      : 0;

  const getHabitName = (habitId: string): string => {
    const names: Record<string, string> = {
      noSmoking: t('habits.no_smoking'),
      noAlcohol: t('habits.no_alcohol'),
      noGambling: t('habits.no_gambling'),
      noFastFood: t('habits.no_fast_food'),
      didSports: t('habits.did_sports'),
      meditation: t('habits.meditation'),
      reading: t('habits.reading'),
    };
    return names[habitId] || habitId;
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
            <i className='fas fa-plus text-xs'></i> {t('habits.add')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800'>
          <div className='text-xs text-gray-400 uppercase tracking-wide'>
            {t('habits.days_tracked')}
          </div>
          <div className='text-2xl font-light text-gray-700 dark:text-gray-300 mt-1'>
            {totalDaysLogged}
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800'>
          <div className='text-xs text-gray-400 uppercase tracking-wide'>
            {t('habits.perfect_days')}
          </div>
          <div className='text-2xl font-light text-green-600 dark:text-green-400 mt-1'>
            {successRate}%
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800'>
          <div className='text-xs text-gray-400 uppercase tracking-wide'>
            {t('habits.no_smoking')}
          </div>
          <div className='text-2xl font-light text-green-600 dark:text-green-400 mt-1'>
            {calculateStreak('noSmoking')} days
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800'>
          <div className='text-xs text-gray-400 uppercase tracking-wide'>
            {t('habits.no_alcohol')}
          </div>
          <div className='text-2xl font-light text-green-600 dark:text-green-400 mt-1'>
            {calculateStreak('noAlcohol')} days
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className='flex gap-2 border-b border-gray-200 dark:border-gray-800'>
        <button
          onClick={() => setSelectedView('daily')}
          className={`px-4 py-2 text-sm transition-all ${
            selectedView === 'daily'
              ? 'text-gray-800 dark:text-gray-200 border-b-2 border-gray-800 dark:border-gray-200'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {t('habits.daily')}
        </button>
        <button
          onClick={() => setSelectedView('weekly')}
          className={`px-4 py-2 text-sm transition-all ${
            selectedView === 'weekly'
              ? 'text-gray-800 dark:text-gray-200 border-b-2 border-gray-800 dark:border-gray-200'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {t('habits.weekly')}
        </button>
        <button
          onClick={() => setSelectedView('monthly')}
          className={`px-4 py-2 text-sm transition-all ${
            selectedView === 'monthly'
              ? 'text-gray-800 dark:text-gray-200 border-b-2 border-gray-800 dark:border-gray-200'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {t('habits.monthly')}
        </button>
      </div>

      {/* Habit Grid */}
      <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800'>
        <h3 className='font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2'>
          <i className='fas fa-calendar-check text-gray-400'></i>
          {t('habits.title')} - {selectedDate}
        </h3>

        {currentEntry ? (
          <div className='space-y-4'>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
              {defaultHabits.map((habit) => (
                <div
                  key={habit.id}
                  className={`p-3 rounded-lg ${currentEntry[habit.key as keyof HabitEntry] ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}
                >
                  <div className='flex items-center gap-2'>
                    <i
                      className={`${habit.icon} ${currentEntry[habit.key as keyof HabitEntry] ? 'text-green-600' : 'text-red-600'}`}
                    ></i>
                    <span className='text-sm'>{getHabitName(habit.id)}</span>
                    {currentEntry[habit.key as keyof HabitEntry] ? (
                      <i className='fas fa-check-circle text-green-500 ml-auto'></i>
                    ) : (
                      <i className='fas fa-times-circle text-red-500 ml-auto'></i>
                    )}
                  </div>
                </div>
              ))}
              {currentEntry.meditation !== undefined && (
                <div
                  className={`p-3 rounded-lg ${currentEntry.meditation ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}
                >
                  <div className='flex items-center gap-2'>
                    <i className='fas fa-pray text-blue-500'></i>
                    <span className='text-sm'>{t('habits.meditation')}</span>
                    {currentEntry.meditation ? (
                      <i className='fas fa-check-circle text-green-500 ml-auto'></i>
                    ) : (
                      <i className='fas fa-minus-circle text-gray-500 ml-auto'></i>
                    )}
                  </div>
                </div>
              )}
              {currentEntry.reading !== undefined && (
                <div
                  className={`p-3 rounded-lg ${currentEntry.reading ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}
                >
                  <div className='flex items-center gap-2'>
                    <i className='fas fa-book text-indigo-500'></i>
                    <span className='text-sm'>{t('habits.reading')}</span>
                    {currentEntry.reading ? (
                      <i className='fas fa-check-circle text-green-500 ml-auto'></i>
                    ) : (
                      <i className='fas fa-minus-circle text-gray-500 ml-auto'></i>
                    )}
                  </div>
                </div>
              )}
            </div>
            {currentEntry.notes && (
              <div className='text-sm text-gray-500 italic p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
                "{currentEntry.notes}"
              </div>
            )}
            <div className='flex gap-2'>
              <button
                onClick={() => editEntry(currentEntry)}
                className='px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition'
              >
                <i className='fas fa-edit mr-1'></i> {t('habits.edit')}
              </button>
              <button
                onClick={() => deleteEntry(currentEntry.date)}
                className='px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition'
              >
                <i className='fas fa-trash-alt mr-1'></i> Delete
              </button>
            </div>
          </div>
        ) : (
          <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
            <i className='fas fa-clipboard-list text-3xl mb-2 opacity-50'></i>
            <p className='text-sm'>{t('habits.history')}</p>
            <button
              onClick={() => setShowForm(true)}
              className='mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline'
            >
              {t('habits.add')} →
            </button>
          </div>
        )}
      </div>

      {/* Weekly Heatmap */}
      <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800'>
        <h3 className='font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2'>
          <i className='fas fa-fire text-gray-400'></i>
          {t('habits.weekly')} - {t('habits.no_smoking')}
        </h3>
        <div className='flex gap-2'>
          {getWeeklyCompletions('noSmoking').map((day, idx) => (
            <div key={idx} className='flex-1 text-center'>
              <div
                className={`h-12 rounded-lg ${day.completed ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'} transition-all`}
              ></div>
              <div className='text-xs mt-1 text-gray-500'>
                {day.date.slice(5)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tip Card */}
      <div className='bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800'>
        <div className='flex gap-3'>
          <i className='fas fa-info-circle text-gray-400 text-sm mt-0.5'></i>
          <div>
            <h4 className='font-medium text-sm text-gray-700 dark:text-gray-300 mb-1'>
              {t('habits.tip_title')}
            </h4>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              {t('habits.tip_text')}
            </p>
          </div>
        </div>
      </div>

      {/* Habit Form Modal */}
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
              className='bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto'
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className='font-medium text-gray-800 dark:text-gray-200 mb-4'>
                {editingId ? t('habits.edit') : t('habits.add')} -{' '}
                {selectedDate}
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

                <div className='space-y-3'>
                  {defaultHabits.map((habit) => (
                    <label
                      key={habit.id}
                      className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer'
                    >
                      <div className='flex items-center gap-3'>
                        <i className={habit.icon}></i>
                        <span className='text-sm'>
                          {getHabitName(habit.id)}
                        </span>
                      </div>
                      <input
                        type='checkbox'
                        checked={
                          habits[habit.key as keyof typeof habits] as boolean
                        }
                        onChange={(e) =>
                          setHabits({
                            ...habits,
                            [habit.key]: e.target.checked,
                          })
                        }
                        className='w-5 h-5 rounded'
                      />
                    </label>
                  ))}

                  <div className='border-t border-gray-200 dark:border-gray-700 pt-3'>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-sm font-medium'>
                        {t('habits.notes')}
                      </span>
                      <button
                        onClick={() => setShowAddHabit(true)}
                        className='text-xs text-blue-600 dark:text-blue-400'
                      >
                        <i className='fas fa-plus mr-1'></i>{' '}
                        {t('habits.add_custom')}
                      </button>
                    </div>
                    <div className='space-y-2'>
                      <label className='flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer'>
                        <div className='flex items-center gap-3'>
                          <i className='fas fa-pray text-blue-500'></i>
                          <span className='text-sm'>
                            {t('habits.meditation')}
                          </span>
                        </div>
                        <input
                          type='checkbox'
                          checked={habits.meditation}
                          onChange={(e) =>
                            setHabits({
                              ...habits,
                              meditation: e.target.checked,
                            })
                          }
                          className='w-5 h-5 rounded'
                        />
                      </label>
                      <label className='flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer'>
                        <div className='flex items-center gap-3'>
                          <i className='fas fa-book text-indigo-500'></i>
                          <span className='text-sm'>{t('habits.reading')}</span>
                        </div>
                        <input
                          type='checkbox'
                          checked={habits.reading}
                          onChange={(e) =>
                            setHabits({ ...habits, reading: e.target.checked })
                          }
                          className='w-5 h-5 rounded'
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('habits.notes')}
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
                  {t('habits.save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Custom Habit Modal */}
      <AnimatePresence>
        {showAddHabit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'
            onClick={() => setShowAddHabit(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className='bg-white dark:bg-gray-900 rounded-2xl p-6 w-80'
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className='font-medium text-gray-800 dark:text-gray-200 mb-4'>
                {t('habits.custom_habit_title')}
              </h3>
              <input
                type='text'
                value={newCustomHabit}
                onChange={(e) => setNewCustomHabit(e.target.value)}
                placeholder={t('habits.custom_habit_placeholder')}
                className='w-full px-3 py-2 text-sm border rounded-lg mb-4'
                autoFocus
              />
              <div className='flex gap-3'>
                <button
                  onClick={() => setShowAddHabit(false)}
                  className='flex-1 px-4 py-2 border rounded-lg text-sm'
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={addCustomHabit}
                  className='flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm'
                >
                  {t('common.add')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
