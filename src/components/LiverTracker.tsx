import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface LiverEntry {
  id: string;
  date: string;
  alcoholConsumed: boolean;
  alcoholUnits?: number;
  fattyLiverRisk: 'low' | 'moderate' | 'high';
  altLevel?: number;
  astLevel?: number;
  ggtLevel?: number;
  symptoms: string[];
  notes?: string;
}

interface LiverTrackerProps {
  onBack: () => void;
}

const getLiverSymptoms = (t: (key: string) => string) => [
  t('liver.symptoms.fatigue'),
  t('liver.symptoms.jaundice'),
  t('liver.symptoms.dark_urine'),
  t('liver.symptoms.abdominal_pain'),
  t('liver.symptoms.nausea'),
  t('liver.symptoms.appetite_loss'),
  t('liver.symptoms.swollen_abdomen'),
  t('liver.symptoms.itchy_skin'),
  t('liver.symptoms.easy_bruising'),
  t('liver.symptoms.confusion'),
  t('liver.symptoms.pale_stool'),
  t('liver.symptoms.yellow_eyes'),
];

export default function LiverTracker({ onBack }: LiverTrackerProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [liverLogs, setLiverLogs] = useState<LiverEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [alcoholConsumed, setAlcoholConsumed] = useState(false);
  const [alcoholUnits, setAlcoholUnits] = useState('');
  const [fattyLiverRisk, setFattyLiverRisk] =
    useState<LiverEntry['fattyLiverRisk']>('low');
  const [altLevel, setAltLevel] = useState('');
  const [astLevel, setAstLevel] = useState('');
  const [ggtLevel, setGgtLevel] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('omni_liver');
    if (saved) setLiverLogs(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('omni_liver', JSON.stringify(liverLogs));
  }, [liverLogs]);

  const saveEntry = () => {
    const entry: LiverEntry = {
      id: editingId || Date.now().toString(),
      date: selectedDate,
      alcoholConsumed,
      alcoholUnits: alcoholUnits ? parseInt(alcoholUnits) : undefined,
      fattyLiverRisk,
      altLevel: altLevel ? parseInt(altLevel) : undefined,
      astLevel: astLevel ? parseInt(astLevel) : undefined,
      ggtLevel: ggtLevel ? parseInt(ggtLevel) : undefined,
      symptoms: selectedSymptoms,
      notes: notes || undefined,
    };

    if (editingId) {
      setLiverLogs(liverLogs.map((l) => (l.id === editingId ? entry : l)));
    } else {
      const existing = liverLogs.findIndex((l) => l.date === selectedDate);
      if (existing !== -1) {
        const updated = [...liverLogs];
        updated[existing] = entry;
        setLiverLogs(updated);
      } else {
        setLiverLogs([entry, ...liverLogs]);
      }
    }
    resetForm();
  };

  const deleteEntry = (id: string) => {
    setLiverLogs(liverLogs.filter((l) => l.id !== id));
  };

  const editEntry = (entry: LiverEntry) => {
    setEditingId(entry.id);
    setSelectedDate(entry.date);
    setAlcoholConsumed(entry.alcoholConsumed);
    setAlcoholUnits(entry.alcoholUnits?.toString() || '');
    setFattyLiverRisk(entry.fattyLiverRisk);
    setAltLevel(entry.altLevel?.toString() || '');
    setAstLevel(entry.astLevel?.toString() || '');
    setGgtLevel(entry.ggtLevel?.toString() || '');
    setSelectedSymptoms(entry.symptoms);
    setNotes(entry.notes || '');
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setAlcoholConsumed(false);
    setAlcoholUnits('');
    setFattyLiverRisk('low');
    setAltLevel('');
    setAstLevel('');
    setGgtLevel('');
    setSelectedSymptoms([]);
    setNotes('');
  };

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const getTodayLog = () => liverLogs.find((l) => l.date === selectedDate);
  const getAlcoholFreeStreak = () => {
    let streak = 0;
    const sorted = [...liverLogs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    for (const log of sorted) {
      if (!log.alcoholConsumed) streak++;
      else break;
    }
    return streak;
  };
  const getAverageALT = () => {
    const logsWithALT = liverLogs.filter((l) => l.altLevel);
    if (logsWithALT.length === 0) return 0;
    const sum = logsWithALT.reduce((acc, l) => acc + (l.altLevel || 0), 0);
    return Math.round(sum / logsWithALT.length);
  };
  const getLiverHealthStatus = () => {
    const lastLog = liverLogs[0];
    if (!lastLog) return { text: t('liver.no_data'), color: 'text-gray-500' };
    if (lastLog.fattyLiverRisk === 'high')
      return { text: t('liver.high_risk'), color: 'text-red-600' };
    if (lastLog.fattyLiverRisk === 'moderate')
      return { text: t('liver.moderate_risk'), color: 'text-yellow-600' };
    if (lastLog.altLevel && lastLog.altLevel > 40)
      return { text: t('liver.elevated_alt'), color: 'text-orange-600' };
    return { text: t('liver.good'), color: 'text-green-600' };
  };

  const todayLog = getTodayLog();
  const liverSymptoms = getLiverSymptoms(t);

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
          className='flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-all'
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
            className='px-4 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm'
          >
            <i className='fas fa-liver text-xs'></i> {t('liver.add_log')}
          </button>
        </div>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('liver.liver_health')}
          </div>
          <div
            className={`text-sm font-medium mt-1 ${getLiverHealthStatus().color}`}
          >
            {getLiverHealthStatus().text}
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('liver.alcohol_free_streak')}
          </div>
          <div className='text-2xl font-light text-green-600 mt-1'>
            {getAlcoholFreeStreak()} {t('common.days')}
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('liver.avg_alt')}
          </div>
          <div className='text-2xl font-light text-gray-700 mt-1'>
            {getAverageALT()} U/L
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('liver.total_logs')}
          </div>
          <div className='text-2xl font-light text-gray-700 mt-1'>
            {liverLogs.length}
          </div>
        </div>
      </div>

      <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border'>
        <h3 className='font-medium mb-4 flex items-center gap-2'>
          <i className='fas fa-calendar-day text-gray-400'></i>{' '}
          {t('liver.liver_health')} - {selectedDate}
        </h3>
        {todayLog ? (
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-3'>
              <div
                className={`p-3 rounded-lg text-center ${!todayLog.alcoholConsumed ? 'bg-green-100' : 'bg-red-100'}`}
              >
                <i className='fas fa-wine-bottle text-lg'></i>
                <div className='text-sm mt-1'>{t('liver.alcohol_today')}</div>
                <div className='text-xs'>
                  {todayLog.alcoholConsumed
                    ? `✓ ${todayLog.alcoholUnits || 0} ${t('liver.units')}`
                    : `✗ ${t('liver.none')}`}
                </div>
              </div>
              <div className='p-3 rounded-lg text-center bg-blue-50'>
                <i className='fas fa-chart-line text-blue-600'></i>
                <div className='text-sm mt-1'>
                  {t('liver.fatty_liver_risk')}
                </div>
                <div className='text-xs capitalize'>
                  {t(`liver.${todayLog.fattyLiverRisk}`)}
                </div>
              </div>
            </div>
            {(todayLog.altLevel || todayLog.astLevel || todayLog.ggtLevel) && (
              <div className='grid grid-cols-3 gap-2 p-3 bg-purple-50 rounded-lg'>
                {todayLog.altLevel && (
                  <div>
                    <div className='text-xs text-gray-500'>ALT</div>
                    <div className='font-medium'>{todayLog.altLevel} U/L</div>
                  </div>
                )}
                {todayLog.astLevel && (
                  <div>
                    <div className='text-xs text-gray-500'>AST</div>
                    <div className='font-medium'>{todayLog.astLevel} U/L</div>
                  </div>
                )}
                {todayLog.ggtLevel && (
                  <div>
                    <div className='text-xs text-gray-500'>GGT</div>
                    <div className='font-medium'>{todayLog.ggtLevel} U/L</div>
                  </div>
                )}
              </div>
            )}
            {todayLog.symptoms.length > 0 && (
              <div className='flex flex-wrap gap-1'>
                {todayLog.symptoms.map((s) => (
                  <span
                    key={s}
                    className='px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full'
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
            {todayLog.notes && (
              <div className='text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg'>
                "{todayLog.notes}"
              </div>
            )}
            <div className='flex gap-2'>
              <button
                onClick={() => editEntry(todayLog)}
                className='px-3 py-1 text-xs bg-gray-100 rounded-lg'
              >
                {t('common.edit')}
              </button>
              <button
                onClick={() => deleteEntry(todayLog.id)}
                className='px-3 py-1 text-xs bg-gray-100 text-red-600 rounded-lg'
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        ) : (
          <div className='text-center py-8 text-gray-500'>
            <i className='fas fa-liver text-3xl mb-2 opacity-50'></i>
            <p>{t('liver.no_entries')}</p>
            <button
              onClick={() => setShowForm(true)}
              className='mt-3 text-sm text-emerald-600 hover:underline'
            >
              {t('liver.add_log')} →
            </button>
          </div>
        )}
      </div>

      <div className='bg-white dark:bg-gray-900 rounded-xl shadow-sm border overflow-hidden'>
        <div className='px-6 py-4 border-b'>
          <h3 className='font-medium'>
            {t('liver.liver_health')} {t('liver.history')} ({liverLogs.length}{' '}
            {t('liver.entries')})
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
                  {t('liver.alcohol')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase'>
                  {t('liver.risk')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase'>
                  ALT
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody className='divide-y'>
              {liverLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className='px-6 py-8 text-center text-gray-400'
                  >
                    {t('liver.no_entries')}
                  </td>
                </tr>
              ) : (
                liverLogs.map((log) => (
                  <tr key={log.id} className='hover:bg-gray-50 transition'>
                    <td className='px-6 py-3 text-sm text-gray-600'>
                      {log.date}
                    </td>
                    <td className='px-6 py-3 text-sm'>
                      {log.alcoholConsumed
                        ? `✓ ${log.alcoholUnits || '?'} ${t('liver.units')}`
                        : `✗ ${t('liver.none')}`}
                    </td>
                    <td className='px-6 py-3 text-sm capitalize'>
                      {t(`liver.${log.fattyLiverRisk}`)}
                    </td>
                    <td className='px-6 py-3 text-sm'>
                      {log.altLevel || '—'} U/L
                    </td>
                    <td className='px-6 py-3 text-sm'>
                      <button
                        onClick={() => editEntry(log)}
                        className='text-blue-500 hover:text-blue-700'
                      >
                        {t('common.edit')}
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
            <h4 className='font-medium text-sm'>{t('liver.tip_title')}</h4>
            <p className='text-xs text-gray-500'>{t('liver.tip_text')}</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto'
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
                {editingId ? t('liver.edit_log') : t('liver.add_log')} -{' '}
                {selectedDate}
              </h3>
              <div className='space-y-4'>
                <label className='flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer'>
                  <span>
                    <i className='fas fa-wine-bottle mr-2'></i>
                    {t('liver.alcohol_consumed_today')}
                  </span>
                  <input
                    type='checkbox'
                    checked={alcoholConsumed}
                    onChange={(e) => setAlcoholConsumed(e.target.checked)}
                    className='w-5 h-5'
                  />
                </label>
                {alcoholConsumed && (
                  <input
                    type='number'
                    value={alcoholUnits}
                    onChange={(e) => setAlcoholUnits(e.target.value)}
                    placeholder={t('liver.units_placeholder')}
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  />
                )}
                <div>
                  <label className='block text-xs text-gray-500 mb-1'>
                    {t('liver.fatty_liver_risk')}
                  </label>
                  <select
                    value={fattyLiverRisk}
                    onChange={(e) => setFattyLiverRisk(e.target.value as any)}
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  >
                    <option value='low'>{t('liver.low')}</option>
                    <option value='moderate'>{t('liver.moderate')}</option>
                    <option value='high'>{t('liver.high')}</option>
                  </select>
                </div>
                <div className='grid grid-cols-3 gap-2'>
                  <input
                    type='number'
                    value={altLevel}
                    onChange={(e) => setAltLevel(e.target.value)}
                    placeholder='ALT (U/L)'
                    className='px-2 py-2 text-sm border rounded-lg'
                  />
                  <input
                    type='number'
                    value={astLevel}
                    onChange={(e) => setAstLevel(e.target.value)}
                    placeholder='AST (U/L)'
                    className='px-2 py-2 text-sm border rounded-lg'
                  />
                  <input
                    type='number'
                    value={ggtLevel}
                    onChange={(e) => setGgtLevel(e.target.value)}
                    placeholder='GGT (U/L)'
                    className='px-2 py-2 text-sm border rounded-lg'
                  />
                </div>
                <div>
                  <label className='block text-xs text-gray-500 mb-2'>
                    {t('liver.symptoms.fatigue')}
                  </label>
                  <div className='flex flex-wrap gap-2'>
                    {liverSymptoms.map((s) => (
                      <button
                        key={s}
                        type='button'
                        onClick={() => toggleSymptom(s)}
                        className={`px-2 py-1 text-xs rounded-full ${selectedSymptoms.includes(s) ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
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
                  className='flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm'
                >
                  {t('common.save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
