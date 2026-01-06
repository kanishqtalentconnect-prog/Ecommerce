import { Routes, Route } from "react-router-dom"; 
import HomePage from "./pages/Homepage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import Cart from "./pages/Cart"; 
import Navbar from "./components/Navbar";
import AdminDashboard from "./components/AdminDashboard";
import CreateProductForm from "./components/CreateProductForm";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import { CartProvider } from "./context/CartContext"; 
import { CurrencyProvider } from "./context/CurrencyContext"; 
import { AuthProvider } from "./context/AuthContext"; // Make sure to import AuthProvider
import ProductDetail from "./pages/ProductDetail";
import Footer from "./footers/footer";
import GlobalCurrencySelector from "./footers/currency";
import AllProducts from "./components/AllProducts";
import SearchPage from "./pages/SearchPage";

import PrivacyPolicy from "./pages/PrivacyPolicy";
import ShippingPolicy from "./pages/ShippingPolicy";
import TermsOfService from "./pages/TermsOfService";
import RefundPolicy from "./pages/RefundPolicy";
import Contact from "./pages/Contact";
import DeityProducts from "./pages/DeityProducts";
import OurStory from "./pages/ourStory";
import GodProductsPage from "./pages/GodProducts";
import CheckoutPage from "./pages/CheckoutPage";
import CategoryProducts from "./pages/CategoryProducts";
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import PaymentPage from "./pages/PaymentPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import RecentOrders from "./components/RecentOrders";
import OrderManagement from "./components/OrderManagement";
import OrderDetail from "./components/OrderDetails";
import NewArrivals from "./components/NewArrivals";
import DiscountedProducts from "./components/DiscountedProducts";
import Collections from "./components/Collections";
import { AddressProvider } from "./context/AddressContext";


function App() {
  return (
    <AuthProvider>
      <AddressProvider>
        <CurrencyProvider>
          <CartProvider>
            <Navbar />
            {/* Fixed padding top to account for the fixed navbar height */}
            <div className="pt-[160px] min-h-screen">
              <GlobalCurrencySelector />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/profile" element={
                  <ProtectedRoute>
                  <ProfilePage />
                  </ProtectedRoute>
                  } />
                
                {/* Protected Admin Routes */}
                <Route path="/admin" element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                } />
                
                <Route path="/admin/create-product" element={
                  <ProtectedAdminRoute>
                    <CreateProductForm />
                  </ProtectedAdminRoute>
                } />
                <Route path="/admin/orders" element={
                  <ProtectedAdminRoute>
                    <OrderManagement/>
                  </ProtectedAdminRoute>
                } />
                <Route path="/admin/orders/:id" element={
                  <ProtectedAdminRoute>
                    <OrderDetail />
                  </ProtectedAdminRoute>
                } />
                <Route path="/admin/order-recent" element={
                  <ProtectedAdminRoute>
                    <RecentOrders/>
                  </ProtectedAdminRoute>
                } />
                
                <Route path="/cart" element={<Cart />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/search" element={<SearchPage />} />

                <Route path="/deity/:name" element={<DeityProducts />} />
                <Route path="/:category" element={<CategoryProducts />} />

                <Route path="/god/:godName" element={<GodProductsPage />} />
                
                <Route path="/collection/allproduct" element={<AllProducts />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/shipping-policy" element={<ShippingPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/our-story" element={<OurStory />} />
                <Route path="/new-arrivals" element={<NewArrivals />} />
                <Route path="/discounted-products" element={<DiscountedProducts />} />
                <Route path="/checkout" element={
                  <ProtectedRoute>
                  <CheckoutPage />
                  </ProtectedRoute>
                } />
                <Route path="/payment" element={
                  <ProtectedRoute>
                  <PaymentPage />
                  </ProtectedRoute>
                  } />
                <Route path="/order-confirmation" element={
                    <ProtectedRoute>
                    <OrderConfirmationPage />
                    </ProtectedRoute>
                  } />

                <Route path="*" element={<h1 className="text-center mt-10">404 Not Found</h1>} />
              </Routes>
            </div>

            <div>
              <Footer/>
            </div>
          </CartProvider>
        </CurrencyProvider>
      </AddressProvider>
    </AuthProvider>
  );
}

export default App;