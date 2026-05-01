import { memo } from "react";
import ProductCard from "./ProductCard";
import SectionLoader from "./SectionLoader";

const ProductGrid = memo(
  ({ products, loading, emptyMessage = "No products found" }) => {
    if (loading) {
      return (
        <SectionLoader
          count={8}
          columnsClass="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
          cardClass="aspect-[3/4]"
        />
      );
    }

    if (!products || products.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    );
  },
);

ProductGrid.displayName = "ProductGrid";

export default ProductGrid;
