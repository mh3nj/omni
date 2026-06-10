import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface WoundEntry {
  id: string;
  date: string;
  location: string;
  type: 'cut' | 'blister' | 'ulcer' | 'burn' | 'rash' | 'other';
  size: number;
  painLevel: 1 | 2 | 3 | 4 | 5;
  photoPath?: string;
  treated: boolean;
  healingProgress: number;
  notes?: string;
}

interface DailySkinCheck {
  id: string;
  date: string;
  feetChecked: boolean;
  feetPhotoPath?: string;
  moisturizerApplied: boolean;
  sunscreenApplied: boolean;
  suspiciousMole?: boolean;
  drySkin?: boolean;
  itching?: boolean;
  notes?: string;
}

interface SkinTrackerProps {
  onBack: () => void;
}

const getBodyLocations = (t: (key: string) => string) => [
  t('skin.locations.foot_left'),
  t('skin.locations.foot_right'),
  t('skin.locations.leg_left'),
  t('skin.locations.leg_right'),
  t('skin.locations.hand_left'),
  t('skin.locations.hand_right'),
  t('skin.locations.arm_left'),
  t('skin.locations.arm_right'),
  t('skin.locations.torso'),
  t('skin.locations.back'),
  t('skin.locations.face'),
  t('skin.locations.neck'),
  t('skin.locations.scalp'),
];

const getWoundTypes = (t: (key: string) => string) => [
  { id: 'cut', label: t('skin.wound_types.cut'), icon: 'fas fa-cut' },
  {
    id: 'blister',
    label: t('skin.wound_types.blister'),
    icon: 'fas fa-circle',
  },
  {
    id: 'ulcer',
    label: t('skin.wound_types.ulcer'),
    icon: 'fas fa-exclamation-triangle',
  },
  { id: 'burn', label: t('skin.wound_types.burn'), icon: 'fas fa-fire' },
  { id: 'rash', label: t('skin.wound_types.rash'), icon: 'fas fa-allergies' },
  { id: 'other', label: t('skin.wound_types.other'), icon: 'fas fa-band-aid' },
];

export default function SkinTracker({ onBack }: SkinTrackerProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [wounds, setWounds] = useState<WoundEntry[]>([]);
  const [dailyChecks, setDailyChecks] = useState<DailySkinCheck[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [selectedTab, setSelectedTab] = useState<'wounds' | 'daily'>('wounds');

  // Wound form
  const [showWoundForm, setShowWoundForm] = useState(false);
  const [woundLocation, setWoundLocation] = useState('');
  const [woundType, setWoundType] = useState<WoundEntry['type']>('cut');
  const [woundSize, setWoundSize] = useState('');
  const [woundPain, setWoundPain] = useState<3>(3);
  const [woundTreated, setWoundTreated] = useState(false);
  const [woundHealing, setWoundHealing] = useState(0);
  const [woundNotes, setWoundNotes] = useState('');

  // Daily check form
  const [showDailyForm, setShowDailyForm] = useState(false);
  const [feetChecked, setFeetChecked] = useState(false);
  const [moisturizerApplied, setMoisturizerApplied] = useState(false);
  const [sunscreenApplied, setSunscreenApplied] = useState(false);
  const [suspiciousMole, setSuspiciousMole] = useState(false);
  const [drySkin, setDrySkin] = useState(false);
  const [itching, setItching] = useState(false);
  const [dailyNotes, setDailyNotes] = useState('');

  useEffect(() => {
    const savedWounds = localStorage.getItem('omni_skin_wounds');
    const savedDaily = localStorage.getItem('omni_skin_daily');
    if (savedWounds) setWounds(JSON.parse(savedWounds));
    if (savedDaily) setDailyChecks(JSON.parse(savedDaily));
  }, []);

  useEffect(() => {
    localStorage.setItem('omni_skin_wounds', JSON.stringify(wounds));
  }, [wounds]);
  useEffect(() => {
    localStorage.setItem('omni_skin_daily', JSON.stringify(dailyChecks));
  }, [dailyChecks]);

  const saveWound = () => {
    if (!woundLocation) return;
    const entry: WoundEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      location: woundLocation,
      type: woundType,
      size: parseFloat(woundSize) || 0,
      painLevel: woundPain,
      treated: woundTreated,
      healingProgress: woundHealing,
      notes: woundNotes || undefined,
    };
    setWounds([entry, ...wounds]);
    resetWoundForm();
  };

  const saveDailyCheck = () => {
    const existing = dailyChecks.find((d) => d.date === selectedDate);
    const entry: DailySkinCheck = {
      id: existing?.id || Date.now().toString(),
      date: selectedDate,
      feetChecked,
      moisturizerApplied,
      sunscreenApplied,
      suspiciousMole: suspiciousMole || undefined,
      drySkin: drySkin || undefined,
      itching: itching || undefined,
      notes: dailyNotes || undefined,
    };
    if (existing)
      setDailyChecks(
        dailyChecks.map((d) => (d.date === selectedDate ? entry : d)),
      );
    else setDailyChecks([entry, ...dailyChecks]);
    resetDailyForm();
  };

  const deleteWound = (id: string) =>
    setWounds(wounds.filter((w) => w.id !== id));
  const deleteDailyCheck = (id: string) =>
    setDailyChecks(dailyChecks.filter((d) => d.id !== id));

  const resetWoundForm = () => {
    setShowWoundForm(false);
    setWoundLocation('');
    setWoundType('cut');
    setWoundSize('');
    setWoundPain(3);
    setWoundTreated(false);
    setWoundHealing(0);
    setWoundNotes('');
  };

  const resetDailyForm = () => {
    setShowDailyForm(false);
    setFeetChecked(false);
    setMoisturizerApplied(false);
    setSunscreenApplied(false);
    setSuspiciousMole(false);
    setDrySkin(false);
    setItching(false);
    setDailyNotes('');
  };

  const getTodayDailyCheck = () =>
    dailyChecks.find((d) => d.date === selectedDate);
  const getActiveWounds = () => wounds.filter((w) => w.healingProgress < 100);
  const getFootCheckStreak = () => {
    let streak = 0;
    const sorted = [...dailyChecks].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    for (const check of sorted) {
      if (check.feetChecked) streak++;
      else break;
    }
    return streak;
  };

  const woundTypesList = getWoundTypes(t);
  const bodyLocations = getBodyLocations(t);

  const woundTypeIcon = (type: string) =>
    woundTypesList.find((wt) => wt.id === type)?.icon || 'fas fa-band-aid';

  const getPainEmoji = (level: number) => {
    if (level <= 1) return '😌';
    if (level <= 2) return '😐';
    if (level <= 3) return '😣';
    if (level <= 4) return '😫';
    return '🤕';
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
            onClick={() => setShowWoundForm(true)}
            className='px-4 py-1.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 text-sm'
          >
            <i className='fas fa-band-aid text-xs'></i> {t('skin.add_wound')}
          </button>
        </div>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('skin.active_wounds')}
          </div>
          <div className='text-2xl font-light text-red-600 mt-1'>
            {getActiveWounds().length}
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('skin.foot_check_streak')}
          </div>
          <div className='text-2xl font-light text-green-600 mt-1'>
            {getFootCheckStreak()} {t('common.days')}
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('skin.total_wounds')}
          </div>
          <div className='text-2xl font-light text-gray-700 mt-1'>
            {wounds.length}
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400 uppercase'>
            {t('skin.skin_checks')}
          </div>
          <div className='text-2xl font-light text-gray-700 mt-1'>
            {dailyChecks.length}
          </div>
        </div>
      </div>

      <div className='flex gap-2 border-b'>
        <button
          onClick={() => setSelectedTab('wounds')}
          className={`flex items-center gap-2 px-4 py-2 text-sm transition-all ${
            selectedTab === 'wounds'
              ? 'text-gray-800 border-b-2 border-gray-800'
              : 'text-gray-400'
          }`}
        >
          <i className='fas fa-band-aid'></i> {t('skin.wounds')}
        </button>
        <button
          onClick={() => setSelectedTab('daily')}
          className={`flex items-center gap-2 px-4 py-2 text-sm transition-all ${
            selectedTab === 'daily'
              ? 'text-gray-800 border-b-2 border-gray-800'
              : 'text-gray-400'
          }`}
        >
          <i className='fas fa-spa'></i> {t('skin.daily_care')}
        </button>
      </div>

      {selectedTab === 'wounds' ? (
        <div className='bg-white dark:bg-gray-900 rounded-xl shadow-sm border overflow-hidden'>
          <div className='px-6 py-4 border-b'>
            <h3 className='font-medium'>
              {t('skin.wounds')} ({wounds.length})
            </h3>
          </div>
          <div className='divide-y'>
            {wounds.length === 0 ? (
              <div className='px-6 py-8 text-center text-gray-400'>
                <i className='fas fa-band-aid text-2xl mb-2 opacity-50'></i>
                <p>{t('skin.no_wounds')}</p>
              </div>
            ) : (
              wounds.map((w) => (
                <div
                  key={w.id}
                  className='px-6 py-4 hover:bg-gray-50 transition'
                >
                  <div className='flex justify-between'>
                    <div>
                      <div className='flex items-center gap-2'>
                        <i className={woundTypeIcon(w.type)}></i>
                        <span className='font-medium'>{w.location}</span>
                        <span className='text-xs text-gray-500'>{w.date}</span>
                      </div>
                      <div className='text-sm text-gray-600 mt-1'>
                        {t('skin.type')}:{' '}
                        {woundTypesList.find((wt) => wt.id === w.type)?.label} •{' '}
                        {t('skin.size')}: {w.size}cm • {t('skin.pain')}:{' '}
                        {w.painLevel}/5 {getPainEmoji(w.painLevel)}
                      </div>
                      <div className='mt-2'>
                        <div className='flex justify-between text-xs text-gray-500 mb-1'>
                          <span>{t('skin.healing')}</span>
                          <span>{w.healingProgress}%</span>
                        </div>
                        <div className='h-2 bg-gray-200 rounded-full overflow-hidden'>
                          <div
                            className={`h-full rounded-full ${w.healingProgress >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: `${w.healingProgress}%` }}
                          ></div>
                        </div>
                      </div>
                      {w.notes && (
                        <div className='text-xs text-gray-400 italic mt-2'>
                          "{w.notes}"
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => deleteWound(w.id)}
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
                {t('skin.daily_care')} - {selectedDate}
              </h3>
              <button
                onClick={() => setShowDailyForm(true)}
                className='px-3 py-1 text-xs bg-gray-100 rounded-lg'
              >
                {getTodayDailyCheck() ? t('common.edit') : t('skin.log_today')}
              </button>
            </div>
            {getTodayDailyCheck() ? (
              <div className='space-y-3'>
                <div className='grid grid-cols-2 gap-3'>
                  <div
                    className={`p-3 rounded-lg text-center ${getTodayDailyCheck()!.feetChecked ? 'bg-green-100' : 'bg-red-100'}`}
                  >
                    <i
                      className={`fas fa-shoe-prints text-lg ${getTodayDailyCheck()!.feetChecked ? 'text-green-600' : 'text-red-600'}`}
                    ></i>
                    <div className='text-sm mt-1'>{t('skin.feet_checked')}</div>
                  </div>
                  <div
                    className={`p-3 rounded-lg text-center ${getTodayDailyCheck()!.moisturizerApplied ? 'bg-green-100' : 'bg-gray-100'}`}
                  >
                    <i className='fas fa-hand-cream text-lg'></i>
                    <div className='text-sm mt-1'>{t('skin.moisturizer')}</div>
                  </div>
                  <div
                    className={`p-3 rounded-lg text-center ${getTodayDailyCheck()!.sunscreenApplied ? 'bg-green-100' : 'bg-gray-100'}`}
                  >
                    <i className='fas fa-sun text-lg'></i>
                    <div className='text-sm mt-1'>{t('skin.sunscreen')}</div>
                  </div>
                  {(getTodayDailyCheck()!.suspiciousMole ||
                    getTodayDailyCheck()!.drySkin ||
                    getTodayDailyCheck()!.itching) && (
                    <div className='p-3 rounded-lg text-center bg-yellow-100'>
                      <i className='fas fa-exclamation-triangle text-yellow-600 text-lg'></i>
                      <div className='text-sm mt-1'>
                        {t('skin.issues_detected')}
                      </div>
                    </div>
                  )}
                </div>
                {getTodayDailyCheck()!.notes && (
                  <div className='text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg'>
                    "{getTodayDailyCheck()!.notes}"
                  </div>
                )}
              </div>
            ) : (
              <div className='text-center py-8 text-gray-500'>
                <i className='fas fa-spa text-3xl mb-2 opacity-50'></i>
                <p className='text-sm'>{t('skin.no_daily')}</p>
              </div>
            )}
          </div>
          <div className='bg-white dark:bg-gray-900 rounded-xl shadow-sm border overflow-hidden'>
            <div className='px-6 py-4 border-b'>
              <h3 className='font-medium'>
                {t('skin.daily_care')} {t('skin.history')} ({dailyChecks.length}{' '}
                {t('common.days')})
              </h3>
            </div>
            <div className='divide-y'>
              {dailyChecks.slice(0, 10).map((c) => (
                <div
                  key={c.id}
                  className='px-6 py-3 flex justify-between items-center'
                >
                  <div>
                    <div className='font-medium'>{c.date}</div>
                    <div className='text-xs text-gray-500'>
                      {c.feetChecked
                        ? `✓ ${t('skin.feet_checked')}`
                        : `✗ ${t('skin.feet_checked')}`}{' '}
                      •{' '}
                      {c.moisturizerApplied
                        ? `✓ ${t('skin.moisturizer')}`
                        : `✗ ${t('skin.moisturizer')}`}{' '}
                      •{' '}
                      {c.sunscreenApplied
                        ? `✓ ${t('skin.sunscreen')}`
                        : `✗ ${t('skin.sunscreen')}`}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteDailyCheck(c.id)}
                    className='text-gray-400 hover:text-red-500'
                  >
                    <i className='fas fa-trash-alt text-xs'></i>
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
            <h4 className='font-medium text-sm'>{t('skin.tip_title')}</h4>
            <p className='text-xs text-gray-500'>{t('skin.tip_text')}</p>
          </div>
        </div>
      </div>

      {/* Wound Modal - keep existing JSX but ensure all text uses t() */}
      <AnimatePresence>
        {showWoundForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto'
            onClick={resetWoundForm}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className='bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md'
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className='font-medium mb-4'>{t('skin.add_wound')}</h3>
              <div className='space-y-4'>
                <select
                  value={woundLocation}
                  onChange={(e) => setWoundLocation(e.target.value)}
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                >
                  <option value=''>{t('skin.select_location')}</option>
                  {bodyLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
                <div className='grid grid-cols-2 gap-2'>
                  {woundTypesList.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setWoundType(type.id as any)}
                      className={`px-2 py-2 text-xs rounded-lg flex items-center gap-2 justify-center ${
                        woundType === type.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      <i className={type.icon}></i> {type.label}
                    </button>
                  ))}
                </div>
                <div className='grid grid-cols-2 gap-3'>
                  <input
                    type='number'
                    step='0.5'
                    value={woundSize}
                    onChange={(e) => setWoundSize(e.target.value)}
                    placeholder={`${t('skin.size')} (cm)`}
                    className='px-3 py-2 text-sm border rounded-lg'
                  />
                  <div>
                    <label className='block text-xs mb-1'>
                      {t('skin.pain')}: {woundPain}/5 {getPainEmoji(woundPain)}
                    </label>
                    <input
                      type='range'
                      min='1'
                      max='5'
                      value={woundPain}
                      onChange={(e) =>
                        setWoundPain(parseInt(e.target.value) as any)
                      }
                      className='w-full'
                    />
                  </div>
                </div>
                <div>
                  <label className='block text-xs mb-1'>
                    {t('skin.healing')}: {woundHealing}%
                  </label>
                  <input
                    type='range'
                    min='0'
                    max='100'
                    value={woundHealing}
                    onChange={(e) => setWoundHealing(parseInt(e.target.value))}
                    className='w-full'
                  />
                </div>
                <label className='flex items-center gap-3 p-2'>
                  <input
                    type='checkbox'
                    checked={woundTreated}
                    onChange={(e) => setWoundTreated(e.target.checked)}
                    className='w-4 h-4'
                  />
                  <span className='text-sm'>{t('skin.treated')}</span>
                </label>
                <textarea
                  value={woundNotes}
                  onChange={(e) => setWoundNotes(e.target.value)}
                  placeholder={t('common.notes')}
                  rows={2}
                  className='w-full px-3 py-2 text-sm border rounded-lg resize-none'
                />
              </div>
              <div className='flex gap-3 mt-6'>
                <button
                  onClick={resetWoundForm}
                  className='flex-1 px-4 py-2 border rounded-lg text-sm'
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={saveWound}
                  className='flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm'
                >
                  {t('common.save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Skin Care Modal */}
      <AnimatePresence>
        {showDailyForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
            onClick={resetDailyForm}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className='bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md'
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className='font-medium mb-4'>
                {t('skin.daily_care')} - {selectedDate}
              </h3>
              <div className='space-y-3'>
                <label className='flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer'>
                  <span>
                    <i className='fas fa-shoe-prints mr-2'></i>
                    {t('skin.feet_checked')}
                  </span>
                  <input
                    type='checkbox'
                    checked={feetChecked}
                    onChange={(e) => setFeetChecked(e.target.checked)}
                    className='w-5 h-5'
                  />
                </label>
                <label className='flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer'>
                  <span>
                    <i className='fas fa-hand-cream mr-2'></i>
                    {t('skin.moisturizer')}
                  </span>
                  <input
                    type='checkbox'
                    checked={moisturizerApplied}
                    onChange={(e) => setMoisturizerApplied(e.target.checked)}
                    className='w-5 h-5'
                  />
                </label>
                <label className='flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer'>
                  <span>
                    <i className='fas fa-sun mr-2'></i>
                    {t('skin.sunscreen')}
                  </span>
                  <input
                    type='checkbox'
                    checked={sunscreenApplied}
                    onChange={(e) => setSunscreenApplied(e.target.checked)}
                    className='w-5 h-5'
                  />
                </label>
                <div className='border-t pt-3'>
                  <label className='block text-sm text-gray-500 mb-2'>
                    {t('skin.issues')}:
                  </label>
                  <div className='space-y-2'>
                    <label className='flex items-center gap-3'>
                      <input
                        type='checkbox'
                        checked={suspiciousMole}
                        onChange={(e) => setSuspiciousMole(e.target.checked)}
                      />
                      <span>{t('skin.suspicious_mole')}</span>
                    </label>
                    <label className='flex items-center gap-3'>
                      <input
                        type='checkbox'
                        checked={drySkin}
                        onChange={(e) => setDrySkin(e.target.checked)}
                      />
                      <span>{t('skin.dry_skin')}</span>
                    </label>
                    <label className='flex items-center gap-3'>
                      <input
                        type='checkbox'
                        checked={itching}
                        onChange={(e) => setItching(e.target.checked)}
                      />
                      <span>{t('skin.itching')}</span>
                    </label>
                  </div>
                </div>
                <textarea
                  value={dailyNotes}
                  onChange={(e) => setDailyNotes(e.target.value)}
                  placeholder={t('common.notes')}
                  rows={2}
                  className='w-full px-3 py-2 text-sm border rounded-lg resize-none'
                />
              </div>
              <div className='flex gap-3 mt-6'>
                <button
                  onClick={resetDailyForm}
                  className='flex-1 px-4 py-2 border rounded-lg text-sm'
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={saveDailyCheck}
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
