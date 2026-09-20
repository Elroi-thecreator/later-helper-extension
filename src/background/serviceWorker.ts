import { StorageService } from '../services/storageService';
import { CategoryService } from '../services/categoryService';
import { SavedPage } from '../models/SavedPage';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'later_save_page',
    title: 'Save to Later',
    contexts: ['page']
  });

  chrome.contextMenus.create({
    id: 'later_save_selection',
    title: 'Save selected text to Later',
    contexts: ['selection']
  });
});

async function handleSaveAction(tab: chrome.tabs.Tab, selectionText?: string) {
  if (!tab || !tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
    return;
  }

  const domain = new URL(tab.url).hostname.replace(/^www\./, '');
  const title = tab.title || domain;
  const settings = await StorageService.getSettings();
  const category = settings.defaultCategory !== 'Automatic'
    ? settings.defaultCategory
    : CategoryService.detect(tab.url, title, selectionText || '');

  const newPage: SavedPage = {
    id: crypto.randomUUID(),
    url: tab.url,
    title,
    domain,
    faviconUrl: tab.favIconUrl,
    category,
    tags: [],
    selectedText: selectionText ? selectionText.slice(0, 500) : undefined,
    savedAt: Date.now(),
    visitCount: 0
  };

  await StorageService.savePage(newPage);

  if (settings.showNotificationOnSave) {
    chrome.notifications.create(`saved_${newPage.id}`, {
      type: 'basic',
      iconUrl: tab.favIconUrl || 'icons/icon48.png',
      title: `Saved to Later (${category})`,
      message: title,
      priority: 1
    });
  }

  if (settings.openSidePanelOnSave && tab.windowId) {
    chrome.sidePanel.open({ windowId: tab.windowId }).catch(() => {});
  }
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (tab) {
    await handleSaveAction(tab, info.selectionText);
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'save-current-page') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      await handleSaveAction(tab);
    }
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name.startsWith('reminder_')) {
    const pageId = alarm.name.replace('reminder_', '');
    const pages = await StorageService.getAllPages();
    const item = pages.find((p) => p.id === pageId);

    if (item) {
      chrome.notifications.create(`reminder_click_${item.id}`, {
        type: 'basic',
        iconUrl: item.faviconUrl || 'icons/icon48.png',
        title: 'You saved this page earlier',
        message: `${item.title}\nOpen it now?`,
        priority: 2
      });
    }
  }
});

chrome.notifications.onClicked.addListener(async (notificationId) => {
  if (notificationId.startsWith('reminder_click_')) {
    const pageId = notificationId.replace('reminder_click_', '');
    const pages = await StorageService.getAllPages();
    const item = pages.find((p) => p.id === pageId);
    if (item) {
      await StorageService.recordVisit(item.id);
      await chrome.tabs.create({ url: item.url });
    }
  }
});