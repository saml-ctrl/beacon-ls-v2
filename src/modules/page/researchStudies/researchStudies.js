import { LightningElement } from 'lwc';
import { navigate } from '../../../router';
import { onStoreChange, getResearchStudies } from 'data/store';

const VIEWS = [
  { value: 'unassigned', label: 'This Week’s Qualified: Unassigned' },
  { value: 'my', label: 'My Assigned Studies' },
  { value: 'all', label: 'All Research Studies' },
];

const NAME_COL = {
  label: 'Study Name',
  fieldName: 'name',
  type: 'button',
  sortable: true,
  typeAttributes: { label: { fieldName: 'name' }, variant: 'base', name: 'view' },
  cellAttributes: { class: 'slds-cell-wrap' },
};
const ICP_COL = { label: 'ICP Score', fieldName: 'icpScore', type: 'number', cellAttributes: { alignment: 'left' }, initialWidth: 110 };

const COLUMNS = {
  unassigned: [NAME_COL, { label: 'Sponsor', fieldName: 'sponsor' }, { label: 'Indication', fieldName: 'indication' }, { label: 'Phase', fieldName: 'phase' }, ICP_COL, { label: 'Citeline ID', fieldName: 'citelineId' }, { label: 'Ingested Date', fieldName: 'ingestedDate' }],
  my: [NAME_COL, { label: 'Sponsor', fieldName: 'sponsor' }, { label: 'Indication', fieldName: 'indication' }, { label: 'Phase', fieldName: 'phase' }, ICP_COL, { label: 'Assigned BD Rep', fieldName: 'assignedBdRep' }, { label: 'Status', fieldName: 'status' }],
  all: [NAME_COL, { label: 'Sponsor', fieldName: 'sponsor' }, { label: 'Indication', fieldName: 'indication' }, { label: 'Phase', fieldName: 'phase' }, ICP_COL, { label: 'Status', fieldName: 'status' }, { label: 'Approval Status', fieldName: 'approvalStatus' }],
};

export default class ResearchStudies extends LightningElement {
  view = 'unassigned';
  studies = [];
  searchTerm = '';
  _unsub;

  connectedCallback() {
    this._unsub = onStoreChange(() => { this.studies = getResearchStudies(); });
    this.studies = getResearchStudies();
  }
  disconnectedCallback() {
    this._unsub?.();
  }

  get views() { return VIEWS; }
  get currentViewLabel() { return VIEWS.find((v) => v.value === this.view)?.label; }
  get columns() { return COLUMNS[this.view]; }

  get filtered() {
    let rows = this.studies;
    if (this.view === 'unassigned') rows = rows.filter((s) => !s.assignedBdRep);
    else if (this.view === 'my') rows = rows.filter((s) => s.assignedBdRep === 'Jordan Reyes');
    if (this.searchTerm) {
      const t = this.searchTerm.toLowerCase();
      rows = rows.filter((s) => [s.name, s.sponsor, s.indication].some((x) => (x || '').toLowerCase().includes(t)));
    }
    return rows;
  }
  get metaText() {
    const n = this.filtered.length;
    return `${n} item${n !== 1 ? 's' : ''} • Sorted by ICP Score • Filtered by List View`;
  }

  handleViewChange(event) { this.view = event.detail.value; }
  handleSearch(event) { this.searchTerm = event.detail.value; }
  handleRowAction(event) {
    if (event.detail.action.name === 'view') navigate(`/research-studies/${event.detail.row.id}`);
  }
}
