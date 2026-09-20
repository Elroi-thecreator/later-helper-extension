import React, { useEffect, useState } from 'react';
import { SavedPage } from '../models/SavedPage';
import { StorageService } from '../services/storageService';

export const App: React.FC = () => {
  const [pages, setPages] = useState<SavedPage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadPages = async () => {
    const list = await StorageService.getAllPages();
    setPages(list);
  };

  useEffect(() => {
    loadPages();
  }, []);

  const filteredPages = pages.filter((page) => {
    const q = searchQuery.toLowerCase();
    return (
      page.title.toLowerCase().includes(q) ||
      page.domain.toLowerCase().includes(q) ||
      page.url.toLowerCase().includes(q)
    );
  });

  const handleOpenPage = async (page: SavedPage) => {
    await StorageService.recordVisit(page.id);
    await chrome.tabs.create({ url: page.url });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <header style={{ marginBottom: '16px' }}>
        <h2 style={{ margin: '0 0 12px 0', fontSize: '20px' }}>Later — Memory</h2>
        <input
          type="text"
          placeholder="Search saved pages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        />
      </header>

      <main>
        {filteredPages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
            {searchQuery ? 'Nothing found. Try another search.' : 'Your web memory is empty.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredPages.map((page) => (
              <div
                key={page.id}
                onClick={() => handleOpenPage(page)}
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  backgroundColor: 'var(--bg-primary)'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{page.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {page.domain} • Saved {new Date(page.savedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
