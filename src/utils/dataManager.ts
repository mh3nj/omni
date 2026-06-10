// Data structure for all tracker data
export interface OmniData {
  glucose: any[];
  bloodPressure: any[];
  water: any[];
  food: any[];
  sleep: any[];
  activity: any[];
  habits: any[];
  dental: any[];
  weight: any[];
  vision: any[];
  visionExams: any[];
  hearingTests: any[];
  hearingTinnitus: any[];
  hearingNoise: any[];
  skinWounds: any[];
  skinDaily: any[];
  reproductiveCycles: any[];
  reproductiveSexual: any[];
  bladderUrination: any[];
  bladderUTI: any[];
  nails: any[];
  nailsFungal: any[];
  liver: any[];
  intestines: any[];
  customHabits: any[];
  userHeight: string;
  lastExport: string;
  version: string;
}

export const STORAGE_KEYS = {
  GLUCOSE: 'omni_glucose',
  BLOOD_PRESSURE: 'omni_bp',
  WATER: 'omni_water',
  FOOD: 'omni_meals',
  SLEEP: 'omni_sleep',
  ACTIVITY: 'omni_activity',
  HABITS: 'omni_habits',
  DENTAL: 'omni_dental',
  WEIGHT: 'omni_weight',
  VISION: 'omni_vision_prescriptions',
  VISION_EXAMS: 'omni_vision_exams',
  HEARING_TESTS: 'omni_hearing_tests',
  HEARING_TINNITUS: 'omni_tinnitus',
  HEARING_NOISE: 'omni_noise_exposure',
  SKIN_WOUNDS: 'omni_skin_wounds',
  SKIN_DAILY: 'omni_skin_daily',
  REPRODUCTIVE_CYCLES: 'omni_cycles',
  REPRODUCTIVE_SEXUAL: 'omni_sexual',
  BLADDER_URINATION: 'omni_urination',
  BLADDER_UTI: 'omni_uti',
  NAILS: 'omni_nails',
  NAILS_FUNGAL: 'omni_fungal',
  LIVER: 'omni_liver',
  INTESTINES: 'omni_intestines',
  CUSTOM_HABITS: 'omni_custom_habits',
  USER_HEIGHT: 'omni_user_height',
  USER_SETTINGS: 'omni_settings',
};

export const TRACKER_NAMES = {
  glucose: 'trackers.glucose',
  bloodPressure: 'trackers.blood_pressure',
  water: 'trackers.water',
  food: 'trackers.food',
  sleep: 'trackers.sleep',
  activity: 'trackers.activity',
  habits: 'trackers.habits',
  dental: 'trackers.dental',
  weight: 'trackers.weight',
  vision: 'trackers.vision',
  hearing: 'trackers.hearing',
  skin: 'trackers.skin',
  reproductive: 'trackers.reproductive',
  bladder: 'trackers.bladder',
  nails: 'trackers.nails',
  liver: 'trackers.liver',
  intestines: 'trackers.intestines',
};

// Export all data to JSON
export const exportAllData = (_selectedTrackers?: string[]): OmniData => {
  const data: OmniData = {
    glucose: JSON.parse(localStorage.getItem(STORAGE_KEYS.GLUCOSE) || '[]'),
    bloodPressure: JSON.parse(
      localStorage.getItem(STORAGE_KEYS.BLOOD_PRESSURE) || '[]',
    ),
    water: JSON.parse(localStorage.getItem(STORAGE_KEYS.WATER) || '[]'),
    food: JSON.parse(localStorage.getItem(STORAGE_KEYS.FOOD) || '[]'),
    sleep: JSON.parse(localStorage.getItem(STORAGE_KEYS.SLEEP) || '[]'),
    activity: JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITY) || '[]'),
    habits: JSON.parse(localStorage.getItem(STORAGE_KEYS.HABITS) || '[]'),
    dental: JSON.parse(localStorage.getItem(STORAGE_KEYS.DENTAL) || '[]'),
    weight: JSON.parse(localStorage.getItem(STORAGE_KEYS.WEIGHT) || '[]'),
    vision: JSON.parse(localStorage.getItem(STORAGE_KEYS.VISION) || '[]'),
    visionExams: JSON.parse(
      localStorage.getItem(STORAGE_KEYS.VISION_EXAMS) || '[]',
    ),
    hearingTests: JSON.parse(
      localStorage.getItem(STORAGE_KEYS.HEARING_TESTS) || '[]',
    ),
    hearingTinnitus: JSON.parse(
      localStorage.getItem(STORAGE_KEYS.HEARING_TINNITUS) || '[]',
    ),
    hearingNoise: JSON.parse(
      localStorage.getItem(STORAGE_KEYS.HEARING_NOISE) || '[]',
    ),
    skinWounds: JSON.parse(
      localStorage.getItem(STORAGE_KEYS.SKIN_WOUNDS) || '[]',
    ),
    skinDaily: JSON.parse(
      localStorage.getItem(STORAGE_KEYS.SKIN_DAILY) || '[]',
    ),
    reproductiveCycles: JSON.parse(
      localStorage.getItem(STORAGE_KEYS.REPRODUCTIVE_CYCLES) || '[]',
    ),
    reproductiveSexual: JSON.parse(
      localStorage.getItem(STORAGE_KEYS.REPRODUCTIVE_SEXUAL) || '[]',
    ),
    bladderUrination: JSON.parse(
      localStorage.getItem(STORAGE_KEYS.BLADDER_URINATION) || '[]',
    ),
    bladderUTI: JSON.parse(
      localStorage.getItem(STORAGE_KEYS.BLADDER_UTI) || '[]',
    ),
    nails: JSON.parse(localStorage.getItem(STORAGE_KEYS.NAILS) || '[]'),
    nailsFungal: JSON.parse(
      localStorage.getItem(STORAGE_KEYS.NAILS_FUNGAL) || '[]',
    ),
    liver: JSON.parse(localStorage.getItem(STORAGE_KEYS.LIVER) || '[]'),
    intestines: JSON.parse(
      localStorage.getItem(STORAGE_KEYS.INTESTINES) || '[]',
    ),
    customHabits: JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CUSTOM_HABITS) || '[]',
    ),
    userHeight: localStorage.getItem(STORAGE_KEYS.USER_HEIGHT) || '',
    lastExport: new Date().toISOString(),
    version: '1.0.0',
  };
  return data;
};

// Import data from JSON file
export const importAllData = (data: OmniData) => {
  if (data.glucose)
    localStorage.setItem(STORAGE_KEYS.GLUCOSE, JSON.stringify(data.glucose));
  if (data.bloodPressure)
    localStorage.setItem(
      STORAGE_KEYS.BLOOD_PRESSURE,
      JSON.stringify(data.bloodPressure),
    );
  if (data.water)
    localStorage.setItem(STORAGE_KEYS.WATER, JSON.stringify(data.water));
  if (data.food)
    localStorage.setItem(STORAGE_KEYS.FOOD, JSON.stringify(data.food));
  if (data.sleep)
    localStorage.setItem(STORAGE_KEYS.SLEEP, JSON.stringify(data.sleep));
  if (data.activity)
    localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(data.activity));
  if (data.habits)
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(data.habits));
  if (data.dental)
    localStorage.setItem(STORAGE_KEYS.DENTAL, JSON.stringify(data.dental));
  if (data.weight)
    localStorage.setItem(STORAGE_KEYS.WEIGHT, JSON.stringify(data.weight));
  if (data.vision)
    localStorage.setItem(STORAGE_KEYS.VISION, JSON.stringify(data.vision));
  if (data.visionExams)
    localStorage.setItem(
      STORAGE_KEYS.VISION_EXAMS,
      JSON.stringify(data.visionExams),
    );
  if (data.hearingTests)
    localStorage.setItem(
      STORAGE_KEYS.HEARING_TESTS,
      JSON.stringify(data.hearingTests),
    );
  if (data.hearingTinnitus)
    localStorage.setItem(
      STORAGE_KEYS.HEARING_TINNITUS,
      JSON.stringify(data.hearingTinnitus),
    );
  if (data.hearingNoise)
    localStorage.setItem(
      STORAGE_KEYS.HEARING_NOISE,
      JSON.stringify(data.hearingNoise),
    );
  if (data.skinWounds)
    localStorage.setItem(
      STORAGE_KEYS.SKIN_WOUNDS,
      JSON.stringify(data.skinWounds),
    );
  if (data.skinDaily)
    localStorage.setItem(
      STORAGE_KEYS.SKIN_DAILY,
      JSON.stringify(data.skinDaily),
    );
  if (data.reproductiveCycles)
    localStorage.setItem(
      STORAGE_KEYS.REPRODUCTIVE_CYCLES,
      JSON.stringify(data.reproductiveCycles),
    );
  if (data.reproductiveSexual)
    localStorage.setItem(
      STORAGE_KEYS.REPRODUCTIVE_SEXUAL,
      JSON.stringify(data.reproductiveSexual),
    );
  if (data.bladderUrination)
    localStorage.setItem(
      STORAGE_KEYS.BLADDER_URINATION,
      JSON.stringify(data.bladderUrination),
    );
  if (data.bladderUTI)
    localStorage.setItem(
      STORAGE_KEYS.BLADDER_UTI,
      JSON.stringify(data.bladderUTI),
    );
  if (data.nails)
    localStorage.setItem(STORAGE_KEYS.NAILS, JSON.stringify(data.nails));
  if (data.nailsFungal)
    localStorage.setItem(
      STORAGE_KEYS.NAILS_FUNGAL,
      JSON.stringify(data.nailsFungal),
    );
  if (data.liver)
    localStorage.setItem(STORAGE_KEYS.LIVER, JSON.stringify(data.liver));
  if (data.intestines)
    localStorage.setItem(
      STORAGE_KEYS.INTESTINES,
      JSON.stringify(data.intestines),
    );
  if (data.customHabits)
    localStorage.setItem(
      STORAGE_KEYS.CUSTOM_HABITS,
      JSON.stringify(data.customHabits),
    );
  if (data.userHeight)
    localStorage.setItem(STORAGE_KEYS.USER_HEIGHT, data.userHeight);
};

// Clear all data
export const clearAllData = () => {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
};

// Get settings
export interface OmniSettings {
  language: string;
  theme: string;
  backupInterval: number;
  lastBackup: string;
  autoSave: boolean;
  selectedTrackersForExport: string[];
}

const DEFAULT_SETTINGS: OmniSettings = {
  language: 'en',
  theme: 'light',
  backupInterval: 0,
  lastBackup: '',
  autoSave: true,
  selectedTrackersForExport: Object.keys(TRACKER_NAMES),
};

export const getSettings = (): OmniSettings => {
  const saved = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
  if (saved) {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
  }
  return DEFAULT_SETTINGS;
};

export const saveSettings = (settings: OmniSettings) => {
  localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings));
};
