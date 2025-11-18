import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiX, FiUpload, FiLoader, FiImage, FiArrowRight, FiMaximize } from 'react-icons/fi';

const TryOnModal = ({ product, onClose }) => {
  const [userImage, setUserImage] = useState(null);
  const [userImagePreview, setUserImagePreview] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFullScreen, setShowFullScreen] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserImage(file);
      setUserImagePreview(URL.createObjectURL(file));
      setResultImage(null);
      setError(null);
    }
  };

  const handleGenerate = async () => {
    if (!userImage) {
      toast.error('Please upload your photo first.');
      return;
    }

    setLoading(true);
    setResultImage(null);
    setError(null);

    const formData = new FormData();
    formData.append('userImage', userImage);
    formData.append('productImageUrl', product.images[0].url);

    try {
      const response = await axios.post('/api/try-on', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setResultImage(response.data.resultUrl);
      toast.success('Here is your virtual try-on!');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to generate try-on image.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-dark-card rounded-lg w-full max-w-4xl p-6 border border-dark-border max-h-[90vh] overflow-y-auto relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-dark-surface z-10"
          >
            <FiX size={24} />
          </button>
          <h2 className="text-2xl font-bold mb-4 text-center">Virtual Try-On</h2>
          <p className="text-center text-dark-muted mb-6">
            Upload a photo of yourself to see how this item looks on you.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Left: User Image Upload */}
            <div className="flex flex-col items-center space-y-4 p-4 border border-dashed border-dark-border rounded-lg">
              <h3 className="font-semibold">Your Photo</h3>
              <div className="w-full h-64 bg-dark-surface rounded-lg flex items-center justify-center overflow-hidden">
                {userImagePreview ? (
                  <img src={userImagePreview} alt="Your preview" className="w-full h-full object-contain" />
                ) : (
                  <FiImage size={48} className="text-dark-muted" />
                )}
              </div>
              <label className="w-full cursor-pointer flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                <FiUpload />
                <span>Upload Photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
              <p className="text-xs text-dark-muted text-center">For best results, use a clear, full-body photo.</p>
            </div>

            {/* Middle: Product Image */}
            <div className="flex flex-col items-center space-y-4 p-4 border border-dashed border-dark-border rounded-lg">
              <h3 className="font-semibold">Product</h3>
              <div className="w-full h-64 bg-dark-surface rounded-lg flex items-center justify-center overflow-hidden">
                <img src={product.images[0].url} alt={product.name} className="w-full h-full object-contain" />
              </div>
              <p className="text-center font-bold">{product.name}</p>
            </div>

            {/* Right: Result */}
            <div className="flex flex-col items-center space-y-4 p-4 border border-dashed border-dark-border rounded-lg">
              <h3 className="font-semibold">Result</h3>
              <div className="w-full h-64 bg-dark-surface rounded-lg flex items-center justify-center overflow-hidden relative group">
                {loading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                    <FiLoader className="animate-spin text-white" size={48} />
                    <p className="text-white mt-2">Generating...</p>
                  </div>
                )}
                {resultImage && !loading && (
                  <>
                    <img src={resultImage} alt="Try-on result" className="w-full h-full object-contain" />
                    <button
                      onClick={() => setShowFullScreen(true)}
                      className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiMaximize />
                    </button>
                  </>
                )}
                {!resultImage && !loading && (
                  <FiImage size={48} className="text-dark-muted" />
                )}
                {error && !loading && (
                  <div className="absolute inset-0 flex items-center justify-center text-center p-4">
                    <p className="text-red-500">{error}</p>
                  </div>
                )}
              </div>
              <button
                onClick={handleGenerate}
                disabled={loading || !userImage}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Generate Look</span>
                <FiArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showFullScreen && resultImage && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4">
          <img src={resultImage} alt="Try-on result full screen" className="max-w-full max-h-full object-contain" />
          <button
            onClick={() => setShowFullScreen(false)}
            className="absolute top-4 right-4 p-2 rounded-full text-white bg-white/10 hover:bg-white/20"
          >
            <FiX size={32} />
          </button>
        </div>
      )}
    </>
  );
};

export default TryOnModal;
