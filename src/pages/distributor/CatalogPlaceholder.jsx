import { DistributorShell } from '../../components/AppShell';
import { storage } from '../../utils/storage';

export default function CatalogPlaceholder() {
  const user = storage.getDistributorUser();
  return (
    <DistributorShell user={user}>
      <div className="page-header">
        <div>
          <p className="eyebrow">Next Phase</p>
          <h2>Distributor Catalog</h2>
          <p className="muted">This page is ready for product assignment and pricing APIs.</p>
        </div>
      </div>
      <section className="info-panel">
        <h3>Expected Next APIs</h3>
        <p>Admin assigns products and prices to stockists/agencies. Stockist and agency users will see only assigned catalog items here.</p>
      </section>
    </DistributorShell>
  );
}
