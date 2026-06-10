import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { LocalBackup } from '../../utils/localBackup';
import {
  deleteLocalBackup,
  exportBackupToFile,
  getAllLocalBackups,
  getBackupStats,
  importBackupFromFile,
  restoreLocalBackup,
  saveLocalBackup,
  startAutoLocalBackup,
  stopAutoLocalBackup,
} from '../../utils/localBackup';

export default function LocalBackupManager() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [backups, setBackups] = useState<LocalBackup[]>([]);
  const [stats, setStats] = useState({
    count: 0,
    totalSize: '0',
    lastBackup: null as string | null,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [backupName, setBackupName] = useState('');
  const [message, setMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [autoSyncInterval, setAutoSyncInterval] = useState(60);

  const loadBackups = () => {
    setBackups(getAllLocalBackups());
    setStats(getBackupStats());
  };

  useEffect(() => {
    loadBackups();

    // Load auto-sync settings
    const savedAutoSync = localStorage.getItem('omni_auto_local_backup');
    if (savedAutoSync) {
      const config = JSON.parse(savedAutoSync);
      setAutoSyncEnabled(config.enabled);
      setAutoSyncInterval(config.interval);
      if (config.enabled) {
        startAutoLocalBackup(config.interval, () => {
          setMessage({
            text: t('backup.auto_backup_complete'),
            type: 'success',
          });
          loadBackups();
          setTimeout(() => setMessage(null), 3000);
        });
      }
    }
  }, [t]);

  const handleCreateBackup = () => {
    const name =
      backupName.trim() ||
      t('backup.default_name', { date: new Date().toLocaleDateString() });
    const backup = saveLocalBackup(name);
    if (backup) {
      setMessage({
        text: t('backup.create_success', { name }),
        type: 'success',
      });
      loadBackups();
      setShowCreateModal(false);
      setBackupName('');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleRestore = (backupId: string, backupName: string) => {
    if (confirm(t('backup.restore_confirm', { name: backupName }))) {
      const success = restoreLocalBackup(backupId);
      if (success) {
        setMessage({
          text: t('backup.restore_success', { name: backupName }),
          type: 'success',
        });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage({ text: t('backup.restore_failed'), type: 'error' });
      }
    }
  };

  const handleExport = (backupId: string, backupName: string) => {
    exportBackupToFile(backupId);
    setMessage({
      text: t('backup.export_success', { name: backupName }),
      type: 'success',
    });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDelete = (backupId: string, backupName: string) => {
    if (confirm(t('backup.delete_confirm', { name: backupName }))) {
      deleteLocalBackup(backupId);
      loadBackups();
      setMessage({
        text: t('backup.delete_success', { name: backupName }),
        type: 'success',
      });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleImport = (file: File) => {
    importBackupFromFile(file)
      .then(() => {
        loadBackups();
        setMessage({ text: t('backup.import_success'), type: 'success' });
        setTimeout(() => setMessage(null), 3000);
      })
      .catch((error) => {
        setMessage({
          text: t('backup.import_failed', { error: error.message }),
          type: 'error',
        });
      });
  };

  const handleAutoSyncToggle = () => {
    const newEnabled = !autoSyncEnabled;
    setAutoSyncEnabled(newEnabled);
    const config = { enabled: newEnabled, interval: autoSyncInterval };
    localStorage.setItem('omni_auto_local_backup', JSON.stringify(config));

    if (newEnabled) {
      startAutoLocalBackup(autoSyncInterval, () => {
        setMessage({ text: t('backup.auto_backup_complete'), type: 'success' });
        loadBackups();
        setTimeout(() => setMessage(null), 3000);
      });
    } else {
      stopAutoLocalBackup();
    }
  };

  const handleIntervalChange = (interval: number) => {
    setAutoSyncInterval(interval);
    const config = { enabled: autoSyncEnabled, interval };
    localStorage.setItem('omni_auto_local_backup', JSON.stringify(config));
    if (autoSyncEnabled) {
      stopAutoLocalBackup();
      startAutoLocalBackup(interval, () => {
        setMessage({ text: t('backup.auto_backup_complete'), type: 'success' });
        loadBackups();
        setTimeout(() => setMessage(null), 3000);
      });
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className='space-y-6' dir={isRTL ? 'rtl' : 'ltr'}>
      <div className='flex justify-between items-center'>
        <h2 className='text-xl font-semibold text-gray-800 dark:text-gray-200'>
          💾 {t('backup.local_title')}
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className='px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2'
        >
          <i className='fas fa-plus'></i> {t('backup.create_backup')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400'>
            {t('backup.total_backups')}
          </div>
          <div className='text-2xl font-light mt-1'>{stats.count}</div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400'>{t('backup.total_size')}</div>
          <div className='text-2xl font-light mt-1'>{stats.totalSize} KB</div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border'>
          <div className='text-xs text-gray-400'>{t('backup.last_backup')}</div>
          <div className='text-sm font-medium mt-1'>
            {stats.lastBackup
              ? formatDate(stats.lastBackup)
              : t('backup.never')}
          </div>
        </div>
      </div>

      {/* Auto-Sync Settings */}
      <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border'>
        <h3 className='font-medium text-gray-800 dark:text-gray-200 mb-4'>
          🤖 {t('backup.auto_backup')}
        </h3>

        <label className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer mb-3'>
          <span>{t('backup.enable_auto')}</span>
          <input
            type='checkbox'
            checked={autoSyncEnabled}
            onChange={handleAutoSyncToggle}
            className='w-5 h-5'
          />
        </label>

        <div className='mb-3'>
          <label className='block text-xs text-gray-500 mb-1'>
            {t('backup.interval')}
          </label>
          <div className='flex gap-3'>
            <select
              value={autoSyncInterval}
              onChange={(e) => handleIntervalChange(parseInt(e.target.value))}
              className='flex-1 px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800'
              disabled={!autoSyncEnabled}
            >
              <option value='15'>{t('backup.every_15')}</option>
              <option value='30'>{t('backup.every_30')}</option>
              <option value='60'>{t('backup.every_hour')}</option>
              <option value='120'>{t('backup.every_2h')}</option>
              <option value='360'>{t('backup.every_6h')}</option>
              <option value='720'>{t('backup.every_12h')}</option>
              <option value='1440'>{t('backup.daily')}</option>
            </select>
          </div>
        </div>
        <p className='text-xs text-gray-500'>{t('backup.auto_note')}</p>
      </div>

      {/* Import/Export */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border'>
          <h3 className='font-medium text-gray-800 dark:text-gray-200 mb-3'>
            📤 {t('backup.export')}
          </h3>
          <p className='text-sm text-gray-500 mb-3'>
            {t('backup.export_latest')}
          </p>
          <button
            onClick={() => {
              const backupsList = getAllLocalBackups();
              if (backupsList.length > 0) {
                exportBackupToFile(backupsList[0].id);
              } else {
                setMessage({
                  text: t('backup.no_backups_to_export'),
                  type: 'error',
                });
                setTimeout(() => setMessage(null), 3000);
              }
            }}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
          >
            <i className='fas fa-download mr-2'></i> {t('backup.export_latest')}
          </button>
        </div>

        <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border'>
          <h3 className='font-medium text-gray-800 dark:text-gray-200 mb-3'>
            📥 {t('backup.import')}
          </h3>
          <p className='text-sm text-gray-500 mb-3'>
            {t('backup.import_text')}
          </p>
          <input
            type='file'
            accept='.json'
            onChange={(e) => e.target.files && handleImport(e.target.files[0])}
            className='text-sm'
          />
        </div>
      </div>

      {/* Backup List */}
      <div className='bg-white dark:bg-gray-900 rounded-xl shadow-sm border overflow-hidden'>
        <div className='px-6 py-4 border-b'>
          <h3 className='font-medium text-gray-800 dark:text-gray-200'>
            📋 {t('backup.backup_history')}
          </h3>
        </div>
        <div className='divide-y'>
          {backups.length === 0 ? (
            <div className='px-6 py-8 text-center text-gray-500'>
              <i className='fas fa-database text-4xl mb-2 opacity-50'></i>
              <p>{t('backup.no_backups')}</p>
            </div>
          ) : (
            backups.map((backup) => (
              <div
                key={backup.id}
                className='px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition'
              >
                <div className='flex flex-wrap justify-between items-start gap-3'>
                  <div className='flex-1'>
                    <div className='font-medium text-gray-800 dark:text-gray-200'>
                      {backup.name}
                    </div>
                    <div className='text-sm text-gray-500 mt-1'>
                      {formatDate(backup.timestamp)} • {formatSize(backup.size)}
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => handleRestore(backup.id, backup.name)}
                      className='px-3 py-1 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 transition'
                      title={t('backup.restore')}
                    >
                      <i className='fas fa-undo-alt mr-1'></i>{' '}
                      {t('backup.restore')}
                    </button>
                    <button
                      onClick={() => handleExport(backup.id, backup.name)}
                      className='px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 transition'
                      title={t('backup.export_action')}
                    >
                      <i className='fas fa-download mr-1'></i>{' '}
                      {t('backup.export_action')}
                    </button>
                    <button
                      onClick={() => handleDelete(backup.id, backup.name)}
                      className='px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 transition'
                      title={t('backup.delete')}
                    >
                      <i className='fas fa-trash-alt'></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Message Toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
              message.type === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Backup Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className='bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md'
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className='font-medium text-gray-800 dark:text-gray-200 mb-4'>
                {t('backup.create_backup')}
              </h3>
              <input
                type='text'
                value={backupName}
                onChange={(e) => setBackupName(e.target.value)}
                placeholder={t('backup.backup_name')}
                className='w-full px-3 py-2 text-sm border rounded-lg mb-4 bg-white dark:bg-gray-800'
                autoFocus
              />
              <div className='flex gap-3'>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className='flex-1 px-4 py-2 border rounded-lg text-sm'
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleCreateBackup}
                  className='flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm'
                >
                  {t('backup.create')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
