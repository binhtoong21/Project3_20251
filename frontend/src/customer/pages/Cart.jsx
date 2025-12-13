import "./cart.css";
import { useCartActions, useCartState } from "../../shared/context/CartContext";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../../shared/utils/formatters";

export default function Cart() {
  const navigate = useNavigate();
  const { items, totalQuantity, subtotal, status, error } = useCartState();
  const { updateItem, removeItem } = useCartActions();

  const isLoading = status === "loading" && items.length === 0;
  const isEmpty = !isLoading && items.length === 0;

  const handleDecrease = (itemId, currentQty) => {
    updateItem(itemId, currentQty - 1).catch(() => {});
  };

  const handleIncrease = (itemId, currentQty) => {
    updateItem(itemId, currentQty + 1).catch(() => {});
  };

  const handleManualChange = (itemId, value) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;
    updateItem(itemId, Math.floor(parsed)).catch(() => {});
  };

  return (
    <div className="page cart-page">
      <div className="container">
        <h2>Your Cart</h2>

        {isLoading && <p>Loading cart...</p>}

        {error && <p className="cart-error">{error}</p>}

        {isEmpty && !error && <p>Your cart is empty.</p>}

        {!isLoading && !isEmpty && (
          <div className="cart-content">
            <div className="cart-items">
              {items.map((item) => (
                <article className="cart-item" key={item._id}>
                  <div className="cart-item-cover">
                    <img
                      src={item.cover}
                      alt={item.title}
                      onError={(e) => {
                        e.currentTarget.src = `https://via.placeholder.com/80x110?text=${encodeURIComponent(
                          item.title
                        )}`;
                      }}
                    />
                  </div>
                  <div className="cart-item-info">
                    <h3>{item.title}</h3>
                    <p className="cart-item-price">{formatPrice(item.price)}</p>
                    <div className="cart-quantity-controls">
                      <button
                        type="button"
                        onClick={() => handleDecrease(item._id, item.quantity)}
                        aria-label={`Decrease quantity of ${item.title}`}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e) =>
                          handleManualChange(item._id, e.target.value)
                        }
                      />
                      <button
                        type="button"
                        onClick={() => handleIncrease(item._id, item.quantity)}
                        aria-label={`Increase quantity of ${item.title}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="cart-item-actions">
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => removeItem(item._id).catch(() => {})}
                    >
                      Remove
                    </button>
                    <p className="cart-item-total">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <aside className="cart-summary">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Items</span>
                <span>{totalQuantity}</span>
              </div>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <p className="summary-note">
                Shipping and taxes calculated at checkout.
              </p>
              <button
                type="button"
                className="btn primary"
                onClick={() => navigate("/checkout")}
                disabled={isLoading || isEmpty}
              >
                Checkout
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
