import nodemailer from 'nodemailer';

// Only create transporter if email is configured
// Use a function to initialize lazily after env vars are loaded
let transporter = null;
let transporterInitialized = false;

async function initializeEmailTransporter() {
  if (transporterInitialized) return transporter; // Already initialized
  
  transporterInitialized = true;
  
  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      // Configure transporter with TLS settings
      const transporterConfig = {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      };

      // In development, allow self-signed certificates
      // In production, use secure defaults unless explicitly configured
      if (process.env.NODE_ENV === 'development' || process.env.EMAIL_INSECURE === 'true') {
        transporterConfig.tls = {
          rejectUnauthorized: false
        };
        console.log('⚠️ Email TLS: Using insecure mode (development only)');
      }

      transporter = nodemailer.createTransport(transporterConfig);
      
      // Verify connection (non-blocking, don't fail if verify fails)
      try {
        await transporter.verify();
        console.log('✅ Email transporter initialized and verified');
      } catch (verifyError) {
        console.warn('⚠️ Email verification failed, but transporter created:', verifyError.message);
        console.log('✅ Email transporter initialized (unverified)');
      }
    } else {
      console.warn('⚠️ Email configuration missing. Email features will be disabled.');
      console.log('   EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Missing');
      console.log('   EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Missing');
      transporter = false; // Mark as checked but not available
    }
  } catch (error) {
    console.error('❌ Failed to initialize email transporter:', error.message);
    transporter = false;
  }
  
  return transporter;
}

// Don't initialize at module load - wait until first use
// This ensures dotenv.config() has run first

export const sendOTPEmail = async (email, otp) => {
  // Initialize if not already done
  const emailTransporter = await initializeEmailTransporter();
  
  // Early return if transporter is not available
  if (!emailTransporter || emailTransporter === false) {
    // In development, log the OTP instead of failing
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] 📧 Email not configured. OTP for ${email}: ${otp}`);
    } else {
      console.warn(`📧 Email not configured. OTP: ${otp}`);
    }
    return Promise.resolve(); // Don't fail if email is not configured
  }

  // Double check transporter exists before using
  if (!emailTransporter || typeof emailTransporter.sendMail !== 'function') {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] 📧 Email transporter not available. OTP for ${email}: ${otp}`);
    }
    return Promise.resolve();
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for TRY-ON Verification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Your OTP code is:</p>
        <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </div>
    `
  };

  try {
    return await emailTransporter.sendMail(mailOptions);
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    // In development, log the OTP instead of failing
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] 📧 Email failed. OTP for ${email}: ${otp}`);
    }
    // Don't throw error, just log it
    return Promise.resolve();
  }
};

export const sendOrderConfirmation = async (email, order) => {
  // Initialize if not already done
  const emailTransporter = await initializeEmailTransporter();
  
  // Check if email is configured
  if (!emailTransporter || emailTransporter === false) {
    console.warn('Email not configured. Order confirmation email not sent.');
    return Promise.resolve();
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Order Confirmation - #${order._id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Order Confirmed!</h2>
        <p>Thank you for your order. Your order #${order._id} has been confirmed.</p>
        <p><strong>Total Amount:</strong> $${order.finalAmount}</p>
        <p>We'll send you tracking information once your order ships.</p>
      </div>
    `
  };

  try {
    return await emailTransporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Order confirmation email error:', error);
    // Don't throw error, just log it
    return Promise.resolve();
  }
};

