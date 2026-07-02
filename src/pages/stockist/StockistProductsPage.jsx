import { useEffect, useMemo, useState } from 'react';
import {
  Minus,
  PackageSearch,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
} from 'lucide-react';

import { DistributorShell } from '../../components/AppShell';
import Loader from '../../components/Loader';
import Toast from '../../components/Toast';
import {
  getStockistProducts,
  placeStockistOrder,
} from '../../api/stockistApi';
import { storage } from '../../utils/storage';

const PAYMENT_METHODS = [
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Credit / Debit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cash_on_delivery', label: 'Cash on Delivery' },
  { value: 'credit_terms', label: 'Credit Terms' },
];

const number = (value) => Number(value || 0);

const formatNumber = (value) =>
  number(value).toLocaleString('en-IN');

const formatMoney = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(number(value));

export default function StockistProductsPage() {
  const token = storage.getDistributorToken();
  const user = storage.getDistributorUser();

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [toast, setToast] = useState(null);

  const loadProducts = async () => {
    setLoading(true);

    try {
      const response = await getStockistProducts(token);
      setProducts(response.data || []);
    } catch (error) {
      setToast({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return products;
    }

    return products.filter((product) =>
      [
        product.product_name,
        product.sku,
        product.brand,
        product.category_name,
      ].some((value) =>
        String(value || '').toLowerCase().includes(keyword)
      )
    );
  }, [products, search]);

  const productQuantityInCart = (
    productId,
    excludedIndex = -1
  ) =>
    cart.reduce((sum, item, index) => {
      if (
        index === excludedIndex ||
        item.product.product_id !== productId
      ) {
        return sum;
      }

      return (
        sum +
        number(item.slab.moq_quantity) * number(item.lot_count)
      );
    }, 0);

  const addToCart = (product, slab) => {
    const remainingStock =
      number(product.distributor_available_stock) -
      productQuantityInCart(product.product_id);

    if (remainingStock < number(slab.moq_quantity)) {
      setToast({
        type: 'error',
        message: `Only ${formatNumber(
          Math.max(remainingStock, 0)
        )} units are available for ${product.product_name}.`,
      });

      return;
    }

    const key = `${product.product_id}:${slab.id}`;

    setCart((items) => {
      const existing = items.find(
        (item) =>
          `${item.product.product_id}:${item.slab.id}` === key
      );

      if (!existing) {
        return [...items, { product, slab, lot_count: 1 }];
      }

      return items.map((item) =>
        `${item.product.product_id}:${item.slab.id}` === key
          ? {
              ...item,
              lot_count: item.lot_count + 1,
            }
          : item
      );
    });
  };

  const updateLotCount = (index, nextLotCount) => {
    if (nextLotCount <= 0) {
      setCart((items) =>
        items.filter((_, itemIndex) => itemIndex !== index)
      );

      return;
    }

    const current = cart[index];

    if (!current) {
      return;
    }

    const selectedQuantity =
      productQuantityInCart(current.product.product_id, index) +
      number(current.slab.moq_quantity) * nextLotCount;

    if (
      selectedQuantity >
      number(current.product.distributor_available_stock)
    ) {
      setToast({
        type: 'error',
        message: `Only ${formatNumber(
          current.product.distributor_available_stock
        )} units are available for ${current.product.product_name}.`,
      });

      return;
    }

    setCart((items) =>
      items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              lot_count: nextLotCount,
            }
          : item
      )
    );
  };

  const cartQuantity = cart.reduce(
    (sum, item) =>
      sum + number(item.slab.moq_quantity) * number(item.lot_count),
    0
  );

  const cartTotal = cart.reduce(
    (sum, item) =>
      sum +
      number(item.slab.selling_price) * number(item.lot_count),
    0
  );

  const submitOrder = async () => {
    if (!cart.length) {
      setToast({
        type: 'error',
        message: 'Add at least one MOQ lot before placing an order.',
      });

      return;
    }

    setPlacing(true);

    try {
      const response = await placeStockistOrder(token, {
        payment_method: paymentMethod,
        remarks: remarks.trim() || undefined,
        items: cart.map((item) => ({
          product_id: item.product.product_id,
          moq_price_id: item.slab.id,
          lot_count: item.lot_count,
        })),
      });

      setCart([]);
      setRemarks('');

      setToast({
        type: 'success',
        message:
          response.message ||
          'Order placed and shipped. Check My Orders to receive stock.',
      });

      await loadProducts();
    } catch (error) {
      setToast({
        type: 'error',
        message: error.message,
      });
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <DistributorShell user={user}>
        <Loader label="Loading admin product catalog..." />
      </DistributorShell>
    );
  }

  return (
    <DistributorShell user={user}>
      <Toast {...(toast || {})} onClose={() => setToast(null)} />

      <div className="page-header">
        <div>
          <p className="eyebrow">Stockist Portal</p>
          <h2>Buy Products</h2>
          <p className="muted">
            Active products created by admin are shown here. Select MOQ
            lots and place a direct shipment order.
          </p>
        </div>

        <button className="secondary-btn" onClick={loadProducts}>
          <RefreshCw size={17} /> Refresh
        </button>
      </div>

      <div className="stockist-layout">
        <section className="table-card catalog-card">
          <div className="catalog-heading">
            <div>
              <h3>
                <PackageSearch size={20} /> Admin Product Catalog
              </h3>
              <p>MOQ selling prices are global for every stockist.</p>
            </div>

            <div className="search-box catalog-search">
              <Search size={18} />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search product, SKU or brand"
              />
            </div>
          </div>

          <div className="catalog-list">
            {filteredProducts.map((product) => (
              <article
                className="product-card"
                key={product.product_id}
              >
                <div className="product-card-top">
                  <div>
                    <h3>{product.product_name}</h3>

                    <p className="muted small-text">
                      SKU: {product.sku}
                      {product.brand ? ` · ${product.brand}` : ''}
                      {product.category_name
                        ? ` · ${product.category_name}`
                        : ''}
                    </p>

                    {product.short_description && (
                      <p className="product-description">
                        {product.short_description}
                      </p>
                    )}
                  </div>

                  <span
                    className={`stock-pill ${
                      number(product.distributor_available_stock) > 0
                        ? 'in-stock'
                        : 'out-stock'
                    }`}
                  >
                    {number(product.distributor_available_stock) > 0
                      ? `${formatNumber(
                          product.distributor_available_stock
                        )} available`
                      : 'Out of stock'}
                  </span>
                </div>

                <div className="moq-grid">
                  {(product.moq_pricing || []).map((slab) => {
                    const canBuy =
                      number(product.distributor_available_stock) >=
                      number(slab.moq_quantity);

                    return (
                      <div className="moq-card" key={slab.id}>
                        <p className="moq-label">MOQ</p>

                        <strong>
                          {formatNumber(slab.moq_quantity)} units
                        </strong>

                        <p className="moq-price">
                          {formatMoney(slab.selling_price)}
                        </p>

                        <button
                          className="primary-btn moq-button"
                          disabled={!canBuy}
                          onClick={() => addToCart(product, slab)}
                        >
                          <Plus size={16} />
                          {canBuy ? 'Add Lot' : 'Unavailable'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}

            {!filteredProducts.length && (
              <div className="empty-state">
                No admin-created distributor products were found.
              </div>
            )}
          </div>
        </section>

        <aside className="purchase-cart">
          <div className="purchase-cart-heading">
            <ShoppingCart size={20} />

            <div>
              <h3>Purchase Cart</h3>
              <p>Orders are shipped immediately.</p>
            </div>
          </div>

          {cart.length ? (
            <>
              <div className="cart-items">
                {cart.map((item, index) => (
                  <div
                    className="cart-item"
                    key={`${item.product.product_id}:${item.slab.id}`}
                  >
                    <h4>{item.product.product_name}</h4>

                    <p>
                      {item.product.sku} · MOQ{' '}
                      {formatNumber(item.slab.moq_quantity)}
                    </p>

                    <div className="cart-item-footer">
                      <div className="quantity-controls">
                        <button
                          onClick={() =>
                            updateLotCount(index, item.lot_count - 1)
                          }
                        >
                          <Minus size={15} />
                        </button>

                        <strong>{item.lot_count}</strong>

                        <button
                          onClick={() =>
                            updateLotCount(index, item.lot_count + 1)
                          }
                        >
                          <Plus size={15} />
                        </button>
                      </div>

                      <strong>
                        {formatMoney(
                          number(item.slab.selling_price) *
                            item.lot_count
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
                {PAYMENT_METHODS.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>

              <label>Remarks (Optional)</label>

              <textarea
                rows="3"
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
                placeholder="Delivery instructions or purchase note"
              />

              <div className="cart-summary">
                <div>
                  <span>Total Quantity</span>
                  <strong>{formatNumber(cartQuantity)}</strong>
                </div>

                <div className="cart-summary-total">
                  <span>Total Order Value</span>
                  <strong>{formatMoney(cartTotal)}</strong>
                </div>
              </div>

              <button
                className="primary-btn full"
                disabled={placing}
                onClick={submitOrder}
              >
                <ShoppingCart size={17} />
                {placing ? 'Placing Order...' : 'Place & Ship Order'}
              </button>
            </>
          ) : (
            <div className="empty-cart">
              <ShoppingCart size={32} />
              <p>Your purchase cart is empty.</p>
              <small>Add MOQ lots from the admin product catalog.</small>
            </div>
          )}
        </aside>
      </div>
    </DistributorShell>
  );
}