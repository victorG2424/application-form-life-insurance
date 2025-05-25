import React, { useContext, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FormContext } from '../../context/FormContext';

const InsuranceInfo = forwardRef(({ goToNext, updatePendingCount }, ref) => {
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
  
  const { formData, updateFormData } = useContext(FormContext);

  const validationSchema = Yup.object({
    lifeInsuranceCompany: Yup.string()
      .required('Life Insurance Company is required'),
    plan: Yup.string()
      .required('Plan is required'),
    monthlyPremium: Yup.string()
      .required('Monthly Premium is required')
      .matches(
        /^\$?\d{1,3}(,\d{3})*(\.\d{2})?$/,
        'Please enter a valid dollar amount (e.g. $200.00)',
      ),
    deathBenefit: Yup.string()
      .required('Death Benefit is required')
      .matches(
        /^\$?\d{1,3}(,\d{3})*(\.\d{2})?$/,
        'Please enter a valid dollar amount (e.g. $296,663.00)',
      ),
    otherPolicies: Yup.string()
      .required('Please select Yes or No'),
    insuranceType: Yup.lazy((value, { parent }) => {
      if (parent.otherPolicies === 'Yes') {
        return Yup.string()
          .required('Insurance Type is required if other policies are active');
      }
      return Yup.string().notRequired();
    }),
    finalExpenses: Yup.lazy((value, { parent }) => {
      if (parent.otherPolicies === 'Yes') {
        return Yup.string()
          .required('Final Expenses is required if other policies are active')
          .matches(
            /^\$?\d{1,3}(,\d{3})*(\.\d{2})?$/,
            'Please enter a valid dollar amount (e.g. $200.00)',
          );
      }
      return Yup.string().notRequired();
    }),
    coverage: Yup.lazy((value, { parent }) => {
      if (parent.otherPolicies === 'Yes') {
        return Yup.string()
          .required('Coverage is required if other policies are active')
          .matches(
            /^\$?\d{1,3}(,\d{3})*(\.\d{2})?$/,
            'Please enter a valid dollar amount (e.g. $200.00)',
          );
      }
      return Yup.string().notRequired();
    }),
    medicalCondition: Yup.string().notRequired(), 
  });

  const formik = useFormik({
    initialValues: formData.insuranceInfo || {
      lifeInsuranceCompany: '',
      plan: '',
      monthlyPremium: '',
      deathBenefit: '',
      otherPolicies: '',
      insuranceType: '',
      finalExpenses: '',
      coverage: '',
      medicalCondition: '',
    },
    validationSchema,
    onSubmit: (values) => {
      console.log(`--- DEBUG: InsuranceInfo formik.onSubmit ---`);
      console.log(`Valores de InsuranceInfo que se enviarán al contexto (desde formik.onSubmit):`, JSON.stringify(values, null, 2));
      updateFormData('insuranceInfo', values);
    },
  });

  useEffect(() => {
    if (formData.insuranceInfo) {
      formik.setValues(formData.insuranceInfo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.insuranceInfo]);

  useEffect(() => {
    const {
      lifeInsuranceCompany, plan, monthlyPremium, deathBenefit, otherPolicies,
      insuranceType, finalExpenses, coverage,
      // medicalCondition, // Eliminado de la desestructuración aquí ya que es opcional y no afecta el conteo
    } = formik.values;

    let missing = 0;
    if (!lifeInsuranceCompany) missing++;
    if (!plan) missing++;
    if (!monthlyPremium) missing++;
    if (!deathBenefit) missing++;
    if (!otherPolicies) missing++;

    if (otherPolicies === 'Yes') {
      if (!insuranceType) missing++;
      if (!finalExpenses) missing++;
      if (!coverage) missing++;
      // Si medicalCondition se vuelve obligatoria bajo esta condición (y se ajusta Yup),
      // aquí podrías usar: if (!formik.values.medicalCondition) missing++;
    }
    
    updatePendingCount('insurance', missing);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values, updatePendingCount]);

  useImperativeHandle(ref, () => ({
    async processAndSave() {
      try {
        const errors = await formik.validateForm();
        if (Object.keys(errors).length > 0) {
          formik.setTouched(errors, true);
          console.log(`--- DEBUG: InsuranceInfo processAndSave --- Errores de validación:`, errors);
          return false; 
        }
        console.log(`--- DEBUG: InsuranceInfo processAndSave --- Válido, guardando datos:`, JSON.stringify(formik.values, null, 2));
        updateFormData('insuranceInfo', formik.values);
        return true; 
      } catch (error) {
        console.error("Error en processAndSave de InsuranceInfo:", error);
        return false;
      }
    }
  }));

  const showOtherPoliciesFields = formik.values.otherPolicies === 'Yes';

  return (
    <Form onSubmit={(e) => e.preventDefault()}>
      <h3>Insurance Information</h3>

      {/* Life Insurance Company & Plan */}
      <div className="row">
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Life Insurance Company</Form.Label>
            <Form.Control
              name="lifeInsuranceCompany"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.lifeInsuranceCompany}
            />
            {formik.touched.lifeInsuranceCompany && formik.errors.lifeInsuranceCompany && (
              <div className="text-danger">{formik.errors.lifeInsuranceCompany}</div>
            )}
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Plan</Form.Label>
            <Form.Control
              name="plan"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.plan}
            />
            {formik.touched.plan && formik.errors.plan && (
              <div className="text-danger">{formik.errors.plan}</div>
            )}
          </Form.Group>
        </div>
      </div>

      {/* Monthly Premium & Death Benefit */}
      <div className="row">
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Monthly Premium</Form.Label>
            <Form.Control
              name="monthlyPremium"
              type="text"
              value={formik.values.monthlyPremium}
              onChange={(e) => {
                formik.setFieldValue("monthlyPremium", e.target.value.replace(/\D/g, ""));
              }}
              onBlur={(e) => {
                formik.handleBlur(e);
                const formattedValue = formatCurrencyOnBlur(e.target.value);
                formik.setFieldValue("monthlyPremium", formattedValue);
              }}
            />
            {formik.touched.monthlyPremium && formik.errors.monthlyPremium && (
              <div className="text-danger">{formik.errors.monthlyPremium}</div>
            )}
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Death Benefit</Form.Label>
            <Form.Control
              name="deathBenefit"
              type="text"
              value={formik.values.deathBenefit}
              onChange={(e) => {
                 formik.setFieldValue("deathBenefit", e.target.value.replace(/\D/g, ""));
              }}
              onBlur={(e) => {
                formik.handleBlur(e);
                const formattedValue = formatCurrencyOnBlur(e.target.value);
                formik.setFieldValue("deathBenefit", formattedValue);
              }}
            />
            {formik.touched.deathBenefit && formik.errors.deathBenefit && (
              <div className="text-danger">{formik.errors.deathBenefit}</div>
            )}
          </Form.Group>
        </div>
      </div>

      {/* Medical Condition */}
      <div className="row">
        <div className="col-md-12">
          <Form.Group className="mb-3">
            <Form.Label>Medical Condition</Form.Label>
            <Form.Control
              name="medicalCondition"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.medicalCondition}
            />
            {formik.touched.medicalCondition && formik.errors.medicalCondition && (
              <div className="text-danger">{formik.errors.medicalCondition}</div>
            )}
          </Form.Group>
        </div>
      </div>

      {/* Other Policies Select */}
      <div className="row">
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Active life insurance policies at other companies?</Form.Label>
            <Form.Select
              name="otherPolicies"
              onChange={(e) => {
                formik.handleChange(e);
                if (e.target.value === "No") {
                  formik.setFieldValue("insuranceType", "");
                  formik.setFieldValue("finalExpenses", "");
                  formik.setFieldValue("coverage", "");
                  // formik.setFieldValue("medicalCondition", ""); // Si medicalCondition es condicional a otherPolicies='Yes'
                }
              }}
              onBlur={formik.handleBlur}
              value={formik.values.otherPolicies}
            >
              <option value="">Select an option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </Form.Select>
            {formik.touched.otherPolicies && formik.errors.otherPolicies && (
              <div className="text-danger">{formik.errors.otherPolicies}</div>
            )}
          </Form.Group>
        </div>
      </div>

      {/* Conditional Fields if otherPolicies is Yes */}
      {showOtherPoliciesFields && (
        <>
          <div className="row">
            <div className="col-md-4">
              <Form.Group className="mb-3">
                <Form.Label>Insurance Type</Form.Label>
                <Form.Control
                  name="insuranceType"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.insuranceType}
                />
                {formik.touched.insuranceType && formik.errors.insuranceType && (
                  <div className="text-danger">{formik.errors.insuranceType}</div>
                )}
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group className="mb-3">
                <Form.Label>Final Expenses</Form.Label>
                <Form.Control
                  name="finalExpenses"
                  type="text"
                  value={formik.values.finalExpenses}
                  onChange={(e) => {
                     formik.setFieldValue("finalExpenses", e.target.value.replace(/\D/g, ""));
                  }}
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    const formattedValue = formatCurrencyOnBlur(e.target.value);
                    formik.setFieldValue("finalExpenses", formattedValue);
                  }}
                />
                {formik.touched.finalExpenses && formik.errors.finalExpenses && (
                  <div className="text-danger">{formik.errors.finalExpenses}</div>
                )}
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group className="mb-3">
                <Form.Label>Coverage</Form.Label>
                <Form.Control
                  name="coverage"
                  type="text"
                  value={formik.values.coverage}
                  onChange={(e) => {
                    formik.setFieldValue("coverage", e.target.value.replace(/\D/g, ""));
                  }}
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    const formattedValue = formatCurrencyOnBlur(e.target.value);
                    formik.setFieldValue("coverage", formattedValue);
                  }}
                />
                {formik.touched.coverage && formik.errors.coverage && (
                  <div className="text-danger">{formik.errors.coverage}</div>
                )}
              </Form.Group>
            </div>
          </div>
        </>
      )}

      {/* Next Tab Button */}
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

export default InsuranceInfo;