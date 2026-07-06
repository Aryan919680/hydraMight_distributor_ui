import { useEffect, useMemo, useState } from "react";
import {
  Minus,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  Store,
} from "lucide-react";

import { DistributorShell } from "../../components/AppShell";
import Loader from "../../components/Loader";
import Toast from "../../components/Toast";

import {
  getAgencyCatalog,
  placeAgencyOrder,
} from "../../api/agencyFlowApi";

import { storage } from "../../utils/storage";

const number = (value) => Number(value || 0);

const formatNumber = (value) =>
  number(value).toLocaleString("en-IN");

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(number(value));

const paymentOptions = [
  ["credit_terms", "Credit Terms"],
  ["upi", "UPI"],
  ["card", "Credit / Debit Card"],
  ["bank_transfer", "Bank Transfer"],
  ["cash_on_delivery", "Cash on Delivery"],
];

export default function AgencyCatalogPage() {
  const token = storage.getDistributorToken();
  const user = storage.getDistributorUser();

  const [catalog, setCatalog] = useState({
    items: [],
    supplier_source: "stockist",
    supplier_name: "",
    is_unassigned: false,
  });

  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState("credit_terms");

  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [toast, setToast] = useState(null);

  const load = async () => {
    setLoading(true);

    try {
      const response = await getAgencyCatalog(token);

      setCatalog(
        response.data || {
          items: [],
          supplier_source: "stockist",
          supplier_name: "",
          is_unassigned: false,
        }
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

  const products = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return catalog.items;
    }

    return catalog.items.filter((item) =>
      [
        item.product_name,
        item.sku,
        item.brand,
        item.category_name,
        item.supplier_name,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(keyword)
      )
    );
  }, [catalog.items, search]);

  const quantityForProduct = (
    productId,
    stockistId,
    excludingIndex = -1
  ) =>
    cart.reduce((sum, item, index) => {
      if (
        index === excludingIndex ||
        item.product.product_id !== productId ||
        item.product.stockist_id !== stockistId
      ) {
        return sum;
      }

      return sum + item.quantity;
    }, 0);

  const add = (product) => {
    const cartStockistId = cart[0]?.product?.stockist_id;

    /*
      One agency order = one Stockist.
      It keeps stock reservation, approval and delivery clear.
    */
    if (
      cartStockistId &&
      cartStockistId !== product.stockist_id
    ) {
      setToast({
        type: "error",
        message:
          "You can order from only one Stockist at a time. Place or clear the current cart first.",
      });
      return;
    }

    if (
      number(product.available_stock) <
      number(product.min_order_qty)
    ) {
      setToast({
        type: "error",
        message:
          "This product does not have enough available Stockist inventory.",
      });
      return;
    }

    const key = product.listing_id;

    setCart((items) => {
      const existing = items.find(
        (item) => item.product.listing_id === key
      );

      if (!existing) {
        return [
          ...items,
          {
            product,
            quantity: number(product.min_order_qty),
          },
        ];
      }

      const nextQuantity =
        existing.quantity + number(product.min_order_qty);

      if (nextQuantity > number(product.available_stock)) {
        setToast({
          type: "error",
          message: `Only ${formatNumber(
            product.available_stock
          )} units are available from this Stockist.`,
        });

        return items;
      }

      return items.map((item) =>
        item.product.listing_id === key
          ? {
              ...item,
              quantity: nextQuantity,
            }
          : item
      );
    });
  };

  const updateQuantity = (index, nextQuantity) => {
    if (nextQuantity <= 0) {
      setCart((items) =>
        items.filter(
          (_, currentIndex) => currentIndex !== index
        )
      );
      return;
    }

    const item = cart[index];

    if (!item) {
      return;
    }

    if (nextQuantity < number(item.product.min_order_qty)) {
      setToast({
        type: "error",
        message: `Minimum order quantity is ${item.product.min_order_qty}.`,
      });
      return;
    }

    const selectedQuantity =
      quantityForProduct(
        item.product.product_id,
        item.product.stockist_id,
        index
      ) + nextQuantity;

    if (selectedQuantity > number(item.product.available_stock)) {
      setToast({
        type: "error",
        message: `Only ${formatNumber(
          item.product.available_stock
        )} units are available from this Stockist.`,
      });
      return;
    }

    setCart((items) =>
      items.map((current, currentIndex) =>
        currentIndex === index
          ? {
              ...current,
              quantity: nextQuantity,
            }
          : current
      )
    );
  };

  const totalQuantity = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const total = cart.reduce(
    (sum, item) =>
      sum +
      number(item.product.unit_price) * item.quantity,
    0
  );

  const selectedStockistName =
    cart[0]?.product?.supplier_name || null;

  const selectedStockistId =
    cart[0]?.product?.stockist_id || null;

  const placeOrder = async () => {
    if (!cart.length || !selectedStockistId) {
      setToast({
        type: "error",
        message: "Add products from a Stockist catalogue first.",
      });
      return;
    }

    setPlacing(true);

    try {
      const response = await placeAgencyOrder(token, {
        stockist_id: selectedStockistId,
        payment_method: paymentMethod,
        remarks: remarks.trim() || undefined,
        items: cart.map((item) => ({
          product_id: item.product.product_id,
          listing_id: item.product.listing_id,
          quantity: item.quantity,
        })),
      });

      setCart([]);
      setRemarks("");

      setToast({
        type: "success",
        message:
          response.message ||
          "Agency order placed successfully.",
      });

      await load();
    } catch (error) {
      setToast({
        type: "error",
        message: error.message,
      });
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <DistributorShell user={user}>
        <Loader label="Loading Stockist catalogues..." />
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
          <h2>Order Products</h2>

          <p className="muted">
            {catalog.is_unassigned
              ? "You are not assigned to one Stockist. Browse active Stockist catalogues and choose one for each order."
              : `Ordering from your assigned Stockist: ${catalog.supplier_name}.`}
          </p>
        </div>

        <button className="secondary-btn" onClick={load}>
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="agency-shop-layout">
        <section className="table-card catalog-card">
          <div className="catalog-heading">
            <div>
              <h3>
                <Store size={20} />
                {catalog.is_unassigned
                  ? "Stockist Catalogues"
                  : "Assigned Stockist Catalogue"}
              </h3>

              <p>
                Prices, minimum quantities and availability are set
                by each Stockist.
              </p>
            </div>

            <div className="search-box catalog-search">
              <Search size={18} />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search product, SKU or Stockist"
              />
            </div>
          </div>

          <div className="catalog-list">
            {products.map((product) => (
              <article
                className="product-card"
                key={product.listing_id}
              >
                <div className="product-card-top">
                  <div>
                    <h3>{product.product_name}</h3>

                    <p className="muted small-text">
                      SKU: {product.sku}
                      {product.brand
                        ? ` · ${product.brand}`
                        : ""}
                      {product.category_name
                        ? ` · ${product.category_name}`
                        : ""}
                    </p>

                    <p className="stockist-supplier-name">
                      Sold by: <strong>{product.supplier_name}</strong>
                    </p>

                    {product.short_description && (
                      <p className="product-description">
                        {product.short_description}
                      </p>
                    )}
                  </div>

                  <span className="stock-pill in-stock">
                    {formatNumber(product.available_stock)} available
                  </span>
                </div>

                <div className="agency-product-buy">
                  <div>
                    <span>Unit Price</span>
                    <strong>{money(product.unit_price)}</strong>
                  </div>

                  <div>
                    <span>Minimum Qty</span>
                    <strong>
                      {formatNumber(product.min_order_qty)}
                    </strong>
                  </div>

                  <button
                    className="primary-btn"
                    onClick={() => add(product)}
                  >
                    <Plus size={16} />
                    Add to Order
                  </button>
                </div>
              </article>
            ))}

            {!products.length && (
              <div className="empty-state">
                No Stockist products are currently available.
              </div>
            )}
          </div>
        </section>

        <aside className="purchase-cart">
          <div className="purchase-cart-heading">
            <ShoppingCart size={20} />

            <div>
              <h3>Order Cart</h3>

              <p>
                {selectedStockistName
                  ? `Order will be sent to ${selectedStockistName}.`
                  : "Choose products from one Stockist."}
              </p>
            </div>
          </div>

          {cart.length ? (
            <>
              <div className="cart-items">
                {cart.map((item, index) => (
                  <div
                    className="cart-item"
                    key={item.product.listing_id}
                  >
                    <h4>{item.product.product_name}</h4>

                    <p>
                      {item.product.sku} · Minimum{" "}
                      {formatNumber(item.product.min_order_qty)}
                    </p>

                    <div className="cart-item-footer">
                      <div className="quantity-controls">
                        <button
                          onClick={() =>
                            updateQuantity(
                              index,
                              item.quantity - 1
                            )
                          }
                        >
                          <Minus size={15} />
                        </button>

                        <strong>{item.quantity}</strong>

                        <button
                          onClick={() =>
                            updateQuantity(
                              index,
                              item.quantity + 1
                            )
                          }
                        >
                          <Plus size={15} />
                        </button>
                      </div>

                      <strong>
                        {money(
                          number(item.product.unit_price) *
                            item.quantity
                        )}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>

              <label>Payment Method</label>

              <select
                value={paymentMethod}
                onChange={(event) =>
                  setPaymentMethod(event.target.value)
                }
              >
                {paymentOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <label>Remarks (Optional)</label>

              <textarea
                rows="3"
                value={remarks}
                onChange={(event) =>
                  setRemarks(event.target.value)
                }
                placeholder="Delivery instructions or purchase note"
              />

              <div className="cart-summary">
                <div>
                  <span>Total Quantity</span>
                  <strong>{formatNumber(totalQuantity)}</strong>
                </div>

                <div className="cart-summary-total">
                  <span>Total Order Value</span>
                  <strong>{money(total)}</strong>
                </div>
              </div>

              <button
                className="primary-btn full"
                disabled={placing}
                onClick={placeOrder}
              >
                <ShoppingCart size={17} />
                {placing
                  ? "Placing Order..."
                  : "Place Agency Order"}
              </button>
            </>
          ) : (
            <div className="empty-cart">
              <ShoppingCart size={32} />
              <p>Your cart is empty.</p>
              <small>
                Add products from one Stockist catalogue.
              </small>
            </div>
          )}
        </aside>
      </div>
    </DistributorShell>
  );
}