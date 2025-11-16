import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiBox } from 'react-icons/fi';

const Generate3DButton = ({ productId, currentStatus, onStatusUpdate }) => {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (currentStatus === 'processing') {
      toast.info('3D model generation already in progress');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`/api/product3d/${productId}/generate`);
      toast.success('3D model generation started!');
      if (onStatusUpdate) {
        onStatusUpdate('processing');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start 3D generation');
    } finally {
      setLoading(false);
    }
  };

  if (currentStatus === 'completed') {
    return (
      <span className="text-green-500 flex items-center space-x-2">
        <FiBox />
        <span>3D Model Available</span>
      </span>
    );
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={loading || currentStatus === 'processing'}
      className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <FiBox />
      <span>
        {loading ? 'Starting...' : currentStatus === 'processing' ? 'Processing...' : 'Generate 3D Model'}
      </span>
    </button>
  );
};

export default Generate3DButton;

