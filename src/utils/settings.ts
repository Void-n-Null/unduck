//Credit to https://github.com/Desyncfy for his contribution to using localStorage for settings.

// Settings interface that defines all available user preferences
export interface UserSettings {
  defaultBang?: string;  // The user's preferred default bang (e.g., "g" for Google)
  // Add more settings here as needed
}

// Default settings values
export const DEFAULT_SETTINGS: UserSettings = {
  defaultBang: undefined,
};

// Settings key in local storage
const SETTINGS_STORAGE_KEY = 'rebang_settings';

/**
 * Saves user settings to local storage
 * @param settings The settings object to save
 * @param expirationDays Number of days until the settings expire (default: 365)
 */
export function saveSettings(settings: UserSettings, expirationDays = 365): void {
  try {
    // Add expiration timestamp if specified
    const expirationTimestamp = expirationDays > 0 
      ? Date.now() + (expirationDays * 24 * 60 * 60 * 1000)
      : null;
    
    const dataToStore = {
      settings,
      expires: expirationTimestamp
    };
    
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(dataToStore));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

/**
 * Loads user settings from local storage
 * @returns The user settings object, or default settings if not found
 */
export function loadSettings(): UserSettings {
  try {
    const storedData = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      
      // Check if settings have expired (if expiration is set)
      if (!parsedData.expires || parsedData.expires > Date.now()) {
        return { ...DEFAULT_SETTINGS, ...parsedData.settings };
      } else {
        // Clear expired settings
        localStorage.removeItem(SETTINGS_STORAGE_KEY);
      }
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  
  return { ...DEFAULT_SETTINGS };
}

/**
 * Updates a specific setting value and saves to local storage
 * @param key The setting key to update
 * @param value The new value
 */
export function updateSetting<K extends keyof UserSettings>(
  key: K, 
  value: UserSettings[K]
): void {
  const currentSettings = loadSettings();
  currentSettings[key] = value;
  saveSettings(currentSettings);
} 