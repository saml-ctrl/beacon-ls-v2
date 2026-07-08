/**
 * Discovery Mode — a global, in-memory toggle (default ON) that shows or hides
 * the three annotation chip types (Best Practice, Integration, Open Decision).
 * When OFF the app reads as a clean org. Kept separate from the data store so
 * toggling annotations never triggers record re-fetches.
 */
const bus = new EventTarget();
let on = true;

export function isDiscoveryOn() {
  return on;
}
export function setDiscoveryOn(value) {
  const next = !!value;
  if (next === on) return;
  on = next;
  bus.dispatchEvent(new CustomEvent('discoverychange'));
}
export function onDiscoveryChange(callback) {
  bus.addEventListener('discoverychange', callback);
  return () => bus.removeEventListener('discoverychange', callback);
}
