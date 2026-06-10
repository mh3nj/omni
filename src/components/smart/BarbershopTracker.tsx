import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Visit {
  id: string;
  date: string;
  service: string;
  cost: number;
  barber: string;
  notes?: string;
  nextAppointment?: string;
}

export default function BarbershopTracker() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [visits, setVisits] = useState<Visit[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [service, setService] = useState('');
  const [cost, setCost] = useState('');
  const [barber, setBarber] = useState('');
  const [nextAppointment, setNextAppointment] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('omni_barbershop');
    if (saved) setVisits(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('omni_barbershop', JSON.stringify(visits));
  }, [visits]);

  const saveVisit = () => {
    if (!service) return;
    const visit: Visit = {
      id: Date.now().toString(),
      date: selectedDate,
      service,
      cost: parseFloat(cost) || 0,
      barber: barber || '',
      nextAppointment: nextAppointment || undefined,
      notes: notes || undefined,
    };
    setVisits([visit, ...visits]);
    resetForm();
  };

  const deleteVisit = (id: string) =>
    setVisits(visits.filter((v) => v.id !== id));

  const resetForm = () => {
    setShowForm(false);
    setService('');
    setCost('');
    setBarber('');
    setNextAppointment('');
    setNotes('');
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const getLastVisit = () => visits[0];
  const getTotalSpent = () => visits.reduce((sum, v) => sum + v.cost, 0);
  const getDaysSince = () => {
    if (visits.length === 0) return null;
    const lastDate = new Date(visits[0].date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getServiceIcon = (service: string) => {
    const lower = service.toLowerCase();
    if (lower.includes('haircut')) return 'fas fa-cut';
    if (lower.includes('beard')) return 'fas fa-beard';
    if (lower.includes('color')) return 'fas fa-palette';
    return 'fas fa-cut';
  };

  return (
    <div className='space-y-6' dir={isRTL ? 'rtl' : 'ltr'}>
      <div className='flex justify-between items-center'>
        <h2 className='text-xl font-semibold text-gray-800 dark:text-gray-200'>
          <i className='fas fa-cut mr-2 text-primary-500'></i>{' '}
          {t('barber.title')}
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className='px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2'
        >
          <i className='fas fa-plus'></i> {t('barber.log_visit')}
        </button>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400'>{t('barber.last_visit')}</div>
          <div className='text-sm font-medium mt-1'>
            {getLastVisit()?.date || '—'}
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400'>{t('barber.days_ago')}</div>
          <div className='text-2xl font-light mt-1'>
            {getDaysSince() || '—'}
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400'>
            {t('barber.total_visits')}
          </div>
          <div className='text-2xl font-light mt-1'>{visits.length}</div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400'>{t('barber.total_spent')}</div>
          <div className='text-2xl font-light mt-1'>${getTotalSpent()}</div>
        </div>
      </div>

      {getLastVisit()?.nextAppointment && (
        <div className='bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white'>
          <p className='text-sm opacity-90'>
            <i className='fas fa-calendar-alt mr-1'></i>{' '}
            {t('barber.next_appointment')}
          </p>
          <div className='text-lg font-bold'>
            {getLastVisit()!.nextAppointment}
          </div>
          <p className='text-xs opacity-80 mt-1'>
            {getLastVisit()!.service} {t('barber.with')}{' '}
            {getLastVisit()!.barber || t('barber.barber_default')}
          </p>
        </div>
      )}

      <div className='bg-white dark:bg-gray-900 rounded-xl shadow-sm border overflow-hidden'>
        <div className='px-6 py-4 border-b'>
          <h3 className='font-medium'>
            <i className='fas fa-history mr-2 text-primary-500'></i>{' '}
            {t('barber.visit_history')}
          </h3>
        </div>
        <div className='divide-y divide-gray-100 dark:divide-gray-800'>
          {visits.length === 0 ? (
            <div className='px-6 py-8 text-center text-gray-500'>
              <i className='fas fa-cut text-4xl mb-2 opacity-50'></i>
              <p>{t('barber.no_visits')}</p>
            </div>
          ) : (
            visits.map((visit) => (
              <div
                key={visit.id}
                className='px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition flex justify-between items-start gap-4'
              >
                <div>
                  <div className='flex items-center gap-2'>
                    <i className={getServiceIcon(visit.service)}></i>
                    <span className='font-medium text-gray-800 dark:text-gray-200'>
                      {visit.date} - {visit.service}
                    </span>
                  </div>
                  <div className='text-sm text-gray-500 mt-1'>
                    <i className='fas fa-dollar-sign mr-1'></i> {visit.cost} •
                    <i className='fas fa-user mr-1 ml-1'></i>{' '}
                    {visit.barber || t('barber.barber_default')}
                    {visit.nextAppointment && (
                      <span className='ml-1'>
                        • <i className='fas fa-calendar-alt mr-1'></i>{' '}
                        {t('barber.next')}: {visit.nextAppointment}
                      </span>
                    )}
                  </div>
                  {visit.notes && (
                    <div className='text-xs text-gray-400 italic mt-1'>
                      "{visit.notes}"
                    </div>
                  )}
                </div>
                <button
                  onClick={() => deleteVisit(visit.id)}
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
            <h4 className='font-medium text-sm'>{t('barber.tip_title')}</h4>
            <p className='text-xs text-gray-500'>{t('barber.tip_text')}</p>
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
              <h3 className='font-medium mb-4'>{t('barber.log_visit')}</h3>
              <div className='space-y-4'>
                <div>
                  <label className='block text-xs text-gray-500 mb-1'>
                    {t('glucose.date_time')?.split(' ')[0] || 'Date'}
                  </label>
                  <input
                    type='date'
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  />
                </div>
                <div>
                  <label className='block text-xs text-gray-500 mb-1'>
                    {t('barber.service')}
                  </label>
                  <input
                    type='text'
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    placeholder={t('barber.service_placeholder')}
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  />
                </div>
                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs text-gray-500 mb-1'>
                      {t('barber.cost')}
                    </label>
                    <input
                      type='number'
                      step='0.01'
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      placeholder='0.00'
                      className='px-3 py-2 text-sm border rounded-lg'
                    />
                  </div>
                  <div>
                    <label className='block text-xs text-gray-500 mb-1'>
                      {t('barber.barber_name')}
                    </label>
                    <input
                      type='text'
                      value={barber}
                      onChange={(e) => setBarber(e.target.value)}
                      placeholder={t('barber.barber_placeholder')}
                      className='px-3 py-2 text-sm border rounded-lg'
                    />
                  </div>
                </div>
                <div>
                  <label className='block text-xs text-gray-500 mb-1'>
                    {t('barber.next_appointment')}
                  </label>
                  <input
                    type='date'
                    value={nextAppointment}
                    onChange={(e) => setNextAppointment(e.target.value)}
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  />
                </div>
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
                  onClick={saveVisit}
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
