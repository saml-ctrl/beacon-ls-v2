import { LightningElement } from 'lwc';
import { getCurrentRoute, navigate } from '../../../router';
import { onStoreChange, getQuoteById, getQuoteLineItems, consumeNavIntent } from 'data/store';
import { currency, dateLabel } from 'data/format';

export default class QuoteDetail extends LightningElement {
  quoteId;
  quote;
  activeTab = 'details';
  _unsub;

  connectedCallback() {
    this.quoteId = getCurrentRoute()?.params?.id;
    const t = consumeNavIntent(this.quoteId);
    if (t) this.activeTab = t;
    this._unsub = onStoreChange(() => this.load());
    this.load();
  }
  disconnectedCallback() { this._unsub?.(); }
  load() { this.quote = getQuoteById(this.quoteId); }

  get hasQuote() { return !!this.quote; }
  get quoteName() { return this.quote?.name; }

  get highlightFields() {
    const q = this.quote;
    return [
      { label: 'Opportunity', value: q.opportunityName },
      { label: 'Status', value: q.status },
      { label: 'Total', value: currency(q.total) },
      { label: 'Expiration Date', value: dateLabel(q.expirationDate) },
    ];
  }
  get quoteInfoFields() {
    const q = this.quote;
    return [
      { label: 'Quote Name', value: q.name },
      { label: 'Status', value: q.status },
      { label: 'Prepared By', value: q.preparedBy },
      { label: 'External Quote Sheet Reference', value: q.externalQuoteSheetRef, fullWidth: true },
    ];
  }
  get totalsFields() {
    const q = this.quote;
    return [
      { label: 'Subtotal', value: currency(q.total) },
      { label: 'Total', value: currency(q.total) },
    ];
  }

  get lineRecords() {
    return getQuoteLineItems(this.quoteId).map((li) => ({
      ...li,
      salesPriceLabel: currency(li.salesPrice),
      totalPriceLabel: currency((li.quantity || 0) * (li.salesPrice || 0)),
    }));
  }
  get lineColumns() {
    return [
      { label: 'Product', fieldName: 'productName' },
      { label: 'Quantity', fieldName: 'quantity' },
      { label: 'Sales Price', fieldName: 'salesPriceLabel' },
      { label: 'Total Price', fieldName: 'totalPriceLabel' },
    ];
  }

  handleTabActive(e) { this.activeTab = e.target.value; }
  handleBack() { navigate('/quotes'); }
}
