import { LightningElement, api } from 'lwc';

/**
 * A named two-column Details section: a section title over a responsive grid of
 * read-only Lightning form fields. Mirrors a standard Salesforce page-layout
 * section so the wireframe shows exactly which fields sit where.
 */
export default class DetailSection extends LightningElement {
  @api title = '';
  _fields = [];

  @api get fields() {
    return this._fields;
  }
  set fields(value) {
    this._fields = Array.isArray(value) ? value : [];
  }

  get computedFields() {
    return this._fields.map((f, i) => ({
      key: `field-${i}`,
      label: f.label,
      value: f.value == null || f.value === '' ? '—' : String(f.value),
      type: f.type || 'text',
      isTextarea: !!f.isLong,
      isInput: !f.isLong,
      colClass: f.fullWidth
        ? 'slds-col slds-size_1-of-1 slds-p-vertical_xx-small'
        : 'slds-col slds-size_1-of-1 slds-medium-size_1-of-2 slds-p-vertical_xx-small',
    }));
  }
}
