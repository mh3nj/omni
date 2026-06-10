import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Notification {
  id: string;
  type: 'pill' | 'appointment' | 'alert' | 'reminder';
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionUrl?: string;
}

export default function NotificationCenter() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const loadNotifications = () => {
      const newNotifications: Notification[] = [];

      // Load pill reminders
      const pillData = JSON.parse(localStorage.getItem('omni_pills') || '[]');
      const today = new Date().toISOString().split('T')[0];
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      pillData.forEach((pill: any) => {
        if (pill.active && (!pill.endDate || pill.endDate >= today)) {
          pill.times.forEach((time: string) => {
            const [hour, minute] = time.split(':').map(Number);
            // Show notifications for upcoming pills (within next hour)
            const hourDiff = hour - currentHour;
            const minuteDiff = minute - currentMinute;
            const minutesUntil = hourDiff * 60 + minuteDiff;

            if (minutesUntil > 0 && minutesUntil <= 60) {
              newNotifications.push({
                id: `pill-${pill.id}-${time}`,
                type: 'pill',
                title: t('notifications.pill_reminder'),
                message: t('notifications.pill_message', {
                  name: pill.name,
                  dosage: pill.dosage,
                  time,
                }),
                time: `${today} ${time}`,
                read: false,
              });
            }
          });
        }
      });

      // Load appointment reminders
      const appointmentData = JSON.parse(
        localStorage.getItem('omni_appointments') || '[]',
      );
      appointmentData.forEach((apt: any) => {
        if (apt.date >= today) {
          const appointmentDate = new Date(apt.date);
          const daysUntil = Math.ceil(
            (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
          );
          if (daysUntil <= 3 && daysUntil >= 0) {
            newNotifications.push({
              id: `apt-${apt.id}`,
              type: 'appointment',
              title: t('notifications.appointment_reminder'),
              message: t('notifications.appointment_message', {
                doctor: apt.doctorName,
                specialty: apt.specialty,
                date: apt.date,
                time: apt.time,
              }),
              time: apt.date,
              read: false,
            });
          }
        }
      });

      setNotifications(newNotifications);
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [t]);

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pill':
        return 'fas fa-pills';
      case 'appointment':
        return 'fas fa-stethoscope';
      case 'alert':
        return 'fas fa-exclamation-triangle';
      default:
        return 'fas fa-bell';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pill':
        return 'bg-blue-500';
      case 'appointment':
        return 'bg-purple-500';
      case 'alert':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className='space-y-6' dir={isRTL ? 'rtl' : 'ltr'}>
      <div className='flex justify-between items-center'>
        <h2 className='text-xl font-semibold text-gray-800 dark:text-gray-200'>
          <i className='fas fa-bell mr-2 text-primary-500'></i>{' '}
          {t('notifications.title')}
          {unreadCount > 0 && (
            <span className='ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full'>
              {unreadCount}
            </span>
          )}
        </h2>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className='px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 transition'
          >
            <i className='fas fa-check-double mr-1'></i>{' '}
            {t('notifications.mark_all_read')}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className='bg-white dark:bg-gray-900 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-800'>
          <div className='w-20 h-20 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4'>
            <i className='fas fa-bell-slash text-3xl text-gray-400'></i>
          </div>
          <h3 className='text-lg font-medium text-gray-800 dark:text-gray-200'>
            {t('notifications.no_notifications')}
          </h3>
          <p className='text-gray-500 mt-1'>
            {t('notifications.all_caught_up')}
          </p>
        </div>
      ) : (
        <div className='space-y-3'>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm border transition-all ${
                notification.read
                  ? 'border-gray-200 dark:border-gray-800 opacity-60'
                  : 'border-l-4 border-l-primary-500 border-gray-200 dark:border-gray-800'
              }`}
            >
              <div className='p-4'>
                <div className='flex gap-3'>
                  <div
                    className={`w-10 h-10 rounded-full ${getTypeColor(notification.type)} flex items-center justify-center text-white shadow-sm`}
                  >
                    <i className={getTypeIcon(notification.type)}></i>
                  </div>
                  <div className='flex-1'>
                    <div className='flex items-start justify-between'>
                      <div>
                        <h3 className='font-medium text-gray-800 dark:text-gray-200'>
                          {notification.title}
                        </h3>
                        <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                          {notification.message}
                        </p>
                        <p className='text-xs text-gray-400 mt-2 flex items-center gap-1'>
                          <i className='far fa-clock'></i> {notification.time}
                        </p>
                      </div>
                      <div className='flex gap-1'>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className='p-1.5 text-gray-400 hover:text-primary-500 transition'
                            title='Mark as read'
                          >
                            <i className='fas fa-check'></i>
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className='p-1.5 text-gray-400 hover:text-red-500 transition'
                          title='Delete'
                        >
                          <i className='fas fa-trash-alt'></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
