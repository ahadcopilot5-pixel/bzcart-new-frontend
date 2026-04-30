const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://bzbackend.online/api";

const clearInvalidAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("auth:expired"));
};

// Helper function for API calls with automatic retry on network failures
const apiCall = async (endpoint, options = {}, retries = 3, retryDelay = 800) => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: "include", // Include cookies for CORS requests
      });

      const data = await response.json();

      if (!response.ok) {
        const message = data.message || "Something went wrong";

        if (
          response.status === 401 &&
          /not authorized|token failed|jwt|unauthorized/i.test(message)
        ) {
          clearInvalidAuth();
        }

        const error = new Error(message);
        error.status = response.status;
        throw error;
      }

      return data;
    } catch (error) {
      // Only retry on network/fetch errors (not on HTTP error responses)
      const isNetworkError =
        error instanceof TypeError ||
        error.message === "Failed to fetch" ||
        error.message.includes("NetworkError") ||
        error.message.includes("network");

      if (isNetworkError && attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay * attempt));
        continue;
      }

      throw error;
    }
  }
};

// Get or create guest ID for non-authenticated users
const getGuestId = () => {
  let guestId = localStorage.getItem("guestId");
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("guestId", guestId);
  }
  return guestId;
};

// Auth API functions
export const authAPI = {
  googleLogin: async (credential) => {
    return apiCall("/users/google-login", {
      method: "POST",
      body: JSON.stringify({ credential }),
    });
  },
  register: async (username, email, password) => {
    return apiCall("/users/register-user", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });
  },

  login: async (email, password) => {
    return apiCall("/users/login-user", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  verifyOTP: async (otp) => {
    return apiCall("/users/verify-otp", {
      method: "POST",
      body: JSON.stringify({ otp }),
    });
  },

  getCurrentUser: async () => {
    return apiCall("/users/me", { method: "GET" });
  },

  forgotPassword: async (email) => {
    return apiCall("/users/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token, password) => {
    return apiCall("/users/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
  },

  updateProfileImage: async (imageUrl) => {
    return apiCall("/users/profile-image", {
      method: "PATCH",
      body: JSON.stringify({ imageUrl }),
    });
  },
};

// Category API functions
export const categoryAPI = {
  getAll: async () => {
    return apiCall("/categories/categories", { method: "GET" });
  },

  getById: async (id) => {
    return apiCall(`/categories/category/${id}`, { method: "GET" });
  },

  getByName: async (name) => {
    return apiCall(`/categories/category/name/${name}`, { method: "GET" });
  },
};

// Product API functions
export const productAPI = {
  getAll: async () => {
    return apiCall("/products/products", { method: "GET" });
  },

  getById: async (id) => {
    return apiCall(`/products/product/${id}`, { method: "GET" });
  },

  getBySlug: async (slug) => {
    return apiCall(`/products/product/slug/${encodeURIComponent(slug)}`, {
      method: "GET",
    });
  },

  getByCategory: async (categoryId) => {
    return apiCall(`/products/category/${categoryId}`, { method: "GET" });
  },
};

// Cart API functions
export const cartAPI = {
  get: async () => {
    const guestId = getGuestId();
    const token = localStorage.getItem("token");
    // If no token, pass guestId as query parameter
    const endpoint = token
      ? "/products/cart"
      : `/products/cart?guestId=${encodeURIComponent(guestId)}`;
    return apiCall(endpoint, { method: "GET" });
  },

  add: async (
    productId,
    selectedImage,
    selectedSize = null,
    selectedColor = null,
  ) => {
    const guestId = getGuestId();
    return apiCall("/products/cart", {
      method: "POST",
      body: JSON.stringify({
        product_id: productId,
        selected_image: selectedImage,
        selected_size: selectedSize,
        selected_color: selectedColor,
        guestId,
      }),
    });
  },

  remove: async (
    productId,
    selectedImage,
    selectedSize = null,
    selectedColor = null,
  ) => {
    const guestId = getGuestId();
    return apiCall("/products/cart/remove", {
      method: "POST",
      body: JSON.stringify({
        product_id: productId,
        selected_image: selectedImage,
        selected_size: selectedSize,
        selected_color: selectedColor,
        guestId,
      }),
    });
  },

  clear: async () => {
    const guestId = getGuestId();
    const token = localStorage.getItem("token");
    // If no token, pass guestId as query parameter
    const endpoint = token
      ? "/products/cart/clear"
      : `/products/cart/clear?guestId=${encodeURIComponent(guestId)}`;
    return apiCall(endpoint, { method: "DELETE" });
  },
};

// Review API functions
export const reviewAPI = {
  getByProduct: async (productId) => {
    return apiCall(`/products/reviews/${productId}`, { method: "GET" });
  },

  submit: async (productId, rating, comment) => {
    return apiCall(`/products/reviews/${productId}`, {
      method: "POST",
      body: JSON.stringify({ rating, comment }),
    });
  },
};

export const testimonialAPI = {
  getAll: async () => {
    return apiCall("/testimonials", { method: "GET" });
  },
};

// Order API functions
export const orderAPI = {
  create: async (orderData) => {
    const guestId = getGuestId();
    return apiCall("/orders/create-order", {
      method: "POST",
      body: JSON.stringify({ ...orderData, guestId }),
    });
  },

  getMyOrders: async () => {
    const guestId = getGuestId();
    const token = localStorage.getItem("token");
    // If no token, pass guestId as query parameter for guest orders
    const endpoint = token
      ? "/orders/my-orders"
      : `/orders/my-orders?guestId=${encodeURIComponent(guestId)}`;
    return apiCall(endpoint, { method: "GET" });
  },

  getById: async (id) => {
    return apiCall(`/orders/order/${id}`, { method: "GET" });
  },

  delete: async (id) => {
    return apiCall(`/orders/order/${id}`, { method: "DELETE" });
  },
};

// Wishlist API functions
export const wishlistAPI = {
  get: async () => {
    return apiCall("/products/wishlist", { method: "GET" });
  },

  add: async (productId) => {
    const guestId = getGuestId();
    return apiCall("/products/wishlist/add", {
      method: "POST",
      body: JSON.stringify({ product_id: productId, guestId }),
    });
  },

  remove: async (productId) => {
    const guestId = getGuestId();
    return apiCall("/products/wishlist/remove", {
      method: "POST",
      body: JSON.stringify({ product_id: productId, guestId }),
    });
  },
};

export default apiCall;
