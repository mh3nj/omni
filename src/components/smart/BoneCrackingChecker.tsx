import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface CrackingEntry {
  id: string;
  date: string;
  noCracking: boolean;
  timesCracked?: number;
  jointsCracked?: string[];
  notes?: string;
}

const joints = ['Neck', 'Back', 'Fingers', 'Wrists', 'Knees', 'Ankles', 'Toes'];

export default function BoneCrackingChecker() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [entries, setEntries] = useState<CrackingEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [noCracking, setNoCracking] = useState(false);
  const [timesCracked, setTimesCracked] = useState('');
  const [selectedJoints, setSelectedJoints] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('omni_bone_cracking');
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('omni_bone_cracking', JSON.stringify(entries));
  }, [entries]);

  const saveEntry = () => {
    const entry: CrackingEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      noCracking,
      timesCracked:
        !noCracking && timesCracked ? parseInt(timesCracked) : undefined,
      jointsCracked:
        !noCracking && selectedJoints.length > 0 ? selectedJoints : undefined,
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
    setNoCracking(false);
    setTimesCracked('');
    setSelectedJoints([]);
    setNotes('');
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const toggleJoint = (joint: string) => {
    if (selectedJoints.includes(joint)) {
      setSelectedJoints(selectedJoints.filter((j) => j !== joint));
    } else {
      setSelectedJoints([...selectedJoints, joint]);
    }
  };

  const getStreak = () => {
    let streak = 0;
    for (const entry of entries) {
      if (entry.noCracking) streak++;
      else break;
    }
    return streak;
  };

  const getTodayEntry = () => entries.find((e) => e.date === selectedDate);
  const getSuccessRate = () => {
    if (entries.length === 0) return 0;
    const successCount = entries.filter((e) => e.noCracking).length;
    return Math.round((successCount / entries.length) * 100);
  };
  const getBestStreak = () => {
    let maxStreak = 0;
    let currentStreak = 0;
    for (const entry of entries) {
      if (entry.noCracking) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    return maxStreak;
  };

  return (
    <div className='space-y-6' dir={isRTL ? 'rtl' : 'ltr'}>
      <div className='flex justify-between items-center'>
        <h2 className='text-xl font-semibold text-gray-800 dark:text-gray-200'>
          <i className='fas fa-bone mr-2 text-primary-500'></i>{' '}
          {t('smart_tools.bone_cracking')}
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className='px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2'
        >
          <i className='fas fa-plus'></i> {t('common.log_today')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-4 text-white text-center'>
          <div className='text-3xl font-bold'>{getStreak()}</div>
          <p className='text-xs opacity-90 mt-1'>
            {t('common.current_streak')}
          </p>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400'>
            {t('habits.days_tracked')}
          </div>
          <div className='text-2xl font-light mt-1'>{entries.length}</div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400'>
            {t('common.success_rate')}
          </div>
          <div className='text-2xl font-light mt-1'>{getSuccessRate()}%</div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400'>{t('common.best_streak')}</div>
          <div className='text-2xl font-light mt-1'>{getBestStreak()}</div>
        </div>
      </div>

      {/* Today's Entry */}
      <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border'>
        <h3 className='font-medium text-gray-700 dark:text-gray-300 mb-4'>
          <i className='fas fa-calendar-day mr-2 text-primary-500'></i>{' '}
          {t('common.today')} - {selectedDate}
        </h3>
        {getTodayEntry() ? (
          <div>
            <div
              className={`p-4 rounded-lg text-center ${getTodayEntry()!.noCracking ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
            >
              <i
                className={`fas ${getTodayEntry()!.noCracking ? 'fa-check-circle' : 'fa-exclamation-triangle'} text-2xl mb-2`}
              ></i>
              <p>
                {getTodayEntry()!.noCracking
                  ? t('bone_cracking.success_message')
                  : t('bone_cracking.failure_message', {
                      count: getTodayEntry()!.timesCracked || '?',
                    })}
              </p>
              {getTodayEntry()!.jointsCracked && (
                <p className='text-sm mt-1'>
                  {t('bone_cracking.joints', {
                    joints: getTodayEntry()?.jointsCracked?.join(', ') || '',
                  })}
                </p>
              )}
              {getTodayEntry()!.notes && (
                <p className='text-sm text-gray-500 italic mt-2'>
                  "{getTodayEntry()!.notes}"
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className='text-center py-8 text-gray-500'>
            <i className='fas fa-bone text-3xl mb-2 opacity-50'></i>
            <p>{t('common.no_data')}</p>
          </div>
        )}
      </div>

      {/* History */}
      <div className='bg-white dark:bg-gray-900 rounded-xl shadow-sm border overflow-hidden'>
        <div className='px-6 py-4 border-b'>
          <h3 className='font-medium'>
            <i className='fas fa-history mr-2 text-primary-500'></i>{' '}
            {t('common.history')}
          </h3>
        </div>
        <div className='divide-y divide-gray-100 dark:divide-gray-800'>
          {entries.length === 0 ? (
            <div className='px-6 py-8 text-center text-gray-500'>
              <i className='fas fa-calendar-alt text-4xl mb-2 opacity-50'></i>
              <p>{t('common.no_entries')}</p>
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
                    {entry.noCracking
                      ? '✅ ' + t('bone_cracking.no_cracking')
                      : `⚠️ ${t('bone_cracking.cracked_count', { count: entry.timesCracked })}`}
                    {entry.jointsCracked &&
                      entry.jointsCracked.length > 0 &&
                      ` • ${entry.jointsCracked.join(', ')}`}
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

      {/* Tip Card */}
      <div className='bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border'>
        <div className='flex gap-3'>
          <i className='fas fa-info-circle text-gray-400 text-sm mt-0.5'></i>
          <div>
            <h4 className='font-medium text-sm'>
              {t('bone_cracking.tip_title')}
            </h4>
            <p className='text-xs text-gray-500'>
              {t('bone_cracking.tip_text')}
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
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
                {t('common.log_today')} - {selectedDate}
              </h3>
              <div className='space-y-4'>
                <label className='flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer'>
                  <span>
                    <i className='fas fa-check-circle mr-2 text-green-500'></i>{' '}
                    {t('bone_cracking.no_cracking_today')}
                  </span>
                  <input
                    type='checkbox'
                    checked={noCracking}
                    onChange={(e) => setNoCracking(e.target.checked)}
                    className='w-5 h-5'
                  />
                </label>
                {!noCracking && (
                  <>
                    <input
                      type='number'
                      value={timesCracked}
                      onChange={(e) => setTimesCracked(e.target.value)}
                      placeholder={t('bone_cracking.how_many_times')}
                      className='w-full px-3 py-2 text-sm border rounded-lg'
                    />
                    <div>
                      <label className='block text-xs text-gray-500 mb-2'>
                        {t('bone_cracking.which_joints')}
                      </label>
                      <div className='flex flex-wrap gap-2'>
                        {joints.map((j) => (
                          <button
                            key={j}
                            onClick={() => toggleJoint(j)}
                            className={`px-2 py-1 text-xs rounded-full ${selectedJoints.includes(j) ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                          >
                            {t(`bone_cracking.joints_list.${j.toLowerCase()}`)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
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
