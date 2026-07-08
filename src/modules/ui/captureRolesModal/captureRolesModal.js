import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import Toast from 'lightning/toast';
import { getOpportunityById, captureKeyRoles } from 'data/store';
import { currency, dateLabel } from 'data/format';

const STEPS = ['Onboarding Recipient', 'Key Project Roles', 'Exhibit & Cost'];

/**
 * Capture Key Project Roles (Opportunity, at Closed Won). Closed Won itself
 * auto-sends the Onboarding Form and creates the Asana handoff; this flow
 * captures the roles kickoff needs. All four roles are required to complete
 * kickoff; a blank recipient instead creates an "Assign onboarding recipient" task.
 */
export default class CaptureRolesModal extends LightningModal {
  @api oppId;
  step = 0;
  opp = {};
  onboardingFormRecipient = '';
  billingContact = '';
  productOwner = '';
  executiveSponsor = '';
  endUsers = '';
  exhibitLetter = 'Exhibit A';
  projectName = '';
  rolesError = false;

  connectedCallback() {
    const o = getOpportunityById(this.oppId) || {};
    this.opp = o;
    this.onboardingFormRecipient = o.onboardingFormRecipient || 'Dana Whitfield';
    this.projectName = o.projectName || (o.name ? `${o.name.split(' — ')[0]} Program` : '');
    this.billingContact = o.billingContact || '';
    this.productOwner = o.productOwner || '';
    this.executiveSponsor = o.executiveSponsor || '';
    this.endUsers = o.endUsers || '';
    this.exhibitLetter = o.exhibitLetter || 'Exhibit A';
  }

  get steps() { return STEPS; }
  get isStep0() { return this.step === 0; }
  get isStep1() { return this.step === 1; }
  get isStep2() { return this.step === 2; }
  get isFirst() { return this.step === 0; }
  get isLast() { return this.step === STEPS.length - 1; }
  get nextLabel() { return this.isLast ? 'Finish' : 'Next'; }
  get rolesComplete() { return this.billingContact && this.productOwner && this.executiveSponsor && this.endUsers; }

  get costFields() {
    const o = this.opp;
    return [
      { label: 'Amount', value: currency(o.amount) },
      { label: 'Total Hours', value: o.totalHours },
      { label: 'Credited Hours', value: o.creditedHours },
      { label: 'Hourly Rate', value: currency(o.hourlyRate) },
      { label: 'Weeks', value: o.weeks },
      { label: 'Upfront Payment', value: currency(o.upfrontPayment) },
      { label: 'Net Terms', value: o.netTerms },
      { label: 'MSA Executed Date', value: dateLabel(o.msaExecutedDate) },
    ];
  }

  handleRecipient(e) { this.onboardingFormRecipient = e.detail.value; }
  handleBilling(e) { this.billingContact = e.detail.value; if (this.rolesComplete) this.rolesError = false; }
  handleProductOwner(e) { this.productOwner = e.detail.value; if (this.rolesComplete) this.rolesError = false; }
  handleExecSponsor(e) { this.executiveSponsor = e.detail.value; if (this.rolesComplete) this.rolesError = false; }
  handleEndUsers(e) { this.endUsers = e.detail.value; if (this.rolesComplete) this.rolesError = false; }
  handleExhibit(e) { this.exhibitLetter = e.detail.value; }
  handleProject(e) { this.projectName = e.detail.value; }

  handleBack() { if (this.step > 0) this.step -= 1; }
  handleNext() {
    if (this.step === 1 && !this.rolesComplete) { this.rolesError = true; return; }
    if (this.isLast) { this.finish(); return; }
    this.step += 1;
  }
  finish() {
    captureKeyRoles(this.oppId, {
      onboardingFormRecipient: this.onboardingFormRecipient,
      billingContact: this.billingContact,
      productOwner: this.productOwner,
      executiveSponsor: this.executiveSponsor,
      endUsers: this.endUsers,
      exhibitLetter: this.exhibitLetter,
      projectName: this.projectName,
    });
    Toast.show({ label: 'Key Project Roles captured', message: 'Onboarding kickoff roles saved on the Opportunity.', variant: 'success' }, this);
    this.close('captured');
  }
  handleCancel() { this.close('cancel'); }
}
