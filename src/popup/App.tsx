import React, { useEffect, useState, useMemo } from 'react';
import { SavedPage } from '../models/SavedPage';
import { StorageService } from '../services/storageService';
import { PageService } from '../services/pageService';
import { CategoryBadge } from '../components/CategoryBadge';

export const App: React.FC = () => {
  const [pages, setPages] = useState<SavedPage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);
  const [existingPage, setExistingPage] = useState<SavedPage | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      const allPages = await StorageService.getAllPages();
      setPages(allPages);

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url) {
        setCurrentTab(tab);
        const match = await StorageService.findPageByUrl(tab.url);
        setExistingPage(match || null);
      }
    }
    loadData();
  }, []);

  const filteredPages = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return pages.slice(0, 5);

    return pages.filter((p) =>
      p.title.toLowerCase().includes(q) ||
      p.domain.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.url.toLowerCase().includes(q)
    );
  }, [pages, searchQuery]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const page = await PageService.captureCurrentTab();
      if (page) {
        await StorageService.savePage(page);
        setExistingPage(page);

        const updated = await StorageService.getAllPages();
        setPages(updated);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenPage = async (page: SavedPage) => {
    await StorageService.recordVisit(page.id);
    await chrome.tabs.create({ url: page.url });
  };

  return (
    <div style={{ padding: '16px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Later</h1>
        <button
          className="btn-secondary"
          style={{ padding: '4px 8px', fontSize: '11px' }}
          onClick={() => chrome.runtime.openOptionsPage()}
        >
          Settings
        </button>
      </header>

      {/* Inline Search Input */}
      <div style={{ position: 'relative', marginBottom: '14px' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search saved pages..."
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '8px 28px 8px 10px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            fontSize: '13px',
            outline: 'none',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)'
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '2px 4px',
              fontSize: '12px'
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Save Action / Duplicate Notice */}
      {!searchQuery && (
        existingPage ? (
          <div style={{ padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Already saved</span>
              <CategoryBadge category={existingPage.category} />
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              This page is already in Later.
            </div>
            <button
              className="btn-secondary"
              style={{ width: '100%' }}
              onClick={() => handleOpenPage(existingPage)}
            >
              Open saved item
            </button>
          </div>
        ) : (
          <div style={{ marginBottom: '16px' }}>
            <button
              className="btn-primary"
              style={{ width: '100%' }}
              onClick={handleSave}
              disabled={isSaving || !currentTab?.url || currentTab.url.startsWith('chrome://')}
            >
              {isSaving ? 'Saving...' : '+ Save current page'}
            </button>
          </div>
        )
      )}

      {/* List / Search Results */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
          {searchQuery ? `Results (${filteredPages.length})` : 'Recent'}
        </span>

        {filteredPages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
            {searchQuery ? 'Nothing found. Try another search.' : 'Your web memory is empty.'}
          </div>
        ) : (
          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredPages.map((p) => (
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
                  <img
                    src={p.faviconUrl}
                    alt=""
                    style={{ width: 16, height: 16, borderRadius: 2 }}
                    onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                  />
                ) : (
                  <div style={{ width: 16, height: 16, backgroundColor: '#cbd5e1', borderRadius: 2 }} />
                )}
                <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{p.domain}</div>
                </div>
                <CategoryBadge category={p.category} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
