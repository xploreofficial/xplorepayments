const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const RAZORPAY_KEY_ID = "rzp_live_eERWggjUw8BS2k";
const RAZORPAY_SECRET = "xplore9391";

// ✅ Razorpay instance
const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_SECRET,
});

// 🧾 Create Razorpay order
app.post("/create-order", async (req, res) => {
  const { amount, items } = req.body;
  const options = {
    amount: amount * 100, // amount in paise
    currency: "INR",
    payment_capture: 1,
    notes: { files: JSON.stringify(items) }
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json({ id: order.id, currency: order.currency, amount: order.amount });
  } catch (err) {
    res.status(500).json({ error: "Error creating order" });
  }
});

// ✅ Webhook endpoint for payment verification
app.post("/webhook", (req, res) => {
  const secret = RAZORPAY_SECRET;
  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  if (digest === req.headers["x-razorpay-signature"]) {
    const payment = req.body.payload.payment.entity;
    console.log("✅ Payment verified:", payment.id);
  } else {
    console.log("❌ Invalid signature");
  }

  res.status(200).json({ status: "ok" });
});

// 🗂️ Route to return files after payment (mocked for now)
app.get("/get-files", (req, res) => {
  const { order_id } = req.query;
  // Replace with real file lookup
  res.json({
    files: [
      { name: "example1.zip", url: "/downloads/example1.zip" },
      { name: "example2.psd", url: "/downloads/example2.psd" },
    ]
  });
});

app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));
