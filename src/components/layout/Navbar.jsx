import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiOutlineShoppingCart,
  HiOutlineUser,
  HiOutlineLogout,
  HiOutlinePhotograph,
  HiOutlineLocationMarker,
} from "react-icons/hi";
import { IoChevronDown } from "react-icons/io5";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { showToast } from "../../utils/helpers";
import ProfilePictureModal from "../ui/ProfilePictureModal";
import CartDrawer from "../ui/CartDrawer";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Pods & Vape", href: "/pods" },
  { name: "Watches", href: "/watches" },
  { name: "Shoes", href: "/shoes" },
];

const MORE_CATEGORIES = [
  { name: "Men's Clothes", href: "/mens-clothing" },
  { name: "Care Products", href: "/care" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount, openCart } = useCart();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const desktopDropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const mobileProfileDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideCategories =
        (!desktopDropdownRef.current ||
          !desktopDropdownRef.current.contains(event.target)) &&
        (!mobileDropdownRef.current ||
          !mobileDropdownRef.current.contains(event.target));

      const isOutsideProfile =
        (!profileDropdownRef.current ||
          !profileDropdownRef.current.contains(event.target)) &&
        (!mobileProfileDropdownRef.current ||
          !mobileProfileDropdownRef.current.contains(event.target));

      if (isOutsideCategories) setIsDropdownOpen(false);
      if (isOutsideProfile) setIsProfileDropdownOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setIsProfileDropdownOpen(false);
    showToast.success("Logged out successfully");
    navigate("/");
  }, [logout, navigate]);

  const openProfileModal = useCallback(() => {
    setIsProfileDropdownOpen(false);
    setIsProfileModalOpen(true);
  }, []);

  const openTrackingPage = useCallback(() => {
    setIsProfileDropdownOpen(false);
    navigate("/tracking");
  }, [navigate]);

  const toggleCategoriesDropdown = useCallback(
    () => setIsDropdownOpen((prev) => !prev),
    [],
  );
  const toggleProfileDropdown = useCallback(
    () => setIsProfileDropdownOpen((prev) => !prev),
    [],
  );
  const closeCategoriesDropdown = useCallback(
    () => setIsDropdownOpen(false),
    [],
  );

  // Reusable Profile Avatar
  const ProfileAvatar = ({ size = "md" }) => {
    const sizeClasses = size === "md" ? "w-8 h-8" : "w-7 h-7";
    return user?.profileImage ? (
      <img
        src={user.profileImage}
        alt="Profile"
        className={`${sizeClasses} rounded-full object-cover`}
      />
    ) : (
      <HiOutlineUser size={size === "md" ? 20 : 18} className="text-white" />
    );
  };

  // Reusable Dropdown Menu
  const ProfileDropdown = ({ isMobile = false }) => (
    <div
      className={`absolute top-full right-0 mt-2 ${isMobile ? "w-44" : "w-48"} bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50`}
    >
      <div
        className={`${isMobile ? "px-3 py-2" : "px-4 py-2"} border-b border-gray-100`}
      >
        <p
          className={`${isMobile ? "text-xs" : "text-sm"} font-medium text-gray-800 truncate`}
        >
          {user?.username || user?.email}
        </p>
        {!isMobile && (
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
        )}
      </div>
      <button
        onClick={openProfileModal}
        className={`w-full flex items-center gap-2 ${isMobile ? "px-3 py-2 text-xs" : "px-4 py-2 text-sm"} text-gray-700 hover:bg-gray-50 transition-colors`}
      >
        <HiOutlinePhotograph size={isMobile ? 14 : 16} />
        {isMobile ? "Change Picture" : "Change Profile Picture"}
      </button>
      <button
        onClick={openTrackingPage}
        className={`w-full flex items-center gap-2 ${isMobile ? "px-3 py-2 text-xs" : "px-4 py-2 text-sm"} text-gray-700 hover:bg-gray-50 transition-colors`}
      >
        <HiOutlineLocationMarker size={isMobile ? 14 : 16} />
        {isMobile ? "Track Order" : "Track Orders"}
      </button>
      <button
        onClick={handleLogout}
        className={`w-full flex items-center gap-2 ${isMobile ? "px-3 py-2 text-xs" : "px-4 py-2 text-sm"} text-red-600 hover:bg-red-50 transition-colors`}
      >
        <HiOutlineLogout size={isMobile ? 14 : 16} />
        Logout
      </button>
    </div>
  );

  return (
    <>
      <nav className="w-full bg-white">
        {/* Desktop Layout */}
        <div className="hidden md:block py-4 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <Link to="/">
              <img src="/logo.png" alt="EZBZCART" className="h-8 lg:h-10" />
            </Link>

            {/* Nav Links - Pill Border */}
            <div className="flex items-center gap-6 lg:gap-8 border border-gray-200 rounded-full px-6 py-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-sm text-gray-700 hover:text-orange-500 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              {/* More Categories Dropdown */}
              <div className="relative" ref={desktopDropdownRef}>
                <button
                  onClick={toggleCategoriesDropdown}
                  className="flex items-center gap-1 text-sm text-gray-700 hover:text-orange-500 transition-colors"
                >
                  More Categories
                  <IoChevronDown
                    size={14}
                    className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                    {MORE_CATEGORIES.map((category) => (
                      <Link
                        key={category.name}
                        to={category.href}
                        onClick={closeCategoriesDropdown}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-500 transition-colors"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Icons */}
            <div className="flex items-center gap-3">
              <button
                onClick={openCart}
                className="relative p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <HiOutlineShoppingCart size={20} className="text-gray-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>

              {isAuthenticated ? (
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={toggleProfileDropdown}
                    className={`p-2 rounded-full transition-colors flex items-center justify-center ${user?.profileImage ? "bg-transparent hover:bg-gray-100" : "bg-orange-500 hover:bg-orange-600"}`}
                  >
                    <ProfileAvatar size="md" />
                  </button>
                  {isProfileDropdownOpen && <ProfileDropdown />}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/auth/login"
                    className="px-4 py-2 text-sm text-gray-700 hover:text-orange-500 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/auth/signup"
                    className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors"
                  >
                    Signup
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="px-4 py-3 flex items-center justify-between">
            <Link to="/">
              <img src="/logo.png" alt="EZBZCART" className="h-7" />
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={openCart}
                className="relative p-1.5 rounded-full bg-gray-100"
              >
                <HiOutlineShoppingCart size={18} className="text-gray-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-semibold rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>

              {isAuthenticated ? (
                <div className="relative" ref={mobileProfileDropdownRef}>
                  <button
                    onClick={toggleProfileDropdown}
                    className={`p-1.5 rounded-full flex items-center justify-center ${user?.profileImage ? "bg-transparent" : "bg-orange-500"}`}
                  >
                    <ProfileAvatar size="sm" />
                  </button>
                  {isProfileDropdownOpen && <ProfileDropdown isMobile />}
                </div>
              ) : (
                <Link
                  to="/auth/login"
                  className="p-1.5 rounded-full bg-orange-500"
                >
                  <HiOutlineUser size={18} className="text-white" />
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Nav Links */}
          <div className="pb-3 px-4 flex items-center gap-2">
            {/* Scrollable link chips — overflow-x-auto here but NO overflow clipping on dropdown */}
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-2 w-max">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="text-xs text-gray-600 whitespace-nowrap px-3 py-1.5 rounded-full border border-gray-200 hover:border-orange-400 hover:text-orange-500 transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* More Categories — outside scroll container so dropdown is never clipped */}
            <div className="relative flex-shrink-0" ref={mobileDropdownRef}>
              <button
                onClick={toggleCategoriesDropdown}
                className="flex items-center gap-1 text-xs text-gray-600 whitespace-nowrap px-3 py-1.5 rounded-full border border-gray-200 hover:border-orange-400 hover:text-orange-500 transition-colors"
              >
                More
                <IoChevronDown
                  size={11}
                  className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
                  {MORE_CATEGORIES.map((category) => (
                    <Link
                      key={category.name}
                      to={category.href}
                      onClick={closeCategoriesDropdown}
                      className="block px-4 py-2.5 text-xs text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Profile Picture Modal */}
      <ProfilePictureModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Cart Drawer */}
      <CartDrawer />
    </>
  );
};

export default Navbar;
