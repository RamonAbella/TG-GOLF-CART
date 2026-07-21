import api from './api';

function getSessionId() {
  let id = localStorage.getItem('tg-session-id');
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('tg-session-id', id);
  }
  return id;
}

export function trackPageView(path) {
  api.post('/analytics/track', {
    path,
    referrer: document.referrer || null,
    sessionId: getSessionId(),
  }).catch(() => {});
}
