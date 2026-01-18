const DB_NAME = 'VoiceCraftDB';
const DB_VERSION = 3; // Incremented to trigger onupgradeneeded for new stores
const SETTINGS_STORE = 'settings';
const HISTORY_STORE = 'history';
const PRESET_VOICES_STORE = 'presetVoices';

interface UserSettings {
  id: 'user_settings';
  ttsLanguage: string;
  ttsMode: string;
  seed: number;
  backendUrl: string;
  ttsSpeed: number;
  createdAt: number;
  updatedAt: number;
}

interface HistoryItem {
  id: string;
  text: string;
  audioBase64: string;
  duration: number;
  isPublished: boolean;
  language: string;
  mode: string;
  createdAt: number;
}

interface PresetVoiceData {
  id: string;
  language: string;
  promptText: string;
  audioBase64?: string;
  updatedAt: number;
}

const HISTORY_LIMIT = 50;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      // If version upgrade fails, try to delete and recreate
      const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
      deleteRequest.onsuccess = () => {
        // Retry open with new version
        const retryRequest = indexedDB.open(DB_NAME, DB_VERSION);
        retryRequest.onsuccess = () => resolve(retryRequest.result);
        retryRequest.onerror = () => reject(retryRequest.error);
      };
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };

    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create stores if they don't exist
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(HISTORY_STORE)) {
        const historyStore = db.createObjectStore(HISTORY_STORE, { keyPath: 'id' });
        historyStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      if (!db.objectStoreNames.contains(PRESET_VOICES_STORE)) {
        db.createObjectStore(PRESET_VOICES_STORE, { keyPath: 'id' });
      }
    };
  });
};

export const storage = {
  // ==================== Settings ====================

  async getSettings(): Promise<UserSettings | null> {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(SETTINGS_STORE, 'readonly');
        const store = transaction.objectStore(SETTINGS_STORE);
        const request = store.get('user_settings');

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result || null);
      });
    } catch {
      return null;
    }
  },

  async getSetting<K extends keyof UserSettings>(key: K): Promise<UserSettings[K] | null> {
    const settings = await this.getSettings();
    return settings?.[key] ?? null;
  },

  async saveSettings(partial: Partial<UserSettings>): Promise<void> {
    try {
      const existing = await this.getSettings();
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(SETTINGS_STORE, 'readwrite');
        const store = transaction.objectStore(SETTINGS_STORE);

        const data: UserSettings = {
          id: 'user_settings',
          ttsLanguage: existing?.ttsLanguage || 'zh',
          ttsMode: existing?.ttsMode || 'zero_shot',
          seed: existing?.seed || Math.floor(Math.random() * 999999),
          backendUrl: existing?.backendUrl || 'http://localhost:9880',
          ttsSpeed: existing?.ttsSpeed || 1.0,
          createdAt: existing?.createdAt || Date.now(),
          updatedAt: Date.now(),
          ...partial
        };

        const request = store.put(data);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  },

  async setSetting<K extends keyof UserSettings>(key: K, value: UserSettings[K]): Promise<void> {
    await this.saveSettings({ [key]: value });
  },

  // ==================== History ====================

  async getAllHistory(): Promise<HistoryItem[]> {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(HISTORY_STORE, 'readwrite');
        const store = transaction.objectStore(HISTORY_STORE);
        const index = store.index('createdAt');
        const request = index.getAll();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const result = (request.result as HistoryItem[]).map(item => {
            if (!item.createdAt) {
              return { ...item, createdAt: parseInt(item.id) || Date.now() };
            }
            return item;
          });
          resolve(result.sort((a, b) => {
            const timeA = a.createdAt || 0;
            const timeB = b.createdAt || 0;
            return timeB - timeA;
          }));
        };
      });
    } catch {
      return [];
    }
  },

  async saveAllHistory(items: HistoryItem[]): Promise<void> {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(HISTORY_STORE, 'readwrite');
        const store = transaction.objectStore(HISTORY_STORE);

        const clearRequest = store.clear();
        clearRequest.onsuccess = () => {
          let completed = 0;
          if (items.length === 0) {
            resolve();
            return;
          }

          items.forEach(item => {
            const request = store.put(item);
            request.onsuccess = () => {
              completed++;
              if (completed === items.length) {
                resolve();
              }
            };
            request.onerror = () => reject(request.error);
          });
        };
        clearRequest.onerror = () => reject(clearRequest.error);
      });
    } catch (error) {
      console.error('Failed to save history:', error);
      throw error;
    }
  },

  async getHistory(): Promise<HistoryItem[]> {
    return this.getAllHistory();
  },

  async addHistory(item: Omit<HistoryItem, 'id' | 'createdAt'>): Promise<void> {
    const all = await this.getAllHistory();
    const newItem: HistoryItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: Date.now()
    };
    const updated = [newItem, ...all].slice(0, HISTORY_LIMIT);
    await this.saveAllHistory(updated);
  },

  async deleteHistory(id: string): Promise<void> {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(HISTORY_STORE, 'readwrite');
        const store = transaction.objectStore(HISTORY_STORE);
        const request = store.delete(id);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('Failed to delete history:', error);
      throw error;
    }
  },

  async clearHistory(): Promise<void> {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(HISTORY_STORE, 'readwrite');
        const store = transaction.objectStore(HISTORY_STORE);
        const request = store.clear();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('Failed to clear history:', error);
      throw error;
    }
  },

  async getHistoryCount(): Promise<number> {
    const all = await this.getAllHistory();
    return all.length;
  },

  // ==================== Preset Voices ====================

  async getPresetVoice(id: string): Promise<PresetVoiceData | null> {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(PRESET_VOICES_STORE, 'readonly');
        const store = transaction.objectStore(PRESET_VOICES_STORE);
        const request = store.get(id);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result || null);
      });
    } catch {
      return null;
    }
  },

  async getAllPresetVoices(): Promise<Record<string, PresetVoiceData>> {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(PRESET_VOICES_STORE, 'readonly');
        const store = transaction.objectStore(PRESET_VOICES_STORE);
        const request = store.getAll();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const result: Record<string, PresetVoiceData> = {};
          request.result.forEach((item: PresetVoiceData) => {
            result[item.id] = item;
          });
          resolve(result);
        };
      });
    } catch {
      return {};
    }
  },

  async savePresetVoice(id: string, data: Omit<PresetVoiceData, 'id' | 'updatedAt'>): Promise<void> {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(PRESET_VOICES_STORE, 'readwrite');
        const store = transaction.objectStore(PRESET_VOICES_STORE);
        const request = store.put({
          id,
          ...data,
          updatedAt: Date.now()
        });

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('Failed to save preset voice:', error);
      throw error;
    }
  },

  async deletePresetVoice(id: string): Promise<void> {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(PRESET_VOICES_STORE, 'readwrite');
        const store = transaction.objectStore(PRESET_VOICES_STORE);
        const request = store.delete(id);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('Failed to delete preset voice:', error);
      throw error;
    }
  },

  // ==================== Utility ====================

  async clearAll(): Promise<void> {
    await Promise.all([
      this.clearHistory(),
      this.clearPresetVoices()
    ]);
  },

  async clearPresetVoices(): Promise<void> {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(PRESET_VOICES_STORE, 'readwrite');
        const store = transaction.objectStore(PRESET_VOICES_STORE);
        const request = store.clear();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('Failed to clear preset voices:', error);
      throw error;
    }
  },

  async getStorageUsage(): Promise<{ used: number; quota: number }> {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        quota: estimate.quota || 0
      };
    }
    return { used: 0, quota: 0 };
  }
};
