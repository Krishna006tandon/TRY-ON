import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import ProductCard from '../components/Product/ProductCard';
import CartDrawer from '../components/Cart/CartDrawer';
import Chatbot from '../components/Chatbot/Chatbot';

const Products = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [searchParams, page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const category = searchParams.get('category');
      const search = searchParams.get('search');
      const params = { page, limit: 20 };
      if (category) params.category = category;
      if (search) params.search = search;

      const response = await axios.get('/api/products', { params });
      setProducts(response.data.products || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="h-1 w-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" />
            <h1 className="text-5xl md:text-6xl font-extrabold gradient-text">
              All Products
            </h1>
            <div className="h-1 flex-1 bg-gradient-to-r from-blue-500 to-transparent rounded-full" />
          </div>
          <p className="text-gray-400 text-lg ml-24">Discover our complete collection</p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="glass rounded-3xl h-[500px] skeleton" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 glass rounded-3xl border border-white/10">
            <p>No products found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center items-center gap-4 mt-12"
              >
                <motion.button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  whileHover={{ scale: page !== 1 ? 1.05 : 1 }}
                  whileTap={{ scale: page !== 1 ? 0.95 : 1 }}
                  className="px-6 py-3 glass rounded-xl font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                >
                  Previous
                </motion.button>
                <div className="px-6 py-3 glass rounded-xl font-medium">
                  Page <span className="gradient-text font-bold">{page}</span> of {totalPages}
                </div>
                <motion.button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  whileHover={{ scale: page !== totalPages ? 1.05 : 1 }}
                  whileTap={{ scale: page !== totalPages ? 0.95 : 1 }}
                  className="px-6 py-3 glass rounded-xl font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                >
                  Next
                </motion.button>
              </motion.div>
            )}
          </>
        )}
      </div>

      <Chatbot />
      <CartDrawer />
    </div>
  );
};

export default Products;

