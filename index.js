const express = require("express");
const crypto = require("crypto");
const app = express();
app.use(express.json());

const RAZORPAY_SECRET = "xplore9391"; // Use this same secret in Razorpay dashboard

app.post("/webhook", (req, res) => {
  const secret = RAZORPAY_SECRET;
  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  if (digest === req.headers["x-razorpay-signature"]) {
    console.log("✅ Payment Captured:", req.body.payload.payment.entity.id);
    res.status(200).json({ status: "ok" });
  } else {
    console.log("❌ Invalid Signature");
    res.status(403).json({ status: "invalid signature" });
  }
});

app.get("/", (req, res) => {
  res.send("Webhook is running");
});

app.listen(3000, () => console.log("Server running on port 3000"));
