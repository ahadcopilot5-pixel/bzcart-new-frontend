import { Link } from "react-router-dom";

const products = [
  {
    id: 1,
    name: "Hood Plain Style Imported Puffer Jacket",
    image: "/loosebottomtrousers.jpg",
    price: "Rs.6,999.00 PKR",
    href: "/product/1",
  },
  {
    id: 2,
    name: "Hood Plain Style Imported Puffer Jacket",
    image: "/tracksuits.jpg",
    price: "Rs.6,999.00 PKR",
    href: "/product/2",
  },
  {
    id: 3,
    name: "Hood Plain Style Imported Puffer Jacket",
    image: "/loosebottomtrousers.jpg",
    price: "Rs.6,999.00 PKR",
    href: "/product/3",
  },
  {
    id: 4,
    name: "Hood Plain Style Imported Puffer Jacket",
    image: "/tracksuits.jpg",
    price: "Rs.6,999.00 PKR",
    href: "/product/4",
  },
  {
    id: 5,
    name: "Hood Plain Style Imported Puffer Jacket",
    image: "/loosebottomtrousers.jpg",
    price: "Rs.6,999.00 PKR",
    href: "/product/5",
  },
  {
    id: 6,
    name: "Hood Plain Style Imported Puffer Jacket",
    image: "/tracksuits.jpg",
    price: "Rs.6,999.00 PKR",
    href: "/product/6",
  },
  {
    id: 7,
    name: "Hood Plain Style Imported Puffer Jacket",
    image: "/loosebottomtrousers.jpg",
    price: "Rs.6,999.00 PKR",
    href: "/product/7",
  },
  {
    id: 8,
    name: "Hood Plain Style Imported Puffer Jacket",
    image: "/tracksuits.jpg",
    price: "Rs.6,999.00 PKR",
    href: "/product/8",
  },
  {
    id: 9,
    name: "Hood Plain Style Imported Puffer Jacket",
    image: "/loosebottomtrousers.jpg",
    price: "Rs.6,999.00 PKR",
    href: "/product/9",
  },
  {
    id: 10,
    name: "Hood Plain Style Imported Puffer Jacket",
    image: "/tracksuits.jpg",
    price: "Rs.6,999.00 PKR",
    href: "/product/10",
  },
  {
    id: 11,
    name: "Hood Plain Style Imported Puffer Jacket",
    image: "/loosebottomtrousers.jpg",
    price: "Rs.6,999.00 PKR",
    href: "/product/11",
  },
  {
    id: 12,
    name: "Hood Plain Style Imported Puffer Jacket",
    image: "/tracksuits.jpg",
    price: "Rs.6,999.00 PKR",
    href: "/product/12",
  },
];

const TrendingStylesPage = () => {
  return (
    <section className="bg-gray-50 py-12 lg:py-16">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        {/* Section Title */}
        <h2 className="text-2xl lg:text-3xl font-medium text-gray-900 text-center mb-10">
          Trending Styles
        </h2>

        {/* Products Grid - 4 columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {products.map((product) => (
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
                <h3 className="text-xs lg:text-sm font-medium text-gray-900 leading-tight mb-1">
                  {product.name}
                </h3>
                <p className="text-xs text-orange-500 font-medium">
                  {product.price}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingStylesPage;
