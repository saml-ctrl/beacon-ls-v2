import { LightningElement, api } from 'lwc';
import { navigate, linkHref } from '../../../router';

/**
 * A Salesforce-style related list: card header (icon + title + count), a table
 * with caller-specified columns, first-column record links, and a "View All"
 * footer. Hand-rolls the SLDS related-list table blueprint on purpose —
 * lightning-datatable is heavier than needed and doesn't match the compact
 * related-list look; all other chrome uses Lightning Base Components.
 */
export default class RelatedList extends LightningElement {
  @api title = '';
  @api iconName = 'standard:record';
  @api viewAllPath = '';
  @api viewAllLabel = 'View All';
  @api emptyText = 'No records to display.';

  _columns = [];
  _records = [];

  @api get columns() {
    return this._columns;
  }
  set columns(value) {
    this._columns = Array.isArray(value) ? value : [];
  }

  @api get records() {
    return this._records;
  }
  set records(value) {
    this._records = Array.isArray(value) ? value : [];
  }

  get count() {
    return this._records.length;
  }
  get cardTitle() {
    return `${this.title} (${this.count})`;
  }
  get hasRows() {
    return this._records.length > 0;
  }
  get showViewAll() {
    return !!this.viewAllPath && this.hasRows;
  }

  get headerCells() {
    return this._columns.map((c) => ({ key: c.fieldName, label: c.label }));
  }

  get computedRows() {
    return this._records.map((rec, i) => {
      const rowKey = rec.id || `row-${i}`;
      return {
        key: rowKey,
        cells: this._columns.map((col, ci) => {
          const isLink = ci === 0 && !!rec._linkPath;
          const value = rec[col.fieldName];
          return {
            key: `${rowKey}-${col.fieldName}`,
            value: value == null || value === '' ? '—' : value,
            isLink,
            isText: !isLink,
            path: rec._linkPath,
            href: rec._linkPath ? linkHref(rec._linkPath) : '',
          };
        }),
      };
    });
  }

  handleNav(event) {
    event.preventDefault();
    const path = event.currentTarget.dataset.path;
    if (path) navigate(path);
  }

  handleViewAll(event) {
    event.preventDefault();
    if (this.viewAllPath) navigate(this.viewAllPath);
  }
}
