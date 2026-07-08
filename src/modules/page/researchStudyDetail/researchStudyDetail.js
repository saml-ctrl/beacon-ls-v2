import { LightningElement } from 'lwc';
import { getCurrentRoute, navigate } from '../../../router';
import {
  onStoreChange,
  getResearchStudyById,
  getStudyLocations,
  getLeadsForStudy,
  getOpportunitiesForStudy,
  getContactById,
  consumeNavIntent,
} from 'data/store';
import { currency, yesNo, dateLabel } from 'data/format';
import ApproveAssignModal from 'ui/approveAssignModal';

export default class ResearchStudyDetail extends LightningElement {
  studyId;
  study;
  activeTab = 'details';
  _unsub;

  connectedCallback() {
    this.studyId = getCurrentRoute()?.params?.id;
    const intentTab = consumeNavIntent(this.studyId);
    if (intentTab) this.activeTab = intentTab;
    this._unsub = onStoreChange(() => this.load());
    this.load();
  }
  disconnectedCallback() {
    this._unsub?.();
  }
  load() {
    this.study = getResearchStudyById(this.studyId);
  }

  get hasStudy() { return !!this.study; }
  get studyName() { return this.study?.name; }

  get highlightFields() {
    const s = this.study;
    return [
      { label: 'Sponsor', value: s.sponsor },
      { label: 'Phase', value: s.phase },
      { label: 'Indication', value: s.indication },
      { label: 'ICP Score', value: s.icpScore },
      { label: 'Status', value: s.status },
    ];
  }

  /* ---- Details tab sections ---- */
  get studyInfoFields() {
    const s = this.study;
    return [
      { label: 'Study Name', value: s.name },
      { label: 'Citeline ID', value: s.citelineId },
      { label: 'ClinicalTrials.gov ID', value: s.ctGovId },
      { label: 'Indication', value: s.indication },
      { label: 'Phase', value: s.phase },
      { label: 'Therapeutic Area', value: s.therapeuticArea },
      { label: 'Enrollment Target', value: s.enrollmentTarget },
      { label: 'Planned Start', value: dateLabel(s.plannedStart) },
    ];
  }
  get sourcingFields() {
    const s = this.study;
    return [
      { label: 'Source', value: s.source },
      { label: 'Ingested Date', value: dateLabel(s.ingestedDate) },
      { label: 'ICP Flag', value: yesNo(s.icpFlag) },
      { label: 'ICP Score', value: s.icpScore },
      { label: 'Assigned BD Rep', value: s.assignedBdRep },
      { label: 'Approval Status', value: s.approvalStatus },
    ];
  }
  get systemFields() {
    return [
      { label: 'Created By', value: 'Integration User (MuleSoft)' },
      { label: 'Created Date', value: dateLabel(this.study.ingestedDate) },
      { label: 'Last Modified By', value: this.study.assignedBdRep || 'Priya Nadkarni' },
      { label: 'Record Type', value: 'Research Study' },
    ];
  }

  /* ---- Related lists ---- */
  get locationRecords() {
    return getStudyLocations(this.studyId).map((r) => ({ ...r, _linkPath: `/accounts/${r.siteAccountId}` }));
  }
  get locationColumns() {
    return [
      { label: 'Site', fieldName: 'siteName' },
      { label: 'City/State', fieldName: 'cityState' },
      { label: 'Principal Investigator', fieldName: 'principalInvestigator' },
      { label: 'Status', fieldName: 'status' },
    ];
  }

  get openLeadRecords() {
    return getLeadsForStudy(this.studyId)
      .filter((l) => !l.converted)
      .map((l) => ({ ...l, enrichedLabel: yesNo(l.enriched), _linkPath: `/leads/${l.id}` }));
  }
  get openLeadColumns() {
    return [
      { label: 'Name', fieldName: 'name' },
      { label: 'Title', fieldName: 'title' },
      { label: 'Site', fieldName: 'siteInstitution' },
      { label: 'Lead Status', fieldName: 'leadStatus' },
      { label: 'Enriched', fieldName: 'enrichedLabel' },
    ];
  }
  get convertedLeadRecords() {
    return getLeadsForStudy(this.studyId)
      .filter((l) => l.converted)
      .map((l) => ({
        ...l,
        convertedDateLabel: dateLabel(l.convertedDate),
        contactName: getContactById(l.convertedContactId)?.name || l.name,
        _linkPath: l.convertedContactId ? `/contacts/${l.convertedContactId}` : '',
      }));
  }
  get convertedLeadColumns() {
    return [
      { label: 'Name', fieldName: 'name' },
      { label: 'Title', fieldName: 'title' },
      { label: 'Converted Date', fieldName: 'convertedDateLabel' },
      { label: 'Contact', fieldName: 'contactName' },
    ];
  }

  get opportunityRecords() {
    return getOpportunitiesForStudy(this.studyId).map((o) => ({
      ...o,
      amountLabel: currency(o.amount),
      _linkPath: `/opportunities/${o.id}`,
    }));
  }
  get opportunityColumns() {
    return [
      { label: 'Opportunity Name', fieldName: 'name' },
      { label: 'Stage', fieldName: 'stage' },
      { label: 'Amount', fieldName: 'amountLabel' },
      { label: 'Owner', fieldName: 'owner' },
    ];
  }

  get kolsViewAllPath() { return '/leads'; }

  async handleApproveAssign() {
    await ApproveAssignModal.open({ size: 'medium', label: 'Approve & Assign', studyId: this.studyId });
  }

  handleTabActive(event) {
    this.activeTab = event.target.value;
  }

  handleBack() {
    navigate('/research-studies');
  }
}
