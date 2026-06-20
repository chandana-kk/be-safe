/* SafeHer Walk With Me — background check-in scheduler
 * Runs in service worker context via workbox importScripts
 * Production: migrate to Periodic Background Sync API when widely supported
 */

let walkAlarm = null;
let walkGraceAlarm = null;

self.addEventListener('message', (event) => {
  const { type, fireAt, graceMs } = event.data || {};

  if (type === 'WALK_CHECKIN_SCHEDULE') {
    clearTimeout(walkAlarm);
    clearTimeout(walkGraceAlarm);
    const delay = Math.max(0, fireAt - Date.now());
    walkAlarm = setTimeout(() => {
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        if (clients.length) {
          clients.forEach((c) => c.postMessage({ type: 'WALK_CHECKIN_FIRE' }));
        } else {
          self.registration.showNotification('SafeHer — Walk Check-in', {
            body: 'You\'ve been on the move for 15 minutes. Still doing okay?',
            icon: '/favicon.svg',
            tag: 'walk-checkin',
            requireInteraction: true,
            actions: [
              { action: 'safe', title: 'I\'m Safe' },
              { action: 'help', title: 'Need Help' },
            ],
          });
          walkGraceAlarm = setTimeout(() => {
            self.clients.matchAll().then((cs) => {
              cs.forEach((c) => c.postMessage({ type: 'WALK_ESCALATE' }));
            });
          }, graceMs || 120000);
        }
      });
    }, delay);
  }

  if (type === 'WALK_CHECKIN_CANCEL') {
    clearTimeout(walkAlarm);
    clearTimeout(walkGraceAlarm);
    walkAlarm = null;
    walkGraceAlarm = null;
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const action = event.action;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      if (action === 'help') {
        clients.forEach((c) => c.postMessage({ type: 'WALK_ESCALATE' }));
      } else if (action === 'safe' || !action) {
        clients.forEach((c) => c.postMessage({ type: 'WALK_CHECKIN_FIRE' }));
      }
      if (clients.length) {
        return clients[0].focus();
      }
      return self.clients.openWindow('/');
    })
  );
});
