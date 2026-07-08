import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import Toast from 'lightning/toast';
import { getLeadById, enrichLead } from 'data/store';

/**
 * Enrich with Clay — a managed-package quick action. Single confirm screen,
 * on-demand only (never bulk). Populates Email, Phone, and LinkedIn and sets
 * the Enriched flag with an Enrichment Date.
 */
export default class EnrichModal extends LightningModal {
  @api leadId;
  lead = {};

  connectedCallback() {
    this.lead = getLeadById(this.leadId) || {};
  }
  handleCancel() { this.close('cancel'); }
  handleConfirm() {
    enrichLead(this.leadId);
    Toast.show(
      { label: 'Enriched with Clay', message: `${this.lead.name} enriched — Email, Phone, and LinkedIn populated with provenance.`, variant: 'success' },
      this
    );
    this.close('enriched');
  }
}
