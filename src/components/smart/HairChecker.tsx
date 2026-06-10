import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface HairEntry {
  id: string;
  date: string;
  density: 1 | 2 | 3 | 4 | 5;
  shedding: 1 | 2 | 3 | 4 | 5;
  photo?: string;
  treatment?: string;
  notes?: string;
}

export default function HairChecker() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [entries, setEntries] = useState<HairEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [density, setDensity] = useState<3>(3);
  const [shedding, setShedding] = useState<3>(3);
  const [photo, setPhoto] = useState<string | null>(null);
  const [treatment, setTreatment] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('omni_hair');
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('omni_hair', JSON.stringify(entries));
  }, [entries]);

  const handlePhotoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const saveEntry = () => {
    const entry: HairEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      density,
      shedding,
      photo: photo || undefined,
      treatment: treatment || undefined,
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
    setPhoto(null);
    setTreatment('');
    setNotes('');
    setDensity(3);
    setShedding(3);
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const getLatestEntry = () => entries[0];

  const getDensityTrend = () => {
    if (entries.length < 2) return 'stable';
    const last = entries[0].density;
    const prev = entries[1].density;
    if (last < prev) return 'improving';
    if (last > prev) return 'worsening';
    return 'stable';
  };

  const getDensityLabel = (val: number) => {
    const labels: Record<number, string> = {
      1: t('hair.full'),
      2: t('hair.slight_thinning'),
      3: t('hair.moderate_thinning'),
      4: t('hair.severe_thinning'),
      5: t('hair.bald'),
    };
    return labels[val];
  };

  const getSheddingLabel = (val: number) => {
    const labels: Record<number, string> = {
      1: t('hair.none'),
      2: t('hair.minimal'),
      3: t('hair.moderate'),
      4: t('hair.heavy'),
      5: t('hair.severe'),
    };
    return labels[val];
  };

  const getTrendIcon = () => {
    const trend = getDensityTrend();
    if (trend === 'improving')
      return (
        <span className='text-green-500'>
          <i className='fas fa-arrow-up'></i> {t('status.improving')}
        </span>
      );
    if (trend === 'worsening')
      return (
        <span className='text-red-500'>
          <i className='fas fa-arrow-down'></i> {t('status.worsening')}
        </span>
      );
    return (
      <span className='text-gray-500'>
        <i className='fas fa-minus'></i> {t('status.stable')}
      </span>
    );
  };

  return (
    <div className='space-y-6' dir={isRTL ? 'rtl' : 'ltr'}>
      <div className='flex justify-between items-center'>
        <h2 className='text-xl font-semibold text-gray-800 dark:text-gray-200'>
          <i className='fas fa-hand-peace mr-2 text-primary-500'></i>{' '}
          {t('hair.title')}
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className='px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2'
        >
          <i className='fas fa-plus'></i> {t('hair.log_check')}
        </button>
      </div>

      {entries.length > 0 && (
        <div className='bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white'>
          <p className='text-sm opacity-90'>
            <i className='fas fa-chart-line mr-1'></i>{' '}
            {t('hair.current_status')}
          </p>
          <h3 className='text-2xl font-bold mt-1'>
            {getDensityLabel(getLatestEntry()!.density)}
          </h3>
          <p className='text-sm opacity-80 mt-1'>
            {t('hair.shedding')}: {getSheddingLabel(getLatestEntry()!.shedding)}
          </p>
          <p className='text-xs mt-2 flex items-center gap-1'>
            {getTrendIcon()}
          </p>
          {getLatestEntry()!.treatment && (
            <p className='text-xs mt-2'>
              <i className='fas fa-prescription-bottle mr-1'></i>{' '}
              {t('hair.treatment')}: {getLatestEntry()!.treatment}
            </p>
          )}
        </div>
      )}

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400'>{t('hair.total_checks')}</div>
          <div className='text-2xl font-light mt-1'>{entries.length}</div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400'>{t('hair.last_check')}</div>
          <div className='text-sm font-medium mt-1'>
            {entries[0]?.date || '—'}
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400'>{t('hair.density')}</div>
          <div className='text-xl font-light mt-1'>
            {entries[0]?.density || '—'}/5
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400'>{t('hair.shedding')}</div>
          <div className='text-xl font-light mt-1'>
            {entries[0]?.shedding || '—'}/5
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className='bg-white dark:bg-gray-900 rounded-xl shadow-sm border overflow-hidden'>
        <div className='px-6 py-4 border-b'>
          <h3 className='font-medium'>
            <i className='fas fa-history mr-2 text-primary-500'></i>{' '}
            {t('hair.history')}
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
                  {t('hair.density')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase'>
                  {t('hair.shedding')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase'>
                  {t('hair.treatment')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase'></th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100 dark:divide-gray-800'>
              {entries.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className='px-6 py-8 text-center text-gray-500'
                  >
                    <i className='fas fa-hand-peace text-4xl mb-2 opacity-50'></i>
                    <p>{t('hair.no_entries')}</p>
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className='hover:bg-gray-50 transition'>
                    <td className='px-6 py-3 text-sm'>{entry.date}</td>
                    <td className='px-6 py-3 text-sm'>
                      {getDensityLabel(entry.density)}
                    </td>
                    <td className='px-6 py-3 text-sm'>
                      {getSheddingLabel(entry.shedding)}
                    </td>
                    <td className='px-6 py-3 text-sm'>
                      {entry.treatment || '—'}
                    </td>
                    <td className='px-6 py-3 text-sm'>
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className='text-red-500 hover:text-red-700'
                      >
                        <i className='fas fa-trash-alt'></i>
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
      <div className='bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border'>
        <div className='flex gap-3'>
          <i className='fas fa-info-circle text-gray-400 text-sm mt-0.5'></i>
          <div>
            <h4 className='font-medium text-sm'>{t('hair.tip_title')}</h4>
            <p className='text-xs text-gray-500'>{t('hair.tip_text')}</p>
          </div>
        </div>
      </div>

      {/* Add Modal */}
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
              <h3 className='font-medium mb-4'>{t('hair.log_check')}</h3>
              <div className='space-y-4'>
                <input
                  type='date'
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                />
                <div>
                  <label className='block text-xs text-gray-500 mb-2'>
                    {t('hair.density')}: {density}/5 ({getDensityLabel(density)}
                    )
                  </label>
                  <input
                    type='range'
                    min='1'
                    max='5'
                    value={density}
                    onChange={(e) =>
                      setDensity(parseInt(e.target.value) as any)
                    }
                    className='w-full'
                  />
                </div>
                <div>
                  <label className='block text-xs text-gray-500 mb-2'>
                    {t('hair.shedding')}: {shedding}/5 (
                    {getSheddingLabel(shedding)})
                  </label>
                  <input
                    type='range'
                    min='1'
                    max='5'
                    value={shedding}
                    onChange={(e) =>
                      setShedding(parseInt(e.target.value) as any)
                    }
                    className='w-full'
                  />
                </div>
                <div className='border-2 border-dashed border-gray-300 rounded-lg p-4 text-center'>
                  <input
                    type='file'
                    accept='image/*'
                    onChange={(e) =>
                      e.target.files && handlePhotoUpload(e.target.files[0])
                    }
                    className='hidden'
                    id='hair-photo'
                  />
                  <label htmlFor='hair-photo' className='cursor-pointer'>
                    {photo ? (
                      <img
                        src={photo}
                        alt='Hair preview'
                        className='max-h-32 mx-auto rounded'
                      />
                    ) : (
                      <div>
                        <i className='fas fa-camera text-3xl text-gray-400 mb-2'></i>
                        <p className='text-sm'>{t('foot.upload_photo')}</p>
                      </div>
                    )}
                  </label>
                </div>
                <input
                  type='text'
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  placeholder={t('hair.treatment')}
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                />
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
