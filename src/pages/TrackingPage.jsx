import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { HiPhone, HiMail, HiLocationMarker, HiTrash } from "react-icons/hi";
import { FaCheck } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { orderAPI } from "../services/api";
import { showToast } from "../utils/helpers";
import GlobalLoader from "../components/ui/GlobalLoader";
import { Navbar } from "../components/layout";

const formatPrice = (price) => {
  return `Rs.${Number(price).toLocaleString()} PKR`;
};

const getOrderStatusSteps = (status) => {
  const statusMap = {
    pending: 0,
    processing: 1,
    shipped: 2,
    delivered: 3,
    cancelled: -1,
  };

  const currentStep = statusMap[status] ?? 0;

  return [
    {
      id: 1,
      title: "Order Confirmed",
      description: "We've received your order and are getting it ready",
      completed: currentStep >= 0,
      current: currentStep === 0,
    },
    {
      id: 2,
      title: "Order Processing",
      description: "Your order is being prepared for shipping",
      completed: currentStep >= 1,
      current: currentStep === 1,
    },
    {
      id: 3,
      title: "Out for Delivery",
      description: "Your order is on its way!",
      completed: currentStep >= 2,
      current: currentStep === 2,
    },
    {
      id: 4,
      title: "Delivered",
      description: "Order has been delivered",
      completed: currentStep >= 3,
      current: currentStep === 3,
    },
  ];
};

const TrackingPage = () => {
  const location = useLocation();

  const initialLookup = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const stateLookup = location.state?.trackingLookup || {};

    return {
      orderId: stateLookup.orderId || params.get("orderId") || "",
      email: stateLookup.email || "",
      phone: stateLookup.phone || "",
    };
  }, [location.search, location.state]);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupMode, setLookupMode] = useState(false);
  const [lookupForm, setLookupForm] = useState(initialLookup);

  const syncOrders = useCallback((orderList, preferredOrderId = null) => {
    setOrders(orderList);
    setSelectedOrder((prevSelected) => {
      const nextId = preferredOrderId || prevSelected?._id || orderList[0]?._id;
      return orderList.find((order) => order._id === nextId) || orderList[0] || null;
    });
  }, []);

  const fetchOrders = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) {
        setLoading(true);
      }

      try {
        const data = await orderAPI.getMyOrders();
        const orderList = Array.isArray(data) ? data : data.orders || [];
        setLookupMode(false);
        syncOrders(orderList);
      } catch (error) {
        console.error("Error fetching orders:", error);
        if (!silent) {
          showToast.error("Failed to load your orders");
        }
        setOrders([]);
        setSelectedOrder(null);
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [syncOrders],
  );

  const runLookup = useCallback(async (criteria, { silent = false } = {}) => {
    const payload = {
      orderId: String(criteria.orderId || "").trim(),
      email: String(criteria.email || "").trim(),
      phone: String(criteria.phone || "").trim(),
    };

    if (!silent) {
      setLookupLoading(true);
      setLoading(false);
    }

    try {
      const order = await orderAPI.track(payload);
      setLookupMode(true);
      setOrders([order]);
      setSelectedOrder(order);
    } catch (error) {
      console.error("Error tracking order:", error);
      if (!silent) {
        showToast.error(error.message || "Order not found");
        setOrders([]);
        setSelectedOrder(null);
      }
    } finally {
      if (!silent) {
        setLookupLoading(false);
        setLoading(false);
      }
    }
  }, []);

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) {
      return;
    }

    try {
      setDeleting(true);
      await orderAPI.delete(orderId);
      showToast.success("Order deleted successfully");

      const updatedOrders = orders.filter((order) => order._id !== orderId);
      setOrders(updatedOrders);

      if (selectedOrder?._id === orderId) {
        setSelectedOrder(updatedOrders.length > 0 ? updatedOrders[0] : null);
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      showToast.error("Failed to delete order");
    } finally {
      setDeleting(false);
    }
  };

  const handleLookupChange = (event) => {
    const { name, value } = event.target;
    setLookupForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLookupSubmit = async (event) => {
    event.preventDefault();

    const orderId = lookupForm.orderId.trim();
    const email = lookupForm.email.trim();
    const phone = lookupForm.phone.trim();

    if (!orderId) {
      showToast.error("Enter your order ID");
      return;
    }

    if (!email && !phone) {
      showToast.error("Enter your email or phone number");
      return;
    }

    await runLookup({ orderId, email, phone });
  };

  const handleShowMyOrders = async () => {
    await fetchOrders();
  };

  useEffect(() => {
    setLookupForm(initialLookup);

    if (initialLookup.orderId && (initialLookup.email || initialLookup.phone)) {
      runLookup(initialLookup);
      return;
    }

    fetchOrders();
  }, [fetchOrders, initialLookup, runLookup]);

  useEffect(() => {
    if (!selectedOrder && !lookupMode) {
      return undefined;
    }

    const interval = setInterval(() => {
      if (lookupMode) {
        const orderId = lookupForm.orderId.trim() || selectedOrder?._id || "";
        const email = lookupForm.email.trim();
        const phone = lookupForm.phone.trim();

        if (orderId && (email || phone)) {
          runLookup({ orderId, email, phone }, { silent: true });
        }
        return;
      }

      fetchOrders({ silent: true });
    }, 30000);

    return () => clearInterval(interval);
  }, [
    fetchOrders,
    lookupForm.email,
    lookupForm.orderId,
    lookupForm.phone,
    lookupMode,
    runLookup,
    selectedOrder,
  ]);

  const orderData = selectedOrder;
  const orderStatus = getOrderStatusSteps(orderData?.status || "pending");
  const products = orderData?.products || [];

  if (loading) {
    return <GlobalLoader size={48} text="Loading your orders..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-500">
                Order Tracking
              </p>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">
                Track your order status anytime
              </h1>
              <p className="text-sm text-gray-500 mt-2 max-w-2xl">
                Enter your order ID with your email or phone number to check the latest status. Dashboard updates appear here automatically.
              </p>
            </div>

            {lookupMode && (
              <button
                onClick={handleShowMyOrders}
                className="px-4 py-2 rounded-full border border-orange-200 text-orange-500 hover:bg-orange-50 transition-colors text-sm font-medium"
              >
                View My Orders
              </button>
            )}
          </div>

          <form
            onSubmit={handleLookupSubmit}
            className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-3"
          >
            <input
              type="text"
              name="orderId"
              value={lookupForm.orderId}
              onChange={handleLookupChange}
              placeholder="Order ID or last 8 digits"
              className="md:col-span-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
            <input
              type="email"
              name="email"
              value={lookupForm.email}
              onChange={handleLookupChange}
              placeholder="Email address"
              className="rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
            <input
              type="text"
              name="phone"
              value={lookupForm.phone}
              onChange={handleLookupChange}
              placeholder="Phone number"
              className="rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
            <button
              type="submit"
              disabled={lookupLoading}
              className="md:col-span-4 rounded-2xl bg-orange-500 text-white py-3 text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-60"
            >
              {lookupLoading ? "Checking order..." : "Track Order"}
            </button>
          </form>

          <p className="text-xs text-gray-400 mt-3">
            Tip: after checkout you can use the full order ID, and older orders can also be found with the last 8 digits plus your email or phone.
          </p>
        </div>
      </div>

      {!orderData ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <p className="text-gray-500 text-lg mb-4">No tracked order selected yet</p>
          <p className="text-sm text-gray-400 max-w-md mb-6">
            Use the form above to track a guest order, or log in and place an order to see your order history here.
          </p>
          <Link to="/" className="text-orange-500 hover:underline">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="flex-1">
            {!lookupMode && orders.length > 1 && (
              <div className="bg-white border-b border-gray-200 px-4 py-3 overflow-x-auto">
                <div className="flex gap-2">
                  {orders.map((order) => (
                    <button
                      key={order._id}
                      onClick={() => setSelectedOrder(order)}
                      className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                        selectedOrder?._id === order._id
                          ? "bg-orange-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      #{order._id?.slice(-8).toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="lg:hidden">
              <div className="bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Order ID</p>
                    <p className="text-sm font-semibold text-gray-900">
                      #{orderData?._id?.slice(-8).toUpperCase() || "N/A"}
                    </p>
                  </div>
                  {lookupMode && (
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-orange-500 bg-orange-50 px-3 py-1 rounded-full">
                      Live tracking
                    </span>
                  )}
                </div>
              </div>

              <div
                className={`mx-4 mt-3 ${orderData?.status === "cancelled" ? "bg-red-500" : "bg-teal-500"} rounded-xl p-4 text-white`}
              >
                <p className="text-xs font-medium mb-1">
                  {orderData?.status === "cancelled" ? "Order Status" : "Estimated Delivery"}
                </p>
                <p className="text-lg font-bold capitalize">
                  {orderData?.status === "cancelled"
                    ? "Order Cancelled"
                    : orderData?.status === "delivered"
                      ? "Delivered"
                      : orderData?.status || "In Progress"}
                </p>
                <p className="text-xs mt-1">
                  {orderData?.status === "pending" && "Awaiting processing"}
                  {orderData?.status === "processing" && "Being prepared"}
                  {orderData?.status === "shipped" && "On the way"}
                  {orderData?.status === "delivered" && "Successfully delivered"}
                  {orderData?.status === "cancelled" && "This order has been cancelled"}
                </p>
              </div>

              <div className="bg-white mt-4 px-4 py-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Products</h3>
                <div className="space-y-3">
                  {products.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        <img
                          src={
                            item.selected_image ||
                            item.product_id?.product_images?.[0] ||
                            "/placeholder.png"
                          }
                          alt={item.product_id?.product_name || "Product"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {item.product_id?.product_name || "Product"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatPrice(item.product_id?.product_discounted_price || 0)}
                        </p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity || 1}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white mt-4 px-4 py-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Order Status</h3>
                <div className="relative">
                  {orderStatus.map((status, index) => (
                    <div key={status.id} className="flex gap-3 pb-6 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            status.completed
                              ? "bg-orange-500"
                              : status.current
                                ? "bg-orange-500"
                                : "bg-gray-200"
                          }`}
                        >
                          {status.completed ? (
                            <FaCheck className="text-white text-xs" />
                          ) : status.current ? (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          ) : (
                            <div className="w-2 h-2 bg-gray-400 rounded-full" />
                          )}
                        </div>
                        {index < orderStatus.length - 1 && (
                          <div
                            className={`w-0.5 flex-1 mt-1 ${
                              status.completed ? "bg-orange-500" : "bg-gray-200"
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1 -mt-1">
                        <p
                          className={`text-sm font-medium ${
                            status.completed || status.current
                              ? "text-gray-900"
                              : "text-gray-400"
                          }`}
                        >
                          {status.title}
                        </p>
                        {status.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{status.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white mt-4 px-4 py-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Delivery Information</h3>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <IoLocationOutline className="text-gray-600" size={18} />
                  </div>
                  <div className="text-xs text-gray-600">
                    <p className="font-medium">{orderData?.full_name || "N/A"}</p>
                    <p>{orderData?.phone_number || "N/A"}</p>
                    <p>{orderData?.shipping_address || "N/A"}</p>
                    <p>{orderData?.city || ""}</p>
                    <p className="text-gray-400 mt-1">{orderData?.order_email || ""}</p>
                  </div>
                </div>
              </div>

              {!lookupMode && (
                <div className="px-4 py-6 space-y-3">
                  <button
                    onClick={() => handleDeleteOrder(orderData?._id)}
                    disabled={deleting}
                    className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <HiTrash size={16} />
                    {deleting ? "Deleting..." : "Delete Order"}
                  </button>
                </div>
              )}
            </div>

            <div className="hidden lg:block max-w-4xl mx-auto px-8 py-8">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="text-xl font-bold text-gray-900">
                    #{orderData?._id?.slice(-8).toUpperCase() || "N/A"}
                  </p>
                </div>
                {lookupMode && (
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-500 bg-orange-50 px-4 py-2 rounded-full">
                    Auto Refresh Enabled
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                  <div
                    className={`${orderData?.status === "cancelled" ? "bg-red-500" : "bg-teal-500"} rounded-2xl p-6 text-white`}
                  >
                    <p className="text-sm font-medium mb-1">Order Status</p>
                    <p className="text-2xl font-bold capitalize">{orderData?.status || "Pending"}</p>
                    <p className="text-sm mt-2">
                      {formatPrice(orderData?.total_amount || 0)} - Cash on Delivery
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Products</h3>
                    <div className="space-y-4">
                      {products.map((item, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                            <img
                              src={
                                item.selected_image ||
                                item.product_id?.product_images?.[0] ||
                                "/placeholder.png"
                              }
                              alt={item.product_id?.product_name || "Product"}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-base font-medium text-gray-900">
                              {item.product_id?.product_name || "Product"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatPrice(item.product_id?.product_discounted_price || 0)}
                            </p>
                            <p className="text-sm text-gray-400">Qty: {item.quantity || 1}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h3>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <IoLocationOutline className="text-gray-600" size={22} />
                      </div>
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">{orderData?.full_name || "N/A"}</p>
                        <p>{orderData?.phone_number || "N/A"}</p>
                        <p>{orderData?.shipping_address || "N/A"}</p>
                        <p>{orderData?.city || ""}</p>
                        <p className="text-gray-400 mt-1">{orderData?.order_email || ""}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-1">
                  <div className="bg-white rounded-2xl p-6 sticky top-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Status</h3>
                    <div className="relative">
                      {orderStatus.map((status, index) => (
                        <div key={status.id} className="flex gap-4 pb-8 last:pb-0">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                status.completed
                                  ? "bg-orange-500"
                                  : status.current
                                    ? "bg-orange-500"
                                    : "bg-gray-200"
                              }`}
                            >
                              {status.completed ? (
                                <FaCheck className="text-white text-sm" />
                              ) : status.current ? (
                                <div className="w-2.5 h-2.5 bg-white rounded-full" />
                              ) : (
                                <div className="w-2.5 h-2.5 bg-gray-400 rounded-full" />
                              )}
                            </div>
                            {index < orderStatus.length - 1 && (
                              <div
                                className={`w-0.5 flex-1 mt-2 ${
                                  status.completed ? "bg-orange-500" : "bg-gray-200"
                                }`}
                              />
                            )}
                          </div>
                          <div className="flex-1 -mt-1">
                            <p
                              className={`text-sm font-medium ${
                                status.completed || status.current
                                  ? "text-gray-900"
                                  : "text-gray-400"
                              }`}
                            >
                              {status.title}
                            </p>
                            {status.description && (
                              <p className="text-xs text-gray-500 mt-1">{status.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {!lookupMode && (
                      <div className="space-y-3 mt-6">
                        <button
                          onClick={() => handleDeleteOrder(orderData?._id)}
                          disabled={deleting}
                          className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          <HiTrash size={16} />
                          {deleting ? "Deleting..." : "Delete Order"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer className="bg-[#3d3d3d] text-white py-6 mt-auto">
            <div className="max-w-7xl mx-auto px-4 lg:px-12">
              <div className="flex flex-col items-center lg:items-start gap-4">
                <Link to="/">
                  <img src="/logo.png" alt="EZBZCART" className="h-8" />
                </Link>

                <div className="flex flex-col items-center lg:items-start gap-2 text-xs text-gray-300">
                  <div className="flex items-center gap-2">
                    <HiPhone size={14} />
                    <span>0329 7609190</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <HiMail size={14} />
                    <span>info@bzcart.store</span>
                  </div>

                  <div className="flex items-start gap-2 text-center lg:text-left">
                    <HiLocationMarker size={14} className="mt-0.5 flex-shrink-0" />
                    <span>
                      Dinga, Tehsil Kharian District Gujrat,
                      <br />
                      Punjab – Pakistan
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
};

export default TrackingPage;
