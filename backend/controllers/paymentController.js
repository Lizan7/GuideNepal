const axios = require("axios");
require("dotenv").config();

// ✅ Set API Key and URLs
const KHALTI_SECRET_KEY = "397fe66107f54a2d89a57e930ae4ae5f"; // Replace with your Khalti API Key
const KHALTI_BASE_URL = "https://khalti.com/api/v2"; // ✅ Production
const KHALTI_SANDBOX_URL = "https://dev.khalti.com/api/v2"; // ✅ Sandbox

// ✅ 1️⃣ Initiate Khalti Payment
const initiateKhaltiPayment = async (req, res) => {
  try {
    const { amount, orderId, orderName, customerInfo } = req.body;

    if (!amount || !orderId || !orderName) {
      return res.status(400).json({ error: "Required fields are missing!" });
    }

    let BASE_URL = process.env.BASE_URL; 
    BASE_URL = BASE_URL.replace(/\/$/, "");

    const paymentData = {
      return_url: `${BASE_URL}/khalti/verify-payment`, 
      website_url: BASE_URL, // ✅ Ensure valid URL
      amount, 
      purchase_order_id: orderId,
      purchase_order_name: orderName,
      customer_info: customerInfo || {},
    };
    console.log(paymentData);

    const response = await axios.post(
      `${KHALTI_SANDBOX_URL}/epayment/initiate/`, 
      paymentData,
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`, // ✅ Use API Key
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Payment Initiated Successfully",
      payment_url: response.data.payment_url,
      pidx: response.data.pidx,
    });
  } catch (error) {
    console.error("❌ Error initiating Khalti payment:", error.response?.data);
    res.status(500).json({ error: "Failed to initiate Khalti payment", details: error.response?.data });
  }
};

// // ✅ 2️⃣ Verify Khalti Payment (Lookup API) - POST
// const verifyKhaltiPayment = async (req, res) => {
//   try {
//     const { pidx } = req.body;

//     if (!pidx) {
//       return res.status(400).json({ error: "pidx is required!" });
//     }

//     const response = await axios.post(
//       `${KHALTI_SANDBOX_URL}/epayment/lookup/`, // ✅ Change to `${KHALTI_BASE_URL}` for Production
//       { pidx },
//       {
//         headers: {
//           Authorization: `Key ${KHALTI_SECRET_KEY}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     if (response.data.status === "Completed") {
//       return res.json({ success: true, message: "Payment verified successfully", transaction: response.data });
//     } else {
//       return res.json({ success: false, message: "Payment not completed yet", transaction: response.data });
//     }
//   } catch (error) {
//     console.error("❌ Payment Verification Error:", error.response?.data);
//     res.status(500).json({ error: "Failed to verify payment status", details: error.response?.data });
//   }
// };


// ✅ Improved Verify Payment Response
const verifyKhaltiPayment = async (req, res) => {
  try {
    const { pidx } = req.body;

    if (!pidx) {
      return res.status(400).json({ error: "pidx is required!" });
    }

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

    if (response.data.status === "Completed") {
      const transactionDetails = {
        transaction_id: response.data.transaction_id,
        pidx: response.data.pidx,
        status: response.data.status,
        amount: response.data.total_amount / 100, // Convert from paisa to rupees
        fee: response.data.fee / 100,
        order_id: response.data.purchase_order_id,
        order_name: response.data.purchase_order_name,
        customer_info: response.data.customer_info,
        paid_at: response.data.created_on,
      };

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        transaction: transactionDetails,
      });
    } else {
      return res.json({
        success: false,
        message: "Payment not completed yet",
        transaction: response.data,
      });
    }
  } catch (error) {
    console.error("❌ Payment Verification Error:", error.response?.data);
    res.status(500).json({
      error: "Failed to verify payment status",
      details: error.response?.data,
    });
  }
};


// ✅ 3️⃣ GET Callback Handler for Khalti Payment
const getKhaltiPaymentCallback = async (req, res) => {
  try {
    // Extract query parameters sent by Khalti in the callback URL
    const { pidx, status, transaction_id, total_amount, purchase_order_id, purchase_order_name } = req.query;
    console.log("Khalti callback received:", req.query);

    // Optionally, you can perform a lookup API call here to double-check the transaction status.
    // For now, we send a simple response back to the browser.
    if (status === "Completed") {
      res.send("Payment completed successfully. You may now close this window.");
    } else {
      res.send("Payment not completed or was canceled. Please try again.");
    }
  } catch (error) {
    console.error("Error in GET /verify-payment:", error);
    res.status(500).send("Error verifying payment.");
  }
};

module.exports = { 
  initiateKhaltiPayment, 
  verifyKhaltiPayment, 
  getKhaltiPaymentCallback 
};
