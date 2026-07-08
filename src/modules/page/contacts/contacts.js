import { LightningElement } from 'lwc';
import { navigate } from '../../../router';
import { onStoreChange, getContacts, getStudyCountForPI } from 'data/store';
import { dateLabel } from 'data/format';

const VIEWS = [
  { value: 'mykol', label: 'My KOL Contacts' },
  { value: 'pis', label: 'All PIs' },
  { value: 'all', label: 'All Contacts' },
];
const NAME = { label: 'Name', fieldName: 'name', type: 'button', typeAttributes: { label: { fieldName: 'name' }, variant: 'base', name: 'view' } };
const COLUMNS = {
  mykol: [NAME, { label: 'Title', fieldName: 'title' }, { label: 'Account', fieldName: 'accountName' }, { label: 'Specialty', fieldName: 'specialty' }, { label: 'Last Engagement', fieldName: 'lastEngagementLabel' }],
  pis: [NAME, { label: 'Title', fieldName: 'title' }, { label: 'Account', fieldName: 'accountName' }, { label: 'Specialty', fieldName: 'specialty' }, { label: 'Research Studies', fieldName: 'studyCount', type: 'number', cellAttributes: { alignment: 'left' } }],
  all: [NAME, { label: 'Title', fieldName: 'title' }, { label: 'Account', fieldName: 'accountName' }, { label: 'Specialty', fieldName: 'specialty' }, { label: 'Email', fieldName: 'email', type: 'email' }],
};

export default class Contacts extends LightningElement {
  view = 'mykol';
  contacts = [];
  searchTerm = '';
  _unsub;

  connectedCallback() {
    this._unsub = onStoreChange(() => { this.contacts = getContacts(); });
    this.contacts = getContacts();
  }
  disconnectedCallback() { this._unsub?.(); }

  get views() { return VIEWS; }
  get currentViewLabel() { return VIEWS.find((v) => v.value === this.view)?.label; }
  get columns() { return COLUMNS[this.view]; }

  get rows() {
    return this.contacts.map((c) => ({
      ...c,
      lastEngagementLabel: dateLabel(c.lastEngagement),
      studyCount: getStudyCountForPI(c.name),
    }));
  }
  get filtered() {
    let rows = this.rows;
    if (this.view === 'pis') rows = rows.filter((c) => c.role === 'PI');
    if (this.searchTerm) {
      const t = this.searchTerm.toLowerCase();
      rows = rows.filter((c) => [c.name, c.accountName, c.specialty].some((x) => (x || '').toLowerCase().includes(t)));
    }
    return rows;
  }
  get metaText() {
    const n = this.filtered.length;
    return `${n} item${n !== 1 ? 's' : ''} • Sorted by Name • Filtered by List View`;
  }

  handleViewChange(e) { this.view = e.detail.value; }
  handleSearch(e) { this.searchTerm = e.detail.value; }
  handleRowAction(e) { if (e.detail.action.name === 'view') navigate(`/contacts/${e.detail.row.id}`); }
}
