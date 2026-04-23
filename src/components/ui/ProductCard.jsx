import { Link } from "react-router-dom";
import { memo } from "react";
import { getProductUrl } from "../../utils/helpers";

const ProductCard = memo(({ product }) => {
  const {
    _id,
    product_name,
    product_images,
    product_base_price,
    product_discounted_price,
    rating,
  } = product;

  const hasDiscount = product_base_price > product_discounted_price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product_base_price - product_discounted_price) / product_base_price) *
          100,
      )
    : 0;

  const formatPrice = (price) => {
    return `Rs.${price?.toLocaleString() || 0} PKR`;
  };

  const productUrl = getProductUrl(product);

  return (
    <Link to={productUrl} className="group block">
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 mb-3">
        <img
          src={product_images?.[0] || "/placeholder.jpg"}
          alt={product_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
            -{discountPercent}%
          </div>
        )}

        {/* Rating Badge */}
        {rating > 0 && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded flex items-center gap-1">
            <span className="text-yellow-400">★</span>
            <span>{rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-1">
        <h3 className="text-sm md:text-base font-medium text-gray-800 line-clamp-2 group-hover:text-orange-500 transition-colors">
          {product_name}
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-sm md:text-base font-semibold text-orange-500">
            {formatPrice(product_discounted_price)}
          </span>
          {hasDiscount && (
            <span className="text-xs md:text-sm text-gray-400 line-through">
              {formatPrice(product_base_price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;
