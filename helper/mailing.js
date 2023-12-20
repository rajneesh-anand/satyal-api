const path = require("path");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");

let transporter = nodemailer.createTransport({
  service: `SendGrid`,
  auth: {
    user: process.env.SENDGRID_USERNAME,
    pass: process.env.SENDGRID_API_KEY,
  },
});

// const transporter = nodemailer.createTransport({
//   service: 'smtp-relay.brevo.com',
//   port: 587,
//   auth: {
//     user: process.env.MAIL_AUTH_CREDENTIAL_USER,
//     pass: process.env.MAIL_AUTH_CREDENTIAL_PASSWORD,
//   },
// });

const handlebarsOptions = {
  viewEngine: {
    extName: ".hbs",
    partialDir: path.join(__dirname, "../views"),
    defaultLayout: false,
  },
  viewPath: path.join(__dirname, "../views"),
  extName: ".hbs",
};

transporter.use("compile", hbs(handlebarsOptions));

exports.sendMail = async (reciever, sub, mailDetails, isWelcomeMail = true) => {
  let mailOptions = {
    // from: `Prasanna Koirala <${MAIL_FROM}>`,
    // from: `${MAIL_FROM}`,
    from: "prasannakkoirala@outlook.com",
    to: reciever,
    subject: sub,
    template: isWelcomeMail ? "email" : "reset-password",
    context: {
      ...mailDetails,
    },
  };

  transporter.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.log(process.env.MAIL_AUTH_CREDENTIAL_USER);
      console.log(process.env.MAIL_AUTH_CREDENTIAL_PASSWORD);
      console.log(process.env.SENDGRID_USERNAME);
      console.log(process.env.SENDGRID_API_KEY);
      console.log(error);
      console.log(error.message);
    } else {
      console.log("Mail sent to: " + reciever);
    }
  });
};
