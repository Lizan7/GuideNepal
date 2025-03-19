const express = require("express");
const { 
  initiateKhaltiPayment, 
  verifyKhaltiPayment, 
  getKhaltiPaymentCallback // new GET handler
} = require("../controllers/paymentController");

const router = express.Router();

// Route to initiate payment (POST)
router.post("/initiate-payment", initiateKhaltiPayment);

// Route to verify payment using POST (for manual lookup)
router.post("/verify-payment", verifyKhaltiPayment);

// New GET route to handle Khalti's callback
router.get("/verify-payment", getKhaltiPaymentCallback);

module.exports = router;
