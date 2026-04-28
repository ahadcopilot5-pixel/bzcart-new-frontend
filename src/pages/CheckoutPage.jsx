import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Footer } from "../components/layout";
import { cartAPI, orderAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { showToast } from "../utils/helpers";

// Format price helper
const formatPrice = (price) => {
  return `Rs.${Number(price).toLocaleString()} PKR`;
};

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshCart, clearCart } = useCart();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const [currentStep, setCurrentStep] = useState(1);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [shippingData, setShippingData] = useState({
    name: user?.first_name ? `${user.first_name} ${user.last_name || ""}` : "",
    email: user?.email || "",
    mobile: user?.phone || "",
    province: "",
    city: "",
    address: "",
    postalCode: "",
    sameAsShipping: false,
  });
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Fetch cart from backend
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const data = await cartAPI.get();
      // Backend returns array directly, or may return { products: [...] }
      const items = Array.isArray(data)
        ? data
        : data.products || data.items || [];
      // Map cart items to component format
      const mappedItems = items.map((item) => ({
        id: item.product_id?._id || item.product_id,
        name: item.product_id?.product_name || item.product_name || "Product",
        variant: item.selected_size || "",
        color: item.selected_color || null,
        price: item.product_id?.product_discounted_price || item.price || 0,
        quantity: item.quantity || 1,
        image:
          item.selected_image ||
          item.product_id?.product_images?.[0] ||
          "/placeholder.png",
        productData: item.product_id,
      }));
      setCartItems(mappedItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Update shippingData when user changes
  useEffect(() => {
    if (user) {
      setShippingData((prev) => ({
        ...prev,
        name: prev.name || `${user.first_name} ${user.last_name || ""}`.trim(),
        email: prev.email || user.email || "",
        mobile: prev.mobile || user.phone || "",
      }));
    }
  }, [user]);

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const shipping = 0; // Free shipping

  const updateQuantity = async (id, change) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;

    const newQuantity = item.quantity + change;
    if (newQuantity < 1) return;

    // Optimistic update
    setCartItems((items) =>
      items.map((i) => (i.id === id ? { ...i, quantity: newQuantity } : i)),
    );

    try {
      if (change > 0) {
        await cartAPI.add(
          id,
          item.image,
          item.variant || null,
          item.color || null,
        );
      } else {
        await cartAPI.remove(
          id,
          item.image,
          item.variant || null,
          item.color || null,
        );
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      fetchCart(); // Refresh on error
    }
  };

  const removeItem = async (id) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;

    // Remove all quantities
    setCartItems((items) => items.filter((i) => i.id !== id));

    try {
      for (let i = 0; i < item.quantity; i++) {
        await cartAPI.remove(
          id,
          item.image,
          item.variant || null,
          item.color || null,
        );
      }
    } catch (error) {
      console.error("Error removing item:", error);
      fetchCart();
    }
  };

  const handleShippingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setShippingData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Place order (COD)
  const handlePlaceOrder = async () => {
    // Validate shipping data
    if (
      !shippingData.name ||
      !shippingData.email ||
      !shippingData.mobile ||
      !shippingData.address ||
      !shippingData.city ||
      !shippingData.province
    ) {
      showToast.error("Please fill in all required shipping information.");
      setCurrentStep(2);
      return;
    }

    if (cartItems.length === 0) {
      showToast.error("Your cart is empty.");
      return;
    }

    try {
      setSubmitting(true);

      // Format products for backend
      const products = cartItems.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        selected_image: item.image,
        selected_size: item.variant || null,
        selected_color: item.color || null,
      }));

      const orderData = {
        products,
        shipping_address: `${shippingData.address}, ${shippingData.city}, ${shippingData.province}`,
        order_email: shippingData.email,
        phone_number: shippingData.mobile,
        city: shippingData.city,
        full_name: shippingData.name,
        total_amount: total + shipping,
      };

      const response = await orderAPI.create(orderData);
      setOrderId(response.order?._id || response._id);
      setOrderPlaced(true);
      showToast.success("Order placed successfully!");

      // Clear cart after successful order
      await clearCart();
      await refreshCart();
    } catch (error) {
      console.error("Error placing order:", error);
      showToast.error("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { number: 1, label: "Cart" },
    { number: 2, label: "Address" },
    { number: 3, label: "Payment" },
  ];

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-white lg:bg-gray-50 flex flex-col">
        {/* Back Button */}
        <div className="px-4 py-4 lg:px-8">
          <Link
            to="/"
            className="text-gray-800 hover:text-orange-500 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>
        </div>

        {/* Success Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12 text-center">
          <div className="lg:bg-white lg:rounded-3xl lg:shadow-xl lg:p-16 lg:max-w-xl">
            {/* Success Illustration */}
            <div className="mb-8 relative">
              <div className="w-40 h-40 lg:w-48 lg:h-48 relative mx-auto">
                {/* Phone mockup */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl transform rotate-6"></div>
                <div className="absolute inset-2 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg
                        className="w-6 h-6 lg:w-8 lg:h-8 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div className="w-8 h-1 bg-gray-200 rounded mx-auto mb-1"></div>
                    <div className="w-6 h-1 bg-gray-200 rounded mx-auto"></div>
                  </div>
                </div>
                {/* Badge */}
                <div className="absolute -bottom-2 -left-2 w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg
                    className="w-8 h-8 lg:w-10 lg:h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                {/* Decorative stars */}
                <span className="absolute -top-2 right-0 text-yellow-400 text-lg lg:text-2xl">
                  ✦
                </span>
                <span className="absolute top-4 -right-4 text-orange-400 text-sm lg:text-lg">
                  ✦
                </span>
                {/* Mail icon */}
                <div className="absolute -top-2 -right-6 w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center transform rotate-12 shadow-md">
                  <svg
                    className="w-5 h-5 lg:w-6 lg:h-6 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Your order has been
              <br />
              placed successfully
            </h1>

            <p className="text-gray-500 text-sm lg:text-base leading-relaxed mb-8 max-w-xs lg:max-w-md mx-auto">
              Thank you for choosing us! Feel free to continue shopping and
              explore our wide range of products. Happy Shopping!
            </p>

            <Link
              to="/"
              className="inline-block w-full max-w-xs lg:max-w-sm bg-orange-500 text-white py-3.5 lg:py-4 rounded-full text-sm lg:text-base font-medium hover:bg-orange-600 transition-colors text-center shadow-lg hover:shadow-xl"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white lg:bg-gray-50">
      {/* Header */}
      <div className="px-4 py-4 lg:px-8 lg:py-6 flex items-center justify-between max-w-7xl mx-auto">
        <button
          onClick={() =>
            currentStep > 1 ? setCurrentStep(currentStep - 1) : null
          }
          className="text-gray-800 hover:text-orange-500 transition-colors"
        >
          <Link
            to={currentStep === 1 ? "/" : "#"}
            onClick={(e) => currentStep > 1 && e.preventDefault()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>
        </button>
        <h1 className="text-lg lg:text-2xl font-semibold">Checkout</h1>
        {currentStep === 1 ? (
          <button className="text-gray-400 hover:text-red-500 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 lg:h-6 lg:w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        ) : (
          <div className="w-6"></div>
        )}
      </div>

      {/* Progress Steps */}
      <div className="px-6 py-4 lg:py-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between lg:justify-center lg:gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex items-center">
                <div
                  className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-xs lg:text-sm font-medium transition-all ${
                    currentStep >= step.number
                      ? "bg-orange-500 text-white shadow-md"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {currentStep > step.number ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`ml-2 text-xs lg:text-sm ${
                    currentStep >= step.number
                      ? "text-gray-900 font-medium"
                      : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 sm:w-16 lg:w-24 h-0.5 mx-2 lg:mx-4 transition-colors ${
                    currentStep > step.number ? "bg-orange-500" : "bg-gray-200"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area - Desktop Layout */}
      <div className="max-w-7xl mx-auto lg:px-8 lg:pb-8">
        <div className="lg:flex lg:gap-8">
          {/* Content */}
          <div className="flex-1 px-4 pb-32 lg:pb-8 lg:px-0">
            <div className="lg:bg-white lg:rounded-2xl lg:shadow-sm lg:p-8">
              {/* Step 1: Cart */}
              {currentStep === 1 && (
                <div className="space-y-4 lg:space-y-0">
                  {/* Loading State */}
                  {loading ? (
                    <div className="py-12 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                    </div>
                  ) : cartItems.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-gray-500 mb-4">Your cart is empty</p>
                      <Link to="/" className="text-orange-500 hover:underline">
                        Continue Shopping
                      </Link>
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table Header */}
                      <div className="hidden lg:grid lg:grid-cols-12 lg:gap-4 lg:pb-4 lg:border-b lg:border-gray-200 lg:mb-4">
                        <div className="col-span-6 text-sm font-medium text-gray-500">
                          Product
                        </div>
                        <div className="col-span-2 text-sm font-medium text-gray-500 text-center">
                          Price
                        </div>
                        <div className="col-span-2 text-sm font-medium text-gray-500 text-center">
                          Quantity
                        </div>
                        <div className="col-span-2 text-sm font-medium text-gray-500 text-right">
                          Total
                        </div>
                      </div>

                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 py-4 border-b border-gray-100 lg:grid lg:grid-cols-12 lg:py-6 lg:items-center hover:bg-gray-50 lg:rounded-lg lg:px-2 transition-colors"
                        >
                          {/* Product Image */}
                          <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 lg:col-span-2">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Product Info - Mobile */}
                          <div className="flex-1 lg:hidden">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-gray-900">
                                  {item.name}
                                </h3>
                                {(item.variant || item.color) && (
                                  <p className="text-xs text-gray-400">
                                    {item.variant && `Size: ${item.variant}`}
                                    {item.variant && item.color && " | "}
                                    {item.color && `Color: ${item.color}`}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-orange-500 text-lg"
                              >
                                ×
                              </button>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <p className="font-medium text-gray-900">
                                {formatPrice(item.price)}
                              </p>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="text-gray-400 text-lg"
                                >
                                  -
                                </button>
                                <span className="text-sm font-medium w-4 text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="text-gray-400 text-lg"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Product Info - Desktop */}
                          <div className="hidden lg:flex lg:col-span-4 lg:flex-col">
                            <h3 className="font-medium text-gray-900 text-base">
                              {item.name}
                            </h3>
                            {(item.variant || item.color) && (
                              <p className="text-sm text-gray-400">
                                {item.variant && `Size: ${item.variant}`}
                                {item.variant && item.color && " | "}
                                {item.color && `Color: ${item.color}`}
                              </p>
                            )}
                          </div>

                          {/* Price - Desktop */}
                          <div className="hidden lg:flex lg:col-span-2 lg:justify-center">
                            <p className="font-medium text-gray-900">
                              {formatPrice(item.price)}
                            </p>
                          </div>

                          {/* Quantity - Desktop */}
                          <div className="hidden lg:flex lg:col-span-2 lg:justify-center">
                            <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="text-gray-500 hover:text-orange-500 transition-colors font-medium"
                              >
                                −
                              </button>
                              <span className="text-sm font-medium w-6 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="text-gray-500 hover:text-orange-500 transition-colors font-medium"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Total & Remove - Desktop */}
                          <div className="hidden lg:flex lg:col-span-2 lg:justify-end lg:items-center lg:gap-4">
                            <p className="font-semibold text-gray-900">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}

              {/* Step 2: Address */}
              {currentStep === 2 && (
                <div className="py-4 lg:py-0">
                  <h2 className="text-lg lg:text-xl font-semibold text-center mb-6 lg:mb-8">
                    Enter Shipping Details
                  </h2>

                  <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 lg:mb-2">
                        Full Name*
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={shippingData.name}
                        onChange={handleShippingChange}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3 lg:py-3.5 border border-gray-200 rounded-lg lg:rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 lg:mb-2">
                        Email*
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={shippingData.email}
                        onChange={handleShippingChange}
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 lg:py-3.5 border border-gray-200 rounded-lg lg:rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 lg:mb-2">
                        Mobile*
                      </label>
                      <input
                        type="tel"
                        name="mobile"
                        value={shippingData.mobile}
                        onChange={handleShippingChange}
                        placeholder="03xxxxxxxxx or +92xxxxxxxxxx"
                        className="w-full px-4 py-3 lg:py-3.5 border border-gray-200 rounded-lg lg:rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 lg:mb-2">
                        Province*
                      </label>
                      <input
                        type="text"
                        name="province"
                        value={shippingData.province}
                        onChange={handleShippingChange}
                        placeholder="Enter your Province"
                        className="w-full px-4 py-3 lg:py-3.5 border border-gray-200 rounded-lg lg:rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 lg:mb-2">
                        City*
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={shippingData.city}
                        onChange={handleShippingChange}
                        placeholder="Enter your city"
                        className="w-full px-4 py-3 lg:py-3.5 border border-gray-200 rounded-lg lg:rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1 lg:mb-2">
                        Address*
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={shippingData.address}
                        onChange={handleShippingChange}
                        placeholder="Enter your street address.."
                        className="w-full px-4 py-3 lg:py-3.5 border border-gray-200 rounded-lg lg:rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1 lg:mb-2">
                        Postal Code*
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={shippingData.postalCode}
                        onChange={handleShippingChange}
                        placeholder="Enter your postal code.."
                        className="w-full px-4 py-3 lg:py-3.5 border border-gray-200 rounded-lg lg:rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all lg:max-w-md"
                      />
                    </div>

                    <div className="flex items-center gap-2 lg:col-span-2">
                      <input
                        type="checkbox"
                        name="sameAsShipping"
                        checked={shippingData.sameAsShipping}
                        onChange={handleShippingChange}
                        className="w-4 h-4 lg:w-5 lg:h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-600">
                        Same as shipping address
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <div className="py-4 lg:py-0 lg:grid lg:grid-cols-2 lg:gap-8">
                  {/* Payment Methods */}
                  <div>
                    <h2 className="text-lg lg:text-xl font-medium mb-4 lg:mb-6">
                      Payment Method
                    </h2>

                    <div className="space-y-3">
                      {/* Cash on Delivery */}
                      <div className="flex items-center justify-between p-4 lg:p-5 border-2 border-orange-500 rounded-xl bg-orange-50/30">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <svg
                              className="w-5 h-5 lg:w-6 lg:h-6 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                          </div>
                          <div>
                            <span className="text-sm lg:text-base font-medium">
                              Cash on Delivery
                            </span>
                            <p className="text-xs text-gray-500">
                              Pay when you receive your order
                            </p>
                          </div>
                        </div>
                        <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Info Box */}
                      <div className="p-4 bg-blue-50 rounded-xl">
                        <p className="text-sm text-blue-700">
                          <span className="font-medium">Note:</span> Please keep
                          the exact amount ready at the time of delivery. Our
                          delivery partner will collect the payment.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary for Step 3 */}
                  <div>
                    {/* Order Details */}
                    <div className="mt-6 lg:mt-0 bg-gray-50 rounded-2xl lg:rounded-3xl p-5 lg:p-8">
                      <h3 className="text-lg font-semibold mb-4">
                        Order Summary
                      </h3>

                      <div className="space-y-3 mb-4">
                        {cartItems.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3"
                          >
                            <div className="w-12 h-12 bg-white rounded-lg overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium line-clamp-1">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Qty: {item.quantity}
                              </p>
                            </div>
                            <p className="text-sm font-medium">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        ))}
                        {cartItems.length > 3 && (
                          <p className="text-sm text-gray-500">
                            +{cartItems.length - 3} more items
                          </p>
                        )}
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-medium">
                            {formatPrice(total)}
                          </span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Shipping</span>
                          <span className="font-medium text-green-600">
                            Free
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-200">
                          <span className="text-lg font-semibold">Total</span>
                          <span className="text-xl font-bold text-orange-500">
                            {formatPrice(total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar - Desktop */}
          <div className="hidden lg:block lg:w-96">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Subtotal ({cartItems.length} items)
                  </span>
                  <span className="font-medium">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-orange-500">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (currentStep < 3) {
                    setCurrentStep(currentStep + 1);
                  } else {
                    handlePlaceOrder();
                  }
                }}
                disabled={submitting || loading || cartItems.length === 0}
                className="w-full bg-orange-500 text-white py-4 rounded-full text-base font-medium hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {submitting
                  ? "Placing Order..."
                  : currentStep === 1
                    ? "Proceed to Checkout"
                    : currentStep === 2
                      ? "Continue to Payment"
                      : "Place Order (COD)"}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span>Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Button - Mobile Only */}
      <div className="p-4 bg-white border-t border-gray-100 lg:hidden">
        <button
          onClick={() => {
            if (currentStep < 3) {
              setCurrentStep(currentStep + 1);
            } else {
              handlePlaceOrder();
            }
          }}
          disabled={submitting || loading || cartItems.length === 0}
          className="w-full bg-orange-500 text-white py-3.5 rounded-full text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {submitting
            ? "Placing Order..."
            : currentStep === 1
              ? "Checkout"
              : currentStep === 2
                ? "Continue to Payment"
                : "Place Order (COD)"}
        </button>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CheckoutPage;
