const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const { hashSync, genSaltSync } = require("bcrypt");
const axios = require("axios");
const emailMailer = require("../helper/email");

router.post("/khalti", async (req, res) => {
  const { userData, payment, userType } = req.body;

  let emailExist = await prisma.user.count({
    where: {
      email: userData.email,
    },
  });

  if (emailExist > 0) {
    return res.status(403).json({
      message: "The email address is already registered !",
    });
  }

  try {
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(userData.password, salt);
    const result = await prisma.user.create({
      data: {
        email: userData.email,
        firstName: userData.fname,
        lastName: userData.lname,
        parent: userData.parent,
        password: hashedPassword,
        address: userData.address,
        city: userData.city,
        province: JSON.stringify(userData.state),
        className: JSON.stringify(userData.class),
        mobile: userData.mobile,
        userType: userType,
        userStatus: "Active",
        kycStatus: userType === "Teacher" ? "Kyc Pending" : "Not Required",
      },
    });

    if (result) {
      const { data } = await axios.post(
        "https://a.khalti.com/api/v2/epayment/initiate/",
        JSON.stringify({
          return_url: "http://localhost:3000/payment/status",
          website_url: "http://localhost:3000",
          amount: 1300,
          purchase_order_id: "test15022023",
          purchase_order_name: "test_order_name",
          customer_info: {
            name: "Ashim Upadhaya",
            email: "example@gmail.com",
            phone: "9811496763",
          },
          amount_breakdown: [
            {
              label: "Mark Price",
              amount: 1000,
            },
            {
              label: "VAT",
              amount: 300,
            },
          ],
          product_details: [
            {
              identity: "1234567890",
              name: "Khalti logo",
              total_price: 1300,
              quantity: 1,
              unit_price: 1300,
            },
          ],
        }),
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Key fd0bbb0969ca474ca644b9d75e3a0452",
          },
        }
      );

      // await emailMailer.sendEmail({
      //   email: userData.email,
      //   firstName: userData.fname,
      //   lastName: userData.lname,
      // });
      return res.status(200).json({
        message: "success",
        payment_url: data.payment_url,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(503).json({ message: error.response.data.message });
  } finally {
    async () => {
      await prisma.$disconnect();
    };
  }
});

module.exports = router;
