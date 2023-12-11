const sendGridMail = require('@sendgrid/mail');
const fs = require('fs');
sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);

const date = new Date();

let day = date.getDate();
let month = date.getMonth() + 1;
let year = date.getFullYear();
let currentDate = `${day}/${month}/${year}`;

pathToAttachment = `${__dirname}/../upload/vat.pdf`;
attachment = fs.readFileSync(pathToAttachment).toString('base64');

function getOrderConfirmationEmailHtml(params) {
  return `
  <html>
    <head>
      <title>welcome</title>
    </head>
    <body>
    <div style="margin-top:32px; text-align: center">
     <img src="https://res.cloudinary.com/dlywo5mxn/image/upload/v1672851891/logo_swhdyi.png" alt="logo" width="100" height="40" />
     </div>
     <div style="font-family: sans-serif;  margin-top:32px; text-align: center"><span style="font-size: 24px"><strong>Welcome ${params.firstName}  ${params.lastName} &nbsp;</strong></span></div>
<div style="font-family: sans-serif; text-align: inherit"><br></div>
<div style="font-family: sans-serif; text-align: center">We are glad to see you at Satyal Digital Learning</div>
<div style="border-radius:6px; font-family: sans-serif; margin-top:32px;font-size:16px; text-align:center; background-color:inherit;">
                  <a href="https://www.satyaldigital.com" style="background-color:#4fbaba; border:1px solid #ffffff; border-color:#ffffff; border-radius:6px; border-width:1px; color:#ffffff; display:inline-block; font-size:14px; font-weight:normal; letter-spacing:0px; line-height:normal; padding:12px 18px 12px 18px; text-align:center; text-decoration:none; border-style:solid;" target="_blank">Welcome To Satyal Digital Learning</a>
                </div>
    </body>
  </html>
`;
}

function setResetPasswordTemplate(params) {
  return `
  <html>
    <head>
      <title>welcome</title>
    </head>
    <body>
    <div style="margin-top:32px; text-align: center">
    <img src="https://res.cloudinary.com/dlywo5mxn/image/upload/v1672851891/logo_swhdyi.png" alt="logo" width="100" height="40" />
     </div>
   
    <div style="font-family: sans-serif; text-align: inherit"><br></div>
    <div style="font-family: sans-serif; text-align: center">${params.pwdLink}</div>
    <div style="border-radius:6px; font-family: sans-serif; margin-top:32px;font-size:16px; text-align:center; background-color:inherit;">
        <a href=${params.pwdLink} style="background-color:#4fbaba; border:1px solid #ffffff; border-color:#ffffff; border-radius:6px; border-width:1px; color:#ffffff; display:inline-block; font-size:14px; font-weight:normal; letter-spacing:0px; line-height:normal; padding:12px 18px 12px 18px; text-align:center; text-decoration:none; border-style:solid;" target="_blank">Reset Password</a>
    </div>
    </body>
  </html>
`;
}

function paymentSuccessTemplate(params) {
  return `

  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="x-apple-disable-message-reformatting" />
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="color-scheme" content="light dark" />
      <meta name="supported-color-schemes" content="light dark" />
      <title>Payment Success</title>
      <style type="text/css" rel="stylesheet" media="all">    
      
      @import url("https://fonts.googleapis.com/css?family=Nunito+Sans:400,700&display=swap");
      body {
        width: 100% !important;
        height: 100%;
        margin: 0;
        -webkit-text-size-adjust: none;
      }
      
      a {
        color: #3869D4;
      }
      
      a img {
        border: none;
      }
      
      td {
        word-break: break-word;
      }
      
      .preheader {
        display: none !important;
        visibility: hidden;
        mso-hide: all;
        font-size: 1px;
        line-height: 1px;
        max-height: 0;
        max-width: 0;
        opacity: 0;
        overflow: hidden;
      }
   
      
      body,
      td,
      th {
        font-family: "Nunito Sans", Helvetica, Arial, sans-serif;
      }
      
      h1 {
        margin-top: 0;
        color: #333333;
        font-size: 22px;
        font-weight: bold;
        text-align: left;
      }
      
      h2 {
        margin-top: 0;
        color: #333333;
        font-size: 16px;
        font-weight: bold;
        text-align: left;
      }
      
      h3 {
        margin-top: 0;
        color: #333333;
        font-size: 14px;
        font-weight: bold;
        text-align: left;
      }
      
      td,
      th {
        font-size: 16px;
      }
      
      p,
      ul,
      ol,
      blockquote {
        margin: .4em 0 1.1875em;
        font-size: 16px;
        line-height: 1.625;
      }
      
      p.sub {
        font-size: 13px;
      }
    
      
      .align-right {
        text-align: right;
      }
      
      .align-left {
        text-align: left;
      }
      
      .align-center {
        text-align: center;
      }
      
      .u-margin-bottom-none {
        margin-bottom: 0;
      }
    
      
      .button {
        background-color: #3869D4;
        border-top: 10px solid #3869D4;
        border-right: 18px solid #3869D4;
        border-bottom: 10px solid #3869D4;
        border-left: 18px solid #3869D4;
        display: inline-block;
        color: #FFF;
        text-decoration: none;
        border-radius: 3px;
        box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16);
        -webkit-text-size-adjust: none;
        box-sizing: border-box;
      }
      
      .button--green {
        background-color: #22BC66;
        border-top: 10px solid #22BC66;
        border-right: 18px solid #22BC66;
        border-bottom: 10px solid #22BC66;
        border-left: 18px solid #22BC66;
      }
      
      .button--red {
        background-color: #FF6136;
        border-top: 10px solid #FF6136;
        border-right: 18px solid #FF6136;
        border-bottom: 10px solid #FF6136;
        border-left: 18px solid #FF6136;
      }
      
      @media only screen and (max-width: 500px) {
        .button {
          width: 100% !important;
          text-align: center !important;
        }
      }
    
      
      .attributes {
        margin: 0 0 21px;
      }
      
      .attributes_content {
        background-color: #F4F4F7;
        padding: 16px;
      }
      
      .attributes_item {
        padding: 0;
      }
    
      
      .related {
        width: 100%;
        margin: 0;
        padding: 25px 0 0 0;
        -premailer-width: 100%;
        -premailer-cellpadding: 0;
        -premailer-cellspacing: 0;
      }
      
      .related_item {
        padding: 10px 0;
        color: #CBCCCF;
        font-size: 15px;
        line-height: 18px;
      }
      
      .related_item-title {
        display: block;
        margin: .5em 0 0;
      }
      
      .related_item-thumb {
        display: block;
        padding-bottom: 10px;
      }
      
      .related_heading {
        border-top: 1px solid #CBCCCF;
        text-align: center;
        padding: 25px 0 10px;
      }
    
      
      .discount {
        width: 100%;
        margin: 0;
        padding: 24px;
        -premailer-width: 100%;
        -premailer-cellpadding: 0;
        -premailer-cellspacing: 0;
        background-color: #F4F4F7;
        border: 2px dashed #CBCCCF;
      }
      
      .discount_heading {
        text-align: center;
      }
      
      .discount_body {
        text-align: center;
        font-size: 15px;
      }
      /* Social Icons ------------------------------ */
      
      .social {
        width: auto;
      }
      
      .social td {
        padding: 0;
        width: auto;
      }
      
      .social_icon {
        height: 20px;
        margin: 0 8px 10px 8px;
        padding: 0;
      }
      /* Data table ------------------------------ */
      
      .purchase {
        width: 100%;
        margin: 0;
        padding: 35px 0;
        -premailer-width: 100%;
        -premailer-cellpadding: 0;
        -premailer-cellspacing: 0;
      }
      
      .purchase_content {
        width: 100%;
        margin: 0;
        padding: 25px 0 0 0;
        -premailer-width: 100%;
        -premailer-cellpadding: 0;
        -premailer-cellspacing: 0;
      }
      
      .purchase_item {
        padding: 10px 0;
        color: #51545E;
        font-size: 15px;
        line-height: 18px;
      }
      
      .purchase_heading {
        padding-bottom: 8px;
        border-bottom: 1px solid #EAEAEC;
      }
      
      .purchase_heading p {
        margin: 0;
        color: #85878E;
        font-size: 12px;
      }
      
      .purchase_footer {
        padding-top: 15px;
        border-top: 1px solid #EAEAEC;
      }
      
      .purchase_total {
        margin: 0;
        text-align: right;
        font-weight: bold;
        color: #333333;
      }
      
      .purchase_total--label {
        padding: 0 15px 0 0;
      }
      
      body {
        background-color: #F2F4F6;
        color: #51545E;
      }
      
      p {
        color: #51545E;
      }
      
      .email-wrapper {
        width: 100%;
        margin: 0;
        padding: 0;
        -premailer-width: 100%;
        -premailer-cellpadding: 0;
        -premailer-cellspacing: 0;
        background-color: #F2F4F6;
      }
      
      .email-content {
        width: 100%;
        margin: 0;
        padding: 0;
        -premailer-width: 100%;
        -premailer-cellpadding: 0;
        -premailer-cellspacing: 0;
      }
      /* Masthead ----------------------- */
      
      .email-masthead {
        padding: 25px 0;
        text-align: center;
      }
      
      .email-masthead_logo {
        width: 94px;
      }
      
      .email-masthead_name {
        font-size: 16px;
        font-weight: bold;
        color: #A8AAAF;
        text-decoration: none;
        text-shadow: 0 1px 0 white;
      }
      /* Body ------------------------------ */
      
      .email-body {
        width: 100%;
        margin: 0;
        padding: 0;
        -premailer-width: 100%;
        -premailer-cellpadding: 0;
        -premailer-cellspacing: 0;
      }
      
      .email-body_inner {
        width: 570px;
        margin: 0 auto;
        padding: 0;
        -premailer-width: 570px;
        -premailer-cellpadding: 0;
        -premailer-cellspacing: 0;
        background-color: #FFFFFF;
      }
      
      .email-footer {
        width: 570px;
        margin: 0 auto;
        padding: 0;
        -premailer-width: 570px;
        -premailer-cellpadding: 0;
        -premailer-cellspacing: 0;
        text-align: center;
      }
      
      .email-footer p {
        color: #A8AAAF;
      }
      
      .body-action {
        width: 100%;
        margin: 30px auto;
        padding: 0;
        -premailer-width: 100%;
        -premailer-cellpadding: 0;
        -premailer-cellspacing: 0;
        text-align: center;
      }
      
      .body-sub {
        margin-top: 25px;
        padding-top: 25px;
        border-top: 1px solid #EAEAEC;
      }
      
      .content-cell {
        padding: 45px;
      }
      /*Media Queries ------------------------------ */
      
      @media only screen and (max-width: 600px) {
        .email-body_inner,
        .email-footer {
          width: 100% !important;
        }
      }
      
      @media (prefers-color-scheme: dark) {
        body,
        .email-body,
        .email-body_inner,
        .email-content,
        .email-wrapper,
        .email-masthead,
        .email-footer {
          background-color: #333333 !important;
          color: #FFF !important;
        }
        p,
        ul,
        ol,
        blockquote,
        h1,
        h2,
        h3,
        span,
        .purchase_item {
          color: #FFF !important;
        }
        .attributes_content,
        .discount {
          background-color: #222 !important;
        }
        .email-masthead_name {
          text-shadow: none !important;
        }
      }
      
      :root {
        color-scheme: light dark;
        supported-color-schemes: light dark;
      }
      </style>
      <!--[if mso]>
      <style type="text/css">
        .f-fallback  {
          font-family: Arial, sans-serif;
        }
      </style>
    <![endif]-->
    </head>
    <body>
      <span class="preheader">This is an invoice for your purchase on ${currentDate}. </span>
      <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td align="center">
            <table class="email-content" width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td class="email-masthead">
                  <a href="https://example.com" class="f-fallback email-masthead_name">
                Monthly Subscription
                </a>
                </td>
              </tr>
              <!-- Email Body -->
              <tr>
                <td class="email-body" width="570" cellpadding="0" cellspacing="0">
                  <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                    <!-- Body content -->
                    <tr>
                      <td class="content-cell">
                        <div class="f-fallback">
                          <h1>Hi Aryan,</h1>
                          <p>Thanks for purchasing Satyal Learning Course. This is an invoice for your recent purchase.</p>
                          <table class="attributes" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td class="attributes_content">
                                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                <td class="attributes_item">
                                  <span class="f-fallback">
            <strong>Payment ID:</strong> TYHSTR1244TYU
          </span>
                                </td>
                              </tr>
                                  <tr>
                                    <td class="attributes_item">
                                      <span class="f-fallback">
                <strong>Amount:</strong> 1500
              </span>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td class="attributes_item">
                                      <span class="f-fallback">
                <strong>Date:</strong> ${currentDate}
              </span>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                          <!-- Action -->
                         
                         
                          <p>If you have any questions about this invoice, simply reply to this email or reach out to our support team for help.</p>
                          <p>Cheers,
                            <br>The Satyal Learning Team</p>
                          <!-- Sub copy -->
                          <table class="body-sub" role="presentation">
                            <tr>
                              <td>
                                <p class="f-fallback sub">If you’re having trouble with the button above, copy and paste the URL below into your web browser.</p>
                                <p class="f-fallback sub">{{action_url}}</p>
                              </td>
                            </tr>
                          </table>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td>
                  <table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td class="content-cell" align="center">
                        <p class="f-fallback sub align-center">
                        Satyal Group
                          <br>1234 Street Rd.
                          <br>Kathmandu - Nepal
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>

`;
}

function getMessage(emailParams) {
  return {
    to: emailParams.email,
    from: 'anand.k.rajneesh@hotmail.com',
    subject: 'Welcome to Satyal Digital Learning',
    text: `Welcome ${emailParams.firstName}  ${emailParams.lastName} , We are glad to see you at Satyal Digital Learning`,
    html: getOrderConfirmationEmailHtml(emailParams),
  };
}

function resetPasswordMessage(emailParams) {
  return {
    to: emailParams.email,
    from: 'prasannakkoirala@outlook.com',
    subject: 'Satyal Digital Learning Reset Password Link',
    text: 'Click here to reset your password',
    html: setResetPasswordTemplate(emailParams),
  };
}

function paymentSuccessMessage(emailParams) {
  return {
    // to: 'aryan@satyalgroup.com',
    to: 'testpk@mailsac.com',
    from: 'prasannakkoirala@outlook.com',
    subject: 'Thank you for purchasing Satyal Digital Plan',
    text: 'Payment Successful',
    html: paymentSuccessTemplate(emailParams),
    attachments: [
      {
        content: attachment,
        filename: 'vat.pdf',
        type: 'application/pdf',
        disposition: 'attachment',
      },
    ],
  };
}

async function sendEmail(emailParams) {
  console.log(emailParams);
  try {
    await sendGridMail.send(getMessage(emailParams));
    return {
      message: 'success',
    };
  } catch (error) {
    const message = 'failed';
    console.error(message);
    console.error(error);
    if (error.response) {
      console.error(error.response.body);
    }
    return { message };
  }
}

async function sendPasswordResetEmail(emailParams) {
  try {
    await sendGridMail.send(resetPasswordMessage(emailParams));
    return {
      message: 'success',
    };
  } catch (error) {
    const message = 'failed';
    console.error(message);
    console.error(error);
    if (error.response) {
      console.error(error.response.body);
    }
    return { message };
  }
}

async function paymentSuccess(emailParams) {
  try {
    await sendGridMail.send(paymentSuccessMessage(emailParams));
    return {
      message: 'success',
    };
  } catch (error) {
    const message = 'failed';
    console.error(message);
    console.error(error);
    if (error.response) {
      console.error(error.response.body);
    }
    return { message };
  }
}

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  paymentSuccess,
};
