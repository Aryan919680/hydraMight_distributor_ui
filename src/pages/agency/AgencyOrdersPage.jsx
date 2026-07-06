import { useEffect, useState } from "react";
import {
  Clock3,
  PackageCheck,
  RefreshCw,
  Truck,
} from "lucide-react";

import { DistributorShell } from "../../components/AppShell";
import Loader from "../../components/Loader";
import Toast from "../../components/Toast";

import { getAgencyOrders } from "../../api/agencyFlowApi";
import { storage } from "../../utils/storage";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const date = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(value))
    : "-";

const label = (value) =>
  String(value || "").replace(/_/g, " ");

export default function AgencyOrdersPage() {
  const token = storage.getDistributorToken();
  const user = storage.getDistributorUser();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const load = async () => {
    setLoading(true);

    try {
      const response = await getAgencyOrders(token);
      setOrders(response.data || []);
    } catch (error) {
      setToast({
        type: "error",
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <DistributorShell user={user}>
        <Loader label="Loading agency orders..." />
      </DistributorShell>
    );
  }

  return (
    <DistributorShell user={user}>
      <Toast
        {...(toast || {})}
        onClose={() => setToast(null)}
      />

      <div className="page-header">
        <div>
          <p className="eyebrow">Agency Portal</p>
          <h2>My Orders</h2>

          <p className="muted">
            Track Stockist and HydraMight Admin fulfilled orders.
          </p>
        </div>

        <button className="secondary-btn" onClick={load}>
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="stats-grid three-stat-grid">
        <div className="stat-card">
          <Clock3 />
          <p>Awaiting Approval</p>
          <h3>
            {
              orders.filter((order) =>
                String(order.order_status).startsWith("pending_")
              ).length
            }
          </h3>
        </div>

        <div className="stat-card">
          <Truck />
          <p>Shipped</p>
          <h3>
            {
              orders.filter(
                (order) => order.order_status === "shipped"
              ).length
            }
          </h3>
        </div>

        <div className="stat-card">
          <PackageCheck />
          <p>Delivered</p>
          <h3>
            {
              orders.filter(
                (order) => order.order_status === "delivered"
              ).length
            }
          </h3>
        </div>
      </div>

      <section className="table-card wide-table">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Supplier</th>
              <th>Items</th>
              <th>Quantity</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Placed</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>
                  <strong>{order.order_number}</strong>
                  <small>{order.remarks || "-"}</small>
                </td>

                <td>
                  <strong>{order.supplier_name}</strong>
                  <small>{label(order.supplier_source)}</small>
                </td>

                <td>{order.item_count}</td>
                <td>{order.total_quantity}</td>

                <td>
                  <strong>{money(order.total_amount)}</strong>
                </td>

                <td>
                  <span
                    className={`badge ${order.payment_status}`}
                  >
                    {label(order.payment_status)}
                  </span>
                </td>

                <td>
                  <span
                    className={`badge ${order.order_status}`}
                  >
                    {label(order.order_status)}
                  </span>
                </td>

                <td>{date(order.placed_at)}</td>
              </tr>
            ))}

            {!orders.length && (
              <tr>
                <td colSpan="8" className="empty-cell">
                  No agency orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </DistributorShell>
  );
}