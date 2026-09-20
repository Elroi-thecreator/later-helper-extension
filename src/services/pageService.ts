import { SavedPage, PageCategory } from '../models/SavedPage';
import { CategoryService } from './categoryService';
import { StorageService } from './storageService';

export class PageService {

  public static async captureCurrentSessionBundle(): Promise<SavedPage> {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const validTabs = tabs.filter(t => t.url && !t.url.startsWith('chrome://'));
  const urls = validTabs.map(t => t.url!);
  const title = `Research Session (${validTabs.length} tabs) — ${new Date().toLocaleDateString()}`;

  return {
    id: crypto.randomUUID(),
    url: validTabs[0]?.url || 'session://bundle',
    title,
    domain: 'Session Bundle',
    category: 'Learning',
    tags: ['session', 'research'],
    isSessionBundle: true,
    bundledUrls: urls,
    state: {
      scrollY: 0,
      scrollPercentage: 0,
      highlights: []
    },
    savedAt: Date.now(),
    visitCount: 0
  };
  }
  public static async captureCurrentTab(selectedTextOverride?: string): Promise<SavedPage | null> {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id || !tab.url) return null;
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://')) {
      return null;
    }

    let description = '';
    let selectedText = selectedTextOverride || '';

    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') ||
                           document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
          const selection = window.getSelection()?.toString() || '';
          return { metaDesc, selection };
        }
      });

      if (results && results[0]?.result) {
        description = results[0].result.metaDesc.trim().slice(0, 300);
        if (!selectedText) {
          selectedText = results[0].result.selection.trim().slice(0, 500);
        }
      }
    } catch {
      // Gracefully fall back if tab restricts script injection
    }

    const domain = new URL(tab.url).hostname.replace(/^www\./, '');
    const title = tab.title || domain;
    const settings = await StorageService.getSettings();

    const category: PageCategory = settings.defaultCategory !== 'Automatic'
      ? settings.defaultCategory
      : CategoryService.detect(tab.url, title, description);

    return {
      id: crypto.randomUUID(),
      url: tab.url,
      title,
      domain,
      faviconUrl: tab.favIconUrl,
      category,
      tags: [],
      description: description || undefined,
      selectedText: selectedText ? selectedText.slice(0, 500) : undefined,
      savedAt: Date.now(),
      visitCount: 0
    };
  }
}