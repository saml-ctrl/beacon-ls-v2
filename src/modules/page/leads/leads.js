import { LightningElement } from 'lwc';
import { navigate } from '../../../router';
import { onStoreChange, getLeads } from 'data/store';
import { yesNo, dateLabel } from 'data/format';

const VIEWS = [
  { value: 'new', label: 'New KOLs: This Week' },
  { value: 'my', label: 'My KOLs' },
  { value: 'open', label: 'All Open Leads' },
];
const NAME = { label: 'Name', fieldName: 'name', type: 'button', typeAttributes: { label: { fieldName: 'name' }, variant: 'base', name: 'view' } };
const COLUMNS = {
  new: [NAME, { label: 'Title', fieldName: 'title' }, { label: 'Site/Institution', fieldName: 'siteInstitution' }, { label: 'Research Study', fieldName: 'studyName' }, { label: 'Lead Status', fieldName: 'leadStatus' }, { label: 'Enriched', fieldName: 'enrichedLabel' }],
  my: [NAME, { label: 'Title', fieldName: 'title' }, { label: 'Site/Institution', fieldName: 'siteInstitution' }, { label: 'Email', fieldName: 'email', type: 'email' }, { label: 'Phone', fieldName: 'phone' }, { label: 'Last Engagement', fieldName: 'lastEngagementLabel' }],
  open: [NAME, { label: 'Title', fieldName: 'title' }, { label: 'Site/Institution', fieldName: 'siteInstitution' }, { label: 'Research Study', fieldName: 'studyName' }, { label: 'Lead Status', fieldName: 'leadStatus' }, { label: 'Enriched', fieldName: 'enrichedLabel' }],
};

export default class Leads extends LightningElement {
  view = 'new';
  leads = [];
  searchTerm = '';
  _unsub;

  connectedCallback() {
    this._unsub = onStoreChange(() => { this.leads = getLeads(); });
    this.leads = getLeads();
  }
  disconnectedCallback() { this._unsub?.(); }

  get views() { return VIEWS; }
  get currentViewLabel() { return VIEWS.find((v) => v.value === this.view)?.label; }
  get columns() { return COLUMNS[this.view]; }

  get rows() {
    return this.leads.map((l) => ({
      ...l,
      enrichedLabel: yesNo(l.enriched),
      lastEngagementLabel: dateLabel(l.enrichmentDate),
    }));
  }
  get filtered() {
    let rows = this.rows;
    if (this.view === 'new') rows = rows.filter((l) => !l.converted && l.leadStatus.startsWith('New'));
    else if (this.view === 'my') rows = rows.filter((l) => l.owner === 'Jordan Reyes' && !l.converted);
    else rows = rows.filter((l) => !l.converted);
    if (this.searchTerm) {
      const t = this.searchTerm.toLowerCase();
      rows = rows.filter((l) => [l.name, l.siteInstitution, l.studyName].some((x) => (x || '').toLowerCase().includes(t)));
    }
    return rows;
  }
  get metaText() {
    const n = this.filtered.length;
    return `${n} item${n !== 1 ? 's' : ''} • Sorted by Name • Filtered by List View`;
  }

  handleViewChange(e) { this.view = e.detail.value; }
  handleSearch(e) { this.searchTerm = e.detail.value; }
  handleRowAction(e) { if (e.detail.action.name === 'view') navigate(`/leads/${e.detail.row.id}`); }
}
