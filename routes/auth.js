const express = require("express");
const { hashSync, genSaltSync } = require("bcrypt");
const { IncomingForm } = require("formidable");
const prisma = require("../lib/prisma");
const { userSignupValidator } = require("../helper/user-validator");
const jwt = require("jsonwebtoken");
const util = require("util");
const jwtVerifyAsync = util.promisify(jwt.verify);
const emailMailer = require("../helper/email");
const router = express.Router();

router.post("/register", userSignupValidator(), async (req, res) => {
  const data = await new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });

  let emailExist = await prisma.user.count({
    where: {
      email: data.fields.email,
    },
  });

  if (emailExist > 0) {
    return res.status(403).json({
      message: "Email is already registered !",
    });
  }

  const salt = genSaltSync(10);
  const hashedPassword = hashSync(data.fields.password, salt);

  try {
    await prisma.user.create({
      data: {
        email: data.fields.email,
        firstName: data.fields.fname,
        lastName: data.fields.lname,
        password: hashedPassword,
        address: data.fields.address,
        city: data.fields.city,
        province: data.fields.province,
        class: data.fields.class,
        mobile: data.fields.mobile,
        userType: data.fields.userType,
        userStatus: data.fields.userType === "Teacher" ? "Inactive" : "Active",
        kycStatus:
          data.fields.userType === "Teacher" ? "Kyc Pending" : "Not Required",
        kycDocument:
          data.fields.userType === "Teacher" ? "Kyc Pending" : "Not Required",
        kycDocumentType:
          data.fields.userType === "Teacher" ? "Kyc Pending" : "Not Required",
      },
    });
    return res.status(200).json(
      await emailMailer.sendEmail({
        email: data.fields.email,
        firstName: data.fields.fname,
        lastName: data.fields.lname,
      })
    );
  } catch (error) {
    console.log(error);
    return res.status(503).send(error);
  } finally {
    async () => {
      await prisma.$disconnect();
    };
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  console.log(email);
  let user = await prisma.user.findFirst({
    where: {
      email: email,
      userStatus: "Active",
    },
  });

  if (!user) {
    return res
      .status(422)
      .json({ message: "You are not regsitered with this email address !" });
  }

  let token = await prisma.verificationToken.findFirst({
    where: {
      user: { email: email },
    },
  });

  if (token) {
    await prisma.verificationToken.deleteMany({
      where: {
        userId: user.id,
      },
    });
  }

  let resetToken = jwt.sign({ email: email }, process.env.PWD_TOKEN_SECRET, {
    expiresIn: "10m",
  });

  try {
    await prisma.verificationToken.create({
      data: {
        token: resetToken,
        user: { connect: { email: email } },
      },
    });

    const link = `http://localhost:3000/user/reset-password?access=${resetToken}`;

    await emailMailer.sendPasswordResetEmail({
      pwdLink: link,
      email: email,
    });
    return res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error);
    return res.status(503).json({ message: "Something went wrong !" });
  }
});

router.post("/reset-password/reset/:access", async (req, res) => {
  const accessToken = req.params.access;
  const { password } = req.body;
  const { email } = jwt.verify(accessToken, process.env.PWD_TOKEN_SECRET);

  const salt = genSaltSync(10);
  const hashedPassword = hashSync(password, salt);

  try {
    await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        password: hashedPassword,
      },
    });
    return res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error);
    return res
      .status(403)
      .json({ message: "Your password reset token is expired ! " });
  } finally {
    async () => {
      await prisma.$disconnect();
    };
  }
});

router.get("/reset-password/:access", async (req, res) => {
  const accessToken = req.params.access;

  try {
    await jwtVerifyAsync(accessToken, process.env.PWD_TOKEN_SECRET);
    return res.status(200).json({ message: "success" });
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Your password reset token is expired ! " });
  }
});

module.exports = router;
