import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import Toast from 'lightning/toast';
import { navigate } from '../../../router';
import { getOpportunityById, logScheduleExtension } from 'data/store';
import { currency } from 'data/format';

const STEPS = ['Extension Details', 'Line Items', 'Review'];
const LINE_OPTIONS = [
  { key: 'clinops', productId: 'prod-clinops', productName: 'Clinical Operations Support', quantity: 3, salesPrice: 18500 },
  { key: 'scipm', productId: 'prod-scipm', productName: 'Scientific PM (Monthly Retainer)', quantity: 2, salesPrice: 12500 },
];

/**
 * Log Schedule Extension Notification (Closed Won Opportunity). Extension Days
 * of 45 is past the 30-day SOW trigger, so Finish creates a Change Order
 * Opportunity (Change Order record type) linked to the parent and Exhibit A,
 * with time-based line items only, then navigates to it.
 */
export default class ExtensionModal extends LightningModal {
  @api oppId;
  step = 0;
  opp = {};
  extensionDays = 45;
  notificationDate = '';
  selClinops = true;
  selScipm = true;

  connectedCallback() {
    this.opp = getOpportunityById(this.oppId) || {};
    this.notificationDate = new Date().toISOString().slice(0, 10);
  }

  get steps() { return STEPS; }
  get isStep0() { return this.step === 0; }
  get isStep1() { return this.step === 1; }
  get isStep2() { return this.step === 2; }
  get isFirst() { return this.step === 0; }
  get isLast() { return this.step === STEPS.length - 1; }
  get nextLabel() { return this.isLast ? 'Finish' : 'Next'; }

  get selectedLines() {
    return LINE_OPTIONS.filter((l) => (l.key === 'clinops' ? this.selClinops : this.selScipm));
  }
  get reviewItems() {
    return [
      { key: 'parent', label: 'Parent Opportunity', value: this.opp.name },
      { key: 'days', label: 'Extension Days', value: `${this.extensionDays} (past the 30-day SOW trigger)` },
      { key: 'exhibit', label: 'New Change Order', value: 'Change Order record type · Exhibit A · linked to parent' },
      { key: 'lines', label: 'Time-based Lines', value: this.selectedLines.map((l) => `${l.productName} ×${l.quantity}`).join(', ') || 'None selected' },
    ];
  }

  handleDays(e) { this.extensionDays = e.detail.value; }
  handleDate(e) { this.notificationDate = e.detail.value; }
  handleClinops(e) { this.selClinops = e.target.checked; }
  handleScipm(e) { this.selScipm = e.target.checked; }
  handleBack() { if (this.step > 0) this.step -= 1; }
  handleNext() {
    if (this.isLast) { this.finish(); return; }
    this.step += 1;
  }
  finish() {
    const co = logScheduleExtension(this.oppId, {
      extensionDays: Number(this.extensionDays),
      exhibitLetter: 'Exhibit A',
      lineItems: this.selectedLines.map((l) => ({ productId: l.productId, productName: l.productName, quantity: l.quantity, salesPrice: l.salesPrice })),
    });
    Toast.show({ label: 'Change Order created', message: `A Change Order Opportunity was created from the Schedule Extension Notification.`, variant: 'success' }, this);
    this.close('logged');
    if (co) navigate(`/opportunities/${co.id}`);
  }
  handleCancel() { this.close('cancel'); }

  get lineTotalClinops() { return currency(3 * 18500); }
  get lineTotalScipm() { return currency(2 * 12500); }
}
