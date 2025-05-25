// functions/index.js

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions");
const axios = require("axios");
const { initializeApp } = require("firebase-admin/app");

initializeApp();

exports.sendApplicationEmail = onCall(
  { 
    region: "us-central1",
    cors: true, 
  }, 
  async (request) => { // <--- 'request' se usa aquí abajo
    const apiKey = process.env.BREVO_KEY; 

    if (!apiKey) {
      logger.error("FATAL: La variable de entorno BREVO_KEY no está configurada en el servidor de la función. Asegúrate de haberla establecido y redesplegado.");
      throw new HttpsError(
        "internal",
        "Error de configuración del servidor: Falta la API Key de Brevo. Contacta al administrador."
      );
    }

    // Aquí se usa request.data
    const { to, subject, htmlContent } = request.data;

    if (!to || !subject || !htmlContent) {
      logger.error("Error: Faltan datos en la solicitud.", { data: request.data });
      throw new HttpsError(
        "invalid-argument",
        "Faltan datos para enviar el correo (to, subject, htmlContent)."
      );
    }

    const emailPayload = {
      sender: { name: "Life Insurance App", email: "contactus@financiegroup.com" },
      to: to,
      subject,
      htmlContent,
    };

    try {
      await axios.post("https://api.brevo.com/v3/smtp/email", emailPayload, {
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });
      
      logger.info("Correo enviado correctamente a:", JSON.stringify(to));
      return { success: true, message: "Correo enviado correctamente." };

    } catch (error) {
      const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
      logger.error("Error al enviar correo a Brevo desde la Cloud Function:", errorMessage);
      throw new HttpsError(
        "internal",
        `Ocurrió un error al enviar el correo: ${errorMessage}`
      );
    }
  }
);