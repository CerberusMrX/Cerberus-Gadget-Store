/**
 * CERBERUS GADGET STORE - Cart Context
 * File: frontend-react/src/context/CartContext.jsx
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user, isRole } = useAuth();
  const [cart, setCart]         = useState({ items: [], total: 0 });
  const [loading, setLoading]   = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user || !isRole('customer')) return;
    try {
      setLoading(true);
      const res = await api.get('/cart');
      setCart(res.data.data);
    } catch {} finally { setLoading(false); }
  }, [user, isRole]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (product_id, quantity = 1) => {
    try {
      await api.post('/cart/add', { product_id, quantity });
      toast.success('Added to cart!');
      await fetchCart();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const updateItem = async (itemId, quantity) => {
    try {
      await api.put(`/cart/${itemId}`, { quantity });
      await fetchCart();
    } catch {}
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`);
      await fetchCart();
    } catch {}
  };

  const clearCart = async () => {
    try { await api.delete('/cart/clear'); await fetchCart(); } catch {}
  };

  const cartCount = cart.items?.reduce((sum, i) => sum + (i.QUANTITY || 0), 0) || 0;

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateItem, removeItem, clearCart, cartCount, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
};
