import React, { useEffect, useState } from 'react';
import { SavedPage } from '../models/SavedPage';
import { StorageService } from '../services/storageService';

export const App: React.FC = () => {
  const [pages, setPages] = useState<SavedPage[]>([]);
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function loadData() {
      const allPages = await StorageService.getAllPages();
      setPages(allPages.slice(0, 5));

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url) {
        setCurrentTab(tab);
        const exists = await StorageService.findPageByUrl(tab.url);
        setIsSaved(!!exists);
      }
    }
    loadData();
  }, []);

  const handleSaveCurrentPage = async () => {
    if (!currentTab || !currentTab.url) return;

    const newPage: SavedPage = {
      id: crypto.randomUUID(),
      url: currentTab.url,
      title: currentTab.title || 'Untitled Page',
      domain: new URL(currentTab.url).hostname.replace(/^www\./, ''),
      faviconUrl: currentTab.favIconUrl,
      category: 'Other',
      tags: [],
      savedAt: Date.now(),
      visitCount: 0
    };

    await StorageService.savePage(newPage);
    setIsSaved(true);
    const updated = await StorageService.getAllPages();
    setPages(updated.slice(0, 5));
  };

  const handleOpenPage = async (page: SavedPage) => {
    await StorageService.recordVisit(page.id);
    await chrome.tabs.create({ url: page.url });
  };

  return (
    <div style={{ padding: '16px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Later</h1>
        <button
          className="btn-secondary"
          style={{ padding: '4px 8px', fontSize: '11px' }}
          onClick={() => chrome.runtime.openOptionsPage()}
        >
          Settings
        </button>
      </header>

      {isSaved ? (
        <div style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '14px' }}>
          <p style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 500 }}>Already saved</p>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>This page is already in Later.</span>
        </div>
      ) : (
        <button
          className="btn-primary"
          style={{ width: '100%', marginBottom: '16px' }}
          onClick={handleSaveCurrentPage}
          disabled={!currentTab?.url || currentTab.url.startsWith('chrome://')}
        >
          + Save current page
        </button>
      )}

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
          Recent
        </span>

        {pages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
            Your web memory is empty.
          </div>
        ) : (
          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pages.map((p) => (
              <div
                key={p.id}
                onClick={() => handleOpenPage(p)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                {p.faviconUrl ? (
                  <img src={p.faviconUrl} alt="" style={{ width: 16, height: 16, borderRadius: 2 }} />
                ) : (
                  <div style={{ width: 16, height: 16, backgroundColor: '#cbd5e1', borderRadius: 2 }} />
                )}
                <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{p.domain}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};