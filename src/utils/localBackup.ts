// Enhanced local backup system - works completely offline (Pure TypeScript, no JSX)

export interface LocalBackup {
  id: string;
  name: string;
  timestamp: string;
  size: number;
  data: Record<string, any>;
}

const BACKUP_KEY = 'omni_backup_history';

// Get all saved backups
export const getAllLocalBackups = (): LocalBackup[] => {
  const saved = localStorage.getItem(BACKUP_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  return [];
};

// Save a new backup
export const saveLocalBackup = (name: string): LocalBackup | null => {
  // Collect all data
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
    'omni_custom_habits',
  ];

  const allData: Record<string, any> = {};
  keys.forEach((key) => {
    const data = localStorage.getItem(key);
    if (data) {
      allData[key] = JSON.parse(data);
    }
  });

  const backup: LocalBackup = {
    id: Date.now().toString(),
    name: name || `Backup_${new Date().toLocaleDateString()}`,
    timestamp: new Date().toISOString(),
    size: JSON.stringify(allData).length,
    data: allData,
  };

  const existingBackups = getAllLocalBackups();
  existingBackups.unshift(backup);
  // Keep only last 20 backups
  const trimmed = existingBackups.slice(0, 20);
  localStorage.setItem(BACKUP_KEY, JSON.stringify(trimmed));

  return backup;
};

// Restore from a specific backup
export const restoreLocalBackup = (backupId: string): boolean => {
  const backups = getAllLocalBackups();
  const backup = backups.find((b) => b.id === backupId);
  if (!backup) return false;

  Object.entries(backup.data).forEach(([key, value]) => {
    localStorage.setItem(key, JSON.stringify(value));
  });

  return true;
};

// Delete a backup
export const deleteLocalBackup = (backupId: string): boolean => {
  const backups = getAllLocalBackups();
  const filtered = backups.filter((b) => b.id !== backupId);
  localStorage.setItem(BACKUP_KEY, JSON.stringify(filtered));
  return true;
};

// Export backup to file
export const exportBackupToFile = (backupId: string): boolean => {
  const backups = getAllLocalBackups();
  const backup = backups.find((b) => b.id === backupId);
  if (!backup) return false;

  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${backup.name}.json`;
  a.click();
  URL.revokeObjectURL(url);
  return true;
};

// Import backup from file
export const importBackupFromFile = (file: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target?.result as string);
        if (backup.data) {
          // Save as a new backup
          const newBackup: LocalBackup = {
            id: Date.now().toString(),
            name: `Imported_${backup.name || new Date().toLocaleDateString()}`,
            timestamp: new Date().toISOString(),
            size: JSON.stringify(backup.data).length,
            data: backup.data,
          };
          const existingBackups = getAllLocalBackups();
          existingBackups.unshift(newBackup);
          localStorage.setItem(
            BACKUP_KEY,
            JSON.stringify(existingBackups.slice(0, 20)),
          );
          resolve(true);
        } else {
          reject(new Error('Invalid backup file'));
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Schedule automatic backups
let autoBackupInterval: ReturnType<typeof setInterval> | null = null;

export const startAutoLocalBackup = (
  intervalMinutes: number,
  onBackup?: () => void,
) => {
  if (autoBackupInterval) clearInterval(autoBackupInterval);
  if (intervalMinutes > 0) {
    autoBackupInterval = setInterval(
      () => {
        const backup = saveLocalBackup(
          `Auto_${new Date().toLocaleDateString()}`,
        );
        if (backup && onBackup) onBackup();
      },
      intervalMinutes * 60 * 1000,
    );
  }
};

export const stopAutoLocalBackup = () => {
  if (autoBackupInterval) {
    clearInterval(autoBackupInterval);
    autoBackupInterval = null;
  }
};

// Get backup statistics
export const getBackupStats = () => {
  const backups = getAllLocalBackups();
  const totalSize = backups.reduce((sum, b) => sum + b.size, 0);
  return {
    count: backups.length,
    totalSize: (totalSize / 1024).toFixed(2),
    lastBackup: backups[0]?.timestamp || null,
  };
};
