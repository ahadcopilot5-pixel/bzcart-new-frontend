import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MensHeroSection from "../components/home/MensHeroSection";
import WinterJackets from "../components/home/WinterJackets";
import ClientTestimonials from "../components/home/ClientTestimonials";
import { productAPI } from "../services/api";
import { createSlug } from "../utils/helpers";
import SectionLoader from "../components/ui/SectionLoader";

const formatPrice = (price) => `Rs.${price?.toLocaleString() || 0} PKR`;

// Men's Clothing Products Grid Component
const MensClothingProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch only men's clothing category products
        const data = await productAPI.getByCategory("mens-clothing");
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching men's clothing products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const displayProducts = products.slice(0, 8);
  const moreProducts = products.slice(8, 16);

  return (
    <>
      {/* Trending Men's Styles */}
      <section className="bg-white py-12 lg:py-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <h2 className="text-2xl lg:text-3xl font-medium text-gray-900 text-center mb-10">
            Trending Men's Styles
          </h2>

          {loading ? (
            <SectionLoader
              count={8}
              columnsClass="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6"
              cardClass="aspect-[3/4]"
            />
          ) : displayProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {displayProducts.map((product) => (
                <Link
                  key={product._id}
                  to={`/product/${createSlug(product.product_name)}`}
                  className="group"
                >
                  <div className="aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 mb-3">
                    <img
                      src={product.product_images?.[0] || "/placeholder.png"}
                      alt={product.product_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div>
                    <h3 className="text-xs lg:text-sm font-medium text-gray-900 leading-tight mb-1">
                      {product.product_name}
                    </h3>
                    <p className="text-xs text-orange-500 font-medium">
                      {formatPrice(product.product_discounted_price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              No products found in this category.
            </p>
          )}
        </div>
      </section>

      {/* More Men's Collection */}
      {moreProducts.length > 0 && (
        <section className="bg-gray-50 py-12 lg:py-16">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <h2 className="text-2xl lg:text-3xl font-medium text-gray-900 text-center mb-10">
              More From Collection
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {moreProducts.map((product) => (
                <Link
                  key={product._id}
                  to={`/product/${createSlug(product.product_name)}`}
                  className="group"
                >
                  <div className="aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 mb-3">
                    <img
                      src={product.product_images?.[0] || "/placeholder.png"}
                      alt={product.product_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div>
                    <h3 className="text-xs lg:text-sm font-medium text-gray-900 leading-tight mb-1">
                      {product.product_name}
                    </h3>
                    <p className="text-xs text-orange-500 font-medium">
                      {formatPrice(product.product_discounted_price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

const MensClothingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <MensHeroSection />
      <WinterJackets />
      <MensClothingProducts />
      <ClientTestimonials />
    </div>
  );
};

export default MensClothingPage;
