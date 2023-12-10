const { body, validationResult } = require("express-validator");

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

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));

  return res.status(422).json({
    errors: extractedErrors,
  });
};
