const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { hashSync, genSaltSync } = require('bcrypt');
const axios = require('axios');
const emailMailer = require('../helper/email');

// To give to front
const subscriptionPlans = [
  { name: 'Basic', price: 1000 },
  { name: 'Standard', price: 2000 },
  { name: 'Premium', price: 3000 },
  { name: 'Enterprise', price: 4000 },
];

// Define a route to handle the payment success callback
router.get('/status', (req, res) => {
  // Extract parameters from the callback URL
  const { pidx, transaction_id, amount, mobile, purchase_order_id, purchase_order_name } =
    req.query;

  // Perform any necessary validation or processing
  // For example, you can save the payment information to your database
  // and update the user's status or order status.

  // Respond with a confirmation message
  res.status(200).json({
    message: 'Payment success callback received',
    pidx,
    transaction_id,
    amount,
    mobile,
    purchase_order_id,
    purchase_order_name,
  });
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
        lastName: userData.lastName,
        parentName: userData.parentName,
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

    if (result) {
      const { data } = await axios.post(
        'https://a.khalti.com/api/v2/epayment/initiate/',
        JSON.stringify({
          return_url: 'http://localhost:3000/payment/status',
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
const axios = require('axios');
const { genSaltSync, hashSync } = require('bcrypt');
const { prisma } = require('./path-to-your-prisma-instance');

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
const express = require('express');
const { initiatePayment, createUser } = require('./path-to-paymentService');

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
