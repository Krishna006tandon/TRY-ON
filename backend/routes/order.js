import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { authenticate } from '../middleware/auth.js';
import { sendOrderConfirmation } from '../utils/email.js';
import { body, validationResult } from 'express-validator';
import Coupon from '../models/Coupon.js';

const router = express.Router();

// Get user orders (or all orders for admin)
router.get('/', authenticate, async (req, res) => {
  try {
    let query = {};
    
    // If user is not admin, only show their orders
    if (req.user?.role !== 'admin') {
      query.user = req.user?._id;
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'name images price')
      .sort('-createdAt');

    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single order
router.get('/:id', authenticate, async (req, res) => {
  try {
    let query = { _id: req.params.id };
    
    // If user is not admin, only show their orders
    if (req.user?.role !== 'admin') {
      query.user = req.user?._id;
    }

    const order = await Order.findOne(query)
      .populate('items.product')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create order
router.post('/', authenticate, [
  body('items').isArray({ min: 1 }).withMessage('Items are required'),
  body('shippingAddress').notEmpty().withMessage('Shipping address is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, shippingAddress, paymentMethod, rewardPointsUsed, couponCode } = req.body;

    // Validate products and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return res.status(400).json({ message: `Product ${item.product} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });

      // Update stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Calculate coupon discount if provided
    let couponDiscount = 0;
    let appliedCoupon = null;
    
    if (couponCode) {
      try {
        const coupon = await Coupon.findOne({ 
          code: couponCode.toUpperCase(),
          isActive: true
        });

        if (coupon) {
          const now = new Date();
          if (now >= coupon.validFrom && now <= coupon.validUntil) {
            if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {
              if (totalAmount >= coupon.minPurchase) {
                // Check if coupon applies to items
                const itemCategories = orderItems.map(item => item.category || item.product?.category || item.product);
                const itemProductIds = orderItems.map(item => {
                  const productId = item.product?._id || item.product;
                  // If productId is already an ObjectId, use it; otherwise try to find the product
                  return productId;
                });
                
                let applicable = true;
                if (coupon.applicableCategories.length > 0 || coupon.applicableProducts.length > 0) {
                  const categoryMatch = coupon.applicableCategories.some(catId => 
                    itemCategories.some(itemCat => 
                      itemCat?.toString() === catId.toString()
                    )
                  );
                  
                  const productMatch = coupon.applicableProducts.some(prodId =>
                    itemProductIds.some(itemProd =>
                      itemProd?.toString() === prodId.toString()
                    )
                  );

                  applicable = categoryMatch || productMatch || 
                    (coupon.applicableCategories.length === 0 && coupon.applicableProducts.length === 0);
                }

                if (applicable) {
                  if (coupon.discountType === 'percentage') {
                    couponDiscount = (totalAmount * coupon.discountValue) / 100;
                    if (coupon.maxDiscount) {
                      couponDiscount = Math.min(couponDiscount, coupon.maxDiscount);
                    }
                  } else {
                    couponDiscount = coupon.discountValue;
                  }
                  couponDiscount = Math.min(couponDiscount, totalAmount);
                  appliedCoupon = coupon;
                }
              }
            }
          }
        }
      } catch (couponError) {
        console.error('Coupon validation error:', couponError);
        // Continue without coupon if validation fails
      }
    }

    const discount = couponDiscount;
    const shippingCost = 0; // Can be calculated based on address
    const rewardPointsDiscount = (rewardPointsUsed || 0) * 0.01; // 1 point = $0.01
    const finalAmount = Math.max(0, totalAmount - discount - rewardPointsDiscount + shippingCost);

    // Calculate reward points earned (e.g., 1% of order value)
    const rewardPointsEarned = Math.floor(finalAmount * 0.01);

    const order = new Order({
      user: req.user?._id,
      items: orderItems,
      totalAmount,
      discount,
      shippingCost,
      finalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: (paymentMethod || 'cod') === 'cod' ? 'pending' : 'pending',
      rewardPointsUsed: rewardPointsUsed || 0,
      rewardPointsEarned,
      couponCode: appliedCoupon?.code || null,
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      trackingHistory: [{
        status: 'pending',
        location: 'Warehouse',
        description: 'Order placed and pending confirmation',
        timestamp: new Date()
      }]
    });

    await order.save();

    // Update coupon usage count
    if (appliedCoupon) {
      appliedCoupon.usedCount += 1;
      await appliedCoupon.save();
    }

    // Update user reward points
    if (req.user) {
      if (rewardPointsUsed) {
        req.user.rewardPoints = (req.user.rewardPoints || 0) - rewardPointsUsed;
      }
      req.user.rewardPoints = (req.user.rewardPoints || 0) + rewardPointsEarned;
      await req.user.save();
    }

    // Create notification
    if (req.user?._id) {
      await Notification.create({
        user: req.user._id,
        title: 'Order Placed',
        message: `Your order #${order._id} has been placed successfully.`,
        type: 'order',
        link: `/orders/${order._id}`,
        metadata: { orderId: order._id }
      });
    }

    // Send email confirmation
    if (req.user?.email) {
      try {
        await sendOrderConfirmation(req.user.email, order);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }
    }

    // Emit socket event
    const io = req.app.get('io');
    if (io && req.user?._id) {
      io.to(`user-${req.user._id}`).emit('order-placed', { order });
    }

    res.status(201).json({ order, message: 'Order placed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status (Admin or user for cancellation)
router.put('/:id/status', authenticate, [
  body('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'])
], async (req, res) => {
  try {
    const { status, trackingNumber, location, description } = req.body;
    
    let query = { _id: req.params.id };
    // If user is not admin, only allow access to their orders
    if (req.user?.role !== 'admin') {
      query.user = req.user?._id;
    }
    
    const order = await Order.findOne(query)
      .populate('user');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Users can only cancel pending orders
    if (req.user?.role !== 'admin' && status !== 'cancelled') {
      return res.status(403).json({ message: 'Only admins can update order status' });
    }

    if (req.user?.role !== 'admin' && order.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot cancel order in current status' });
    }

    // Update order status
    const oldStatus = order.status;
    order.status = status;
    
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (location) order.currentLocation = location;
    
    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }

    // Add to tracking history
    if (!order.trackingHistory) {
      order.trackingHistory = [];
    }
    
    order.trackingHistory.push({
      status,
      location: location || order.currentLocation || 'Warehouse',
      description: description || getStatusDescription(status),
      timestamp: new Date()
    });

    await order.save();

    // Create notification
    await Notification.create({
      user: order.user._id || order.user,
      title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: getStatusMessage(status, order._id, location),
      type: 'order',
      link: `/orders/${order._id}`,
      metadata: { orderId: order._id, status, location }
    });

    // Emit socket event
    const io = req.app.get('io');
    if (io && order.user) {
      const userId = order.user._id || order.user;
      io.to(`user-${userId}`).emit('order-updated', { order });
    }

    res.json({ order, message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Order status update error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Helper functions
function getStatusDescription(status) {
  const descriptions = {
    'pending': 'Order is pending confirmation',
    'confirmed': 'Order has been confirmed',
    'processing': 'Order is being processed',
    'shipped': 'Order has been shipped',
    'out_for_delivery': 'Order is out for delivery',
    'delivered': 'Order has been delivered',
    'cancelled': 'Order has been cancelled'
  };
  return descriptions[status] || 'Order status updated';
}

function getStatusMessage(status, orderId, location) {
  const messages = {
    'pending': `Your order #${orderId} is pending confirmation.`,
    'confirmed': `Your order #${orderId} has been confirmed.`,
    'processing': `Your order #${orderId} is being processed.`,
    'shipped': `Your order #${orderId} has been shipped.${location ? ` Current location: ${location}` : ''}`,
    'out_for_delivery': `Your order #${orderId} is out for delivery.${location ? ` Current location: ${location}` : ''}`,
    'delivered': `Your order #${orderId} has been delivered successfully!`,
    'cancelled': `Your order #${orderId} has been cancelled.`
  };
  return messages[status] || `Your order #${orderId} status has been updated.`;
}

export default router;

