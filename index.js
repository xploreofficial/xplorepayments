const express = require("express");
const crypto = require("crypto");

const app = express();
app.use(express.json());

const RAZORPAY_SECRET = "xplore9391"; // 🔒 Match this with Razorpay dashboard webhook secret

// ✅ Webhook endpoint
app.post("/webhook", (req, res) => {
  const secret = RAZORPAY_SECRET;

  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  if (digest === req.headers["x-razorpay-signature"]) {
    const paymentId = req.body.payload?.payment?.entity?.id;
    console.log("✅ Payment Captured:", paymentId);

    // ✅ You can add logic to store paymentId, product info etc. here

    res.status(200).json({ status: "ok" });
  } else {
    console.log("❌ Invalid Signature");
    res.status(403).json({ status: "invalid signature" });
  }
});

// ✅ Root route (optional for testing)
app.get("/", (req, res) => {
  res.send("Webhook is running");
});

// ✅ Start server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
