import { LightningElement } from 'lwc';
import { getCurrentRoute, navigate } from '../../../router';
import {
  onStoreChange,
  getContractById,
  getFilesForContract,
  getFieldHistory,
  simulateSponsorAction,
  consumeNavIntent,
} from 'data/store';
import { dateLabel } from 'data/format';
import SignatureModal from 'ui/signatureModal';

export default class ContractDetail extends LightningElement {
  contractId;
  contract;
  activeTab = 'details';
  _unsub;

  connectedCallback() {
    this.contractId = getCurrentRoute()?.params?.id;
    const t = consumeNavIntent(this.contractId);
    if (t) this.activeTab = t;
    this._unsub = onStoreChange(() => this.load());
    this.load();
  }
  disconnectedCallback() { this._unsub?.(); }
  load() { this.contract = getContractById(this.contractId); }

  get hasContract() { return !!this.contract; }
  get contractName() { return this.contract?.name; }

  get highlightFields() {
    const c = this.contract;
    return [
      { label: 'Opportunity', value: c.opportunityName },
      { label: 'Type', value: c.type },
      { label: 'Status', value: c.status },
      { label: 'Signed Date', value: dateLabel(c.signedDate) },
    ];
  }
  get contractInfoFields() {
    const c = this.contract;
    return [
      { label: 'Contract Name', value: c.name },
      { label: 'Type', value: c.type },
      { label: 'Status', value: c.status },
      { label: 'Sent Date', value: dateLabel(c.sentDate) },
      { label: 'Viewed Date', value: dateLabel(c.viewedDate) },
      { label: 'Signed Date', value: dateLabel(c.signedDate) },
      { label: 'Adobe Sign Agreement ID', value: c.adobeSignAgreementId },
      { label: 'Terms', value: c.terms, fullWidth: true },
    ];
  }

  get fileRecords() {
    return getFilesForContract(this.contractId).map((f) => ({ ...f, uploadedDateLabel: dateLabel(f.uploadedDate) }));
  }
  get fileColumns() {
    return [
      { label: 'Name', fieldName: 'name' },
      { label: 'Type', fieldName: 'type' },
      { label: 'Uploaded Date', fieldName: 'uploadedDateLabel' },
    ];
  }
  get historyRecords() {
    return getFieldHistory(this.contractId).map((h) => ({ ...h, dateLabel: dateLabel(h.date) }));
  }
  get historyColumns() {
    return [
      { label: 'Date', fieldName: 'dateLabel' },
      { label: 'Field', fieldName: 'field' },
      { label: 'Original Value', fieldName: 'originalValue' },
      { label: 'New Value', fieldName: 'newValue' },
      { label: 'Changed By', fieldName: 'changedBy' },
    ];
  }

  get canSend() { return this.contract?.status === 'Draft'; }
  get canSimulate() { return this.contract?.status === 'Sent' || this.contract?.status === 'Viewed'; }
  get simulateHint() {
    return this.contract?.status === 'Sent'
      ? 'Sponsor opens the envelope (Sent → Viewed)'
      : 'Sponsor signs the agreement (Viewed → Signed)';
  }

  async handleSend() {
    await SignatureModal.open({ size: 'medium', label: 'Send for Signature', contractId: this.contractId });
  }
  handleSimulate() {
    simulateSponsorAction(this.contractId);
  }
  handleTabActive(e) { this.activeTab = e.target.value; }
  handleBack() { navigate('/sales-contracts'); }
}
