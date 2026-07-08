import { LightningElement } from 'lwc';
import { navigate } from '../../../router';
import { reset, setNavIntent } from 'data/store';

const STEPS = [
  { title: 'Demo Guide — walk the stakeholder journey map and process diagram; note the notification bell is empty.', path: '/' },
  { title: 'Research Studies → “This Week’s Qualified: Unassigned” list view → open the Neurocessa study.', path: '/research-studies' },
  { title: 'Approve & Assign the study → the bell shows 1 → open the notification and follow its deep link to the KOLs tab.', path: '/research-studies/study-neurocessa' },
  { title: 'Open the PI lead (Dr. Elena Vasquez) → Enrich with Clay → review the Engagement tab.', path: '/leads/lead-vasquez', recordId: 'lead-vasquez', tab: 'engagement' },
  { title: 'Convert the lead — hit the Close Date validation, fix it, and finish. The Opportunity opens.', path: '/leads/lead-vasquez' },
  { title: 'Opportunity: work the Path, inline-edit Products, add a ClinOps team member (notification #2), review Engaged / Non-Engaged sites.', path: '/opportunities/opp-neurocessa' },
  { title: 'Advance the stage to Request (notification #3 to CBO) → open the Quote from Products & Quoting.', path: '/opportunities/opp-neurocessa', recordId: 'opp-neurocessa', tab: 'products' },
  { title: 'Contracting tab → open the Sales Contract → Send for Signature → Simulate Sponsor Action to Signed (notification #4).', path: '/opportunities/opp-neurocessa', recordId: 'opp-neurocessa', tab: 'contracting' },
  { title: 'Mark Award Letter → advance to Contracting → Closed Won (notification #5) → Capture Key Project Roles.', path: '/opportunities/opp-neurocessa' },
  { title: 'Simulate the Asana status to “Late Stage: Renewal Window” (notification #6 + a Task in Activity).', path: '/opportunities/opp-neurocessa', recordId: 'opp-neurocessa', tab: 'details' },
  { title: 'Log Schedule Extension Notification → the Change Order Opportunity → walk its abbreviated Path to Closed Won.', path: '/opportunities/opp-neurocessa' },
];

export default class PresenterBar extends LightningElement {
  step = 0;

  get stepData() { return STEPS[this.step]; }
  get stepLabel() { return `Step ${this.step} of ${STEPS.length - 1}`; }
  get title() { return this.stepData.title; }
  get isFirst() { return this.step === 0; }
  get isLast() { return this.step === STEPS.length - 1; }

  go() {
    const s = this.stepData;
    if (s.recordId && s.tab) setNavIntent(s.recordId, s.tab);
    navigate(s.path);
  }
  handleNext() {
    if (!this.isLast) { this.step += 1; this.go(); }
  }
  handleBack() {
    if (!this.isFirst) { this.step -= 1; this.go(); }
  }
  handleReset() {
    reset();
    this.step = 0;
    navigate('/');
  }
}
