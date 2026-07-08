import { LightningElement } from 'lwc';
import { navigate } from '../../../router';
import { onStoreChange, getAccounts, getOpenOpportunityCount, getActiveStudyCount } from 'data/store';

const VIEWS = [
  { value: 'sponsors', label: 'Sponsors' },
  { value: 'sites', label: 'Clinical Sites' },
  { value: 'all', label: 'All Accounts' },
];
const NAME = { label: 'Account Name', fieldName: 'name', type: 'button', typeAttributes: { label: { fieldName: 'name' }, variant: 'base', name: 'view' } };
const NUM = { type: 'number', cellAttributes: { alignment: 'left' } };
const COLUMNS = {
  sponsors: [NAME, { label: 'Tier', fieldName: 'tier' }, { label: 'Industry Focus', fieldName: 'industryFocus' }, { label: 'Open Opportunities', fieldName: 'openOpps', ...NUM }],
  sites: [NAME, { label: 'City/State', fieldName: 'cityState' }, { label: 'PI', fieldName: 'primaryPI' }, { label: 'Active Studies', fieldName: 'activeStudies', ...NUM }],
  all: [NAME, { label: 'Record Type', fieldName: 'recordType' }, { label: 'Owner', fieldName: 'owner' }],
};

export default class Accounts extends LightningElement {
  view = 'sponsors';
  accounts = [];
  searchTerm = '';
  _unsub;

  connectedCallback() {
    this._unsub = onStoreChange(() => { this.accounts = getAccounts(); });
    this.accounts = getAccounts();
  }
  disconnectedCallback() { this._unsub?.(); }

  get views() { return VIEWS; }
  get currentViewLabel() { return VIEWS.find((v) => v.value === this.view)?.label; }
  get columns() { return COLUMNS[this.view]; }

  get rows() {
    return this.accounts.map((a) => ({
      ...a,
      openOpps: getOpenOpportunityCount(a.id),
      activeStudies: getActiveStudyCount(a.id),
    }));
  }
  get filtered() {
    let rows = this.rows;
    if (this.view === 'sponsors') rows = rows.filter((a) => a.recordType === 'Organization');
    else if (this.view === 'sites') rows = rows.filter((a) => a.recordType === 'Clinical Site');
    if (this.searchTerm) {
      const t = this.searchTerm.toLowerCase();
      rows = rows.filter((a) => (a.name || '').toLowerCase().includes(t));
    }
    return rows;
  }
  get metaText() {
    const n = this.filtered.length;
    return `${n} item${n !== 1 ? 's' : ''} • Sorted by Account Name • Filtered by List View`;
  }

  handleViewChange(e) { this.view = e.detail.value; }
  handleSearch(e) { this.searchTerm = e.detail.value; }
  handleRowAction(e) { if (e.detail.action.name === 'view') navigate(`/accounts/${e.detail.row.id}`); }
}
