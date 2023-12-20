const prisma = require("../lib/prisma");

// this function check if the email id register or not in our system
async function emailValidatorInSystem(email) {
  try {
    let emailExist = await prisma.user.count({
      where: {
        email: email,
      },
    });
    // console.log('Email exits or not?: ', emailExist);
    return emailExist;
  } catch (err) {
    console.log(err);
  }
}
// checking given email id user register or not
async function userExitInSystemValidator(email) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
    });
    return user;
  } catch (err) {
    console.log(err);
  }
}
module.exports = { emailValidatorInSystem, userExitInSystemValidator };
