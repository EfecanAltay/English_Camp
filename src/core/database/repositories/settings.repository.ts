import { db } from '../app.database';
import type { UserPreferences } from '../../domain/types';

const PREFS_KEY = 'default_user_preferences';

const DEFAULT_PREFERENCES: UserPreferences = {
  id: PREFS_KEY,
  theme: 'system',
  dailyGoalMinutes: 60,
  activeCampId: 'yds-yokdil-camp-sample',
  lastActiveDay: 1,
  updatedAt: new Date().toISOString(),
};

export const settingsRepository = {
  async getPreferences(): Promise<UserPreferences> {
    const prefs = await db.userPreferences.get(PREFS_KEY);
    if (!prefs) {
      await db.userPreferences.put(DEFAULT_PREFERENCES);
      return DEFAULT_PREFERENCES;
    }
    return prefs;
  },

  async updatePreferences(updates: Partial<UserPreferences>): Promise<UserPreferences> {
    const current = await this.getPreferences();
    const updated: UserPreferences = {
      ...current,
      ...updates,
      id: PREFS_KEY,
      updatedAt: new Date().toISOString(),
    };
    await db.userPreferences.put(updated);
    return updated;
  },
};
