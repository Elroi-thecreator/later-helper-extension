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
  category: string;
  tags: string[];
  
  // Intelligence & Content Archive
  readerContent?: string;      // Cleaned reader text
  excerpt?: string;            // Primary summary sentence
  embedding?: number[];        // 384-dimensional semantic vector
  
  // Interactive State
  state: SavedState;
  
  // Metadata & Timestamps
  savedAt: number;
  lastOpenedAt?: number;
  visitCount: number;
  isSessionBundle?: boolean;
  bundledUrls?: string[];
}