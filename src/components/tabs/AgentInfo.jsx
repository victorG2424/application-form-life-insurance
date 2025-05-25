// src/components/tabs/AgentInfo.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FormContext } from '../../context/FormContext';
import { db } from '../../firebase'; // Ya tienes esto
import { collection, addDoc } from 'firebase/firestore';
// ¡CAMBIO IMPORTANTE! Importamos las herramientas de Firebase Functions
import { getFunctions, httpsCallable } from 'firebase/functions';
import { newApplicationEmail } from "../../emailTemplates/newApplicationEmail";

const AgentInfo = ({ updatePendingCount }) => {
  const { formData, resetFormData } = useContext(FormContext);
  const [showModal, setShowModal] = useState(false);

  const validationSchema = Yup.object({
    agentName: Yup.string().required('Agent name is required'),
    agentEmail: Yup.string().email('Invalid email').required('Agent email is required'),
    agentPhone: Yup.string().required('Agent phone is required'),
    split: Yup.string().oneOf(['Yes', 'No']).required('Select Yes or No for split'),
    secondAgentEmail: Yup.lazy((value, { parent }) => {
      if (parent.split === 'Yes') {
        return Yup.string().email('Invalid email').required('Second agent email is required');
      }
      return Yup.string().notRequired();
    }),
    secondAgentPhone: Yup.lazy((value, { parent }) => {
      if (parent.split === 'Yes') {
        return Yup.string().required('Second agent phone is required');
      }
      return Yup.string().notRequired();
    }),
  });

  const formik = useFormik({
    initialValues: {
      agentName: '',
      agentEmail: '',
      agentPhone: '',
      split: 'No',
      secondAgentEmail: '',
      secondAgentPhone: '',
    },
    validationSchema,
    // ¡CAMBIO IMPORTANTE EN onSubmit!
    onSubmit: async (values) => {
      console.log("--- DEBUG: AgentInfo onSubmit ---");
      
      try {
        const finalData = {
          personalInfo: formData.personalInfo || {},
          professionalInfo: formData.professionalInfo || {},
          immigrationInfo: formData.immigrationInfo || {},
          insuranceInfo: formData.insuranceInfo || {},
          relativesInfo: formData.relativesInfo || {},
          agentInfo: values,
        };

        // 1. Guardar en Firestore (esto no cambia)
        const docRef = await addDoc(collection(db, 'applications'), finalData);
        console.log(`Documento guardado con ID: ${docRef.id}`);

        // 2. Preparar y llamar a la Cloud Function para enviar el correo
        const functions = getFunctions();
        // Asegúrate que el nombre 'sendApplicationEmail' coincida exactamente
        // con el nombre de la función que exportaste en functions/index.js
        const callSendApplicationEmail = httpsCallable(functions, 'sendApplicationEmail'); 
        
        const emailBody = newApplicationEmail(finalData);
        
        // Preparamos la lista de destinatarios para la Cloud Function
        // La Cloud Function espera un array de objetos email para el campo 'to'
        const recipients = [{ email: values.agentEmail }];
        if (values.split === 'Yes' && values.secondAgentEmail) {
          recipients.push({ email: values.secondAgentEmail });
        }

        const emailData = {
          to: recipients, // Enviamos el array de destinatarios
          subject: 'New Life Insurance Application',
          htmlContent: emailBody, // Asegúrate que la Cloud Function espere 'htmlContent'
        };

        // Llamamos a la Cloud Function
        await callSendApplicationEmail(emailData); 
        console.log("Llamada a Cloud Function 'sendApplicationEmail' realizada.");

        setShowModal(true);
      } catch (error) {
        console.error('Error guardando o enviando correo vía Cloud Function:', error);
        // Puedes mostrar un error más específico si la función lo devuelve
        const errorMessage = error.details ? error.details.message : error.message;
        alert(`Ocurrió un error: ${errorMessage}. Revisa la consola para más detalles.`);
      }
    },
  });

  const handleModalClose = () => {
    setShowModal(false);
    resetFormData();
    formik.resetForm();
    window.location.reload();
  };
  
  useEffect(() => {
    let missing = 0;
    const {
      agentName, agentEmail, agentPhone, split,
      secondAgentEmail, secondAgentPhone,
    } = formik.values;

    if (!agentName) missing++;
    if (!agentEmail) missing++;
    if (!agentPhone) missing++;
    if (!split) missing++; 

    if (split === 'Yes') {
      if (!secondAgentEmail) missing++;
      if (!secondAgentPhone) missing++;
    }

    updatePendingCount('agent', missing);
  }, [formik.values, updatePendingCount]);

  const clientName = formData.personalInfo
    ? `${formData.personalInfo.firstName || ''} ${formData.personalInfo.lastName || ''}`.trim()
    : 'the client';

  return (
    <>
      <Form onSubmit={formik.handleSubmit}>
        <h3>Agent Information</h3>
        
        <Form.Group className="mb-3">
          <Form.Label>Agent Name</Form.Label>
          <Form.Control
            name="agentName"
            type="text"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.agentName}
          />
          {formik.touched.agentName && formik.errors.agentName && (
            <div className="text-danger">{formik.errors.agentName}</div>
          )}
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Agent Email</Form.Label>
          <Form.Control
            name="agentEmail"
            type="email"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.agentEmail}
          />
          {formik.touched.agentEmail && formik.errors.agentEmail && (
            <div className="text-danger">{formik.errors.agentEmail}</div>
          )}
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Agent Phone</Form.Label>
          <Form.Control
            name="agentPhone"
            type="text"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.agentPhone}
          />
          {formik.touched.agentPhone && formik.errors.agentPhone && (
            <div className="text-danger">{formik.errors.agentPhone}</div>
          )}
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Split</Form.Label>
          <Form.Select
            name="split"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.split}
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </Form.Select>
          {formik.touched.split && formik.errors.split && (
            <div className="text-danger">{formik.errors.split}</div>
          )}
        </Form.Group>
        
        {formik.values.split === 'Yes' && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Second Agent Email</Form.Label>
              <Form.Control
                name="secondAgentEmail"
                type="email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.secondAgentEmail}
              />
              {formik.touched.secondAgentEmail && formik.errors.secondAgentEmail && (
                <div className="text-danger">{formik.errors.secondAgentEmail}</div>
              )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Second Agent Phone</Form.Label>
              <Form.Control
                name="secondAgentPhone"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.secondAgentPhone}
              />
              {formik.touched.secondAgentPhone && formik.errors.secondAgentPhone && (
                <div className="text-danger">{formik.errors.secondAgentPhone}</div>
              )}
            </Form.Group>
          </>
        )}
        
        <div>
          <Button type="submit" variant="success" size="sm" className="btn-resend-email">
            Save
          </Button>
        </div>
      </Form>

      <Modal show={showModal} onHide={handleModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Successful</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
          The client <strong>{clientName}</strong> has been successfully created. A confirmation email has been sent to <strong>{formik.values.agentEmail}</strong>
            {formik.values.split === 'Yes' && formik.values.secondAgentEmail
              ? ` and forwarded to the second agent ${formik.values.secondAgentEmail}.`
              : '.'}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" size="sm" className="btn-resend-email" onClick={handleModalClose}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AgentInfo;