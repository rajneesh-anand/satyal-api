const prisma = require("../lib/prisma");

// helper funtion to register student
async function registerStudent(userData, hashedPassword, userType) {
  try {
    // console.log(userData);
    // console.log(userType);
    // console.log(hashedPassword);
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
        userStatus: "Active",
        kycStatus: userType === "Teacher" ? "Kyc Pending" : "Not Required",
      },
    });
    return result;
  } catch (err) {
    console.log(err);
  }
}

module.exports = { registerStudent };
