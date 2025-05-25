// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ClientList from "./components/ClientList";
import DetailScreen from "./components/DetailScreen";
import { AuthProvider } from "./context/AuthContext";
import { FormProvider } from "./context/FormContext";
import Login from "./components/Login";

const PrivateRoute = ({ element }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user ? element : <Navigate to="/login" />;
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <FormProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute element={<App />} />} />
            <Route path="/clients" element={<PrivateRoute element={<ClientList />} />} />
            <Route path="/clients/:id" element={<PrivateRoute element={<DetailScreen />} />} />
          </Routes>
        </BrowserRouter>
      </FormProvider>
    </AuthProvider>
  </React.StrictMode>
);