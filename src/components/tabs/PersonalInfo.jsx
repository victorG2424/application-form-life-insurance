import React, { useContext, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FormContext } from '../../context/FormContext';

const PersonalInfo = forwardRef(({ goToNext, updatePendingCount }, ref) => {
  const { formData, updateFormData } = useContext(FormContext);

  // Función para formatear la altura (ej: 509 -> "5'09''")
  const formatHeight = (value) => {
    if (value === "") return "";
    const numericValue = value.replace(/\D/g, "");
    if (!numericValue) return "";
    let feet = numericValue.charAt(0);
    let inches = numericValue.slice(1, 3);
    if (numericValue.length === 1) {
      return `${feet}'`;
    }
    return `${feet}'${inches}''`;
  };

  const formik = useFormik({
    initialValues: formData.personalInfo || {
      firstName: '',
      lastName: '',
      dob: '',
      height: '',
      phone: '',
      email: '',
      address: '',
      smoker: '',
      bankName: '',
      routingNumber: '',
      accountNumber: '',
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required('First name is required'),
      lastName: Yup.string().required('Last name is required'),
      dob: Yup.date().required('Date of birth is required').max(new Date(), 'Date of birth cannot be in the future'),
      height: Yup.string().required('Height is required'),
      phone: Yup.number().required('Phone is required').typeError('Must be a valid phone number'),
      email: Yup.string().email('Invalid email format').required('Email is required'),
      address: Yup.string().required('Address is required'),
      smoker: Yup.string().required('Please select if you smoke or not'),
      bankName: Yup.string().required('Bank Name is required'),
      routingNumber: Yup.string().required('Routing Number is required').matches(/^\d+$/, 'Routing Number must be numeric'),
      accountNumber: Yup.string().required('Account Number is required').matches(/^\d+$/, 'Account Number must be numeric'),
    }),
    onSubmit: (values) => {
      // Este onSubmit se puede disparar si, por alguna razón, el formulario se somete
      // de forma tradicional (ej. si el botón fuera type="submit" y no se manejara el onClick).
      // Lo principal es que actualice el contexto.
      console.log(`--- DEBUG: PersonalInfo formik.onSubmit ---`); // Cambiado el nombre para diferenciar
      console.log(`Valores de PersonalInfo que se enviarán al contexto (desde formik.onSubmit):`, JSON.stringify(values, null, 2));
      updateFormData('personalInfo', values);
      // La navegación (goToNext) ya no se llama directamente desde aquí.
      // Será manejada por Tabs.jsx a través de la prop goToNext o el onSelect.
    },
  });

  // Sincronizar Formik con datos del contexto si cambian externamente
  useEffect(() => {
    if (formData.personalInfo) {
      formik.setValues(formData.personalInfo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.personalInfo]);
  
  // Contar campos obligatorios vacíos para mostrarlo en el Tab
  useEffect(() => {
    const requiredFields = [
      'firstName', 'lastName', 'dob', 'height', 'phone',
      'email', 'address', 'smoker', 'bankName',
      'routingNumber', 'accountNumber',
    ];
    let missing = 0;
    requiredFields.forEach((field) => {
      if (!formik.values[field]) {
        missing++;
      }
    });
    updatePendingCount('personal', missing);
  }, [formik.values, updatePendingCount]);

  // Exponer la función processAndSave al componente padre (Tabs.jsx)
  useImperativeHandle(ref, () => ({
    async processAndSave() {
      try {
        const errors = await formik.validateForm();
        if (Object.keys(errors).length > 0) {
          formik.setTouched(errors, true); // Marcar campos con errores como "touched" para mostrar mensajes
          console.log(`--- DEBUG: PersonalInfo processAndSave --- Errores de validación:`, errors);
          return false; 
        }
        console.log(`--- DEBUG: PersonalInfo processAndSave --- Válido, guardando datos:`, JSON.stringify(formik.values, null, 2));
        updateFormData('personalInfo', formik.values);
        return true; 
      } catch (error) {
        console.error("Error en processAndSave de PersonalInfo:", error);
        return false;
      }
    }
  }));

  return (
    <Form onSubmit={(e) => {
      // Prevenir el submit HTML tradicional, ya que manejamos todo con Formik y refs
      e.preventDefault(); 
      // Si se quiere que el Enter en un campo haga algo, se puede llamar a formik.handleSubmit()
      // o a la función de navegación, pero es más simple deshabilitar el submit por Enter aquí
      // y depender de los botones. O, si el botón "Next Tab" fuera type="submit",
      // formik.handleSubmit() se llamaría y luego nuestro onSubmit de formik haría el updateFormData.
      // Por ahora, el botón "Next Tab" es type="button" y usa la prop goToNext.
    }}>
      <h3>Personal Information</h3>

      {/* Primera línea: First Name - Last Name - Height */}
      <div className="row">
        <div className="col-md-4">
          <Form.Group className="mb-3">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              name="firstName"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur} // Es bueno añadir onBlur para que las validaciones se muestren al salir del campo
              value={formik.values.firstName}
            />
            {formik.touched.firstName && formik.errors.firstName && (
              <div className="text-danger">{formik.errors.firstName}</div>
            )}
          </Form.Group>
        </div>
        <div className="col-md-4">
          <Form.Group className="mb-3">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              name="lastName"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.lastName}
            />
            {formik.touched.lastName && formik.errors.lastName && (
              <div className="text-danger">{formik.errors.lastName}</div>
            )}
          </Form.Group>
        </div>
        <div className="col-md-4">
          <Form.Group className="mb-3">
            <Form.Label>Height</Form.Label>
            <Form.Control
              name="height"
              type="text"
              value={formik.values.height}
              onChange={(e) => {
                const formattedHeight = formatHeight(e.target.value);
                formik.setFieldValue("height", formattedHeight);
              }}
              onBlur={formik.handleBlur} // Asegúrate de que 'height' pueda ser "touched"
            />
            {formik.touched.height && formik.errors.height && (
              <div className="text-danger">{formik.errors.height}</div>
            )}
          </Form.Group>
        </div>
      </div>

      {/* Segunda línea: Date of Birth - Email - Phone */}
      <div className="row">
        <div className="col-md-4">
          <Form.Group className="mb-3">
            <Form.Label>Date of Birth</Form.Label>
            <Form.Control
              name="dob"
              type="date"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.dob}
            />
            {formik.touched.dob && formik.errors.dob && (
              <div className="text-danger">{formik.errors.dob}</div>
            )}
          </Form.Group>
        </div>
        <div className="col-md-4">
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              name="email"
              type="email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
            />
            {formik.touched.email && formik.errors.email && (
              <div className="text-danger">{formik.errors.email}</div>
            )}
          </Form.Group>
        </div>
        <div className="col-md-4">
          <Form.Group className="mb-3">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              name="phone"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.phone}
            />
            {formik.touched.phone && formik.errors.phone && (
              <div className="text-danger">{formik.errors.phone}</div>
            )}
          </Form.Group>
        </div>
      </div>

      {/* Tercera línea: Address - Do you smoke? */}
      <div className="row">
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Address</Form.Label>
            <Form.Control
              name="address"
              as="textarea"
              rows={3}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.address}
            />
            {formik.touched.address && formik.errors.address && (
              <div className="text-danger">{formik.errors.address}</div>
            )}
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Do you smoke?</Form.Label>
            <Form.Select
              name="smoker"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.smoker}
            >
              <option value="">Select an option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </Form.Select>
            {formik.touched.smoker && formik.errors.smoker && (
              <div className="text-danger">{formik.errors.smoker}</div>
            )}
          </Form.Group>
        </div>
      </div>
      
      <h4>Bank Information</h4>
      <div className="row">
        <div className="col-md-4">
          <Form.Group className="mb-3">
            <Form.Label>Bank Name</Form.Label>
            <Form.Control
              name="bankName"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.bankName}
            />
            {formik.touched.bankName && formik.errors.bankName && (
              <div className="text-danger">{formik.errors.bankName}</div>
            )}
          </Form.Group>
        </div>
        <div className="col-md-4">
          <Form.Group className="mb-3">
            <Form.Label>Routing Number</Form.Label>
            <Form.Control
              name="routingNumber"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.routingNumber}
            />
            {formik.touched.routingNumber && formik.errors.routingNumber && (
              <div className="text-danger">{formik.errors.routingNumber}</div>
            )}
          </Form.Group>
        </div>
        <div className="col-md-4">
          <Form.Group className="mb-3">
            <Form.Label>Account Number</Form.Label>
            <Form.Control
              name="accountNumber"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.accountNumber}
            />
            {formik.touched.accountNumber && formik.errors.accountNumber && (
              <div className="text-danger">{formik.errors.accountNumber}</div>
            )}
          </Form.Group>
        </div>
      </div>

      <div>
        <Button
          type="button" // Importante: type="button"
          variant="info"
          size="sm"
          className="btn-next-tab"
          onClick={goToNext} // Esta prop 'goToNext' vendrá de Tabs.jsx y contendrá la lógica de handleNavigate
        >
          Next Tab
        </Button>
      </div>
      
    </Form>
  );
});

export default PersonalInfo;