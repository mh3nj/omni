import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ExerciseEntry {
  id: string;
  date: string;
  exercise: string;
  reps: number;
  painBefore: number;
  painAfter: number;
  notes?: string;
}

const getExercises = (t: (key: string) => string) => [
  {
    name: t('hand.wrist_circles'),
    description: t('hand.wrist_circles_desc'),
    duration: 30,
  },
  {
    name: t('hand.finger_stretches'),
    description: t('hand.finger_stretches_desc'),
    duration: 10,
  },
  {
    name: t('hand.fist_clenches'),
    description: t('hand.fist_clenches_desc'),
    duration: 5,
  },
  {
    name: t('hand.thumb_touches'),
    description: t('hand.thumb_touches_desc'),
    duration: 15,
  },
  {
    name: t('hand.prayer_stretch'),
    description: t('hand.prayer_stretch_desc'),
    duration: 20,
  },
  {
    name: t('hand.wrist_flex_extend'),
    description: t('hand.wrist_flex_extend_desc'),
    duration: 10,
  },
];

export default function HandGestureTracker() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [entries, setEntries] = useState<ExerciseEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [exercise, setExercise] = useState('');
  const [reps, setReps] = useState('');
  const [painBefore, setPainBefore] = useState(5);
  const [painAfter, setPainAfter] = useState(5);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('omni_hand_gesture');
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('omni_hand_gesture', JSON.stringify(entries));
  }, [entries]);

  const saveEntry = () => {
    if (!exercise) return;
    const entry: ExerciseEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      exercise,
      reps: parseInt(reps) || 0,
      painBefore,
      painAfter,
      notes: notes || undefined,
    };
    setEntries([entry, ...entries]);
    resetForm();
  };

  const deleteEntry = (id: string) =>
    setEntries(entries.filter((e) => e.id !== id));

  const resetForm = () => {
    setShowForm(false);
    setExercise('');
    setReps('');
    setPainBefore(5);
    setPainAfter(5);
    setNotes('');
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const getTotalSessions = () => entries.length;
  const getAvgPainReduction = () => {
    if (entries.length === 0) return 0;
    const totalReduction = entries.reduce(
      (sum, e) => sum + (e.painBefore - e.painAfter),
      0,
    );
    return (totalReduction / entries.length).toFixed(1);
  };
  const getTodayEntry = () => entries.find((e) => e.date === selectedDate);
  const exercises = getExercises(t);

  return (
    <div className='space-y-6' dir={isRTL ? 'rtl' : 'ltr'}>
      <div className='flex justify-between items-center'>
        <h2 className='text-xl font-semibold text-gray-800 dark:text-gray-200'>
          <i className='fas fa-hand-peace mr-2 text-primary-500'></i>{' '}
          {t('hand.title')}
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className='px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2'
        >
          <i className='fas fa-plus'></i> {t('hand.log_exercise')}
        </button>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400'>
            {t('hand.total_sessions')}
          </div>
          <div className='text-2xl font-light mt-1'>{getTotalSessions()}</div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400'>
            {t('hand.avg_pain_reduction')}
          </div>
          <div className='text-2xl font-light text-green-600 mt-1'>
            {getAvgPainReduction()} {t('hand.points')}
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400'>{t('hand.exercises')}</div>
          <div className='text-2xl font-light mt-1'>{exercises.length}</div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400'>{t('hand.last_session')}</div>
          <div className='text-sm font-medium mt-1'>
            {entries[0]?.date || '—'}
          </div>
        </div>
      </div>

      <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border'>
        <h3 className='font-medium text-gray-700 dark:text-gray-300 mb-4'>
          <i className='fas fa-calendar-day mr-2 text-primary-500'></i>{' '}
          {t('common.today')} - {selectedDate}
        </h3>
        {getTodayEntry() ? (
          <div className='space-y-3'>
            <div className='p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
              <div className='font-medium'>{getTodayEntry()!.exercise}</div>
              <div className='text-sm text-gray-600'>
                {getTodayEntry()!.reps} {t('hand.reps')}
              </div>
              <div className='flex justify-between mt-2 text-sm'>
                <span>
                  {t('hand.pain_before')}: {getTodayEntry()!.painBefore}/10
                </span>
                <span>
                  {t('hand.pain_after')}: {getTodayEntry()!.painAfter}/10
                </span>
              </div>
              <div
                className={`text-sm mt-1 ${getTodayEntry()!.painAfter < getTodayEntry()!.painBefore ? 'text-green-600' : 'text-gray-500'}`}
              >
                {t('hand.change')}:{' '}
                {getTodayEntry()!.painAfter - getTodayEntry()!.painBefore > 0
                  ? '+'
                  : ''}
                {getTodayEntry()!.painAfter - getTodayEntry()!.painBefore}
              </div>
            </div>
            {getTodayEntry()!.notes && (
              <div className='text-sm text-gray-500 italic'>
                "{getTodayEntry()!.notes}"
              </div>
            )}
          </div>
        ) : (
          <div className='text-center py-8 text-gray-500'>
            <i className='fas fa-hand-peace text-3xl mb-2 opacity-50'></i>
            <p>{t('hand.no_exercises')}</p>
          </div>
        )}
      </div>

      <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border'>
        <h3 className='font-medium text-gray-700 dark:text-gray-300 mb-4'>
          <i className='fas fa-dumbbell mr-2 text-primary-500'></i>{' '}
          {t('hand.exercise_guide')}
        </h3>
        <div className='space-y-2'>
          {exercises.map((ex) => (
            <div
              key={ex.name}
              className='flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg'
            >
              <div>
                <div className='font-medium text-sm'>{ex.name}</div>
                <div className='text-xs text-gray-500'>{ex.description}</div>
              </div>
              <div className='text-xs text-gray-400'>{ex.duration} sec</div>
            </div>
          ))}
        </div>
      </div>

      <div className='bg-white dark:bg-gray-900 rounded-xl shadow-sm border overflow-hidden'>
        <div className='px-6 py-4 border-b'>
          <h3 className='font-medium'>
            <i className='fas fa-history mr-2 text-primary-500'></i>{' '}
            {t('hand.history')}
          </h3>
        </div>
        <div className='divide-y divide-gray-100 dark:divide-gray-800'>
          {entries.length === 0 ? (
            <div className='px-6 py-8 text-center text-gray-500'>
              <i className='fas fa-dumbbell text-4xl mb-2 opacity-50'></i>
              <p>{t('hand.no_exercises')}</p>
            </div>
          ) : (
            entries.slice(0, 20).map((entry) => (
              <div
                key={entry.id}
                className='px-6 py-3 flex justify-between items-center hover:bg-gray-50 transition'
              >
                <div>
                  <div className='font-medium'>
                    {entry.date} - {entry.exercise}
                  </div>
                  <div className='text-sm text-gray-500'>
                    {entry.reps} {t('hand.reps')} • {t('hand.pain')}:{' '}
                    {entry.painBefore}→{entry.painAfter}
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
            <h4 className='font-medium text-sm'>{t('hand.tip_title')}</h4>
            <p className='text-xs text-gray-500'>{t('hand.tip_text')}</p>
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
              <h3 className='font-medium mb-4'>{t('hand.log_exercise')}</h3>
              <div className='space-y-4'>
                <input
                  type='date'
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                />
                <select
                  value={exercise}
                  onChange={(e) => setExercise(e.target.value)}
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                >
                  <option value=''>{t('hand.select_exercise')}</option>
                  {exercises.map((ex) => (
                    <option key={ex.name} value={ex.name}>
                      {ex.name}
                    </option>
                  ))}
                </select>
                <input
                  type='number'
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  placeholder={t('hand.reps_placeholder')}
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                />
                <div>
                  <label className='block text-xs text-gray-500 mb-1'>
                    {t('hand.pain_before')} (1-10)
                  </label>
                  <input
                    type='range'
                    min='1'
                    max='10'
                    value={painBefore}
                    onChange={(e) => setPainBefore(parseInt(e.target.value))}
                    className='w-full'
                  />
                  <div className='text-center text-sm mt-1'>
                    {painBefore}/10
                  </div>
                </div>
                <div>
                  <label className='block text-xs text-gray-500 mb-1'>
                    {t('hand.pain_after')} (1-10)
                  </label>
                  <input
                    type='range'
                    min='1'
                    max='10'
                    value={painAfter}
                    onChange={(e) => setPainAfter(parseInt(e.target.value))}
                    className='w-full'
                  />
                  <div className='text-center text-sm mt-1'>{painAfter}/10</div>
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
