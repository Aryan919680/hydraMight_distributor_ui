import { useEffect, useState } from "react";
import {
  CheckCircle2,
  RefreshCw,
  Truck,
  XCircle,
} from "lucide-react";

import { DistributorShell } from "../../components/AppShell";
import Loader from "../../components/Loader";
import Toast from "../../components/Toast";

import {
  approveStockistAgencyOrder,
  getStockistAgencyOrders,
  rejectStockistAgencyOrder,
} from "../../api/agencyFlowApi";

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

export default function StockistAgencyOrdersPage() {
  const token = storage.getDistributorToken();
  const user = storage.getDistributorUser();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [toast, setToast] = useState(null);

  const load = async () => {
    setLoading(true);

    try {
      const response = await getStockistAgencyOrders(token);
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

  const act = async (order, action) => {
    setActionId(order.id);

    try {
      const response =
        action === "approve"
          ? await approveStockistAgencyOrder(
              token,
              order.id
            )
          : await rejectStockistAgencyOrder(
              token,
              order.id,
              "Rejected by stockist from portal"
            );

      setToast({
        type: "success",
        message: response.message,
      });

      await load();
    } catch (error) {
      setToast({
        type: "error",
        message: error.message,
      });
    } finally {
      setActionId(null);
    }
  };

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
          <p className="eyebrow">Stockist Portal</p>
          <h2>Agency Orders</h2>
          <p className="muted">
            Approval deducts reserved stock and marks the order
            as shipped.
          </p>
        </div>

        <button className="secondary-btn" onClick={load}>
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="stats-grid three-stat-grid">
        <div className="stat-card">
          <Truck />
          <p>Pending Review</p>
          <h3>
            {
              orders.filter(
                (order) =>
                  order.order_status ===
                  "pending_stockist_approval"
              ).length
            }
          </h3>
        </div>

        <div className="stat-card">
          <CheckCircle2 />
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
          <XCircle />
          <p>Rejected</p>
          <h3>
            {
              orders.filter(
                (order) => order.order_status === "rejected"
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
              <th>Agency</th>
              <th>Items</th>
              <th>Quantity</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Placed</th>
              <th>Action</th>
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
                  <strong>{order.agency_business_name}</strong>
                  <small>
                    {order.agency_contact_person} ·{" "}
                    {order.agency_mobile}
                  </small>
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

                <td>
                  {order.order_status ===
                  "pending_stockist_approval" ? (
                    <div className="row-actions">
                      <button
                        className="success-btn"
                        disabled={actionId === order.id}
                        onClick={() =>
                          act(order, "approve")
                        }
                      >
                        <CheckCircle2 size={15} />
                        Approve & Ship
                      </button>

                      <button
                        className="danger-btn"
                        disabled={actionId === order.id}
                        onClick={() =>
                          act(order, "reject")
                        }
                      >
                        <XCircle size={15} />
                        Reject
                      </button>
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}

            {!orders.length && (
              <tr>
                <td colSpan="9" className="empty-cell">
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