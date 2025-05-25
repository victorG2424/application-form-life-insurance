// src/context/FormContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const FormContext = createContext();

export const FormProvider = ({ children }) => {
  // Cargamos datos del localStorage
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem("formData");
    return savedData ? JSON.parse(savedData) : {};
  });

  // Cada vez que formData cambie, se guarda en localStorage
  useEffect(() => {
    localStorage.setItem("formData", JSON.stringify(formData));
  }, [formData]);

  // Función para actualizar una sección específica del formulario (por ejemplo, personalInfo)
  const updateFormData = (section, data) => {
    setFormData(prev => ({ ...prev, [section]: data }));
  };

  // Nueva función para resetear completamente los datos del formulario
  const resetFormData = () => {
    setFormData({});
    localStorage.removeItem("formData"); // Limpiamos localStorage también
  };

  return (
    <FormContext.Provider value={{ formData, updateFormData, resetFormData }}>
      {children}
    </FormContext.Provider>
  );
};
