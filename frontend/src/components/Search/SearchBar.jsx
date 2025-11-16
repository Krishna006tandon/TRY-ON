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
      <div className="flex items-center bg-dark-card border border-dark-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="flex-1 px-4 py-2 bg-transparent focus:outline-none"
        />
        <div className="flex items-center space-x-2 pr-2">
          <button
            type="button"
            onClick={handleVisualSearch}
            className="p-2 hover:bg-dark-surface rounded transition-colors"
            title="Visual Search"
          >
            <FiCamera size={18} />
          </button>
          <button
            type="button"
            onClick={handleVoiceSearch}
            className={`p-2 hover:bg-dark-surface rounded transition-colors ${showVoiceSearch ? 'text-red-500 animate-pulse' : ''}`}
            title="Voice Search"
          >
            <FiMic size={18} />
          </button>
          <button
            type="submit"
            className="p-2 bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <FiSearch size={18} />
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;

