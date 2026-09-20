// Listen for extraction queries from the popup or background worker
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'EXTRACT_PAGE_STATE') {
    const video = document.querySelector('video');
    const scrollY = window.scrollY;
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercentage = totalHeight > 0 ? Math.round((scrollY / totalHeight) * 100) : 0;

    sendResponse({
      scrollY,
      scrollPercentage,
      videoPlayheadSeconds: video ? Math.floor(video.currentTime) : undefined,
    });
  }

  if (request.action === 'RESTORE_PAGE_STATE') {
    const { scrollY, videoPlayheadSeconds } = request.state;
    if (scrollY !== undefined) {
      window.scrollTo({ top: scrollY, behavior: 'smooth' });
    }
    if (videoPlayheadSeconds !== undefined) {
      const video = document.querySelector('video');
      if (video) video.currentTime = videoPlayheadSeconds;
    }
    sendResponse({ success: true });
  }
});

// Ambient Duplicate Deflector: Check if user has revisited a saved memory
(async function checkAmbientMemory() {
  const currentUrl = window.location.href;
  chrome.runtime.sendMessage({ action: 'CHECK_EXISTING_MEMORY', url: currentUrl }, (response) => {
    if (response?.exists) {
      const banner = document.createElement('div');
      banner.id = 'later-ambient-toast';
      banner.innerHTML = `
        <div style="position:fixed; bottom:20px; right:20px; z-index:999999; background:#0f172a; color:#fff; padding:10px 16px; border-radius:8px; font-size:12px; font-family:sans-serif; box-shadow:0 8px 24px rgba(0,0,0,0.25); display:flex; align-items:center; gap:10px;">
          <span>📌 You saved this ${new Date(response.savedAt).toLocaleDateString()}</span>
          <button id="later-dismiss-btn" style="background:#334155; border:none; color:#fff; border-radius:4px; padding:2px 8px; cursor:pointer;">Dismiss</button>
        </div>
      `;
      document.body.appendChild(banner);
      document.getElementById('later-dismiss-btn')?.addEventListener('click', () => banner.remove());
    }
  });
})();