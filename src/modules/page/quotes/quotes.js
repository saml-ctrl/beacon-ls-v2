import { LightningElement } from 'lwc';
import { navigate } from '../../../router';
import { onStoreChange, getQuotes } from 'data/store';
import { currency, dateLabel } from 'data/format';

const VIEWS = [
  { value: 'my', label: 'My Quotes' },
  { value: 'all', label: 'All Quotes' },
];
const NAME = { label: 'Quote Name', fieldName: 'name', type: 'button', typeAttributes: { label: { fieldName: 'name' }, variant: 'base', name: 'view' } };
const COLS = [NAME, { label: 'Opportunity', fieldName: 'opportunityName' }, { label: 'Status', fieldName: 'status' }, { label: 'Total', fieldName: 'totalLabel' }, { label: 'Expiration Date', fieldName: 'expirationLabel' }];

export default class Quotes extends LightningElement {
  view = 'my';
  quotes = [];
  searchTerm = '';
  _unsub;

  connectedCallback() {
    this._unsub = onStoreChange(() => { this.quotes = getQuotes(); });
    this.quotes = getQuotes();
  }
  disconnectedCallback() { this._unsub?.(); }

  get views() { return VIEWS; }
  get currentViewLabel() { return VIEWS.find((v) => v.value === this.view)?.label; }
  get columns() { return COLS; }

  get rows() {
    return this.quotes.map((q) => ({ ...q, totalLabel: currency(q.total), expirationLabel: dateLabel(q.expirationDate) }));
  }
  get filtered() {
    let rows = this.rows;
    if (this.view === 'my') rows = rows.filter((q) => q.preparedBy === 'Jordan Reyes');
    if (this.searchTerm) {
      const t = this.searchTerm.toLowerCase();
      rows = rows.filter((q) => [q.name, q.opportunityName].some((x) => (x || '').toLowerCase().includes(t)));
    }
    return rows;
  }
  get metaText() {
    const n = this.filtered.length;
    return `${n} item${n !== 1 ? 's' : ''} • Sorted by Quote Name • Filtered by List View`;
  }

  handleViewChange(e) { this.view = e.detail.value; }
  handleSearch(e) { this.searchTerm = e.detail.value; }
  handleRowAction(e) { if (e.detail.action.name === 'view') navigate(`/quotes/${e.detail.row.id}`); }
}
