import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface DentalEntry {
  id: string;
  date: string;
  brushedMorning: boolean;
  brushedEvening: boolean;
  flossed: boolean;
  mouthwash: boolean;
  dentistVisit?: {
    date: string;
    reason: string;
    findings: string;
    nextVisit: string;
  };
  teethIssues?: {
    toothNumber: number;
    issue: string;
    severity: 1 | 2 | 3 | 4 | 5;
    treated: boolean;
  }[];
  notes?: string;
}

interface DentalTrackerProps {
  onBack: () => void;
}

const getToothNumbers = () => {
  return [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32,
  ];
};

export default function DentalTracker({ onBack }: DentalTrackerProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [entries, setEntries] = useState<DentalEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [brushedMorning, setBrushedMorning] = useState(false);
  const [brushedEvening, setBrushedEvening] = useState(false);
  const [flossed, setFlossed] = useState(false);
  const [mouthwash, setMouthwash] = useState(false);
  const [notes, setNotes] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDentistModal, setShowDentistModal] = useState(false);
  const [showTeethIssues, setShowTeethIssues] = useState(false);
  const [dentistVisit, setDentistVisit] = useState({
    date: '',
    reason: '',
    findings: '',
    nextVisit: '',
  });
  const [teethIssues, setTeethIssues] = useState<
    {
      toothNumber: number;
      issue: string;
      severity: 1 | 2 | 3 | 4 | 5;
      treated: boolean;
    }[]
  >([]);
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [newIssue, setNewIssue] = useState('');
  const [newSeverity, setNewSeverity] = useState<1 | 2 | 3 | 4 | 5>(3);

  useEffect(() => {
    const saved = localStorage.getItem('omni_dental');
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('omni_dental', JSON.stringify(entries));
  }, [entries]);

  const getEntryForDate = (date: string): DentalEntry | undefined => {
    return entries.find((e) => e.date === date);
  };

  const getStreak = (
    habit: 'brushedMorning' | 'brushedEvening' | 'flossed',
  ): number => {
    let streak = 0;
    const sortedEntries = [...entries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    for (const entry of sortedEntries) {
      if (entry[habit]) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const getMonthlyStats = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyEntries = entries.filter(
      (e) => new Date(e.date) >= startOfMonth,
    );
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    ).getDate();
    const brushedMorningCount = monthlyEntries.filter(
      (e) => e.brushedMorning,
    ).length;
    const brushedEveningCount = monthlyEntries.filter(
      (e) => e.brushedEvening,
    ).length;
    const flossedCount = monthlyEntries.filter((e) => e.flossed).length;

    return {
      totalDays: monthlyEntries.length,
      brushedMorning: Math.round((brushedMorningCount / daysInMonth) * 100),
      brushedEvening: Math.round((brushedEveningCount / daysInMonth) * 100),
      flossed: Math.round((flossedCount / daysInMonth) * 100),
    };
  };

  const saveEntry = () => {
    const existingEntry = getEntryForDate(selectedDate);

    const entry: DentalEntry = {
      id: editingId || existingEntry?.id || Date.now().toString(),
      date: selectedDate,
      brushedMorning,
      brushedEvening,
      flossed,
      mouthwash,
      dentistVisit: dentistVisit.date ? dentistVisit : undefined,
      teethIssues: teethIssues.length > 0 ? teethIssues : undefined,
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

  const editEntry = (entry: DentalEntry) => {
    setEditingId(entry.id);
    setSelectedDate(entry.date);
    setBrushedMorning(entry.brushedMorning);
    setBrushedEvening(entry.brushedEvening);
    setFlossed(entry.flossed);
    setMouthwash(entry.mouthwash);
    if (entry.dentistVisit) setDentistVisit(entry.dentistVisit);
    if (entry.teethIssues) setTeethIssues(entry.teethIssues);
    setNotes(entry.notes || '');
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setBrushedMorning(false);
    setBrushedEvening(false);
    setFlossed(false);
    setMouthwash(false);
    setDentistVisit({ date: '', reason: '', findings: '', nextVisit: '' });
    setTeethIssues([]);
    setNotes('');
    setShowForm(false);
    setShowDentistModal(false);
    setShowTeethIssues(false);
  };

  const addTeethIssue = () => {
    if (selectedTooth && newIssue) {
      setTeethIssues([
        ...teethIssues,
        {
          toothNumber: selectedTooth,
          issue: newIssue,
          severity: newSeverity,
          treated: false,
        },
      ]);
      setSelectedTooth(null);
      setNewIssue('');
      setNewSeverity(3);
    }
  };

  const removeTeethIssue = (index: number) => {
    setTeethIssues(teethIssues.filter((_, i) => i !== index));
  };

  const currentEntry = getEntryForDate(selectedDate);
  const monthlyStats = getMonthlyStats();
  const brushingStreak = getStreak('brushedMorning');
  const flossingStreak = getStreak('flossed');

  const severityColors = {
    1: 'bg-green-500',
    2: 'bg-lime-500',
    3: 'bg-yellow-500',
    4: 'bg-orange-500',
    5: 'bg-red-500',
  };

  const toothNumbers = getToothNumbers();

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
            className='px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900'
          />
          <button
            onClick={() => setShowForm(true)}
            className='px-4 py-1.5 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-all flex items-center gap-2 text-sm'
          >
            <i className='fas fa-tooth text-xs'></i> {t('dental.add')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('dental.brushing_streak')}
          </div>
          <div className='text-2xl font-light text-blue-600 dark:text-blue-400 mt-1'>
            {brushingStreak} {t('common.days')}
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('dental.flossing_streak')}
          </div>
          <div className='text-2xl font-light text-green-600 dark:text-green-400 mt-1'>
            {flossingStreak} {t('common.days')}
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('dental.monthly_brushing')}
          </div>
          <div className='text-2xl font-light text-gray-700 dark:text-gray-300 mt-1'>
            {monthlyStats.brushedMorning}%
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('dental.issues')}
          </div>
          <div className='text-2xl font-light text-red-600 dark:text-red-400 mt-1'>
            {teethIssues.length}
          </div>
        </div>
      </div>

      {/* Current Day Display */}
      <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border'>
        <h3 className='font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2'>
          <i className='fas fa-calendar-day text-gray-400'></i>{' '}
          {t('dental.title')} - {selectedDate}
        </h3>
        {currentEntry ? (
          <div className='space-y-4'>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
              <div
                className={`p-3 rounded-lg text-center ${currentEntry.brushedMorning ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}
              >
                <i
                  className={`fas fa-sun text-lg ${currentEntry.brushedMorning ? 'text-green-600' : 'text-red-600'}`}
                ></i>
                <div className='text-sm mt-1'>
                  {t('dental.brushed_morning')}
                </div>
              </div>
              <div
                className={`p-3 rounded-lg text-center ${currentEntry.brushedEvening ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}
              >
                <i
                  className={`fas fa-moon text-lg ${currentEntry.brushedEvening ? 'text-green-600' : 'text-red-600'}`}
                ></i>
                <div className='text-sm mt-1'>
                  {t('dental.brushed_evening')}
                </div>
              </div>
              <div
                className={`p-3 rounded-lg text-center ${currentEntry.flossed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}
              >
                <i
                  className={`fas fa-dental-floss text-lg ${currentEntry.flossed ? 'text-green-600' : 'text-gray-500'}`}
                ></i>
                <div className='text-sm mt-1'>{t('dental.flossed')}</div>
              </div>
              <div
                className={`p-3 rounded-lg text-center ${currentEntry.mouthwash ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}
              >
                <i
                  className={`fas fa-water text-lg ${currentEntry.mouthwash ? 'text-green-600' : 'text-gray-500'}`}
                ></i>
                <div className='text-sm mt-1'>{t('dental.mouthwash')}</div>
              </div>
            </div>
            {currentEntry.dentistVisit && (
              <div className='p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
                <div className='flex items-center gap-2 mb-2'>
                  <i className='fas fa-stethoscope text-blue-600'></i>
                  <span className='font-medium text-sm'>
                    {t('dental.dentist_visit')}
                  </span>
                </div>
                <div className='text-sm'>
                  {currentEntry.dentistVisit.date} -{' '}
                  {currentEntry.dentistVisit.findings}
                </div>
              </div>
            )}
            {currentEntry.notes && (
              <div className='text-sm text-gray-500 italic p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
                "{currentEntry.notes}"
              </div>
            )}
            <div className='flex gap-2'>
              <button
                onClick={() => editEntry(currentEntry)}
                className='px-3 py-1 text-xs bg-gray-100 rounded-lg'
              >
                {t('dental.edit')}
              </button>
              <button
                onClick={() => deleteEntry(currentEntry.date)}
                className='px-3 py-1 text-xs bg-gray-100 text-red-600 rounded-lg'
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        ) : (
          <div className='text-center py-8 text-gray-500'>
            <i className='fas fa-tooth text-3xl mb-2 opacity-50'></i>
            <p className='text-sm'>{t('dental.no_entries')}</p>
            <button
              onClick={() => setShowForm(true)}
              className='mt-3 text-sm text-blue-600 hover:underline'
            >
              {t('dental.add')} →
            </button>
          </div>
        )}
      </div>

      {/* History Table */}
      <div className='bg-white dark:bg-gray-900 rounded-xl shadow-sm border overflow-hidden'>
        <div className='px-6 py-4 border-b'>
          <h3 className='font-medium flex items-center gap-2'>
            <i className='fas fa-history text-gray-400 text-sm'></i>{' '}
            {t('dental.history')}{' '}
            <span className='text-xs text-gray-400 ml-2'>
              ({entries.length} {t('dental.entries')})
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
                  {t('dental.brushed_morning')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase'>
                  {t('dental.brushed_evening')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase'>
                  {t('dental.flossed')}
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100 dark:divide-gray-800'>
              {entries.slice(0, 10).map((entry) => (
                <tr
                  key={entry.id}
                  className='hover:bg-gray-50 dark:hover:bg-gray-800/50 transition'
                >
                  <td className='px-6 py-3 text-sm text-gray-600'>
                    {entry.date}
                  </td>
                  <td className='px-6 py-3 text-sm'>
                    {entry.brushedMorning ? '✓' : '✗'}
                  </td>
                  <td className='px-6 py-3 text-sm'>
                    {entry.brushedEvening ? '✓' : '✗'}
                  </td>
                  <td className='px-6 py-3 text-sm'>
                    {entry.flossed ? '✓' : '✗'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tip Card */}
      <div className='bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border'>
        <div className='flex gap-3'>
          <i className='fas fa-info-circle text-gray-400 text-sm mt-0.5'></i>
          <div>
            <h4 className='font-medium text-sm text-gray-700 dark:text-gray-300 mb-1'>
              {t('dental.tip_title')}
            </h4>
            <p className='text-xs text-gray-500'>{t('dental.tip_text')}</p>
          </div>
        </div>
      </div>

      {/* Form Modal */}
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
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className='bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md'
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className='font-medium text-gray-800 dark:text-gray-200 mb-4'>
                {editingId ? t('dental.edit') : t('dental.add')} -{' '}
                {selectedDate}
              </h3>
              <div className='space-y-4'>
                <input
                  type='date'
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                />
                <div className='space-y-3'>
                  <label className='flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer'>
                    <span>
                      <i className='fas fa-sun mr-2'></i>
                      {t('dental.brushed_morning')}
                    </span>
                    <input
                      type='checkbox'
                      checked={brushedMorning}
                      onChange={(e) => setBrushedMorning(e.target.checked)}
                      className='w-5 h-5 rounded'
                    />
                  </label>
                  <label className='flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer'>
                    <span>
                      <i className='fas fa-moon mr-2'></i>
                      {t('dental.brushed_evening')}
                    </span>
                    <input
                      type='checkbox'
                      checked={brushedEvening}
                      onChange={(e) => setBrushedEvening(e.target.checked)}
                      className='w-5 h-5 rounded'
                    />
                  </label>
                  <label className='flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer'>
                    <span>
                      <i className='fas fa-dental-floss mr-2'></i>
                      {t('dental.flossed')}
                    </span>
                    <input
                      type='checkbox'
                      checked={flossed}
                      onChange={(e) => setFlossed(e.target.checked)}
                      className='w-5 h-5 rounded'
                    />
                  </label>
                  <label className='flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer'>
                    <span>
                      <i className='fas fa-water mr-2'></i>
                      {t('dental.mouthwash')}
                    </span>
                    <input
                      type='checkbox'
                      checked={mouthwash}
                      onChange={(e) => setMouthwash(e.target.checked)}
                      className='w-5 h-5 rounded'
                    />
                  </label>
                </div>
                <div className='flex gap-2'>
                  <button
                    onClick={() => setShowDentistModal(true)}
                    className='flex-1 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg'
                  >
                    <i className='fas fa-stethoscope mr-2'></i>
                    {t('dental.dentist_visit')}
                  </button>
                  <button
                    onClick={() => setShowTeethIssues(true)}
                    className='flex-1 py-2 text-sm bg-red-50 text-red-600 rounded-lg'
                  >
                    <i className='fas fa-tooth mr-2'></i>
                    {t('dental.issues')}
                  </button>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('dental.notes')}
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
                  {t('dental.save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dentist Visit Modal */}
      <AnimatePresence>
        {showDentistModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
            onClick={() => setShowDentistModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className='bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md'
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className='font-medium text-gray-800 dark:text-gray-200 mb-4'>
                {t('dental.dentist_visit')}
              </h3>
              <div className='space-y-3'>
                <input
                  type='date'
                  value={dentistVisit.date}
                  onChange={(e) =>
                    setDentistVisit({ ...dentistVisit, date: e.target.value })
                  }
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                  placeholder={t('dental.visit_date')}
                />
                <input
                  type='text'
                  value={dentistVisit.reason}
                  onChange={(e) =>
                    setDentistVisit({ ...dentistVisit, reason: e.target.value })
                  }
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                  placeholder={t('dental.visit_reason')}
                />
                <textarea
                  value={dentistVisit.findings}
                  onChange={(e) =>
                    setDentistVisit({
                      ...dentistVisit,
                      findings: e.target.value,
                    })
                  }
                  className='w-full px-3 py-2 text-sm border rounded-lg resize-none'
                  placeholder={t('dental.visit_findings')}
                  rows={2}
                />
                <input
                  type='date'
                  value={dentistVisit.nextVisit}
                  onChange={(e) =>
                    setDentistVisit({
                      ...dentistVisit,
                      nextVisit: e.target.value,
                    })
                  }
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                  placeholder={t('dental.next_visit')}
                />
              </div>
              <div className='flex gap-3 mt-6'>
                <button
                  onClick={() => setShowDentistModal(false)}
                  className='flex-1 px-4 py-2 border rounded-lg text-sm'
                >
                  {t('common.close')}
                </button>
                <button
                  onClick={() => setShowDentistModal(false)}
                  className='flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm'
                >
                  {t('common.save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Teeth Issues Modal */}
      <AnimatePresence>
        {showTeethIssues && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
            onClick={() => setShowTeethIssues(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className='bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md'
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className='font-medium text-gray-800 dark:text-gray-200 mb-4'>
                {t('dental.teeth_issues')}
              </h3>
              {teethIssues.length > 0 && (
                <div className='mb-4 space-y-2'>
                  {teethIssues.map((issue, idx) => (
                    <div
                      key={idx}
                      className='flex justify-between items-center p-2 bg-gray-50 rounded-lg'
                    >
                      <div>
                        <span className='font-medium'>
                          {t('dental.tooth_number')} #{issue.toothNumber}
                        </span>
                        <span className='text-sm ml-2'>{issue.issue}</span>
                      </div>
                      <button
                        onClick={() => removeTeethIssue(idx)}
                        className='text-red-500'
                      >
                        <i className='fas fa-trash-alt text-xs'></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className='space-y-3'>
                <div className='grid grid-cols-8 gap-1 max-h-32 overflow-y-auto'>
                  {toothNumbers.map((num) => (
                    <button
                      key={num}
                      onClick={() => setSelectedTooth(num)}
                      className={`p-2 text-xs rounded-lg ${selectedTooth === num ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <input
                  type='text'
                  value={newIssue}
                  onChange={(e) => setNewIssue(e.target.value)}
                  placeholder={t('dental.issue')}
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                />
                <div className='flex gap-2'>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setNewSeverity(s as any)}
                      className={`flex-1 py-2 rounded-lg text-sm ${
                        newSeverity === s
                          ? severityColors[s as 1 | 2 | 3 | 4 | 5] +
                            ' text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <button
                  onClick={addTeethIssue}
                  disabled={!selectedTooth || !newIssue}
                  className='w-full py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50'
                >
                  {t('dental.add_issue')}
                </button>
              </div>
              <div className='flex gap-3 mt-6'>
                <button
                  onClick={() => setShowTeethIssues(false)}
                  className='flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm'
                >
                  {t('common.done')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
