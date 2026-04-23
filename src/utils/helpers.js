import toast from "react-hot-toast";

// Toast utility with consistent styling - Green for success
export const showToast = {
  success: (message) =>
    toast.success(message, {
      style: { background: "#10b981", color: "#fff" },
      iconTheme: { primary: "#fff", secondary: "#10b981" },
    }),
  error: (message) =>
    toast.error(message, {
      style: { background: "#ef4444", color: "#fff" },
      iconTheme: { primary: "#fff", secondary: "#ef4444" },
    }),
  info: (message) =>
    toast(message, {
      style: { background: "#3b82f6", color: "#fff" },
    }),
};

// Create URL-friendly slug from product name
export const createSlug = (name) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Generate product URL with slug
export const getProductUrl = (product) => {
  if (!product) return "/";
  const slug = createSlug(
    product.product_name || product.name || product.product_title,
  );
  return `/product/${slug}`;
};
