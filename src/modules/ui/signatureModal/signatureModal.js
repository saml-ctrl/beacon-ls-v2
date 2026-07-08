import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import Toast from 'lightning/toast';
import { getContractById, sendContractForSignature } from 'data/store';

const STEPS = ['Select Document', 'Recipients', 'Review & Send'];
const DOC_OPTIONS = [
  { label: 'MSA & SOW — executed bundle (PDF)', value: 'msa-sow' },
  { label: 'Statement of Work only (PDF)', value: 'sow' },
  { label: 'Change Order Exhibit (PDF)', value: 'exhibit' },
];

/**
 * Send for Signature (Sales Contract). Routes the document through the standard
 * Adobe Acrobat Sign managed package — no custom Adobe configuration. On Finish
 * the contract status moves to Sent; a demo-chrome "Simulate Sponsor Action"
 * control on the record then advances Sent → Viewed → Signed.
 */
export default class SignatureModal extends LightningModal {
  @api contractId;
  step = 0;
  contract = {};
  document = 'msa-sow';
  recipient = '';

  connectedCallback() {
    this.contract = getContractById(this.contractId) || {};
    this.recipient = 'Dr. Cynthia Brandt — VP, Clinical Development (Sponsor Signer)';
  }

  get steps() { return STEPS; }
  get docOptions() { return DOC_OPTIONS; }
  get isStep0() { return this.step === 0; }
  get isStep1() { return this.step === 1; }
  get isStep2() { return this.step === 2; }
  get isFirst() { return this.step === 0; }
  get isLast() { return this.step === STEPS.length - 1; }
  get nextLabel() { return this.isLast ? 'Send' : 'Next'; }

  handleDoc(e) { this.document = e.detail.value; }
  handleRecipient(e) { this.recipient = e.detail.value; }
  handleBack() { if (this.step > 0) this.step -= 1; }
  handleNext() {
    if (this.isLast) { this.finish(); return; }
    this.step += 1;
  }
  finish() {
    sendContractForSignature(this.contractId);
    Toast.show(
      { label: 'Sent for signature', message: `${this.contract.name} routed via Adobe Acrobat Sign. Status is now Sent.`, variant: 'success' },
      this
    );
    this.close('sent');
  }
  handleCancel() { this.close('cancel'); }
}
