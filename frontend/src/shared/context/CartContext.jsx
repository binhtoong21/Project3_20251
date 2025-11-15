import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import PropTypes from 'prop-types';
import { apiDelete, apiGet, apiPost, apiPut } from '../utils/apiClient';

const CartStateContext = createContext(null);
const CartDispatchContext = createContext(null);

const CART_STORAGE_KEY = 'bookstore_cart';

function saveCartToLocalStorage(cartState) {
  try {
    const serializedState = JSON.stringify({
      items: cartState.items,
      summary: cartState.summary
    });
    localStorage.setItem(CART_STORAGE_KEY, serializedState);
  } catch (error) {
    console.error("Failed to save cart to local storage:", error);
  }
}

function loadCartFromLocalStorage() {
  try {
    const serializedState = localStorage.getItem(CART_STORAGE_KEY);
    if (serializedState === null) {
      return undefined; 
    }
    return JSON.parse(serializedState);
  } catch (error) {
    console.error("Failed to load cart from local storage:", error);
    return undefined; 
  }
}

const initialState = {
  items: [],
  summary: {
    subtotal: 0,
    totalQuantity: 0
  },
  status: 'idle',
  error: null
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, status: 'loading', error: null };
    case 'LOAD_SUCCESS':
      return { ...state, status: 'idle', items: action.payload.items, summary: action.payload.summary };
    case 'LOAD_ERROR':
      return { ...state, status: 'error', error: action.payload };
    default:
      return state;
  }
}

async function fetchCart(dispatch) {
  dispatch({ type: 'LOAD_START' });
  try {
    const data = await apiGet('/cart');
    dispatch({ type: 'LOAD_SUCCESS', payload: data });
  } catch (err) {
    dispatch({ type: 'LOAD_ERROR', payload: err.message || 'Failed to load cart' });
  }
}

export function CartProvider({ children }) {
  
  const [state, dispatch] = useReducer(cartReducer, initialState, (init) => {
    const storedCart = loadCartFromLocalStorage();
    return storedCart ? { ...init, items: storedCart.items, summary: storedCart.summary } : init;
  });

  
  useEffect(() => {
    fetchCart(dispatch);
  }, []);

  
  useEffect(() => {
    if (state.status === 'idle') { 
      saveCartToLocalStorage(state);
    }
  }, [state.items, state.summary, state.status]);


  const actions = useMemo(() => ({
    async refresh() {
      await fetchCart(dispatch);
    },
    async addItem(bookId, quantity = 1) {
      dispatch({ type: 'LOAD_START' });
      try {
        const data = await apiPost('/cart/add', { bookId, quantity });
        dispatch({ type: 'LOAD_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'LOAD_ERROR', payload: err.message || 'Failed to add item' });
        throw err;
      }
    },
    async updateItem(bookId, quantity) {
      dispatch({ type: 'LOAD_START' });
      try {
        const data = await apiPut(`/cart/${bookId}`, { quantity });
        dispatch({ type: 'LOAD_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'LOAD_ERROR', payload: err.message || 'Failed to update item' });
        throw err;
      }
    },
    async removeItem(bookId) {
      dispatch({ type: 'LOAD_START' });
      try {
        const data = await apiDelete(`/cart/${bookId}`);
        dispatch({ type: 'LOAD_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'LOAD_ERROR', payload: err.message || 'Failed to remove item' });
        throw err;
      }
    }
  }), []);

  return (
    <CartStateContext.Provider value={state}>
      <CartDispatchContext.Provider value={actions}>
        {children}
      </CartDispatchContext.Provider>
    </CartStateContext.Provider>
  );
}

CartProvider.propTypes = {
  children: PropTypes.node
};

export function useCartState() {
  const context = useContext(CartStateContext);
  if (context === null) {
    throw new Error('useCartState must be used within a CartProvider');
  }
  return context;
}

export function useCartActions() {
  const context = useContext(CartDispatchContext);
  if (context === null) {
    throw new Error('useCartActions must be used within a CartProvider');
  }
  return context;
}
