import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { WishlistProvider } from './contexts/WishlistContext';
import AuthWrapper from './components/Auth/AuthWrapper';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import UtilityStrip from './components/Layout/UtilityStrip';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Profile from './pages/Profile';
import SearchResults from './pages/SearchResults';
import Wishlist from './pages/Wishlist';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminProducts from './pages/Admin/Products';
import AdminUsers from './pages/Admin/Users';
import AdminOrders from './pages/Admin/Orders';
import AdminCoupons from './pages/Admin/Coupons';
import AuraBackground from './components/Background/AuraBackground';
import AuthModal from './components/Auth/AuthModal';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
            <div className="min-h-screen relative overflow-hidden">
              <AuraBackground />
              <div className="relative z-10">
                <UtilityStrip />
                <Navbar />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetails />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/orders" element={<AuthWrapper><Orders /></AuthWrapper>} />
                  <Route path="/orders/:id" element={<AuthWrapper><OrderDetails /></AuthWrapper>} />
                  <Route path="/profile" element={<AuthWrapper><Profile /></AuthWrapper>} />
                  <Route path="/wishlist" element={<AuthWrapper><Wishlist /></AuthWrapper>} />
                  <Route path="/search" element={<SearchResults />} />
                  <Route path="/admin" element={<AuthWrapper><AdminDashboard /></AuthWrapper>} />
                  <Route path="/admin/products" element={<AuthWrapper><AdminProducts /></AuthWrapper>} />
                  <Route path="/admin/users" element={<AuthWrapper><AdminUsers /></AuthWrapper>} />
                  <Route path="/admin/orders" element={<AuthWrapper><AdminOrders /></AuthWrapper>} />
                  <Route path="/admin/coupons" element={<AuthWrapper><AdminCoupons /></AuthWrapper>} />
                </Routes>
                <Footer />
              </div>
              <AuthModal />
              <Toaster 
                position="top-right"
                toastOptions={{
                  style: {
                    background: '#1a1a1a',
                    color: '#fff',
                    border: '1px solid #333',
                  },
                }}
              />
            </div>
          </Router>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

