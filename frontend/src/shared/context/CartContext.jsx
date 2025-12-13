import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import PropTypes from "prop-types";
import apiClient from "../utils/apiClient";
import { useAuth } from "./AuthContext";

const CartStateContext = createContext(null);
const CartDispatchContext = createContext(null);

const initialState = {
  items: [],
  totalQuantity: 0,
  subtotal: 0,
  status: "idle",
  error: null,
};

function cartReducer(state, action) {
  switch (action.type) {
    case "REQUEST_START":
      return { ...state, status: "loading", error: null };
    case "REQUEST_SUCCESS":
      return {
        ...state,
        status: "idle",
        items: action.payload.items || [],
        totalQuantity: action.payload.totalQuantity || 0,
        subtotal: action.payload.subtotal || 0,
      };
    case "REQUEST_ERROR":
      return { ...state, status: "error", error: action.payload };
    default:
      return state;
  }
}

async function fetchCart(dispatch) {
  dispatch({ type: "REQUEST_START" });
  try {
    const data = await apiClient.get("/cart");
    dispatch({ type: "REQUEST_SUCCESS", payload: data });
  } catch (err) {
    dispatch({
      type: "REQUEST_ERROR",
      payload: err.message || "Failed to load cart",
    });
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart(dispatch);
    } else {
      dispatch({ type: "REQUEST_SUCCESS", payload: initialState });
    }
  }, [isAuthenticated]);

  const actions = useMemo(
    () => ({
      async addItem(bookId, quantity = 1) {
        dispatch({ type: "REQUEST_START" });
        try {
          const data = await apiClient.post("/cart/add", { bookId, quantity });
          dispatch({ type: "REQUEST_SUCCESS", payload: data });
        } catch (err) {
          dispatch({
            type: "REQUEST_ERROR",
            payload: err.message || "Failed to add item",
          });
          throw err;
        }
      },
      async updateItem(itemId, quantity) {
        dispatch({ type: "REQUEST_START" });
        try {
          const data = await apiClient.put(`/cart/${itemId}`, { quantity });
          dispatch({ type: "REQUEST_SUCCESS", payload: data });
        } catch (err) {
          dispatch({
            type: "REQUEST_ERROR",
            payload: err.message || "Failed to update item",
          });
          throw err;
        }
      },
      async removeItem(itemId) {
        dispatch({ type: "REQUEST_START" });
        try {
          const data = await apiClient.delete(`/cart/${itemId}`);
          dispatch({ type: "REQUEST_SUCCESS", payload: data });
        } catch (err) {
          dispatch({
            type: "REQUEST_ERROR",
            payload: err.message || "Failed to remove item",
          });
          throw err;
        }
      },
       async refetchCart() {
        await fetchCart(dispatch);
      },
    }),
    [dispatch]
  );

  return (
    <CartStateContext.Provider value={state}>
      <CartDispatchContext.Provider value={actions}>
        {children}
      </CartDispatchContext.Provider>
    </CartStateContext.Provider>
  );
}

CartProvider.propTypes = {
  children: PropTypes.node,
};

export function useCartState() {
  const context = useContext(CartStateContext);
  if (context === null) {
    throw new Error("useCartState must be used within a CartProvider");
  }
  return context;
}

export function useCartActions() {
  const context = useContext(CartDispatchContext);
  if (context === null) {
    throw new Error("useCartActions must be used within a CartProvider");
  }
  return context;
}
