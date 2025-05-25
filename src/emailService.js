import axios from "axios";

const API_KEY = import.meta.env.VITE_BREVO_API_KEY; // Asegúrate de que esta variable está definida

export async function sendEmail({ to, subject, text, html }) {
  try {
    console.log("Usando API Key:", API_KEY); // Para depurar, verifica que no sea undefined

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "Insurance Life Form", email: "contactus@financiegroup.com" },
        to: [{ email: to }],
        subject,
        textContent: text,
        htmlContent: html,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": API_KEY,  // Asegúrate de que aquí es "api-key" y no "x-api-key"
          "Accept": "application/json"
        },
      }
    );

    console.log("Correo enviado correctamente:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error al enviar correo:", error.response ? error.response.data : error.message);
    throw error;
  }
}
