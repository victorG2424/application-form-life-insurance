// src/components/Tabs.jsx
import React, { useState, useRef } from 'react'; // Añadir useRef
import { Tabs, Tab } from 'react-bootstrap';

// Asegúrate de que las rutas de importación sean correctas si los archivos están en subdirectorios
import PersonalInfo from './tabs/PersonalInfo';
import ProfessionalInfo from './tabs/ProfessionalInfo';
import ImmigrationStatus from './tabs/ImmigrationStatus';
import InsuranceInfo from './tabs/InsuranceInfo';
import RelativesInfo from './tabs/RelativesInfo';
import AgentInfo from './tabs/AgentInfo';

// Componente TabTitle (asumo que está definido aquí o importado, sin cambios)
function TabTitle({ title, pendingCount }) {
  if (pendingCount === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>{title}</span>
        <span className='counterFieldCheck'>✓</span>
      </div>
    );
  } else {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>{title}</span>
        <span className='counterField'> {pendingCount}</span>
      </div>
    );
  }
}

function FormTabs() {
  const [activeTab, setActiveTab] = useState('personal');
  const [pendingCounts, setPendingCounts] = useState({
    personal: 0, // Estos se inicializarán por cada componente
    professional: 0,
    immigration: 0,
    insurance: 0,
    relatives: 0,
    agent: 0,
  });

  // 1. Crear refs para cada componente de pestaña controlable
  const personalInfoRef = useRef(null);
  const professionalInfoRef = useRef(null);
  const immigrationRef = useRef(null);
  const insuranceRef = useRef(null);
  const relativesRef = useRef(null);
  // AgentInfo no necesita ser controlado de esta manera para la navegación.

  // Mapeo de claves de pestañas a sus refs para fácil acceso
  const tabRefs = {
    personal: personalInfoRef,
    professional: professionalInfoRef,
    immigration: immigrationRef,
    insurance: insuranceRef,
    relatives: relativesRef,
  };

  // Orden de las pestañas para la navegación secuencial con "Next Tab"
  const tabOrder = ['personal', 'professional', 'immigration', 'insurance', 'relatives', 'agent'];

  const updatePendingCount = (tabName, newCount) => {
    setPendingCounts((prev) => {
      if (prev[tabName] === newCount) {
        return prev;
      }
      return { ...prev, [tabName]: newCount };
    });
  };

  // 2. Implementar handleNavigate
  const handleNavigate = async (currentTabKey, nextTabKey) => {
    // No procesar si se intenta navegar a la misma pestaña (a menos que sea por un botón "Next" que la fuerce)
    // Esta función ahora es llamada por onSelect (clic en título) y por los botones "Next Tab".
    if (currentTabKey === nextTabKey && currentTabKey !== 'agent') { // Evitar reprocesar la misma pestaña si no es la del agente
        // Podríamos incluso querer permitir que se reprocese si el usuario hace clic en el mismo título de pestaña
        // para forzar una revalidación/guardado, pero por ahora, evitemos bucles.
        // Si es la pestaña del agente, simplemente la activamos.
         if (nextTabKey === 'agent') {
            setActiveTab(nextTabKey);
         }
        return;
    }
    
    const currentTabComponentRef = tabRefs[currentTabKey];
    let canLeaveCurrentTab = true;

    // Solo intentar procesar si la pestaña actual tiene un ref y una función processAndSave
    // (esto excluye la pestaña 'agent' de este chequeo específico de "salida")
    if (currentTabComponentRef && currentTabComponentRef.current && 
        typeof currentTabComponentRef.current.processAndSave === 'function') {
      console.log(`--- DEBUG: Tabs.jsx --- Intentando processAndSave para la pestaña: ${currentTabKey}`);
      canLeaveCurrentTab = await currentTabComponentRef.current.processAndSave();
    }

    if (canLeaveCurrentTab) {
      console.log(`--- DEBUG: Tabs.jsx --- Transición permitida de ${currentTabKey} a ${nextTabKey}`);
      setActiveTab(nextTabKey);
    } else {
      console.log(`--- DEBUG: Tabs.jsx --- Transición NO permitida de ${currentTabKey} a ${nextTabKey} debido a errores o fallo al guardar.`);
      // El usuario se queda en la pestaña actual (currentTabKey) porque setActiveTab(nextTabKey) no se llamó.
      // Forzar que la pestaña activa visualmente siga siendo currentTabKey,
      // aunque el estado activeTab ya es currentTabKey.
      // Esto es para asegurar que si el usuario hizo clic en un título, el tab no cambie visualmente.
      setActiveTab(currentTabKey); // Reafirmar la pestaña activa actual si la navegación falla
    }
  };

  // Esta función se llamará cuando el usuario haga clic en el TÍTULO de una pestaña.
  const onSelectTabByTitle = (selectedKey) => {
    // Solo procesar si se intenta cambiar a una pestaña diferente.
    if (activeTab !== selectedKey) {
      handleNavigate(activeTab, selectedKey);
    }
  };
  
  // Esta función crea el manejador para el botón "Next Tab" de cada pestaña.
  const createGoToNextHandler = (currentKey) => {
    const currentIndex = tabOrder.indexOf(currentKey);
    if (currentIndex < tabOrder.length - 1) {
      const nextKey = tabOrder[currentIndex + 1];
      return () => handleNavigate(currentKey, nextKey);
    }
    // Si es la última pestaña de datos (relatives), el "Next Tab" debería ir a "agent"
    // o si no hay más pestañas, no hacer nada o manejarlo específicamente.
    // En nuestro caso, 'relatives' es la última antes de 'agent'.
    if (currentKey === 'relatives') {
        return () => handleNavigate(currentKey, 'agent');
    }
    return () => console.log("No hay 'siguiente' pestaña definida para:", currentKey);
  };

  return (
    // Usar onSelectTabByTitle para los clics en los títulos de las pestañas
    <Tabs activeKey={activeTab} onSelect={onSelectTabByTitle} id="form-tabs" className="mb-3">
      <Tab
        eventKey="personal"
        title={<TabTitle title="Personal Information" pendingCount={pendingCounts.personal} />}
      >
        <PersonalInfo
          ref={personalInfoRef} // 3. Pasar el ref
          goToNext={createGoToNextHandler('personal')} // 5. Pasar la nueva función de navegación
          updatePendingCount={updatePendingCount}
        />
      </Tab>

      <Tab
        eventKey="professional"
        title={<TabTitle title="Professional Information" pendingCount={pendingCounts.professional} />}
      >
        <ProfessionalInfo
          ref={professionalInfoRef}
          goToNext={createGoToNextHandler('professional')}
          updatePendingCount={updatePendingCount}
        />
      </Tab>

      <Tab
        eventKey="immigration"
        title={<TabTitle title="Immigration Status" pendingCount={pendingCounts.immigration} />}
      >
        <ImmigrationStatus
          ref={immigrationRef}
          goToNext={createGoToNextHandler('immigration')}
          updatePendingCount={updatePendingCount}
        />
      </Tab>

      <Tab
        eventKey="insurance"
        title={<TabTitle title="Insurance Information" pendingCount={pendingCounts.insurance} />}
      >
        <InsuranceInfo
          ref={insuranceRef}
          goToNext={createGoToNextHandler('insurance')}
          updatePendingCount={updatePendingCount}
        />
      </Tab>

      <Tab
        eventKey="relatives"
        title={<TabTitle title="Relatives Information" pendingCount={pendingCounts.relatives} />}
      >
        <RelativesInfo
          ref={relativesRef}
          goToNext={createGoToNextHandler('relatives')} // Esto llevará a 'agent'
          updatePendingCount={updatePendingCount}
        />
      </Tab>

      <Tab
        eventKey="agent"
        title={<TabTitle title="Agent Information" pendingCount={pendingCounts.agent} />}
      >
        {/* AgentInfo no tiene un botón "Next Tab" de esta naturaleza */}
        <AgentInfo updatePendingCount={updatePendingCount} />
      </Tab>
    </Tabs>
  );
}

export default FormTabs;