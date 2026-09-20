import React, { useEffect, useState } from 'react';
import { StorageService } from '../services/storageService';
import { UserSettings, DEFAULT_SETTINGS } from '../models/SavedPage';

export const App: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [pageCount, setPageCount] = useState<number>(0);

  useEffect(() => {
    async function init() {
      const s = await StorageService.getSettings();
      const pages = await StorageService.getAllPages();
      setSettings(s);
      setPageCount(pages.length);
    }
    init();
  }, []);

  const handleToggleNotification = async () => {
    const updated = await StorageService.updateSettings({
      showNotificationOnSave: !settings.showNotificationOnSave
    });
    setSettings(updated);
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Are you sure you want to delete all saved pages? This cannot be undone.')) {
      await StorageService.clearAllPages();
      setPageCount(0);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '40px auto', padding: '0 16px' }}>
      <h2 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Later Settings</h2>

      <section style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '15px' }}>General</h3>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={settings.showNotificationOnSave}
            onChange={handleToggleNotification}
          />
          Show notification after saving
        </label>
      </section>

      <section style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
        <h3 style={{ fontSize: '15px' }}>Storage</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Number of saved pages: <strong>{pageCount}</strong>
        </p>
        <button
          className="btn-secondary"
          onClick={handleDeleteAll}
          style={{ color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
        >
          Delete all saved pages
        </button>
      </section>
    </div>
  );
};