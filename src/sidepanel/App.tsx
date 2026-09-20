import React, { useEffect, useState } from 'react';
import { SavedPage } from '../models/SavedPage';
import { DBService } from '../services/dbService';
import { SemanticEngine } from '../services/semanticService';

export const App: React.FC = () => {
  const [pages, setPages] = useState<SavedPage[]>([]);
  const [results, setResults] = useState<SavedPage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingSemantic, setIsSearchingSemantic] = useState(false);
  const [readerViewItem, setReaderViewItem] = useState<SavedPage | null>(null);

  useEffect(() => {
    DBService.getAllPages().then((items) => {
      setPages(items);
      setResults(items);
    });
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setResults(pages);
      return;
    }

    const q = query.toLowerCase();
    const keywordMatches = pages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.domain.toLowerCase().includes(q) ||
        (p.readerContent && p.readerContent.toLowerCase().includes(q))
    );

    if (keywordMatches.length > 0) {
      setResults(keywordMatches);
    } else {
      setIsSearchingSemantic(true);
      try {
        const queryEmbedding = await SemanticEngine.generateEmbedding(query);
        const scored = pages
          .filter((p) => p.embedding && p.embedding.length > 0)
          .map((p) => ({
            page: p,
            similarity: SemanticEngine.cosineSimilarity(queryEmbedding, p.embedding!)
          }))
          .sort((a, b) => b.similarity - a.similarity)
          .filter((match) => match.similarity > 0.45)
          .map((match) => match.page);

        setResults(scored);
      } finally {
        setIsSearchingSemantic(false);
      }
    }
  };

  const handleOpenPage = async (page: SavedPage) => {
    let targetUrl = page.url;

    // Safely check video playhead using optional chaining
    if (page.state?.videoPlayheadSeconds && targetUrl.includes('youtube.com/watch')) {
      targetUrl = `${targetUrl}&t=${page.state.videoPlayheadSeconds}s`;
    }

    const tab = await chrome.tabs.create({ url: targetUrl });
    if (tab.id && page.state) {
      const pageState = page.state;
      chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
        if (tabId === tab.id && info.status === 'complete') {
          chrome.tabs.sendMessage(tab.id, { action: 'RESTORE_PAGE_STATE', state: pageState });
          chrome.tabs.onUpdated.removeListener(listener);
        }
      });
    }
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100vh', boxSizing: 'border-box' }}>
      <header style={{ marginBottom: '12px' }}>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>Later Brain</h2>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Type keywords or describe what you remember..."
          style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />
        {isSearchingSemantic && (
          <span style={{ fontSize: '11px', color: '#2563eb' }}>Scanning concept vectors...</span>
        )}
      </header>

      {readerViewItem ? (
        <div style={{ flex: 1, overflowY: 'auto', background: '#fff', padding: '16px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
          <button className="btn-secondary" onClick={() => setReaderViewItem(null)} style={{ marginBottom: '12px' }}>
            ← Back to results
          </button>
          <h3>{readerViewItem.title}</h3>
          <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#334155' }}>
            {readerViewItem.readerContent || 'No cached reader text available.'}
          </div>
        </div>
      ) : (
        <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {results.map((page) => {
            const scrollPercentage = page.state?.scrollPercentage ?? 0;
            const playhead = page.state?.videoPlayheadSeconds;

            return (
              <div
                key={page.id}
                style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}
              >
                <div onClick={() => handleOpenPage(page)}>
                  <strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>{page.title}</strong>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {page.domain} • {scrollPercentage}% read
                    {playhead ? ` • Resumes at ${Math.floor(playhead / 60)}m` : ''}
                  </div>
                </div>
                <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                  <button
                    className="btn-secondary"
                    style={{ fontSize: '11px', padding: '2px 8px' }}
                    onClick={() => setReaderViewItem(page)}
                  >
                    📖 Read Offline
                  </button>
                </div>
              </div>
            );
          })}
        </main>
      )}
    </div>
  );
};
