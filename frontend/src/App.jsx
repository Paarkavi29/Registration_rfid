import { useEffect, useState } from 'react';
import './App.css';
import { api } from './api';
import PortalSelection from './pages/PortalSelection';
import RegistrationFlow from './pages/RegistrationFlow';
import TagAssignment from './pages/TagAssignment';
// AdminDashboard is navigated from RegistrationFlow when chosen

export default function App() {
  const [health, setHealth] = useState('checking…');
  const [currentView, setCurrentView] = useState('portal-selection'); // portal-selection, registration, tag-assignment, admin
  const [selectedPortal, setSelectedPortal] = useState(localStorage.getItem('portal') || '');
  const [registrationData, setRegistrationData] = useState(null);

  async function refreshHealth() {
    try {
      const d = await api('/health');
      setHealth(`ok @ ${new Date(d.ts).toLocaleTimeString()}`);
    } catch {
      setHealth('down');
    }
  }

  useEffect(() => {
    refreshHealth();
    const t = setInterval(refreshHealth, 15000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (selectedPortal) {
      localStorage.setItem('portal', selectedPortal);
    }
  }, [selectedPortal]);

  function handlePortalSelect(portal) {
    setSelectedPortal(portal);
    setCurrentView('registration');
  }

  function handleRegistrationComplete(regData) {
    setRegistrationData(regData);
    setCurrentView('tag-assignment');
  }

  function handleTagAssignmentComplete() {
    setCurrentView('registration');
    setRegistrationData(null);
  }

  function handleBackToPortalSelection() {
    setCurrentView('portal-selection');
    setSelectedPortal('');
    setRegistrationData(null);
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'portal-selection':
        return <PortalSelection onPortalSelect={handlePortalSelect} />;
      case 'registration':
        return (
          <RegistrationFlow 
            selectedPortal={selectedPortal}
            onRegistrationComplete={handleRegistrationComplete}
            onBack={handleBackToPortalSelection}
          />
        );
      case 'tag-assignment':
        return (
          <TagAssignment 
            registrationData={registrationData}
            selectedPortal={selectedPortal}
            onComplete={handleTagAssignmentComplete}
            onBack={handleBackToPortalSelection}
          />
        );
      case 'admin':
        return <AdminDashboard onBack={handleBackToPortalSelection} />;
      default:
        return <PortalSelection onPortalSelect={handlePortalSelect} />;
    }
  };

  return (
    <>
      <header>
        <h1>RFID Registration System</h1>
        <div className="pill">
          <span className="small">Health: {health}</span>
        </div>
      </header>

      <main style={{ maxWidth: '1100px', margin: '24px auto', padding: '0 16px' }}>
        <section className="card">
          {renderCurrentView()}
        </section>
      </main>

      <footer>Frontend <span className="mono">{import.meta.env.VITE_API_BASE}</span></footer>
    </>
  );
}
