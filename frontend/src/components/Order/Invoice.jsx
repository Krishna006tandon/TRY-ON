import { motion } from 'framer-motion';
import { FiDownload, FiPrinter, FiX } from 'react-icons/fi';

const Invoice = ({ order, onClose }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-dark-card rounded-lg shadow-xl w-full max-w-4xl my-8 border border-dark-border"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-dark-border">
          <h2 className="text-2xl font-bold">Invoice</h2>
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="p-2 hover:bg-dark-surface rounded-lg transition-colors"
              title="Print"
            >
              <FiPrinter size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-dark-surface rounded-lg transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-6 space-y-6">
          {/* Company & Order Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-bold mb-2">TRY-ON</h3>
              <p className="text-dark-muted">E-Commerce Platform</p>
              <p className="text-dark-muted">Email: support@tryon.com</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-dark-muted">Invoice #</p>
              <p className="text-lg font-semibold mb-2">{order._id.slice(-8).toUpperCase()}</p>
              <p className="text-sm text-dark-muted">Date</p>
              <p className="font-semibold">{formatDate(order.createdAt)}</p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid md:grid-cols-2 gap-6 border-t border-dark-border pt-6">
            <div>
              <h4 className="font-semibold mb-2">Bill To:</h4>
              <p className="text-dark-muted">{order.user?.name || 'Customer'}</p>
              <p className="text-dark-muted">{order.user?.email || ''}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Ship To:</h4>
              <p className="text-dark-muted">
                {order.shippingAddress?.street || ''}
              </p>
              <p className="text-dark-muted">
                {order.shippingAddress?.city}, {order.shippingAddress?.state}
              </p>
              <p className="text-dark-muted">
                {order.shippingAddress?.zipCode}, {order.shippingAddress?.country}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="border-t border-dark-border pt-6">
            <h4 className="font-semibold mb-4">Order Items:</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-surface">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Item</th>
                    <th className="px-4 py-3 text-center text-sm font-medium">Quantity</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Price</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {order.items?.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3">
                        <p className="font-semibold">{item.product?.name || 'Product'}</p>
                        {item.product?.category?.name && (
                          <p className="text-sm text-dark-muted">{item.product.category.name}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">${item.price?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-semibold">
                        ${((item.price || 0) * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t border-dark-border pt-6">
            <div className="max-w-md ml-auto space-y-2">
              <div className="flex justify-between">
                <span className="text-dark-muted">Subtotal:</span>
                <span>${order.totalAmount?.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-500">
                  <span>Discount:</span>
                  <span>-${order.discount?.toFixed(2)}</span>
                </div>
              )}
              {order.couponCode && (
                <div className="flex justify-between text-sm text-dark-muted">
                  <span>Coupon ({order.couponCode}):</span>
                  <span>Applied</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-dark-muted">Shipping:</span>
                <span>${order.shippingCost?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="border-t border-dark-border pt-2 flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${order.finalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="border-t border-dark-border pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Payment Method:</h4>
                <p className="text-dark-muted capitalize">{order.paymentMethod || 'COD'}</p>
                <p className="text-sm text-dark-muted mt-1">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Order Status:</h4>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  order.status === 'delivered' ? 'bg-green-500/20 text-green-500' :
                  order.status === 'shipped' || order.status === 'out_for_delivery' ? 'bg-blue-500/20 text-blue-500' :
                  order.status === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                  'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {order.status?.charAt(0).toUpperCase() + order.status?.slice(1).replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-dark-border pt-6 text-center text-sm text-dark-muted">
            <p>Thank you for your purchase!</p>
            <p className="mt-2">For any queries, contact us at support@tryon.com</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Invoice;

