import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface MenstrualCycleEntry {
  id: string;
  startDate: string;
  endDate: string;
  flowIntensity: 'light' | 'medium' | 'heavy';
  symptoms: string[];
  notes?: string;
}

interface SexualHealthEntry {
  id: string;
  date: string;
  active: boolean;
  libidoLevel: 1 | 2 | 3 | 4 | 5;
  satisfaction: 1 | 2 | 3 | 4 | 5;
  discomfort: boolean;
  protectionUsed: boolean;
  notes?: string;
}

interface ReproductiveTrackerProps {
  onBack: () => void;
}

const getMenstrualSymptoms = (t: (key: string) => string) => [
  t('reproductive.symptoms_list.cramps'),
  t('reproductive.symptoms_list.bloating'),
  t('reproductive.symptoms_list.headache'),
  t('reproductive.symptoms_list.fatigue'),
  t('reproductive.symptoms_list.mood_swings'),
  t('reproductive.symptoms_list.breast_tenderness'),
  t('reproductive.symptoms_list.back_pain'),
  t('reproductive.symptoms_list.nausea'),
  t('reproductive.symptoms_list.acne'),
  t('reproductive.symptoms_list.insomnia'),
];
export default function ReproductiveTracker({
  onBack,
}: ReproductiveTrackerProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [cycles, setCycles] = useState<MenstrualCycleEntry[]>([]);
  const [sexualLogs, setSexualLogs] = useState<SexualHealthEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [selectedTab, setSelectedTab] = useState<'cycle' | 'sexual'>('cycle');
  const [showCycleForm, setShowCycleForm] = useState(false);
  const [showSexualForm, setShowSexualForm] = useState(false);
  const [cycleStart, setCycleStart] = useState('');
  const [cycleEnd, setCycleEnd] = useState('');
  const [cycleFlow, setCycleFlow] = useState<'light' | 'medium' | 'heavy'>(
    'medium',
  );
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [cycleNotes, setCycleNotes] = useState('');
  const [sexualActive, setSexualActive] = useState(false);
  const [libidoLevel, setLibidoLevel] = useState<3>(3);
  const [satisfaction, setSatisfaction] = useState<3>(3);
  const [discomfort, setDiscomfort] = useState(false);
  const [protectionUsed, setProtectionUsed] = useState(false);
  const [sexualNotes, setSexualNotes] = useState('');

  useEffect(() => {
    const savedCycles = localStorage.getItem('omni_cycles');
    const savedSexual = localStorage.getItem('omni_sexual');
    if (savedCycles) setCycles(JSON.parse(savedCycles));
    if (savedSexual) setSexualLogs(JSON.parse(savedSexual));
  }, []);

  useEffect(() => {
    localStorage.setItem('omni_cycles', JSON.stringify(cycles));
  }, [cycles]);
  useEffect(() => {
    localStorage.setItem('omni_sexual', JSON.stringify(sexualLogs));
  }, [sexualLogs]);

  const saveCycle = () => {
    if (!cycleStart) return;
    const entry: MenstrualCycleEntry = {
      id: Date.now().toString(),
      startDate: cycleStart,
      endDate: cycleEnd || cycleStart,
      flowIntensity: cycleFlow,
      symptoms: selectedSymptoms,
      notes: cycleNotes || undefined,
    };
    setCycles([entry, ...cycles]);
    resetCycleForm();
  };

  const saveSexualLog = () => {
    const entry: SexualHealthEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      active: sexualActive,
      libidoLevel,
      satisfaction,
      discomfort,
      protectionUsed,
      notes: sexualNotes || undefined,
    };
    setSexualLogs([entry, ...sexualLogs]);
    resetSexualForm();
  };

  const deleteCycle = (id: string) =>
    setCycles(cycles.filter((c) => c.id !== id));
  const deleteSexualLog = (id: string) =>
    setSexualLogs(sexualLogs.filter((s) => s.id !== id));

  const resetCycleForm = () => {
    setShowCycleForm(false);
    setCycleStart('');
    setCycleEnd('');
    setCycleFlow('medium');
    setSelectedSymptoms([]);
    setCycleNotes('');
  };
  const resetSexualForm = () => {
    setShowSexualForm(false);
    setSexualActive(false);
    setLibidoLevel(3);
    setSatisfaction(3);
    setDiscomfort(false);
    setProtectionUsed(false);
    setSexualNotes('');
  };
  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom))
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    else setSelectedSymptoms([...selectedSymptoms, symptom]);
  };
  const getLastCycle = () => (cycles.length > 0 ? cycles[0] : null);
  const getCycleDay = () => {
    const lastCycle = getLastCycle();
    if (!lastCycle) return null;
    const today = new Date();
    const start = new Date(lastCycle.startDate);
    const diffDays = Math.floor(
      (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diffDays + 1;
  };
  const getTodaySexualLog = () =>
    sexualLogs.find((s) => s.date === selectedDate);
  const flowIcon = (intensity: string) => {
    switch (intensity) {
      case 'light':
        return '💧';
      case 'medium':
        return '💧💧';
      case 'heavy':
        return '💧💧💧';
      default:
        return '💧';
    }
  };
  const getLibidoLabel = (level: number) => {
    if (level <= 2) return t('reproductive.libido_low');
    if (level <= 4) return t('reproductive.libido_moderate');
    return t('reproductive.libido_high');
  };
  const getFlowLabel = (flow: string) => {
    switch (flow) {
      case 'light':
        return t('reproductive.light');
      case 'medium':
        return t('reproductive.medium');
      case 'heavy':
        return t('reproductive.heavy');
      default:
        return flow;
    }
  };
  const todayLog = getTodaySexualLog();
  const menstrualSymptomsList = getMenstrualSymptoms(t);

  const getAverageCycleLength = () => {
    if (cycles.length < 2) return null;
    const sorted = [...cycles].sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );
    let total = 0;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1].startDate);
      const curr = new Date(sorted[i].startDate);
      total += Math.round(
        (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24),
      );
    }
    return Math.round(total / (sorted.length - 1));
  };

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
            onClick={() => setShowCycleForm(true)}
            className='px-4 py-1.5 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center gap-2 text-sm'
          >
            <i className='fas fa-female text-xs'></i>{' '}
            {t('reproductive.add_cycle')}
          </button>
        </div>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('reproductive.last_period')}
          </div>
          <div className='text-sm font-medium mt-1'>
            {getLastCycle() ? getLastCycle()!.startDate : '—'}
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('reproductive.cycle_day')}
          </div>
          <div className='text-2xl font-light text-pink-600 mt-1'>
            {getCycleDay() || '—'}
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('reproductive.cycles_tracked')}
          </div>
          <div className='text-2xl font-light text-gray-700 mt-1'>
            {cycles.length}
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('reproductive.avg_cycle')}
          </div>
          <div className='text-2xl font-light text-gray-700 mt-1'>
            {getAverageCycleLength() || '—'} {t('common.days')}
          </div>
        </div>
      </div>

      <div className='flex gap-2 border-b'>
        <button
          onClick={() => setSelectedTab('cycle')}
          className={`flex items-center gap-2 px-4 py-2 text-sm ${selectedTab === 'cycle' ? 'text-gray-800 border-b-2 border-gray-800' : 'text-gray-400'}`}
        >
          <i className='fas fa-female'></i> {t('reproductive.menstrual_cycle')}
        </button>
        <button
          onClick={() => setSelectedTab('sexual')}
          className={`flex items-center gap-2 px-4 py-2 text-sm ${selectedTab === 'sexual' ? 'text-gray-800 border-b-2 border-gray-800' : 'text-gray-400'}`}
        >
          <i className='fas fa-heart'></i> {t('reproductive.sexual_health')}
        </button>
      </div>

      {selectedTab === 'cycle' ? (
        <div className='bg-white dark:bg-gray-900 rounded-xl shadow-sm border overflow-hidden'>
          <div className='px-6 py-4 border-b'>
            <h3 className='font-medium'>
              {t('reproductive.cycle_history')} ({cycles.length}{' '}
              {t('reproductive.cycles')})
            </h3>
          </div>
          <div className='divide-y'>
            {cycles.length === 0 ? (
              <div className='px-6 py-8 text-center text-gray-400'>
                <i className='fas fa-female text-2xl mb-2 opacity-50'></i>
                <p>{t('reproductive.no_cycles')}</p>
              </div>
            ) : (
              cycles.map((cycle) => (
                <div
                  key={cycle.id}
                  className='px-6 py-4 hover:bg-gray-50 transition'
                >
                  <div className='flex justify-between'>
                    <div>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium'>
                          {cycle.startDate} → {cycle.endDate}
                        </span>
                        <span className='text-lg'>
                          {flowIcon(cycle.flowIntensity)}
                        </span>
                      </div>
                      <div className='text-sm text-gray-500 mt-1'>
                        {t('reproductive.duration')}:{' '}
                        {(() => {
                          const start = new Date(cycle.startDate);
                          const end = new Date(cycle.endDate);
                          const days =
                            Math.round(
                              (end.getTime() - start.getTime()) /
                                (1000 * 60 * 60 * 24),
                            ) + 1;
                          return `${days} ${t('common.days')}`;
                        })()}{' '}
                        • {t('reproductive.flow')}:{' '}
                        {getFlowLabel(cycle.flowIntensity)}
                      </div>
                      {cycle.symptoms.length > 0 && (
                        <div className='flex flex-wrap gap-1 mt-2'>
                          {cycle.symptoms.map((s) => (
                            <span
                              key={s}
                              className='px-2 py-0.5 text-xs bg-pink-100 text-pink-700 rounded-full'
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                      {cycle.notes && (
                        <div className='text-xs text-gray-400 italic mt-1'>
                          "{cycle.notes}"
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => deleteCycle(cycle.id)}
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
      ) : (
        <div className='space-y-4'>
          <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='font-medium'>
                {t('reproductive.sexual_health')} - {selectedDate}
              </h3>
              <button
                onClick={() => setShowSexualForm(true)}
                className='px-3 py-1 text-xs bg-gray-100 rounded-lg'
              >
                {todayLog ? t('common.edit') : t('reproductive.log_today')}
              </button>
            </div>
            {todayLog ? (
              <div className='space-y-3'>
                <div className='grid grid-cols-2 gap-3'>
                  <div
                    className={`p-3 rounded-lg text-center ${todayLog.active ? 'bg-green-100' : 'bg-gray-100'}`}
                  >
                    <i
                      className={`fas fa-heartbeat text-lg ${todayLog.active ? 'text-green-600' : 'text-gray-500'}`}
                    ></i>
                    <div className='text-sm mt-1'>
                      {t('reproductive.active')}
                    </div>
                  </div>
                  <div className='p-3 rounded-lg text-center bg-blue-100'>
                    <i className='fas fa-chart-line text-blue-600'></i>
                    <div className='text-sm mt-1'>
                      {t('reproductive.libido')}:{' '}
                      {getLibidoLabel(todayLog.libidoLevel)}
                    </div>
                  </div>
                  <div className='p-3 rounded-lg text-center bg-purple-100'>
                    <i className='fas fa-smile text-purple-600'></i>
                    <div className='text-sm mt-1'>
                      {t('reproductive.satisfaction')}: {todayLog.satisfaction}
                      /5
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded-lg text-center ${todayLog.discomfort ? 'bg-red-100' : 'bg-green-100'}`}
                  >
                    <i
                      className={`fas fa-ban text-lg ${todayLog.discomfort ? 'text-red-600' : 'text-green-600'}`}
                    ></i>
                    <div className='text-sm mt-1'>
                      {t('reproductive.discomfort')}
                    </div>
                  </div>
                </div>
                {todayLog.notes && (
                  <div className='text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg'>
                    "{todayLog.notes}"
                  </div>
                )}
              </div>
            ) : (
              <div className='text-center py-8 text-gray-500'>
                <i className='fas fa-heart text-3xl mb-2 opacity-50'></i>
                <p className='text-sm'>{t('reproductive.no_sexual')}</p>
              </div>
            )}
          </div>
          <div className='bg-white dark:bg-gray-900 rounded-xl shadow-sm border overflow-hidden'>
            <div className='px-6 py-4 border-b'>
              <h3 className='font-medium'>
                {t('reproductive.sexual_history')} ({sexualLogs.length}{' '}
                {t('reproductive.entries')})
              </h3>
            </div>
            <div className='divide-y'>
              {sexualLogs.slice(0, 10).map((log) => (
                <div
                  key={log.id}
                  className='px-6 py-3 flex justify-between items-center'
                >
                  <div>
                    <div className='font-medium'>{log.date}</div>
                    <div className='text-xs text-gray-500'>
                      {log.active
                        ? t('reproductive.active_yes')
                        : t('reproductive.active_no')}{' '}
                      • {t('reproductive.libido')}:{' '}
                      {getLibidoLabel(log.libidoLevel)} •{' '}
                      {t('reproductive.satisfaction')}: {log.satisfaction}/5
                    </div>
                  </div>
                  <button
                    onClick={() => deleteSexualLog(log.id)}
                    className='text-gray-400 hover:text-red-500'
                  >
                    <i className='fas fa-trash-alt'></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className='bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border'>
        <div className='flex gap-3'>
          <i className='fas fa-info-circle text-gray-400 text-sm mt-0.5'></i>
          <div>
            <h4 className='font-medium text-sm'>
              {t('reproductive.tip_title')}
            </h4>
            <p className='text-xs text-gray-500'>
              {t('reproductive.tip_text')}
            </p>
          </div>
        </div>
      </div>

      {/* Cycle Modal */}
      <AnimatePresence>
        {showCycleForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto'
            onClick={resetCycleForm}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className='bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md'
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className='font-medium mb-4'>
                {t('reproductive.add_cycle')}
              </h3>
              <div className='space-y-4'>
                <div>
                  <label className='block text-xs text-gray-500 mb-1'>
                    {t('reproductive.start_date')}
                  </label>
                  <input
                    type='date'
                    value={cycleStart}
                    onChange={(e) => setCycleStart(e.target.value)}
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  />
                </div>
                <div>
                  <label className='block text-xs text-gray-500 mb-1'>
                    {t('reproductive.end_date')}
                  </label>
                  <input
                    type='date'
                    value={cycleEnd}
                    onChange={(e) => setCycleEnd(e.target.value)}
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  />
                </div>
                <div>
                  <label className='block text-xs text-gray-500 mb-2'>
                    {t('reproductive.flow_intensity')}
                  </label>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => setCycleFlow('light')}
                      className={`flex-1 py-2 text-sm rounded-lg ${cycleFlow === 'light' ? 'bg-pink-600 text-white' : 'bg-gray-100'}`}
                    >
                      {t('reproductive.light')} 💧
                    </button>
                    <button
                      onClick={() => setCycleFlow('medium')}
                      className={`flex-1 py-2 text-sm rounded-lg ${cycleFlow === 'medium' ? 'bg-pink-600 text-white' : 'bg-gray-100'}`}
                    >
                      {t('reproductive.medium')} 💧💧
                    </button>
                    <button
                      onClick={() => setCycleFlow('heavy')}
                      className={`flex-1 py-2 text-sm rounded-lg ${cycleFlow === 'heavy' ? 'bg-pink-600 text-white' : 'bg-gray-100'}`}
                    >
                      {t('reproductive.heavy')} 💧💧💧
                    </button>
                  </div>
                </div>
                <div>
                  <label className='block text-xs text-gray-500 mb-2'>
                    {t('reproductive.symptoms')}
                  </label>
                  <div className='flex flex-wrap gap-2'>
                    {menstrualSymptomsList.map((s) => (
                      <button
                        key={s}
                        onClick={() => toggleSymptom(s)}
                        className={`px-2 py-1 text-xs rounded-full ${selectedSymptoms.includes(s) ? 'bg-pink-100 text-pink-700' : 'bg-gray-100'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={cycleNotes}
                  onChange={(e) => setCycleNotes(e.target.value)}
                  placeholder={t('common.notes')}
                  rows={2}
                  className='w-full px-3 py-2 text-sm border rounded-lg resize-none'
                />
              </div>
              <div className='flex gap-3 mt-6'>
                <button
                  onClick={resetCycleForm}
                  className='flex-1 px-4 py-2 border rounded-lg text-sm'
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={saveCycle}
                  className='flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg text-sm'
                >
                  {t('common.save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sexual Health Modal */}
      <AnimatePresence>
        {showSexualForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
            onClick={resetSexualForm}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className='bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md'
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className='font-medium mb-4'>
                {t('reproductive.add_sexual')} - {selectedDate}
              </h3>
              <div className='space-y-4'>
                <label className='flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer'>
                  <span>{t('reproductive.active_today')}</span>
                  <input
                    type='checkbox'
                    checked={sexualActive}
                    onChange={(e) => setSexualActive(e.target.checked)}
                    className='w-5 h-5'
                  />
                </label>
                <div>
                  <label className='block text-xs text-gray-500 mb-2'>
                    {t('reproductive.libido_level')}:{' '}
                    {getLibidoLabel(libidoLevel)}
                  </label>
                  <input
                    type='range'
                    min='1'
                    max='5'
                    value={libidoLevel}
                    onChange={(e) =>
                      setLibidoLevel(parseInt(e.target.value) as any)
                    }
                    className='w-full'
                  />
                </div>
                <div>
                  <label className='block text-xs text-gray-500 mb-2'>
                    {t('reproductive.satisfaction_level')}: {satisfaction}/5
                  </label>
                  <input
                    type='range'
                    min='1'
                    max='5'
                    value={satisfaction}
                    onChange={(e) =>
                      setSatisfaction(parseInt(e.target.value) as any)
                    }
                    className='w-full'
                  />
                </div>
                <label className='flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer'>
                  <span>{t('reproductive.experienced_discomfort')}</span>
                  <input
                    type='checkbox'
                    checked={discomfort}
                    onChange={(e) => setDiscomfort(e.target.checked)}
                    className='w-5 h-5'
                  />
                </label>
                <label className='flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer'>
                  <span>{t('reproductive.used_protection')}</span>
                  <input
                    type='checkbox'
                    checked={protectionUsed}
                    onChange={(e) => setProtectionUsed(e.target.checked)}
                    className='w-5 h-5'
                  />
                </label>
                <textarea
                  value={sexualNotes}
                  onChange={(e) => setSexualNotes(e.target.value)}
                  placeholder={t('common.notes')}
                  rows={2}
                  className='w-full px-3 py-2 text-sm border rounded-lg resize-none'
                />
              </div>
              <div className='flex gap-3 mt-6'>
                <button
                  onClick={resetSexualForm}
                  className='flex-1 px-4 py-2 border rounded-lg text-sm'
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={saveSexualLog}
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
