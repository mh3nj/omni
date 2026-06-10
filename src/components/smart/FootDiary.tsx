import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface FootEntry {
  id: string;
  date: string;
  leftPhoto?: string;
  rightPhoto?: string;
  notes?: string;
  status: 'good' | 'warning' | 'critical';
}

export default function FootDiary() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [entries, setEntries] = useState<FootEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [leftPhoto, setLeftPhoto] = useState<string | null>(null);
  const [rightPhoto, setRightPhoto] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<FootEntry['status']>('good');

  useEffect(() => {
    const saved = localStorage.getItem('omni_foot_diary');
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('omni_foot_diary', JSON.stringify(entries));
  }, [entries]);

  const handlePhotoUpload = (side: 'left' | 'right', file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (side === 'left') setLeftPhoto(reader.result as string);
      else setRightPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const saveEntry = () => {
    if (!leftPhoto && !rightPhoto) return;
    const entry: FootEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      leftPhoto: leftPhoto || undefined,
      rightPhoto: rightPhoto || undefined,
      notes: notes || undefined,
      status,
    };
    const existing = entries.findIndex((e) => e.date === selectedDate);
    if (existing !== -1) {
      const updated = [...entries];
      updated[existing] = entry;
      setEntries(updated);
    } else {
      setEntries([entry, ...entries]);
    }
    setLeftPhoto(null);
    setRightPhoto(null);
    setNotes('');
  };

  const getTodayEntry = () => entries.find((e) => e.date === selectedDate);

  const getWeeklyStatus = () => {
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const entry = entries.find((e) => e.date === dateStr);
      last7.push({ date: dateStr, status: entry?.status || 'no-data' });
    }
    return last7;
  };

  const weeklyData = getWeeklyStatus();

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-700';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700';
      case 'critical':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return 'fas fa-check-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      case 'critical':
        return 'fas fa-exclamation-circle';
      default:
        return 'fas fa-circle';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'good':
        return t('foot.good_message');
      case 'warning':
        return t('foot.warning_message');
      case 'critical':
        return t('foot.critical_message');
      default:
        return '';
    }
  };

  return (
    <div className='space-y-6' dir={isRTL ? 'rtl' : 'ltr'}>
      <div className='flex justify-between items-center'>
        <h2 className='text-xl font-semibold text-gray-800 dark:text-gray-200'>
          <i className='fas fa-shoe-prints mr-2 text-primary-500'></i>{' '}
          {t('foot.title')}
        </h2>
        <div className='flex items-center gap-3'>
          <i className='fas fa-calendar-alt text-gray-400'></i>
          <input
            type='date'
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className='px-3 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-900'
          />
        </div>
      </div>

      {/* Today's Entry */}
      <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border'>
        <h3 className='font-medium text-gray-700 dark:text-gray-300 mb-4'>
          <i className='fas fa-calendar-day mr-2 text-primary-500'></i>{' '}
          {t('foot.today_check')}
        </h3>

        {getTodayEntry() ? (
          <div>
            <div className='grid grid-cols-2 gap-4 mb-4'>
              {getTodayEntry()!.leftPhoto && (
                <div className='text-center'>
                  <img
                    src={getTodayEntry()!.leftPhoto}
                    alt={t('foot.left_foot')}
                    className='rounded-lg border max-h-48 mx-auto shadow-md'
                  />
                  <p className='text-sm text-gray-500 mt-1'>
                    <i className='fas fa-arrow-left mr-1'></i>{' '}
                    {t('foot.left_foot')}
                  </p>
                </div>
              )}
              {getTodayEntry()!.rightPhoto && (
                <div className='text-center'>
                  <img
                    src={getTodayEntry()!.rightPhoto}
                    alt={t('foot.right_foot')}
                    className='rounded-lg border max-h-48 mx-auto shadow-md'
                  />
                  <p className='text-sm text-gray-500 mt-1'>
                    {t('foot.right_foot')}{' '}
                    <i className='fas fa-arrow-right ml-1'></i>
                  </p>
                </div>
              )}
            </div>
            <div
              className={`text-center p-3 rounded-lg ${getStatusStyle(getTodayEntry()!.status)}`}
            >
              <i
                className={`${getStatusIcon(getTodayEntry()!.status)} mr-2`}
              ></i>
              {getStatusMessage(getTodayEntry()!.status)}
            </div>
            {getTodayEntry()!.notes && (
              <div className='text-sm text-gray-500 italic mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
                <i className='fas fa-quote-left mr-1 text-gray-400'></i>{' '}
                {getTodayEntry()!.notes}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className='grid grid-cols-2 gap-4 mb-4'>
              <div className='border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-500 transition-colors'>
                <input
                  type='file'
                  accept='image/*'
                  onChange={(e) =>
                    e.target.files &&
                    handlePhotoUpload('left', e.target.files[0])
                  }
                  className='hidden'
                  id='left-foot'
                />
                <label htmlFor='left-foot' className='cursor-pointer block'>
                  {leftPhoto ? (
                    <img
                      src={leftPhoto}
                      alt={t('foot.left_foot')}
                      className='max-h-32 mx-auto rounded'
                    />
                  ) : (
                    <div>
                      <i className='fas fa-camera text-3xl text-gray-400 mb-2'></i>
                      <p className='text-sm text-gray-500'>
                        {t('foot.left_foot')}
                      </p>
                      <p className='text-xs text-gray-400 mt-1'>
                        {t('foot.upload_photo')}
                      </p>
                    </div>
                  )}
                </label>
              </div>
              <div className='border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-500 transition-colors'>
                <input
                  type='file'
                  accept='image/*'
                  onChange={(e) =>
                    e.target.files &&
                    handlePhotoUpload('right', e.target.files[0])
                  }
                  className='hidden'
                  id='right-foot'
                />
                <label htmlFor='right-foot' className='cursor-pointer block'>
                  {rightPhoto ? (
                    <img
                      src={rightPhoto}
                      alt={t('foot.right_foot')}
                      className='max-h-32 mx-auto rounded'
                    />
                  ) : (
                    <div>
                      <i className='fas fa-camera text-3xl text-gray-400 mb-2'></i>
                      <p className='text-sm text-gray-500'>
                        {t('foot.right_foot')}
                      </p>
                      <p className='text-xs text-gray-400 mt-1'>
                        {t('foot.upload_photo')}
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as FootEntry['status'])}
              className='w-full px-3 py-2 text-sm border rounded-lg mb-3 bg-white dark:bg-gray-800'
            >
              <option value='good'>
                <i className='fas fa-check-circle text-green-500 mr-2'></i>{' '}
                {t('foot.status_good')}
              </option>
              <option value='warning'>
                <i className='fas fa-exclamation-triangle text-yellow-500 mr-2'></i>{' '}
                {t('foot.status_warning')}
              </option>
              <option value='critical'>
                <i className='fas fa-exclamation-circle text-red-500 mr-2'></i>{' '}
                {t('foot.status_critical')}
              </option>
            </select>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('foot.notes_placeholder')}
              rows={2}
              className='w-full px-3 py-2 text-sm border rounded-lg resize-none mb-3 bg-white dark:bg-gray-800'
            />

            <button
              onClick={saveEntry}
              disabled={!leftPhoto && !rightPhoto}
              className='w-full py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2'
            >
              <i className='fas fa-save'></i> {t('foot.save')}
            </button>
          </div>
        )}
      </div>

      {/* Weekly Overview */}
      <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border'>
        <h3 className='font-medium text-gray-700 dark:text-gray-300 mb-4'>
          <i className='fas fa-chart-line mr-2 text-primary-500'></i>{' '}
          {t('foot.weekly_overview')}
        </h3>
        <div className='grid grid-cols-7 gap-1'>
          {weeklyData.map((day, idx) => {
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            return (
              <div key={idx} className='text-center'>
                <div
                  className={`h-12 rounded-lg transition-all ${
                    day.status === 'good'
                      ? 'bg-green-500'
                      : day.status === 'warning'
                        ? 'bg-yellow-500'
                        : day.status === 'critical'
                          ? 'bg-red-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                ></div>
                <div className='text-xs mt-1 text-gray-500'>
                  {day.date.slice(5)}
                </div>
                <div className='text-xs text-gray-400 hidden sm:block'>
                  {dayNames[idx]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tip Card */}
      <div className='bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800'>
        <div className='flex gap-3'>
          <i className='fas fa-lightbulb text-blue-500 text-lg mt-0.5'></i>
          <div>
            <h4 className='font-medium text-sm text-gray-800 dark:text-gray-200 mb-1'>
              {t('foot.tip_title')}
            </h4>
            <p className='text-xs text-gray-600 dark:text-gray-400'>
              {t('foot.tip_text')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
