import { LightningElement, api } from 'lwc';

/**
 * Beacon sales Path. Renders the SLDS Path blueprint (no Lightning Base
 * Component exists for Path) with per-stage Key Fields and Guidance for Success
 * drawn from the sales handbook. Selecting a step previews its guidance;
 * "Mark as Complete" / "Mark as Current Stage" asks the parent to advance so
 * the parent can enforce entry/exit gates.
 */
export default class RecordPath extends LightningElement {
  @api guidanceMap = {};
  _stages = [];
  _current = '';
  _selected = '';

  @api get stages() {
    return this._stages;
  }
  set stages(value) {
    this._stages = Array.isArray(value) ? value : [];
  }

  @api get currentStage() {
    return this._current;
  }
  set currentStage(value) {
    this._current = value;
    this._selected = value; // reset preview to the real stage whenever it changes
  }

  get currentIndex() {
    return this._stages.indexOf(this._current);
  }
  get selectedIndex() {
    return this._stages.indexOf(this._selected);
  }

  get items() {
    const ci = this.currentIndex;
    const si = this.selectedIndex;
    return this._stages.map((stage, i) => {
      let cls = 'slds-path__item';
      if (i < ci) cls += ' slds-is-complete';
      else if (i === ci) cls += ' slds-is-current';
      else cls += ' slds-is-incomplete';
      if (i === si) cls += ' slds-is-active';
      return { key: stage, stage, className: cls, tabindex: i === si ? '0' : '-1' };
    });
  }

  get guidance() {
    return this.guidanceMap[this._selected] || {};
  }
  get keyFields() {
    const g = this.guidance;
    return (g.keyFields || []).map((f, i) => ({
      key: `kf-${i}`,
      label: f.label,
      value: f.value == null || f.value === '' ? '—' : String(f.value),
    }));
  }
  get guidanceText() {
    return this.guidance.guidance || 'No guidance recorded for this step.';
  }
  get hasKeyFields() {
    return this.keyFields.length > 0;
  }

  get actionLabel() {
    if (this._selected === this._current) return 'Mark Stage as Complete';
    if (this.selectedIndex > this.currentIndex) return 'Mark as Current Stage';
    return 'Select';
  }
  get selectedTitle() {
    return `${this._selected}`;
  }

  handleStageClick(event) {
    event.preventDefault();
    const stage = event.currentTarget.dataset.stage;
    if (stage) this._selected = stage;
  }

  handleAction() {
    let target;
    if (this._selected === this._current) {
      // advance to the next stage
      const next = this._stages[this.currentIndex + 1];
      if (!next) return;
      target = next;
    } else {
      target = this._selected;
    }
    this.dispatchEvent(new CustomEvent('markcomplete', { detail: { stage: target } }));
  }
}
