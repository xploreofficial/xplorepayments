const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const cors = require("cors");
app.use(cors());

const app = express();

// Required to properly parse headers for Razorpay webhook
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

const razorpay = new Razorpay({
  key_id: "rzp_live_0t2JKu7ZEc9Nte",
  key_secret: "UakvLwrGKP3hjmDvYnTlgLox"
});

const RAZORPAY_WEBHOOK_SECRET = "leelan123";

// ✅ Create Order Route
app.post("/create-order", async (req, res) => {
  const { amount } = req.body;
  console.log("📦 Order request received for amount:", amount);

  try {
    const order = await razorpay.orders.create({
      amount: amount, // Already in paisa from frontend
      currency: "INR",
      receipt: "order_rcptid_" + Date.now(),
      payment_capture: 1
    });

    console.log("✅ Order created:", order.id);
    res.json(order);
  } catch (err) {
    console.error("❌ Order creation failed:", err);
    res.status(500).json({ error: "Order creation failed" });
  }
});

// ✅ Webhook Verification Route
app.post("/webhook", (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
    .update(req.rawBody)
    .digest("hex");

  if (signature === expectedSignature) {
    const event = req.body.event;
    const paymentId = req.body.payload?.payment?.entity?.id;
    console.log(`✅ Webhook Received: ${event}, Payment ID: ${paymentId}`);
    res.status(200).json({ status: "Webhook received" });
  } else {
    console.log("❌ Invalid Webhook Signature");
    res.status(403).json({ status: "Invalid signature" });
  }
});

// ✅ Health check
app.get("/", (req, res) => {
  res.send("✅ Razorpay backend is live");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
