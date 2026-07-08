import { LightningElement } from 'lwc';
import { getCurrentRoute, navigate } from '../../../router';
import {
  onStoreChange,
  getLeadById,
  getEngagementHistory,
  getCampaignHistory,
  getTasksForRecord,
  consumeNavIntent,
} from 'data/store';
import { yesNo, dateLabel } from 'data/format';
import ConvertModal from 'ui/convertModal';
import EnrichModal from 'ui/enrichModal';

export default class LeadDetail extends LightningElement {
  leadId;
  lead;
  activeTab = 'details';
  _unsub;

  connectedCallback() {
    this.leadId = getCurrentRoute()?.params?.id;
    const t = consumeNavIntent(this.leadId);
    if (t) this.activeTab = t;
    this._unsub = onStoreChange(() => this.load());
    this.load();
  }
  disconnectedCallback() { this._unsub?.(); }
  load() { this.lead = getLeadById(this.leadId); }

  get hasLead() { return !!this.lead; }
  get leadName() { return this.lead?.name; }

  get highlightFields() {
    const l = this.lead;
    return [
      { label: 'Title', value: l.title },
      { label: 'Site/Institution', value: l.siteInstitution },
      { label: 'Research Study', value: l.studyName },
      { label: 'Lead Status', value: l.leadStatus },
    ];
  }

  get kolInfoFields() {
    const l = this.lead;
    return [
      { label: 'Name', value: l.name },
      { label: 'Title', value: l.title },
      { label: 'Specialty', value: l.specialty },
      { label: 'Site/Institution', value: l.siteInstitution },
      { label: 'Research Study', value: l.studyName },
    ];
  }
  get contactFields() {
    const l = this.lead;
    return [
      { label: 'Email', value: l.email, type: 'email' },
      { label: 'Phone', value: l.phone },
      { label: 'LinkedIn (Clay)', value: l.linkedin },
      { label: 'Enriched', value: yesNo(l.enriched) },
      { label: 'Enrichment Date', value: dateLabel(l.enrichmentDate) },
    ];
  }
  get statusFields() {
    const l = this.lead;
    return [
      { label: 'Lead Status', value: l.leadStatus },
      { label: 'Lead Source', value: l.leadSource },
      { label: 'Owner', value: l.owner },
    ];
  }

  get engagementRecords() {
    return getEngagementHistory(this.leadId).map((e) => ({ ...e, dateLabel: dateLabel(e.date) }));
  }
  get engagementColumns() {
    return [
      { label: 'Activity Type', fieldName: 'activityType' },
      { label: 'Campaign/Asset', fieldName: 'campaignAsset' },
      { label: 'Date', fieldName: 'dateLabel' },
      { label: 'Detail', fieldName: 'detail' },
    ];
  }
  get campaignRecords() {
    return getCampaignHistory(this.leadId).map((c) => ({ ...c, memberSinceLabel: dateLabel(c.memberSince) }));
  }
  get campaignColumns() {
    return [
      { label: 'Campaign', fieldName: 'campaign' },
      { label: 'Status', fieldName: 'status' },
      { label: 'Member Since', fieldName: 'memberSinceLabel' },
    ];
  }
  get activityItems() {
    return getTasksForRecord(this.leadId).map((t) => ({ ...t, date: dateLabel(t.dueDate), iconName: 'standard:task' }));
  }

  get isConverted() { return !!this.lead?.converted; }
  get convertDisabled() { return this.isConverted; }

  async handleConvert() {
    await ConvertModal.open({ size: 'medium', label: 'Convert Lead', leadId: this.leadId });
  }
  async handleEnrich() {
    await EnrichModal.open({ size: 'small', label: 'Enrich with Clay', leadId: this.leadId });
  }
  handleTabActive(e) { this.activeTab = e.target.value; }
  handleBack() { navigate('/leads'); }
}
