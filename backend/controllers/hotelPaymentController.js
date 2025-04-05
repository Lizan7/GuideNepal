const axios = require("axios");
require("dotenv").config();

// ✅ Set API Key and URLs
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY; // Use the key from .env
const KHALTI_BASE_URL = "https://khalti.com/api/v2"; // ✅ Production
const KHALTI_SANDBOX_URL = "https://dev.khalti.com/api/v2"; // ✅ Sandbox

// Initiate Khalti Payment for Hotel Booking
const initiateHotelPayment = async (req, res) => {
  try {
    console.log("🔹 Hotel Payment Request Body:", req.body);
    
    const { amount, orderId, orderName, customerInfo } = req.body;
    
    if (!amount || !orderId || !orderName) {
      return res.status(400).json({ error: "Amount, order ID, and order name are required." });
    }
    
    // Convert amount to paisa (Khalti expects amount in paisa)
    const amountInPaisa = Math.round(amount);
    
    console.log("🔹 Initiating Khalti payment for hotel booking:", {
      amount: amountInPaisa,
      orderId,
      orderName
    });
    
    let BASE_URL = process.env.BASE_URL; 
    BASE_URL = BASE_URL.replace(/\/$/, "");
    
    // Make request to Khalti API
    const response = await axios.post(
      `${KHALTI_SANDBOX_URL}/epayment/initiate/`,
      {
        return_url: `${BASE_URL}/hotel-booking-success`,
        website_url: BASE_URL,
        amount: amountInPaisa,
        purchase_order_id: orderId,
        purchase_order_name: orderName,
        customer_info: customerInfo || {},
      },
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    console.log("🔹 Khalti payment response:", response.data);
    
    if (response.data && response.data.payment_url) {
      return res.status(200).json({
        success: true,
        payment_url: response.data.payment_url,
        pidx: response.data.pidx,
      });
    } else {
      console.error("❌ Khalti payment initiation failed:", response.data);
      return res.status(400).json({ error: "Failed to initiate payment." });
    }
  } catch (error) {
    console.error("❌ Hotel Payment Error Details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    return res.status(500).json({ 
      error: "Payment initiation failed.",
      details: error.response?.data || error.message
    });
  }
};

// Verify Khalti Payment for Hotel Booking
const verifyHotelPayment = async (req, res) => {
  try {
    console.log("🔹 Hotel Payment Verification Request:", req.body);
    
    const { pidx } = req.body;
    
    if (!pidx) {
      return res.status(400).json({ error: "Payment ID (pidx) is required." });
    }
    
    console.log("🔹 Verifying Khalti payment for hotel booking with pidx:", pidx);
    
    // Make request to Khalti API to verify payment
    const response = await axios.post(
      `${KHALTI_SANDBOX_URL}/epayment/lookup/`,
      { pidx },
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    console.log("🔹 Khalti payment verification response:", response.data);
    
    if (response.data && response.data.idx) {
      return res.status(200).json({
        success: true,
        verified: true,
        paymentDetails: response.data,
      });
    } else {
      console.error("❌ Khalti payment verification failed:", response.data);
      return res.status(400).json({ error: "Payment verification failed." });
    }
  } catch (error) {
    console.error("❌ Hotel Payment Verification Error:", error.response?.data || error.message);
    return res.status(500).json({ error: "Payment verification failed." });
  }
};

module.exports = { initiateHotelPayment, verifyHotelPayment }; 