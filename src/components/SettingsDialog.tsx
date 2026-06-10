import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { OmniSettings } from '../utils/dataManager';
import {
  clearAllData,
  exportAllData,
  getSettings,
  importAllData,
  saveSettings,
  TRACKER_NAMES,
} from '../utils/dataManager';
import {
  getCloudConfig,
  saveCloudConfig,
  startAutoSync,
  stopAutoSync,
  uploadToCloud,
} from '../utils/googleCloudSync';
import { exportToPDF, exportToTXT } from '../utils/pdfExport';

interface SettingsDialogProps {
  onClose: () => void;
  onLanguageChange: () => void;
  onThemeChange: (theme: string) => void;
  currentTheme: string;
}

export default function SettingsDialog({
  onClose,
  onLanguageChange,
  onThemeChange,
  currentTheme,
}: SettingsDialogProps) {
  const { t, i18n } = useTranslation();
  const [settings] = useState<OmniSettings>(getSettings());
  const [backupInterval, setBackupInterval] = useState(
    settings.backupInterval.toString(),
  );
  const [selectedTrackers, setSelectedTrackers] = useState<string[]>(
    settings.selectedTrackersForExport,
  );
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [cloudConfig, setCloudConfig] = useState(getCloudConfig());
  const [syncStatus, setSyncStatus] = useState('');
  const [userName, setUserName] = useState('');
  const [nameSavedMessage, setNameSavedMessage] = useState('');
  const [localTheme, setLocalTheme] = useState(currentTheme);
  const [localLanguage, setLocalLanguage] = useState(settings.language);

  useEffect(() => {
    const savedName = localStorage.getItem('omni_user_name');
    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  useEffect(() => {
    if (cloudConfig.enabled) {
      startAutoSync();
    }
    return () => stopAutoSync();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (settings.autoSave && settings.backupInterval > 0) {
      interval = setInterval(
        () => {
          const data = exportAllData();
          const backup = JSON.stringify(data);
          localStorage.setItem('omni_auto_backup', backup);
          saveSettings({ ...settings, lastBackup: new Date().toISOString() });
        },
        settings.backupInterval * 60 * 1000,
      );
    }
    return () => clearInterval(interval);
  }, [settings.autoSave, settings.backupInterval]);

  const handleSaveSettings = () => {
    // Save settings to localStorage
    const newSettings = {
      ...settings,
      language: localLanguage,
      theme: localTheme,
      backupInterval: parseInt(backupInterval) || 0,
      selectedTrackersForExport: selectedTrackers,
    };
    saveSettings(newSettings);
    
    // Apply theme
    onThemeChange(localTheme);
    
    // Apply language if changed
    if (localLanguage !== i18n.language) {
      i18n.changeLanguage(localLanguage);
      document.documentElement.lang = localLanguage;
      if (localLanguage === 'fa' || localLanguage === 'ar') {
        document.documentElement.dir = 'rtl';
      } else {
        document.documentElement.dir = 'ltr';
      }
      onLanguageChange();
    }
    
    onClose();
  };

  const handleExportJSON = () => {
    const data = exportAllData(selectedTrackers);
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omni_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const data = exportAllData();
    exportToPDF(
      data,
      selectedTrackers,
      dateRange.from || dateRange.to ? dateRange : undefined,
    );
  };

  const handleExportTXT = () => {
    const data = exportAllData();
    exportToTXT(data, selectedTrackers);
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        importAllData(data);
        alert(t('settings.import_success'));
        window.location.reload();
      } catch (error) {
        alert(t('settings.import_error'));
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    if (confirm(t('settings.clear_confirm'))) {
      clearAllData();
      alert(t('settings.clear_success'));
      window.location.reload();
    }
  };

  const handleCloudSync = async () => {
    setSyncStatus(t('settings.syncing'));
    const result = await uploadToCloud();
    setSyncStatus(result.message);
    setTimeout(() => setSyncStatus(''), 3000);
  };

  const handleSaveUserName = () => {
    if (userName.trim()) {
      localStorage.setItem('omni_user_name', userName.trim());
      setNameSavedMessage(t('settings.user_name_saved'));
      setTimeout(() => setNameSavedMessage(''), 3000);
    }
  };

  const toggleTracker = (trackerId: string) => {
    if (selectedTrackers.includes(trackerId)) {
      setSelectedTrackers(selectedTrackers.filter((t) => t !== trackerId));
    } else {
      setSelectedTrackers([...selectedTrackers, trackerId]);
    }
  };

  const selectAllTrackers = () => {
    setSelectedTrackers(Object.keys(TRACKER_NAMES));
  };

  const deselectAllTrackers = () => {
    setSelectedTrackers([]);
  };

  return (
    <div
      className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto'
      onClick={onClose}
    >
      <div
        className='bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-xl font-semibold text-gray-800 dark:text-gray-200'>
            <i className='fas fa-cog mr-2 text-primary-500'></i>
            {t('settings.title')}
          </h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          >
            <i className='fas fa-times'></i>
          </button>
        </div>

        {/* User Name Section */}
        <div className='mb-6 border-b border-gray-200 dark:border-gray-800 pb-4'>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
            <i className='fas fa-user mr-2 text-primary-500'></i>
            {t('settings.user_name')}
          </label>
          <div className='flex gap-3'>
            <input
              type='text'
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder={t('settings.user_name_placeholder')}
              className='flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500'
            />
            <button
              onClick={handleSaveUserName}
              className='px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition'
            >
              <i className='fas fa-save mr-1'></i> {t('common.save')}
            </button>
          </div>
          {nameSavedMessage && (
            <p className='text-xs text-green-600 dark:text-green-400 mt-1'>
              <i className='fas fa-check-circle mr-1'></i> {nameSavedMessage}
            </p>
          )}
          <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
            <i className='fas fa-info-circle mr-1'></i> {t('settings.user_name_note')}
          </p>
        </div>

        {/* Language */}
        <div className='mb-6'>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
            <i className='fas fa-globe mr-2 text-primary-500'></i>
            {t('settings.language')}
          </label>
          <select
            value={localLanguage}
            onChange={(e) => setLocalLanguage(e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500'
          >
            <option value='en'>{t('languages.en')}</option>
            <option value='fa'>{t('languages.fa')}</option>
            <option value='de'>{t('languages.de')}</option>
            <option value='tr'>{t('languages.tr')}</option>
            <option value='ar'>{t('languages.ar')}</option>
          </select>
        </div>

        {/* Theme */}
        <div className='mb-6'>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
            <i className='fas fa-palette mr-2 text-primary-500'></i>
            {t('settings.theme')}
          </label>
          <div className='flex gap-2'>
            <button
              onClick={() => setLocalTheme('light')}
              className={`flex-1 py-2 rounded-lg border transition ${
                localTheme === 'light'
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <i className='fas fa-sun mr-2'></i>
              {t('settings.light')}
            </button>
            <button
              onClick={() => setLocalTheme('dark')}
              className={`flex-1 py-2 rounded-lg border transition ${
                localTheme === 'dark'
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <i className='fas fa-moon mr-2'></i>
              {t('settings.dark')}
            </button>
          </div>
        </div>

        {/* Auto Backup */}
        <div className='mb-6'>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
            <i className='fas fa-clock mr-2 text-primary-500'></i>
            {t('settings.auto_backup_interval')}
          </label>
          <div className='flex gap-3'>
            <input
              type='number'
              value={backupInterval}
              onChange={(e) => setBackupInterval(e.target.value)}
              min='0'
              step='5'
              className='flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500'
              placeholder={t('settings.minutes_placeholder')}
            />
            <span className='text-sm text-gray-500 dark:text-gray-400'>{t('settings.minutes')}</span>
          </div>
          <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
            <i className='fas fa-info-circle mr-1'></i> {t('settings.auto_backup_note')}
          </p>
        </div>

        {/* Google Cloud Sync */}
        <div className='mb-6 border-t border-gray-200 dark:border-gray-800 pt-4'>
          <h3 className='font-medium text-gray-800 dark:text-gray-200 mb-3'>
            <i className='fas fa-cloud-upload-alt mr-2 text-primary-500'></i>
            ☁️ {t('settings.cloud_sync')}
          </h3>

          <label className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer mb-3'>
            <span className='text-gray-700 dark:text-gray-300'>{t('settings.enable_cloud_sync')}</span>
            <input
              type='checkbox'
              checked={cloudConfig.enabled}
              onChange={(e) => {
                const newConfig = { ...cloudConfig, enabled: e.target.checked };
                setCloudConfig(newConfig);
                saveCloudConfig(newConfig);
                if (e.target.checked) {
                  startAutoSync();
                } else {
                  stopAutoSync();
                }
              }}
              className='w-5 h-5 rounded'
            />
          </label>

          <div className='mb-3'>
            <label className='block text-xs text-gray-500 dark:text-gray-400 mb-1'>
              {t('settings.sync_interval')}
            </label>
            <div className='flex gap-3'>
              <input
                type='number'
                value={cloudConfig.syncInterval}
                onChange={(e) => {
                  const newConfig = {
                    ...cloudConfig,
                    syncInterval: parseInt(e.target.value) || 60,
                  };
                  setCloudConfig(newConfig);
                  saveCloudConfig(newConfig);
                  if (cloudConfig.enabled) {
                    stopAutoSync();
                    startAutoSync();
                  }
                }}
                min='15'
                step='15'
                className='flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500'
              />
              <span className='text-sm text-gray-500 dark:text-gray-400'>{t('settings.minutes')}</span>
            </div>
          </div>

          <div className='flex gap-3'>
            <button
              onClick={handleCloudSync}
              className='flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition flex items-center justify-center gap-2'
            >
              <i className='fas fa-cloud-upload-alt'></i> {t('settings.sync_now')}
            </button>
          </div>

          {cloudConfig.lastSync && (
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
              <i className='far fa-clock mr-1'></i> {t('settings.last_sync')}: {new Date(cloudConfig.lastSync).toLocaleString()}
            </p>
          )}
          {syncStatus && (
            <p
              className={`text-xs mt-2 ${syncStatus.includes('success') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
            >
              {syncStatus}
            </p>
          )}
        </div>

        {/* Export Settings */}
        <div className='mb-6 border-t border-gray-200 dark:border-gray-800 pt-4'>
          <h3 className='font-medium text-gray-800 dark:text-gray-200 mb-3'>
            <i className='fas fa-download mr-2 text-primary-500'></i>
            {t('settings.export_settings')}
          </h3>

          <div className='grid grid-cols-2 gap-3 mb-4'>
            <div>
              <label className='block text-xs text-gray-500 dark:text-gray-400 mb-1'>
                {t('settings.from_date')}
              </label>
              <input
                type='date'
                value={dateRange.from}
                onChange={(e) =>
                  setDateRange({ ...dateRange, from: e.target.value })
                }
                className='w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500'
              />
            </div>
            <div>
              <label className='block text-xs text-gray-500 dark:text-gray-400 mb-1'>
                {t('settings.to_date')}
              </label>
              <input
                type='date'
                value={dateRange.to}
                onChange={(e) =>
                  setDateRange({ ...dateRange, to: e.target.value })
                }
                className='w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500'
              />
            </div>
          </div>

          <div className='mb-3 flex justify-between'>
            <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
              {t('settings.select_trackers')}
            </span>
            <div className='flex gap-2'>
              <button
                onClick={selectAllTrackers}
                className='text-xs text-blue-600 dark:text-blue-400 hover:underline'
              >
                {t('settings.select_all')}
              </button>
              <button
                onClick={deselectAllTrackers}
                className='text-xs text-red-600 dark:text-red-400 hover:underline'
              >
                {t('settings.deselect_all')}
              </button>
            </div>
          </div>
          <div className='grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-4 bg-gray-50 dark:bg-gray-800/30'>
            {Object.entries(TRACKER_NAMES).map(([id, nameKey]) => (
              <label key={id} className='flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300'>
                <input
                  type='checkbox'
                  checked={selectedTrackers.includes(id)}
                  onChange={() => toggleTracker(id)}
                  className='w-4 h-4 rounded'
                />
                <span>{t(nameKey)}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Export Buttons */}
        <div className='mb-6'>
          <h3 className='font-medium text-gray-800 dark:text-gray-200 mb-3'>
            <i className='fas fa-file-export mr-2 text-primary-500'></i>
            {t('settings.export_data')}
          </h3>
          <div className='flex flex-wrap gap-3'>
            <button
              onClick={handleExportJSON}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2'
            >
              <i className='fab fa-js'></i> {t('settings.export_json')}
            </button>
            <button
              onClick={handleExportPDF}
              className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2'
            >
              <i className='fas fa-file-pdf'></i> {t('settings.export_pdf')}
            </button>
            <button
              onClick={handleExportTXT}
              className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2'
            >
              <i className='fas fa-file-alt'></i> {t('settings.export_txt')}
            </button>
          </div>
        </div>

        {/* Import */}
        <div className='mb-6'>
          <h3 className='font-medium text-gray-800 dark:text-gray-200 mb-3'>
            <i className='fas fa-file-import mr-2 text-primary-500'></i>
            {t('settings.import_data')}
          </h3>
          <input
            type='file'
            accept='.json'
            onChange={(e) => e.target.files && handleImport(e.target.files[0])}
            className='w-full text-sm text-gray-500 dark:text-gray-400 file:mr-2 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-gray-800 dark:file:text-gray-300'
          />
          <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
            <i className='fas fa-exclamation-triangle text-yellow-500 mr-1'></i>
            {t('settings.import_note')}
          </p>
        </div>

        {/* Danger Zone */}
        <div className='mb-6 border-t border-red-200 dark:border-red-800 pt-4'>
          <h3 className='font-medium text-red-600 dark:text-red-400 mb-3'>
            <i className='fas fa-exclamation-triangle mr-2'></i>
            {t('settings.danger_zone')}
          </h3>
          <button
            onClick={handleClearAll}
            className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2'
          >
            <i className='fas fa-trash-alt'></i> {t('settings.clear_all_data')}
          </button>
          <p className='text-xs text-red-500 dark:text-red-400 mt-1'>
            <i className='fas fa-skull-crosswalk mr-1'></i>
            {t('settings.clear_note')}
          </p>
        </div>

        {settings.lastBackup && (
          <div className='text-xs text-gray-500 dark:text-gray-400 mb-4 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg'>
            <i className='fas fa-database mr-1'></i>
            {t('settings.last_auto_backup')}: {new Date(settings.lastBackup).toLocaleString()}
          </div>
        )}

        <div className='flex gap-3 mt-4'>
          <button
            onClick={handleSaveSettings}
            className='flex-1 px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition'
          >
            <i className='fas fa-save mr-2'></i> {t('settings.save_settings')}
          </button>
          <button
            onClick={onClose}
            className='flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300'
          >
            <i className='fas fa-times mr-2'></i> {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}