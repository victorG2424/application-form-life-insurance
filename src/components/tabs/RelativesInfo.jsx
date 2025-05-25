import React, { useContext, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FormContext } from '../../context/FormContext';

const RelativesInfo = forwardRef(({ goToNext, updatePendingCount }, ref) => {
  const { formData, updateFormData } = useContext(FormContext);

  const validationSchema = Yup.object({
    beneficiaries: Yup.array()
      .of(
        Yup.object().shape({
          fullName: Yup.string().required('Full Name is required'),
          dob: Yup.string().required('Date of Birth is required'),
          relationship: Yup.string().required('Relationship is required'),
        })
      )
      .min(1, 'At least one beneficiary is required')
      .max(5, 'You cannot have more than 5 beneficiaries'),
    motherLiving: Yup.string().required('Please select if the mother is living or not'),
    motherAge: Yup.lazy((value, { parent }) => {
      if (parent.motherLiving === 'Yes') {
        return Yup.string().required('Mother Age is required').matches(/^[0-9]+$/, "Must be only digits").min(1, "Age must be at least 1").max(3, "Age seems too high");
      }
      return Yup.string().notRequired();
    }),
    motherAgeAtDeath: Yup.lazy((value, { parent }) => {
      if (parent.motherLiving === 'No') {
        return Yup.string().required('Mother Age at Death is required').matches(/^[0-9]+$/, "Must be only digits").min(1, "Age must be at least 1").max(3, "Age seems too high");
      }
      return Yup.string().notRequired();
    }),
    motherCauseOfDeath: Yup.lazy((value, { parent }) => {
      if (parent.motherLiving === 'No') {
        return Yup.string().required('Mother Cause of Death is required');
      }
      return Yup.string().notRequired();
    }),
    fatherLiving: Yup.string().required('Please select if the father is living or not'),
    fatherAge: Yup.lazy((value, { parent }) => {
      if (parent.fatherLiving === 'Yes') {
        return Yup.string().required('Father Age is required').matches(/^[0-9]+$/, "Must be only digits").min(1, "Age must be at least 1").max(3, "Age seems too high");
      }
      return Yup.string().notRequired();
    }),
    fatherAgeAtDeath: Yup.lazy((value, { parent }) => {
      if (parent.fatherLiving === 'No') {
        return Yup.string().required('Father Age at Death is required').matches(/^[0-9]+$/, "Must be only digits").min(1, "Age must be at least 1").max(3, "Age seems too high");
      }
      return Yup.string().notRequired();
    }),
    fatherCauseOfDeath: Yup.lazy((value, { parent }) => {
      if (parent.fatherLiving === 'No') {
        return Yup.string().required('Father Cause of Death is required');
      }
      return Yup.string().notRequired();
    }),
  });

  const formik = useFormik({
    initialValues: formData.relativesInfo || {
      beneficiaries: [
        { fullName: '', dob: '', relationship: '' },
      ],
      motherLiving: '',
      motherAge: '',
      motherAgeAtDeath: '',
      motherCauseOfDeath: '',
      fatherLiving: '',
      fatherAge: '',
      fatherAgeAtDeath: '',
      fatherCauseOfDeath: '',
    },
    validationSchema,
    onSubmit: (values) => {
      // Este onSubmit de Formik se llamaría si usáramos formik.handleSubmit() explícitamente
      // o si el botón "Next Tab" fuera type="submit" Y el <Form onSubmit={formik.handleSubmit}>
      console.log(`--- DEBUG: RelativesInfo formik.onSubmit ---`);
      console.log(`Valores de RelativesInfo que se enviarán al contexto (desde formik.onSubmit):`, JSON.stringify(values, null, 2));
      updateFormData('relativesInfo', values);
    },
  });

  useEffect(() => {
    if (formData.relativesInfo) {
      formik.setValues(formData.relativesInfo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.relativesInfo]);

  useEffect(() => {
    let missing = 0;
    const {
      beneficiaries, motherLiving, motherAge, motherAgeAtDeath, motherCauseOfDeath,
      fatherLiving, fatherAge, fatherAgeAtDeath, fatherCauseOfDeath,
    } = formik.values;

    if (!beneficiaries || beneficiaries.length === 0) {
      missing++; 
    } else {
      let beneficiaryFieldsMissing = false;
      beneficiaries.forEach((b) => {
        if (!b.fullName || !b.dob || !b.relationship) {
          beneficiaryFieldsMissing = true;
        }
      });
      if (beneficiaryFieldsMissing) missing++; 
    }

    if (!motherLiving) missing++;
    else if (motherLiving === 'Yes' && !motherAge) missing++;
    else if (motherLiving === 'No') {
      if (!motherAgeAtDeath) missing++;
      if (!motherCauseOfDeath) missing++;
    }

    if (!fatherLiving) missing++;
    else if (fatherLiving === 'Yes' && !fatherAge) missing++;
    else if (fatherLiving === 'No') {
      if (!fatherAgeAtDeath) missing++;
      if (!fatherCauseOfDeath) missing++;
    }

    updatePendingCount('relatives', missing);
  }, [formik.values, updatePendingCount]);
  
  useImperativeHandle(ref, () => ({
    async processAndSave() {
      try {
        const errors = await formik.validateForm();
        if (Object.keys(errors).length > 0) {
          let touchedFields = { ...errors }; 
          if (errors.beneficiaries && Array.isArray(errors.beneficiaries)) {
            touchedFields.beneficiaries = errors.beneficiaries.map(beneficiaryError => beneficiaryError ? {fullName: true, dob: true, relationship: true} : {});
          }
          formik.setTouched(touchedFields, true);
          console.log(`--- DEBUG: RelativesInfo processAndSave --- Errores de validación:`, errors);
          return false; 
        }
        console.log(`--- DEBUG: RelativesInfo processAndSave --- Válido, guardando datos:`, JSON.stringify(formik.values, null, 2));
        updateFormData('relativesInfo', formik.values);
        return true; 
      } catch (error) {
        console.error("Error en processAndSave de RelativesInfo:", error);
        return false;
      }
    }
  }));

  // CORRECCIÓN: Eliminar handleSubmit de la desestructuración si no se usa en el JSX
  const { values, errors, handleChange, setFieldValue } = formik;

  const handleAddBeneficiary = () => {
    if (values.beneficiaries.length < 5) {
      const newArray = [
        ...values.beneficiaries,
        { fullName: '', dob: '', relationship: '' },
      ];
      setFieldValue('beneficiaries', newArray);
    }
  };

  const handleRemoveBeneficiary = (index) => {
    if (values.beneficiaries.length > 1) {
      const newArray = [...values.beneficiaries];
      newArray.splice(index, 1);
      setFieldValue('beneficiaries', newArray);
    }
  };

  const chunkedBeneficiaries = [];
  if (values.beneficiaries && values.beneficiaries.length > 0) { // Añadida verificación
    for (let i = 0; i < values.beneficiaries.length; i += 3) {
      chunkedBeneficiaries.push(values.beneficiaries.slice(i, i + 3));
    }
  }


  const motherIsLiving = values.motherLiving === 'Yes';
  const motherIsDeceased = values.motherLiving === 'No';
  const fatherIsLiving = values.fatherLiving === 'Yes';
  const fatherIsDeceased = values.fatherLiving === 'No';

  return (
    <Form onSubmit={(e) => e.preventDefault()}>
      <h3>Relatives Information</h3>

      <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '1rem' }}>
        <h4>Beneficiaries</h4>
        {typeof errors.beneficiaries === 'string' && (
            <div className="text-danger mb-2">{errors.beneficiaries}</div>
        )}

        {chunkedBeneficiaries.map((rowOfBeneficiaries, rowIndex) => (
          <div className="row" key={rowIndex}>
            {rowOfBeneficiaries.map((benef, index) => {
              const actualIndex = rowIndex * 3 + index;
              const fullNameError = formik.errors.beneficiaries?.[actualIndex]?.fullName;
              const fullNameTouched = formik.touched.beneficiaries?.[actualIndex]?.fullName;
              const dobError = formik.errors.beneficiaries?.[actualIndex]?.dob;
              const dobTouched = formik.touched.beneficiaries?.[actualIndex]?.dob;
              const relationshipError = formik.errors.beneficiaries?.[actualIndex]?.relationship;
              const relationshipTouched = formik.touched.beneficiaries?.[actualIndex]?.relationship;

              return (
                <div className="col-md-4" key={actualIndex}>
                  <div style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px', position: 'relative' }}>
                    <h5>Beneficiary {actualIndex + 1}</h5>
                    <Form.Group className="mb-2">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        name={`beneficiaries[${actualIndex}].fullName`}
                        type="text"
                        value={benef.fullName || ''} // Prevenir valor undefined
                        onChange={handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {fullNameTouched && fullNameError && (
                        <div className="text-danger">{fullNameError}</div>
                      )}
                    </Form.Group>
                    <Form.Group className="mb-2">
                      <Form.Label>Date of Birth</Form.Label>
                      <Form.Control
                        name={`beneficiaries[${actualIndex}].dob`}
                        type="date"
                        value={benef.dob || ''} // Prevenir valor undefined
                        onChange={handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {dobTouched && dobError && <div className="text-danger">{dobError}</div>}
                    </Form.Group>
                    <Form.Group className="mb-2">
                      <Form.Label>Relationship</Form.Label>
                      <Form.Control
                        name={`beneficiaries[${actualIndex}].relationship`}
                        type="text"
                        value={benef.relationship || ''} // Prevenir valor undefined
                        onChange={handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {relationshipTouched && relationshipError && (
                        <div className="text-danger">{relationshipError}</div>
                      )}
                    </Form.Group>
                    {values.beneficiaries.length > 1 && (
                      <Button
                        variant="danger"
                        size="sm"
                        style={{ position: 'absolute', top: '10px', right: '10px' }}
                        onClick={() => handleRemoveBeneficiary(actualIndex)}
                      >
                        X
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        {values.beneficiaries && values.beneficiaries.length < 5 && ( // Añadida verificación
          <Button type="button" onClick={handleAddBeneficiary} variant="secondary" size="sm">
            + Add Beneficiary
          </Button>
        )}
      </div>

      <h4>Parent Information</h4>
      <div className="row mb-3">
        <div className="col-md-4">
          <Form.Group>
            <Form.Label>Is the mother of the insured living?</Form.Label>
            <Form.Select
              name="motherLiving"
              onChange={handleChange}
              onBlur={formik.handleBlur}
              value={values.motherLiving}
            >
              <option value="">Select an option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </Form.Select>
            {formik.touched.motherLiving && errors.motherLiving && (
              <div className="text-danger">{errors.motherLiving}</div>
            )}
          </Form.Group>
        </div>
        {motherIsLiving && (
          <div className="col-md-4">
            <Form.Group>
              <Form.Label>Mother Age</Form.Label>
              <Form.Control
                name="motherAge"
                type="number"
                onChange={handleChange}
                onBlur={formik.handleBlur}
                value={values.motherAge}
              />
              {formik.touched.motherAge && errors.motherAge && (
                <div className="text-danger">{errors.motherAge}</div>
              )}
            </Form.Group>
          </div>
        )}
        {motherIsDeceased && (
          <>
            <div className="col-md-4">
              <Form.Group>
                <Form.Label>Mother Age at Death</Form.Label>
                <Form.Control
                  name="motherAgeAtDeath"
                  type="number"
                  onChange={handleChange}
                  onBlur={formik.handleBlur}
                  value={values.motherAgeAtDeath}
                />
                {formik.touched.motherAgeAtDeath && errors.motherAgeAtDeath && (
                  <div className="text-danger">{errors.motherAgeAtDeath}</div>
                )}
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group>
                <Form.Label>Mother Cause of Death</Form.Label>
                <Form.Control
                  name="motherCauseOfDeath"
                  type="text"
                  onChange={handleChange}
                  onBlur={formik.handleBlur}
                  value={values.motherCauseOfDeath}
                />
                {formik.touched.motherCauseOfDeath && errors.motherCauseOfDeath && (
                  <div className="text-danger">{errors.motherCauseOfDeath}</div>
                )}
              </Form.Group>
            </div>
          </>
        )}
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <Form.Group>
            <Form.Label>Is the father of the insured living?</Form.Label>
            <Form.Select
              name="fatherLiving"
              onChange={handleChange}
              onBlur={formik.handleBlur}
              value={values.fatherLiving}
            >
              <option value="">Select an option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </Form.Select>
            {formik.touched.fatherLiving && errors.fatherLiving && (
              <div className="text-danger">{errors.fatherLiving}</div>
            )}
          </Form.Group>
        </div>
        {fatherIsLiving && (
          <div className="col-md-4">
            <Form.Group>
              <Form.Label>Father Age</Form.Label>
              <Form.Control
                name="fatherAge"
                type="number"
                onChange={handleChange}
                onBlur={formik.handleBlur}
                value={values.fatherAge}
              />
              {formik.touched.fatherAge && errors.fatherAge && (
                <div className="text-danger">{errors.fatherAge}</div>
              )}
            </Form.Group>
          </div>
        )}
        {fatherIsDeceased && (
          <>
            <div className="col-md-4">
              <Form.Group>
                <Form.Label>Father Age at Death</Form.Label>
                <Form.Control
                  name="fatherAgeAtDeath"
                  type="number"
                  onChange={handleChange}
                  onBlur={formik.handleBlur}
                  value={values.fatherAgeAtDeath}
                />
                {formik.touched.fatherAgeAtDeath && errors.fatherAgeAtDeath && (
                  <div className="text-danger">{errors.fatherAgeAtDeath}</div>
                )}
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group>
                <Form.Label>Father Cause of Death</Form.Label>
                <Form.Control
                  name="fatherCauseOfDeath"
                  type="text"
                  onChange={handleChange}
                  onBlur={formik.handleBlur}
                  value={values.fatherCauseOfDeath}
                />
                {formik.touched.fatherCauseOfDeath && errors.fatherCauseOfDeath && (
                  <div className="text-danger">{errors.fatherCauseOfDeath}</div>
                )}
              </Form.Group>
            </div>
          </>
        )}
      </div>

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

export default RelativesInfo;