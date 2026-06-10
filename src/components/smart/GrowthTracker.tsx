import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ReadingEntry {
  id: string;
  date: string;
  bookTitle: string;
  pagesRead: number;
  notes?: string;
}

interface WritingEntry {
  id: string;
  date: string;
  wordsWritten: number;
  topic: string;
  notes?: string;
}

interface FunActivity {
  id: string;
  date: string;
  activity: string;
  duration: number;
  enjoyment: 1 | 2 | 3 | 4 | 5;
}

interface SocialInteraction {
  id: string;
  date: string;
  person: string;
  duration: number;
  quality: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export default function GrowthTracker() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [readings, setReadings] = useState<ReadingEntry[]>([]);
  const [writings, setWritings] = useState<WritingEntry[]>([]);
  const [funActivities, setFunActivities] = useState<FunActivity[]>([]);
  const [socialInteractions, setSocialInteractions] = useState<
    SocialInteraction[]
  >([]);
  const [activeTab, setActiveTab] = useState('reading');
  const [showForm, setShowForm] = useState(false);

  // Reading form
  const [bookTitle, setBookTitle] = useState('');
  const [pagesRead, setPagesRead] = useState('');
  const [readingNotes, setReadingNotes] = useState('');

  // Writing form
  const [wordsWritten, setWordsWritten] = useState('');
  const [topic, setTopic] = useState('');
  const [writingNotes, setWritingNotes] = useState('');

  // Fun form
  const [funActivityName, setFunActivityName] = useState('');
  const [funDuration, setFunDuration] = useState('');
  const [funEnjoyment, setFunEnjoyment] = useState<3>(3);

  // Social form
  const [person, setPerson] = useState('');
  const [socialDuration, setSocialDuration] = useState('');
  const [socialQuality, setSocialQuality] = useState<3>(3);
  const [socialNotes, setSocialNotes] = useState('');

  useEffect(() => {
    const savedReadings = localStorage.getItem('omni_readings');
    const savedWritings = localStorage.getItem('omni_writings');
    const savedFun = localStorage.getItem('omni_fun_activities');
    const savedSocial = localStorage.getItem('omni_social_interactions');
    if (savedReadings) setReadings(JSON.parse(savedReadings));
    if (savedWritings) setWritings(JSON.parse(savedWritings));
    if (savedFun) setFunActivities(JSON.parse(savedFun));
    if (savedSocial) setSocialInteractions(JSON.parse(savedSocial));
  }, []);

  useEffect(() => {
    localStorage.setItem('omni_readings', JSON.stringify(readings));
    localStorage.setItem('omni_writings', JSON.stringify(writings));
    localStorage.setItem('omni_fun_activities', JSON.stringify(funActivities));
    localStorage.setItem(
      'omni_social_interactions',
      JSON.stringify(socialInteractions),
    );
  }, [readings, writings, funActivities, socialInteractions]);

  const saveReading = () => {
    if (!bookTitle || !pagesRead) return;
    const entry: ReadingEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      bookTitle,
      pagesRead: parseInt(pagesRead),
      notes: readingNotes || undefined,
    };
    setReadings([entry, ...readings]);
    resetForm();
  };

  const saveWriting = () => {
    if (!wordsWritten) return;
    const entry: WritingEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      wordsWritten: parseInt(wordsWritten),
      topic: topic || 'General',
      notes: writingNotes || undefined,
    };
    setWritings([entry, ...writings]);
    resetForm();
  };

  const saveFunActivity = () => {
    if (!funActivityName || !funDuration) return;
    const entry: FunActivity = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      activity: funActivityName,
      duration: parseInt(funDuration),
      enjoyment: funEnjoyment,
    };
    setFunActivities([entry, ...funActivities]);
    resetForm();
  };

  const saveSocialInteraction = () => {
    if (!person || !socialDuration) return;
    const entry: SocialInteraction = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      person,
      duration: parseInt(socialDuration),
      quality: socialQuality,
      notes: socialNotes || undefined,
    };
    setSocialInteractions([entry, ...socialInteractions]);
    resetForm();
  };

  const deleteEntry = (type: string, id: string) => {
    if (type === 'reading') setReadings(readings.filter((r) => r.id !== id));
    if (type === 'writing') setWritings(writings.filter((w) => w.id !== id));
    if (type === 'fun')
      setFunActivities(funActivities.filter((f) => f.id !== id));
    if (type === 'social')
      setSocialInteractions(socialInteractions.filter((s) => s.id !== id));
  };

  const resetForm = () => {
    setShowForm(false);
    setBookTitle('');
    setPagesRead('');
    setReadingNotes('');
    setWordsWritten('');
    setTopic('');
    setWritingNotes('');
    setFunActivityName('');
    setFunDuration('');
    setFunEnjoyment(3);
    setPerson('');
    setSocialDuration('');
    setSocialQuality(3);
    setSocialNotes('');
  };

  const totalPages = readings.reduce((sum, r) => sum + r.pagesRead, 0);
  const totalWords = writings.reduce((sum, w) => sum + w.wordsWritten, 0);
  const totalFunHours =
    funActivities.reduce((sum, f) => sum + f.duration, 0) / 60;
  const thisWeekSocial = socialInteractions.filter((s) => {
    const date = new Date(s.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return date >= weekAgo;
  }).length;

  const tabs = [
    { id: 'reading', icon: 'fas fa-book', label: t('growth.reading') },
    { id: 'writing', icon: 'fas fa-pen-fancy', label: t('growth.writing') },
    { id: 'fun', icon: 'fas fa-gamepad', label: t('growth.fun') },
    { id: 'social', icon: 'fas fa-users', label: t('growth.social') },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'reading':
        return (
          <div className='divide-y divide-gray-100 dark:divide-gray-800'>
            {readings.length === 0 ? (
              <div className='px-6 py-12 text-center text-gray-500'>
                <i className='fas fa-book-open text-5xl mb-3 opacity-30'></i>
                <p>{t('growth.no_reading')}</p>
              </div>
            ) : (
              readings.slice(0, 20).map((reading) => (
                <div
                  key={reading.id}
                  className='px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition flex justify-between items-start gap-4'
                >
                  <div className='flex-1'>
                    <div className='font-medium text-gray-800 dark:text-gray-200'>
                      {reading.bookTitle}
                    </div>
                    <div className='text-sm text-gray-500 mt-1 flex items-center gap-3'>
                      <span>
                        <i className='far fa-calendar-alt mr-1'></i>{' '}
                        {reading.date}
                      </span>
                      <span>
                        <i className='fas fa-file-alt mr-1'></i>{' '}
                        {reading.pagesRead} {t('growth.pages')}
                      </span>
                    </div>
                    {reading.notes && (
                      <div className='text-xs text-gray-400 italic mt-2'>
                        "{reading.notes}"
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteEntry('reading', reading.id)}
                    className='text-gray-400 hover:text-red-500 transition'
                  >
                    <i className='fas fa-trash-alt'></i>
                  </button>
                </div>
              ))
            )}
          </div>
        );

      case 'writing':
        return (
          <div className='divide-y divide-gray-100 dark:divide-gray-800'>
            {writings.length === 0 ? (
              <div className='px-6 py-12 text-center text-gray-500'>
                <i className='fas fa-pen-fancy text-5xl mb-3 opacity-30'></i>
                <p>{t('growth.no_writing')}</p>
              </div>
            ) : (
              writings.slice(0, 20).map((writing) => (
                <div
                  key={writing.id}
                  className='px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition flex justify-between items-start gap-4'
                >
                  <div className='flex-1'>
                    <div className='font-medium text-gray-800 dark:text-gray-200'>
                      {writing.topic}
                    </div>
                    <div className='text-sm text-gray-500 mt-1 flex items-center gap-3'>
                      <span>
                        <i className='far fa-calendar-alt mr-1'></i>{' '}
                        {writing.date}
                      </span>
                      <span>
                        <i className='fas fa-keyboard mr-1'></i>{' '}
                        {writing.wordsWritten.toLocaleString()}{' '}
                        {t('growth.words')}
                      </span>
                    </div>
                    {writing.notes && (
                      <div className='text-xs text-gray-400 italic mt-2'>
                        "{writing.notes}"
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteEntry('writing', writing.id)}
                    className='text-gray-400 hover:text-red-500 transition'
                  >
                    <i className='fas fa-trash-alt'></i>
                  </button>
                </div>
              ))
            )}
          </div>
        );

      case 'fun':
        return (
          <div className='divide-y divide-gray-100 dark:divide-gray-800'>
            {funActivities.length === 0 ? (
              <div className='px-6 py-12 text-center text-gray-500'>
                <i className='fas fa-gamepad text-5xl mb-3 opacity-30'></i>
                <p>{t('growth.no_fun')}</p>
              </div>
            ) : (
              funActivities.slice(0, 20).map((activity) => (
                <div
                  key={activity.id}
                  className='px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition flex justify-between items-start gap-4'
                >
                  <div className='flex-1'>
                    <div className='font-medium text-gray-800 dark:text-gray-200'>
                      {activity.activity}
                    </div>
                    <div className='text-sm text-gray-500 mt-1 flex items-center gap-3'>
                      <span>
                        <i className='far fa-calendar-alt mr-1'></i>{' '}
                        {activity.date}
                      </span>
                      <span>
                        <i className='fas fa-clock mr-1'></i>{' '}
                        {activity.duration} {t('growth.minutes')}
                      </span>
                      <span className='flex items-center gap-1'>
                        {[...Array(5)].map((_, i) => (
                          <i
                            key={i}
                            className={`fas fa-star text-xs ${i < activity.enjoyment ? 'text-yellow-500' : 'text-gray-300'}`}
                          ></i>
                        ))}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteEntry('fun', activity.id)}
                    className='text-gray-400 hover:text-red-500 transition'
                  >
                    <i className='fas fa-trash-alt'></i>
                  </button>
                </div>
              ))
            )}
          </div>
        );

      case 'social':
        return (
          <div className='divide-y divide-gray-100 dark:divide-gray-800'>
            {socialInteractions.length === 0 ? (
              <div className='px-6 py-12 text-center text-gray-500'>
                <i className='fas fa-users text-5xl mb-3 opacity-30'></i>
                <p>{t('growth.no_social')}</p>
              </div>
            ) : (
              socialInteractions.slice(0, 20).map((interaction) => (
                <div
                  key={interaction.id}
                  className='px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition flex justify-between items-start gap-4'
                >
                  <div className='flex-1'>
                    <div className='font-medium text-gray-800 dark:text-gray-200'>
                      {interaction.person}
                    </div>
                    <div className='text-sm text-gray-500 mt-1 flex items-center gap-3'>
                      <span>
                        <i className='far fa-calendar-alt mr-1'></i>{' '}
                        {interaction.date}
                      </span>
                      <span>
                        <i className='fas fa-clock mr-1'></i>{' '}
                        {interaction.duration} {t('growth.minutes')}
                      </span>
                      <span className='flex items-center gap-1'>
                        {[...Array(5)].map((_, i) => (
                          <i
                            key={i}
                            className={`fas fa-heart text-xs ${i < interaction.quality ? 'text-red-500' : 'text-gray-300'}`}
                          ></i>
                        ))}
                      </span>
                    </div>
                    {interaction.notes && (
                      <div className='text-xs text-gray-400 italic mt-2'>
                        "{interaction.notes}"
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteEntry('social', interaction.id)}
                    className='text-gray-400 hover:text-red-500 transition'
                  >
                    <i className='fas fa-trash-alt'></i>
                  </button>
                </div>
              ))
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const getFormTitle = () => {
    switch (activeTab) {
      case 'reading':
        return t('growth.add_reading');
      case 'writing':
        return t('growth.add_writing');
      case 'fun':
        return t('growth.add_fun');
      case 'social':
        return t('growth.add_social');
      default:
        return t('growth.add_entry');
    }
  };

  return (
    <div className='space-y-6' dir={isRTL ? 'rtl' : 'ltr'}>
      <div className='flex justify-between items-center'>
        <h2 className='text-xl font-semibold text-gray-800 dark:text-gray-200'>
          <i className='fas fa-chart-line mr-2 text-primary-500'></i>{' '}
          {t('growth.title')}
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className='px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2'
        >
          <i className='fas fa-plus'></i> {t('growth.add_entry')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-4 text-white'>
          <div className='flex items-center justify-between'>
            <i className='fas fa-book-open text-2xl opacity-80'></i>
            <span className='text-xs bg-white/20 px-2 py-0.5 rounded-full'>
              {readings.length}
            </span>
          </div>
          <div className='mt-3'>
            <div className='text-2xl font-bold'>{totalPages}</div>
            <div className='text-xs opacity-80'>{t('growth.total_pages')}</div>
          </div>
        </div>
        <div className='bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-4 text-white'>
          <div className='flex items-center justify-between'>
            <i className='fas fa-pen-fancy text-2xl opacity-80'></i>
            <span className='text-xs bg-white/20 px-2 py-0.5 rounded-full'>
              {writings.length}
            </span>
          </div>
          <div className='mt-3'>
            <div className='text-2xl font-bold'>
              {totalWords.toLocaleString()}
            </div>
            <div className='text-xs opacity-80'>{t('growth.total_words')}</div>
          </div>
        </div>
        <div className='bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-4 text-white'>
          <div className='flex items-center justify-between'>
            <i className='fas fa-gamepad text-2xl opacity-80'></i>
            <span className='text-xs bg-white/20 px-2 py-0.5 rounded-full'>
              {funActivities.length}
            </span>
          </div>
          <div className='mt-3'>
            <div className='text-2xl font-bold'>
              {totalFunHours.toFixed(1)}h
            </div>
            <div className='text-xs opacity-80'>{t('growth.fun_hours')}</div>
          </div>
        </div>
        <div className='bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-4 text-white'>
          <div className='flex items-center justify-between'>
            <i className='fas fa-users text-2xl opacity-80'></i>
            <span className='text-xs bg-white/20 px-2 py-0.5 rounded-full'>
              {socialInteractions.length}
            </span>
          </div>
          <div className='mt-3'>
            <div className='text-2xl font-bold'>{thisWeekSocial}</div>
            <div className='text-xs opacity-80'>{t('growth.this_week')}</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className='flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1'>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-900 text-primary-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <i className={tab.icon}></i>
            <span className='hidden sm:inline'>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className='bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden'>
        {renderContent()}
      </div>

      {/* Add Form Modal */}
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
              <h3 className='font-medium mb-4 flex items-center gap-2'>
                <i className='fas fa-plus-circle text-primary-500'></i>
                {getFormTitle()}
              </h3>

              {activeTab === 'reading' && (
                <div className='space-y-4'>
                  <input
                    type='text'
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    placeholder={t('growth.book_title')}
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  />
                  <input
                    type='number'
                    value={pagesRead}
                    onChange={(e) => setPagesRead(e.target.value)}
                    placeholder={t('growth.pages_read')}
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  />
                  <textarea
                    value={readingNotes}
                    onChange={(e) => setReadingNotes(e.target.value)}
                    placeholder={t('growth.notes')}
                    rows={2}
                    className='w-full px-3 py-2 text-sm border rounded-lg resize-none'
                  />
                </div>
              )}

              {activeTab === 'writing' && (
                <div className='space-y-4'>
                  <input
                    type='number'
                    value={wordsWritten}
                    onChange={(e) => setWordsWritten(e.target.value)}
                    placeholder={t('growth.words_written')}
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  />
                  <input
                    type='text'
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder={t('growth.topic')}
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  />
                  <textarea
                    value={writingNotes}
                    onChange={(e) => setWritingNotes(e.target.value)}
                    placeholder={t('growth.notes')}
                    rows={2}
                    className='w-full px-3 py-2 text-sm border rounded-lg resize-none'
                  />
                </div>
              )}

              {activeTab === 'fun' && (
                <div className='space-y-4'>
                  <input
                    type='text'
                    value={funActivityName}
                    onChange={(e) => setFunActivityName(e.target.value)}
                    placeholder={t('growth.activity')}
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  />
                  <input
                    type='number'
                    value={funDuration}
                    onChange={(e) => setFunDuration(e.target.value)}
                    placeholder={t('growth.duration_minutes')}
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  />
                  <div>
                    <label className='block text-xs text-gray-500 mb-1'>
                      {t('growth.enjoyment')}: {funEnjoyment}/5
                    </label>
                    <input
                      type='range'
                      min='1'
                      max='5'
                      value={funEnjoyment}
                      onChange={(e) =>
                        setFunEnjoyment(parseInt(e.target.value) as any)
                      }
                      className='w-full'
                    />
                  </div>
                </div>
              )}

              {activeTab === 'social' && (
                <div className='space-y-4'>
                  <input
                    type='text'
                    value={person}
                    onChange={(e) => setPerson(e.target.value)}
                    placeholder={t('growth.person')}
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  />
                  <input
                    type='number'
                    value={socialDuration}
                    onChange={(e) => setSocialDuration(e.target.value)}
                    placeholder={t('growth.duration_minutes')}
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  />
                  <div>
                    <label className='block text-xs text-gray-500 mb-1'>
                      {t('growth.quality')}: {socialQuality}/5
                    </label>
                    <input
                      type='range'
                      min='1'
                      max='5'
                      value={socialQuality}
                      onChange={(e) =>
                        setSocialQuality(parseInt(e.target.value) as any)
                      }
                      className='w-full'
                    />
                  </div>
                  <textarea
                    value={socialNotes}
                    onChange={(e) => setSocialNotes(e.target.value)}
                    placeholder={t('growth.notes')}
                    rows={2}
                    className='w-full px-3 py-2 text-sm border rounded-lg resize-none'
                  />
                </div>
              )}

              <div className='flex gap-3 mt-6'>
                <button
                  onClick={resetForm}
                  className='flex-1 px-4 py-2 border rounded-lg text-sm'
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={
                    activeTab === 'reading'
                      ? saveReading
                      : activeTab === 'writing'
                        ? saveWriting
                        : activeTab === 'fun'
                          ? saveFunActivity
                          : saveSocialInteraction
                  }
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
