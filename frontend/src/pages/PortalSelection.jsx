import { useState } from 'react';

export default function PortalSelection({ onPortalSelect }) {
  const [selectedPortal, setSelectedPortal] = useState('');

  const portals = [
    { id: 'portal1', name: 'Portal 1', description: 'Registration Portal 1' },
    { id: 'portal2', name: 'Portal 2', description: 'Registration Portal 2' },
    { id: 'portal3', name: 'Portal 3', description: 'Registration Portal 3' }
  ];

  function handlePortalSelect(portalId) {
    setSelectedPortal(portalId);
  }

  function handleContinue() {
    if (selectedPortal) {
      onPortalSelect(selectedPortal);
    }
  }

  return (
    <div>
      <h2 style={{ marginTop: 0, textAlign: 'center' }}>Select Portal</h2>
      <p className="mut" style={{ textAlign: 'center', marginBottom: '30px' }}>
        Choose which portal you want to access
      </p>

      <div style={{ display: 'grid', gap: '15px', marginBottom: '30px' }}>
        {portals.map(portal => (
          <div
            key={portal.id}
            className={`portal-card ${selectedPortal === portal.id ? 'selected' : ''}`}
            onClick={() => handlePortalSelect(portal.id)}
            style={{
              padding: '20px',
              border: selectedPortal === portal.id ? '2px solid var(--pri)' : '1px solid #2a375d',
              borderRadius: '12px',
              background: selectedPortal === portal.id ? '#0c2b55' : '#0f182d',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <h3 style={{ margin: '0 0 8px 0', color: selectedPortal === portal.id ? 'var(--pri)' : '#e6eefc' }}>
              {portal.name}
            </h3>
            <p className="mut small" style={{ margin: 0 }}>
              {portal.description}
            </p>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center' }}>
        <button 
          className="btn primary" 
          onClick={handleContinue}
          disabled={!selectedPortal}
          style={{ padding: '12px 30px', fontSize: '16px' }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}