import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { HiPhone, HiMail, HiLocationMarker, HiTrash } from "react-icons/hi";
import { FaCheck } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { orderAPI } from "../services/api";
import { showToast } from "../utils/helpers";

// Format price helper
const formatPrice = (price) => {
  return `Rs.${Number(price).toLocaleString()} PKR`;
};

// Map order status to tracking steps
const getOrderStatusSteps = (status) => {
  const statusMap = {
    pending: 0,
    processing: 1,
    shipped: 2,
    delivered: 3,
    cancelled: -1,
  };

  const currentStep = statusMap[status] ?? 0;

  const steps = [
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

  return steps;
};

const TrackingPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await orderAPI.getMyOrders();
      const orderList = Array.isArray(data) ? data : data.orders || [];
      setOrders(orderList);
      if (orderList.length > 0) {
        setSelectedOrder(orderList[0]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
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

      // Remove from local state
      const updatedOrders = orders.filter((o) => o._id !== orderId);
      setOrders(updatedOrders);

      // Select another order if current was deleted
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

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-orange-400/20 blur-2xl rounded-full scale-150 animate-pulse"></div>
          <img src="/logo.png" alt="EZBZCART" className="h-12 relative z-10" />
        </div>
        <div className="mt-8 relative">
          <div className="w-12 h-12 rounded-full border-[3px] border-gray-200"></div>
          <div className="w-12 h-12 rounded-full border-[3px] border-transparent border-t-orange-500 border-r-orange-400 absolute top-0 left-0 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-gray-500 text-lg mb-4">No orders found</p>
        <Link to="/" className="text-orange-500 hover:underline">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const orderData = selectedOrder;
  const orderStatus = getOrderStatusSteps(orderData?.status || "pending");
  const products = orderData?.products || [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1">
        {/* Order Selector for multiple orders */}
        {orders.length > 1 && (
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

        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Header */}
          <div className="bg-white px-4 py-4">
            <p className="text-xs text-gray-500">Order ID</p>
            <p className="text-sm font-semibold text-gray-900">
              #{orderData?._id?.slice(-8).toUpperCase() || "N/A"}
            </p>
          </div>

          {/* Estimated Delivery Card */}
          <div
            className={`mx-4 mt-3 ${orderData?.status === "cancelled" ? "bg-red-500" : "bg-teal-500"} rounded-xl p-4 text-white`}
          >
            <p className="text-xs font-medium mb-1">
              {orderData?.status === "cancelled"
                ? "Order Status"
                : "Estimated Delivery"}
            </p>
            <p className="text-lg font-bold">
              {orderData?.status === "cancelled"
                ? "Order Cancelled"
                : orderData?.status === "delivered"
                  ? "Delivered"
                  : "In Progress"}
            </p>
            <p className="text-xs mt-1">
              {orderData?.status === "pending" && "Awaiting processing"}
              {orderData?.status === "processing" && "Being prepared"}
              {orderData?.status === "shipped" && "On the way"}
              {orderData?.status === "delivered" && "Successfully delivered"}
            </p>
          </div>

          {/* Products Section */}
          <div className="bg-white mt-4 px-4 py-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Products
            </h3>
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
                      {formatPrice(
                        item.product_id?.product_discounted_price || 0,
                      )}
                    </p>
                    <p className="text-xs text-gray-400">
                      Qty: {item.quantity || 1}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Status Section */}
          <div className="bg-white mt-4 px-4 py-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Order Status
            </h3>
            <div className="relative">
              {orderStatus.map((status, index) => (
                <div key={status.id} className="flex gap-3 pb-6 last:pb-0">
                  {/* Timeline */}
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
                  {/* Content */}
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
                      <p className="text-xs text-gray-500 mt-0.5">
                        {status.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-white mt-4 px-4 py-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Delivery Information
            </h3>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <IoLocationOutline className="text-gray-600" size={18} />
              </div>
              <div className="text-xs text-gray-600">
                <p className="font-medium">{orderData?.full_name || "N/A"}</p>
                <p>{orderData?.phone_number || "N/A"}</p>
                <p>{orderData?.shipping_address || "N/A"}</p>
                <p>{orderData?.city || ""}</p>
                <p className="text-gray-400 mt-1">
                  {orderData?.order_email || ""}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
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
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block max-w-4xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="text-xl font-bold text-gray-900">
              #{orderData?._id?.slice(-8).toUpperCase() || "N/A"}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Products & Delivery Info */}
            <div className="col-span-2 space-y-6">
              {/* Status Card */}
              <div
                className={`${orderData?.status === "cancelled" ? "bg-red-500" : "bg-teal-500"} rounded-2xl p-6 text-white`}
              >
                <p className="text-sm font-medium mb-1">Order Status</p>
                <p className="text-2xl font-bold capitalize">
                  {orderData?.status || "Pending"}
                </p>
                <p className="text-sm mt-2">
                  {formatPrice(orderData?.total_amount || 0)} - Cash on Delivery
                </p>
              </div>

              {/* Products Section */}
              <div className="bg-white rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Products
                </h3>
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
                          {formatPrice(
                            item.product_id?.product_discounted_price || 0,
                          )}
                        </p>
                        <p className="text-sm text-gray-400">
                          Qty: {item.quantity || 1}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-white rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Delivery Information
                </h3>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <IoLocationOutline className="text-gray-600" size={22} />
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">
                      {orderData?.full_name || "N/A"}
                    </p>
                    <p>{orderData?.phone_number || "N/A"}</p>
                    <p>{orderData?.shipping_address || "N/A"}</p>
                    <p>{orderData?.city || ""}</p>
                    <p className="text-gray-400 mt-1">
                      {orderData?.order_email || ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Order Status */}
            <div className="col-span-1">
              <div className="bg-white rounded-2xl p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Order Status
                </h3>
                <div className="relative">
                  {orderStatus.map((status, index) => (
                    <div key={status.id} className="flex gap-4 pb-8 last:pb-0">
                      {/* Timeline */}
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
                      {/* Content */}
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
                          <p className="text-xs text-gray-500 mt-1">
                            {status.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
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
    </div>
  );
};

export default TrackingPage;
