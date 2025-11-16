import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import ProductCard from '../components/Product/ProductCard';
import Chatbot from '../components/Chatbot/Chatbot';
import CartDrawer from '../components/Cart/CartDrawer';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [featuredRes, recommendationsRes] = await Promise.all([
        axios.get('/api/products/featured'),
        axios.get('/api/recommendations/personalized').catch(() => ({ data: { products: [] } }))
      ]);

      setFeaturedProducts(featuredRes.data.products || []);
      setRecommendations(recommendationsRes.data.products || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Welcome to TRY-ON
          </h1>
          <p className="text-xl text-dark-muted mb-8 max-w-2xl mx-auto">
            Discover the latest fashion trends and style your perfect look
          </p>
          <Link
            to="/products"
            className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
          >
            Shop Now
          </Link>
        </motion.div>
      </section>

      {/* Featured Products */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-dark-card rounded-lg h-96 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Recommended for You</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Chatbot />
      <CartDrawer />
    </div>
  );
};

export default Home;

