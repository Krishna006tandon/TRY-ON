import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="relative mt-32 border-t border-white/10">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 glass">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-2xl font-bold mb-4 gradient-text">TRY-ON</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Your one-stop destination for the latest fashion trends and styles.
            </p>
            {/* <div className="flex space-x-3">
              <motion.a
                href="#"
                whileHover={{ scale: 1.2, y: -3 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 glass rounded-full text-gray-400 hover:text-blue-400 transition-colors"
              >
                <FiFacebook size={18} />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.2, y: -3 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 glass rounded-full text-gray-400 hover:text-blue-400 transition-colors"
              >
                <FiTwitter size={18} />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.2, y: -3 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 glass rounded-full text-gray-400 hover:text-pink-400 transition-colors"
              >
                <FiInstagram size={18} />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.2, y: -3 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 glass rounded-full text-gray-400 hover:text-blue-500 transition-colors"
              >
                <FiLinkedin size={18} />
              </motion.a>
            </div> */}
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/products" className="text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-purple-400 transition-all duration-300"></span>
                  Products
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-purple-400 transition-all duration-300"></span>
                  Orders
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-purple-400 transition-all duration-300"></span>
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Support</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-purple-400 transition-all duration-300"></span>
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-purple-400 transition-all duration-300"></span>
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-2 group">
                  <span className="w-0 group-hover:w-2 h-0.5 bg-purple-400 transition-all duration-300"></span>
                  Returns
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Contact</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="hover:text-purple-400 transition-colors">Email: nexbyte.dev@gmail.com</li>
              <li className="hover:text-purple-400 transition-colors">Phone: +91 9130866751</li>
              <li className="hover:text-purple-400 transition-colors">Address: Nagpur(440025), Maharashtra, India</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            &copy; 2025 <span className="gradient-text font-bold">TRY-ON</span>. All rights reserved. @nexbyte
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

