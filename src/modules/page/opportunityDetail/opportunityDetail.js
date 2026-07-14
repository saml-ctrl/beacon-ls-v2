import { LightningElement } from 'lwc';
import { getCurrentRoute, navigate, subscribe } from '../../../router';
import Toast from 'lightning/toast';
import {
  onStoreChange,
  getOpportunityById,
  getOppLineItems,
  getAssetById,
  getQuotesForOpp,
  getOppSites,
  getOppContactRoles,
  getContractsForOpp,
  getFieldHistory,
  getOppTeam,
  getTasksForRecord,
  getUsers,
  updateLineItem,
  addOppTeamMember,
  removeOppTeamMember,
  advanceStage,
  setAwardLetter,
  captureKeyRoles,
  simulateAsanaStatus,
  consumeNavIntent,
  SALES_STAGES,
  CHANGE_ORDER_STAGES,
} from 'data/store';
import { currency, yesNo, dateLabel } from 'data/format';
import CaptureRolesModal from 'ui/captureRolesModal';
import ExtensionModal from 'ui/extensionModal';

const TEAM_ROLES = ['BD', 'Program Management', 'Medical Director', 'Scientific', 'Engineering', 'ClinOps'];

export default class OpportunityDetail extends LightningElement {
  oppId;
  opp;
  activeTab = 'details';
  productDraftValues = [];
  newTeamUser = '';
  newTeamRole = 'ClinOps';
  _unsub;

  connectedCallback() {
    this.oppId = getCurrentRoute()?.params?.id;
    const t = consumeNavIntent(this.oppId);
    if (t) this.activeTab = t;
    this._unsub = onStoreChange(() => this.load());
    // Record→record navigation reuses this same component (LWC won't re-run
    // connectedCallback), so react to route changes to refresh the record.
    this._routeUnsub = subscribe((route) => {
      const newId = route && route.params && route.params.id;
      if (route && route.component === 'page-opportunity-detail' && newId && newId !== this.oppId) {
        this.oppId = newId;
        const nt = consumeNavIntent(newId);
        this.activeTab = nt || 'details';
        this.load();
      }
    });
    this.load();
  }
  disconnectedCallback() { this._unsub?.(); this._routeUnsub?.(); }
  load() { this.opp = getOpportunityById(this.oppId); }

  get hasOpp() { return !!this.opp; }
  get oppName() { return this.opp?.name; }
  get isSales() { return this.opp?.recordType === 'Sales'; }
  get isChangeOrder() { return this.opp?.recordType === 'Change Order'; }
  get objectLabel() { return this.isChangeOrder ? 'Opportunity · Change Order' : 'Opportunity'; }

  /* ---- Highlights ---- */
  get highlightFields() {
    const o = this.opp;
    const base = [
      { label: 'Account', value: o.accountName },
      { label: 'Stage', value: o.stage },
      { label: 'Amount', value: currency(o.amount) },
      { label: 'Close Date', value: dateLabel(o.closeDate) },
      { label: 'Forecast Category', value: o.forecastCategory },
    ];
    if (this.isChangeOrder) {
      return [
        { label: 'Account', value: o.accountName },
        { label: 'Stage', value: o.stage },
        { label: 'Amount', value: currency(o.amount) },
        { label: 'Parent Opportunity', value: this.parentName },
        { label: 'Exhibit', value: o.exhibitLetter },
      ];
    }
    return base;
  }
  get parentName() {
    const p = this.opp?.parentOpportunityId ? getOpportunityById(this.opp.parentOpportunityId) : null;
    return p?.name || '';
  }

  /* ---- Path ---- */
  get pathStages() { return this.isChangeOrder ? CHANGE_ORDER_STAGES : SALES_STAGES; }
  get guidanceMap() {
    const o = this.opp;
    if (this.isChangeOrder) {
      return {
        Identified: { guidance: 'Renewal / extension identified from the parent SOW.', keyFields: [{ label: 'Parent Opportunity', value: this.parentName }] },
        Scoped: { guidance: 'Extension days and time-based lines scoped for the Change Order.', keyFields: [{ label: 'Extension Days', value: o.extensionDays }] },
        Contracting: { guidance: 'Change Order exhibit routed for signature.', keyFields: [{ label: 'Exhibit Letter', value: o.exhibitLetter }] },
        'Closed Won': { guidance: 'Change Order executed; schedule extended.', keyFields: [{ label: 'Contract Status', value: o.contractStatus }] },
      };
    }
    return {
      Triage: { guidance: 'New inbound study. Confirm ICP fit before investing rep time.', keyFields: [{ label: 'Forecast Category', value: o.forecastCategory }] },
      Awareness: { guidance: 'Sponsor is aware of Beacon; establish the EEG value proposition.', keyFields: [{ label: 'Research Study', value: o.studyName }] },
      Nurture: { guidance: 'Multi-thread the account; engage KOLs and build champions.', keyFields: [{ label: 'Account', value: o.accountName }] },
      Qualification: { guidance: 'Confirm budget, timeline, and protocol fit. Build the site strategy.', keyFields: [{ label: 'Amount', value: currency(o.amount) }, { label: 'Close Date', value: dateLabel(o.closeDate) }] },
      Request: { guidance: 'Sponsor requests a quote. CBO reviews before Consideration.', keyFields: [{ label: 'Quote Status', value: 'See Products & Quoting' }, { label: 'Amount', value: currency(o.amount) }] },
      Consideration: { guidance: 'Sponsor evaluating the proposal; align on scope and pricing.', keyFields: [{ label: 'Forecast Category', value: o.forecastCategory }] },
      Contracting: { guidance: 'An Award Letter formally triggers Contracting. Cannot enter until Award Letter Received = true.', keyFields: [{ label: 'Award Letter Received', value: yesNo(o.awardLetterReceived) }] },
      'Closed Won': { guidance: 'MSA & SOW signed. Cannot mark Closed Won until the related Sales Contract is Signed. Then capture onboarding roles and hand off to ClinOps.', keyFields: [{ label: 'Contract Status', value: o.contractStatus }] },
    };
  }
  handleMarkComplete(event) {
    const stage = event.detail.stage;
    const result = advanceStage(this.oppId, stage);
    if (result && !result.ok) {
      Toast.show({ label: 'Stage gate', message: result.reason, variant: 'warning' }, this);
    } else if (stage === 'Request') {
      Toast.show({ label: 'Stage advanced to Request', message: 'CBO notified to review the quote before Consideration.', variant: 'success' }, this);
    } else if (stage === 'Closed Won') {
      Toast.show({ label: 'Closed Won', message: 'Onboarding Form sent, Asana project created, and ClinOps notified.', variant: 'success' }, this);
    }
  }

  /* ---- Award Letter control ---- */
  get showAwardControl() { return this.isSales && !this.opp.awardLetterReceived && this.opp.stage !== 'Closed Won'; }
  handleAwardLetter() {
    setAwardLetter(this.oppId, true);
    Toast.show({ label: 'Award Letter Received', message: 'Award Letter recorded — Contracting is now unlocked.', variant: 'success' }, this);
  }

  /* ---- Details sections ---- */
  get oppInfoFields() {
    const o = this.opp;
    return [
      { label: 'Opportunity Name', value: o.name },
      { label: 'Account', value: o.accountName },
      { label: 'Record Type', value: o.recordType },
      { label: 'Stage', value: o.stage },
      { label: 'Amount', value: currency(o.amount) },
      { label: 'Close Date', value: dateLabel(o.closeDate) },
      { label: 'Forecast Category', value: o.forecastCategory },
      { label: 'Owner', value: o.owner },
    ];
  }
  get studyInfoFields() {
    const o = this.opp;
    return [
      { label: 'Research Study', value: o.studyName },
      { label: 'Indication', value: o.indication },
      { label: 'Phase', value: o.phase },
    ];
  }
  get contractingFields() {
    const o = this.opp;
    return [
      { label: 'Award Letter Received', value: yesNo(o.awardLetterReceived) },
      { label: 'Contract Status', value: o.contractStatus },
      { label: 'Quote Status', value: 'Quoting performed outside Salesforce; line items may lag the external quote sheet.', isLong: true, fullWidth: true },
    ];
  }
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
  get onboardingFields() {
    const o = this.opp;
    return [
      { label: 'Onboarding Form Sent', value: yesNo(o.onboardingFormSent) },
      { label: 'Onboarding Form Recipient', value: o.onboardingFormRecipient },
      { label: 'Billing Contact', value: o.billingContact },
      { label: 'Product Owner', value: o.productOwner },
      { label: 'Executive Sponsor', value: o.executiveSponsor },
      { label: 'End Users', value: o.endUsers },
      { label: 'Exhibit Letter', value: o.exhibitLetter },
      { label: 'Project Name', value: o.projectName },
      { label: 'Asana Project ID', value: o.asanaProjectId },
      { label: 'Asana Project Status', value: o.asanaProjectStatus },
    ];
  }
  get changeOrderFields() {
    const o = this.opp;
    return [
      { label: 'Parent Opportunity', value: this.parentName },
      { label: 'Exhibit Letter', value: o.exhibitLetter },
      { label: 'Extension Days', value: o.extensionDays },
      { label: 'Schedule Extension Notification Date', value: dateLabel(o.scheduleExtensionNotificationDate) },
    ];
  }

  /* ---- Products (inline editable) ---- */
  get productData() {
    return getOppLineItems(this.oppId).map((li) => ({
      ...li,
      totalPrice: (Number(li.quantity) || 0) * (Number(li.salesPrice) || 0),
      assetName: li.assetId ? (getAssetById(li.assetId)?.name || '') : '',
    }));
  }
  get productColumns() {
    return [
      { label: 'Product', fieldName: 'productName' },
      { label: 'Quantity', fieldName: 'quantity', type: 'number', editable: true, cellAttributes: { alignment: 'left' } },
      { label: 'Sales Price', fieldName: 'salesPrice', type: 'currency', editable: true, typeAttributes: { maximumFractionDigits: 0 } },
      { label: 'Total Price', fieldName: 'totalPrice', type: 'currency', typeAttributes: { maximumFractionDigits: 0 } },
      { label: 'Asset', fieldName: 'assetName' },
    ];
  }
  handleProductSave(event) {
    event.detail.draftValues.forEach((d) => {
      updateLineItem(d.id, { quantity: d.quantity, salesPrice: d.salesPrice });
    });
    this.productDraftValues = [];
    Toast.show({ label: 'Products updated', message: 'Opportunity Products saved (simple sum, no pricing rules).', variant: 'success' }, this);
  }

  get quoteRecords() {
    return getQuotesForOpp(this.oppId).map((q) => ({ ...q, totalLabel: currency(q.total), expirationLabel: dateLabel(q.expirationDate), _linkPath: `/quotes/${q.id}` }));
  }
  get quoteColumns() {
    return [
      { label: 'Quote Name', fieldName: 'name' },
      { label: 'Status', fieldName: 'status' },
      { label: 'Total', fieldName: 'totalLabel' },
      { label: 'Expiration Date', fieldName: 'expirationLabel' },
    ];
  }

  /* ---- Sites & Contacts ---- */
  get engagedSites() {
    return getOppSites(this.oppId).filter((s) => s.engagementStatus === 'Engaged').map((s) => ({ ...s, _linkPath: `/accounts/${s.siteAccountId}` }));
  }
  get nonEngagedSites() {
    return getOppSites(this.oppId).filter((s) => s.engagementStatus === 'Non-Engaged').map((s) => ({ ...s, _linkPath: `/accounts/${s.siteAccountId}` }));
  }
  get siteColumns() {
    return [
      { label: 'Site', fieldName: 'siteName' },
      { label: 'City/State', fieldName: 'cityState' },
      { label: 'Primary PI', fieldName: 'primaryPI' },
    ];
  }
  get contactRoleRecords() {
    return getOppContactRoles(this.oppId).map((r) => ({ ...r, primaryLabel: yesNo(r.primary), _linkPath: `/contacts/${r.contactId}` }));
  }
  get contactRoleColumns() {
    return [
      { label: 'Contact', fieldName: 'contactName' },
      { label: 'Role', fieldName: 'role' },
      { label: 'Title', fieldName: 'title' },
      { label: 'Primary', fieldName: 'primaryLabel' },
    ];
  }

  /* ---- Contracting ---- */
  get contractRecords() {
    let rows = getContractsForOpp(this.oppId);
    if (this.isChangeOrder) rows = rows.filter((c) => c.type === 'Change Order');
    return rows.map((c) => ({ ...c, sentDateLabel: dateLabel(c.sentDate), signedDateLabel: dateLabel(c.signedDate), _linkPath: `/sales-contracts/${c.id}` }));
  }
  get contractColumns() {
    return [
      { label: 'Contract Name', fieldName: 'name' },
      { label: 'Type', fieldName: 'type' },
      { label: 'Status', fieldName: 'status' },
      { label: 'Sent Date', fieldName: 'sentDateLabel' },
      { label: 'Signed Date', fieldName: 'signedDateLabel' },
    ];
  }
  get historyRecords() {
    return getFieldHistory(this.oppId).map((h) => ({ ...h, dateLabel: dateLabel(h.date) }));
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

  /* ---- Team ---- */
  get teamData() {
    return getOppTeam(this.oppId);
  }
  get teamColumns() {
    return [
      { label: 'User', fieldName: 'userName' },
      { label: 'Team Role', fieldName: 'teamRole' },
      { label: 'Opportunity Access', fieldName: 'opportunityAccess' },
      { type: 'action', typeAttributes: { rowActions: [{ label: 'Remove', name: 'remove' }] } },
    ];
  }
  get userOptions() {
    return getUsers().map((u) => ({ label: `${u.name} — ${u.role}`, value: u.name }));
  }
  get roleOptions() {
    return TEAM_ROLES.map((r) => ({ label: r, value: r }));
  }
  handleNewUser(e) { this.newTeamUser = e.detail.value; }
  handleNewRole(e) { this.newTeamRole = e.detail.value; }
  handleAddTeam() {
    if (!this.newTeamUser) {
      Toast.show({ label: 'Select a user', message: 'Choose a user to add to the Opportunity Team.', variant: 'warning' }, this);
      return;
    }
    addOppTeamMember(this.oppId, { userName: this.newTeamUser, teamRole: this.newTeamRole, opportunityAccess: 'Read Only' });
    Toast.show({ label: 'Team member added', message: `${this.newTeamUser} added as ${this.newTeamRole}. Notification sent.`, variant: 'success' }, this);
    this.newTeamUser = '';
  }
  handleTeamRowAction(e) {
    if (e.detail.action.name === 'remove') removeOppTeamMember(e.detail.row.id);
  }

  get activityItems() {
    return getTasksForRecord(this.oppId).map((t) => ({
      ...t,
      date: dateLabel(t.dueDate),
      iconName: 'standard:task',
      description: `${t.origin} · Due ${dateLabel(t.dueDate)}`,
    }));
  }

  /* ---- Closed-Won guided actions + Asana simulation ---- */
  get isClosedWon() { return this.opp?.stage === 'Closed Won'; }
  get showAsanaControl() { return this.isSales && !!this.opp.asanaProjectStatus && this.opp.asanaProjectStatus !== 'Late Stage: Renewal Window'; }
  get asanaHint() {
    const s = this.opp.asanaProjectStatus;
    if (s === 'Onboarding') return 'Asana project moves Onboarding → Active';
    if (s === 'Active') return 'Asana project moves Active → Late Stage: Renewal Window';
    return '';
  }
  handleAsana() { simulateAsanaStatus(this.oppId); }

  async handleCaptureRoles() {
    await CaptureRolesModal.open({ size: 'medium', label: 'Capture Key Project Roles', oppId: this.oppId });
  }
  async handleLogExtension() {
    await ExtensionModal.open({ size: 'medium', label: 'Log Schedule Extension Notification', oppId: this.oppId });
  }

  handleTabActive(e) { this.activeTab = e.target.value; }
  handleBack() { navigate('/opportunities'); }
}
