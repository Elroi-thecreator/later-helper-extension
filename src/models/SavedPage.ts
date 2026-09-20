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

export interface HighlightSpan {
  id: string;
  text: string;
  prefixContext: string;
  xpath: string;
  color: string;
  createdAt: number;
}

export interface SavedState {
  scrollY: number;
  scrollPercentage: number;
  videoPlayheadSeconds?: number;
  selectedTextSnippet?: string;
  highlights: HighlightSpan[];
}

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
  reminderAt?: number;
  
  // Offline & Semantic Intelligence
  readerContent?: string;
  excerpt?: string;
  embedding?: number[];
  
  // Interactive State
  state?: SavedState;
  
  // Metadata
  savedAt: number;
  lastOpenedAt?: number;
  visitCount: number;
  isSessionBundle?: boolean;
  bundledUrls?: string[];
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