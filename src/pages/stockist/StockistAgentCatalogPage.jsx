import { useEffect, useState } from "react";
import {
  PackagePlus,
  RefreshCw,
  Save,
  Store,
} from "lucide-react";

import { DistributorShell } from "../../components/AppShell";
import Loader from "../../components/Loader";
import Toast from "../../components/Toast";

import {
  getStockistAgentInventory,
  saveStockistAgencyListing,
  updateStockistAgencyListing,
} from "../../api/agencyFlowApi";

import { storage } from "../../utils/storage";

const number = (value) => Number(value || 0);

const formatNumber = (value) =>
  number(value).toLocaleString("en-IN");

export default function StockistAgentCatalogPage() {
  const token = storage.getDistributorToken();
  const user = storage.getDistributorUser();

  const [items, setItems] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [toast, setToast] = useState(null);

  const load = async () => {
    setLoading(true);

    try {
      const response = await getStockistAgentInventory(token);
      const rows = response.data || [];

      setItems(rows);

      setDrafts(
        Object.fromEntries(
          rows.map((row) => [
            row.product_id,
            {
              agency_price: row.agency_price ?? "",
              min_order_qty: row.min_order_qty ?? 1,
              status: row.listing_status || "active",
              listing_id: row.listing_id || null,
            },
          ])
        )
      );
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

  const updateDraft = (productId, field, value) => {
    setDrafts((current) => ({
      ...current,
      [productId]: {
        ...current[productId],
        [field]: value,
      },
    }));
  };

  const save = async (item) => {
    const draft = drafts[item.product_id];

    const price = Number(draft?.agency_price);
    const minQty = Number(draft?.min_order_qty || 1);

    if (!Number.isFinite(price) || price < 0) {
      setToast({
        type: "error",
        message: "Enter a valid agency unit price.",
      });
      return;
    }

    if (!Number.isInteger(minQty) || minQty <= 0) {
      setToast({
        type: "error",
        message:
          "Minimum quantity must be a positive whole number.",
      });
      return;
    }

    if (minQty > number(item.available_stock)) {
      setToast({
        type: "error",
        message:
          "Minimum quantity cannot exceed available stock.",
      });
      return;
    }

    setSavingId(item.product_id);

    try {
      const payload = {
        product_id: item.product_id,
        agency_price: price,
        min_order_qty: minQty,
        status: draft.status,
      };

      if (draft.listing_id) {
        await updateStockistAgencyListing(
          token,
          draft.listing_id,
          payload
        );
      } else {
        await saveStockistAgencyListing(token, payload);
      }

      setToast({
        type: "success",
        message: "Agency catalog listing saved.",
      });

      await load();
    } catch (error) {
      setToast({
        type: "error",
        message: error.message,
      });
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <DistributorShell user={user}>
        <Loader label="Loading stockist inventory..." />
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
          <h2>List Products for Agencies</h2>
          <p className="muted">
            Only products in your available inventory can be
            published to agencies.
          </p>
        </div>

        <button className="secondary-btn" onClick={load}>
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="stats-grid three-stat-grid">
        <div className="stat-card">
          <Store />
          <p>Inventory Products</p>
          <h3>{items.length}</h3>
        </div>

        <div className="stat-card">
          <PackagePlus />
          <p>Active Listings</p>
          <h3>
            {
              items.filter(
                (item) => item.listing_status === "active"
              ).length
            }
          </h3>
        </div>

        <div className="stat-card">
          <PackagePlus />
          <p>Available Units</p>
          <h3>
            {formatNumber(
              items.reduce(
                (sum, item) =>
                  sum + number(item.available_stock),
                0
              )
            )}
          </h3>
        </div>
      </div>

      <section className="table-card wide-table">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Available</th>
              <th>Agency Unit Price</th>
              <th>Minimum Qty</th>
              <th>Visibility</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => {
              const draft = drafts[item.product_id] || {};
              const disabled =
                number(item.available_stock) <= 0;

              return (
                <tr key={item.product_id}>
                  <td>
                    <strong>{item.product_name}</strong>

                    <small>
                      {item.category_name || "-"}
                      {item.brand
                        ? ` · ${item.brand}`
                        : ""}
                    </small>
                  </td>

                  <td>{item.sku}</td>

                  <td>
                    <strong
                      className={
                        disabled
                          ? "stock-empty"
                          : "inventory-available"
                      }
                    >
                      {formatNumber(item.available_stock)}
                    </strong>
                  </td>

                  <td>
                    <input
                      type="number"
                      min="0"
                      disabled={disabled}
                      value={draft.agency_price}
                      placeholder="0.00"
                      onChange={(event) =>
                        updateDraft(
                          item.product_id,
                          "agency_price",
                          event.target.value
                        )
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      disabled={disabled}
                      value={draft.min_order_qty}
                      onChange={(event) =>
                        updateDraft(
                          item.product_id,
                          "min_order_qty",
                          event.target.value
                        )
                      }
                    />
                  </td>

                  <td>
                    <select
                      disabled={disabled}
                      value={draft.status || "active"}
                      onChange={(event) =>
                        updateDraft(
                          item.product_id,
                          "status",
                          event.target.value
                        )
                      }
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Hidden</option>
                    </select>
                  </td>

                  <td>
                    <button
                      className="primary-btn compact-btn"
                      disabled={
                        disabled ||
                        savingId === item.product_id
                      }
                      onClick={() => save(item)}
                    >
                      <Save size={15} />

                      {savingId === item.product_id
                        ? "Saving..."
                        : draft.listing_id
                        ? "Update"
                        : "List Item"}
                    </button>
                  </td>
                </tr>
              );
            })}

            {!items.length && (
              <tr>
                <td colSpan="7" className="empty-cell">
                  No stockist inventory is available. Ask admin to
                  allocate inventory or receive a stockist purchase
                  order first.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </DistributorShell>
  );
}