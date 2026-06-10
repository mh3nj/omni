import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface LabResult {
  id: string;
  date: string;
  testName: string;
  value: number;
  unit: string;
  normalRangeMin?: number;
  normalRangeMax?: number;
  notes?: string;
}

export default function LabResults() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [results, setResults] = useState<LabResult[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [testName, setTestName] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('');
  const [normalRangeMin, setNormalRangeMin] = useState('');
  const [normalRangeMax, setNormalRangeMax] = useState('');
  const [testDate, setTestDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('omni_lab_results');
    if (saved) setResults(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('omni_lab_results', JSON.stringify(results));
  }, [results]);

  const saveResult = () => {
    if (!testName || !value) return;
    const result: LabResult = {
      id: Date.now().toString(),
      date: testDate,
      testName,
      value: parseFloat(value),
      unit,
      normalRangeMin: normalRangeMin ? parseFloat(normalRangeMin) : undefined,
      normalRangeMax: normalRangeMax ? parseFloat(normalRangeMax) : undefined,
      notes: notes || undefined,
    };
    setResults([...results, result]);
    resetForm();
  };

  const deleteResult = (id: string) => {
    if (confirm(t('lab.delete_confirm'))) {
      setResults(results.filter((r) => r.id !== id));
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setTestName('');
    setValue('');
    setUnit('');
    setNormalRangeMin('');
    setNormalRangeMax('');
    setTestDate(new Date().toISOString().split('T')[0]);
    setNotes('');
  };

  const getStatus = (result: LabResult) => {
    if (
      result.normalRangeMin !== undefined &&
      result.normalRangeMax !== undefined
    ) {
      if (result.value < result.normalRangeMin)
        return {
          text: t('lab.status_low'),
          color: 'text-yellow-600',
          icon: 'fas fa-arrow-down',
          bg: 'bg-yellow-50 dark:bg-yellow-950/30',
        };
      if (result.value > result.normalRangeMax)
        return {
          text: t('lab.status_high'),
          color: 'text-red-600',
          icon: 'fas fa-arrow-up',
          bg: 'bg-red-50 dark:bg-red-950/30',
        };
      return {
        text: t('lab.status_normal'),
        color: 'text-green-600',
        icon: 'fas fa-check-circle',
        bg: 'bg-green-50 dark:bg-green-950/30',
      };
    }
    return {
      text: t('lab.status_recorded'),
      color: 'text-gray-500',
      icon: 'fas fa-chart-line',
      bg: 'bg-gray-50 dark:bg-gray-800',
    };
  };

  const getKeyMetrics = () => {
    const hba1c = results.find(
      (r) =>
        r.testName.toLowerCase().includes('hba1c') ||
        r.testName.toLowerCase().includes('a1c'),
    );
    const cholesterol = results.find((r) =>
      r.testName.toLowerCase().includes('cholesterol'),
    );
    const glucose = results.find((r) =>
      r.testName.toLowerCase().includes('glucose'),
    );
    return { hba1c, cholesterol, glucose };
  };

  const keyMetrics = getKeyMetrics();

  return (
    <div className='space-y-6' dir={isRTL ? 'rtl' : 'ltr'}>
      <div className='flex justify-between items-center'>
        <h2 className='text-xl font-semibold text-gray-800 dark:text-gray-200'>
          <i className='fas fa-flask mr-2 text-primary-500'></i>{' '}
          {t('lab.title')}
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className='px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2'
        >
          <i className='fas fa-plus'></i> {t('lab.add')}
        </button>
      </div>

      {/* Key Metrics Cards */}
      {(keyMetrics.hba1c || keyMetrics.cholesterol || keyMetrics.glucose) && (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {keyMetrics.hba1c && (
            <div className='bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white'>
              <p className='text-sm opacity-90'>
                <i className='fas fa-tint mr-1'></i> HbA1c
              </p>
              <p className='text-2xl font-bold mt-1'>
                {keyMetrics.hba1c.value}%
              </p>
              <p className='text-xs opacity-80 mt-1'>Target: &lt; 7.0%</p>
            </div>
          )}
          {keyMetrics.cholesterol && (
            <div className='bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-4 text-white'>
              <p className='text-sm opacity-90'>
                <i className='fas fa-heart mr-1'></i> Cholesterol
              </p>
              <p className='text-2xl font-bold mt-1'>
                {keyMetrics.cholesterol.value} {keyMetrics.cholesterol.unit}
              </p>
              <p className='text-xs opacity-80 mt-1'>Target: &lt; 200 mg/dL</p>
            </div>
          )}
          {keyMetrics.glucose && (
            <div className='bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-4 text-white'>
              <p className='text-sm opacity-90'>
                <i className='fas fa-tachometer-alt mr-1'></i> Glucose
              </p>
              <p className='text-2xl font-bold mt-1'>
                {keyMetrics.glucose.value} {keyMetrics.glucose.unit}
              </p>
              <p className='text-xs opacity-80 mt-1'>Target: 70-140 mg/dL</p>
            </div>
          )}
        </div>
      )}

      {/* Results Table */}
      <div className='bg-white dark:bg-gray-900 rounded-xl shadow-sm border overflow-hidden'>
        <div className='px-6 py-4 border-b bg-gray-50 dark:bg-gray-800/50'>
          <h3 className='font-medium text-gray-700 dark:text-gray-300'>
            <i className='fas fa-history mr-2 text-primary-500'></i>{' '}
            {t('lab.all_results')}
          </h3>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50 dark:bg-gray-800/50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  <i className='far fa-calendar-alt mr-1'></i>{' '}
                  {t('glucose.date_time')?.split(' ')[0] || 'Date'}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  <i className='fas fa-flask mr-1'></i> {t('lab.test_name')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  <i className='fas fa-chart-line mr-1'></i> {t('lab.value')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  <i className='fas fa-balance-scale mr-1'></i>{' '}
                  {t('lab.normal_range')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'></th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100 dark:divide-gray-800'>
              {results.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className='px-6 py-12 text-center text-gray-500'
                  >
                    <i className='fas fa-flask text-5xl mb-3 opacity-30'></i>
                    <p>{t('lab.all_results')}</p>
                    <button
                      onClick={() => setShowForm(true)}
                      className='mt-3 text-sm text-primary-600 hover:text-primary-700 transition'
                    >
                      <i className='fas fa-plus mr-1'></i> {t('lab.add')}
                    </button>
                  </td>
                </tr>
              ) : (
                [...results].reverse().map((result) => {
                  const status = getStatus(result);
                  return (
                    <tr
                      key={result.id}
                      className='hover:bg-gray-50 dark:hover:bg-gray-800/50 transition group'
                    >
                      <td className='px-6 py-3 text-sm text-gray-600 dark:text-gray-400 font-mono'>
                        {result.date}
                      </td>
                      <td className='px-6 py-3 text-sm font-medium text-gray-800 dark:text-gray-200'>
                        {result.testName}
                      </td>
                      <td className='px-6 py-3 text-sm'>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${status.color} ${status.bg}`}
                        >
                          <i className={`${status.icon} text-xs`}></i>
                          {result.value} {result.unit}
                        </span>
                      </td>
                      <td className='px-6 py-3 text-sm text-gray-500 font-mono'>
                        {result.normalRangeMin !== undefined
                          ? `${result.normalRangeMin}-${result.normalRangeMax} ${result.unit}`
                          : '—'}
                      </td>
                      <td className='px-6 py-3 text-sm text-right'>
                        <button
                          onClick={() => deleteResult(result.id)}
                          className='text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100'
                          title={t('lab.delete')}
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

      {/* Add/Edit Modal */}
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
                <i className='fas fa-flask mr-2 text-primary-500'></i>
                {t('lab.add')}
              </h3>
              <div className='space-y-4'>
                <div>
                  <label className='block text-xs font-medium text-gray-500 mb-1'>
                    <i className='far fa-calendar-alt mr-1'></i>{' '}
                    {t('glucose.date_time')?.split(' ')[0] || 'Date'}
                  </label>
                  <input
                    type='date'
                    value={testDate}
                    onChange={(e) => setTestDate(e.target.value)}
                    className='w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800'
                  />
                </div>
                <div>
                  <label className='block text-xs font-medium text-gray-500 mb-1'>
                    <i className='fas fa-flask mr-1'></i> {t('lab.test_name')}
                  </label>
                  <input
                    type='text'
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    placeholder={t('lab.placeholder_test')}
                    className='w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800'
                  />
                </div>
                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs font-medium text-gray-500 mb-1'>
                      <i className='fas fa-chart-line mr-1'></i>{' '}
                      {t('lab.value')}
                    </label>
                    <input
                      type='number'
                      step='0.1'
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder='e.g., 6.8'
                      className='w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800'
                    />
                  </div>
                  <div>
                    <label className='block text-xs font-medium text-gray-500 mb-1'>
                      <i className='fas fa-ruler mr-1'></i> {t('lab.unit')}
                    </label>
                    <input
                      type='text'
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder={t('lab.placeholder_unit')}
                      className='w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800'
                    />
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs font-medium text-gray-500 mb-1'>
                      <i className='fas fa-arrow-down mr-1'></i>{' '}
                      {t('lab.normal_min')}
                    </label>
                    <input
                      type='number'
                      step='0.1'
                      value={normalRangeMin}
                      onChange={(e) => setNormalRangeMin(e.target.value)}
                      placeholder='e.g., 4.0'
                      className='w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800'
                    />
                  </div>
                  <div>
                    <label className='block text-xs font-medium text-gray-500 mb-1'>
                      <i className='fas fa-arrow-up mr-1'></i>{' '}
                      {t('lab.normal_max')}
                    </label>
                    <input
                      type='number'
                      step='0.1'
                      value={normalRangeMax}
                      onChange={(e) => setNormalRangeMax(e.target.value)}
                      placeholder='e.g., 6.0'
                      className='w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800'
                    />
                  </div>
                </div>
                <div>
                  <label className='block text-xs font-medium text-gray-500 mb-1'>
                    <i className='fas fa-pen mr-1'></i> {t('lab.notes')}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('lab.notes')}
                    rows={2}
                    className='w-full px-3 py-2 text-sm border rounded-lg resize-none bg-white dark:bg-gray-800'
                  />
                </div>
              </div>
              <div className='flex gap-3 mt-6'>
                <button
                  onClick={resetForm}
                  className='flex-1 px-4 py-2 border rounded-lg text-sm'
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={saveResult}
                  className='flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm'
                >
                  {t('common.save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tip Card */}
      <div className='bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-800'>
        <div className='flex gap-3'>
          <i className='fas fa-info-circle text-primary-500 text-sm mt-0.5'></i>
          <div>
            <h4 className='font-medium text-sm text-gray-800 dark:text-gray-200'>
              <i className='fas fa-chart-line mr-1'></i>{' '}
              {t('lab.understanding_title')}
            </h4>
            <p className='text-xs text-gray-600 dark:text-gray-400 mt-1'>
              {t('lab.understanding_text')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
