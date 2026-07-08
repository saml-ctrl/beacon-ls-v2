import { LightningElement } from 'lwc';
import { navigate } from '../../../router';
import { onStoreChange, getOpportunities } from 'data/store';
import { currency, dateLabel, yesNo } from 'data/format';

const VIEWS = [
  { value: 'myopen', label: 'My Open Opportunities' },
  { value: 'closing', label: 'Closing This Quarter' },
  { value: 'changeorders', label: 'Change Orders' },
  { value: 'wonpending', label: 'Closed Won: Pending Onboarding' },
  { value: 'all', label: 'All LS Opportunities' },
];
const NAME = { label: 'Opportunity Name', fieldName: 'name', type: 'button', typeAttributes: { label: { fieldName: 'name' }, variant: 'base', name: 'view' } };
const COLUMNS = {
  myopen: [NAME, { label: 'Account', fieldName: 'accountName' }, { label: 'Stage', fieldName: 'stage' }, { label: 'Amount', fieldName: 'amountLabel' }, { label: 'Close Date', fieldName: 'closeDateLabel' }, { label: 'Forecast Category', fieldName: 'forecastCategory' }],
  closing: [NAME, { label: 'Account', fieldName: 'accountName' }, { label: 'Stage', fieldName: 'stage' }, { label: 'Amount', fieldName: 'amountLabel' }, { label: 'Close Date', fieldName: 'closeDateLabel' }, { label: 'Forecast Category', fieldName: 'forecastCategory' }, { label: 'Owner', fieldName: 'owner' }],
  changeorders: [NAME, { label: 'Account', fieldName: 'accountName' }, { label: 'Stage', fieldName: 'stage' }, { label: 'Amount', fieldName: 'amountLabel' }, { label: 'Parent Opportunity', fieldName: 'parentName' }, { label: 'Exhibit', fieldName: 'exhibitLetter' }],
  wonpending: [NAME, { label: 'Stage', fieldName: 'stage' }, { label: 'MSA Executed Date', fieldName: 'msaExecutedDateLabel' }, { label: 'Onboarding Form Sent', fieldName: 'onboardingSentLabel' }, { label: 'Key Roles Complete', fieldName: 'keyRolesLabel' }],
  all: [NAME, { label: 'Account', fieldName: 'accountName' }, { label: 'Record Type', fieldName: 'recordType' }, { label: 'Stage', fieldName: 'stage' }, { label: 'Amount', fieldName: 'amountLabel' }, { label: 'Owner', fieldName: 'owner' }],
};

export default class Opportunities extends LightningElement {
  view = 'myopen';
  opps = [];
  searchTerm = '';
  _unsub;

  connectedCallback() {
    this._unsub = onStoreChange(() => { this.opps = getOpportunities(); });
    this.opps = getOpportunities();
  }
  disconnectedCallback() { this._unsub?.(); }

  get views() { return VIEWS; }
  get currentViewLabel() { return VIEWS.find((v) => v.value === this.view)?.label; }
  get columns() { return COLUMNS[this.view]; }

  get rows() {
    const nameById = {};
    this.opps.forEach((o) => { nameById[o.id] = o.name; });
    return this.opps.map((o) => ({
      ...o,
      amountLabel: currency(o.amount),
      closeDateLabel: dateLabel(o.closeDate),
      msaExecutedDateLabel: dateLabel(o.msaExecutedDate),
      onboardingSentLabel: yesNo(o.onboardingFormSent),
      keyRolesLabel: yesNo(o.billingContact && o.productOwner && o.executiveSponsor && o.endUsers),
      parentName: nameById[o.parentOpportunityId] || '',
    }));
  }
  get filtered() {
    let rows = this.rows;
    if (this.view === 'myopen') rows = rows.filter((o) => o.owner === 'Jordan Reyes' && !o.stage.startsWith('Closed'));
    else if (this.view === 'closing') rows = rows.filter((o) => !o.stage.startsWith('Closed'));
    else if (this.view === 'changeorders') rows = rows.filter((o) => o.recordType === 'Change Order');
    else if (this.view === 'wonpending') rows = rows.filter((o) => o.stage === 'Closed Won');
    if (this.searchTerm) {
      const t = this.searchTerm.toLowerCase();
      rows = rows.filter((o) => [o.name, o.accountName].some((x) => (x || '').toLowerCase().includes(t)));
    }
    return rows;
  }
  get metaText() {
    const n = this.filtered.length;
    return `${n} item${n !== 1 ? 's' : ''} • Sorted by Close Date • Filtered by List View`;
  }

  handleViewChange(e) { this.view = e.detail.value; }
  handleSearch(e) { this.searchTerm = e.detail.value; }
  handleRowAction(e) { if (e.detail.action.name === 'view') navigate(`/opportunities/${e.detail.row.id}`); }
}
