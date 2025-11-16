import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  finalAmount: {
    type: Number,
    required: true
  },
  shippingAddress: {
    type: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home'
    },
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'card', 'cash', 'upi', 'wallet'],
    default: 'cod'
  },
  trackingNumber: {
    type: String
  },
  trackingHistory: [{
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled']
    },
    location: String,
    description: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  currentLocation: {
    type: String
  },
  estimatedDelivery: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  invoice: {
    url: String,
    number: String
  },
  rewardPointsEarned: {
    type: Number,
    default: 0
  },
  rewardPointsUsed: {
    type: Number,
    default: 0
  },
  couponCode: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model('Order', orderSchema);

