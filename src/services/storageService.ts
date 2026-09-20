import { SavedPage, UserSettings, DEFAULT_SETTINGS } from '../models/SavedPage';

const STORAGE_KEYS = {
  SAVED_PAGES: 'later_saved_pages',
  SETTINGS: 'later_user_settings'
} as const;

export class StorageService {
  public static async getAllPages(): Promise<SavedPage[]> {
    const data = await chrome.storage.local.get(STORAGE_KEYS.SAVED_PAGES);
    return (data[STORAGE_KEYS.SAVED_PAGES] as SavedPage[]) || [];
  }

  public static async findPageByUrl(url: string): Promise<SavedPage | undefined> {
    const pages = await this.getAllPages();
    const normalizedTarget = this.normalizeUrl(url);
    return pages.find((p) => this.normalizeUrl(p.url) === normalizedTarget);
  }

  public static async savePage(page: SavedPage): Promise<void> {
    const pages = await this.getAllPages();
    const existingIndex = pages.findIndex((p) => this.normalizeUrl(p.url) === this.normalizeUrl(page.url));

    if (existingIndex >= 0) {
      pages[existingIndex] = { ...pages[existingIndex], ...page };
    } else {
      pages.unshift(page);
    }

    await chrome.storage.local.set({ [STORAGE_KEYS.SAVED_PAGES]: pages });
  }

  public static async deletePage(id: string): Promise<void> {
    const pages = await this.getAllPages();
    const updated = pages.filter((p) => p.id !== id);
    await chrome.storage.local.set({ [STORAGE_KEYS.SAVED_PAGES]: updated });
  }

  public static async clearAllPages(): Promise<void> {
    await chrome.storage.local.set({ [STORAGE_KEYS.SAVED_PAGES]: [] });
  }

  public static async recordVisit(id: string): Promise<void> {
    const pages = await this.getAllPages();
    const page = pages.find((p) => p.id === id);
    if (page) {
      page.lastOpenedAt = Date.now();
      page.visitCount = (page.visitCount || 0) + 1;
      await chrome.storage.local.set({ [STORAGE_KEYS.SAVED_PAGES]: pages });
    }
  }

  public static async getSettings(): Promise<UserSettings> {
    const data = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
    return (data[STORAGE_KEYS.SETTINGS] as UserSettings) || DEFAULT_SETTINGS;
  }

  public static async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: updated });
    return updated;
  }

  private static normalizeUrl(rawUrl: string): string {
    try {
      const parsed = new URL(rawUrl);
      return `${parsed.origin}${parsed.pathname.replace(/\/$/, '')}${parsed.search}`;
    } catch {
      return rawUrl.trim().toLowerCase();
    }
  }
}