import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { productAPI, reviewAPI, wishlistAPI, cartAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { showToast } from "../utils/helpers";
import GlobalLoader from "../components/ui/GlobalLoader";
import FaviconSpinner from "../components/ui/FaviconSpinner";
import {
  HiOutlineHeart,
  HiHeart,
  HiMenu,
  HiOutlineShare,
  HiOutlineShieldCheck,
  HiOutlineTruck,
  HiOutlineRefresh,
  HiOutlineCreditCard,
  HiOutlineCash,
  HiChevronLeft,
  HiChevronRight,
  HiStar,
  HiOutlineStar,
  HiCheck,
} from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";

// Format price helper
const formatPrice = (price) => {
  return `Rs.${Number(price).toLocaleString()} PKR`;
};

// Helper to create URL-friendly slug
const createSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Helper to check if string is a MongoDB ObjectId
const isObjectId = (str) => /^[a-f\d]{24}$/i.test(str);

const ProductPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Product state
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productId, setProductId] = useState(null);
  const fetchedSlugRef = useRef(null); // Track which slug we've already fetched

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);
  const reviewsPerPage = 8;

  // New review form
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [submitLoading, setSubmitLoading] = useState(false);

  // UI state
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Fetch product - supports both slug and legacy ID URLs
  useEffect(() => {
    const fetchProduct = async () => {
      // Skip if we've already fetched this slug
      if (fetchedSlugRef.current === slug) {
        console.log(
          "ProductPage - Skipping fetch, already have data for:",
          slug,
        );
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let data;
        let finalSlug = slug;

        // Check if it's an ObjectId (legacy URL) or slug
        if (isObjectId(slug)) {
          data = await productAPI.getById(slug);
          console.log(
            "ProductPage - Fetched by ID, colors:",
            JSON.stringify(data.colors),
          );

          // Get the slug for redirect
          if (data?.product_name) {
            finalSlug = createSlug(data.product_name);
          }
        } else {
          data = await productAPI.getBySlug(slug);
          console.log(
            "ProductPage - Fetched by slug, colors:",
            JSON.stringify(data.colors),
          );
        }

        // Store product data
        setProduct(data);
        setProductId(data._id);
        fetchedSlugRef.current = finalSlug; // Mark this slug as fetched

        // Set defaults
        if (data.colors?.length > 0) {
          setSelectedColor(data.colors[0].name);
        }
        if (data.sizes?.length > 0) {
          setSelectedSize(data.sizes[0].size);
        }

        setLoading(false);

        // Redirect if we fetched by ID
        if (isObjectId(slug) && data?.product_name) {
          navigate(`/product/${finalSlug}`, { replace: true });
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Product not found");
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, navigate]);

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    if (!productId) return;
    try {
      setReviewsLoading(true);
      const data = await reviewAPI.getByProduct(productId);
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId, fetchReviews]);

  // Submit review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast.error("Please log in to submit a review");
      navigate("/auth/login");
      return;
    }
    if (!newReview.comment.trim()) return;

    try {
      setSubmitLoading(true);
      await reviewAPI.submit(productId, newReview.rating, newReview.comment);
      setNewReview({ rating: 5, comment: "" });
      fetchReviews(); // Refresh reviews
      showToast.success("Review submitted successfully!");
    } catch (err) {
      console.error("Error submitting review:", err);

      if (err.status === 401) {
        showToast.error("Your session expired. Please log in again.");
        navigate("/auth/login");
      } else {
        showToast.error("Failed to submit review. Please try again.");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // Toggle wishlist
  const handleWishlist = async () => {
    if (!productId) return;
    try {
      if (isWishlisted) {
        await wishlistAPI.remove(productId);
      } else {
        await wishlistAPI.add(productId);
      }
      setIsWishlisted(!isWishlisted);
    } catch (err) {
      console.error("Wishlist error:", err);
    }
  };

  // Add to cart
  const { refreshCart } = useCart();

  const getCurrentAvailableStock = () => {
    if (!product) return 0;
    if (product.sizes?.length > 0) {
      const selectedSizeObj = product.sizes.find(
        (sizeObj) => sizeObj.size === selectedSize,
      );
      return selectedSizeObj?.stock || 0;
    }
    return product.product_stock || 0;
  };

  const isCurrentSelectionOutOfStock = () => getCurrentAvailableStock() <= 0;

  const handleAddToCart = async () => {
    if (isCurrentSelectionOutOfStock()) {
      showToast.error("This product is out of stock");
      return;
    }

    try {
      setAddingToCart(true);
      const selectedImage =
        product.product_images?.[currentImage] || product.product_images?.[0];
      await cartAPI.add(
        product._id,
        selectedImage,
        selectedSize,
        selectedColor,
      );
      await refreshCart();
      showToast.success("Added to cart!");
    } catch (err) {
      console.error("Add to cart error:", err);
      showToast.error(err.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  // Buy now
  const handleBuyNow = async () => {
    if (isCurrentSelectionOutOfStock()) {
      showToast.error("This product is out of stock");
      return;
    }

    await handleAddToCart();
    navigate("/checkout");
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span
        key={index}
        className={`text-sm ${
          index < rating ? "text-yellow-400" : "text-gray-300"
        }`}
      >
        ★
      </span>
    ));
  };

  const nextImage = () => {
    if (product?.product_images?.length > 0) {
      setCurrentImage((prev) => (prev + 1) % product.product_images.length);
    }
  };

  const prevImage = () => {
    if (product?.product_images?.length > 0) {
      setCurrentImage((prev) =>
        prev === 0 ? product.product_images.length - 1 : prev - 1,
      );
    }
  };

  // Calculate average rating
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(2)
      : 0;

  // Paginated reviews
  const paginatedReviews = reviews.slice(0, reviewPage * reviewsPerPage);
  const hasMoreReviews = reviews.length > paginatedReviews.length;

  if (loading) {
    return <GlobalLoader />;
  }

  if (error || !product) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-500 text-lg">{error || "Product not found"}</p>
        <Link to="/" className="mt-4 text-orange-500 hover:underline">
          Go back home
        </Link>
      </div>
    );
  }

  const images =
    product.product_images?.length > 0
      ? product.product_images
      : ["/placeholder.png"];
  const hasColors = product.colors?.length > 0;
  const hasSizes = product.sizes?.length > 0;
  const selectedSizeObj = hasSizes
    ? product.sizes.find((sizeObj) => sizeObj.size === selectedSize)
    : null;
  const availableStock = hasSizes
    ? selectedSizeObj?.stock || 0
    : product.product_stock || 0;
  const isOutOfStock = availableStock <= 0;

  // Calculate discount percentage
  const discountPercent =
    product.product_base_price > product.product_discounted_price
      ? Math.round(
          ((product.product_base_price - product.product_discounted_price) /
            product.product_base_price) *
            100,
        )
      : 0;

  return (
    <div className="bg-[#8d8d8d] lg:bg-white min-h-screen pb-0 lg:pb-0">
      <div className="max-w-[430px] mx-auto bg-white min-h-screen lg:max-w-none lg:bg-transparent">
      {/* Breadcrumb - Desktop Only */}
      <div className="hidden lg:block border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-8 xl:px-12 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-orange-500 transition-colors">Home</Link>
            <HiChevronRight className="w-4 h-4" />
            <Link to="/mens-clothing" className="hover:text-orange-500 transition-colors">Products</Link>
            <HiChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium truncate max-w-xs">{product.product_name}</span>
          </nav>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-4 sticky top-0 bg-[#262626] z-20 border-b border-black/20">
        <button className="w-8 h-8 flex items-center justify-center text-white/95">
          <HiMenu className="w-5 h-5" />
        </button>
        <span className="text-white text-[17px] font-medium">E-commerce</span>
        <button
          onClick={handleWishlist}
          className="w-8 h-8 flex items-center justify-center text-white"
          aria-label="Toggle wishlist"
        >
          {isWishlisted ? (
            <HiHeart className="w-5 h-5 text-orange-500" />
          ) : (
            <HiOutlineHeart className="w-5 h-5 text-white/90" />
          )}
        </button>
      </div>

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-0 lg:px-8 xl:px-12 py-0 lg:py-8">
        <div className="lg:flex lg:gap-10 xl:gap-14 lg:items-start">

          {/* Left: Image Gallery */}
          <div className="lg:w-[48%] lg:flex lg:gap-4 lg:sticky lg:top-8">
            {/* Desktop Thumbnails - Left Side */}
            {images.length > 1 && (
              <div className="hidden lg:flex lg:flex-col gap-2 w-[72px] flex-shrink-0">
                {images.slice(0, 6).map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`w-[72px] h-[72px] rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      index === currentImage
                        ? "border-orange-500 shadow-md"
                        : "border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="relative flex-1">
              <div className="relative aspect-square lg:aspect-[4/5] lg:max-h-[70vh] bg-[#d9d9d9] lg:bg-gray-50 lg:rounded-2xl overflow-hidden group">
                <img
                  src={images[currentImage]}
                  alt={product.product_name}
                  className="w-full h-full object-contain p-4 lg:p-6 transition-transform duration-500 group-hover:scale-105"
                />

                {/* Discount Badge */}
                {discountPercent > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                    -{discountPercent}%
                  </div>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                    {currentImage + 1} / {images.length}
                  </div>
                )}

                {/* Nav Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="hidden lg:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 lg:w-10 lg:h-10 bg-white/90 backdrop-blur rounded-full items-center justify-center shadow-lg transition-all lg:opacity-0 lg:group-hover:opacity-100"
                    >
                      <HiChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 lg:w-10 lg:h-10 bg-white/90 backdrop-blur rounded-full items-center justify-center shadow-lg transition-all lg:opacity-0 lg:group-hover:opacity-100"
                    >
                      <HiChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                  </>
                )}

                {/* Desktop: Share & Wishlist */}
                <div className="hidden lg:flex absolute top-4 right-4 gap-2">
                  <button
                    onClick={handleWishlist}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all"
                  >
                    {isWishlisted ? (
                      <HiHeart className="w-5 h-5 text-red-500" />
                    ) : (
                      <HiOutlineHeart className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                  <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all">
                    <HiOutlineShare className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Mobile Image Dots */}
              {images.length > 1 && (
                <div className="lg:hidden mt-2 pb-2 flex justify-center">
                  <div className="flex items-center gap-1.5">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImage(index)}
                        className={`transition-all rounded-full ${
                          index === currentImage
                            ? "w-4 h-1.5 bg-black"
                            : "w-1.5 h-1.5 bg-gray-400"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="-mt-3 lg:mt-0 lg:w-[52%] px-4 lg:px-0 bg-white rounded-t-[30px] relative z-10 pt-5 lg:pt-0 lg:rounded-none lg:bg-transparent lg:z-auto">

            {/* Brand + Stock Row */}
            <div className="hidden lg:flex items-center justify-between mb-2">
              {product.brand_name && (
                <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-wide">
                  {product.brand_name}
                </span>
              )}
              <span className={`text-xs font-medium px-3 py-1 rounded-full ml-auto ${
                availableStock > 10
                  ? "bg-green-50 text-green-600"
                  : availableStock > 0
                  ? "bg-amber-50 text-amber-600"
                  : "bg-red-50 text-red-500"
              }`}>
                {availableStock > 10
                  ? "In Stock"
                  : availableStock > 0
                  ? `Only ${availableStock} left`
                  : "Out of Stock"}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-[38px] sm:text-[42px] lg:text-2xl xl:text-3xl font-bold text-gray-900 leading-snug tracking-tight">
              {product.product_name}
            </h1>

            {/* Rating */}
            <div className="hidden lg:flex items-center gap-2 mt-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>
                    {i < Math.round(avgRating) ? (
                      <HiStar className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <HiOutlineStar className="w-4 h-4 text-gray-300" />
                    )}
                  </span>
                ))}
              </div>
              <span className="text-xs text-gray-500">
                {avgRating} · {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </span>
            </div>

            {/* Mobile Rating + Sold */}
            <div className="lg:hidden flex items-center gap-3 mt-3">
              <span className="bg-orange-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full leading-none">
                {Number(avgRating || 0).toFixed(1)} ★
              </span>
              <span className="text-xs text-gray-500 font-medium">
                {reviews.length > 0 ? `${reviews.length} reviews` : "3.5k sold"}
              </span>
            </div>

            {/* Price */}
            <div className="mt-2 lg:mt-4 p-0 lg:p-4 bg-transparent lg:bg-gray-50 rounded-none lg:rounded-2xl">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-[32px] lg:text-3xl font-extrabold text-gray-900">
                  {formatPrice(product.product_discounted_price)}
                </span>
                {discountPercent > 0 && (
                  <>
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(product.product_base_price)}
                    </span>
                    <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                      Save {discountPercent}%
                    </span>
                  </>
                )}
              </div>
              <p className="hidden lg:block text-xs text-gray-400 mt-1">Inclusive of all taxes · Free Delivery</p>
            </div>

            {/* Color Selection */}
            {hasColors && (
              <div className="mt-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-semibold text-gray-800">Color</span>
                  <span className="text-sm text-gray-500">— {selectedColor}</span>
                </div>
                <div className="flex gap-2.5 flex-wrap">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      title={color.name}
                      className={`relative w-8 h-8 rounded-full transition-all ${
                        selectedColor === color.name
                          ? "ring-2 ring-offset-2 ring-orange-500 scale-110"
                          : "hover:scale-110"
                      } ${
                        color.hex === "#ffffff" || color.hex === "#FFFFFF"
                          ? "border border-gray-300"
                          : ""
                      }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      {selectedColor === color.name && (
                        <HiCheck
                          className={`absolute inset-0 m-auto w-4 h-4 ${
                            color.hex === "#ffffff" || color.hex === "#FFFFFF" ||
                            color.hex === "#FFFF00" || color.hex === "#ffff00"
                              ? "text-gray-800"
                              : "text-white"
                          }`}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {hasSizes && (
              <div className="mt-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-800">
                    Size <span className="text-gray-400 font-normal">— {selectedSize}</span>
                  </span>
                  <button className="text-xs text-orange-500 font-medium hover:underline">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sizeObj) => (
                    <button
                      key={sizeObj.size}
                      onClick={() => setSelectedSize(sizeObj.size)}
                      disabled={sizeObj.stock === 0}
                      className={`h-9 px-3 rounded-lg text-sm font-medium transition-all border ${
                        selectedSize === sizeObj.size
                          ? "bg-orange-500 text-white border-orange-500"
                          : sizeObj.stock === 0
                          ? "border-gray-200 text-gray-300 cursor-not-allowed line-through"
                          : "border-gray-200 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {sizeObj.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons - Mobile */}
            <div className="lg:hidden mt-6 flex items-center gap-3">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || isOutOfStock}
                className="flex-1 bg-orange-500 text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-60"
              >
                {isOutOfStock ? "Out of Stock" : addingToCart ? "Adding..." : "Add to cart"}
              </button>
              <a
                href="https://wa.me/923297609190"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center"
              >
                <FaWhatsapp className="w-5 h-5 text-white" />
              </a>
            </div>

            {/* Action Buttons - Desktop only (mobile uses sticky bar) */}
            <div className="hidden lg:flex mt-6 gap-3">
              {isOutOfStock ? (
                <button
                  disabled
                  className="flex-1 bg-gray-500 text-white py-3.5 rounded-xl text-sm font-semibold cursor-not-allowed"
                >
                  Out of Stock
                </button>
              ) : (
                <>
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="flex-1 border-2 border-gray-900 text-gray-900 py-3.5 rounded-xl text-sm font-semibold hover:bg-gray-900 hover:text-white transition-all disabled:opacity-50"
                  >
                    {addingToCart ? "Adding..." : "Add to Cart"}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={addingToCart}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 shadow-lg shadow-orange-200"
                  >
                    {addingToCart ? "Processing..." : "Buy Now"}
                  </button>
                </>
              )}
              <a
                href="https://wa.me/923297609190"
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 bg-green-500 hover:bg-green-600 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-green-200 flex-shrink-0"
              >
                <FaWhatsapp className="w-6 h-6 text-white" />
              </a>
            </div>

            {/* Trust Badges */}
            <div className="hidden lg:grid mt-5 lg:mt-6 grid-cols-2 gap-3">
              {[
                { icon: HiOutlineTruck, label: "Free Delivery", sub: "All over Pakistan" },
                { icon: HiOutlineCash, label: "Cash on Delivery", sub: "Pay when received" },
                { icon: HiOutlineRefresh, label: "Easy Returns", sub: "7-day return policy" },
                { icon: HiOutlineShieldCheck, label: "Secure Payment", sub: "100% protected" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{label}</p>
                    <p className="text-[11px] text-gray-400">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment Methods */}
            <div className="hidden lg:flex mt-4 items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400">Payment:</span>
              {[
                { icon: HiOutlineCreditCard, label: "Card" },
                { icon: HiOutlineCash, label: "COD" },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="border-t border-gray-100 mt-8 lg:mt-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 xl:px-12">
          <div className="flex gap-2 lg:gap-2 pt-4 lg:pt-8 border-b border-gray-200">
            {[
              { key: "overview", label: "Overview" },
              { key: "reviews", label: "Reviews" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 lg:px-10 py-2.5 lg:py-4 text-sm lg:text-base font-medium transition-all relative rounded-full mb-3 lg:mb-0 ${
                  activeTab === key
                    ? "text-white bg-orange-500 lg:text-orange-500 lg:bg-transparent"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {label}
                {activeTab === key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-t" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="py-6 lg:py-12 pb-8 lg:pb-24">
            {activeTab === "overview" ? (
              <div className="max-w-4xl">
                <p className="text-sm lg:text-base text-gray-600 leading-relaxed lg:leading-loose whitespace-pre-line">
                  {product.product_description}
                </p>

                {product.highlights?.length > 0 && (
                  <div className="mt-6 lg:mt-10">
                    <h4 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Highlights</h4>
                    <ul className="space-y-2.5">
                      {product.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <HiCheck className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-sm lg:text-base text-gray-600">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {product.warranty && (
                  <div className="mt-6 lg:mt-10 p-4 lg:p-5 bg-blue-50 rounded-2xl flex items-center gap-3">
                    <HiOutlineShieldCheck className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Warranty</p>
                      <p className="text-sm text-gray-600">{product.warranty}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="lg:flex lg:gap-12 lg:items-start mb-8 lg:mb-10">
                  {/* Rating summary */}
                  <div className="flex items-center justify-center gap-4 lg:flex-col lg:items-start mb-6 lg:mb-0 lg:w-48 border border-gray-200 rounded-xl p-4 lg:p-0 lg:border-0 lg:rounded-none">
                    <div>
                      <div className="text-4xl lg:text-5xl font-bold text-gray-900">{avgRating}</div>
                      <div className="flex items-center gap-0.5 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>
                            {i < Math.round(avgRating) ? (
                              <HiStar className="w-4 h-4 text-yellow-400" />
                            ) : (
                              <HiOutlineStar className="w-4 h-4 text-gray-300" />
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">Based on {reviews.length} reviews</p>
                  </div>

                  {user && (
                    <div className="flex-1 p-5 lg:p-6 bg-gray-50 rounded-2xl max-w-2xl">
                      <h3 className="text-base font-semibold mb-4">Write a Review</h3>
                      <form onSubmit={handleSubmitReview}>
                        <div className="mb-4">
                          <label className="block text-sm text-gray-600 mb-2">Your Rating</label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setNewReview({ ...newReview, rating: star })}
                                className="p-1"
                              >
                                {star <= newReview.rating ? (
                                  <HiStar className="w-7 h-7 text-yellow-400" />
                                ) : (
                                  <HiOutlineStar className="w-7 h-7 text-gray-300" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                        <textarea
                          value={newReview.comment}
                          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                          placeholder="Share your experience with this product..."
                          className="w-full p-4 border border-gray-200 rounded-xl resize-none h-28 text-sm focus:outline-none focus:border-orange-300 mb-4 bg-white"
                          required
                          minLength={3}
                          maxLength={500}
                        />
                        <button
                          type="submit"
                          disabled={submitLoading}
                          className="bg-orange-500 text-white px-8 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
                        >
                          {submitLoading ? "Submitting..." : "Submit Review"}
                        </button>
                      </form>
                    </div>
                  )}
                </div>

                {reviewsLoading ? (
                  <>
                    <div className="lg:hidden grid grid-cols-2 gap-3">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="bg-white border border-gray-200 rounded-[2px] p-3 min-h-32 flex items-center justify-center"
                        >
                          <FaviconSpinner size={28} showGlow />
                        </div>
                      ))}
                    </div>
                    <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="bg-orange-50/60 border border-orange-100 rounded-2xl p-5 min-h-36 flex items-center justify-center"
                        >
                          <FaviconSpinner size={40} showGlow />
                        </div>
                      ))}
                    </div>
                  </>
                ) : paginatedReviews.length > 0 ? (
                  <>
                    <div className="lg:hidden">
                      <h3 className="text-center text-[23px] font-semibold text-gray-900 mb-4">Customer Reviews</h3>

                      <div className="flex items-center justify-center gap-4 mb-5">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <span key={i}>
                                {i < Math.round(avgRating) ? (
                                  <HiStar className="w-3.5 h-3.5 text-yellow-400" />
                                ) : (
                                  <HiOutlineStar className="w-3.5 h-3.5 text-gray-300" />
                                )}
                              </span>
                            ))}
                          </div>
                          <p className="text-[11px] text-gray-600 mt-1">{avgRating} out of 5</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Based on {reviews.length} reviews</p>
                        </div>
                        <div className="h-10 w-px bg-gray-300" />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {paginatedReviews.map((review) => {
                          const reviewerName =
                            review.user_id?.first_name ||
                            review.user_id?.username ||
                            "Customer";

                          return (
                            <div key={review._id} className="bg-white border border-gray-300 rounded-[2px] p-2.5">
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <span key={i}>
                                      {i < review.rating ? (
                                        <HiStar className="w-3 h-3 text-yellow-400" />
                                      ) : (
                                        <HiOutlineStar className="w-3 h-3 text-gray-300" />
                                      )}
                                    </span>
                                  ))}
                                </div>
                                <span className="text-[9px] text-gray-400">
                                  {new Date(review.createdAt).toLocaleDateString("en-GB")}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 mb-1.5">
                                <span className="text-[10px] text-gray-500">◌</span>
                                <span className="text-[10px] uppercase tracking-wide text-gray-500 truncate">
                                  {reviewerName}
                                </span>
                                <span className="ml-auto text-[8px] bg-black text-white px-1.5 py-0.5 rounded-[2px] leading-none">
                                  Verified
                                </span>
                              </div>

                              <p className="text-[10px] text-gray-800 mb-1 leading-snug line-clamp-1">
                                {product.product_name}
                              </p>
                              <p className="text-[10px] text-gray-600 leading-snug line-clamp-3">
                                {review.comment}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {paginatedReviews.map((review) => (
                        <div key={review._id} className="bg-white border border-gray-200 rounded-md p-5 hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                              <span key={i}>
                                {i < review.rating ? (
                                  <HiStar className="w-4 h-4 text-yellow-400" />
                                ) : (
                                  <HiOutlineStar className="w-4 h-4 text-gray-300" />
                                )}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            {(() => {
                              const reviewerName =
                                review.user_id?.first_name ||
                                review.user_id?.username ||
                                "Customer";
                              const reviewerInitial = reviewerName[0]?.toUpperCase() || "C";

                              return (
                                <>
                                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                    <span className="text-orange-500 font-semibold text-sm">
                                      {reviewerInitial}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {reviewerName}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                                        year: "numeric", month: "short", day: "numeric",
                                      })}
                                    </p>
                                  </div>
                                </>
                              );
                            })()}
                            <span className="ml-auto text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                              Verified
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      No reviews yet. {user ? "Be the first to review!" : "Login to write a review."}
                    </p>
                  </div>
                )}

                {hasMoreReviews && (
                  <div className="text-center mt-8">
                    <button
                      onClick={() => setReviewPage((prev) => prev + 1)}
                      className="bg-black text-white px-6 py-2 rounded-full text-[11px] font-semibold hover:bg-gray-900 transition-colors"
                    >
                      Load more
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Mobile CTA Bar */}
      <div className="hidden lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 px-4 py-3 safe-area-pb">
        <div className="flex gap-3">
          {isOutOfStock ? (
            <button
              disabled
              className="flex-1 bg-gray-500 text-white py-3 rounded-xl text-sm font-semibold cursor-not-allowed"
            >
              Out of Stock
            </button>
          ) : (
            <>
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="flex-1 border-2 border-gray-900 text-gray-900 py-3 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-all disabled:opacity-50"
              >
                {addingToCart ? "Adding..." : "Add to Cart"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={addingToCart}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 shadow-lg shadow-orange-200"
              >
                {addingToCart ? "Wait..." : "Buy Now"}
              </button>
            </>
          )}
          <a
            href="https://wa.me/923297609190"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 bg-green-500 hover:bg-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-200 flex-shrink-0"
          >
            <FaWhatsapp className="w-5 h-5 text-white" />
          </a>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ProductPage;
