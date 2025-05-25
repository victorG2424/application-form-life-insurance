import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from 'react-bootstrap';
import './styles/formStyles.css';
import FormTabs from './components/Tabs';
import NavBar from "./components/Navbar";

function App() {
  return (
    <div className="main-page">
      <NavBar />
      <div className="form-container">
        <FormTabs />
      </div>
    </div>
  );
}

export default App;