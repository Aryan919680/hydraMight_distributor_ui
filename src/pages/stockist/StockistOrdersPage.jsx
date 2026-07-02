import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  PackageCheck,
  RefreshCw,
  Truck,
} from 'lucide-react';

import { DistributorShell } from '../../components/AppShell';
import Loader from '../../components/Loader';
import Toast from '../../components/Toast';
import {
  getStockistOrders,
  receiveStockistOrder,
} from '../../api/stockistApi';
import { storage } from '../../utils/storage';

const formatNumber = (value) =>
  Number(value || 0).toLocaleString('en-IN');

const formatMoney = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

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

const statusLabel = (value) =>
  String(value || 'pending').replace(/_/g, ' ');

export default function StockistOrdersPage() {
  const token = storage.getDistributorToken();
  const user = storage.getDistributorUser();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [receivingOrderId, setReceivingOrderId] = useState(null);
  const [toast, setToast] = useState(null);

  const loadOrders = async () => {
    setLoading(true);

    try {
      const response = await getStockistOrders(token);
      setOrders(response.data || []);
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
    loadOrders();
  }, []);

  const receiveOrder = async (orderId) => {
    setReceivingOrderId(orderId);

    try {
      const response = await receiveStockistOrder(token, orderId, {
        note: 'Received by stockist from portal',
      });

      setToast({
        type: 'success',
        message:
          response.message || 'Stock received into your inventory.',
      });

      await loadOrders();
    } catch (error) {
      setToast({
        type: 'error',
        message: error.message,
      });
    } finally {
      setReceivingOrderId(null);
    }
  };

  if (loading) {
    return (
      <DistributorShell user={user}>
        <Loader label="Loading your orders..." />
      </DistributorShell>
    );
  }

  return (
    <DistributorShell user={user}>
      <Toast {...(toast || {})} onClose={() => setToast(null)} />

      <div className="page-header">
        <div>
          <p className="eyebrow">Stockist Portal</p>
          <h2>My Purchase Orders</h2>
          <p className="muted">
            Orders are shipped immediately. Confirm receipt to move
            quantities from transit into available inventory.
          </p>
        </div>

        <button className="secondary-btn" onClick={loadOrders}>
          <RefreshCw size={17} /> Refresh
        </button>
      </div>

      <div className="stats-grid stockist-order-stats">
        <div className="stat-card">
          <Truck />
          <p>Shipped Orders</p>
          <h3>
            {
              orders.filter(
                (order) => order.order_status === 'shipped'
              ).length
            }
          </h3>
        </div>

        <div className="stat-card">
          <PackageCheck />
          <p>Delivered Orders</p>
          <h3>
            {
              orders.filter(
                (order) => order.order_status === 'delivered'
              ).length
            }
          </h3>
        </div>

        <div className="stat-card">
          <CheckCircle2 />
          <p>Total Orders</p>
          <h3>{orders.length}</h3>
        </div>
      </div>

      <section className="table-card wide-table">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Items</th>
              <th>Quantity</th>
              <th>Payment</th>
              <th>Order Status</th>
              <th>Delivery</th>
              <th>Amount</th>
              <th>Placed</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>
                  <strong>{order.order_number}</strong>
                  <small>{order.remarks || 'No remarks'}</small>
                </td>

                <td>{order.item_count || 0}</td>
                <td>{formatNumber(order.total_quantity)}</td>

                <td>
                  <strong>{statusLabel(order.payment_method)}</strong>
                  <small>
                    <span className={`badge ${order.payment_status}`}>
                      {statusLabel(order.payment_status)}
                    </span>
                  </small>
                </td>

                <td>
                  <span className={`badge ${order.order_status}`}>
                    {statusLabel(order.order_status)}
                  </span>
                </td>

                <td>
                  <span className={`badge ${order.delivery_status}`}>
                    {statusLabel(order.delivery_status)}
                  </span>
                </td>

                <td>
                  <strong>{formatMoney(order.total_amount)}</strong>
                </td>

                <td>{formatDate(order.placed_at)}</td>

                <td>
                  {order.order_status === 'shipped' ? (
                    <button
                      className="success-btn"
                      disabled={receivingOrderId === order.id}
                      onClick={() => receiveOrder(order.id)}
                    >
                      <PackageCheck size={16} />
                      {receivingOrderId === order.id
                        ? 'Receiving...'
                        : 'Receive Stock'}
                    </button>
                  ) : (
                    <span className="muted">-</span>
                  )}
                </td>
              </tr>
            ))}

            {!orders.length && (
              <tr>
                <td colSpan="9" className="empty-cell">
                  No stockist purchase orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </DistributorShell>
  );
}