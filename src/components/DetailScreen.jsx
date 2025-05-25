// src/components/DetailScreen.jsx
import React, { useEffect, useState } from 'react';
import { Container, Card, Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import NavBar from './Navbar';
import "../styles/Navbar.css";

// Función para formatear las claves (sin cambios)
const formatKey = (key) => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
};

// Componente auxiliar para mostrar una categoría de información (sin cambios)
const CategoryDetails = ({ title, data, order = [] }) => {
  if (!data || Object.keys(data).length === 0) return null;

  const entries = order.length > 0
    ? order.map(key => [key, data[key]]).filter(([, value]) => value && value !== "N/A")
    : Object.entries(data).filter(([, value]) => value && value !== "N/A");

  if (entries.length === 0) return null;

  return (
    <Card className="mb-3">
      <Card.Header><strong>{title}</strong></Card.Header>
      <Card.Body>
        {entries.map(([key, value]) => (
          <p key={key}>
            <strong>{formatKey(key)}:</strong> {String(value)}
          </p>
        ))}
      </Card.Body>
    </Card>
  );
};

// ======================================================
// ========= INICIO: NUEVO COMPONENTE AÑADIDO ===========
// ======================================================

// Componente específico para mostrar la información de familiares y beneficiarios
const RelativesDetails = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  const beneficiaries = data.beneficiaries || [];

  return (
    <Card className="mb-3">
      <Card.Header><strong>Relatives Information</strong></Card.Header>
      <Card.Body>
        <h5 className="mb-3">Beneficiaries</h5>
        {beneficiaries.length > 0 ? (
          beneficiaries.map((beneficiary, index) => (
            <Card key={index} className="mb-2">
              <Card.Body style={{ padding: '1rem' }}>
                <h6><strong>Beneficiary #{index + 1}</strong></h6>
                <p className="mb-1"><strong>Full Name:</strong> {beneficiary.fullName || 'N/A'}</p>
                <p className="mb-1"><strong>Date of Birth:</strong> {beneficiary.dob || 'N/A'}</p>
                <p className="mb-0"><strong>Relationship:</strong> {beneficiary.relationship || 'N/A'}</p>
              </Card.Body>
            </Card>
          ))
        ) : (
          <p>No beneficiaries listed.</p>
        )}

        <hr />

        <h5 className="mt-4 mb-3">Parent Information</h5>
        <Row>
          <Col md={6}>
            <h6><strong>Mother</strong></h6>
            <p className="mb-1"><strong>Is living?:</strong> {data.motherLiving || 'N/A'}</p>
            {data.motherLiving === 'Yes' && <p className="mb-1"><strong>Age:</strong> {data.motherAge || 'N/A'}</p>}
            {data.motherLiving === 'No' && (
              <>
                <p className="mb-1"><strong>Age at Death:</strong> {data.motherAgeAtDeath || 'N/A'}</p>
                <p className="mb-1"><strong>Cause of Death:</strong> {data.motherCauseOfDeath || 'N/A'}</p>
              </>
            )}
          </Col>
          <Col md={6}>
            <h6><strong>Father</strong></h6>
            <p className="mb-1"><strong>Is living?:</strong> {data.fatherLiving || 'N/A'}</p>
            {data.fatherLiving === 'Yes' && <p className="mb-1"><strong>Age:</strong> {data.fatherAge || 'N/A'}</p>}
            {data.fatherLiving === 'No' && (
              <>
                <p className="mb-1"><strong>Age at Death:</strong> {data.fatherAgeAtDeath || 'N/A'}</p>
                <p className="mb-1"><strong>Cause of Death:</strong> {data.fatherCauseOfDeath || 'N/A'}</p>
              </>
            )}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};
// ======================================================
// ============ FIN: NUEVO COMPONENTE AÑADIDO ===========
// ======================================================


function DetailScreen() {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientDetail = async () => {
      try {
        if (!id) return;
        const docRef = doc(db, 'applications', id);
        const docSnap = await getDoc(docRef);
        setClientData(docSnap.exists() ? docSnap.data() : null);
      } catch (error) {
        console.error("Error fetching document:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClientDetail();
  }, [id]);

  if (loading) {
    return <Container className="text-center my-5">Loading...</Container>;
  }

  if (!clientData) {
    return (
      <Container className="text-center my-5 text-danger">
        No data found for this client.
      </Container>
    );
  }

  // Extraemos los datos por categoría
  const personalData = clientData.personalInfo || {};
  const professionalData = clientData.professionalInfo || {};
  const immigrationData = clientData.immigrationInfo || {};
  const insuranceData = clientData.insuranceInfo || {};
  const agentData = clientData.agentInfo || {};
  // ========= INICIO: CAMBIO - Extraemos los datos de familiares ========
  const relativesData = clientData.relativesInfo || {};
  // ========= FIN: CAMBIO ========

  // Definimos el orden para cada categoría
  const personalOrder = ["firstName", "lastName", "dob", "email", "phone", "address", "height", "smoker", "bankName", "routingNumber", "accountNumber"];
  const professionalOrder = ["occupation", "annualSalary", "employerName", "employerAddress", "employerPhone"];
  const immigrationOrder = ["type", "noTaxId", "taxIdNumber", "idType", "ssnResident", "ssnCitizen", "greenCardNumber", "licenseResident", "licenseCitizen", "documentType", "documentNumber"];
  const insuranceOrder = ["lifeInsuranceCompany", "plan", "monthlyPremium", "deathBenefit", "otherPolicies", "insuranceType", "finalExpenses", "coverage", "medicalCondition"];
  const agentOrder = ["agentName", "agentEmail", "agentPhone", "split", "secondAgentEmail", "secondAgentPhone"];

  return (
    <>
      <NavBar />
      <Container className="my-4">
        <h2 className="text-center mb-4">Client Detail</h2>

        <Row>
          <Col md={6}>
            <CategoryDetails title="Personal Information" data={personalData} order={personalOrder} />
            <CategoryDetails title="Immigration Information" data={immigrationData} order={immigrationOrder} />
          </Col>
          <Col md={6}>
            <CategoryDetails title="Professional Information" data={professionalData} order={professionalOrder} />
            <CategoryDetails title="Insurance Information" data={insuranceData} order={insuranceOrder} />
          </Col>
        </Row>

        {/* ========= INICIO: CAMBIO - Nueva fila para mostrar los datos de familiares ======== */}
        <Row>
          <Col>
            <RelativesDetails data={relativesData} />
          </Col>
        </Row>
        {/* ========= FIN: CAMBIO ======== */}
        
        <Row>
          <Col>
            <CategoryDetails title="Agent Information" data={agentData} order={agentOrder} />
          </Col>
        </Row>

      </Container>
    </>
  );
}

export default DetailScreen;