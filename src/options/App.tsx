import React, { useEffect, useState } from 'react';
import { StorageService } from '../services/storageService';
import { UserSettings, DEFAULT_SETTINGS, PageCategory } from '../models/SavedPage';
import { CategoryService } from '../services/categoryService';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const App: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [pageCount, setPageCount] = useState<number>(0);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    async function init() {
      const currentSettings = await StorageService.getSettings();
      const pages = await StorageService.getAllPages();
      setSettings(currentSettings);
      setPageCount(pages.length);
    }
    init();
  }, []);

  const handleNotificationToggle = async () => {
    const updated = await StorageService.updateSettings({
      showNotificationOnSave: !settings.showNotificationOnSave
    });
    setSettings(updated);
  };

  const handleSidePanelToggle = async () => {
    const updated = await StorageService.updateSettings({
      openSidePanelOnSave: !settings.openSidePanelOnSave
    });
    setSettings(updated);
  };

  const handleDefaultCategoryChange = async (cat: PageCategory | 'Automatic') => {
    const updated = await StorageService.updateSettings({ defaultCategory: cat });
    setSettings(updated);
  };

  const handleClearAll = async () => {
    await StorageService.clearAllPages();
    setPageCount(0);
    setIsConfirmOpen(false);
  };

  return (
    <div style={{ maxWidth: '480px', margin: '40px auto', padding: '0 20px' }}>
      <h2 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', fontSize: '20px' }}>
        Later Settings
      </h2>

      <section style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          General
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.showNotificationOnSave}
              onChange={handleNotificationToggle}
            />
            Show notification after saving
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.openSidePanelOnSave}
              onChange={handleSidePanelToggle}
            />
            Open side panel after saving
          </label>

          <div style={{ marginTop: '8px' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px' }}>
              Default Category
            </label>
            <select
              value={settings.defaultCategory}
              onChange={(e) => handleDefaultCategoryChange(e.target.value as PageCategory | 'Automatic')}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                fontSize: '13px'
              }}
            >
              <option value="Automatic">Automatic (Rule-based detection)</option>
              {CategoryService.getAllCategories().map((cat: PageCategory) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
        <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          Storage
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
          Total saved items: <strong>{pageCount}</strong>
        </p>
        <button
          className="btn-secondary"
          onClick={() => setIsConfirmOpen(true)}
          style={{ color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
          disabled={pageCount === 0}
        >
          Delete all saved pages
        </button>
      </section>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete all saved pages?"
        message="This action will permanently delete all saved pages from your local memory. This cannot be undone."
        onConfirm={handleClearAll}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};