import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface UrinationEntry {
  id: string;
  date: string;
  time: string;
  frequency: number;
  nightTimeUrination: number;
  urgency: 1 | 2 | 3 | 4 | 5;
  pain: boolean;
  burning: boolean;
  bloodInUrine: boolean;
  cloudyUrine: boolean;
  notes?: string;
}

interface UTIEntry {
  id: string;
  startDate: string;
  endDate?: string;
  symptoms: string[];
  treatment: string;
  doctorVisited: boolean;
  notes?: string;
}

interface BladderTrackerProps {
  onBack: () => void;
}

const getUTISymptoms = (t: (key: string) => string) => [
  t('bladder.symptoms_list.frequent_urination'),
  t('bladder.symptoms_list.burning'),
  t('bladder.symptoms_list.cloudy_urine'),
  t('bladder.symptoms_list.strong_odor'),
  t('bladder.symptoms_list.pelvic_pain'),
  t('bladder.symptoms_list.blood'),
  t('bladder.symptoms_list.fever'),
  t('bladder.symptoms_list.nausea'),
  t('bladder.symptoms_list.back_pain'),
  t('liver.symptoms.blood_in_stool'),
];

export default function BladderTracker({ onBack }: BladderTrackerProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [urinationLogs, setUrinationLogs] = useState<UrinationEntry[]>([]);
  const [utiHistory, setUtiHistory] = useState<UTIEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [selectedTab, setSelectedTab] = useState<'daily' | 'uti'>('daily');
  const [showUrinationForm, setShowUrinationForm] = useState(false);
  const [showUTIForm, setShowUTIForm] = useState(false);

  const [urinationTime, setUrinationTime] = useState('');
  const [urinationFrequency, setUrinationFrequency] = useState('');
  const [nightUrination, setNightUrination] = useState('');
  const [urgency, setUrgency] = useState<3>(3);
  const [pain, setPain] = useState(false);
  const [burning, setBurning] = useState(false);
  const [bloodInUrine, setBloodInUrine] = useState(false);
  const [cloudyUrine, setCloudyUrine] = useState(false);
  const [urinationNotes, setUrinationNotes] = useState('');

  const [utiStart, setUtiStart] = useState('');
  const [utiEnd, setUtiEnd] = useState('');
  const [selectedUTISymptoms, setSelectedUTISymptoms] = useState<string[]>([]);
  const [utiTreatment, setUtiTreatment] = useState('');
  const [utiDoctor, setUtiDoctor] = useState(false);
  const [utiNotes, setUtiNotes] = useState('');

  useEffect(() => {
    const savedUrination = localStorage.getItem('omni_urination');
    const savedUTI = localStorage.getItem('omni_uti');
    if (savedUrination) setUrinationLogs(JSON.parse(savedUrination));
    if (savedUTI) setUtiHistory(JSON.parse(savedUTI));
  }, []);

  useEffect(() => {
    localStorage.setItem('omni_urination', JSON.stringify(urinationLogs));
  }, [urinationLogs]);
  useEffect(() => {
    localStorage.setItem('omni_uti', JSON.stringify(utiHistory));
  }, [utiHistory]);

  const saveUrination = () => {
    if (!urinationFrequency) return;
    const entry: UrinationEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      time: urinationTime || new Date().toLocaleTimeString(),
      frequency: parseInt(urinationFrequency),
      nightTimeUrination: parseInt(nightUrination) || 0,
      urgency,
      pain,
      burning,
      bloodInUrine,
      cloudyUrine,
      notes: urinationNotes || undefined,
    };
    const existing = urinationLogs.findIndex((l) => l.date === selectedDate);
    if (existing !== -1) {
      const updated = [...urinationLogs];
      updated[existing] = entry;
      setUrinationLogs(updated);
    } else {
      setUrinationLogs([entry, ...urinationLogs]);
    }
    resetUrinationForm();
  };

  const saveUTI = () => {
    if (!utiStart) return;
    const entry: UTIEntry = {
      id: Date.now().toString(),
      startDate: utiStart,
      endDate: utiEnd || undefined,
      symptoms: selectedUTISymptoms,
      treatment: utiTreatment,
      doctorVisited: utiDoctor,
      notes: utiNotes || undefined,
    };
    setUtiHistory([entry, ...utiHistory]);
    resetUTIForm();
  };

  const deleteUrinationLog = (id: string) =>
    setUrinationLogs(urinationLogs.filter((l) => l.id !== id));
  const deleteUTI = (id: string) =>
    setUtiHistory(utiHistory.filter((u) => u.id !== id));

  const resetUrinationForm = () => {
    setShowUrinationForm(false);
    setUrinationTime('');
    setUrinationFrequency('');
    setNightUrination('');
    setUrgency(3);
    setPain(false);
    setBurning(false);
    setBloodInUrine(false);
    setCloudyUrine(false);
    setUrinationNotes('');
  };
  const resetUTIForm = () => {
    setShowUTIForm(false);
    setUtiStart('');
    setUtiEnd('');
    setSelectedUTISymptoms([]);
    setUtiTreatment('');
    setUtiDoctor(false);
    setUtiNotes('');
  };
  const toggleUTISymptom = (symptom: string) => {
    if (selectedUTISymptoms.includes(symptom))
      setSelectedUTISymptoms(selectedUTISymptoms.filter((s) => s !== symptom));
    else setSelectedUTISymptoms([...selectedUTISymptoms, symptom]);
  };
  const getTodayLog = () => urinationLogs.find((l) => l.date === selectedDate);
  const getAverageFrequency = () => {
    if (urinationLogs.length === 0) return 0;
    const sum = urinationLogs.reduce((acc, log) => acc + log.frequency, 0);
    return Math.round(sum / urinationLogs.length);
  };
  const getAverageNightUrination = () => {
    if (urinationLogs.length === 0) return 0;
    const sum = urinationLogs.reduce(
      (acc, log) => acc + log.nightTimeUrination,
      0,
    );
    return Math.round(sum / urinationLogs.length);
  };
  const getUTIAlert = () =>
    utiHistory.filter(
      (u) =>
        new Date(u.startDate) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    ).length;
  const todayLog = getTodayLog();
  const utiSymptomsList = getUTISymptoms(t);

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
            onClick={() => setShowUrinationForm(true)}
            className='px-4 py-1.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 flex items-center gap-2 text-sm'
          >
            <i className='fas fa-toilet text-xs'></i>{' '}
            {t('bladder.add_urination')}
          </button>
        </div>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('bladder.avg_daily')}
          </div>
          <div className='text-2xl font-light text-cyan-600 mt-1'>
            {getAverageFrequency()}x
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('bladder.avg_night')}
          </div>
          <div className='text-2xl font-light text-gray-700 mt-1'>
            {getAverageNightUrination()}x
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('bladder.uti_episodes')}
          </div>
          <div className='text-2xl font-light text-orange-600 mt-1'>
            {utiHistory.length}
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('bladder.recent_uti')}
          </div>
          <div
            className={`text-2xl font-light mt-1 ${getUTIAlert() > 0 ? 'text-red-600' : 'text-green-600'}`}
          >
            {getUTIAlert() > 0
              ? `⚠️ ${t('bladder.active_uti')}`
              : `✓ ${t('bladder.clear')}`}
          </div>
        </div>
      </div>

      <div className='flex gap-2 border-b'>
        <button
          onClick={() => setSelectedTab('daily')}
          className={`flex items-center gap-2 px-4 py-2 text-sm ${selectedTab === 'daily' ? 'text-gray-800 border-b-2 border-gray-800' : 'text-gray-400'}`}
        >
          <i className='fas fa-toilet'></i> {t('bladder.daily_urination')}
        </button>
        <button
          onClick={() => setSelectedTab('uti')}
          className={`flex items-center gap-2 px-4 py-2 text-sm ${selectedTab === 'uti' ? 'text-gray-800 border-b-2 border-gray-800' : 'text-gray-400'}`}
        >
          <i className='fas fa-bacteria'></i> {t('bladder.uti_history')}
        </button>
      </div>

      {selectedTab === 'daily' ? (
        <div className='space-y-4'>
          <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='font-medium'>
                {t('bladder.daily_urination')} - {selectedDate}
              </h3>
              <button
                onClick={() => setShowUrinationForm(true)}
                className='px-3 py-1 text-xs bg-gray-100 rounded-lg'
              >
                {todayLog ? t('common.edit') : t('bladder.log_today')}
              </button>
            </div>
            {todayLog ? (
              <div className='space-y-4'>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                  <div className='p-3 bg-blue-50 rounded-lg text-center'>
                    <i className='fas fa-chart-line text-blue-600'></i>
                    <div className='text-2xl font-bold text-blue-600 mt-1'>
                      {todayLog.frequency}x
                    </div>
                    <div className='text-xs text-gray-500'>
                      {t('bladder.total_day')}
                    </div>
                  </div>
                  <div className='p-3 bg-purple-50 rounded-lg text-center'>
                    <i className='fas fa-moon text-purple-600'></i>
                    <div className='text-2xl font-bold text-purple-600 mt-1'>
                      {todayLog.nightTimeUrination}x
                    </div>
                    <div className='text-xs text-gray-500'>
                      {t('bladder.night_time')}
                    </div>
                  </div>
                  <div className='p-3 bg-yellow-50 rounded-lg text-center'>
                    <i className='fas fa-tachometer-alt text-yellow-600'></i>
                    <div className='text-2xl font-bold text-yellow-600 mt-1'>
                      {todayLog.urgency}/5
                    </div>
                    <div className='text-xs text-gray-500'>
                      {t('bladder.urgency')}
                    </div>
                  </div>
                  <div className='p-3 bg-green-50 rounded-lg text-center'>
                    <i className='fas fa-clock text-green-600'></i>
                    <div className='text-sm font-medium text-green-600 mt-1'>
                      {todayLog.time}
                    </div>
                    <div className='text-xs text-gray-500'>
                      {t('bladder.last_log')}
                    </div>
                  </div>
                </div>
                {todayLog.pain && (
                  <div className='p-2 bg-red-100 text-red-700 rounded-lg text-sm'>
                    <i className='fas fa-exclamation-triangle mr-2'></i>
                    {t('bladder.pain_during_urination')}
                  </div>
                )}
                {todayLog.burning && (
                  <div className='p-2 bg-red-100 text-red-700 rounded-lg text-sm'>
                    <i className='fas fa-fire mr-2'></i>
                    {t('bladder.burning_sensation')}
                  </div>
                )}
                {todayLog.bloodInUrine && (
                  <div className='p-2 bg-red-100 text-red-700 rounded-lg text-sm'>
                    <i className='fas fa-droplet mr-2'></i>
                    {t('bladder.blood_in_urine')}
                  </div>
                )}
                {todayLog.cloudyUrine && (
                  <div className='p-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm'>
                    <i className='fas fa-cloud mr-2'></i>
                    {t('bladder.cloudy_urine')}
                  </div>
                )}
                {todayLog.notes && (
                  <div className='text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg'>
                    "{todayLog.notes}"
                  </div>
                )}
                <button
                  onClick={() => deleteUrinationLog(todayLog.id)}
                  className='px-3 py-1 text-xs bg-gray-100 text-red-600 rounded-lg'
                >
                  {t('common.delete')}
                </button>
              </div>
            ) : (
              <div className='text-center py-8 text-gray-500'>
                <i className='fas fa-toilet text-3xl mb-2 opacity-50'></i>
                <p className='text-sm'>{t('bladder.no_urination')}</p>
              </div>
            )}
          </div>
          <div className='bg-white dark:bg-gray-900 rounded-xl shadow-sm border overflow-hidden'>
            <div className='px-6 py-4 border-b'>
              <h3 className='font-medium'>
                {t('bladder.urination_history')} ({urinationLogs.length}{' '}
                {t('bladder.entries')})
              </h3>
            </div>
            <div className='divide-y'>
              {urinationLogs.slice(0, 10).map((log) => (
                <div
                  key={log.id}
                  className='px-6 py-3 flex justify-between items-center'
                >
                  <div>
                    <div className='font-medium'>{log.date}</div>
                    <div className='text-xs text-gray-500'>
                      {log.frequency}x {t('bladder.daily')} •{' '}
                      {log.nightTimeUrination}x {t('bladder.night')} •
                      {t('bladder.urgency')}: {log.urgency}/5{' '}
                      {(log.pain || log.burning) && (
                        <span className='ml-2 text-red-500'>
                          ⚠️ {t('bladder.symptoms')}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteUrinationLog(log.id)}
                    className='text-gray-400 hover:text-red-500'
                  >
                    <i className='fas fa-trash-alt'></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className='bg-white dark:bg-gray-900 rounded-xl shadow-sm border overflow-hidden'>
          <div className='px-6 py-4 border-b flex justify-between items-center'>
            <h3 className='font-medium'>
              {t('bladder.uti_history')} ({utiHistory.length}{' '}
              {t('bladder.episodes')})
            </h3>
            <button
              onClick={() => setShowUTIForm(true)}
              className='px-3 py-1 text-xs bg-gray-100 rounded-lg'
            >
              <i className='fas fa-plus mr-1'></i>
              {t('bladder.log_uti')}
            </button>
          </div>
          <div className='divide-y'>
            {utiHistory.length === 0 ? (
              <div className='px-6 py-8 text-center text-gray-400'>
                <i className='fas fa-shield-virus text-2xl mb-2 opacity-50'></i>
                <p>{t('bladder.no_uti')}</p>
              </div>
            ) : (
              utiHistory.map((uti) => (
                <div
                  key={uti.id}
                  className='px-6 py-4 hover:bg-gray-50 transition'
                >
                  <div className='flex justify-between'>
                    <div>
                      <div className='font-medium'>
                        {uti.startDate} {uti.endDate && `→ ${uti.endDate}`}
                      </div>
                      <div className='text-sm text-gray-600 mt-1'>
                        {t('bladder.treatment')}:{' '}
                        {uti.treatment || t('bladder.not_specified')}
                      </div>
                      {uti.symptoms.length > 0 && (
                        <div className='flex flex-wrap gap-1 mt-2'>
                          {uti.symptoms.map((s) => (
                            <span
                              key={s}
                              className='px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full'
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                      {uti.doctorVisited && (
                        <div className='text-xs text-green-600 mt-1'>
                          ✓ {t('bladder.doctor_visited')}
                        </div>
                      )}
                      {uti.notes && (
                        <div className='text-xs text-gray-400 italic mt-1'>
                          "{uti.notes}"
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => deleteUTI(uti.id)}
                      className='text-gray-400 hover:text-red-500'
                    >
                      <i className='fas fa-trash-alt'></i>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className='bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border'>
        <div className='flex gap-3'>
          <i className='fas fa-info-circle text-gray-400 text-sm mt-0.5'></i>
          <div>
            <h4 className='font-medium text-sm'>{t('bladder.tip_title')}</h4>
            <p className='text-xs text-gray-500'>{t('bladder.tip_text')}</p>
          </div>
        </div>
      </div>

      {/* Urination Modal */}
      <AnimatePresence>
        {showUrinationForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto'
            onClick={resetUrinationForm}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className='bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md'
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className='font-medium mb-4'>
                {t('bladder.add_urination')} - {selectedDate}
              </h3>
              <div className='space-y-4'>
                <div>
                  <label className='block text-xs text-gray-500 mb-1'>
                    {t('bladder.time_of_last_log')}
                  </label>
                  <input
                    type='time'
                    value={urinationTime}
                    onChange={(e) => setUrinationTime(e.target.value)}
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  />
                </div>
                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs text-gray-500 mb-1'>
                      {t('bladder.times_urinated_today')}
                    </label>
                    <input
                      type='number'
                      value={urinationFrequency}
                      onChange={(e) => setUrinationFrequency(e.target.value)}
                      placeholder='e.g., 6'
                      className='w-full px-3 py-2 text-sm border rounded-lg'
                    />
                  </div>
                  <div>
                    <label className='block text-xs text-gray-500 mb-1'>
                      {t('bladder.night_urination')}
                    </label>
                    <input
                      type='number'
                      value={nightUrination}
                      onChange={(e) => setNightUrination(e.target.value)}
                      placeholder='e.g., 2'
                      className='w-full px-3 py-2 text-sm border rounded-lg'
                    />
                  </div>
                </div>
                <div>
                  <label className='block text-xs text-gray-500 mb-2'>
                    {t('bladder.urgency_level')}: {urgency}/5
                  </label>
                  <input
                    type='range'
                    min='1'
                    max='5'
                    value={urgency}
                    onChange={(e) =>
                      setUrgency(parseInt(e.target.value) as any)
                    }
                    className='w-full'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='flex items-center gap-3'>
                    <input
                      type='checkbox'
                      checked={pain}
                      onChange={(e) => setPain(e.target.checked)}
                    />
                    <span>{t('bladder.pain_during_urination')}</span>
                  </label>
                  <label className='flex items-center gap-3'>
                    <input
                      type='checkbox'
                      checked={burning}
                      onChange={(e) => setBurning(e.target.checked)}
                    />
                    <span>{t('bladder.burning_sensation')}</span>
                  </label>
                  <label className='flex items-center gap-3'>
                    <input
                      type='checkbox'
                      checked={bloodInUrine}
                      onChange={(e) => setBloodInUrine(e.target.checked)}
                    />
                    <span>{t('bladder.blood_in_urine')}</span>
                  </label>
                  <label className='flex items-center gap-3'>
                    <input
                      type='checkbox'
                      checked={cloudyUrine}
                      onChange={(e) => setCloudyUrine(e.target.checked)}
                    />
                    <span>{t('bladder.cloudy_urine')}</span>
                  </label>
                </div>
                <textarea
                  value={urinationNotes}
                  onChange={(e) => setUrinationNotes(e.target.value)}
                  placeholder={t('common.notes')}
                  rows={2}
                  className='w-full px-3 py-2 text-sm border rounded-lg resize-none'
                />
              </div>
              <div className='flex gap-3 mt-6'>
                <button
                  onClick={resetUrinationForm}
                  className='flex-1 px-4 py-2 border rounded-lg text-sm'
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={saveUrination}
                  className='flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm'
                >
                  {t('common.save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UTI Modal */}
      <AnimatePresence>
        {showUTIForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
            onClick={resetUTIForm}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className='bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md'
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className='font-medium mb-4'>{t('bladder.log_uti')}</h3>
              <div className='space-y-4'>
                <div>
                  <label className='block text-xs text-gray-500 mb-1'>
                    {t('bladder.start_date')}
                  </label>
                  <input
                    type='date'
                    value={utiStart}
                    onChange={(e) => setUtiStart(e.target.value)}
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  />
                </div>
                <div>
                  <label className='block text-xs text-gray-500 mb-1'>
                    {t('bladder.end_date')}
                  </label>
                  <input
                    type='date'
                    value={utiEnd}
                    onChange={(e) => setUtiEnd(e.target.value)}
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  />
                </div>
                <div>
                  <label className='block text-xs text-gray-500 mb-2'>
                    {t('bladder.symptoms')}
                  </label>
                  <div className='flex flex-wrap gap-2'>
                    {utiSymptomsList.map((s) => (
                      <button
                        key={s}
                        onClick={() => toggleUTISymptom(s)}
                        className={`px-2 py-1 text-xs rounded-full ${selectedUTISymptoms.includes(s) ? 'bg-red-100 text-red-700' : 'bg-gray-100'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type='text'
                  value={utiTreatment}
                  onChange={(e) => setUtiTreatment(e.target.value)}
                  placeholder={t('bladder.treatment_placeholder')}
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                />
                <label className='flex items-center gap-3'>
                  <input
                    type='checkbox'
                    checked={utiDoctor}
                    onChange={(e) => setUtiDoctor(e.target.checked)}
                  />
                  <span>{t('bladder.visited_doctor')}</span>
                </label>
                <textarea
                  value={utiNotes}
                  onChange={(e) => setUtiNotes(e.target.value)}
                  placeholder={t('common.notes')}
                  rows={2}
                  className='w-full px-3 py-2 text-sm border rounded-lg resize-none'
                />
              </div>
              <div className='flex gap-3 mt-6'>
                <button
                  onClick={resetUTIForm}
                  className='flex-1 px-4 py-2 border rounded-lg text-sm'
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={saveUTI}
                  className='flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm'
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
