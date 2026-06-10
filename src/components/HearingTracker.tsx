import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface HearingTestEntry {
  id: string;
  date: string;
  leftEarLoss: number;
  rightEarLoss: number;
  frequencyTested: '250' | '500' | '1000' | '2000' | '4000' | '8000';
  clinic: string;
  audiologist: string;
  notes?: string;
}

interface TinnitusEntry {
  id: string;
  date: string;
  severity: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  duration: 'constant' | 'intermittent' | 'occasional';
  pitch: 'low' | 'medium' | 'high';
  triggers?: string[];
  notes?: string;
}

interface NoiseExposureEntry {
  id: string;
  date: string;
  activity: string;
  durationMinutes: number;
  estimatedDecibels: number;
  usedProtection: boolean;
  notes?: string;
}

interface HearingTrackerProps {
  onBack: () => void;
}

const getTinnitusTriggers = (t: (key: string) => string) => [
  t('hearing.triggers.stress'),
  t('hearing.triggers.loud_noise'),
  t('hearing.triggers.caffeine'),
  t('hearing.triggers.alcohol'),
  t('hearing.triggers.lack_of_sleep'),
  t('hearing.triggers.high_bp'),
  t('hearing.triggers.high_blood_sugar'),
  t('hearing.triggers.medications'),
];

const getNoiseActivities = (t: (key: string) => string) => [
  t('hearing.noise_activities.concert'),
  t('hearing.noise_activities.nightclub'),
  t('hearing.noise_activities.construction'),
  t('hearing.noise_activities.factory'),
  t('hearing.noise_activities.headphones'),
  t('hearing.noise_activities.lawn_mowing'),
  t('hearing.noise_activities.power_tools'),
  t('hearing.noise_activities.sporting_event'),
];

export default function HearingTracker({ onBack }: HearingTrackerProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [hearingTests, setHearingTests] = useState<HearingTestEntry[]>([]);
  const [tinnitusLogs, setTinnitusLogs] = useState<TinnitusEntry[]>([]);
  const [noiseExposures, setNoiseExposures] = useState<NoiseExposureEntry[]>(
    [],
  );
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [selectedTab, setSelectedTab] = useState<
    'tests' | 'tinnitus' | 'noise'
  >('tests');
  const [showTestForm, setShowTestForm] = useState(false);
  const [showTinnitusForm, setShowTinnitusForm] = useState(false);
  const [showNoiseForm, setShowNoiseForm] = useState(false);

  const [testLeftLoss, setTestLeftLoss] = useState('');
  const [testRightLoss, setTestRightLoss] = useState('');
  const [testFrequency, setTestFrequency] =
    useState<HearingTestEntry['frequencyTested']>('2000');
  const [testClinic, setTestClinic] = useState('');
  const [testAudiologist, setTestAudiologist] = useState('');
  const [testNotes, setTestNotes] = useState('');

  const [tinnitusSeverity, setTinnitusSeverity] = useState<5>(5);
  const [tinnitusDuration, setTinnitusDuration] =
    useState<TinnitusEntry['duration']>('intermittent');
  const [tinnitusPitch, setTinnitusPitch] =
    useState<TinnitusEntry['pitch']>('medium');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [tinnitusNotes, setTinnitusNotes] = useState('');

  const [noiseActivity, setNoiseActivity] = useState('');
  const [noiseDuration, setNoiseDuration] = useState('');
  const [noiseDecibels, setNoiseDecibels] = useState('');
  const [noiseProtection, setNoiseProtection] = useState(false);
  const [noiseNotes, setNoiseNotes] = useState('');

  useEffect(() => {
    const savedTests = localStorage.getItem('omni_hearing_tests');
    const savedTinnitus = localStorage.getItem('omni_tinnitus');
    const savedNoise = localStorage.getItem('omni_noise_exposure');
    if (savedTests) setHearingTests(JSON.parse(savedTests));
    if (savedTinnitus) setTinnitusLogs(JSON.parse(savedTinnitus));
    if (savedNoise) setNoiseExposures(JSON.parse(savedNoise));
  }, []);

  useEffect(() => {
    localStorage.setItem('omni_hearing_tests', JSON.stringify(hearingTests));
  }, [hearingTests]);
  useEffect(() => {
    localStorage.setItem('omni_tinnitus', JSON.stringify(tinnitusLogs));
  }, [tinnitusLogs]);
  useEffect(() => {
    localStorage.setItem('omni_noise_exposure', JSON.stringify(noiseExposures));
  }, [noiseExposures]);

  const saveHearingTest = () => {
    if (!testLeftLoss || !testRightLoss) return;
    const entry: HearingTestEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      leftEarLoss: parseInt(testLeftLoss),
      rightEarLoss: parseInt(testRightLoss),
      frequencyTested: testFrequency,
      clinic: testClinic,
      audiologist: testAudiologist,
      notes: testNotes || undefined,
    };
    setHearingTests([entry, ...hearingTests]);
    setShowTestForm(false);
    setTestLeftLoss('');
    setTestRightLoss('');
    setTestFrequency('2000');
    setTestClinic('');
    setTestAudiologist('');
    setTestNotes('');
  };

  const saveTinnitusLog = () => {
    const entry: TinnitusEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      severity: tinnitusSeverity,
      duration: tinnitusDuration,
      pitch: tinnitusPitch,
      triggers: selectedTriggers.length > 0 ? selectedTriggers : undefined,
      notes: tinnitusNotes || undefined,
    };
    setTinnitusLogs([entry, ...tinnitusLogs]);
    setShowTinnitusForm(false);
    setTinnitusSeverity(5);
    setTinnitusDuration('intermittent');
    setTinnitusPitch('medium');
    setSelectedTriggers([]);
    setTinnitusNotes('');
  };

  const saveNoiseExposure = () => {
    if (!noiseActivity || !noiseDuration) return;
    const entry: NoiseExposureEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      activity: noiseActivity,
      durationMinutes: parseInt(noiseDuration),
      estimatedDecibels: parseInt(noiseDecibels) || 0,
      usedProtection: noiseProtection,
      notes: noiseNotes || undefined,
    };
    setNoiseExposures([entry, ...noiseExposures]);
    setShowNoiseForm(false);
    setNoiseActivity('');
    setNoiseDuration('');
    setNoiseDecibels('');
    setNoiseProtection(false);
    setNoiseNotes('');
  };

  // const deleteTest = (id: string) =>
  //   setHearingTests(hearingTests.filter((t) => t.id !== id));
  const deleteTinnitus = (id: string) =>
    setTinnitusLogs(tinnitusLogs.filter((t) => t.id !== id));
  const deleteNoise = (id: string) =>
    setNoiseExposures(noiseExposures.filter((e) => e.id !== id));

  const toggleTrigger = (trigger: string) => {
    if (selectedTriggers.includes(trigger))
      setSelectedTriggers(selectedTriggers.filter((t) => t !== trigger));
    else setSelectedTriggers([...selectedTriggers, trigger]);
  };

  const getLatestStatus = () => {
    if (hearingTests.length === 0)
      return { text: t('hearing.no_recent_test'), color: 'text-gray-500' };
    const latest = hearingTests[0];
    const avgLoss = (latest.leftEarLoss + latest.rightEarLoss) / 2;
    if (avgLoss <= 15)
      return { text: t('hearing.normal'), color: 'text-green-600' };
    if (avgLoss <= 30)
      return { text: t('hearing.mild_loss'), color: 'text-yellow-600' };
    if (avgLoss <= 50)
      return { text: t('hearing.moderate_loss'), color: 'text-orange-600' };
    return { text: t('hearing.severe_loss'), color: 'text-red-600' };
  };

  const getDurationLabel = (duration: string) => {
    switch (duration) {
      case 'constant':
        return t('hearing.durations.constant');
      case 'intermittent':
        return t('hearing.durations.intermittent');
      case 'occasional':
        return t('hearing.durations.occasional');
      default:
        return duration;
    }
  };

  const getPitchLabel = (pitch: string) => {
    switch (pitch) {
      case 'low':
        return t('hearing.pitches.low');
      case 'medium':
        return t('hearing.pitches.medium');
      case 'high':
        return t('hearing.pitches.high');
      default:
        return pitch;
    }
  };

  const tinnitusTriggersList = getTinnitusTriggers(t);
  const noiseActivitiesList = getNoiseActivities(t);

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
        </div>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('hearing.hearing')}
          </div>
          <div
            className={`text-sm font-medium mt-1 ${getLatestStatus().color}`}
          >
            {getLatestStatus().text}
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('hearing.tests')}
          </div>
          <div className='text-2xl font-light mt-1'>{hearingTests.length}</div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('hearing.tinnitus')}
          </div>
          <div className='text-2xl font-light mt-1'>{tinnitusLogs.length}</div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('hearing.noise_events')}
          </div>
          <div className='text-2xl font-light mt-1'>
            {noiseExposures.length}
          </div>
        </div>
      </div>

      <div className='flex gap-2 border-b'>
        <button
          onClick={() => setSelectedTab('tests')}
          className={`px-4 py-2 text-sm ${
            selectedTab === 'tests'
              ? 'text-gray-800 border-b-2 border-gray-800'
              : 'text-gray-400'
          }`}
        >
          <i className='fas fa-ear-deaf mr-2'></i>
          {t('hearing.hearing_tests')}
        </button>
        <button
          onClick={() => setSelectedTab('tinnitus')}
          className={`px-4 py-2 text-sm ${
            selectedTab === 'tinnitus'
              ? 'text-gray-800 border-b-2 border-gray-800'
              : 'text-gray-400'
          }`}
        >
          <i className='fas fa-waveform mr-2'></i>
          {t('hearing.tinnitus_log')}
        </button>
        <button
          onClick={() => setSelectedTab('noise')}
          className={`px-4 py-2 text-sm ${
            selectedTab === 'noise'
              ? 'text-gray-800 border-b-2 border-gray-800'
              : 'text-gray-400'
          }`}
        >
          <i className='fas fa-volume-up mr-2'></i>
          {t('hearing.noise_exposure')}
        </button>
      </div>

      {selectedTab === 'tinnitus' && (
        <div className='bg-white dark:bg-gray-900 rounded-xl shadow-sm border overflow-hidden'>
          <div className='px-6 py-4 border-b flex justify-between items-center'>
            <h3 className='font-medium'>
              {t('hearing.tinnitus_log')} ({tinnitusLogs.length})
            </h3>
            <button
              onClick={() => setShowTinnitusForm(true)}
              className='px-3 py-1 text-sm bg-gray-800 text-white rounded-lg'
            >
              <i className='fas fa-plus mr-1'></i>
              {t('hearing.add_tinnitus')}
            </button>
          </div>
          <div className='divide-y'>
            {tinnitusLogs.map(
              (
                log, // Changed from 'l' to 'log'
              ) => (
                <div
                  key={log.id}
                  className='px-6 py-3 flex justify-between items-center'
                >
                  <div>
                    <div className='font-medium'>{log.date}</div>
                    <div className='text-sm text-gray-500'>
                      {t('hearing.severity')}: {log.severity}/10 |{' '}
                      {getDurationLabel(log.duration)} |{' '}
                      {getPitchLabel(log.pitch)} {t('hearing.pitch')}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTinnitus(log.id)}
                    className='text-red-500'
                  >
                    <i className='fas fa-trash-alt'></i>
                  </button>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {selectedTab === 'noise' && (
        <div className='bg-white dark:bg-gray-900 rounded-xl shadow-sm border overflow-hidden'>
          <div className='px-6 py-4 border-b flex justify-between items-center'>
            <h3 className='font-medium'>
              {t('hearing.noise_exposure')} ({noiseExposures.length})
            </h3>
            <button
              onClick={() => setShowNoiseForm(true)}
              className='px-3 py-1 text-sm bg-gray-800 text-white rounded-lg'
            >
              <i className='fas fa-plus mr-1'></i>
              {t('hearing.add_noise')}
            </button>
          </div>
          <div className='divide-y'>
            {noiseExposures.map(
              (
                exposure, // Changed from 'e' to 'exposure'
              ) => (
                <div
                  key={exposure.id}
                  className='px-6 py-3 flex justify-between items-center'
                >
                  <div>
                    <div className='font-medium'>{exposure.date}</div>
                    <div className='text-sm text-gray-500'>
                      {exposure.activity} | {exposure.durationMinutes} min |{' '}
                      {exposure.estimatedDecibels} dB{' '}
                      {exposure.usedProtection && `✓ ${t('hearing.protected')}`}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteNoise(exposure.id)}
                    className='text-red-500'
                  >
                    <i className='fas fa-trash-alt'></i>
                  </button>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      <div className='bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border'>
        <div className='flex gap-3'>
          <i className='fas fa-info-circle text-gray-400'></i>
          <div>
            <h4 className='font-medium text-sm'>{t('hearing.tip_title')}</h4>
            <p className='text-xs text-gray-500'>{t('hearing.tip_text')}</p>
          </div>
        </div>
      </div>

      {/* Test Modal */}
      <AnimatePresence>
        {showTestForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
            onClick={() => setShowTestForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className='bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md'
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className='font-medium mb-4'>{t('hearing.add_test')}</h3>
              <div className='space-y-4'>
                <input
                  type='date'
                  value={selectedDate}
                  disabled
                  className='w-full px-3 py-2 text-sm border rounded-lg bg-gray-100'
                />
                <div className='grid grid-cols-2 gap-3'>
                  <input
                    type='number'
                    value={testLeftLoss}
                    onChange={(e) => setTestLeftLoss(e.target.value)}
                    placeholder={`${t('hearing.left_ear')} ${t('hearing.loss')} (dB)`}
                    className='px-3 py-2 text-sm border rounded-lg'
                  />
                  <input
                    type='number'
                    value={testRightLoss}
                    onChange={(e) => setTestRightLoss(e.target.value)}
                    placeholder={`${t('hearing.right_ear')} ${t('hearing.loss')} (dB)`}
                    className='px-3 py-2 text-sm border rounded-lg'
                  />
                </div>
                <select
                  value={testFrequency}
                  onChange={(e) => setTestFrequency(e.target.value as any)}
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                >
                  <option value='250'>250 Hz ({t('hearing.low_bass')})</option>
                  <option value='500'>500 Hz ({t('hearing.speech')})</option>
                  <option value='1000'>1000 Hz ({t('hearing.speech')})</option>
                  <option value='2000'>2000 Hz ({t('hearing.speech')})</option>
                  <option value='4000'>4000 Hz ({t('hearing.high')})</option>
                  <option value='8000'>
                    8000 Hz ({t('hearing.very_high')})
                  </option>
                </select>
                <input
                  type='text'
                  value={testClinic}
                  onChange={(e) => setTestClinic(e.target.value)}
                  placeholder={t('hearing.clinic')}
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                />
                <input
                  type='text'
                  value={testAudiologist}
                  onChange={(e) => setTestAudiologist(e.target.value)}
                  placeholder={t('hearing.audiologist')}
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                />
                <textarea
                  value={testNotes}
                  onChange={(e) => setTestNotes(e.target.value)}
                  placeholder={t('common.notes')}
                  rows={2}
                  className='w-full px-3 py-2 text-sm border rounded-lg resize-none'
                />
              </div>
              <div className='flex gap-3 mt-6'>
                <button
                  onClick={() => setShowTestForm(false)}
                  className='flex-1 px-4 py-2 border rounded-lg text-sm'
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={saveHearingTest}
                  className='flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm'
                >
                  {t('common.save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tinnitus Modal */}
      <AnimatePresence>
        {showTinnitusForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto'
            onClick={() => setShowTinnitusForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className='bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md'
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className='font-medium mb-4'>{t('hearing.add_tinnitus')}</h3>
              <div className='space-y-4'>
                <div className='flex gap-1'>
                  <label>
                    {t('hearing.severity')}: {tinnitusSeverity}/10
                  </label>
                  <input
                    type='range'
                    min='1'
                    max='10'
                    value={tinnitusSeverity}
                    onChange={(e) =>
                      setTinnitusSeverity(parseInt(e.target.value) as any)
                    }
                    className='flex-1'
                  />
                </div>
                <select
                  value={tinnitusDuration}
                  onChange={(e) => setTinnitusDuration(e.target.value as any)}
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                >
                  <option value='constant'>
                    {t('hearing.durations.constant')}
                  </option>
                  <option value='intermittent'>
                    {t('hearing.durations.intermittent')}
                  </option>
                  <option value='occasional'>
                    {t('hearing.durations.occasional')}
                  </option>
                </select>
                <div className='flex gap-2'>
                  <button
                    onClick={() => setTinnitusPitch('low')}
                    className={`flex-1 py-2 rounded-lg transition ${
                      tinnitusPitch === 'low'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {t('hearing.pitches.low')}
                  </button>
                  <button
                    onClick={() => setTinnitusPitch('medium')}
                    className={`flex-1 py-2 rounded-lg transition ${
                      tinnitusPitch === 'medium'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {t('hearing.pitches.medium')}
                  </button>
                  <button
                    onClick={() => setTinnitusPitch('high')}
                    className={`flex-1 py-2 rounded-lg transition ${
                      tinnitusPitch === 'high'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {t('hearing.pitches.high')}
                  </button>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {tinnitusTriggersList.map((trigger) => (
                    <button
                      key={trigger}
                      onClick={() => toggleTrigger(trigger)}
                      className={`px-2 py-1 text-xs rounded-full ${
                        selectedTriggers.includes(trigger)
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100'
                      }`}
                    >
                      {trigger}
                    </button>
                  ))}
                </div>
                <textarea
                  value={tinnitusNotes}
                  onChange={(e) => setTinnitusNotes(e.target.value)}
                  placeholder={t('common.notes')}
                  rows={2}
                  className='w-full px-3 py-2 text-sm border rounded-lg resize-none'
                />
              </div>
              <div className='flex gap-3 mt-6'>
                <button
                  onClick={() => setShowTinnitusForm(false)}
                  className='flex-1 px-4 py-2 border rounded-lg text-sm'
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={saveTinnitusLog}
                  className='flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm'
                >
                  {t('common.save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Noise Modal */}
      <AnimatePresence>
        {showNoiseForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
            onClick={() => setShowNoiseForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className='bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md'
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className='font-medium mb-4'>{t('hearing.add_noise')}</h3>
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-2'>
                  {noiseActivitiesList.map((act) => (
                    <button
                      key={act}
                      onClick={() => setNoiseActivity(act)}
                      className={`px-2 py-1 text-xs rounded-lg ${
                        noiseActivity === act
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      {act}
                    </button>
                  ))}
                </div>
                <input
                  type='text'
                  value={noiseActivity}
                  onChange={(e) => setNoiseActivity(e.target.value)}
                  placeholder={t('hearing.activity')}
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                />
                <div className='grid grid-cols-2 gap-3'>
                  <input
                    type='number'
                    value={noiseDuration}
                    onChange={(e) => setNoiseDuration(e.target.value)}
                    placeholder={`${t('hearing.duration')} (${t('hearing.minutes')})`}
                    className='px-3 py-2 text-sm border rounded-lg'
                  />
                  <input
                    type='number'
                    value={noiseDecibels}
                    onChange={(e) => setNoiseDecibels(e.target.value)}
                    placeholder='dB'
                    className='px-3 py-2 text-sm border rounded-lg'
                  />
                </div>
                <label className='flex items-center gap-3'>
                  <input
                    type='checkbox'
                    checked={noiseProtection}
                    onChange={(e) => setNoiseProtection(e.target.checked)}
                    className='w-4 h-4'
                  />
                  <span>{t('hearing.ear_protection')}</span>
                </label>
                <textarea
                  value={noiseNotes}
                  onChange={(e) => setNoiseNotes(e.target.value)}
                  placeholder={t('common.notes')}
                  rows={2}
                  className='w-full px-3 py-2 text-sm border rounded-lg resize-none'
                />
              </div>
              <div className='flex gap-3 mt-6'>
                <button
                  onClick={() => setShowNoiseForm(false)}
                  className='flex-1 px-4 py-2 border rounded-lg text-sm'
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={saveNoiseExposure}
                  className='flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm'
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
