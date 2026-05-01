import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productAPI } from "../../services/api";
import { createSlug } from "../../utils/helpers";
import SectionLoader from "../ui/SectionLoader";

const formatPrice = (price) => `Rs.${price?.toLocaleString() || 0} PKR`;

const TrendingStyles2 = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productAPI.getAll();
        // Get products 9-12 (or last 4) for second trending section
        const allProducts = Array.isArray(data) ? data : [];
        const startIndex = Math.min(8, allProducts.length);
        const trendingProducts = allProducts
          .slice(startIndex, startIndex + 4)
          .map((p) => ({
            id: p._id,
            name: p.product_name,
            image: p.product_images?.[0] || "/tracksuits.jpg",
            price: formatPrice(p.product_discounted_price),
            href: `/product/${createSlug(p.product_name)}`,
          }));
        // If not enough products, use from beginning
        if (trendingProducts.length < 4 && allProducts.length > 0) {
          const remaining = 4 - trendingProducts.length;
          const moreProducts = allProducts.slice(0, remaining).map((p) => ({
            id: p._id,
            name: p.product_name,
            image: p.product_images?.[0] || "/tracksuits.jpg",
            price: formatPrice(p.product_discounted_price),
            href: `/product/${createSlug(p.product_name)}`,
          }));
          trendingProducts.push(...moreProducts);
        }
        setProducts(trendingProducts);
      } catch (error) {
        console.error("Error fetching trending products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Fallback products if no data
  const displayProducts =
    products.length > 0
      ? products
      : [
          {
            id: 1,
            name: "Hood Plain Style Imported Puffer Jacket",
            image: "/loosebottomtrousers.jpg",
            price: "Rs.6,999.00 PKR",
            href: "/product/9",
          },
          {
            id: 2,
            name: "Hood Plain Style Imported Puffer Jacket",
            image: "/tracksuits.jpg",
            price: "Rs.6,999.00 PKR",
            href: "/product/10",
          },
          {
            id: 3,
            name: "Hood Plain Style Imported Puffer Jacket",
            image: "/loosebottomtrousers.jpg",
            price: "Rs.6,999.00 PKR",
            href: "/product/11",
          },
          {
            id: 4,
            name: "Hood Plain Style Imported Puffer Jacket",
            image: "/tracksuits.jpg",
            price: "Rs.6,999.00 PKR",
            href: "/product/12",
          },
        ];

  return (
    <section className="bg-gray-50 py-12 lg:py-16">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        {/* Products Grid - 4 columns */}
        {loading ? (
          <SectionLoader
            count={4}
            columnsClass="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6"
            cardClass="aspect-[3/4]"
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {displayProducts.map((product) => (
              <Link key={product.id} to={product.href} className="group">
                {/* Image */}
                <div className="aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 mb-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Product Info */}
                <div>
                  <h3 className="text-xs lg:text-sm font-medium text-gray-900 leading-tight mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-orange-500 font-medium">
                    {product.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* View All Link */}
        <div className="text-center mt-10">
          <Link
            to="/trending"
            className="text-orange-500 hover:text-orange-600 text-sm font-medium underline underline-offset-4"
          >
            View all
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TrendingStyles2;
