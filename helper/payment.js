const axios = require("axios");

async function khaltiPayment(userData, selectedPlan) {
  const { plan_id, plan_fee, plan_name, with_out_vat } = selectedPlan;
  const {
    firstName,
    middleName,
    lastName,
    email,
    parentName,
    parentContactNumber,
  } = userData;

  const planVat = (Number(with_out_vat) * 13) / 100;
  const total_fee = Number(plan_fee * 100);
  const mark_price = Number(with_out_vat) * 100;
  // console.log(planVat);
  // console.log(typeof plan_fee);
  try {
    const { data } = await axios.post(
      "https://a.khalti.com/api/v2/epayment/initiate/",
      JSON.stringify({
        return_url: "http://localhost:3000/payment/status",
        website_url: "http://localhost:3000",
        amount: total_fee,
        purchase_order_id: plan_id,
        purchase_order_name: plan_name,
        customer_info: {
          name: `${firstName} ${middleName ? middleName : " "} ${lastName}`,
          email: email,
          phone: parentContactNumber,
        },
        amount_breakdown: [
          {
            label: "Mark Price",
            amount: mark_price,
          },
          {
            label: "VAT",
            amount: planVat * 100,
          },
        ],
        product_details: [
          {
            identity: plan_id,
            name: plan_name,
            total_price: total_fee,
            quantity: 1,
            unit_price: total_fee,
          },
        ],
      }),
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Key e6f37d35bec24963b691f76c8d75315e",
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
    return data;
  } catch (err) {
    console.log(err);
  }
}

module.exports = { khaltiPayment };
