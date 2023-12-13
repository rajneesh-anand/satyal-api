const { hashSync, genSaltSync } = require('bcrypt');
const { emailValidatorInSystem } = require('../../helper/reqUser-validator');
const { registerStudent } = require('../../helper/user');
const { khaltiPayment } = require('../../helper/payment');

// user register controller
// currently it only work on student register
async function userRegisterController(req, res) {
  const { userData, paymentMethod, selectedPlan, userType } = req.body;

  //   checking required data is included or not in req
  if (!userData || !userType) {
    return res.status(400).type('json').json({ error: 'bad reques' });
  }

  // here  we need to check individual property of the req body data
  //   --->

  // checking req email is register or not on our system
  if ((await emailValidatorInSystem(userData?.email)) > 0) {
    return res.status(403).json({
      message: 'The email address is already registered !',
    });
  }

  try {
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(userData.password, salt);
    // calling student register util fun if usertype is student
    if (userType === 'student') {
      // this function is used to add student information on DB
      let result = await registerStudent(userData, hashedPassword, userType);
      console.log('This is the result:', result);

      //   if student successfully register then calling payment method
      if (result) {
        // currently we directly used khalti for payment
        // latter we can create middleware or helper fun to call diff payment method
        const khaltiData = await khaltiPayment(userData, selectedPlan);
        // console.log("given are the khalti call back data");
        // console.log(khaltiData);
        // return res.status(200).json(khaltiData);

        // if payment failed
        if (khaltiData) {
          return res.status(200).json({
            message: 'success khalti is login',
            // payment_url: khaltiData?.payment_url,
            khaltiData,
          });
        } else {
          return res
            .status(400)
            .type('json')
            .json({ message: 'payment is failed please try again' });
        }
      } else {
        return res
          .status(500)
          .type('json')
          .json({ error: 'internel server error please try again' });
      }
    }
  } catch (err) {
    console.log(err);
  }

  // return res.status(200).json("good requese");
}

module.exports = { userRegisterController };
