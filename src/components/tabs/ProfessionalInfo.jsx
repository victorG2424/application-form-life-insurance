import React, { useContext, useEffect, useImperativeHandle, forwardRef } from 'react'; // Añadidos useImperativeHandle, forwardRef
import { Form, Button } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FormContext } from '../../context/FormContext';

// Envuelve el componente con forwardRef y recibe 'ref' como segundo argumento
const ProfessionalInfo = forwardRef(({ goToNext, updatePendingCount }, ref) => {
  const { formData, updateFormData } = useContext(FormContext);

  const formatCurrencyOnBlur = (value) => {
    const numericValue = value.replace(/\D/g, "");
    if (!numericValue) return "";
    const number = parseFloat(numericValue);
    if (isNaN(number)) return "";
    return number.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formik = useFormik({
    initialValues: formData.professionalInfo || {
      occupation: '',
      employerName: '',
      employerAddress: '',
      employerPhone: '',
      annualSalary: '',
    },
    validationSchema: Yup.object({
      occupation: Yup.string().required('Occupation is required'),
      employerName: Yup.string().required("Employer's Name is required"),
      employerAddress: Yup.string().required("Employer's Address is required"),
      employerPhone: Yup.string()
        .required("Employer's Phone is required")
        .matches(/^\d+$/, 'Phone must be digits only'),
      annualSalary: Yup.string()
        .required('Approximate Annual Salary is required')
        .matches(
          /^\$?\d{1,3}(,\d{3})*(\.\d{2})?$/, // Permite el símbolo de dólar al inicio opcional
          'Salary format should be like $60,000.00 or 60,000.00',
        ),
    }),
    onSubmit: (values) => {
      console.log(`--- DEBUG: ProfessionalInfo formik.onSubmit ---`);
      console.log(`Valores de ProfessionalInfo que se enviarán al contexto (desde formik.onSubmit):`, JSON.stringify(values, null, 2));
      updateFormData('professionalInfo', values);
      // La navegación (goToNext) ya no se llama directamente desde aquí.
    },
  });

  // Sincronizar Formik con datos del contexto
  useEffect(() => {
    if (formData.professionalInfo) {
      formik.setValues(formData.professionalInfo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.professionalInfo]);

  // useEffect para calcular cuántos campos obligatorios faltan
  useEffect(() => {
    const requiredFields = [
      'occupation',
      'employerName',
      'employerAddress',
      'employerPhone',
      'annualSalary',
    ];
    let missing = 0;
    requiredFields.forEach((field) => {
      if (!formik.values[field]) missing++;
    });
    updatePendingCount('professional', missing);
  }, [formik.values, updatePendingCount]);

  // Exponer la función processAndSave al componente padre (Tabs.jsx)
  useImperativeHandle(ref, () => ({
    async processAndSave() {
      try {
        const errors = await formik.validateForm();
        if (Object.keys(errors).length > 0) {
          formik.setTouched(errors, true);
          console.log(`--- DEBUG: ProfessionalInfo processAndSave --- Errores de validación:`, errors);
          return false; 
        }
        // Antes de guardar, formatear el salario si es necesario (si el usuario no salió del campo)
        // O asegurarse que el valor que se guarda es el numérico si se prefiere.
        // Por simplicidad, aquí guardamos lo que está en formik.values, que ya debería estar formateado por el onBlur.
        console.log(`--- DEBUG: ProfessionalInfo processAndSave --- Válido, guardando datos:`, JSON.stringify(formik.values, null, 2));
        updateFormData('professionalInfo', formik.values);
        return true; 
      } catch (error) {
        console.error("Error en processAndSave de ProfessionalInfo:", error);
        return false;
      }
    }
  }));

  return (
    <Form onSubmit={(e) => e.preventDefault()}>
      <h3>Professional Information</h3>

      <div className="row">
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Occupation</Form.Label>
            <Form.Control
              name="occupation"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.occupation}
            />
            {formik.touched.occupation && formik.errors.occupation && (
              <div className="text-danger">{formik.errors.occupation}</div>
            )}
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Approximate Annual Salary</Form.Label>
            <Form.Control
              name="annualSalary"
              type="text" // Se mantiene como texto para permitir el formateo
              value={formik.values.annualSalary}
              onChange={(e) => {
                // Guardar el valor crudo (solo números) o permitir que el usuario escriba
                // Si se quiere una experiencia más guiada, aquí se podrían restringir los caracteres.
                // Por ahora, el formateo principal ocurre en onBlur.
                formik.handleChange(e); // Permitir que Formik maneje el cambio
              }}
              onBlur={(e) => {
                // Primero, ejecutar el onBlur de Formik para marcar como touched
                formik.handleBlur(e); 
                // Luego, aplicar el formateo
                const formattedValue = formatCurrencyOnBlur(e.target.value);
                formik.setFieldValue("annualSalary", formattedValue);
              }}
            />
            {formik.touched.annualSalary && formik.errors.annualSalary && (
              <div className="text-danger">{formik.errors.annualSalary}</div>
            )}
          </Form.Group>
        </div>
      </div>

      <div className="row">
        <div className="col-md-4">
          <Form.Group className="mb-3">
            <Form.Label>Employer's Name</Form.Label>
            <Form.Control
              name="employerName"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.employerName}
            />
            {formik.touched.employerName && formik.errors.employerName && (
              <div className="text-danger">{formik.errors.employerName}</div>
            )}
          </Form.Group>
        </div>
        <div className="col-md-4">
          <Form.Group className="mb-3">
            <Form.Label>Employer's Address</Form.Label>
            <Form.Control
              name="employerAddress"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.employerAddress}
            />
            {formik.touched.employerAddress && formik.errors.employerAddress && (
              <div className="text-danger">{formik.errors.employerAddress}</div>
            )}
          </Form.Group>
        </div>
        <div className="col-md-4">
          <Form.Group className="mb-3">
            <Form.Label>Employer's Phone</Form.Label>
            <Form.Control
              name="employerPhone"
              type="text" // Aunque la validación espera dígitos, el input type="text" es más flexible
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.employerPhone}
            />
            {formik.touched.employerPhone && formik.errors.employerPhone && (
              <div className="text-danger">{formik.errors.employerPhone}</div>
            )}
          </Form.Group>
        </div>
      </div>

      <div>
        <Button
          type="button" // Cambiado
          variant="info"
          size="sm"
          className="btn-next-tab"
          onClick={goToNext} // Esta prop vendrá de Tabs.jsx
        >
          Next Tab
        </Button>
      </div>
    </Form>
  );
});

export default ProfessionalInfo;