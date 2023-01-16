const { body } = require("express-validator");

exports.userSignupValidator = () => {
  return [
    // Validate email format
    body("email").isEmail().withMessage("Must be a valid email address."),
    // Validate password length
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long."),
  ];
};
