import { createBrowserRouter } from "react-router-dom";
import {
  AuthLayout,
  LoginForm,
  SignupForm,
  VerifyOTPForm,
  ForgotPasswordForm,
  ResetPasswordForm,
} from "../components/auth";
import { MainLayout } from "../components/layout";
import {
  HomePage,
  MensClothingPage,
  TrendingStylesPage,
  ProductPage,
  CheckoutPage,
  WatchesPage,
  WatchesViewAllPage,
  ShoesPage,
  ShoesViewAllPage,
  PodsPage,
  CarePage,
  TrackingPage,
} from "../pages";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "trending", element: <TrendingStylesPage /> },
      { path: "product/:slug", element: <ProductPage /> },
      { path: "watches", element: <WatchesPage /> },
      { path: "watches/all", element: <WatchesViewAllPage /> },
      { path: "shoes", element: <ShoesPage /> },
      { path: "shoes/all", element: <ShoesViewAllPage /> },
      { path: "mens-clothing", element: <MensClothingPage /> },
      { path: "pods", element: <PodsPage /> },
      { path: "care", element: <CarePage /> },
    ],
  },
  {
    path: "/checkout",
    element: <CheckoutPage />,
  },
  {
    path: "/tracking",
    element: <TrackingPage />,
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { index: true, element: <LoginForm /> },
      { path: "login", element: <LoginForm /> },
      { path: "signup", element: <SignupForm /> },
      { path: "verify-otp", element: <VerifyOTPForm /> },
      { path: "forgot-password", element: <ForgotPasswordForm /> },
      { path: "reset-password", element: <ResetPasswordForm /> },
    ],
  },
]);

export default router;
