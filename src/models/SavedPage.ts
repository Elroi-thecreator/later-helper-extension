export type PageCategory =
  | 'Shopping'
  | 'Food'
  | 'Travel'
  | 'Learning'
  | 'Video'
  | 'Jobs'
  | 'News'
  | 'Technology'
  | 'Social'
  | 'Other';

export interface SavedPage {
  id: string;
  url: string;
  title: string;
  domain: string;
  faviconUrl?: string;
  category: PageCategory;
  tags: string[];
  description?: string;
  selectedText?: string;
  savedAt: number;
  lastOpenedAt?: number;
  visitCount: number;
  reminderAt?: number;
}

export interface UserSettings {
  showNotificationOnSave: boolean;
  openSidePanelOnSave: boolean;
  defaultCategory: PageCategory | 'Automatic';
}

export const DEFAULT_SETTINGS: UserSettings = {
  showNotificationOnSave: true,
  openSidePanelOnSave: false,
  defaultCategory: 'Automatic'
};