import { LightningElement } from 'lwc';
import { getCurrentRoute, navigate } from '../../../router';
import {
  onStoreChange,
  getAccountById,
  getOpportunitiesForAccount,
  getStudiesForAccount,
  getContactsForAccount,
  getAcrsForAccount,
  getLocationsForSite,
  getResearchStudyById,
  getOppSitesForAccount,
  getAssetsForAccount,
  getOpenOpportunityCount,
  getActiveStudyCount,
  getContactById,
  getOpportunityById,
  consumeNavIntent,
} from 'data/store';
import { currency, yesNo, dateLabel } from 'data/format';

export default class AccountDetail extends LightningElement {
  accountId;
  account;
  activeTab = 'details';
  _unsub;

  connectedCallback() {
    this.accountId = getCurrentRoute()?.params?.id;
    const t = consumeNavIntent(this.accountId);
    if (t) this.activeTab = t;
    this._unsub = onStoreChange(() => this.load());
    this.load();
  }
  disconnectedCallback() { this._unsub?.(); }
  load() { this.account = getAccountById(this.accountId); }

  get hasAccount() { return !!this.account; }
  get accountName() { return this.account?.name; }
  get isOrganization() { return this.account?.recordType === 'Organization'; }
  get isClinicalSite() { return this.account?.recordType === 'Clinical Site'; }
  get objectLabel() { return this.isOrganization ? 'Account · Organization (Sponsor)' : 'Account · Clinical Site'; }

  get highlightFields() {
    const a = this.account;
    if (this.isOrganization) {
      return [
        { label: 'Tier', value: a.tier },
        { label: 'Industry Focus', value: a.industryFocus },
        { label: 'Open Opportunities', value: getOpenOpportunityCount(a.id) },
        { label: 'Owner', value: a.owner },
      ];
    }
    return [
      { label: 'City/State', value: a.cityState },
      { label: 'Primary PI', value: a.primaryPI },
      { label: 'Active Studies', value: getActiveStudyCount(a.id) },
    ];
  }

  /* ---- Organization sections ---- */
  get orgInfoFields() {
    const a = this.account;
    return [
      { label: 'Account Name', value: a.name },
      { label: 'Record Type', value: a.recordType },
      { label: 'Industry Focus', value: a.industryFocus },
      { label: 'Owner', value: a.owner },
    ];
  }
  get companyProfileFields() {
    const a = this.account;
    return [
      { label: 'Tier', value: a.tier },
      { label: 'Market Cap Band', value: a.marketCapBand },
      { label: 'Therapeutic Focus', value: a.therapeuticFocus },
    ];
  }

  /* ---- Clinical Site sections ---- */
  get siteInfoFields() {
    const a = this.account;
    return [
      { label: 'Account Name', value: a.name },
      { label: 'Address', value: a.address, fullWidth: true },
      { label: 'Site Type', value: a.siteType },
      { label: 'Primary PI', value: a.primaryPI },
    ];
  }
  get siteParticipationFields() {
    const a = this.account;
    return [
      { label: 'Active Studies', value: getActiveStudyCount(a.id) },
      { label: 'City/State', value: a.cityState },
    ];
  }

  /* ---- Organization: Opportunities (open + closed won) ---- */
  get openOppRecords() {
    return getOpportunitiesForAccount(this.accountId)
      .filter((o) => !o.stage.startsWith('Closed'))
      .map((o) => ({ ...o, amountLabel: currency(o.amount), closeDateLabel: dateLabel(o.closeDate), _linkPath: `/opportunities/${o.id}` }));
  }
  get openOppColumns() {
    return [
      { label: 'Name', fieldName: 'name' },
      { label: 'Stage', fieldName: 'stage' },
      { label: 'Amount', fieldName: 'amountLabel' },
      { label: 'Close Date', fieldName: 'closeDateLabel' },
      { label: 'Owner', fieldName: 'owner' },
    ];
  }
  get wonOppRecords() {
    return getOpportunitiesForAccount(this.accountId)
      .filter((o) => o.stage === 'Closed Won')
      .map((o) => ({ ...o, amountLabel: currency(o.amount), msaExecutedDateLabel: dateLabel(o.msaExecutedDate), _linkPath: `/opportunities/${o.id}` }));
  }
  get wonOppColumns() {
    return [
      { label: 'Name', fieldName: 'name' },
      { label: 'Amount', fieldName: 'amountLabel' },
      { label: 'MSA Executed Date', fieldName: 'msaExecutedDateLabel' },
      { label: 'Exhibit Letter', fieldName: 'exhibitLetter' },
    ];
  }

  get studyRecords() {
    return getStudiesForAccount(this.accountId).map((s) => ({ ...s, _linkPath: `/research-studies/${s.id}` }));
  }
  get studyColumns() {
    return [
      { label: 'Study Name', fieldName: 'name' },
      { label: 'Indication', fieldName: 'indication' },
      { label: 'Phase', fieldName: 'phase' },
      { label: 'ICP Score', fieldName: 'icpScore' },
      { label: 'Status', fieldName: 'status' },
    ];
  }

  get contactRecords() {
    return getContactsForAccount(this.accountId).map((c) => ({ ...c, _linkPath: `/contacts/${c.id}` }));
  }
  get contactColumns() {
    return [
      { label: 'Name', fieldName: 'name' },
      { label: 'Title', fieldName: 'title' },
      { label: 'Email', fieldName: 'email' },
    ];
  }
  get acrRecords() {
    return getAcrsForAccount(this.accountId).map((r) => {
      const c = getContactById(r.contactId) || {};
      return { ...r, contactName: c.name || r.contactId, primaryLabel: yesNo(r.primary), _linkPath: `/contacts/${r.contactId}` };
    });
  }
  get acrColumns() {
    return [
      { label: 'Contact', fieldName: 'contactName' },
      { label: 'Role', fieldName: 'relationshipRole' },
      { label: 'Primary', fieldName: 'primaryLabel' },
    ];
  }
  get acrPeopleRecords() {
    return getAcrsForAccount(this.accountId).map((r) => {
      const c = getContactById(r.contactId) || {};
      return { ...r, contactName: c.name || r.contactId, title: c.title || '', _linkPath: `/contacts/${r.contactId}` };
    });
  }
  get acrPeopleColumns() {
    return [
      { label: 'Contact', fieldName: 'contactName' },
      { label: 'Role', fieldName: 'relationshipRole' },
      { label: 'Title', fieldName: 'title' },
    ];
  }

  /* ---- Clinical Site: Studies (Research Study Locations) ---- */
  get siteStudyRecords() {
    return getLocationsForSite(this.accountId).map((loc) => {
      const s = getResearchStudyById(loc.studyId) || {};
      return {
        ...loc,
        studyName: s.name || loc.studyId,
        sponsor: s.sponsor || '',
        phase: s.phase || '',
        _linkPath: `/research-studies/${loc.studyId}`,
      };
    });
  }
  get siteStudyColumns() {
    return [
      { label: 'Study', fieldName: 'studyName' },
      { label: 'Sponsor', fieldName: 'sponsor' },
      { label: 'Phase', fieldName: 'phase' },
      { label: 'Status', fieldName: 'status' },
    ];
  }

  /* ---- Clinical Site: Opportunity Involvement (Opportunity Sites) ---- */
  get oppSiteRecords() {
    return getOppSitesForAccount(this.accountId).map((os) => {
      const o = getOpportunityById(os.opportunityId) || {};
      return { ...os, opportunityName: o.name || os.opportunityId, stage: o.stage || '', _linkPath: `/opportunities/${os.opportunityId}` };
    });
  }
  get oppSiteColumns() {
    return [
      { label: 'Opportunity', fieldName: 'opportunityName' },
      { label: 'Stage', fieldName: 'stage' },
      { label: 'Engagement Status', fieldName: 'engagementStatus' },
    ];
  }

  /* ---- Clinical Site: Devices (Deployed Wavebands) ---- */
  get deviceRecords() {
    return getAssetsForAccount(this.accountId)
      .filter((a) => a.status === 'Deployed')
      .map((a) => ({ ...a, _linkPath: `/assets/${a.id}` }));
  }
  get deviceColumns() {
    return [
      { label: 'Asset Name', fieldName: 'name' },
      { label: 'Serial Number', fieldName: 'serialNumber' },
      { label: 'Status', fieldName: 'status' },
      { label: 'Product', fieldName: 'productName' },
    ];
  }

  handleTabActive(e) { this.activeTab = e.target.value; }
  handleBack() { navigate('/accounts'); }
}
