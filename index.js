const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");

const app = express();
app.use(express.json());

const razorpay = new Razorpay({
  key_id: "rzp_live_0t2JKu7ZEc9Nte", // Your live Key ID
  key_secret: "YOUR_SECRET_KEY"     // Replace with your live Key Secret
});

const RAZORPAY_WEBHOOK_SECRET = "leelan123";

// ✅ Route to create an order
app.post("/create-order", async (req, res) => {
  const { amount } = req.body;

  try {
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "order_rcptid_" + Date.now(),
      payment_capture: 1
    });

    res.json(order);
  } catch (err) {
    console.error("Order creation failed:", err);
    res.status(500).json({ error: "Order creation failed" });
  }
});

// ✅ Webhook route
app.post("/webhook", (req, res) => {
  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (expectedSignature === req.headers["x-razorpay-signature"]) {
    const paymentId = req.body.payload?.payment?.entity?.id;
    console.log("✅ Webhook verified. Payment ID:", paymentId);
    res.status(200).json({ status: "Webhook received" });
  } else {
    console.log("❌ Invalid webhook signature");
    res.status(403).json({ status: "Invalid signature" });
  }
});

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("✅ Razorpay backend is live");
});

// ✅ Start server only once
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

