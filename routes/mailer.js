const express = require("express");
const router = express.Router();
const emailMailer = require("../helper/email");

router.post("/payment", async (req, res) => {
  console.log(req.body);

  try {
    await emailMailer.paymentSuccess({
      orderId: "oder-is",
      amount: "1500",
    });

    return res.status(200).json({
      msg: "success",
    });
  } catch (error) {
    console.log(error);
    return res.status(503).send(error);
  }
});

module.exports = router;
