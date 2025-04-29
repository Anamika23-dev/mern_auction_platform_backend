import nodeMailer from "nodemailer";

export const sendEmail = async ({ email, subject, message }) => {


  console.log("SMTP_HOST:", process.env.SMTP_HOST);
  console.log("SMTP_PORT:", process.env.SMTP_PORT);
  console.log("SMTP_SERVICE:", process.env.SMTP_SERVICE);
  console.log("SMTP_MAIL:", process.env.SMTP_MAIL);
  console.log("SMTP_PASSWORD:", process.env.SMTP_PASSWORD);


  const transporter = nodeMailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  const options = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject: subject,
    text: message,
  };
  await transporter.sendMail(options);
  
};
