// src/components/ClientList.jsx
import React, { useEffect, useState } from 'react';
import { Table, Button, Container, Form } from 'react-bootstrap';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import axios from 'axios';
import { newApplicationEmail } from "../emailTemplates/newApplicationEmail";
import { useNavigate } from "react-router-dom";
import NavBar from './Navbar';
import '../styles/ClientList.css';
import "../styles/Navbar.css";


const handleResendEmail = async (clientData) => {
  try {
    const emailBody = newApplicationEmail(clientData, clientData.agentInfo);
    const emailPayload = {
      sender: { name: "Life Insurance App", email: "contactus@financiegroup.com" },
      to: [{ email: clientData.agentInfo.agentEmail, name: clientData.agentInfo.agentName }],
      subject: "Resend: Life Insurance Application",
      htmlContent: emailBody,
    };

    if (clientData.agentInfo.split === 'Yes') {
      emailPayload.to.push({ email: clientData.agentInfo.secondAgentEmail, name: "Second Agent" });
    }

    await axios.post("https://api.brevo.com/v3/smtp/email", emailPayload, {
      headers: {
        "api-key": import.meta.env.VITE_BREVO_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
      }
    });

    alert("Correo reenviado correctamente");
  } catch (error) {
    console.error("Error reenviando el email con Brevo:", error);
    alert("Hubo un error al reenviar el correo.");
  }
};

function ClientList() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'applications'));
        const clientsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setClients(clientsData);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };

    fetchClients();
  }, []);

  // Filtrar clientes en base a la búsqueda
  const filteredClients = clients.filter(client =>
    (client.personalInfo?.firstName || '').toLowerCase().includes(search.toLowerCase()) ||
    (client.personalInfo?.lastName || '').toLowerCase().includes(search.toLowerCase()) ||
    (client.agentInfo?.agentName || '').toLowerCase().includes(search.toLowerCase())
  );

  const navigate = useNavigate(); // Usa el hook para navegación

  return (
    <>
      <NavBar />
      <Container>
        <div className="search-container">
          <Form.Control
            type="text"
            placeholder="Search by Name, Last Name, or Agent Name"
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="client-card">
          <Table className="client-table" responsive>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Agent Name</th>
                <th>Split</th>
                <th>View Detail</th>
                <th>Resend Email</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map(client => (
                <tr key={client.id}>
                  <td>{client.personalInfo?.firstName || 'N/A'}</td>
                  <td>{client.personalInfo?.lastName || 'N/A'}</td>
                  <td>{client.personalInfo?.email || 'N/A'}</td>
                  <td>{client.personalInfo?.phone || 'N/A'}</td>
                  <td>{client.agentInfo?.agentName || 'N/A'}</td>
                  <td>{client.agentInfo?.split || 'No'}</td>
                  <td>


                    <Button
                    className="btn-view-detail"
                    size="sm"
                    variant="info"
                    onClick={() => navigate(`/clients/${client.id}`)} // Redirige al detalle con el ID
                    >
                    View Detail
                    </Button>
                  </td>
                  <td>
                    <Button className="btn-resend-email" size="sm" variant="success" onClick={() => handleResendEmail(client)}>
                      Resend Email
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Container>
    </>
  );
}

export default ClientList;
