import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { cartAPI } from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Cart drawer controls
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);

  // Fetch cart from backend
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const data = await cartAPI.get();
      const items =
        data.items || data.products || (Array.isArray(data) ? data : []);
      setCartItems(items);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh cart (alias for fetchCart)
  const refreshCart = useCallback(async () => {
    await fetchCart();
  }, [fetchCart]);

  // Refetch cart when auth status changes
  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, fetchCart]);

  // Add item to cart
  const addToCart = useCallback(
    async (product, selectedImage, selectedSize = null) => {
      try {
        await cartAPI.add(product._id, selectedImage, selectedSize);
        await fetchCart();
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    [fetchCart],
  );

  // Remove item from cart
  const removeFromCart = useCallback(
    async (productId, selectedImage, selectedSize = null) => {
      try {
        await cartAPI.remove(productId, selectedImage, selectedSize);
        await fetchCart();
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    [fetchCart],
  );

  // Clear cart
  const clearCart = useCallback(async () => {
    try {
      await cartAPI.clear();
      setCartItems([]);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Calculate totals
  const cartTotal = cartItems.reduce((sum, item) => {
    const price = item.product_id?.product_discounted_price || 0;
    return sum + price * (item.quantity || 1);
  }, 0);

  const cartCount = cartItems.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0,
  );

  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    clearCart,
    fetchCart,
    refreshCart,
    cartTotal,
    cartCount,
    isCartOpen,
    openCart,
    closeCart,
    toggleCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
