import { motion } from 'framer-motion';
import { 
  FiPackage, 
  FiCheckCircle, 
  FiTruck, 
  FiMapPin, 
  FiClock,
  FiXCircle
} from 'react-icons/fi';

const TrackingTimeline = ({ order }) => {
  const statuses = [
    { key: 'pending', label: 'Order Placed', icon: FiPackage, color: 'yellow' },
    { key: 'confirmed', label: 'Confirmed', icon: FiCheckCircle, color: 'blue' },
    { key: 'processing', label: 'Processing', icon: FiPackage, color: 'blue' },
    { key: 'shipped', label: 'Shipped', icon: FiTruck, color: 'blue' },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: FiTruck, color: 'purple' },
    { key: 'delivered', label: 'Delivered', icon: FiCheckCircle, color: 'green' },
    { key: 'cancelled', label: 'Cancelled', icon: FiXCircle, color: 'red' }
  ];

  const getStatusIndex = (status) => {
    return statuses.findIndex(s => s.key === status);
  };

  const currentStatusIndex = getStatusIndex(order.status);
  const trackingHistory = order.trackingHistory || [];

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-dark-card rounded-lg border border-dark-border p-6">
      <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
        <FiTruck />
        <span>Order Tracking</span>
      </h3>

      {/* Tracking Number */}
      {order.trackingNumber && (
        <div className="mb-6 p-4 bg-dark-surface rounded-lg">
          <p className="text-sm text-dark-muted mb-1">Tracking Number</p>
          <p className="text-lg font-mono font-semibold">{order.trackingNumber}</p>
        </div>
      )}

      {/* Current Location */}
      {order.currentLocation && (
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <FiMapPin className="text-blue-500" />
            <div>
              <p className="text-sm text-dark-muted mb-1">Current Location</p>
              <p className="font-semibold">{order.currentLocation}</p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {statuses.map((status, index) => {
          const isActive = index <= currentStatusIndex;
          const isCurrent = index === currentStatusIndex;
          const statusHistory = trackingHistory.find(h => h.status === status.key);
          
          const colorClasses = {
            yellow: 'bg-yellow-500 text-yellow-500 border-yellow-500',
            blue: 'bg-blue-500 text-blue-500 border-blue-500',
            purple: 'bg-purple-500 text-purple-500 border-purple-500',
            green: 'bg-green-500 text-green-500 border-green-500',
            red: 'bg-red-500 text-red-500 border-red-500'
          };

          return (
            <div key={status.key} className="relative pb-8 last:pb-0">
              {/* Timeline Line */}
              {index < statuses.length - 1 && (
                <div className={`absolute left-6 top-12 w-0.5 h-full ${
                  isActive ? colorClasses[status.color].split(' ')[0] : 'bg-dark-border'
                }`} />
              )}

              {/* Status Item */}
              <div className="flex items-start space-x-4">
                <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                  isActive 
                    ? `${colorClasses[status.color].split(' ')[0]} ${colorClasses[status.color].split(' ')[2]}`
                    : 'bg-dark-surface border-dark-border'
                }`}>
                  <status.icon 
                    size={20} 
                    className={isActive ? 'text-white' : 'text-dark-muted'} 
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-semibold ${isActive ? 'text-white' : 'text-dark-muted'}`}>
                        {status.label}
                      </p>
                      {statusHistory && (
                        <div className="mt-1">
                          {statusHistory.location && (
                            <p className="text-sm text-dark-muted flex items-center space-x-1">
                              <FiMapPin size={12} />
                              <span>{statusHistory.location}</span>
                            </p>
                          )}
                          {statusHistory.description && (
                            <p className="text-sm text-dark-muted mt-1">
                              {statusHistory.description}
                            </p>
                          )}
                          {statusHistory.timestamp && (
                            <p className="text-xs text-dark-muted mt-1 flex items-center space-x-1">
                              <FiClock size={10} />
                              <span>{formatDate(statusHistory.timestamp)}</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    {isCurrent && (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-500 rounded text-xs font-semibold">
                        Current
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Estimated Delivery */}
      {order.estimatedDelivery && order.status !== 'delivered' && (
        <div className="mt-6 p-4 bg-dark-surface rounded-lg">
          <p className="text-sm text-dark-muted mb-1">Estimated Delivery</p>
          <p className="font-semibold">{formatDate(order.estimatedDelivery)}</p>
        </div>
      )}

      {/* Delivered Date */}
      {order.deliveredAt && (
        <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-sm text-dark-muted mb-1">Delivered On</p>
          <p className="font-semibold text-green-500">{formatDate(order.deliveredAt)}</p>
        </div>
      )}
    </div>
  );
};

export default TrackingTimeline;

