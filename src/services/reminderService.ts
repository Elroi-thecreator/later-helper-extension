export type ReminderOption = 'none' | 'tomorrow' | '3days' | '1week' | '1month';

export class ReminderService {
  public static calculateTargetTimestamp(option: ReminderOption): number | undefined {
    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;

    switch (option) {
      case 'tomorrow':
        return now + DAY_MS;
      case '3days':
        return now + 3 * DAY_MS;
      case '1week':
        return now + 7 * DAY_MS;
      case '1month':
        return now + 30 * DAY_MS;
      case 'none':
      default:
        return undefined;
    }
  }

  public static async scheduleReminder(pageId: string, timestamp?: number): Promise<void> {
    const alarmName = `reminder_${pageId}`;
    await chrome.alarms.clear(alarmName);

    if (timestamp && timestamp > Date.now()) {
      chrome.alarms.create(alarmName, {
        when: timestamp
      });
    }
  }

  public static async cancelReminder(pageId: string): Promise<void> {
    await chrome.alarms.clear(`reminder_${pageId}`);
  }
}