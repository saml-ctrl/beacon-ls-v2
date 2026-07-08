import { LightningElement, api } from 'lwc';

/**
 * Standard-looking activity timeline. Renders tasks / logged activity with an
 * icon, subject, relative date, and status badge — the Activity component that
 * a record page exposes without any custom code.
 */
export default class ActivityTimeline extends LightningElement {
  @api emptyText = 'No past activity. Past tasks and logged calls show up here.';
  _items = [];

  @api get items() {
    return this._items;
  }
  set items(value) {
    this._items = Array.isArray(value) ? value : [];
  }

  get hasItems() {
    return this._items.length > 0;
  }

  get rows() {
    return this._items.map((it, i) => ({
      key: it.id || `act-${i}`,
      subject: it.subject,
      date: it.date,
      description: it.description || it.origin || '',
      iconName: it.iconName || 'standard:task',
      status: it.status || '',
      hasStatus: !!it.status,
    }));
  }
}
