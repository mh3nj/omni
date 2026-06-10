import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Pill {
  id: string;
  name: string;
  dosage: string;
  frequency: 'daily' | 'multiple' | 'weekly';
  times: string[];
  startDate: string;
  endDate?: string;
  notes?: string;
  active: boolean;
}

interface PillLog {
  id: string;
  pillId: string;
  scheduledTime: string;
  takenTime?: string;
  status: 'taken' | 'missed' | 'snoozed';
  date: string;
}

export default function PillTracker() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [pills, setPills] = useState<Pill[]>([]);
  const [logs, setLogs] = useState<PillLog[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [pillName, setPillName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'multiple' | 'weekly'>(
    'daily',
  );
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const savedPills = localStorage.getItem('omni_pills');
    const savedLogs = localStorage.getItem('omni_pill_logs');
    if (savedPills) setPills(JSON.parse(savedPills));
    if (savedLogs) setLogs(JSON.parse(savedLogs));
  }, []);

  useEffect(() => {
    localStorage.setItem('omni_pills', JSON.stringify(pills));
    localStorage.setItem('omni_pill_logs', JSON.stringify(logs));
  }, [pills, logs]);

  const savePill = () => {
    if (!pillName) return;

    const pill: Pill = {
      id: editingId || Date.now().toString(),
      name: pillName,
      dosage,
      frequency,
      times,
      startDate,
      endDate: endDate || undefined,
      notes: notes || undefined,
      active: true,
    };

    if (editingId) {
      setPills(pills.map((p) => (p.id === editingId ? pill : p)));
    } else {
      setPills([...pills, pill]);
    }
    resetForm();
  };

  const deletePill = (id: string) => {
    if (confirm(t('pill.delete_confirm'))) {
      setPills(pills.filter((p) => p.id !== id));
    }
  };

  const togglePillActive = (id: string) => {
    setPills(pills.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));
  };

  const markTaken = (pillId: string, time: string) => {
    const today = new Date().toISOString().split('T')[0];
    const existingLog = logs.find(
      (l) =>
        l.pillId === pillId && l.scheduledTime === time && l.date === today,
    );

    if (existingLog) {
      setLogs(
        logs.map((l) =>
          l.id === existingLog.id
            ? { ...l, takenTime: new Date().toISOString(), status: 'taken' }
            : l,
        ),
      );
    } else {
      const newLog: PillLog = {
        id: Date.now().toString(),
        pillId,
        scheduledTime: time,
        takenTime: new Date().toISOString(),
        status: 'taken',
        date: today,
      };
      setLogs([...logs, newLog]);
    }
  };

  const getTodayLogs = (pillId: string, time: string) => {
    const today = new Date().toISOString().split('T')[0];
    return logs.find(
      (l) =>
        l.pillId === pillId && l.scheduledTime === time && l.date === today,
    );
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setPillName('');
    setDosage('');
    setFrequency('daily');
    setTimes(['08:00']);
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setNotes('');
  };

  const addTime = () => setTimes([...times, '12:00']);
  const removeTime = (index: number) =>
    setTimes(times.filter((_, i) => i !== index));
  const updateTime = (index: number, value: string) => {
    const newTimes = [...times];
    newTimes[index] = value;
    setTimes(newTimes);
  };

  const getDueToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return pills.filter((pill) => {
      if (!pill.active) return false;
      if (pill.startDate > today) return false;
      if (pill.endDate && pill.endDate < today) return false;
      return true;
    });
  };

  const getFrequencyLabel = (freq: string) => {
    const labels: Record<string, string> = {
      daily: t('pill.daily'),
      multiple: t('pill.multiple'),
      weekly: t('pill.weekly'),
    };
    return labels[freq] || freq;
  };

  return (
    <div className='space-y-6' dir={isRTL ? 'rtl' : 'ltr'}>
      <div className='flex justify-between items-center'>
        <h2 className='text-xl font-semibold text-gray-800 dark:text-gray-200'>
          <i className='fas fa-pills mr-2 text-primary-500'></i>{' '}
          {t('pill.title')}
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className='px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2'
        >
          <i className='fas fa-plus'></i> {t('pill.add')}
        </button>
      </div>

      {/* Today's Medications */}
      <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border'>
        <h3 className='font-medium text-gray-700 dark:text-gray-300 mb-4'>
          <i className='fas fa-calendar-day mr-2 text-primary-500'></i>{' '}
          {t('pill.today_due')}
        </h3>
        {getDueToday().length === 0 ? (
          <div className='text-center py-8 text-gray-500'>
            <i className='fas fa-check-circle text-4xl mb-2 text-green-500'></i>
            <p>{t('pill.none_due')}</p>
          </div>
        ) : (
          <div className='space-y-4'>
            {getDueToday().map((pill) => (
              <div
                key={pill.id}
                className='border-b border-gray-100 pb-3 last:border-0'
              >
                <div className='flex justify-between items-start mb-2'>
                  <div>
                    <h4 className='font-medium'>{pill.name}</h4>
                    <p className='text-sm text-gray-500'>{pill.dosage}</p>
                  </div>
                  <button
                    onClick={() => deletePill(pill.id)}
                    className='text-gray-400 hover:text-red-500'
                  >
                    <i className='fas fa-trash-alt'></i>
                  </button>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {pill.times.map((time) => {
                    const taken = getTodayLogs(pill.id, time);
                    return (
                      <button
                        key={time}
                        onClick={() => !taken && markTaken(pill.id, time)}
                        className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${
                          taken
                            ? 'bg-green-100 text-green-700 cursor-default'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        disabled={!!taken}
                      >
                        <i
                          className={`fas ${taken ? 'fa-check-circle' : 'fa-clock'}`}
                        ></i>
                        {time}{' '}
                        {taken && (
                          <span className='text-xs'>{t('pill.taken')}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Medications */}
      <div className='bg-white dark:bg-gray-900 rounded-xl shadow-sm border overflow-hidden'>
        <div className='px-6 py-4 border-b'>
          <h3 className='font-medium'>
            <i className='fas fa-history mr-2 text-primary-500'></i>{' '}
            {t('pill.all_medications')}
          </h3>
        </div>
        <div className='divide-y'>
          {pills.length === 0 ? (
            <div className='px-6 py-8 text-center text-gray-500'>
              <i className='fas fa-pills text-4xl mb-2 opacity-50'></i>
              <p>{t('pill.no_medications')}</p>
            </div>
          ) : (
            pills.map((pill) => (
              <div
                key={pill.id}
                className='px-6 py-4 flex justify-between items-center'
              >
                <div>
                  <div className='font-medium'>{pill.name}</div>
                  <div className='text-sm text-gray-500'>
                    {pill.dosage} • {pill.times.join(', ')}
                  </div>
                </div>
                <div className='flex gap-2'>
                  <button
                    onClick={() => togglePillActive(pill.id)}
                    className='text-gray-400 hover:text-blue-500'
                    title={
                      pill.active ? t('pill.deactivate') : t('pill.activate')
                    }
                  >
                    <i
                      className={`fas ${pill.active ? 'fa-pause' : 'fa-play'}`}
                    ></i>
                  </button>
                  <button
                    onClick={() => deletePill(pill.id)}
                    className='text-gray-400 hover:text-red-500'
                    title={t('pill.delete')}
                  >
                    <i className='fas fa-trash-alt'></i>
                  </button>
                </div>
              </div>
            ))
          )}
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
                <i className='fas fa-pills mr-2 text-primary-500'></i>
                {editingId ? t('pill.edit') : t('pill.add')}
              </h3>
              <div className='space-y-4'>
                <input
                  type='text'
                  value={pillName}
                  onChange={(e) => setPillName(e.target.value)}
                  placeholder={t('pill.name_placeholder')}
                  className='w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800'
                />
                <input
                  type='text'
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder={t('pill.dosage_placeholder')}
                  className='w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800'
                />
                <div className='flex gap-2'>
                  {['daily', 'multiple', 'weekly'].map((freq) => (
                    <button
                      key={freq}
                      onClick={() => setFrequency(freq as any)}
                      className={`flex-1 py-2 rounded-lg text-sm ${
                        frequency === freq
                          ? 'bg-gray-800 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {getFrequencyLabel(freq)}
                    </button>
                  ))}
                </div>
                {times.map((time, idx) => (
                  <div key={idx} className='flex gap-2 mb-2'>
                    <input
                      type='time'
                      value={time}
                      onChange={(e) => updateTime(idx, e.target.value)}
                      className='flex-1 px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800'
                    />
                    {times.length > 1 && (
                      <button
                        onClick={() => removeTime(idx)}
                        className='px-3 py-2 text-red-500'
                      >
                        <i className='fas fa-times'></i>
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={addTime} className='text-sm text-blue-600'>
                  <i className='fas fa-plus mr-1'></i> {t('pill.add_time')}
                </button>
                <div className='grid grid-cols-2 gap-3'>
                  <input
                    type='date'
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className='px-3 py-2 text-sm border rounded-lg'
                  />
                  <input
                    type='date'
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder={t('pill.end_date')}
                    className='px-3 py-2 text-sm border rounded-lg'
                  />
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('pill.notes_placeholder')}
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
                  onClick={savePill}
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
