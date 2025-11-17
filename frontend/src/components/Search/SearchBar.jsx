import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiCamera, FiMic } from 'react-icons/fi';
import { motion } from 'framer-motion';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [showVoiceSearch, setShowVoiceSearch] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleVisualSearch = () => {
    // Trigger file input for image upload
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        navigate('/search', { state: { image: file } });
      }
    };
    input.click();
  };

  const handleVoiceSearch = () => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        navigate(`/search?q=${encodeURIComponent(transcript)}`);
      };

      recognition.onerror = () => {
        setShowVoiceSearch(false);
      };

      recognition.onend = () => {
        setShowVoiceSearch(false);
      };

      recognition.start();
      setShowVoiceSearch(true);
    } else {
      alert('Voice search is not supported in your browser');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <motion.div
        whileFocus={{ scale: 1.02 }}
        className="flex items-center glass rounded-full overflow-hidden border border-white/10 focus-within:border-purple-500/50 focus-within:shadow-lg focus-within:shadow-purple-500/20 transition-all duration-300"
      >
        <div className="flex-1 px-6 py-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none"
          />
        </div>
        <div className="flex items-center space-x-1 pr-2">
          <motion.button
            type="button"
            onClick={handleVisualSearch}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2.5 glass rounded-full hover:bg-white/10 transition-colors mx-1"
            title="Visual Search"
          >
            <FiCamera size={18} className="text-blue-400" />
          </motion.button>
          <motion.button
            type="button"
            onClick={handleVoiceSearch}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`p-2.5 glass rounded-full hover:bg-white/10 transition-colors mx-1 ${showVoiceSearch ? 'text-red-500 animate-pulse bg-red-500/20' : ''}`}
            title="Voice Search"
          >
            <FiMic size={18} />
          </motion.button>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2.5 btn-premium rounded-full mx-1"
          >
            <FiSearch size={18} />
          </motion.button>
        </div>
      </motion.div>
    </form>
  );
};

export default SearchBar;

