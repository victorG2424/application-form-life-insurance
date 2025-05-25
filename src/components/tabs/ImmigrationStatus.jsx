import React, { useContext, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FormContext } from '../../context/FormContext';

const ImmigrationStatus = forwardRef(({ goToNext, updatePendingCount }, ref) => {
  const formatSSN = (value) => {
    const numericValue = value.replace(/\D/g, "");
    if (!numericValue) return "";
    const limitedValue = numericValue.slice(0, 9);
    let formattedSSN = limitedValue;
    if (limitedValue.length > 3 && limitedValue.length <= 5) {
      formattedSSN = `${limitedValue.slice(0, 3)}-${limitedValue.slice(3)}`;
    } else if (limitedValue.length > 5) {
      formattedSSN = `${limitedValue.slice(0, 3)}-${limitedValue.slice(3, 5)}-${limitedValue.slice(5)}`;
    }
    return formattedSSN;
  };
  
  const { formData, updateFormData } = useContext(FormContext);

  const validationSchema = Yup.object({
    type: Yup.string().required('Please select an immigration status'),
    ssnCitizen: Yup.lazy((value, { parent }) => {
      if (parent.type === 'Citizen') {
        return Yup.string()
          .required('SSN is required for Citizen')
          .matches(/^\d{3}-\d{2}-\d{4}$/, 'SSN must be in format XXX-XX-XXXX');
      }
      return Yup.string().notRequired();
    }),
    ssnResident: Yup.lazy((value, { parent }) => {
      if (parent.type === 'Resident') {
        return Yup.string()
          .required('SSN is required for Resident')
          .matches(/^\d{3}-\d{2}-\d{4}$/, 'SSN must be in format XXX-XX-XXXX');
      }
      return Yup.string().notRequired();
    }),
    greenCardNumber: Yup.lazy((value, { parent }) => {
      if (parent.type === 'Resident') {
        return Yup.string().required('Green Card Number is required');
      }
      return Yup.string().notRequired();
    }),
    licenseCitizen: Yup.lazy((value, { parent }) => {
      if (parent.type === 'Citizen') {
        return Yup.string().required('License is required for Citizen');
      }
      return Yup.string().notRequired();
    }),
    licenseResident: Yup.lazy((value, { parent }) => {
      if (parent.type === 'Resident') {
        return Yup.string().required('License is required for Resident');
      }
      return Yup.string().notRequired();
    }),
    noTaxId: Yup.boolean().default(false),
    idType: Yup.lazy((value, { parent }) => { // Este campo se usa en el formulario para 'None'
      if (parent.type === 'None' && parent.noTaxId === true) {
        return Yup.string().required('Please select an ID type');
      }
      return Yup.string().notRequired();
    }),
    taxIdNumber: Yup.lazy((value, { parent }) => {
      if (parent.type === 'None' && parent.noTaxId === false) {
        return Yup.string().required('Tax ID Number is required');
      }
      return Yup.string().notRequired();
    }),
    licenseNone: Yup.lazy((value, { parent }) => { // Este campo se usa en el formulario para 'None'
      if (parent.type === 'None' && parent.noTaxId === true && parent.idType === 'License') {
        return Yup.string().required('License is required for Non-resident');
      }
      return Yup.string().notRequired();
    }),
    passportCountry: Yup.lazy((value, { parent }) => { // Este campo se usa en el formulario para 'None'
      if (parent.type === 'None' && parent.noTaxId === true && parent.idType === 'Passport') {
        return Yup.string().required('Passport Country is required');
      }
      return Yup.string().notRequired();
    }),
    passportNumber: Yup.lazy((value, { parent }) => { // Este campo se usa en el formulario para 'None'
      if (parent.type === 'None' && parent.noTaxId === true && parent.idType === 'Passport') {
        return Yup.string().required('Passport Number is required');
      }
      return Yup.string().notRequired();
    }),
    // Considera añadir validaciones para documentType y documentNumber si son obligatorios
    documentType: Yup.lazy((value, { parent }) => {
      if (parent.type === 'None') { // Ejemplo: requerido si type es 'None'
        // return Yup.string().required('Document Type is required');
      }
      return Yup.string().notRequired(); // Ajusta según tus reglas
    }),
    documentNumber: Yup.lazy((value, { parent }) => {
      if (parent.type === 'None') { // Ejemplo: requerido si type es 'None'
        // return Yup.string().required('Document Number is required');
      }
      return Yup.string().notRequired(); // Ajusta según tus reglas
    }),
  });

  const formik = useFormik({
    initialValues: formData.immigrationInfo || {
      type: '',
      ssnCitizen: '',
      ssnResident: '',
      greenCardNumber: '',
      licenseCitizen: '',
      licenseResident: '',
      noTaxId: false,
      taxIdNumber: '',
      idType: '', // Asegúrate de que este campo esté en initialValues si se usa en el form
      licenseNone: '', // Y este
      passportCountry: '', // Y este
      passportNumber: '', // y este
      documentType: '',
      documentNumber: '',
    },
    validationSchema,
    onSubmit: (values) => {
      console.log(`--- DEBUG: ImmigrationStatus formik.onSubmit ---`);
      console.log(`Valores de ImmigrationStatus que se enviarán al contexto (desde formik.onSubmit):`, JSON.stringify(values, null, 2));
      updateFormData('immigrationInfo', values);
    },
  });

  useEffect(() => {
    if (formData.immigrationInfo) {
      formik.setValues(formData.immigrationInfo);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.immigrationInfo]);

  useEffect(() => {
    let missing = 0;
    const {
      type,
      ssnCitizen,
      ssnResident,
      greenCardNumber,
      licenseCitizen,
      licenseResident,
      noTaxId,
      taxIdNumber,
      idType,       // Desestructurado
      licenseNone,    // Desestructurado
      passportCountry,// Desestructurado
      passportNumber, // Desestructurado
      documentType,   // Desestructurado
      documentNumber  // Desestructurado
    } = formik.values;

    if (!type) {
      missing++;
    } else { // Solo contar otros campos si 'type' está seleccionado
      if (type === 'Citizen') {
        if (!ssnCitizen) missing++;
        if (!licenseCitizen) missing++;
      } else if (type === 'Resident') {
        if (!ssnResident) missing++;
        if (!greenCardNumber) missing++;
        if (!licenseResident) missing++;
      } else if (type === 'None') {
        // Para type 'None', la lógica de obligatoriedad depende de noTaxId e idType
        if (noTaxId === false) { // Si TIENE Tax ID (noTaxId es falso)
          if (!taxIdNumber) missing++; // taxIdNumber es requerido
        } else { // Si NO TIENE Tax ID (noTaxId es verdadero)
          if (!idType) { // idType (License o Passport) es requerido
            missing++;
          } else {
            if (idType === 'License' && !licenseNone) missing++;
            if (idType === 'Passport') {
              if (!passportCountry) missing++;
              if (!passportNumber) missing++;
            }
          }
        }
        // Lógica para documentType y documentNumber cuando type es 'None'
        // Ajusta esto si su obligatoriedad es diferente.
        // Por ejemplo, si siempre son requeridos cuando type es 'None':
        if (!documentType) missing++;
        if (!documentNumber) missing++;
      }
    }
    updatePendingCount('immigration', missing);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values, updatePendingCount]);


  useImperativeHandle(ref, () => ({
    async processAndSave() {
      try {
        const errors = await formik.validateForm();
        if (Object.keys(errors).length > 0) {
          formik.setTouched(errors, true);
          console.log(`--- DEBUG: ImmigrationStatus processAndSave --- Errores de validación:`, errors);
          return false; 
        }
        console.log(`--- DEBUG: ImmigrationStatus processAndSave --- Válido, guardando datos:`, JSON.stringify(formik.values, null, 2));
        updateFormData('immigrationInfo', formik.values);
        return true; 
      } catch (error) {
        console.error("Error en processAndSave de ImmigrationStatus:", error);
        return false;
      }
    }
  }));

  const { values, errors, handleChange, setFieldValue } = formik;
  const isCitizen = values.type === 'Citizen';
  const isResident = values.type === 'Resident';
  const isNone = values.type === 'None';

  return (
    <Form onSubmit={(e) => e.preventDefault()}>
      <h3>Immigration Status</h3>

      <Form.Group className="mb-3">
        <Form.Label>Type</Form.Label>
        <Form.Select 
          name="type" 
          onChange={handleChange} 
          onBlur={formik.handleBlur}
          value={values.type}
        >
          <option value="">Select an option</option>
          <option value="Citizen">Citizen</option>
          <option value="Resident">Resident</option>
          <option value="None">None of the above</option>
        </Form.Select>
        {formik.touched.type && errors.type && <div className="text-danger">{errors.type}</div>}
      </Form.Group>

      {isCitizen && (
        <>
          <Form.Group className="mb-3">
            <Form.Label>SSN (Citizen)</Form.Label>
            <Form.Control
              name="ssnCitizen"
              type="text"
              value={values.ssnCitizen}
              onChange={(e) => {
                const formattedSSN = formatSSN(e.target.value);
                setFieldValue("ssnCitizen", formattedSSN);
              }}
              onBlur={formik.handleBlur}
            />
            {formik.touched.ssnCitizen && errors.ssnCitizen && <div className="text-danger">{errors.ssnCitizen}</div>}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>License (Citizen)</Form.Label>
            <Form.Control
              name="licenseCitizen"
              type="text"
              onChange={handleChange}
              onBlur={formik.handleBlur}
              value={values.licenseCitizen}
            />
            {formik.touched.licenseCitizen && errors.licenseCitizen && <div className="text-danger">{errors.licenseCitizen}</div>}
          </Form.Group>
        </>
      )}

      {isResident && (
        <>
          <Form.Group className="mb-3">
            <Form.Label>SSN (Resident)</Form.Label>
            <Form.Control
              name="ssnResident"
              type="text"
              value={values.ssnResident}
              onChange={(e) => {
                const formattedSSN = formatSSN(e.target.value);
                setFieldValue("ssnResident", formattedSSN);
              }}
              onBlur={formik.handleBlur}
            />
            {formik.touched.ssnResident && errors.ssnResident && <div className="text-danger">{errors.ssnResident}</div>}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Green Card Number</Form.Label>
            <Form.Control
              name="greenCardNumber"
              type="text"
              onChange={handleChange}
              onBlur={formik.handleBlur}
              value={values.greenCardNumber}
            />
            {formik.touched.greenCardNumber && errors.greenCardNumber && <div className="text-danger">{errors.greenCardNumber}</div>}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>License (Resident)</Form.Label>
            <Form.Control
              name="licenseResident"
              type="text"
              onChange={handleChange}
              onBlur={formik.handleBlur}
              value={values.licenseResident}
            />
            {formik.touched.licenseResident && errors.licenseResident && <div className="text-danger">{errors.licenseResident}</div>}
          </Form.Group>
        </>
      )}

      {isNone && (
        <>
          <Form.Group className="mb-3">
            <Form.Check
              name="noTaxId"
              type="checkbox"
              label="No Tax ID?"
              checked={values.noTaxId}
              onChange={(e) => { 
                handleChange(e); 
                if (e.target.checked) {
                  setFieldValue('taxIdNumber', '');
                } else {
                  setFieldValue('idType', '');
                  setFieldValue('licenseNone', '');
                  setFieldValue('passportCountry', '');
                  setFieldValue('passportNumber', '');
                }
              }}
              onBlur={formik.handleBlur}
            />
          </Form.Group>

          {!values.noTaxId && (
            <Form.Group className="mb-3">
              <Form.Label>Tax ID Number</Form.Label>
              <Form.Control
                name="taxIdNumber"
                type="text"
                onChange={handleChange}
                onBlur={formik.handleBlur}
                value={values.taxIdNumber}
              />
              {formik.touched.taxIdNumber && errors.taxIdNumber && <div className="text-danger">{errors.taxIdNumber}</div>}
            </Form.Group>
          )}

          {values.noTaxId && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>ID Type (if no Tax ID)</Form.Label>
                <Form.Select
                  name="idType"
                  onChange={(e) => {
                    handleChange(e);
                    setFieldValue('licenseNone', '');
                    setFieldValue('passportCountry', '');
                    setFieldValue('passportNumber', '');
                  }}
                  onBlur={formik.handleBlur}
                  value={values.idType || ''} // Asegurar que el value no sea undefined para el select
                >
                  <option value="">Select an ID type</option>
                  <option value="License">License</option>
                  <option value="Passport">Passport</option>
                </Form.Select>
                {formik.touched.idType && errors.idType && <div className="text-danger">{errors.idType}</div>}
              </Form.Group>

              {values.idType === 'License' && (
                <Form.Group className="mb-3">
                  <Form.Label>License (Non-resident)</Form.Label>
                  <Form.Control
                    name="licenseNone"
                    type="text"
                    onChange={handleChange}
                    onBlur={formik.handleBlur}
                    value={values.licenseNone}
                  />
                  {formik.touched.licenseNone && errors.licenseNone && <div className="text-danger">{errors.licenseNone}</div>}
                </Form.Group>
              )}

              {values.idType === 'Passport' && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Passport Country</Form.Label>
                    <Form.Control
                      name="passportCountry"
                      type="text"
                      onChange={handleChange}
                      onBlur={formik.handleBlur}
                      value={values.passportCountry}
                    />
                    {formik.touched.passportCountry && errors.passportCountry && <div className="text-danger">{errors.passportCountry}</div>}
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Passport Number</Form.Label>
                    <Form.Control
                      name="passportNumber"
                      type="text"
                      onChange={handleChange}
                      onBlur={formik.handleBlur}
                      value={values.passportNumber}
                    />
                    {formik.touched.passportNumber && errors.passportNumber && <div className="text-danger">{errors.passportNumber}</div>}
                  </Form.Group>
                </>
              )}
            </>
          )}
          
          {/* Campos documentType y documentNumber, ahora condicionados a isNone */}
          <div className="row">
              <div className="col-md-6">
                  <Form.Group className="mb-3">
                      <Form.Label>Document Type</Form.Label>
                      <Form.Control
                      name="documentType"
                      type="text"
                      onChange={handleChange}
                      onBlur={formik.handleBlur}
                      value={values.documentType}
                      />
                      {formik.touched.documentType && errors.documentType && <div className="text-danger">{errors.documentType}</div>}
                  </Form.Group>
              </div>
              <div className="col-md-6">
                  <Form.Group className="mb-3">
                      <Form.Label>Document Number</Form.Label>
                      <Form.Control
                      name="documentNumber"
                      type="text"
                      onChange={handleChange}
                      onBlur={formik.handleBlur}
                      value={values.documentNumber}
                      />
                      {formik.touched.documentNumber && errors.documentNumber && <div className="text-danger">{errors.documentNumber}</div>}
                  </Form.Group>
              </div>
          </div>
        </>
      )}

      <div>
        <Button 
          type="button"
          variant="info" 
          size="sm" 
          className="btn-next-tab"
          onClick={goToNext}
        >
          Next Tab
        </Button>
      </div>
    </Form>
  );
});

export default ImmigrationStatus;