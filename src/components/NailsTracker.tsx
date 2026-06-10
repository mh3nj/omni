import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface NailEntry {
  id: string;
  date: string;
  fingernailsTrimmed: boolean;
  toenailsTrimmed: boolean;
  fingernailsCondition:
    | 'healthy'
    | 'brittle'
    | 'yellowing'
    | 'ridges'
    | 'splitting';
  toenailsCondition:
    | 'healthy'
    | 'brittle'
    | 'yellowing'
    | 'ridges'
    | 'splitting'
    | 'thickened'
    | 'discolored';
  fungalInfection: boolean;
  ingrownNail: boolean;
  infectedCuticle: boolean;
  professionalCare: boolean;
  notes?: string;
}

interface FungalIssue {
  id: string;
  startDate: string;
  location: 'fingernail' | 'toenail';
  whichNail?: string;
  treatment: string;
  resolved: boolean;
  notes?: string;
}

interface NailsTrackerProps {
  onBack: () => void;
}

const getFingernailConditions = (t: (key: string) => string) => [
  { id: 'healthy', label: t('nails.conditions.healthy') },
  { id: 'brittle', label: t('nails.conditions.brittle') },
  { id: 'yellowing', label: t('nails.conditions.yellowing') },
  { id: 'ridges', label: t('nails.conditions.ridges') },
  { id: 'splitting', label: t('nails.conditions.splitting') },
];

const getToenailConditions = (t: (key: string) => string) => [
  { id: 'healthy', label: t('nails.conditions.healthy') },
  { id: 'brittle', label: t('nails.conditions.brittle') },
  { id: 'yellowing', label: t('nails.conditions.yellowing') },
  { id: 'ridges', label: t('nails.conditions.ridges') },
  { id: 'splitting', label: t('nails.conditions.splitting') },
  { id: 'thickened', label: t('nails.conditions.thickened') },
  { id: 'discolored', label: t('nails.conditions.discolored') },
];

export default function NailsTracker({ onBack }: NailsTrackerProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [nailLogs, setNailLogs] = useState<NailEntry[]>([]);
  const [fungalIssues, setFungalIssues] = useState<FungalIssue[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [selectedTab, setSelectedTab] = useState<'daily' | 'fungal'>('daily');
  const [showNailForm, setShowNailForm] = useState(false);
  const [showFungalForm, setShowFungalForm] = useState(false);

  const [fingernailsTrimmed, setFingernailsTrimmed] = useState(false);
  const [toenailsTrimmed, setToenailsTrimmed] = useState(false);
  const [fingernailCondition, setFingernailCondition] =
    useState<NailEntry['fingernailsCondition']>('healthy');
  const [toenailCondition, setToenailCondition] =
    useState<NailEntry['toenailsCondition']>('healthy');
  const [fungalInfection, setFungalInfection] = useState(false);
  const [ingrownNail, setIngrownNail] = useState(false);
  const [infectedCuticle, setInfectedCuticle] = useState(false);
  const [professionalCare, setProfessionalCare] = useState(false);
  const [nailNotes, setNailNotes] = useState('');

  const [fungalStart, setFungalStart] = useState('');
  const [fungalLocation, setFungalLocation] = useState<
    'fingernail' | 'toenail'
  >('toenail');
  const [fungalWhichNail, setFungalWhichNail] = useState('');
  const [fungalTreatment, setFungalTreatment] = useState('');
  const [fungalResolved, setFungalResolved] = useState(false);
  const [fungalNotes, setFungalNotes] = useState('');

  useEffect(() => {
    const savedNails = localStorage.getItem('omni_nails');
    const savedFungal = localStorage.getItem('omni_fungal');
    if (savedNails) setNailLogs(JSON.parse(savedNails));
    if (savedFungal) setFungalIssues(JSON.parse(savedFungal));
  }, []);

  useEffect(() => {
    localStorage.setItem('omni_nails', JSON.stringify(nailLogs));
  }, [nailLogs]);
  useEffect(() => {
    localStorage.setItem('omni_fungal', JSON.stringify(fungalIssues));
  }, [fungalIssues]);

  const saveNailLog = () => {
    const entry: NailEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      fingernailsTrimmed,
      toenailsTrimmed,
      fingernailsCondition: fingernailCondition,
      toenailsCondition: toenailCondition,
      fungalInfection,
      ingrownNail,
      infectedCuticle,
      professionalCare,
      notes: nailNotes || undefined,
    };
    const existing = nailLogs.findIndex((l) => l.date === selectedDate);
    if (existing !== -1) {
      const updated = [...nailLogs];
      updated[existing] = entry;
      setNailLogs(updated);
    } else {
      setNailLogs([entry, ...nailLogs]);
    }
    resetNailForm();
  };

  const saveFungalIssue = () => {
    if (!fungalStart) return;
    const entry: FungalIssue = {
      id: Date.now().toString(),
      startDate: fungalStart,
      location: fungalLocation,
      whichNail: fungalWhichNail || undefined,
      treatment: fungalTreatment,
      resolved: fungalResolved,
      notes: fungalNotes || undefined,
    };
    setFungalIssues([entry, ...fungalIssues]);
    resetFungalForm();
  };

  const deleteNailLog = (id: string) =>
    setNailLogs(nailLogs.filter((l) => l.id !== id));
  const deleteFungalIssue = (id: string) =>
    setFungalIssues(fungalIssues.filter((f) => f.id !== id));

  const resetNailForm = () => {
    setShowNailForm(false);
    setFingernailsTrimmed(false);
    setToenailsTrimmed(false);
    setFingernailCondition('healthy');
    setToenailCondition('healthy');
    setFungalInfection(false);
    setIngrownNail(false);
    setInfectedCuticle(false);
    setProfessionalCare(false);
    setNailNotes('');
  };
  const resetFungalForm = () => {
    setShowFungalForm(false);
    setFungalStart('');
    setFungalLocation('toenail');
    setFungalWhichNail('');
    setFungalTreatment('');
    setFungalResolved(false);
    setFungalNotes('');
  };

  const getTodayLog = () => nailLogs.find((l) => l.date === selectedDate);
  const getActiveFungalIssues = () => fungalIssues.filter((f) => !f.resolved);
  const getFungalSuccessRate = () =>
    fungalIssues.length
      ? Math.round(
          (fungalIssues.filter((f) => f.resolved).length /
            fungalIssues.length) *
            100,
        )
      : 0;
  const getLastTrim = () =>
    nailLogs.find((l) => l.toenailsTrimmed === true)?.date || null;
  const todayLog = getTodayLog();
  const activeFungal = getActiveFungalIssues();
  const fingernailConditionsList = getFingernailConditions(t);
  const toenailConditionsList = getToenailConditions(t);

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
            onClick={() => setShowNailForm(true)}
            className='px-4 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 flex items-center gap-2 text-sm'
          >
            <i className='fas fa-hand-peace text-xs'></i> {t('nails.add_care')}
          </button>
        </div>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('nails.active_fungal')}
          </div>
          <div
            className={`text-2xl font-light mt-1 ${activeFungal.length > 0 ? 'text-red-600' : 'text-green-600'}`}
          >
            {activeFungal.length}
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('nails.last_trim')}
          </div>
          <div className='text-sm font-medium mt-1'>
            {getLastTrim() || t('nails.not_logged')}
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('nails.treatment_success')}
          </div>
          <div className='text-2xl font-light text-green-600 mt-1'>
            {getFungalSuccessRate()}%
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('nails.total_logs')}
          </div>
          <div className='text-2xl font-light text-gray-700 mt-1'>
            {nailLogs.length}
          </div>
        </div>
      </div>

      <div className='flex gap-2 border-b'>
        <button
          onClick={() => setSelectedTab('daily')}
          className={`flex items-center gap-2 px-4 py-2 text-sm ${selectedTab === 'daily' ? 'text-gray-800 border-b-2 border-gray-800' : 'text-gray-400'}`}
        >
          <i className='fas fa-hand-peace'></i> {t('nails.daily_care')}
        </button>
        <button
          onClick={() => setSelectedTab('fungal')}
          className={`flex items-center gap-2 px-4 py-2 text-sm ${selectedTab === 'fungal' ? 'text-gray-800 border-b-2 border-gray-800' : 'text-gray-400'}`}
        >
          <i className='fas fa-biohazard'></i> {t('nails.fungal_issues')}
        </button>
      </div>

      {selectedTab === 'daily' ? (
        <div className='space-y-4'>
          <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='font-medium'>
                {t('nails.daily_care')} - {selectedDate}
              </h3>
              <button
                onClick={() => setShowNailForm(true)}
                className='px-3 py-1 text-xs bg-gray-100 rounded-lg'
              >
                {todayLog ? t('common.edit') : t('nails.log_today')}
              </button>
            </div>
            {todayLog ? (
              <div className='space-y-4'>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                  <div
                    className={`p-3 rounded-lg text-center ${todayLog.fingernailsTrimmed ? 'bg-green-100' : 'bg-gray-100'}`}
                  >
                    <i className='fas fa-hand-peace text-lg'></i>
                    <div className='text-sm mt-1'>
                      {t('nails.fingernails_trimmed')}
                    </div>
                    <div className='text-xs'>
                      {todayLog.fingernailsTrimmed ? '✓ Yes' : '✗ No'}
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded-lg text-center ${todayLog.toenailsTrimmed ? 'bg-green-100' : 'bg-gray-100'}`}
                  >
                    <i className='fas fa-shoe-prints text-lg'></i>
                    <div className='text-sm mt-1'>
                      {t('nails.toenails_trimmed')}
                    </div>
                    <div className='text-xs'>
                      {todayLog.toenailsTrimmed ? '✓ Yes' : '✗ No'}
                    </div>
                  </div>
                  <div className='p-3 rounded-lg text-center bg-blue-50'>
                    <i className='fas fa-hand-paper text-blue-600'></i>
                    <div className='text-sm mt-1'>{t('nails.fingernails')}</div>
                    <div className='text-xs capitalize'>
                      {t(`nails.conditions.${todayLog.fingernailsCondition}`)}
                    </div>
                  </div>
                  <div className='p-3 rounded-lg text-center bg-purple-50'>
                    <i className='fas fa-shoe-prints text-purple-600'></i>
                    <div className='text-sm mt-1'>{t('nails.toenails')}</div>
                    <div className='text-xs capitalize'>
                      {t(`nails.conditions.${todayLog.toenailsCondition}`)}
                    </div>
                  </div>
                </div>
                {(todayLog.fungalInfection ||
                  todayLog.ingrownNail ||
                  todayLog.infectedCuticle ||
                  todayLog.professionalCare) && (
                  <div className='grid grid-cols-2 gap-2 p-3 bg-yellow-50 rounded-lg'>
                    {todayLog.fungalInfection && (
                      <div className='text-xs text-yellow-700'>
                        ⚠️ {t('nails.fungal_infection')}
                      </div>
                    )}
                    {todayLog.ingrownNail && (
                      <div className='text-xs text-red-700'>
                        ⚠️ {t('nails.ingrown_nail')}
                      </div>
                    )}
                    {todayLog.infectedCuticle && (
                      <div className='text-xs text-orange-700'>
                        ⚠️ {t('nails.infected_cuticle')}
                      </div>
                    )}
                    {todayLog.professionalCare && (
                      <div className='text-xs text-green-700'>
                        ✓ {t('nails.professional_care')}
                      </div>
                    )}
                  </div>
                )}
                {todayLog.notes && (
                  <div className='text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg'>
                    "{todayLog.notes}"
                  </div>
                )}
                <button
                  onClick={() => deleteNailLog(todayLog.id)}
                  className='px-3 py-1 text-xs bg-gray-100 text-red-600 rounded-lg'
                >
                  {t('common.delete')}
                </button>
              </div>
            ) : (
              <div className='text-center py-8 text-gray-500'>
                <i className='fas fa-hand-peace text-3xl mb-2 opacity-50'></i>
                <p className='text-sm'>{t('nails.no_care')}</p>
              </div>
            )}
          </div>
          <div className='bg-white dark:bg-gray-900 rounded-xl shadow-sm border overflow-hidden'>
            <div className='px-6 py-4 border-b'>
              <h3 className='font-medium'>
                {t('nails.nail_care_history')} ({nailLogs.length}{' '}
                {t('nails.entries')})
              </h3>
            </div>
            <div className='divide-y'>
              {nailLogs.slice(0, 10).map((log) => (
                <div
                  key={log.id}
                  className='px-6 py-3 flex justify-between items-center'
                >
                  <div>
                    <div className='font-medium'>{log.date}</div>
                    <div className='text-xs text-gray-500'>
                      {log.toenailsTrimmed ? '✓ Trimmed' : '✗ Not trimmed'} •{' '}
                      {t('nails.toenails')}:{' '}
                      {t(`nails.conditions.${log.toenailsCondition}`)}
                      {(log.fungalInfection || log.ingrownNail) && (
                        <span className='ml-2 text-red-500'>
                          ⚠️ {t('nails.issues')}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteNailLog(log.id)}
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
              {t('nails.fungal_issues')} ({fungalIssues.length}{' '}
              {t('nails.episodes')})
            </h3>
            <button
              onClick={() => setShowFungalForm(true)}
              className='px-3 py-1 text-xs bg-gray-100 rounded-lg'
            >
              <i className='fas fa-plus mr-1'></i>
              {t('nails.log_issue')}
            </button>
          </div>
          <div className='divide-y'>
            {fungalIssues.length === 0 ? (
              <div className='px-6 py-8 text-center text-gray-400'>
                <i className='fas fa-shield-virus text-2xl mb-2 opacity-50'></i>
                <p>{t('nails.no_fungal')}</p>
              </div>
            ) : (
              fungalIssues.map((issue) => (
                <div
                  key={issue.id}
                  className='px-6 py-4 hover:bg-gray-50 transition'
                >
                  <div className='flex justify-between'>
                    <div>
                      <div className='font-medium'>
                        {issue.startDate} •{' '}
                        {issue.location === 'fingernail'
                          ? t('nails.fingernail')
                          : t('nails.toenail')}
                        {issue.whichNail && ` (${issue.whichNail})`}
                      </div>
                      <div className='text-sm text-gray-600 mt-1'>
                        {t('nails.treatment')}:{' '}
                        {issue.treatment || t('nails.not_specified')}
                      </div>
                      <div
                        className={`text-xs mt-1 ${issue.resolved ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {issue.resolved
                          ? `✓ ${t('nails.resolved')}`
                          : `⚠️ ${t('nails.active')}`}
                      </div>
                      {issue.notes && (
                        <div className='text-xs text-gray-400 italic mt-1'>
                          "{issue.notes}"
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => deleteFungalIssue(issue.id)}
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
            <h4 className='font-medium text-sm'>{t('nails.tip_title')}</h4>
            <p className='text-xs text-gray-500'>{t('nails.tip_text')}</p>
          </div>
        </div>
      </div>

      {/* Nail Care Modal */}
      <AnimatePresence>
        {showNailForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto'
            onClick={resetNailForm}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className='bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md'
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className='font-medium mb-4'>
                {t('nails.add_care')} - {selectedDate}
              </h3>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <label className='flex items-center justify-between p-2 bg-gray-50 rounded-lg'>
                    <span>
                      <i className='fas fa-hand-peace mr-2'></i>
                      {t('nails.fingernails_trimmed')}
                    </span>
                    <input
                      type='checkbox'
                      checked={fingernailsTrimmed}
                      onChange={(e) => setFingernailsTrimmed(e.target.checked)}
                      className='w-5 h-5'
                    />
                  </label>
                  <label className='flex items-center justify-between p-2 bg-gray-50 rounded-lg'>
                    <span>
                      <i className='fas fa-shoe-prints mr-2'></i>
                      {t('nails.toenails_trimmed')}
                    </span>
                    <input
                      type='checkbox'
                      checked={toenailsTrimmed}
                      onChange={(e) => setToenailsTrimmed(e.target.checked)}
                      className='w-5 h-5'
                    />
                  </label>
                </div>
                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs text-gray-500 mb-1'>
                      {t('nails.fingernails_condition')}
                    </label>
                    <select
                      value={fingernailCondition}
                      onChange={(e) =>
                        setFingernailCondition(e.target.value as any)
                      }
                      className='w-full px-3 py-2 text-sm border rounded-lg'
                    >
                      {fingernailConditionsList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='block text-xs text-gray-500 mb-1'>
                      {t('nails.toenails_condition')}
                    </label>
                    <select
                      value={toenailCondition}
                      onChange={(e) =>
                        setToenailCondition(e.target.value as any)
                      }
                      className='w-full px-3 py-2 text-sm border rounded-lg'
                    >
                      {toenailConditionsList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className='space-y-2'>
                  <label className='flex items-center gap-3'>
                    <input
                      type='checkbox'
                      checked={fungalInfection}
                      onChange={(e) => setFungalInfection(e.target.checked)}
                    />
                    <span>{t('nails.fungal_infection')}</span>
                  </label>
                  <label className='flex items-center gap-3'>
                    <input
                      type='checkbox'
                      checked={ingrownNail}
                      onChange={(e) => setIngrownNail(e.target.checked)}
                    />
                    <span>{t('nails.ingrown_nail')}</span>
                  </label>
                  <label className='flex items-center gap-3'>
                    <input
                      type='checkbox'
                      checked={infectedCuticle}
                      onChange={(e) => setInfectedCuticle(e.target.checked)}
                    />
                    <span>{t('nails.infected_cuticle')}</span>
                  </label>
                  <label className='flex items-center gap-3'>
                    <input
                      type='checkbox'
                      checked={professionalCare}
                      onChange={(e) => setProfessionalCare(e.target.checked)}
                    />
                    <span>{t('nails.professional_care')}</span>
                  </label>
                </div>
                <textarea
                  value={nailNotes}
                  onChange={(e) => setNailNotes(e.target.value)}
                  placeholder={t('common.notes')}
                  rows={2}
                  className='w-full px-3 py-2 text-sm border rounded-lg resize-none'
                />
              </div>
              <div className='flex gap-3 mt-6'>
                <button
                  onClick={resetNailForm}
                  className='flex-1 px-4 py-2 border rounded-lg text-sm'
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={saveNailLog}
                  className='flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm'
                >
                  {t('common.save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fungal Issue Modal */}
      <AnimatePresence>
        {showFungalForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
            onClick={resetFungalForm}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className='bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md'
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className='font-medium mb-4'>
                {t('nails.log_fungal_issue')}
              </h3>
              <div className='space-y-4'>
                <div>
                  <label className='block text-xs text-gray-500 mb-1'>
                    {t('nails.start_date')}
                  </label>
                  <input
                    type='date'
                    value={fungalStart}
                    onChange={(e) => setFungalStart(e.target.value)}
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  />
                </div>
                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs text-gray-500 mb-1'>
                      {t('nails.location')}
                    </label>
                    <select
                      value={fungalLocation}
                      onChange={(e) => setFungalLocation(e.target.value as any)}
                      className='w-full px-3 py-2 text-sm border rounded-lg'
                    >
                      <option value='toenail'>{t('nails.toenail')}</option>
                      <option value='fingernail'>
                        {t('nails.fingernail')}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-xs text-gray-500 mb-1'>
                      {t('nails.which_nail')}
                    </label>
                    <input
                      type='text'
                      value={fungalWhichNail}
                      onChange={(e) => setFungalWhichNail(e.target.value)}
                      placeholder={t('nails.which_nail_placeholder')}
                      className='w-full px-3 py-2 text-sm border rounded-lg'
                    />
                  </div>
                </div>
                <input
                  type='text'
                  value={fungalTreatment}
                  onChange={(e) => setFungalTreatment(e.target.value)}
                  placeholder={t('nails.treatment_placeholder')}
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                />
                <label className='flex items-center gap-3'>
                  <input
                    type='checkbox'
                    checked={fungalResolved}
                    onChange={(e) => setFungalResolved(e.target.checked)}
                  />
                  <span>{t('nails.issue_resolved')}</span>
                </label>
                <textarea
                  value={fungalNotes}
                  onChange={(e) => setFungalNotes(e.target.value)}
                  placeholder={t('common.notes')}
                  rows={2}
                  className='w-full px-3 py-2 text-sm border rounded-lg resize-none'
                />
              </div>
              <div className='flex gap-3 mt-6'>
                <button
                  onClick={resetFungalForm}
                  className='flex-1 px-4 py-2 border rounded-lg text-sm'
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={saveFungalIssue}
                  className='flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm'
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
