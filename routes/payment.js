const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { hashSync, genSaltSync } = require('bcrypt');
const axios = require('axios');
const date = require('date-and-time');
const { sendMail } = require('../helper/mailing');

// Define a route to handle the payment success callback using lookup
router.post('/status', async (req, res) => {
  // Extract parameters from the callback URL
  console.log('Hey I ran');
  const {
    email,
    transaction_id,
    amount,
    mobile,
    purchase_order_id,
    purchase_order_name,
  } = req.body;

  // console.log("Query parameters", req.query);
  // console.log("Email from query parameters", email);
  // console.log("Params parameters", req.params);
  console.log('I am body inside /status route:', req.body);
  // console.log(user_id);
  // return;
  const userMail = email?.split('?')[0];
  const pidx = email?.split('=')[1];
  console.log('This is the pidx:', pidx);
  console.log('This is the user email:', userMail);

  // Validate parameters
  if (
    !pidx ||
    !transaction_id ||
    !amount ||
    !mobile ||
    !purchase_order_id ||
    !purchase_order_name
  ) {
    throw new Error('Missing required parameters');
  }

  console.log('API KEY:, ', process.env.KHALTI_PK_KEY);

  try {
    // Perform any necessary validation or processing
    // For example, you can save the payment information to your database
    // and update the user's status or order status.
    const { data, status } = await axios.post(
      `${process.env.KHALTI_PAYMENT_LOOKUP_TEST_URL}`,
      // `https://a.khalti.com/api/v2/epayment/lookup/`,
      // `https://khalti.com/api/v2/epayment/lookup/`,
      {
        pidx: pidx,
      },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `key ${process.env.KHALTI_PK_KEY}`,
          // Authorization: `Key fd0bbb0969ca474ca644b9d75e3a0452`,
          // Live key: e6f37d35bec24963b691f76c8d75315e
          // a3f9becf86874842bea79b6b4cc6e8a1
          // Satyal Test: fd0bbb0969ca474ca644b9d75e3a0452
          // Satyal Live: 453bba6dce5d44698f5c3f786b976b43
        },
      }
    );

    console.log('This is the payment lookup data:', data);

    // Validate the data and extract the transaction details
    if (status === 200 && data.status === 'Completed') {
      // Get user based on your identification logic (e.g., session, token)
      // yo user ko id aaucha req ma ka bata lyaune?
      // Ka bata yo pass garayera lyaune is the question.
      console.log('1  ?');

      const user = await prisma.user.findUnique({
        where: { email: userMail }, // Replace with your logic
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // For this need subscription package full details to put in the purchase table
      // for calculating its expiry date.
      const pattern = date.compile('MMM D YYYY h:m:s A');
      date.format(new Date(), pattern); // => Mar 16 2020 6:24:56 PM

      console.log('2  ?', user);

      // Create a new Purchase object
      const purchase = await prisma.purchase.create({
        data: {
          userId: user.id, // Replace with actual user identification logic
          name: `${user.firstName} ${user.middleName ? user.middleName : ''} ${
            user.lastName
          }`,
          transactionId: transaction_id,
          amount: parseFloat(amount), // Ensure proper data type conversion
          mobile,
          purchaseOrderId: purchase_order_id,
          purchaseOrderName: purchase_order_name,
          // purchaseOrderValidity: 1?
          paymentMethod: 'Khalti', // Update based on actual payment method
          paymentStatus: 'Success',
          // need to update subscriptionExpiry here
          subscriptionStartDate: date.format(new Date(), pattern),
          subscriptionEndDate: date.format(date.addMonths(new Date(), 1), pattern),
        },
      });

      console.log('3  ?');

      if (purchase) {
        // Update user status to active subscription
        const isValidSubscription =
          new Date() >= purchase.subscriptionStartDate &&
          new Date() <= purchase.subscriptionEndDate;

        // Update user status based on valid subscription
        if (isValidSubscription) {
          user.activeSubscription = true;
          await prisma.user.update({
            where: { id: user.id },
            data: { activeSubscription: true },
          });
        } else {
          user.activeSubscription = false;
          await prisma.user.update({
            where: { id: user.id },
            data: { activeSubscription: false },
          });
        }
      } else {
        return res
          .status(500)
          .json({ message: 'Error performing database action for purchase' });
      }

      console.log('4  ?');

      // Mail Details for Welcoming the user
      const mailDetails = {
        firstName: user.firstName,
        subscriptionName: purchase.purchaseOrderName,
        subscriptionDuration: 1,
        startDate: purchase.subscriptionStartDate,
        endDate: purchase.subscriptionEndDate,
        transaction_id: purchase.transactionId,
        pidx,
        amountPaid: purchase.amount,
        websiteUrl: 'http://localhost:3000',
        year: new Date().getFullYear(),
      };

      // Mail Details for User Password Reset
      // const mailDetails = {
      //   firstName: user.firstName,
      //   lastName: user.lastName,
      //   otpCode: otpCode,
      //   otpExpiry: otpExpiry,
      //   year: new Date().getFullYear(),
      // };

      sendMail(user.email, 'Welcome to Satyal Learning', mailDetails);

      // Respond to Khalti with a confirmation message
      return res.status(200).json({
        message: 'Payment Verified. Thank you for your purchase!',
        // pidx,
        // transactionId: purchase.transactionId,
        // amount: purchase.amount,
        // mobile,
        // purchaseOrderId: purchase.purchaseOrderId,
        // purchaseOrderName: purchase.purchaseOrderName,
        // user: {
        //   activeSubscription: user.activeSubscription,
        // },
      });
    }
  } catch (error) {
    console.error(error.message);
    console.error(error);
    res.status(500).json({ message: 'Error processing payment callback' });
  }
});

// working code with real money test
// router.post('/khalti', async (req, res) => {
//   const { userData, payment, selectedPlan, userType } = req.body;
//   console.log("This is user's data:", userData);
//   console.log("This is plan's data:", selectedPlan);
//   console.log("This is user's type:", userType);

//   let emailExist = await prisma.user.count({
//     where: {
//       email: userData.email,
//     },
//   });

//   if (emailExist > 0) {
//     return res.status(403).json({
//       message: 'The email address is already registered !',
//     });
//   }

//   try {
//     const salt = genSaltSync(10);
//     const hashedPassword = hashSync(userData.password, salt);
//     const result = await prisma.user.create({
//       data: {
//         email: userData.email,
//         firstName: userData.firstName,
//         middleName: userData?.middleName,
//         lastName: userData.lastName,
//         parentName: userData.parentName,
//         parentContactNumber: userData.parentContactNumber,
//         password: hashedPassword,
//         address: userData.address,
//         city: userData.city,
//         province: JSON.stringify(userData.state),
//         studentClass: JSON.stringify(userData.studentClass),
//         userContactNumber: userData.userContactNumber,
//         userType: userType,
//         userStatus: 'Active',
//         kycStatus: userType === 'Teacher' ? 'Kyc Pending' : 'Not Required',
//       },
//     });

//     if (result) {
//       const { data } = await axios.post(
//         'https://khalti.com/api/v2/epayment/initiate/',
//         JSON.stringify({
//           return_url: 'http://localhost:3000/payment/status',
//           website_url: 'http://localhost:3000',
//           amount: selectedPlan.price,
//           purchase_order_id: 'Ordewr01',
//           purchase_order_name: 'Basic Plan',
//           customer_info: {
//             name: userData.middleName
//               ? `${userData.firstName} ${userData.middleName} ${userData.lastName}`
//               : `${userData.firstName} ${userData.lastName}`,
//             email: userData.email,
//             phone: userData.userContactNumber,
//           },
//           amount_breakdown: [
//             {
//               label: 'Mark Price',
//               amount: selectedPlan.price - selectedPlan.price * 0.13,
//             },
//             {
//               label: 'VAT',
//               amount: selectedPlan.price * 0.13,
//             },
//           ],
//           product_details: [
//             {
//               identity: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
//               name: selectedPlan.name,
//               total_price: selectedPlan.price,
//               quantity: 1,
//               unit_price: selectedPlan.price,
//             },
//           ],
//         }),
//         {
//           headers: {
//             Accept: 'application/json',
//             'Content-Type': 'application/json',
//             Authorization: 'key live_secret_key_453bba6dce5d44698f5c3f786b976b43',
//             // Live key: e6f37d35bec24963b691f76c8d75315e
//             // a3f9becf86874842bea79b6b4cc6e8a1
//             // Satyal Test: fd0bbb0969ca474ca644b9d75e3a0452
//             // Satyal Live: 453bba6dce5d44698f5c3f786b976b43
//           },
//         }
//       );

//       khaltiRequestSuccess = true;

//       // await emailMailer.sendEmail({
//       //   email: userData.email,
//       //   firstName: userData.fname,
//       //   lastName: userData.lname,
//       // });
//       return res.status(200).json({
//         message: 'success',
//         payment_url: data.payment_url,
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     // return res.status(503).json({ message: error.response.data.message });
//     // Undo the database action if Khalti request was not successful
//     await prisma.user.delete({
//       where: {
//         email: userData.email,
//       },
//     });
//     return res.status(503).json({ message: error.message });
//   } finally {
//     async () => {
//       await prisma.$disconnect();
//     };
//   }
// });

router.post('/khalti', async (req, res) => {
  const { userData, payment, selectedPlan, userType } = req.body;
  console.log("This is user's data:", userData);
  console.log("This is plan's data:", selectedPlan);
  console.log("This is user's type:", userType);

  let emailExist = await prisma.user.count({
    where: {
      email: userData.email,
    },
  });

  if (emailExist > 0) {
    return res.status(403).json({
      message: 'The email address is already registered !',
    });
  }

  try {
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(userData.password, salt);
    const result = await prisma.user.create({
      data: {
        email: userData.email,
        firstName: userData.firstName,
        middleName: userData?.middleName,
        middleName: userData?.middleName,
        lastName: userData.lastName,
        parentName: userData.parentName,
        parentContactNumber: userData.parentContactNumber,
        parentContactNumber: userData.parentContactNumber,
        password: hashedPassword,
        address: userData.address,
        city: userData.city,
        province: JSON.stringify(userData.state),
        studentClass: JSON.stringify(userData.studentClass),
        userContactNumber: userData.userContactNumber,
        userType: userType,
        userStatus: 'Active',
        kycStatus: userType === 'Teacher' ? 'Kyc Pending' : 'Not Required',
      },
    });

    console.log('This is the result:', result);

    if (result) {
      const { data } = await axios.post(
        'https://a.khalti.com/api/v2/epayment/initiate/',
        JSON.stringify({
          return_url: `http://localhost:3000/payment/status/?email=${result.email}/`,
          website_url: 'http://localhost:3000',
          amount: 1300,
          purchase_order_id: 'test12',
          purchase_order_name: 'test',
          customer_info: {
            name: 'Ashim Upadhaya',
            email: 'example@gmail.com',
            phone: '9811496763',
          },
          amount_breakdown: [
            {
              label: 'Mark Price',
              amount: 1000,
            },
            {
              label: 'VAT',
              amount: 300,
            },
          ],
          product_details: [
            {
              identity: '1234567890',
              name: 'Khalti logo',
              total_price: 1300,
              quantity: 1,
              unit_price: 1300,
            },
          ],
        }),
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Key e6f37d35bec24963b691f76c8d75315e',
            // Live key: e6f37d35bec24963b691f76c8d75315e
            // a3f9becf86874842bea79b6b4cc6e8a1
            // Satyal Test: fd0bbb0969ca474ca644b9d75e3a0452
            // Satyal Live: 453bba6dce5d44698f5c3f786b976b43
          },
        }
      );

      khaltiRequestSuccess = true;

      khaltiRequestSuccess = true;
      // await emailMailer.sendEmail({
      //   email: userData.email,
      //   firstName: userData.fname,
      //   lastName: userData.lname,
      // });
      return res.status(200).json({
        message: 'success',
        payment_url: data.payment_url,
        data,
      });
    }
  } catch (error) {
    console.log(error);
    // return res.status(503).json({ message: error.response.data.message });
    // Undo the database action if Khalti request was not successful
    await prisma.user.delete({
      where: {
        email: userData.email,
      },
    });
    return res.status(503).json({ message: error.message, error: error });
  } finally {
    async () => {
      await prisma.$disconnect();
    };
  }
});

// router.post('/khalti', async (req, res) => {
//   const { userData, payment, selectedPlan, userType } = req.body;
//   console.log("This is user's data:", userData);
//   console.log("This is plan's data:", selectedPlan);
//   console.log("This is user's type:", userType);

//   let emailExist = await prisma.user.count({
//     where: {
//       email: userData.email,
//     },
//   });

//   if (emailExist > 0) {
//     return res.status(403).json({
//       message: 'The email address is already registered !',
//     });
//   }

//   try {
//     const salt = genSaltSync(10);
//     const hashedPassword = hashSync(userData.password, salt);
//     const result = await prisma.user.create({
//       data: {
//         email: userData.email,
//         firstName: userData.firstName,
//         middleName: userData?.middleName,
//         lastName: userData.lastName,
//         parentName: userData.parentName,
//         parentContactNumber: userData.parentContactNumber,
//         password: hashedPassword,
//         address: userData.address,
//         city: userData.city,
//         province: JSON.stringify(userData.state),
//         studentClass: JSON.stringify(userData.studentClass),
//         userContactNumber: userData.userContactNumber,
//         userType: userType,
//         userStatus: 'Active',
//         kycStatus: userType === 'Teacher' ? 'Kyc Pending' : 'Not Required',
//       },
//     });

//     if (result) {
//       const { data } = await axios.post(
//         'https://khalti.com/api/v2/epayment/initiate/',
//         JSON.stringify({
//           return_url: 'http://localhost:3000/payment/status',
//           website_url: 'http://localhost:3000',
//           amount: 1300,
//           purchase_order_id: 'Ordwer01',
//           purchase_order_name: 'Test',
//           customer_info: {
//             name: userData.middleName
//               ? `${userData.firstName} ${userData.middleName} ${userData.lastName}`
//               : `${userData.firstName} ${userData.lastName}`,
//             email: userData.email,
//             phone: userData.userContactNumber,
//           },
//           amount_breakdown: [
//             {
//               label: 'Mark Price',
//               amount: selectedPlan.price,
//             },
//             {
//               label: 'VAT',
//               amount: selectedPlan.price * 0.13,
//             },
//           ],
//           product_details: [
//             {
//               identity: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
//               name: selectedPlan.name,
//               total_price: selectedPlan.price,
//               quantity: 1,
//               unit_price: selectedPlan.price,
//             },
//           ],
//         }),
//         {
//           headers: {
//             Accept: 'application/json',
//             'Content-Type': 'application/json',
//             Authorization: 'key live_secret_key_453bba6dce5d44698f5c3f786b976b43',
//             // Key 453bba6dce5d44698f5c3f786b976b43
//             // Live key: e6f37d35bec24963b691f76c8d75315e
//             // a3f9becf86874842bea79b6b4cc6e8a1
//             // Satyal Test: fd0bbb0969ca474ca644b9d75e3a0452
//             // Satyal Live: 453bba6dce5d44698f5c3f786b976b43
//           },
//         }
//       );

//       khaltiRequestSuccess = true;

//       // await emailMailer.sendEmail({
//       //   email: userData.email,
//       //   firstName: userData.fname,
//       //   lastName: userData.lname,
//       // });
//       return res.status(200).json({
//         message: 'success',
//         payment_url: data.payment_url,
//         data,
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     // return res.status(503).json({ message: error.response.data.message });
//     // Undo the database action if Khalti request was not successful
//     await prisma.user.delete({
//       where: {
//         email: userData.email,
//       },
//     });
//     return res.status(503).json({ message: error.message, error: error });
//   } finally {
//     async () => {
//       await prisma.$disconnect();
//     };
//   }
// });

module.exports = router;

// curl --location 'https://khalti.com/api/v2/epayment/initiate/' \
// --header 'Authorization: key live_secret_key_453bba6dce5d44698f5c3f786b976b43' \
// --header 'Content-Type: application/json' \
// --data-raw '{
// "return_url": "http://example.com/",
// "website_url": "http://example.com/",
// "amount": "1000",
// "purchase_order_id": "Ordwer01",
// "purchase_order_name": "Test",
// "customer_info": {
//     "name": "Test Bahadur",
//     "email": "test@khalti.com",
//     "phone": "9800000001"
// }
// }'

/* ==================================================================================================== */
/* 
    Start of our dummy code here: 
*/

// Separate User Creation Logic:

async function createUser(userData, userType) {
  const salt = genSaltSync(10);
  const hashedPassword = hashSync(userData.password, salt);

  return await prisma.user.create({
    data: {
      email: userData.email,
      firstName: userData.firstName,
      middleName: userData?.middleName,
      // ... other user data ...
      userType: userType,
      userStatus: 'Active',
      kycStatus: userType === 'Teacher' ? 'Kyc Pending' : 'Not Required',
    },
  });
}

// Separate Payment Gateway Request Initiation:

async function initiatePayment(userData) {
  try {
    const { data } = await axios.post(
      'https://a.khalti.com/api/v2/epayment/initiate/',
      JSON.stringify({
        // ... payment initiation payload ...
      }),
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Key a3f9becf86874842bea79b6b4cc6e8a1',
        },
      }
    );

    return {
      message: 'success',
      payment_url: data.payment_url,
    };
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
}

// Use the Separated Functions in the Route Handler:

router.post('/khalti', async (req, res) => {
  const { userData, payment, userType } = req.body;
  console.log("This is user's data:", userData);

  try {
    // Separate user creation logic
    const userResult = await createUser(userData, userType);

    // Check if user creation was successful before initiating payment
    if (userResult) {
      // Separate payment initiation logic
      const paymentResult = await initiatePayment(userData);

      return res.status(200).json(paymentResult);
    }
  } catch (error) {
    console.log(error);
    return res.status(503).json({ message: error.message });
  } finally {
    await prisma.$disconnect();
  }
});

// Create a new file, e.g., paymentService.js:

// paymentService.js
// const axios = require("axios");
// const { genSaltSync, hashSync } = require("bcrypt");
// const { prisma } = require("./path-to-your-prisma-instance");

async function initiatePayment(userData) {
  try {
    const { data } = await axios.post(
      'https://a.khalti.com/api/v2/epayment/initiate/',
      JSON.stringify({
        // ... payment initiation payload ...
      }),
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Key a3f9becf86874842bea79b6b4cc6e8a1',
        },
      }
    );

    return {
      message: 'success',
      payment_url: data.payment_url,
    };
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
}

async function createUser(userData, userType) {
  const salt = genSaltSync(10);
  const hashedPassword = hashSync(userData.password, salt);

  return await prisma.user.create({
    data: {
      email: userData.email,
      firstName: userData.firstName,
      middleName: userData?.middleName,
      // ... other user data ...
      userType: userType,
      userStatus: 'Active',
      kycStatus: userType === 'Teacher' ? 'Kyc Pending' : 'Not Required',
    },
  });
}

// module.exports = { initiatePayment, createUser };

// In your route handler file:

// Your route handler file
// const express = require("express");
// const { initiatePayment, createUser } = require("./path-to-paymentService");

// const router = express.Router();

router.post('/khalti', async (req, res) => {
  const { userData, payment, userType } = req.body;
  console.log("This is user's data:", userData);

  try {
    // Separate user creation logic
    const userResult = await createUser(userData, userType);

    // Check if user creation was successful before initiating payment
    if (userResult) {
      // Separate payment initiation logic
      const paymentResult = await initiatePayment(userData);

      return res.status(200).json(paymentResult);
    }
  } catch (error) {
    console.log(error);
    return res.status(503).json({ message: error.message });
  } finally {
    await prisma.$disconnect();
  }
});

/* 
      End to our dummy code here: 
*/

/* ==================================================================================================== */
