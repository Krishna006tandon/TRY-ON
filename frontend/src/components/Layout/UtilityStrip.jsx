import { FiTruck, FiShield, FiRefreshCw, FiHeadphones } from 'react-icons/fi';

const UtilityStrip = () => {
  const utilities = [
    { icon: FiTruck, text: 'Free Shipping' },
    { icon: FiShield, text: 'Secure Payment' },
    { icon: FiRefreshCw, text: 'Easy Returns' },
    { icon: FiHeadphones, text: '24/7 Support' }
  ];

  return (
    <div className="bg-dark-card border-b border-dark-border py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-dark-muted">
          {utilities.map((utility, index) => (
            <div key={index} className="flex items-center space-x-2">
              <utility.icon size={16} />
              <span>{utility.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UtilityStrip;

