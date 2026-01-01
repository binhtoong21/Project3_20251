import "./cart.css";
import { useCartActions, useCartState } from "../../shared/context/CartContext";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../../shared/utils/formatters";
import { useProfileCheck } from "../../shared/hooks/useProfileCheck";

export default function Cart() {
  const navigate = useNavigate();
  const checkProfile = useProfileCheck();
  const { items, totalQuantity, subtotal, status, error } = useCartState();
  const { updateItem, removeItem } = useCartActions();

  const isLoading = status === "loading" && items.length === 0;
  const isEmpty = !isLoading && items.length === 0;

  const handleDecrease = (itemId, currentQty) => {
    updateItem(itemId, currentQty - 1).catch(() => {});
  };

  const handleIncrease = (itemId, currentQty, maxStock) => {
    if (currentQty >= maxStock) {
      alert(`Xin lỗi, chỉ còn ${maxStock} cuốn trong kho.`);
      return;
    }
    updateItem(itemId, currentQty + 1).catch((err) => {
      alert(err.message); // Bắt lỗi từ Backend 
    });
  };

  const handleManualChange = (itemId, value, maxStock) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;

    // Logic chặn UI
    if (parsed > maxStock) {
      alert(`Không thể đặt quá số lượng tồn kho (${maxStock})`);
      return;
    }
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
              {items.map((item) => {
                const currentStock = item.book ? item.book.stock : 0;

                return (
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
                      <p className="cart-item-price">
                        {formatCurrency(item.price)}
                      </p>

                      {currentStock < item.quantity && (
                        <p style={{ color: "red", fontSize: "0.8rem" }}>
                          Kho chỉ còn {currentStock} cuốn. Vui lòng giảm số
                          lượng.
                        </p>
                      )}

                      <div className="cart-quantity-controls">
                        <button
                          type="button"
                          onClick={() =>
                            handleDecrease(item._id, item.quantity)
                          }
                        >
                          -
                        </button>

                        <input
                          type="number"
                          min="1"
                          max={currentStock}
                          value={item.quantity}
                          onChange={(e) =>
                            handleManualChange(
                              item._id,
                              e.target.value,
                              currentStock
                            )
                          }
                        />

                        <button
                          type="button"
                          onClick={() =>
                            handleIncrease(
                              item._id,
                              item.quantity,
                              currentStock
                            )
                          }
                          disabled={item.quantity >= currentStock}
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
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="cart-summary">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Items</span>
                <span>{totalQuantity}</span>
              </div>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <p className="summary-note">
                Shipping and taxes calculated at checkout.
              </p>
              <button
                type="button"
                className="btn primary"
                onClick={() => checkProfile(() => navigate("/checkout"))}
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

