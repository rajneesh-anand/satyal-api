const { hashSync, genSaltSync } = require("bcrypt");
const { validationResult } = require("express-validator");
const prisma = require("../lib/prisma");
const jwt = require("jsonwebtoken");

exports.userSignupController = async (req, res) => {
  const { name, email, password } = req.body;
  const salt = genSaltSync(10);
  let hashedPassword = hashSync(password, salt);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  let user = await prisma.user.count({
    where: {
      email: email,
    },
  });

  if (user == 0) {
    const token = jwt.sign(
      {
        name: name,
        email: email,
        picture: "/images/default-profile.svg",
        iat: new Date().getTime(),
        exp: 30 * 24 * 60 * 60,
      },
      process.env.SECRET
    );

    try {
      await prisma.user.create({
        data: {
          name: name,
          email: email,
          password: hashedPassword,
        },
      });
      res.status(200).json({
        message: "success",
      });
    } catch (error) {
      console.log(error);
      res.send(error.message);
    } finally {
      async () => {
        await prisma.$disconnect();
      };
    }
  } else {
    res.status(200).json({
      message: "user already exists",
    });
  }
};
