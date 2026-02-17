// for mail we use nodemailer package,,for this we need to install "    npm install nodemailer" and its types "npm i --save-dev @types/nodemailer"
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service:"gmail",
  auth: {
    user:process.env.EMAIL,
    pass:process.env.PASS,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
await transporter.sendMail({
  from:`"SnapCart" <${process.env.EMAIL}>`,
  to,
  subject,
  html,
})
}