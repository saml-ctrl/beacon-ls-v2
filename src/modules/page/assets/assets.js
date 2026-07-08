import { LightningElement } from 'lwc';
import { navigate } from '../../../router';
import { onStoreChange, getAssets, getOpportunities } from 'data/store';

const VIEWS = [
  { value: 'deployed', label: 'Deployed Wavebands' },
  { value: 'available', label: 'Available Inventory' },
  { value: 'all', label: 'All Assets' },
];
const NAME = { label: 'Asset Name', fieldName: 'name', type: 'button', typeAttributes: { label: { fieldName: 'name' }, variant: 'base', name: 'view' } };
const COLUMNS = {
  deployed: [NAME, { label: 'Serial Number', fieldName: 'serialNumber' }, { label: 'Account/Site', fieldName: 'accountName' }, { label: 'Status', fieldName: 'status' }, { label: 'Opportunity', fieldName: 'opportunityName' }],
  available: [NAME, { label: 'Serial Number', fieldName: 'serialNumber' }, { label: 'Product', fieldName: 'productName' }, { label: 'Status', fieldName: 'status' }],
  all: [NAME, { label: 'Serial Number', fieldName: 'serialNumber' }, { label: 'Account/Site', fieldName: 'accountName' }, { label: 'Status', fieldName: 'status' }, { label: 'Product', fieldName: 'productName' }],
};

export default class Assets extends LightningElement {
  view = 'deployed';
  assets = [];
  searchTerm = '';
  _unsub;

  connectedCallback() {
    this._unsub = onStoreChange(() => this.load());
    this.load();
  }
  disconnectedCallback() { this._unsub?.(); }
  load() {
    this.assets = getAssets();
    const nameById = {};
    getOpportunities().forEach((o) => { nameById[o.id] = o.name; });
    this._oppNames = nameById;
  }

  get views() { return VIEWS; }
  get currentViewLabel() { return VIEWS.find((v) => v.value === this.view)?.label; }
  get columns() { return COLUMNS[this.view]; }

  get rows() {
    return this.assets.map((a) => ({ ...a, opportunityName: this._oppNames[a.opportunityId] || '' }));
  }
  get filtered() {
    let rows = this.rows;
    if (this.view === 'deployed') rows = rows.filter((a) => a.status === 'Deployed');
    else if (this.view === 'available') rows = rows.filter((a) => a.status === 'Available');
    if (this.searchTerm) {
      const t = this.searchTerm.toLowerCase();
      rows = rows.filter((a) => [a.name, a.serialNumber, a.accountName].some((x) => (x || '').toLowerCase().includes(t)));
    }
    return rows;
  }
  get metaText() {
    const n = this.filtered.length;
    return `${n} item${n !== 1 ? 's' : ''} • Sorted by Asset Name • Filtered by List View`;
  }

  handleViewChange(e) { this.view = e.detail.value; }
  handleSearch(e) { this.searchTerm = e.detail.value; }
  handleRowAction(e) { if (e.detail.action.name === 'view') navigate(`/assets/${e.detail.row.id}`); }
}
