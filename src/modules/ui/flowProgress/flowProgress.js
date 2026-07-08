import { LightningElement, api } from 'lwc';

/**
 * The progress indicator across the top of a guided-action modal, standing in
 * for the screen-flow stepper. Wraps the Lightning base progress indicator.
 */
export default class FlowProgress extends LightningElement {
  @api current = 0;
  _steps = [];

  @api get steps() {
    return this._steps;
  }
  set steps(value) {
    this._steps = Array.isArray(value) ? value : [];
  }

  get stepItems() {
    return this._steps.map((label, i) => ({ key: `step-${i}`, label, value: String(i) }));
  }
  get currentValue() {
    return String(this.current);
  }
}
