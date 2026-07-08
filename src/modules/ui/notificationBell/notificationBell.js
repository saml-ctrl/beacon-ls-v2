import { LightningElement } from 'lwc';
import { navigate } from '../../../router';
import {
  onStoreChange,
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  setNavIntent,
} from 'data/store';

const ROUTE_PATH = {
  'research-study': (id) => `/research-studies/${id}`,
  opportunity: (id) => `/opportunities/${id}`,
  contract: (id) => `/sales-contracts/${id}`,
  lead: (id) => `/leads/${id}`,
  contact: (id) => `/contacts/${id}`,
  account: (id) => `/accounts/${id}`,
};
const ICON = {
  'research-study': 'standard:instore_actions',
  opportunity: 'standard:opportunity',
  contract: 'standard:contract',
  lead: 'standard:lead',
  contact: 'standard:contact',
  account: 'standard:account',
};

/**
 * The standard Lightning notification bell. Unread-count badge, a popover tray
 * of custom notifications (each with target-persona label, title, body, and
 * relative time), deep-links to the exact record + Lightning page tab where the
 * work resumes, and marks read on click. Seeded empty so the journey generates
 * notifications live. These are standard Custom Notifications sent by
 * record-triggered Flows — configuration, not code.
 */
export default class NotificationBell extends LightningElement {
  isOpen = false;
  notifications = [];
  unread = 0;
  _unsub;

  connectedCallback() {
    this._unsub = onStoreChange(() => this.refresh());
    this.refresh();
  }
  disconnectedCallback() {
    this._unsub?.();
  }
  refresh() {
    this.notifications = getNotifications();
    this.unread = getUnreadCount();
  }

  get hasUnread() { return this.unread > 0; }
  get badgeLabel() { return this.unread > 9 ? '9+' : String(this.unread); }
  get hasNotifications() { return this.notifications.length > 0; }
  get trayClass() {
    return `slds-dropdown slds-dropdown_right slds-dropdown_large c-tray${this.isOpen ? '' : ' slds-hide'}`;
  }
  get bellTitle() {
    return this.hasUnread ? `Notifications (${this.unread} unread)` : 'Notifications';
  }

  get items() {
    return this.notifications.map((n) => ({
      id: n.id,
      iconName: ICON[n.deepLink?.route] || 'standard:default',
      persona: `To: ${n.targetPersona}`,
      title: n.title,
      body: n.body,
      time: this.relTime(n.createdAt),
      itemClass: `c-tray__item slds-p-around_small${n.read ? '' : ' c-tray__item_unread'}`,
    }));
  }

  relTime(ts) {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 45) return 'just now';
    const m = Math.floor(s / 60);
    if (m < 60) return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hr ago`;
    const d = Math.floor(h / 24);
    return d === 1 ? 'yesterday' : `${d} days ago`;
  }

  toggle() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) this.refresh();
  }
  handleItemClick(event) {
    const id = event.currentTarget.dataset.id;
    const n = this.notifications.find((x) => x.id === id);
    if (!n) return;
    if (n.deepLink) {
      const { route, recordId, tab } = n.deepLink;
      setNavIntent(recordId, tab);
      const path = ROUTE_PATH[route] && ROUTE_PATH[route](recordId);
      if (path) navigate(path);
    }
    markNotificationRead(id);
    this.isOpen = false;
  }
  handleMarkAll() {
    markAllNotificationsRead();
  }
}
