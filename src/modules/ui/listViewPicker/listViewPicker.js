import { LightningElement, api } from 'lwc';

/**
 * List view switcher shown next to an object-home title. Emits `viewchange`
 * with the selected view value; the page swaps filter + columns accordingly.
 */
export default class ListViewPicker extends LightningElement {
  @api currentView = '';
  _views = [];

  @api get views() {
    return this._views;
  }
  set views(value) {
    this._views = Array.isArray(value) ? value : [];
  }

  get items() {
    return this._views.map((v) => ({
      label: v.label,
      value: v.value,
      checked: v.value === this.currentView,
    }));
  }

  handleSelect(event) {
    this.dispatchEvent(new CustomEvent('viewchange', { detail: { value: event.detail.value } }));
  }
}
