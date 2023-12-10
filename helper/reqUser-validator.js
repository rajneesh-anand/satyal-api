const prisma = require("../lib/prisma");

// this function check if the email id register or not in our system
async function emailValidatorInSystem(email) {
  try {
    let emailExist = await prisma.user.count({
      where: {
        email: email,
      },
    });
    return emailExist;
  } catch (err) {
    console.log(err);
  }
}

module.exports = { emailValidatorInSystem };
