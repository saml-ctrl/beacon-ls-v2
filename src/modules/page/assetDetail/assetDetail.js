import { LightningElement } from 'lwc';
import { getCurrentRoute, navigate } from '../../../router';
import { onStoreChange, getAssetById, getOpportunityById } from 'data/store';

export default class AssetDetail extends LightningElement {
  assetId;
  asset;
  _unsub;

  connectedCallback() {
    this.assetId = getCurrentRoute()?.params?.id;
    this._unsub = onStoreChange(() => this.load());
    this.load();
  }
  disconnectedCallback() { this._unsub?.(); }
  load() { this.asset = getAssetById(this.assetId); }

  get hasAsset() { return !!this.asset; }
  get assetName() { return this.asset?.name; }

  get highlightFields() {
    const a = this.asset;
    return [
      { label: 'Product (Waveband)', value: a.productName },
      { label: 'Serial Number', value: a.serialNumber },
      { label: 'Status', value: a.status },
      { label: 'Account', value: a.accountName },
    ];
  }
  get assetInfoFields() {
    const a = this.asset;
    const opp = a.opportunityId ? getOpportunityById(a.opportunityId) : null;
    return [
      { label: 'Asset Name', value: a.name },
      { label: 'Product', value: a.productName },
      { label: 'Serial Number', value: a.serialNumber },
      { label: 'Status', value: a.status },
      { label: 'Account / Deployment Site', value: a.accountName },
      { label: 'Related Opportunity', value: opp?.name || '—' },
    ];
  }

  handleBack() { navigate('/assets'); }
}
