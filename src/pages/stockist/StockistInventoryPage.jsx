import { useEffect, useMemo, useState } from 'react';
import {
  Boxes,
  PackageCheck,
  RefreshCw,
  Search,
  Truck,
} from 'lucide-react';

import { DistributorShell } from '../../components/AppShell';
import Loader from '../../components/Loader';
import Toast from '../../components/Toast';
import { getStockistInventory } from '../../api/stockistApi';
import { storage } from '../../utils/storage';

const formatNumber = (value) =>
  Number(value || 0).toLocaleString('en-IN');

const formatDate = (value) => {
  if (!value) return '-';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

export default function StockistInventoryPage() {
  const token = storage.getDistributorToken();
  const user = storage.getDistributorUser();

  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const loadInventory = async () => {
    setLoading(true);

    try {
      const response = await getStockistInventory(token);
      setInventory(response.data || []);
    } catch (error) {
      setToast({
        type: 'error',
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const filteredInventory = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return inventory;
    }

    return inventory.filter((item) =>
      [
        item.product_name,
        item.sku,
        item.brand,
        item.category_name,
      ].some((value) =>
        String(value || '').toLowerCase().includes(keyword)
      )
    );
  }, [inventory, search]);

  const availableTotal = inventory.reduce(
    (sum, item) => sum + Number(item.available_stock || 0),
    0
  );

  const transitTotal = inventory.reduce(
    (sum, item) => sum + Number(item.in_transit_stock || 0),
    0
  );

  const totalStock = inventory.reduce(
    (sum, item) => sum + Number(item.total_stock || 0),
    0
  );

  if (loading) {
    return (
      <DistributorShell user={user}>
        <Loader label="Loading your inventory..." />
      </DistributorShell>
    );
  }

  return (
    <DistributorShell user={user}>
      <Toast {...(toast || {})} onClose={() => setToast(null)} />

      <div className="page-header">
        <div>
          <p className="eyebrow">Stockist Portal</p>
          <h2>My Inventory</h2>
          <p className="muted">
            This stock belongs only to your stockist account. Receive
            shipped orders to make transit stock available.
          </p>
        </div>

        <button className="secondary-btn" onClick={loadInventory}>
          <RefreshCw size={17} /> Refresh
        </button>
      </div>

      <div className="stats-grid stockist-order-stats">
        <div className="stat-card">
          <Boxes />
          <p>Total Stock</p>
          <h3>{formatNumber(totalStock)}</h3>
        </div>

        <div className="stat-card">
          <PackageCheck />
          <p>Available Stock</p>
          <h3>{formatNumber(availableTotal)}</h3>
        </div>

        <div className="stat-card">
          <Truck />
          <p>In Transit</p>
          <h3>{formatNumber(transitTotal)}</h3>
        </div>
      </div>

      <section className="table-card wide-table inventory-table-card">
        <div className="table-card-toolbar">
          <div>
            <h3>Stockist Inventory List</h3>
            <p>Product quantities received from your own purchase orders.</p>
          </div>

          <div className="search-box catalog-search">
            <Search size={18} />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search product or SKU"
            />
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Total</th>
              <th>Reserved</th>
              <th>In Transit</th>
              <th>Available</th>
              <th>Last Received</th>
            </tr>
          </thead>

          <tbody>
            {filteredInventory.map((item) => (
              <tr key={item.stockist_inventory_id}>
                <td>
                  <strong>{item.product_name}</strong>
                  <small>{item.brand || '-'}</small>
                </td>

                <td>{item.sku}</td>
                <td>{item.category_name || '-'}</td>
                <td>{formatNumber(item.total_stock)}</td>
                <td>{formatNumber(item.reserved_stock)}</td>

                <td>
                  <span className="inventory-transit">
                    {formatNumber(item.in_transit_stock)}
                  </span>
                </td>

                <td>
                  <strong className="inventory-available">
                    {formatNumber(item.available_stock)}
                  </strong>
                </td>

                <td>{formatDate(item.last_received_at)}</td>
              </tr>
            ))}

            {!filteredInventory.length && (
              <tr>
                <td colSpan="8" className="empty-cell">
                  No stock has been received in your inventory yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </DistributorShell>
  );
}