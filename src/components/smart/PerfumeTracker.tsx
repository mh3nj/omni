import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface HygieneEntry {
  id: string;
  date: string;
  perfumeApplied: boolean;
  deodorantApplied: boolean;
  showerTaken: boolean;
  teethBrushed: boolean;
  productName?: string;
  notes?: string;
}

export default function PerfumeTracker() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [entries, setEntries] = useState<HygieneEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [perfumeApplied, setPerfumeApplied] = useState(false);
  const [deodorantApplied, setDeodorantApplied] = useState(false);
  const [showerTaken, setShowerTaken] = useState(false);
  const [teethBrushed, setTeethBrushed] = useState(false);
  const [productName, setProductName] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('omni_hygiene');
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('omni_hygiene', JSON.stringify(entries));
  }, [entries]);

  const saveEntry = () => {
    const entry: HygieneEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      perfumeApplied,
      deodorantApplied,
      showerTaken,
      teethBrushed,
      productName: productName || undefined,
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
    setPerfumeApplied(false);
    setDeodorantApplied(false);
    setShowerTaken(false);
    setTeethBrushed(false);
    setProductName('');
    setNotes('');
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const getTodayEntry = () => entries.find((e) => e.date === selectedDate);

  const getStreak = (habit: keyof HygieneEntry) => {
    let streak = 0;
    for (const entry of entries) {
      if (entry[habit] === true) streak++;
      else break;
    }
    return streak;
  };

  return (
    <div className='space-y-6' dir={isRTL ? 'rtl' : 'ltr'}>
      <div className='flex justify-between items-center'>
        <h2 className='text-xl font-semibold text-gray-800 dark:text-gray-200'>
          <i className='fas fa-spa mr-2 text-primary-500'></i>{' '}
          {t('hygiene.title')}
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className='px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2'
        >
          <i className='fas fa-plus'></i> {t('hygiene.log_today')}
        </button>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border text-center'>
          <div className='text-xs text-gray-400'>
            <i className='fas fa-shower mr-1'></i> {t('hygiene.shower')}
          </div>
          <div className='text-2xl font-light text-blue-600 mt-1'>
            {getStreak('showerTaken')}
          </div>
          <div className='text-xs text-gray-500'>{t('common.day_streak')}</div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border text-center'>
          <div className='text-xs text-gray-400'>
            <i className='fas fa-tooth mr-1'></i> {t('hygiene.teeth')}
          </div>
          <div className='text-2xl font-light text-green-600 mt-1'>
            {getStreak('teethBrushed')}
          </div>
          <div className='text-xs text-gray-500'>{t('common.day_streak')}</div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border text-center'>
          <div className='text-xs text-gray-400'>
            <i className='fas fa-spray-can mr-1'></i> {t('hygiene.deodorant')}
          </div>
          <div className='text-2xl font-light text-purple-600 mt-1'>
            {getStreak('deodorantApplied')}
          </div>
          <div className='text-xs text-gray-500'>{t('common.day_streak')}</div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border text-center'>
          <div className='text-xs text-gray-400'>
            <i className='fas fa-leaf mr-1'></i> {t('hygiene.perfume')}
          </div>
          <div className='text-2xl font-light text-pink-600 mt-1'>
            {getStreak('perfumeApplied')}
          </div>
          <div className='text-xs text-gray-500'>{t('common.day_streak')}</div>
        </div>
      </div>

      <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border'>
        <h3 className='font-medium text-gray-700 dark:text-gray-300 mb-4'>
          <i className='fas fa-calendar-day mr-2 text-primary-500'></i>{' '}
          {t('common.today')} - {selectedDate}
        </h3>
        {getTodayEntry() ? (
          <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
            <div
              className={`p-3 rounded-lg text-center ${getTodayEntry()!.showerTaken ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}
            >
              <i className='fas fa-shower text-xl'></i>
              <div className='text-sm mt-1'>{t('hygiene.shower')}</div>
              <div className='text-xs'>
                {getTodayEntry()!.showerTaken
                  ? t('hygiene.done')
                  : t('hygiene.not_yet')}
              </div>
            </div>
            <div
              className={`p-3 rounded-lg text-center ${getTodayEntry()!.teethBrushed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
            >
              <i className='fas fa-tooth text-xl'></i>
              <div className='text-sm mt-1'>{t('hygiene.teeth')}</div>
              <div className='text-xs'>
                {getTodayEntry()!.teethBrushed
                  ? t('hygiene.done')
                  : t('hygiene.not_yet')}
              </div>
            </div>
            <div
              className={`p-3 rounded-lg text-center ${getTodayEntry()!.deodorantApplied ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}
            >
              <i className='fas fa-spray-can text-xl'></i>
              <div className='text-sm mt-1'>{t('hygiene.deodorant')}</div>
              <div className='text-xs'>
                {getTodayEntry()!.deodorantApplied
                  ? t('hygiene.done')
                  : t('hygiene.not_yet')}
              </div>
            </div>
            <div
              className={`p-3 rounded-lg text-center ${getTodayEntry()!.perfumeApplied ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-500'}`}
            >
              <i className='fas fa-leaf text-xl'></i>
              <div className='text-sm mt-1'>{t('hygiene.perfume')}</div>
              <div className='text-xs'>
                {getTodayEntry()!.perfumeApplied
                  ? t('hygiene.done')
                  : t('hygiene.not_yet')}
              </div>
            </div>
          </div>
        ) : (
          <div className='text-center py-8 text-gray-500'>
            <i className='fas fa-spa text-3xl mb-2 opacity-50'></i>
            <p>{t('hygiene.no_entries')}</p>
          </div>
        )}
        {getTodayEntry()?.productName && (
          <div className='text-sm text-gray-600 mt-3 p-2 bg-gray-50 rounded-lg'>
            <i className='fas fa-tag mr-1'></i> {t('hygiene.product_name')}:{' '}
            {getTodayEntry()!.productName}
          </div>
        )}
        {getTodayEntry()?.notes && (
          <div className='text-sm text-gray-500 italic mt-2'>
            "{getTodayEntry()!.notes}"
          </div>
        )}
      </div>

      <div className='bg-white dark:bg-gray-900 rounded-xl shadow-sm border overflow-hidden'>
        <div className='px-6 py-4 border-b'>
          <h3 className='font-medium'>
            <i className='fas fa-history mr-2 text-primary-500'></i>{' '}
            {t('hygiene.history')}
          </h3>
        </div>
        <div className='divide-y divide-gray-100 dark:divide-gray-800'>
          {entries.length === 0 ? (
            <div className='px-6 py-8 text-center text-gray-500'>
              <i className='fas fa-calendar-alt text-4xl mb-2 opacity-50'></i>
              <p>{t('hygiene.no_entries')}</p>
            </div>
          ) : (
            entries.slice(0, 20).map((entry) => (
              <div
                key={entry.id}
                className='px-6 py-3 flex justify-between items-center hover:bg-gray-50 transition'
              >
                <div>
                  <div className='font-medium'>{entry.date}</div>
                  <div className='text-xs text-gray-500 flex gap-2 mt-1'>
                    {entry.showerTaken && (
                      <span className='text-blue-500'>
                        <i className='fas fa-shower'></i>
                      </span>
                    )}
                    {entry.teethBrushed && (
                      <span className='text-green-500'>
                        <i className='fas fa-tooth'></i>
                      </span>
                    )}
                    {entry.deodorantApplied && (
                      <span className='text-purple-500'>
                        <i className='fas fa-spray-can'></i>
                      </span>
                    )}
                    {entry.perfumeApplied && (
                      <span className='text-pink-500'>
                        <i className='fas fa-leaf'></i>
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className='text-gray-400 hover:text-red-500'
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
            <h4 className='font-medium text-sm'>{t('hygiene.tip_title')}</h4>
            <p className='text-xs text-gray-500'>{t('hygiene.tip_text')}</p>
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
              <h3 className='font-medium mb-4'>
                {t('hygiene.log_today')} - {selectedDate}
              </h3>
              <div className='space-y-3'>
                <input
                  type='date'
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                />
                <label className='flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer'>
                  <span>
                    <i className='fas fa-shower mr-2 text-blue-500'></i>
                    {t('hygiene.shower')}
                  </span>
                  <input
                    type='checkbox'
                    checked={showerTaken}
                    onChange={(e) => setShowerTaken(e.target.checked)}
                    className='w-5 h-5'
                  />
                </label>
                <label className='flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer'>
                  <span>
                    <i className='fas fa-tooth mr-2 text-green-500'></i>
                    {t('hygiene.teeth')}
                  </span>
                  <input
                    type='checkbox'
                    checked={teethBrushed}
                    onChange={(e) => setTeethBrushed(e.target.checked)}
                    className='w-5 h-5'
                  />
                </label>
                <label className='flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer'>
                  <span>
                    <i className='fas fa-spray-can mr-2 text-purple-500'></i>
                    {t('hygiene.deodorant')}
                  </span>
                  <input
                    type='checkbox'
                    checked={deodorantApplied}
                    onChange={(e) => setDeodorantApplied(e.target.checked)}
                    className='w-5 h-5'
                  />
                </label>
                <label className='flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer'>
                  <span>
                    <i className='fas fa-leaf mr-2 text-pink-500'></i>
                    {t('hygiene.perfume')}
                  </span>
                  <input
                    type='checkbox'
                    checked={perfumeApplied}
                    onChange={(e) => setPerfumeApplied(e.target.checked)}
                    className='w-5 h-5'
                  />
                </label>
                <input
                  type='text'
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder={t('hygiene.product_name')}
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
