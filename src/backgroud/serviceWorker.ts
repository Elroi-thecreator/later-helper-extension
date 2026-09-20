import { StorageService } from '../services/storageService';

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

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'save-current-page') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id && tab.url) {
      chrome.runtime.sendMessage({ action: 'TRIGGER_SAVE_CURRENT_PAGE', tab });
    }
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name.startsWith('reminder_')) {
    const pageId = alarm.name.replace('reminder_', '');
    const pages = await StorageService.getAllPages();
    const item = pages.find((p) => p.id === pageId);

    if (item) {
      chrome.notifications.create(`notif_${item.id}`, {
        type: 'basic',
        iconUrl: item.faviconUrl || 'icons/icon48.png',
        title: 'You saved this page earlier',
        message: `${item.title}\nOpen it now?`,
        priority: 1
      });
    }
  }
});

chrome.notifications.onClicked.addListener(async (notificationId) => {
  if (notificationId.startsWith('notif_')) {
    const pageId = notificationId.replace('notif_', '');
    const pages = await StorageService.getAllPages();
    const item = pages.find((p) => p.id === pageId);
    if (item) {
      await StorageService.recordVisit(item.id);
      await chrome.tabs.create({ url: item.url });
    }
  }
});