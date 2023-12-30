const axios = require("axios");

// khalti payment helper function for real money
// async function khaltiPayment(userData, selectedPlan) {
//   const { plan_id, plan_fee, plan_name, with_out_vat } = selectedPlan;
//   const {
//     firstName,
//     middleName,
//     lastName,
//     email,
//     contactNumber,
//     parentName,
//     parentContactNumber,
//   } = userData;

//   const planVat = Number(with_out_vat) * 0.13;
//   const total_fee = Number(plan_fee * 100);
//   const mark_price = Number(with_out_vat) * 100;
//   // console.log(planVat);
//   // console.log(typeof plan_fee);
//   try {
//     const { data } = await axios.post(
//       "https://khalti.com/api/v2/epayment/initiate/",
//       JSON.stringify({
//         return_url: "http://localhost:3000/payment/status",
//         website_url: "http://localhost:3000",
//         amount: total_fee,
//         purchase_order_id: plan_id,
//         purchase_order_name: plan_name,
//         customer_info: {
//           name: `${firstName} ${middleName ? middleName : " "} ${lastName}`,
//           email: email,
//           phone:contactNumber?contactNumber: parentContactNumber,
//         },
//         amount_breakdown: [
//           {
//             label: "Mark Price",
//             amount: mark_price,
//           },
//           {
//             label: "VAT",
//             amount: planVat * 100,
//           },
//         ],
//         product_details: [
//           {
//             identity: plan_id,
//             name: plan_name,
//             total_price: total_fee,
//             quantity: 1,
//             unit_price: total_fee,
//           },
//         ],
//       }),
//       {
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//           Authorization: "key live_secret_key_453bba6dce5d44698f5c3f786b976b43",
//           // Live key: e6f37d35bec24963b691f76c8d75315e
//           // a3f9becf86874842bea79b6b4cc6e8a1
//           // Satyal Test: fd0bbb0969ca474ca644b9d75e3a0452
//           // Satyal Live: 453bba6dce5d44698f5c3f786b976b43
//         },
//       }
//     );

//     khaltiRequestSuccess = true;

//     khaltiRequestSuccess = true;
//     // await emailMailer.sendEmail({
//     //   email: userData.email,
//     //   firstName: userData.fname,
//     //   lastName: userData.lname,
//     // });
//     return data;
//   } catch (err) {
//     console.log(err);
//   }
// }

// khalti payment heler function for test money
async function khaltiPayment(userData, selectedPlan) {
  const { id, plan_fee, plan_name, with_out_vat } = selectedPlan;
  const {
    firstName,
    middleName,
    lastName,
    email,
    userContactNumber,
    parentName,
    parentContactNumber,
  } = userData;

  // const planVat = Number(with_out_vat) * 0.13;
  // const total_fee = Number(plan_fee * 100);
  // const mark_price = Number(with_out_vat) * 100;
  // console.log("User Data:", userData);
  // console.log("Khalti's current URL:", process.env.KHALTI_PAYMENT_TEST_URL);
  // console.log("Khalti's current KEY:", process.env.KHALTI_SATYAL_TEST_KEY);
  // console.log("Khalti's current Plan:", selectedPlan);

  const contact = userContactNumber ? userContactNumber : parentContactNumber;
  // console.log("This is the contact:", contact);
  // console.log("This is the contacts type:", typeof contact);

  try {
    const { data } = await axios.post(
      `${process.env.KHALTI_PAYMENT_TEST_URL}`,
      // 'https://a.khalti.com/api/v2/epayment/initiate/',
      JSON.stringify({
        return_url: `http://localhost:3000/payment/status?email=${email}`,
        // return_url: `http://localhost:3000/api/v1/payment/user/updatestatus?email=${email}`,
        website_url: "http://localhost:3000",
        amount: 1300,
        purchase_order_id: "test12",
        purchase_order_name: plan_name,
        customer_info: {
          name: `${firstName} ${middleName ? middleName : " "} ${lastName}`,
          email: email,
          // phone: `${contact}`, // Does NOT WORK
          phone: "9841234567",
        },
        // customer_info: {
        //   name: `${firstName} ${middleName ? middleName : ' '} ${lastName}`,
        //   email: email,
        //   phone: userContactNumber ? userContactNumber : parentContactNumber,
        // },
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
            identity: id,
            name: plan_name,
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
          Authorization: `key ${process.env.KHALTI_SATYAL_TEST_KEY}`,
          // Authorization: `key fd0bbb0969ca474ca644b9d75e3a0452`,
          // Live key: e6f37d35bec24963b691f76c8d75315e
          // a3f9becf86874842bea79b6b4cc6e8a1
          // Satyal Test: fd0bbb0969ca474ca644b9d75e3a0452
          // Satyal Live: 453bba6dce5d44698f5c3f786b976b43
        },
      }
    );
    khaltiRequestSuccess = true;
    console.log("Data from Khalti", data);
    return data;
  } catch (err) {
    console.log(err);
  }
}
// khalti lookup function to test successfuly payed or not
async function khaltiPaymentLookUp(pid) {
  try {
    const result = await axios.post(
      // `${process.env.KHALTI_PAYMENT_LOOKUP_TEST_URL}`,
      `https://a.khalti.com/api/v2/epayment/lookup/`,
      {
        pidx: pid,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Key ${process.env.KHALTI_SATYAL_TEST_KEY}`,
        },
      }
    );

    return result.data;
  } catch (err) {
    console.log("khalti lookup helper error", err);
  }
}
module.exports = { khaltiPayment, khaltiPaymentLookUp };
