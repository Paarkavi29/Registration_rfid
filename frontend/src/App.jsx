import { useEffect, useState } from 'react';
import './App.css';
import { api } from './api';
import PortalSelection from './pages/PortalSelection';
import RegistrationFlow from './pages/RegistrationFlow';
import TagAssignment from './pages/TagAssignment';
import AuthPage from './pages/AuthPage';
import { useAuth } from './auth/AuthContext';
import RfidLogInput from './pages/RfidLogInput';
// AdminDashboard is navigated from RegistrationFlow when chosen

export default function App() {
  const { user, logout } = useAuth();
  const [health, setHealth] = useState('checking…');
  const [currentView, setCurrentView] = useState('portal-selection'); // portal-selection, registration, tag-assignment, admin
  const [selectedPortal, setSelectedPortal] = useState(localStorage.getItem('portal') || '');
  const [registrationData, setRegistrationData] = useState(null);

  // Check if we should show the RFID log input page based on URL
  useEffect(() => {
    if (window.location.pathname === '/rfid') {
      setCurrentView('rfid-log');
    }
  }, []);

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
      case 'rfid-log':
        return <RfidLogInput />;
      default:
        return <PortalSelection onPortalSelect={handlePortalSelect} />;
    }
  };

  const isAuthed = !!user;

  return (
    <>
      <header>
        {currentView !== 'rfid-log' && <h1>Welcome to Registration Portal</h1>}
        {isAuthed && (
          <div style={{ position: 'absolute', right: 16, top: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="small">Signed in as {user?.email}</span>
            <button onClick={logout}>Logout</button>
          </div>
        )}
        {/* <div className="pill">
          <span className="small">Health: {health}</span>
        </div> */}
      </header>

      <main style={{ maxWidth: '1100px', margin: '24px auto', padding: '0 16px' }}>
        <section className="card">
          {isAuthed ? renderCurrentView() : <AuthPage />}
        </section>
      </main>

      <footer>Frontend <span className="mono">{import.meta.env.VITE_API_BASE}</span></footer>
    </>
  );
}
