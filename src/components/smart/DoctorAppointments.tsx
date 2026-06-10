import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  notes: string;
  reminderSent: boolean;
}

export default function DoctorAppointments() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('omni_appointments');
    if (saved) setAppointments(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('omni_appointments', JSON.stringify(appointments));
  }, [appointments]);

  const saveAppointment = () => {
    if (!doctorName || !date) return;
    const appointment: Appointment = {
      id: editingId || Date.now().toString(),
      doctorName,
      specialty,
      date,
      time,
      location,
      notes,
      reminderSent: false,
    };
    if (editingId) {
      setAppointments(
        appointments.map((a) => (a.id === editingId ? appointment : a)),
      );
    } else {
      setAppointments([...appointments, appointment]);
    }
    resetForm();
  };

  const deleteAppointment = (id: string) => {
    if (confirm(t('doctor.delete_confirm'))) {
      setAppointments(appointments.filter((a) => a.id !== id));
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setDoctorName('');
    setSpecialty('');
    setDate('');
    setTime('');
    setLocation('');
    setNotes('');
  };

  const getUpcoming = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments
      .filter((a) => a.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const getPast = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments
      .filter((a) => a.date < today)
      .sort((a, b) => b.date.localeCompare(a.date));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className='space-y-6' dir={isRTL ? 'rtl' : 'ltr'}>
      <div className='flex justify-between items-center'>
        <h2 className='text-xl font-semibold text-gray-800 dark:text-gray-200'>
          <i className='fas fa-stethoscope mr-2 text-primary-500'></i>{' '}
          {t('doctor.title')}
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className='px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2'
        >
          <i className='fas fa-plus'></i> {t('doctor.add')}
        </button>
      </div>

      {/* Upcoming Appointments */}
      <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border'>
        <h3 className='font-medium text-gray-700 dark:text-gray-300 mb-4'>
          <i className='fas fa-calendar-day mr-2 text-primary-500'></i>{' '}
          {t('doctor.upcoming')} ({getUpcoming().length})
        </h3>
        {getUpcoming().length === 0 ? (
          <div className='text-center py-8 text-gray-500'>
            <i className='fas fa-calendar-check text-4xl mb-2 text-primary-500'></i>
            <p>{t('doctor.no_upcoming')}</p>
          </div>
        ) : (
          <div className='space-y-3'>
            {getUpcoming().map((app) => (
              <div
                key={app.id}
                className='flex justify-between items-start p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-all'
              >
                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-1'>
                    <i className='fas fa-user-md text-primary-500'></i>
                    <span className='font-medium text-gray-800 dark:text-gray-200'>
                      {app.doctorName}
                    </span>
                    {app.specialty && (
                      <span className='text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-400'>
                        {app.specialty}
                      </span>
                    )}
                  </div>
                  <div className='text-sm text-gray-500 space-y-1'>
                    <div>
                      <i className='far fa-calendar-alt mr-2 w-4'></i>{' '}
                      {formatDate(app.date)}
                    </div>
                    <div>
                      <i className='far fa-clock mr-2 w-4'></i>{' '}
                      {app.time || '—'}
                    </div>
                    {app.location && (
                      <div>
                        <i className='fas fa-map-marker-alt mr-2 w-4'></i>{' '}
                        {app.location}
                      </div>
                    )}
                    {app.notes && (
                      <div className='mt-2 text-xs text-gray-400 italic'>
                        <i className='fas fa-pen mr-1'></i> {app.notes}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteAppointment(app.id)}
                  className='text-gray-400 hover:text-red-500 transition p-2'
                >
                  <i className='fas fa-trash-alt'></i>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Appointments */}
      {getPast().length > 0 && (
        <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border'>
          <h3 className='font-medium text-gray-700 dark:text-gray-300 mb-4'>
            <i className='fas fa-history mr-2'></i> {t('doctor.past')} (
            {getPast().length})
          </h3>
          <div className='space-y-2'>
            {getPast()
              .slice(0, 10)
              .map((app) => (
                <div
                  key={app.id}
                  className='flex justify-between items-center py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition'
                >
                  <div className='flex items-center gap-3'>
                    <i className='fas fa-user-md text-gray-400 text-sm'></i>
                    <div>
                      <span className='text-sm text-gray-700 dark:text-gray-300'>
                        {app.doctorName}
                      </span>
                      <span className='text-xs text-gray-400 ml-2'>
                        {formatDate(app.date)}
                      </span>
                      {app.specialty && (
                        <span className='text-xs text-gray-400 ml-1'>
                          • {app.specialty}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteAppointment(app.id)}
                    className='text-gray-400 hover:text-red-500 transition'
                  >
                    <i className='fas fa-trash-alt text-xs'></i>
                  </button>
                </div>
              ))}
            {getPast().length > 10 && (
              <p className='text-xs text-gray-400 text-center mt-2'>
                +{getPast().length - 10} more
              </p>
            )}
          </div>
        </div>
      )}

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
                <i className='fas fa-stethoscope mr-2 text-primary-500'></i>
                {editingId ? t('doctor.edit') : t('doctor.add')}
              </h3>
              <div className='space-y-4'>
                <input
                  type='text'
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder={t('doctor.doctor_name')}
                  className='w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800'
                  autoFocus
                />
                <input
                  type='text'
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder={t('doctor.specialty')}
                  className='w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800'
                />
                <div className='grid grid-cols-2 gap-3'>
                  <input
                    type='date'
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className='px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800'
                  />
                  <input
                    type='time'
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className='px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800'
                  />
                </div>
                <input
                  type='text'
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t('doctor.location')}
                  className='w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800'
                />
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('doctor.notes')}
                  rows={2}
                  className='w-full px-3 py-2 text-sm border rounded-lg resize-none bg-white dark:bg-gray-800'
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
                  onClick={saveAppointment}
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
