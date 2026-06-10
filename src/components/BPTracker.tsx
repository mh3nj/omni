import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface BPReading {
  id: string;
  timestamp: Date;
  systolic: number;
  diastolic: number;
  pulse: number;
  notes?: string;
}

interface BPTrackerProps {
  onBack: () => void;
}

export default function BPTracker({ onBack }: BPTrackerProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [readings, setReadings] = useState<BPReading[]>([]);
  const [newSystolic, setNewSystolic] = useState('');
  const [newDiastolic, setNewDiastolic] = useState('');
  const [newPulse, setNewPulse] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState({
    avgSystolic: 0,
    avgDiastolic: 0,
    avgPulse: 0,
    lastReading: '',
  });

  useEffect(() => {
    const saved = localStorage.getItem('omni_bp');
    if (saved) {
      const parsed = JSON.parse(saved);
      const withDates = parsed.map((r: any) => ({
        ...r,
        timestamp: new Date(r.timestamp),
      }));
      setReadings(withDates);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('omni_bp', JSON.stringify(readings));
    updateStats();
  }, [readings]);

  const updateStats = () => {
    if (readings.length === 0) {
      setStats({
        avgSystolic: 0,
        avgDiastolic: 0,
        avgPulse: 0,
        lastReading: '',
      });
      return;
    }
    const avgSystolic = Math.round(
      readings.reduce((a, b) => a + b.systolic, 0) / readings.length,
    );
    const avgDiastolic = Math.round(
      readings.reduce((a, b) => a + b.diastolic, 0) / readings.length,
    );
    const avgPulse = Math.round(
      readings.reduce((a, b) => a + b.pulse, 0) / readings.length,
    );
    const last = readings[0];
    setStats({
      avgSystolic,
      avgDiastolic,
      avgPulse,
      lastReading: `${last.systolic}/${last.diastolic}`,
    });
  };

  const addReading = () => {
    if (!newSystolic || !newDiastolic) return;

    const reading: BPReading = {
      id: Date.now().toString(),
      timestamp: new Date(),
      systolic: parseInt(newSystolic),
      diastolic: parseInt(newDiastolic),
      pulse: newPulse ? parseInt(newPulse) : 0,
      notes: newNotes || undefined,
    };

    setReadings([reading, ...readings]);
    setNewSystolic('');
    setNewDiastolic('');
    setNewPulse('');
    setNewNotes('');
    setShowForm(false);
  };

  const deleteReading = (id: string) => {
    setReadings(readings.filter((r) => r.id !== id));
  };

  const getBPCategory = (systolic: number, diastolic: number) => {
    if (systolic < 120 && diastolic < 80)
      return {
        text: t('blood_pressure.normal'),
        color: 'text-green-600 dark:text-green-400',
      };
    if (systolic < 130 && diastolic < 80)
      return {
        text: t('blood_pressure.elevated'),
        color: 'text-yellow-600 dark:text-yellow-400',
      };
    if (systolic < 140 || diastolic < 90)
      return {
        text: t('blood_pressure.stage1'),
        color: 'text-orange-600 dark:text-orange-400',
      };
    return {
      text: t('blood_pressure.stage2'),
      color: 'text-red-600 dark:text-red-400',
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className='space-y-6'
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className='flex items-center justify-between flex-wrap gap-4'>
        <button
          onClick={onBack}
          className='flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all'
        >
          <i className='fas fa-arrow-left text-sm'></i> {t('nav.back')}
        </button>
        <button
          onClick={() => setShowForm(!showForm)}
          className='px-4 py-1.5 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-all flex items-center gap-2 text-sm'
        >
          <i className='fas fa-plus text-xs'></i> {t('blood_pressure.add')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800'>
          <div className='text-xs text-gray-400 uppercase tracking-wide'>
            {t('blood_pressure.last')}
          </div>
          <div className='text-3xl font-light text-gray-700 dark:text-gray-300 mt-1'>
            {stats.lastReading || '—'}
          </div>
          <div className='text-xs text-gray-400'>mmHg</div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800'>
          <div className='text-xs text-gray-400 uppercase tracking-wide'>
            {t('blood_pressure.average_bp')}
          </div>
          <div className='text-3xl font-light text-gray-700 dark:text-gray-300 mt-1'>
            {stats.avgSystolic}/{stats.avgDiastolic}
          </div>
          <div className='text-xs text-gray-400'>mmHg</div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800'>
          <div className='text-xs text-gray-400 uppercase tracking-wide'>
            {t('blood_pressure.average_pulse')}
          </div>
          <div className='text-3xl font-light text-gray-700 dark:text-gray-300 mt-1'>
            {stats.avgPulse || '—'}
          </div>
          <div className='text-xs text-gray-400'>bpm</div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800'>
          <div className='text-xs text-gray-400 uppercase tracking-wide'>
            {t('blood_pressure.target')}
          </div>
          <div className='text-xl font-light text-gray-700 dark:text-gray-300 mt-1'>
            &lt; 120/80
          </div>
          <div className='text-xs text-gray-400'>
            {t('blood_pressure.tip_title')}
          </div>
        </div>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800'
          >
            <h3 className='text-lg font-medium mb-4 text-gray-800 dark:text-gray-200'>
              {t('blood_pressure.add')}
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  {t('blood_pressure.systolic')}
                </label>
                <input
                  type='number'
                  value={newSystolic}
                  onChange={(e) => setNewSystolic(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800'
                  placeholder='e.g., 118'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  {t('blood_pressure.diastolic')}
                </label>
                <input
                  type='number'
                  value={newDiastolic}
                  onChange={(e) => setNewDiastolic(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800'
                  placeholder='e.g., 78'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  {t('blood_pressure.pulse')}
                </label>
                <input
                  type='number'
                  value={newPulse}
                  onChange={(e) => setNewPulse(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800'
                  placeholder='e.g., 72'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  {t('blood_pressure.notes')}
                </label>
                <input
                  type='text'
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800'
                  placeholder={t('blood_pressure.notes')}
                />
              </div>
            </div>
            <div className='flex justify-end gap-3 mt-6'>
              <button
                onClick={() => setShowForm(false)}
                className='px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition'
              >
                {t('blood_pressure.cancel')}
              </button>
              <button
                onClick={addReading}
                className='px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-700 dark:hover:bg-gray-600 transition'
              >
                {t('blood_pressure.save')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Table */}
      <div className='bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden'>
        <div className='px-6 py-4 border-b border-gray-200 dark:border-gray-800'>
          <h3 className='font-medium flex items-center gap-2 text-gray-800 dark:text-gray-200'>
            <i className='fas fa-history text-gray-500'></i>
            {t('blood_pressure.history')}
            <span className='text-sm text-gray-400 font-normal ml-2'>
              ({readings.length} {t('blood_pressure.entries')})
            </span>
          </h3>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50 dark:bg-gray-800/50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase'>
                  {t('glucose.date_time')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase'>
                  BP (mmHg)
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase'>
                  {t('blood_pressure.category')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase'>
                  {t('blood_pressure.pulse')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase'>
                  {t('blood_pressure.notes')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase'></th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100 dark:divide-gray-800'>
              {readings.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className='px-6 py-8 text-center text-gray-500 dark:text-gray-400'
                  >
                    <i className='fas fa-heartbeat text-4xl mb-2 opacity-50'></i>
                    <p>
                      {t('blood_pressure.history')}{' '}
                      {t('blood_pressure.entries')}
                    </p>
                  </td>
                </tr>
              ) : (
                readings.map((reading) => {
                  const category = getBPCategory(
                    reading.systolic,
                    reading.diastolic,
                  );
                  return (
                    <tr
                      key={reading.id}
                      className='hover:bg-gray-50 dark:hover:bg-gray-800/50 transition'
                    >
                      <td className='px-6 py-3 text-sm text-gray-600 dark:text-gray-400'>
                        {reading.timestamp.toLocaleDateString()}{' '}
                        {reading.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className='px-6 py-3 text-sm font-mono font-medium text-gray-800 dark:text-gray-200'>
                        {reading.systolic}/{reading.diastolic}
                      </td>
                      <td className='px-6 py-3 text-sm'>
                        <span className={category.color}>{category.text}</span>
                      </td>
                      <td className='px-6 py-3 text-sm text-gray-600 dark:text-gray-400'>
                        {reading.pulse || '—'}
                      </td>
                      <td className='px-6 py-3 text-sm text-gray-500'>
                        {reading.notes || '—'}
                      </td>
                      <td className='px-6 py-3 text-sm'>
                        <button
                          onClick={() => deleteReading(reading.id)}
                          className='text-red-500 hover:text-red-700 transition'
                        >
                          <i className='fas fa-trash-alt'></i>
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

      {/* Tip Card */}
      <div className='bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800'>
        <div className='flex gap-3'>
          <i className='fas fa-info-circle text-gray-500 text-sm mt-0.5'></i>
          <div>
            <h4 className='font-medium text-sm text-gray-800 dark:text-gray-200 mb-1'>
              {t('blood_pressure.tip_title')}
            </h4>
            <p className='text-xs text-gray-600 dark:text-gray-400'>
              {t('blood_pressure.tip_text')}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
