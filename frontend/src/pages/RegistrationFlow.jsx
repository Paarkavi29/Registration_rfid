import React, { useState, useEffect } from 'react';
import { api } from '../api';
import SelectField from '../components/SelectField';
import AdminPortal from './AdminPortal';

// SearchableSelect component for school and university search
const SearchableSelect = ({ label, options, value, onChange, disabled, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);

  useEffect(() => {
    if (searchTerm) {
      setFilteredOptions(options.filter(option => 
        option.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    } else {
      setFilteredOptions(options);
    }
  }, [searchTerm, options]);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div style={{ marginBottom: 12, position: 'relative' }}>
      <label>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={isOpen ? searchTerm : value}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
        />
        {isOpen && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            background: '#0d1426', border: '1px solid #2a375d', borderTop: 'none',
            borderRadius: '0 0 10px 10px', maxHeight: 220, overflowY: 'auto', zIndex: 20
          }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={index}
                  onMouseDown={() => handleSelect(option)}
                  style={{ padding: '10px 12px', borderBottom: '1px solid #1f2942', cursor: 'pointer' }}
                >
                  {option}
                </div>
              ))
            ) : (
              <div style={{ padding: '10px 12px', color: '#9fb0d0' }}>No results found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function RegistrationFlow({ selectedPortal, onRegistrationComplete, onBack }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentStep, setCurrentStep] = useState('type-selection'); // type-selection, individual-form, batch-form, batch-count, admin
  const [registrationType, setRegistrationType] = useState(''); // individual, batch
  
  // Data states
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [schools, setSchools] = useState([]);
  const [universities, setUniversities] = useState([]);
  
  // Individual form data
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [sex, setSex] = useState("");
  const [language, setLanguage] = useState("");
  
  // Batch form data
  const [batchType, setBatchType] = useState(""); // school, university, general
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [batchCount, setBatchCount] = useState(0);
  const [pendingBatchPayload, setPendingBatchPayload] = useState(null);
  
  // UI states
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  // Load initial data
  useEffect(() => {
    loadProvinces();
    loadUniversities();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      loadDistricts(selectedProvince);
    } else {
      setDistricts([]);
    }
  }, [selectedProvince]);

  // Load schools when province and district change
  useEffect(() => {
    if (selectedProvince && selectedDistrict) {
      loadSchools(selectedProvince, selectedDistrict);
    } else {
      setSchools([]);
    }
  }, [selectedProvince, selectedDistrict]);

  // Data loading directly from frontend public data
  const loadProvinces = async () => {
    try {
      const res = await fetch('/data/provinces.json');
      const json = await res.json();
      setProvinces(json);
    } catch {
      setProvinces([]);
    }
  };

  const loadDistricts = async (province) => {
    try {
      const res = await fetch('/data/districts_by_province.json');
      const json = await res.json();
      setDistricts(json[province] || []);
    } catch {
      setDistricts([]);
    }
  };

  const loadSchools = async (province, district) => {
    try {
      const url = `/data/schools/${encodeURIComponent(province)}/${encodeURIComponent(district)}.json`;
      const res = await fetch(url);
      const json = await res.json();
      setSchools(json);
    } catch {
      setSchools([]);
    }
  };

  const loadUniversities = async () => {
    try {
      const res = await fetch('/data/universities.json');
      const json = await res.json();
      setUniversities(json);
    } catch {
      setUniversities([]);
    }
  };

  function handleTypeSelection(type) {
    setRegistrationType(type);
    if (type === 'individual') {
      setCurrentStep('individual-form');
    } else {
      setCurrentStep('batch-form');
    }
  }

  const handleLanguageToggle = (lang) => {
    setSelectedLanguages(prev => {
      if (prev.includes(lang)) {
        return prev.filter(l => l !== lang);
      } else if (prev.length < 2) {
        return [...prev, lang];
      }
      return prev;
    });
  };

  const handleIndividualSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedProvince || !selectedDistrict || !ageRange || !sex || !language) {
      setMsg("Please fill in all required fields");
      return;
    }

    setBusy(true);
    setMsg('');
    
    try {
      const payload = {
        portal: selectedPortal,
        province: selectedProvince,
        district: selectedDistrict,
        age_range: ageRange,
        sex: sex,
        lang: language,
        group_size: 1
      };

      const result = await api('/api/tags/register', {
        method: 'POST',
        body: payload
      });

      const registrationData = {
        id: result.id,
        type: 'individual',
        portal: selectedPortal,
        ...payload
      };

      setMsg('✅ Registration successful! Proceeding to tag assignment...');
      setTimeout(() => {
        onRegistrationComplete(registrationData);
      }, 1500);

    } catch (error) {
      setMsg(`❌ Registration failed: ${error.message}`);
    } finally {
      setBusy(false);
    }
  };

  const handleBatchSubmit = async (e) => {
    e.preventDefault();
    
    let isValid = true;
    let payload = { portal: selectedPortal };

    if (batchType === "school") {
      if (!selectedProvince || !selectedDistrict || !selectedSchool || selectedLanguages.length === 0) {
        isValid = false;
      }
      payload = {
        ...payload,
        province: selectedProvince,
        district: selectedDistrict,
        school: selectedSchool,
        lang: selectedLanguages.join(', ')
      };
    } else if (batchType === "university") {
      if (!selectedUniversity || selectedLanguages.length === 0) {
        isValid = false;
      }
      payload = {
        ...payload,
        university: selectedUniversity,
        lang: selectedLanguages.join(', ')
      };
    } else if (batchType === "general") {
      if (!selectedProvince || !selectedDistrict || selectedLanguages.length === 0) {
        isValid = false;
      }
      payload = {
        ...payload,
        province: selectedProvince,
        district: selectedDistrict,
        lang: selectedLanguages.join(', ')
      };
    }

    if (!isValid) {
      setMsg("Please fill in all required fields");
      return;
    }

    // Move to RFID tap count step instead of asking for manual count
    setPendingBatchPayload(payload);
    setBatchCount(0);
    setMsg('Tap RFID cards to count batch members...');
    setCurrentStep('batch-count');
  };

  // Only increment batchCount after successful backend assignment
  const handleRfidTap = async () => {
    setBusy(true);
    setMsg('');
    try {
      let leaderId = pendingBatchPayload?.registrationId || pendingBatchPayload?.id;
      // If registration not created yet, create it now
      if (!leaderId) {
        const payload = { ...pendingBatchPayload, group_size: batchCount + 1 };
        const result = await api('/api/tags/register', {
          method: 'POST',
          body: payload
        });
        leaderId = result.id;
        setPendingBatchPayload(prev => ({ ...prev, registrationId: result.id }));
      }
      const res = await api('/api/tags/link', {
        method: 'POST',
        body: {
          portal: selectedPortal,
          leaderId,
          asLeader: false
        }
      });
      setBatchCount(prev => prev + 1);
      setMsg(`✅ RFID card assigned: ${res.tagId}`);
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const handleBatchCountComplete = async () => {
    if (!pendingBatchPayload) return;
    if (batchCount < 1) {
      setMsg('Please tap at least one RFID card to count members');
      return;
    }
    setBusy(true);
    setMsg('');
    try {
      const payload = { ...pendingBatchPayload, group_size: batchCount };
      const result = await api('/api/tags/register', {
        method: 'POST',
        body: payload
      });
      const registrationData = {
        id: result.id,
        type: 'batch',
        portal: selectedPortal,
        ...payload
      };
      // Store registration ID for RFID assignment
      setPendingBatchPayload(prev => ({ ...prev, registrationId: result.id }));
      setMsg('✅ Registration successful! Proceeding to tag assignment...');
      setTimeout(() => {
        onRegistrationComplete(registrationData);
      }, 1200);
    } catch (error) {
      setMsg(`❌ Registration failed: ${error.message}`);
    } finally {
      setBusy(false);
    }
  };

  function handleBack() {
    setShowConfirm(true);
  }

  function confirmBackToPortal() {
    setShowConfirm(false);
    // Reset all registration state
    setCurrentStep('type-selection');
    setRegistrationType('');
    setSelectedProvince('');
    setSelectedDistrict('');
    setAgeRange('');
    setSex('');
    setLanguage('');
    setBatchType('');
    setSelectedSchool('');
    setSelectedUniversity('');
    setSelectedLanguages([]);
    setBatchCount(0);
    setPendingBatchPayload(null);
    // Actually go to portal selection page
    if (typeof onBack === 'function') {
      onBack('portal-selection');
    }
  }

  function cancelBackToPortal() {
    setShowConfirm(false);
  }

  const renderTypeSelection = () => (
    <div>
      <h3 style={{ marginTop: 0 }}>Registration Type</h3>
      <div className="small mut" style={{ marginBottom: 12 }}>Portal: <b>{selectedPortal}</b></div>
      <label style={{ display: 'block', marginBottom: 6 }}>Select Registration Type</label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`btn ${registrationType === 'individual' ? 'primary' : ''}`}
          onClick={() => handleTypeSelection('individual')}
        >
          Individual Registration
        </button>
        <button
          type="button"
          className={`btn ${registrationType === 'batch' ? 'primary' : ''}`}
          onClick={() => handleTypeSelection('batch')}
        >
          Batch Registration
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => setCurrentStep('admin')}
        >
          Admin Portal
        </button>
        <div style={{ flex: 1 }} />
        <button type="button" className="btn" onClick={handleBack}>Back</button>
      </div>
    </div>
  );

  const renderIndividualForm = () => (
    <div>
      <h3 style={{ marginTop: 0 }}>Individual Registration</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button type="button" className="btn" onClick={handleBack}>Back</button>
      </div>

      <form onSubmit={handleIndividualSubmit}>
        <label>Province</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {provinces.map((province) => (
            <button
              key={province}
              type="button"
              className={`btn ${selectedProvince === province ? 'primary' : ''}`}
              onClick={() => setSelectedProvince(province)}
            >
              {province}
            </button>
          ))}
        </div>

        <SelectField
          label="District"
          options={districts.map((d) => ({ value: d, label: d }))}
          value={selectedDistrict}
          onChange={setSelectedDistrict}
          disabled={!selectedProvince}
        />

        <label>Age Range</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {[
            { value: "child", label: "Child" },
            { value: "teenager", label: "Teenager" },
            { value: "adult", label: "Adult" },
            { value: "senior", label: "Senior" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              className={`btn ${ageRange === option.value ? 'primary' : ''}`}
              onClick={() => setAgeRange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <label>Sex</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {[
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
            { value: "other", label: "Other" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              className={`btn ${sex === option.value ? 'primary' : ''}`}
              onClick={() => setSex(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <label>Language</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {[
            { value: "tamil", label: "Tamil" },
            { value: "sinhala", label: "Sinhala" },
            { value: "english", label: "English" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              className={`btn ${language === option.value ? 'primary' : ''}`}
              onClick={() => setLanguage(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <button type="submit" className="btn primary" disabled={busy}>
          Register
        </button>
      </form>

      {msg && (
        <div className="small mut" style={{ marginTop: 12 }}>{msg}</div>
      )}
    </div>
  );

  const renderBatchForm = () => (
    <div>
      <h3 style={{ marginTop: 0 }}>Batch Registration</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button type="button" className="btn" onClick={handleBack}>Back</button>
      </div>

      <form onSubmit={handleBatchSubmit}>
        <label>Select Type</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {[
            { value: "school", label: "School" },
            { value: "university", label: "University" },
            { value: "general", label: "General People" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              className={`btn ${batchType === option.value ? 'primary' : ''}`}
              onClick={() => setBatchType(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        {batchType === "school" && (
          <>
            <label>Province</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {provinces.map((province) => (
                <button
                  key={province}
                  type="button"
                  className={`btn ${selectedProvince === province ? 'primary' : ''}`}
                  onClick={() => setSelectedProvince(province)}
                >
                  {province}
                </button>
              ))}
            </div>
            
            <SelectField
              label="District"
              options={districts.map((d) => ({ value: d, label: d }))}
              value={selectedDistrict}
              onChange={setSelectedDistrict}
              disabled={!selectedProvince}
            />
            
            <SearchableSelect
              label="School"
              options={schools}
              value={selectedSchool}
              onChange={setSelectedSchool}
              disabled={!selectedDistrict}
              placeholder="Search for a school..."
            />
          </>
        )}

        {batchType === "university" && (
          <SearchableSelect
            label="University"
            options={universities}
            value={selectedUniversity}
            onChange={setSelectedUniversity}
            placeholder="Search for a university..."
          />
        )}

        {batchType === "general" && (
          <>
            <label>Province</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {provinces.map((province) => (
                <button
                  key={province}
                  type="button"
                  className={`btn ${selectedProvince === province ? 'primary' : ''}`}
                  onClick={() => setSelectedProvince(province)}
                >
                  {province}
                </button>
              ))}
            </div>
            
            <SelectField
              label="District"
              options={districts.map((d) => ({ value: d, label: d }))}
              value={selectedDistrict}
              onChange={setSelectedDistrict}
              disabled={!selectedProvince}
            />
          </>
        )}

        {batchType && (
          <>
            <label>Languages (Select up to 2)</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {[
                { value: "tamil", label: "Tamil" },
                { value: "sinhala", label: "Sinhala" },
                { value: "english", label: "English" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`btn ${selectedLanguages.includes(option.value) ? 'primary' : ''}`}
                  onClick={() => handleLanguageToggle(option.value)}
                  disabled={selectedLanguages.length >= 2 && !selectedLanguages.includes(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </>
        )}

        <button type="submit" className="btn primary" disabled={busy}>
          Continue to RFID Count
        </button>
      </form>

      {msg && (
        <div className="small mut" style={{ marginTop: 12 }}>{msg}</div>
      )}
    </div>
  );

  const renderBatchCount = () => (
    <div>
      <h3 style={{ marginTop: 0 }}>Count Batch Members</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button type="button" className="btn" onClick={() => setCurrentStep('batch-form')}>Back</button>
      </div>

      <div style={{ textAlign: 'center', margin: '24px 0' }}>
        <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--pri)' }}>{batchCount}</div>
        <div className="mut">Members Counted</div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <button className="btn primary" onClick={handleRfidTap} disabled={busy}>Tap RFID Card</button>
      </div>

      <div style={{ textAlign: 'center' }}>
        <button className="btn ok" onClick={handleBatchCountComplete} disabled={busy || batchCount === 0}>
          Complete Registration ({batchCount})
        </button>
      </div>

      {msg && (
        <div className="small mut" style={{ marginTop: 12, textAlign: 'center' }}>{msg}</div>
      )}
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'type-selection':
        return renderTypeSelection();
      case 'individual-form':
        return renderIndividualForm();
      case 'batch-form':
        return renderBatchForm();
      case 'batch-count':
        return renderBatchCount();
      case 'admin':
        return (
          <div>
            <div style={{ display:'flex', gap:8, marginBottom:12 }}>
              <button type="button" className="btn" onClick={() => setCurrentStep('type-selection')}>Back</button>
            </div>
            <AdminPortal />
          </div>
        );
      default:
        return renderTypeSelection();
    }
  };

  return (
    <>
      {renderCurrentStep()}
      {showConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(13,20,38,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#182447', padding: 32, borderRadius: 12, boxShadow: '0 4px 24px #0008', minWidth: 320 }}>
            <h4 style={{ marginTop: 0 }}>Leave Registration?</h4>
            <div style={{ marginBottom: 18 }}>
              Going back to portal selection will <b>discard all current registration progress</b>.<br />
              Do you want to continue?
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={cancelBackToPortal}>Stay Here</button>
              <button className="btn primary" onClick={confirmBackToPortal}>Leave & Go to Portal Selection</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}