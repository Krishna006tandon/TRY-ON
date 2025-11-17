import { useState, useEffect } from 'react';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../contexts/AuthContext';
import { FiHeart } from 'react-icons/fi';

const WishlistButton = ({ productId, size = 'md', className = '' }) => {
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    setIsInWishlist(wishlistItems.has(productId));
  }, [wishlistItems, productId]);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      return;
    }

    setIsAnimating(true);
    await toggleWishlist(productId);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <button
      onClick={handleClick}
      className={`
        ${sizeClasses[size]}
        relative
        group
        rounded-full
        backdrop-blur-xl
        bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-purple-600/20
        border border-white/20
        shadow-lg shadow-purple-500/20
        transition-all duration-300
        hover:scale-110
        hover:shadow-xl hover:shadow-purple-500/30
        active:scale-95
        ${isAnimating ? 'animate-pulse' : ''}
        ${className}
      `}
      style={{
        background: isInWishlist 
          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(219, 39, 119, 0.3) 100%)'
          : 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
      }}
    >
      <FiHeart
        className={`
          absolute inset-0 m-auto
          transition-all duration-300
          ${isInWishlist 
            ? 'text-red-500 scale-110 fill-red-500' 
            : 'text-white/70 group-hover:text-white'
          }
          ${isAnimating ? 'scale-125' : ''}
        `}
        size={size === 'sm' ? 16 : size === 'md' ? 20 : 24}
        style={isInWishlist ? { fill: 'currentColor' } : {}}
      />
      
      {/* Ripple effect */}
      {isAnimating && (
        <span
          className="absolute inset-0 rounded-full animate-ping"
          style={{
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, transparent 70%)',
          }}
        />
      )}
    </button>
  );
};

export default WishlistButton;

