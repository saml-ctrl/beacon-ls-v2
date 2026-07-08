import { LightningElement } from 'lwc';
import { navigate } from '../../../router';
import { onStoreChange, getContracts } from 'data/store';
import { dateLabel } from 'data/format';

const VIEWS = [
  { value: 'awaiting', label: 'Awaiting Signature' },
  { value: 'executed', label: 'Executed' },
  { value: 'all', label: 'All Sales Contracts' },
];
const NAME = { label: 'Contract Name', fieldName: 'name', type: 'button', typeAttributes: { label: { fieldName: 'name' }, variant: 'base', name: 'view' } };
const COLUMNS = {
  awaiting: [NAME, { label: 'Opportunity', fieldName: 'opportunityName' }, { label: 'Type', fieldName: 'type' }, { label: 'Status', fieldName: 'status' }, { label: 'Sent Date', fieldName: 'sentDateLabel' }],
  executed: [NAME, { label: 'Opportunity', fieldName: 'opportunityName' }, { label: 'Type', fieldName: 'type' }, { label: 'Status', fieldName: 'status' }, { label: 'Sent Date', fieldName: 'sentDateLabel' }, { label: 'Signed Date', fieldName: 'signedDateLabel' }],
  all: [NAME, { label: 'Opportunity', fieldName: 'opportunityName' }, { label: 'Type', fieldName: 'type' }, { label: 'Status', fieldName: 'status' }, { label: 'Sent Date', fieldName: 'sentDateLabel' }],
};

export default class SalesContracts extends LightningElement {
  view = 'awaiting';
  contracts = [];
  searchTerm = '';
  _unsub;

  connectedCallback() {
    this._unsub = onStoreChange(() => { this.contracts = getContracts(); });
    this.contracts = getContracts();
  }
  disconnectedCallback() { this._unsub?.(); }

  get views() { return VIEWS; }
  get currentViewLabel() { return VIEWS.find((v) => v.value === this.view)?.label; }
  get columns() { return COLUMNS[this.view]; }

  get rows() {
    return this.contracts.map((c) => ({ ...c, sentDateLabel: dateLabel(c.sentDate), signedDateLabel: dateLabel(c.signedDate) }));
  }
  get filtered() {
    let rows = this.rows;
    if (this.view === 'awaiting') rows = rows.filter((c) => c.status !== 'Signed');
    else if (this.view === 'executed') rows = rows.filter((c) => c.status === 'Signed');
    if (this.searchTerm) {
      const t = this.searchTerm.toLowerCase();
      rows = rows.filter((c) => [c.name, c.opportunityName].some((x) => (x || '').toLowerCase().includes(t)));
    }
    return rows;
  }
  get metaText() {
    const n = this.filtered.length;
    return `${n} item${n !== 1 ? 's' : ''} • Sorted by Sent Date • Filtered by List View`;
  }

  handleViewChange(e) { this.view = e.detail.value; }
  handleSearch(e) { this.searchTerm = e.detail.value; }
  handleRowAction(e) { if (e.detail.action.name === 'view') navigate(`/sales-contracts/${e.detail.row.id}`); }
}
