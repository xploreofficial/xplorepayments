const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");

const app = express();
app.use(express.json());

const razorpay = new Razorpay({
  key_id: "rzp_live_eERWggjUw8BS2k", // ✅ Your Live Razorpay Key
  key_secret: "YOUR_SECRET_KEY"      // 🔒 Replace with your actual key secret
});

const RAZORPAY_WEBHOOK_SECRET = "xplore9391"; // 🔒 Match with Razorpay dashboard webhook secret

// ✅ Route to create Razorpay order (with auto capture)
app.post("/create-order", async (req, res) => {
  const { amount } = req.body;

  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // amount in paise
      currency: "INR",
      receipt: "order_rcptid_" + Date.now(),
      payment_capture: 1
    });

    res.json(order);
  } catch (err) {
    console.error("❌ Failed to create order:", err);
    res.status(500).json({ error: "Order creation failed" });
  }
});

// ✅ Razorpay Webhook endpoint
app.post("/webhook", (req, res) => {
  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");

  const signatureFromHeader = req.headers["x-razorpay-signature"];

  if (expectedSignature === signatureFromHeader) {
    const paymentId = req.body.payload?.payment?.entity?.id;
    console.log("✅ Webhook Verified. Payment Captured:", paymentId);

    // 🔒 Store payment info / update database here if needed

    res.status(200).json({ status: "Webhook received" });
  } else {
    console.log("❌ Webhook signature mismatch");
    res.status(403).json({ status: "Invalid signature" });
  }
});

// ✅ Optional: Health check
app.get("/", (req, res) => {
  res.send("🚀 Razorpay Backend is Live");
});

app.listen(3000, () => {
  console.log("✅ Server running on port 3000");
});


app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));
