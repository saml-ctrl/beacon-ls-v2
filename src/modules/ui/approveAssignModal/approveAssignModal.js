import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import Toast from 'lightning/toast';
import { getResearchStudyById, approveAndAssignStudy } from 'data/store';

const STEPS = ['Review Study', 'Assign & Approve', 'Confirm'];
const REP_OPTIONS = [
  { label: 'Jordan Reyes — BD Rep / Key Account Manager', value: 'Jordan Reyes' },
  { label: 'Alex Kim — BD Rep', value: 'Alex Kim' },
  { label: 'Priya Nadkarni — BD Coordinator', value: 'Priya Nadkarni' },
];
const STATUS_OPTIONS = [
  { label: 'Approved', value: 'Approved' },
  { label: 'Needs More Info', value: 'Needs More Info' },
  { label: 'Rejected', value: 'Rejected' },
];

/**
 * Approve & Assign (Research Study) guided action. Assignment is never
 * automated — a human BD decision — so this is a launched flow, not a trigger.
 * On Finish it assigns the rep, sets Approval Status, and fires handoff #1.
 */
export default class ApproveAssignModal extends LightningModal {
  @api studyId;
  step = 0;
  bdRep = 'Jordan Reyes';
  approvalStatus = 'Approved';
  study;

  connectedCallback() {
    this.study = getResearchStudyById(this.studyId) || {};
  }

  get steps() { return STEPS; }
  get repOptions() { return REP_OPTIONS; }
  get statusOptions() { return STATUS_OPTIONS; }
  get isStep0() { return this.step === 0; }
  get isStep1() { return this.step === 1; }
  get isStep2() { return this.step === 2; }
  get isFirst() { return this.step === 0; }
  get isLast() { return this.step === STEPS.length - 1; }
  get nextLabel() { return this.isLast ? 'Finish' : 'Next'; }

  get summaryFields() {
    const s = this.study;
    return [
      { label: 'Study', value: s.name },
      { label: 'Sponsor', value: s.sponsor },
      { label: 'Phase', value: s.phase },
      { label: 'Indication', value: s.indication },
      { label: 'ICP Score', value: s.icpScore },
      { label: 'Source', value: s.source },
    ];
  }
  get confirmText() {
    return `Assign “${this.study.name}” to ${this.bdRep} and set Approval Status to ${this.approvalStatus}. A custom notification will be sent to the BD Rep.`;
  }

  handleRep(e) { this.bdRep = e.detail.value; }
  handleStatus(e) { this.approvalStatus = e.detail.value; }
  handleBack() { if (this.step > 0) this.step -= 1; }
  handleNext() {
    if (this.step === 1 && !this.bdRep) return;
    if (this.isLast) { this.finish(); return; }
    this.step += 1;
  }
  finish() {
    approveAndAssignStudy(this.studyId, this.bdRep, this.approvalStatus);
    Toast.show(
      { label: 'Research Study assigned', message: `${this.study.name} assigned to ${this.bdRep}. Notification sent to BD Rep.`, variant: 'success' },
      this
    );
    this.close('assigned');
  }
  handleCancel() { this.close('cancel'); }
}
