import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface CloudConfig {
  enabled: boolean;
  syncInterval: number;
  lastSync: string;
}

export default function CloudBackup() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';
  const [config, setConfig] = useState<CloudConfig>(() => {
    const saved = localStorage.getItem('omni_cloud_config');
    if (saved) return JSON.parse(saved);
    return { enabled: false, syncInterval: 60, lastSync: '' };
  });
  const [syncStatus, setSyncStatus] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const saveConfig = (newConfig: CloudConfig) => {
    setConfig(newConfig);
    localStorage.setItem('omni_cloud_config', JSON.stringify(newConfig));
  };

  const performSync = async () => {
    setIsSyncing(true);
    setSyncStatus(t('cloud.syncing'));

    // Simulate sync delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Collect all data
    const allData: Record<string, any> = {};
    const keys = [
      'omni_glucose',
      'omni_bp',
      'omni_water',
      'omni_meals',
      'omni_sleep',
      'omni_activity',
      'omni_habits',
      'omni_dental',
      'omni_weight',
      'omni_vision_prescriptions',
      'omni_vision_exams',
      'omni_hearing_tests',
      'omni_tinnitus',
      'omni_noise_exposure',
      'omni_skin_wounds',
      'omni_skin_daily',
      'omni_cycles',
      'omni_sexual',
      'omni_urination',
      'omni_uti',
      'omni_nails',
      'omni_fungal',
      'omni_liver',
      'omni_intestines',
      'omni_pills',
      'omni_pill_logs',
      'omni_appointments',
      'omni_foot_diary',
      'omni_lab_results',
      'omni_voice_commands',
      'omni_insulin_sites',
      'omni_meditation_sessions',
      'omni_readings',
      'omni_writings',
      'omni_fun_activities',
      'omni_social_interactions',
      'omni_hair',
      'omni_bone_cracking',
      'omni_caffeine',
      'omni_salt_sugar',
      'omni_forgetfulness',
      'omni_barbershop',
      'omni_hand_gesture',
      'omni_hygiene',
      'omni_settings',
      'omni_user_height',
    ];

    keys.forEach((key) => {
      const data = localStorage.getItem(key);
      if (data) allData[key] = JSON.parse(data);
    });

    // Save to localStorage as backup
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      data: allData,
    };
    localStorage.setItem('omni_cloud_last_backup', JSON.stringify(backup));

    const newConfig = { ...config, lastSync: new Date().toISOString() };
    saveConfig(newConfig);

    setSyncStatus(t('cloud.sync_success'));
    setIsSyncing(false);
    setTimeout(() => setSyncStatus(''), 3000);
  };

  const handleExport = () => {
    const allData: Record<string, any> = {};
    const keys = [
      'omni_glucose',
      'omni_bp',
      'omni_water',
      'omni_meals',
      'omni_sleep',
      'omni_activity',
      'omni_habits',
      'omni_dental',
      'omni_weight',
      'omni_vision_prescriptions',
      'omni_vision_exams',
      'omni_hearing_tests',
      'omni_tinnitus',
      'omni_noise_exposure',
      'omni_skin_wounds',
      'omni_skin_daily',
      'omni_cycles',
      'omni_sexual',
      'omni_urination',
      'omni_uti',
      'omni_nails',
      'omni_fungal',
      'omni_liver',
      'omni_intestines',
      'omni_pills',
      'omni_pill_logs',
      'omni_appointments',
      'omni_foot_diary',
      'omni_lab_results',
      'omni_voice_commands',
      'omni_insulin_sites',
      'omni_meditation_sessions',
      'omni_readings',
      'omni_writings',
      'omni_fun_activities',
      'omni_social_interactions',
      'omni_hair',
      'omni_bone_cracking',
      'omni_caffeine',
      'omni_salt_sugar',
      'omni_forgetfulness',
      'omni_barbershop',
      'omni_hand_gesture',
      'omni_hygiene',
      'omni_settings',
      'omni_user_height',
    ];

    keys.forEach((key) => {
      const data = localStorage.getItem(key);
      if (data) allData[key] = JSON.parse(data);
    });

    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      data: allData,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omni_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target?.result as string);
        if (backup.data) {
          Object.entries(backup.data).forEach(([key, value]) => {
            localStorage.setItem(key, JSON.stringify(value));
          });
          alert(t('cloud.import_success'));
          window.location.reload();
        } else {
          alert(t('cloud.import_error'));
        }
      } catch (error) {
        alert(t('cloud.import_error'));
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className='space-y-6' dir={isRTL ? 'rtl' : 'ltr'}>
      <div className='flex justify-between items-center'>
        <h2 className='text-xl font-semibold text-gray-800 dark:text-gray-200'>
          <i className='fas fa-cloud-upload-alt mr-2 text-primary-500'></i>{' '}
          {t('cloud.title')}
        </h2>
      </div>

      <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border'>
        <h3 className='font-medium text-gray-800 dark:text-gray-200 mb-4'>
          <i className='fas fa-cloud-upload-alt mr-2 text-primary-500'></i>{' '}
          {t('cloud.settings_title')}
        </h3>

        <label className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer mb-3'>
          <span>{t('cloud.enable_sync')}</span>
          <input
            type='checkbox'
            checked={config.enabled}
            onChange={(e) =>
              saveConfig({ ...config, enabled: e.target.checked })
            }
            className='w-5 h-5'
          />
        </label>

        <div className='mb-3'>
          <label className='block text-xs text-gray-500 mb-1'>
            {t('cloud.sync_frequency')}
          </label>
          <div className='flex gap-3'>
            <select
              value={config.syncInterval}
              onChange={(e) =>
                saveConfig({
                  ...config,
                  syncInterval: parseInt(e.target.value),
                })
              }
              className='flex-1 px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800'
              disabled={!config.enabled}
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

        <button
          onClick={performSync}
          disabled={isSyncing}
          className='w-full py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50 flex items-center justify-center gap-2'
        >
          {isSyncing ? (
            <>
              <i className='fas fa-spinner fa-pulse'></i> {t('cloud.syncing')}
            </>
          ) : (
            <>
              <i className='fas fa-sync-alt'></i> {t('cloud.sync_now')}
            </>
          )}
        </button>

        {config.lastSync && (
          <p className='text-xs text-gray-500 mt-2'>
            <i className='far fa-clock mr-1'></i> {t('cloud.last_sync')}:{' '}
            {new Date(config.lastSync).toLocaleString()}
          </p>
        )}
        {syncStatus && (
          <p
            className={`text-xs mt-2 ${syncStatus.includes('success') ? 'text-green-600' : 'text-red-600'}`}
          >
            {syncStatus}
          </p>
        )}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border'>
          <h3 className='font-medium text-gray-800 dark:text-gray-200 mb-3'>
            <i className='fas fa-download mr-2 text-blue-500'></i>{' '}
            {t('cloud.export')}
          </h3>
          <p className='text-sm text-gray-500 mb-3'>{t('cloud.export_desc')}</p>
          <button
            onClick={handleExport}
            className='w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2'
          >
            <i className='fas fa-download'></i> {t('cloud.download')}
          </button>
        </div>

        <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border'>
          <h3 className='font-medium text-gray-800 dark:text-gray-200 mb-3'>
            <i className='fas fa-upload mr-2 text-green-500'></i>{' '}
            {t('cloud.import')}
          </h3>
          <p className='text-sm text-gray-500 mb-3'>{t('cloud.import_desc')}</p>
          <input
            type='file'
            accept='.json'
            onChange={(e) => e.target.files && handleImport(e.target.files[0])}
            className='w-full text-sm file:mr-2 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200'
          />
        </div>
      </div>

      <div className='bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border'>
        <div className='flex gap-3'>
          <i className='fas fa-shield-alt text-primary-500 text-lg mt-0.5'></i>
          <div>
            <h4 className='font-medium text-sm text-gray-800 dark:text-gray-200'>
              {t('cloud.data_safe')}
            </h4>
            <p className='text-xs text-gray-500 mt-1'>
              {t('cloud.data_safe_desc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
