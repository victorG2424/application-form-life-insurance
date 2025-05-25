import nodemailer from 'nodemailer';
// src/config/mailConfig.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.HOSTINGER_SMTP_HOST,
  port: process.env.HOSTINGER_SMTP_PORT,
  secure: process.env.HOSTINGER_SMTP_PORT == 465, // si el puerto es 465, se usa SSL
  auth: {
    user: process.env.HOSTINGER_EMAIL_USER,
    pass: process.env.HOSTINGER_EMAIL_PASS,
  },
});

async function sendEmail({ to, subject, text, html }) {
  try {
    const mailOptions = {
      from: process.env.HOSTINGER_EMAIL_USER,
      to,
      subject,
      text,
      html,
    };
    await transporter.sendMail(mailOptions);
    console.log('Correo enviado con éxito');
  } catch (error) {
    console.error('Error al enviar correo:', error);
  }
}

module.exports = sendEmail;
