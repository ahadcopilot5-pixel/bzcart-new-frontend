import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  HiX,
  HiOutlineShoppingCart,
  HiOutlineLocationMarker,
} from "react-icons/hi";
import { useCart } from "../../context/CartContext";
import { showToast } from "../../utils/helpers";
import FaviconSpinner from "./FaviconSpinner";

const CartDrawer = () => {
  const {
    cartItems,
    cartCount,
    cartTotal,
    isCartOpen,
    closeCart,
    removeFromCart,
    loading,
  } = useCart();

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") closeCart();
    };
    if (isCartOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen, closeCart]);

  const handleRemoveItem = async (item) => {
    const result = await removeFromCart(
      item.product_id?._id,
      item.selected_image,
      item.selected_size,
    );
    if (result?.success) {
      showToast.success("Item removed from cart");
    } else {
      showToast.error("Failed to remove item");
    }
  };

  const formatPrice = (price) => {
    return `Rs.${Number(price || 0).toLocaleString()} PKR`;
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md transform transition-transform duration-300 ease-in-out">
        <div className="flex h-full flex-col bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <HiOutlineShoppingCart size={24} />
              Your Cart ({cartCount})
            </h2>
            <button
              type="button"
              onClick={closeCart}
              className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <HiX size={24} />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <FaviconSpinner size={44} showGlow />
              </div>
            ) : cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-10">
                <HiOutlineShoppingCart
                  size={64}
                  className="text-gray-300 mb-4"
                />
                <p className="text-gray-500 text-lg mb-2">Your cart is empty</p>
                <p className="text-gray-400 text-sm mb-4">
                  Add some items to get started
                </p>
                <button
                  onClick={closeCart}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors mb-4"
                >
                  Continue Shopping
                </button>
                <Link
                  to="/tracking"
                  onClick={closeCart}
                  className="flex items-center justify-center gap-2 text-sm text-orange-500 hover:text-orange-600 transition-colors"
                >
                  <HiOutlineLocationMarker size={16} />
                  Track Your Order
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {cartItems.map((item, index) => {
                  const product = item.product_id;
                  if (!product) return null;

                  return (
                    <li key={`${product._id}-${index}`} className="py-4 flex">
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={
                            item.selected_image ||
                            product.product_images?.[0] ||
                            "/placeholder.png"
                          }
                          alt={product.product_title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="ml-4 flex-1 flex flex-col">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                              {product.product_title}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              {item.selected_size &&
                                `Size: ${item.selected_size}`}
                              {item.selected_size &&
                                item.selected_color &&
                                " | "}
                              {item.selected_color &&
                                `Color: ${item.selected_color}`}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatPrice(product.product_discounted_price)}
                          </p>
                        </div>

                        <div className="mt-auto flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            Qty: {item.quantity || 1}
                          </span>
                          <button
                            onClick={() => handleRemoveItem(item)}
                            className="text-sm text-red-500 hover:text-red-600 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-4 space-y-4">
              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>Subtotal</p>
                <p>{formatPrice(cartTotal)}</p>
              </div>
              <p className="text-sm text-gray-500">
                Shipping and taxes calculated at checkout.
              </p>
              <Link
                to="/checkout"
                onClick={closeCart}
                className="flex items-center justify-center w-full px-6 py-3 bg-orange-500 text-white text-base font-medium rounded-lg hover:bg-orange-600 transition-colors"
              >
                Checkout
              </Link>
              <button
                onClick={closeCart}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Continue Shopping
              </button>
              <Link
                to="/tracking"
                onClick={closeCart}
                className="flex items-center justify-center gap-2 w-full text-center text-sm text-orange-500 hover:text-orange-600 transition-colors pt-2 border-t border-gray-100 mt-2"
              >
                <HiOutlineLocationMarker size={16} />
                Track Your Order
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
