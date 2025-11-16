import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AuthWrapper = ({ children }) => {
  const { user, loading, setShowAuthModal } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      setShowAuthModal(true);
      navigate('/');
    }
  }, [user, loading, navigate, setShowAuthModal]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return children;
};

export default AuthWrapper;

