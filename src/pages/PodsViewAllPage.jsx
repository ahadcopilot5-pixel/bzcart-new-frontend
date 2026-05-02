import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { productAPI } from "../services/api";
import { createSlug } from "../utils/helpers";
import SectionLoader from "../components/ui/SectionLoader";

const formatPrice = (price) => `Rs.${price?.toLocaleString() || 0} PKR`;

const PodsViewAllPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await productAPI.getByCategory("pods-vape");
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching pods:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <section className="bg-gray-50 py-12 lg:py-16">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <h2 className="text-2xl lg:text-3xl font-medium text-center text-gray-900 mb-8 lg:mb-12">
          All Pods & Vapes
        </h2>

        {loading ? (
          <SectionLoader
            count={12}
            columnsClass="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6"
            cardClass="aspect-square"
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {products.map((product) => (
              <Link
                key={product._id}
                to={`/product/${createSlug(product.product_name)}`}
                className="group bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-gray-300 transition-colors"
              >
                <div className="aspect-square bg-white p-3 flex items-center justify-center">
                  <img
                    src={product.product_images?.[0] || "/pod.png"}
                    alt={product.product_name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="px-3 pb-3 pt-1 text-center">
                  <h3 className="text-xs md:text-sm font-medium text-gray-900 line-clamp-2 mb-1 leading-tight">
                    {product.product_name}
                  </h3>
                  <p className="text-xs md:text-sm font-semibold text-gray-800">
                    {formatPrice(product.product_discounted_price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="flex justify-center mt-10">
          <Link
            to="/pods"
            className="text-sm text-orange-500 font-medium hover:text-orange-600 transition-colors"
          >
            ← Back to Pods & Vape
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PodsViewAllPage;
