import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productAPI } from "../../services/api";
import { createSlug } from "../../utils/helpers";

const formatPrice = (price) => `Rs.${price?.toLocaleString() || 0} PKR`;

const WinterJackets = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Get Men's Clothing products using string category ID
        const data = await productAPI.getByCategory("mens-clothing");
        const categoryProducts = (Array.isArray(data) ? data : [])
          .slice(0, 4)
          .map((p) => ({
            name: p.product_name,
            image: p.product_images?.[0] || "/pufferjacket.jpg",
            href: `/product/${createSlug(p.product_name)}`,
          }));
        setProducts(categoryProducts);
      } catch (error) {
        console.error("Error fetching winter jackets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Fallback categories if no products
  const displayItems =
    products.length > 0
      ? products
      : [
          {
            name: "PUFFER JACKETS",
            image: "/pufferjacket.jpg",
            href: "/mens-clothing",
          },
          { name: "GILETS", image: "/gilets.png", href: "/mens-clothing" },
          {
            name: "WOOL JACKETS",
            image: "/wooljackets.jpg",
            href: "/mens-clothing",
          },
          {
            name: "SUEDE LEATHER JACKETS",
            image: "/suede.jpg",
            href: "/mens-clothing",
          },
        ];

  return (
    <section className="bg-white py-8 lg:py-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-12">
        {/* Section Title */}
        <h2 className="text-base sm:text-2xl lg:text-3xl font-bold text-gray-900 text-center mb-6 lg:mb-10">
          EXCLUSIVE WINTER JACKETS
        </h2>

        {/* Mobile: single column, Desktop: grid */}
        {loading ? (
          <div className="flex flex-col gap-5 lg:grid lg:grid-cols-4 lg:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="w-full aspect-[3/4] bg-gray-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-5 lg:grid lg:grid-cols-4 lg:gap-6">
            {displayItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="group flex flex-col items-center bg-white rounded-xl overflow-hidden shadow-sm lg:relative lg:bg-gray-100"
              >
                {/* Image with label overlay */}
                <div className="w-full aspect-[3/4] overflow-hidden rounded-xl relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Label overlay for mobile, absolute for desktop */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-auto lg:bottom-4">
                    <span className="bg-white px-4 py-2 rounded-full text-xs font-medium text-gray-800 whitespace-nowrap shadow-sm border border-gray-200 line-clamp-1">
                      {item.name}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default WinterJackets;
