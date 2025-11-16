import { useEffect, useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/Product/ProductCard';
import CartDrawer from '../components/Cart/CartDrawer';
import Chatbot from '../components/Chatbot/Chatbot';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const query = searchParams.get('q');
  const imageFile = location.state?.image;

  useEffect(() => {
    if (imageFile) {
      performVisualSearch(imageFile);
    } else if (query) {
      performTextSearch(query);
    }
  }, [query, imageFile]);

  const performTextSearch = async (searchQuery) => {
    setLoading(true);
    try {
      const response = await axios.get('/api/search/text', {
        params: { q: searchQuery }
      });
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const performVisualSearch = async (file) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post('/api/search/visual', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error visual searching:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          {query ? `Search Results for "${query}"` : 'Visual Search Results'}
        </h1>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-dark-card rounded-lg h-96 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-dark-muted">
            <p>No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>

      <Chatbot />
      <CartDrawer />
    </div>
  );
};

export default SearchResults;

