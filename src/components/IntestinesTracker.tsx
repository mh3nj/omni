import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface BowelEntry {
  id: string;
  date: string;
  frequency: number;
  bristolType: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  pain: boolean;
  bloating: boolean;
  constipation: boolean;
  diarrhea: boolean;
  fiberIntake: number;
  waterIntake: number;
  notes?: string;
}

interface IntestinesTrackerProps {
  onBack: () => void;
}

const getBristolTypes = (t: (key: string) => string) => [
  { type: 1, desc: t('intestines.type_1'), emoji: '💩💎' },
  { type: 2, desc: t('intestines.type_2'), emoji: '💩🌭' },
  { type: 3, desc: t('intestines.type_3'), emoji: '💩🌭✓' },
  { type: 4, desc: t('intestines.type_4'), emoji: '💩✨' },
  { type: 5, desc: t('intestines.type_5'), emoji: '💩🔵' },
  { type: 6, desc: t('intestines.type_6'), emoji: '💩💧' },
  { type: 7, desc: t('intestines.type_7'), emoji: '💩💦' },
];

export default function IntestinesTracker({ onBack }: IntestinesTrackerProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [bowelLogs, setBowelLogs] = useState<BowelEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [frequency, setFrequency] = useState('');
  const [bristolType, setBristolType] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(4);
  const [pain, setPain] = useState(false);
  const [bloating, setBloating] = useState(false);
  const [constipation, setConstipation] = useState(false);
  const [diarrhea, setDiarrhea] = useState(false);
  const [fiberIntake, setFiberIntake] = useState('');
  const [waterIntake, setWaterIntake] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('omni_intestines');
    if (saved) setBowelLogs(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('omni_intestines', JSON.stringify(bowelLogs));
  }, [bowelLogs]);

  const saveEntry = () => {
    const entry: BowelEntry = {
      id: editingId || Date.now().toString(),
      date: selectedDate,
      frequency: parseInt(frequency) || 0,
      bristolType,
      pain,
      bloating,
      constipation,
      diarrhea,
      fiberIntake: parseInt(fiberIntake) || 0,
      waterIntake: parseInt(waterIntake) || 0,
      notes: notes || undefined,
    };

    if (editingId) {
      setBowelLogs(bowelLogs.map((l) => (l.id === editingId ? entry : l)));
    } else {
      const existing = bowelLogs.findIndex((l) => l.date === selectedDate);
      if (existing !== -1) {
        const updated = [...bowelLogs];
        updated[existing] = entry;
        setBowelLogs(updated);
      } else {
        setBowelLogs([entry, ...bowelLogs]);
      }
    }
    resetForm();
  };

  const deleteEntry = (id: string) => {
    setBowelLogs(bowelLogs.filter((l) => l.id !== id));
  };

  const editEntry = (entry: BowelEntry) => {
    setEditingId(entry.id);
    setSelectedDate(entry.date);
    setFrequency(entry.frequency.toString());
    setBristolType(entry.bristolType);
    setPain(entry.pain);
    setBloating(entry.bloating);
    setConstipation(entry.constipation);
    setDiarrhea(entry.diarrhea);
    setFiberIntake(entry.fiberIntake.toString());
    setWaterIntake(entry.waterIntake.toString());
    setNotes(entry.notes || '');
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setFrequency('');
    setBristolType(4);
    setPain(false);
    setBloating(false);
    setConstipation(false);
    setDiarrhea(false);
    setFiberIntake('');
    setWaterIntake('');
    setNotes('');
  };

  const getTodayLog = () => bowelLogs.find((l) => l.date === selectedDate);
  const getAvgFiber = () => {
    if (bowelLogs.length === 0) return 0;
    const sum = bowelLogs.reduce((acc, l) => acc + l.fiberIntake, 0);
    return Math.round(sum / bowelLogs.length);
  };
  const getBristolDistribution = () => {
    const counts: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
    };
    bowelLogs.forEach((l) => counts[l.bristolType]++);
    return counts;
  };
  const getDigestiveHealthStatus = () => {
    const lastLog = bowelLogs[0];
    if (!lastLog)
      return { text: t('intestines.no_data'), color: 'text-gray-500' };
    if (lastLog.bristolType === 4 && !lastLog.pain && !lastLog.bloating)
      return { text: t('intestines.excellent'), color: 'text-green-600' };
    if (lastLog.bristolType === 3 || lastLog.bristolType === 5)
      return { text: t('intestines.good'), color: 'text-blue-600' };
    if (lastLog.constipation || lastLog.diarrhea)
      return {
        text: t('intestines.needs_attention'),
        color: 'text-yellow-600',
      };
    return { text: t('intestines.monitor'), color: 'text-orange-600' };
  };

  const todayLog = getTodayLog();
  const bristolCounts = getBristolDistribution();
  const bristolTypes = getBristolTypes(t);

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
            className='px-4 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 text-sm'
          >
            <i className='fas fa-intestine text-xs'></i>{' '}
            {t('intestines.add_log')}
          </button>
        </div>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('intestines.digestive_health')}
          </div>
          <div
            className={`text-sm font-medium mt-1 ${getDigestiveHealthStatus().color}`}
          >
            {getDigestiveHealthStatus().text}
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('intestines.avg_fiber')}
          </div>
          <div className='text-2xl font-light text-teal-600 mt-1'>
            {getAvgFiber()}g
          </div>
          <div className='text-xs text-gray-400'>
            {t('intestines.target_fiber')}
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('intestines.bowel_movements')}
          </div>
          <div className='text-2xl font-light text-gray-700 mt-1'>
            {bowelLogs.length}
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('intestines.ideal_bm_percent')}
          </div>
          <div className='text-2xl font-light text-green-600 mt-1'>
            {bowelLogs.length
              ? Math.round((bristolCounts[4] / bowelLogs.length) * 100)
              : 0}
            %
          </div>
        </div>
      </div>

      <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border'>
        <h3 className='font-medium mb-4'>{t('intestines.bristol_chart')}</h3>
        <div className='grid grid-cols-7 gap-1 text-center'>
          {bristolTypes.map((b) => (
            <div key={b.type} className='text-center'>
              <div className='text-2xl'>{b.emoji}</div>
              <div className='text-xs mt-1'>
                {t('intestines.type')} {b.type}
              </div>
              <div className='text-xs text-gray-400'>
                {bowelLogs.length
                  ? Math.round((bristolCounts[b.type] / bowelLogs.length) * 100)
                  : 0}
                %
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border'>
        <h3 className='font-medium mb-4'>
          {t('intestines.title')} - {selectedDate}
        </h3>
        {todayLog ? (
          <div className='space-y-4'>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
              <div className='p-3 bg-blue-50 rounded-lg text-center'>
                <div className='text-2xl'>{todayLog.frequency}x</div>
                <div className='text-xs'>{t('intestines.movements')}</div>
              </div>
              <div className='p-3 bg-purple-50 rounded-lg text-center'>
                <div className='text-2xl'>
                  {
                    bristolTypes.find((b) => b.type === todayLog.bristolType)
                      ?.emoji
                  }
                </div>
                <div className='text-xs'>
                  {t('intestines.type')} {todayLog.bristolType}
                </div>
              </div>
              <div className='p-3 bg-green-50 rounded-lg text-center'>
                <div className='text-lg'>{todayLog.fiberIntake}g</div>
                <div className='text-xs'>{t('intestines.fiber')}</div>
              </div>
              <div className='p-3 bg-cyan-50 rounded-lg text-center'>
                <div className='text-lg'>
                  {todayLog.waterIntake} {t('intestines.glasses')}
                </div>
                <div className='text-xs'>{t('intestines.water')}</div>
              </div>
            </div>
            {(todayLog.pain ||
              todayLog.bloating ||
              todayLog.constipation ||
              todayLog.diarrhea) && (
              <div className='flex flex-wrap gap-2'>
                {todayLog.pain && (
                  <span className='px-2 py-1 text-xs bg-yellow-100 rounded-full'>
                    😖 {t('intestines.pain')}
                  </span>
                )}
                {todayLog.bloating && (
                  <span className='px-2 py-1 text-xs bg-yellow-100 rounded-full'>
                    🎈 {t('intestines.bloating')}
                  </span>
                )}
                {todayLog.constipation && (
                  <span className='px-2 py-1 text-xs bg-yellow-100 rounded-full'>
                    🚫 {t('intestines.constipation')}
                  </span>
                )}
                {todayLog.diarrhea && (
                  <span className='px-2 py-1 text-xs bg-yellow-100 rounded-full'>
                    💧 {t('intestines.diarrhea')}
                  </span>
                )}
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
            <i className='fas fa-intestine text-3xl mb-2 opacity-50'></i>
            <p>{t('intestines.no_entries')}</p>
            <button
              onClick={() => setShowForm(true)}
              className='mt-3 text-sm text-teal-600 hover:underline'
            >
              {t('intestines.add_log')} →
            </button>
          </div>
        )}
      </div>

      <div className='bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border'>
        <div className='flex gap-3'>
          <i className='fas fa-info-circle text-gray-400 text-sm mt-0.5'></i>
          <div>
            <h4 className='font-medium text-sm'>{t('intestines.tip_title')}</h4>
            <p className='text-xs text-gray-500'>{t('intestines.tip_text')}</p>
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
                {editingId ? t('intestines.edit_log') : t('intestines.add_log')}{' '}
                - {selectedDate}
              </h3>
              <div className='space-y-4'>
                <div>
                  <label className='block text-xs text-gray-500 mb-1'>
                    {t('intestines.frequency')}
                  </label>
                  <input
                    type='number'
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    placeholder='e.g., 1'
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  />
                </div>
                <div>
                  <label className='block text-xs text-gray-500 mb-2'>
                    {t('intestines.bristol_type')}
                  </label>
                  <div className='grid grid-cols-7 gap-1'>
                    {bristolTypes.map((b) => (
                      <button
                        key={b.type}
                        onClick={() =>
                          setBristolType(b.type as 1 | 2 | 3 | 4 | 5 | 6 | 7)
                        }
                        className={`p-2 rounded-lg text-center transition ${bristolType === b.type ? 'bg-teal-600 text-white' : 'bg-gray-100'}`}
                      >
                        <div className='text-xl'>{b.emoji}</div>
                        <div className='text-xs'>{b.type}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-2'>
                  <label className='flex items-center gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={pain}
                      onChange={(e) => setPain(e.target.checked)}
                    />
                    <span>{t('intestines.pain')}</span>
                  </label>
                  <label className='flex items-center gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={bloating}
                      onChange={(e) => setBloating(e.target.checked)}
                    />
                    <span>{t('intestines.bloating')}</span>
                  </label>
                  <label className='flex items-center gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={constipation}
                      onChange={(e) => setConstipation(e.target.checked)}
                    />
                    <span>{t('intestines.constipation')}</span>
                  </label>
                  <label className='flex items-center gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={diarrhea}
                      onChange={(e) => setDiarrhea(e.target.checked)}
                    />
                    <span>{t('intestines.diarrhea')}</span>
                  </label>
                </div>
                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs text-gray-500 mb-1'>
                      {t('intestines.fiber')}
                    </label>
                    <input
                      type='number'
                      value={fiberIntake}
                      onChange={(e) => setFiberIntake(e.target.value)}
                      placeholder='e.g., 25'
                      className='w-full px-3 py-2 text-sm border rounded-lg'
                    />
                  </div>
                  <div>
                    <label className='block text-xs text-gray-500 mb-1'>
                      {t('intestines.water')}
                    </label>
                    <input
                      type='number'
                      value={waterIntake}
                      onChange={(e) => setWaterIntake(e.target.value)}
                      placeholder='e.g., 8'
                      className='w-full px-3 py-2 text-sm border rounded-lg'
                    />
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
                  className='flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm'
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
