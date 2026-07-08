import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import Toast from 'lightning/toast';
import { navigate } from '../../../router';
import { getLeadById, convertLead } from 'data/store';

const STEPS = ['Duplicate Check', 'Record Details', 'Review & Convert'];

/**
 * Convert (Lead KOL) guided action. On-demand only — conversion is never
 * triggered by a stage. The single flow creates/links Account + Contact +
 * Opportunity + Research Study link + Opportunity Contact Roles + Opportunity
 * Sites. Close Date is seeded blank so the presenter hits a real validation
 * error, fills it, and proceeds.
 */
export default class ConvertModal extends LightningModal {
  @api leadId;
  step = 0;
  lead = {};
  dupChoice = 'existing';
  accountName = '';
  opportunityName = '';
  closeDate = '';
  closeDateError = false;

  connectedCallback() {
    this.lead = getLeadById(this.leadId) || {};
    this.accountName = this.lead.siteInstitution || '';
    this.opportunityName = `${this.lead.studyName || 'New Study'} — EEG Services`;
  }

  get steps() { return STEPS; }
  get isStep0() { return this.step === 0; }
  get isStep1() { return this.step === 1; }
  get isStep2() { return this.step === 2; }
  get isFirst() { return this.step === 0; }
  get isLast() { return this.step === STEPS.length - 1; }
  get nextLabel() { return this.isLast ? 'Finish' : 'Next'; }

  get dupOptions() {
    return [
      { label: `Use existing — ${this.lead.siteInstitution} (Account) & ${this.lead.name} (Contact)`, value: 'existing' },
      { label: 'Create new records', value: 'new' },
    ];
  }
  get reviewItems() {
    return [
      { key: 'opp', label: 'Opportunity', value: this.opportunityName },
      { key: 'study', label: 'Research Study link', value: this.lead.studyName },
      { key: 'acct', label: 'Account', value: `${this.accountName} (Clinical Site)` },
      { key: 'contact', label: 'KOL Contact', value: this.lead.name },
      { key: 'ocr', label: 'Opportunity Contact Role', value: `${this.lead.name} — Principal Investigator (Primary)` },
      { key: 'sites', label: 'Opportunity Sites', value: 'Engaged + Non-Engaged Clinical Sites carried onto the Opportunity' },
      { key: 'close', label: 'Close Date', value: this.closeDate || '(required)' },
    ];
  }

  handleDup(e) { this.dupChoice = e.detail.value; }
  handleAccount(e) { this.accountName = e.detail.value; }
  handleOppName(e) { this.opportunityName = e.detail.value; }
  handleCloseDate(e) {
    this.closeDate = e.detail.value;
    if (this.closeDate) this.closeDateError = false;
  }

  handleBack() { if (this.step > 0) this.step -= 1; }
  handleNext() {
    if (this.step === 1 && !this.closeDate) {
      this.closeDateError = true;
      return;
    }
    if (this.isLast) { this.finish(); return; }
    this.step += 1;
  }
  finish() {
    const opp = convertLead(this.leadId, { closeDate: this.closeDate, opportunityName: this.opportunityName });
    Toast.show(
      { label: 'Lead converted', message: `${this.lead.name} converted. Opportunity ${this.opportunityName} is ready.`, variant: 'success' },
      this
    );
    this.close('converted');
    if (opp) navigate(`/opportunities/${opp.id}`);
  }
  handleCancel() { this.close('cancel'); }
}
