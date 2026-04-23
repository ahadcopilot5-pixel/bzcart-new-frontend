import { useState, useEffect, useCallback } from "react";
import { productAPI } from "../../services/api";
import ProductGrid from "../ui/ProductGrid";

const CategoryProductsSection = ({ categorySlug, title }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      // Use string category ID directly
      const data = await productAPI.getByCategory(categorySlug);
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [categorySlug]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <section className="py-12 lg:py-16">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        {title && (
          <h2 className="text-2xl lg:text-3xl font-medium text-gray-900 text-center mb-10">
            {title}
          </h2>
        )}
        <ProductGrid
          products={products}
          loading={loading}
          emptyMessage={`No products found in ${title || categorySlug}`}
        />
      </div>
    </section>
  );
};

export default CategoryProductsSection;
