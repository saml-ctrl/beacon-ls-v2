import { LightningElement } from 'lwc';
import { isDiscoveryOn, setDiscoveryOn, onDiscoveryChange } from 'data/discovery';

export default class GlobalHeader extends LightningElement {
  discoveryOn = isDiscoveryOn();
  _unsub;

  connectedCallback() {
    this._unsub = onDiscoveryChange(() => {
      this.discoveryOn = isDiscoveryOn();
    });
  }
  disconnectedCallback() {
    this._unsub?.();
  }

  handleDiscoveryToggle(event) {
    setDiscoveryOn(event.target.checked);
  }

  handleAgentforceClick() {
    this.dispatchEvent(new CustomEvent('panelselect', { detail: { name: 'agentforce_panel' }, bubbles: true, composed: true }));
  }
  handleTrailheadClick() {
    this.dispatchEvent(new CustomEvent('panelselect', { detail: { name: 'trailhead_panel' }, bubbles: true, composed: true }));
  }
  handleSettingsClick() {
    this.dispatchEvent(new CustomEvent('panelselect', { detail: { name: 'settings_panel' }, bubbles: true, composed: true }));
  }
}
