const date = require('date-and-time');
const prisma = require('../../lib/prisma');
const { khaltiPaymentLookUp } = require('../../helper/payment');
const { userExitInSystemValidator } = require('../../helper/reqUser-validator');
const { sendMail } = require('../../helper/mailing');
// this controler check user payment successfull or not and update in db
const userCheckPaymentStatus = async (req, res) => {
  //   console.log("paymetn status");
  const {
    email,
    transaction_id,
    amount,
    mobile,
    purchase_order_id,
    purchase_order_name,
  } = req.body;
  // console.log("status body data", req.body);
  //   seperate email and pid from req body
  console.log('I am email from new meelan route:', email);
  const userMail = email?.split('?')[0];
  const pidx = email?.split('=')[1];
  console.log(
    'I am email from new meelan route after split:',
    userMail,
    'and pidx:',
    pidx
  );

  //   validation req body parameter
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
  try {
    // we will seperate  payment lookup funtion later
    // -->

    // now we used only khalti paymetn
    let lookupData = await khaltiPaymentLookUp(pidx);
    console.log('lookup data from khalti', lookupData);
    // checking khalti lookup response
    if (lookupData) {
      const exitUser = await userExitInSystemValidator(userMail);
      // console.log("exit user", exitUser);
      if (!exitUser) {
        return res.status(401).json({ message: 'unAuthorize email id ' });
      }
      // For this need subscription package full details to put in the purchase table
      // for calculating its expiry date.
      const pattern = date.compile('MMM D YYYY h:m:s A');
      date.format(new Date(), pattern); // => Mar 16 2020 6:24:56 PM
      // we need to validate all filed of lookup response data
      // --->here

      // Create a new Purchase object
      const purchase = await prisma.purchase.create({
        data: {
          name: `${exitUser?.firstName} ${
            exitUser?.middleName ? exitUser?.middleName : ''
          } ${exitUser?.lastName}`,
          transactionId: lookupData?.transaction_id,
          amount: parseFloat(lookupData?.total_amount), // Ensure proper data type conversion
          mobile: mobile,
          purchaseOrderId: purchase_order_id,
          purchaseOrderName: purchase_order_name,
          // purchaseOrderValidity: 1?
          paymentMethod: 'Khalti', // Update based on actual payment method
          paymentStatus: lookupData?.status,
          pidx: lookupData?.pidx,
          userAccessStatus: true,
          // need to update subscriptionExpiry here
          subscriptionStartDate: date.format(new Date(), pattern),
          subscriptionEndDate: date.format(date.addMonths(new Date(), 1), pattern),
          user: {
            connect: { id: exitUser?.id },
          },
        },
      });
      // console.log("after purchase successfull", purchase);
      if (!purchase) {
        // we need to add more advance logice to handel this failure
        return res.status(500).json('server internel error when updating payment ');
      }
      //  welcome mail details
      const mailDetails = {
        userName: `${exitUser?.firstName} ${
          exitUser?.middleName ? exitUser?.middleName : ' '
        } ${exitUser.lastName}`,
        subscriptionName: purchase.purchaseOrderName,
        subscriptionDuration: 1,
        startDate: purchase.subscriptionStartDate,
        endDate: purchase.subscriptionEndDate,
        transaction_id: purchase.transactionId,
        pidx,
        amountPaid: purchase.amount / 100,
        websiteUrl: 'http://localhost:3000',
        year: new Date().getFullYear(),
      };
      // sending mailto user to successfull purches package
      sendMail(exitUser.email, 'Welcome to Satyal Learning', mailDetails);
      return res
        .status(201)
        .json({ message: 'Payment Verified. Thank you for your purchase!' });
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports = { userCheckPaymentStatus };
