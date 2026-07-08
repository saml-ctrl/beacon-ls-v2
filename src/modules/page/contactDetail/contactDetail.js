import { LightningElement } from 'lwc';
import { getCurrentRoute, navigate } from '../../../router';
import {
  onStoreChange,
  getContactById,
  getAcrsForContact,
  getContactOppRoles,
  getOpportunityById,
  getEngagementHistory,
  consumeNavIntent,
} from 'data/store';
import { yesNo, dateLabel } from 'data/format';

export default class ContactDetail extends LightningElement {
  contactId;
  contact;
  activeTab = 'details';
  _unsub;

  connectedCallback() {
    this.contactId = getCurrentRoute()?.params?.id;
    const t = consumeNavIntent(this.contactId);
    if (t) this.activeTab = t;
    this._unsub = onStoreChange(() => this.load());
    this.load();
  }
  disconnectedCallback() { this._unsub?.(); }
  load() { this.contact = getContactById(this.contactId); }

  get hasContact() { return !!this.contact; }
  get contactName() { return this.contact?.name; }

  get highlightFields() {
    const c = this.contact;
    return [
      { label: 'Title', value: c.title },
      { label: 'Account', value: c.accountName },
      { label: 'Specialty', value: c.specialty },
      { label: 'Email', value: c.email, type: 'email' },
    ];
  }
  get contactInfoFields() {
    const c = this.contact;
    return [
      { label: 'Name', value: c.name },
      { label: 'Title', value: c.title },
      { label: 'Account', value: c.accountName },
      { label: 'Email', value: c.email, type: 'email' },
      { label: 'Phone', value: c.phone },
    ];
  }
  get professionalFields() {
    const c = this.contact;
    return [
      { label: 'Specialty', value: c.specialty },
      { label: 'Role', value: c.role },
      { label: 'Publications', value: c.publications, isLong: true, fullWidth: true },
    ];
  }
  get systemFields() {
    return [
      { label: 'Created By', value: 'Jordan Reyes' },
      { label: 'Last Modified By', value: 'Jordan Reyes' },
      { label: 'Record Type', value: 'KOL Contact' },
      { label: 'Last Engagement', value: dateLabel(this.contact.lastEngagement) },
    ];
  }

  get acrRecords() {
    return getAcrsForContact(this.contactId).map((r) => ({
      ...r,
      primaryLabel: yesNo(r.primary),
      _linkPath: `/accounts/${r.accountId}`,
    }));
  }
  get acrColumns() {
    return [
      { label: 'Account', fieldName: 'accountName' },
      { label: 'Record Type', fieldName: 'recordType' },
      { label: 'Relationship Role', fieldName: 'relationshipRole' },
      { label: 'Primary', fieldName: 'primaryLabel' },
    ];
  }
  get oppRoleRecords() {
    return getContactOppRoles(this.contactId).map((r) => {
      const o = getOpportunityById(r.opportunityId);
      return {
        ...r,
        opportunityName: o?.name || r.opportunityId,
        stage: o?.stage || '',
        primaryLabel: yesNo(r.primary),
        _linkPath: `/opportunities/${r.opportunityId}`,
      };
    });
  }
  get oppRoleColumns() {
    return [
      { label: 'Opportunity', fieldName: 'opportunityName' },
      { label: 'Role', fieldName: 'role' },
      { label: 'Stage', fieldName: 'stage' },
      { label: 'Primary', fieldName: 'primaryLabel' },
    ];
  }
  get engagementRecords() {
    return getEngagementHistory(this.contactId).map((e) => ({ ...e, dateLabel: dateLabel(e.date) }));
  }
  get engagementColumns() {
    return [
      { label: 'Activity Type', fieldName: 'activityType' },
      { label: 'Campaign/Asset', fieldName: 'campaignAsset' },
      { label: 'Date', fieldName: 'dateLabel' },
      { label: 'Detail', fieldName: 'detail' },
    ];
  }

  handleTabActive(e) { this.activeTab = e.target.value; }
  handleBack() { navigate('/contacts'); }
}
