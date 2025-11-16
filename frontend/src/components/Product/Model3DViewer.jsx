import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiRotateCw, FiZoomIn, FiZoomOut } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const Model3DViewer = ({ productId, onClose }) => {
  const [modelUrl, setModelUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    fetchModel3D();
  }, [productId]);

  const fetchModel3D = async () => {
    try {
      const response = await axios.get(`/api/product3d/${productId}/model`);
      setModelUrl(response.data.modelUrl);
    } catch (error) {
      if (error.response?.status === 404) {
        setError('3D model not available for this product');
      } else {
        setError('Failed to load 3D model');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-dark-card p-8 rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-center">Loading 3D model...</p>
        </div>
      </div>
    );
  }

  if (error || !modelUrl) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-dark-card p-8 rounded-lg max-w-md"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-dark-muted hover:text-white"
          >
            <FiX size={24} />
          </button>
          <p className="text-center text-red-500 mb-4">{error || '3D model not available'}</p>
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg"
          >
            Close
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-dark-card rounded-lg w-full max-w-4xl h-[90vh] flex flex-col"
      >
        <div className="p-4 border-b border-dark-border flex justify-between items-center">
          <h2 className="text-xl font-bold">3D Model Viewer</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-surface rounded-lg transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="flex-1 relative bg-dark-surface">
          {typeof window !== 'undefined' && window.customElements?.get('model-viewer') ? (
            <model-viewer
              src={modelUrl}
              alt="3D Model"
              auto-rotate
              camera-controls
              style={{ width: '100%', height: '100%' }}
              ar
              ar-modes="webxr scene-viewer quick-look"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-lg mb-4">3D Model Viewer Loading...</p>
                <a
                  href={modelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-400"
                >
                  Download 3D Model
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-dark-border text-sm text-dark-muted text-center">
          <p>Use mouse to rotate, scroll to zoom, drag to pan</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Model3DViewer;

