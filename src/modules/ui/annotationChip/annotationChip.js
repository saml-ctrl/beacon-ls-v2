import { LightningElement, api } from 'lwc';
import { isDiscoveryOn, onDiscoveryChange } from 'data/discovery';

/**
 * A small annotation badge that teaches while the wireframe demos. Three kinds:
 *   - best-practice (blue): page-layout / data-model placement rationale
 *   - integration   (neutral): system, direction, Phase 1 scope notes
 *   - open-decision  (amber): decisions still open in discovery
 * Collapsed to a chip; expands on click. All chips hide when Discovery Mode is OFF.
 */
export default class AnnotationChip extends LightningElement {
  @api type = 'best-practice';
  @api heading = '';
  @api detail = '';

  discoveryOn = isDiscoveryOn();
  expanded = false;
  _unsub;

  connectedCallback() {
    this._unsub = onDiscoveryChange(() => {
      this.discoveryOn = isDiscoveryOn();
    });
  }
  disconnectedCallback() {
    this._unsub?.();
  }

  get show() {
    return this.discoveryOn;
  }
  get isBestPractice() {
    return this.type === 'best-practice';
  }
  get isIntegration() {
    return this.type === 'integration';
  }
  get isOpenDecision() {
    return this.type === 'open-decision';
  }
  get iconName() {
    if (this.isIntegration) return 'utility:sync';
    if (this.isOpenDecision) return 'utility:help';
    return 'utility:touch_action';
  }
  get typeLabel() {
    if (this.isIntegration) return 'Integration';
    if (this.isOpenDecision) return 'Open Decision';
    return 'Best Practice';
  }
  get chipClass() {
    return 'c-chip slds-m-right_xx-small c-chip_' + this.type;
  }
  get detailClass() {
    return 'c-chip__detail slds-box slds-box_xx-small slds-m-top_xx-small slds-text-body_small c-chip__detail_' + this.type;
  }
  get ariaExpanded() {
    return String(this.expanded);
  }
  toggle() {
    this.expanded = !this.expanded;
  }
}
