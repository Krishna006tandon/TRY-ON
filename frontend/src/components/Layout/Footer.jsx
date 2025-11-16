import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-dark-surface border-t border-dark-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">TRY-ON</h3>
            <p className="text-dark-muted text-sm">
              Your one-stop destination for the latest fashion trends and styles.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-dark-muted hover:text-white transition-colors">
                <FiFacebook size={20} />
              </a>
              <a href="#" className="text-dark-muted hover:text-white transition-colors">
                <FiTwitter size={20} />
              </a>
              <a href="#" className="text-dark-muted hover:text-white transition-colors">
                <FiInstagram size={20} />
              </a>
              <a href="#" className="text-dark-muted hover:text-white transition-colors">
                <FiLinkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products" className="text-dark-muted hover:text-white transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-dark-muted hover:text-white transition-colors">
                  Orders
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-dark-muted hover:text-white transition-colors">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-dark-muted hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-dark-muted hover:text-white transition-colors">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="text-dark-muted hover:text-white transition-colors">
                  Returns
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-dark-muted">
              <li>Email: support@tryon.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Address: 123 Fashion St, City</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-border mt-8 pt-8 text-center text-sm text-dark-muted">
          <p>&copy; 2025 TRY-ON. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

