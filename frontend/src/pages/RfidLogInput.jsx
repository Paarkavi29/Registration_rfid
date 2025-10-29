import { useState } from 'react';
import { api } from '../api';
import '../form.css';

export default function RfidLogInput() {
  const [formData, setFormData] = useState({
    reader: '',  // This will be used as the label (REGISTER, EXIT, etc)
    portal: '',
    tag: ''      // This will be the rfid_card_id
  });
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;

    // Basic validation
    if (!formData.reader || !formData.portal || !formData.tag) {
      setMsg('❌ All fields are required');
      return;
    }

    setBusy(true);
    setMsg('');

    try {
      const result = await api('/api/tags/rfidRead', {
        method: 'POST',
        body: formData
      });

      if (result.status === 'success') {
        setMsg(`✅ Log entry created successfully`);
        // Clear form after successful submission
        setFormData({
          reader: '',
          portal: '',
          tag: ''
        });
      } else {
        throw new Error('Failed to create log entry');
      }
    } catch (error) {
      setMsg(`❌ Error: ${error.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '500px', margin: '40px auto', padding: '20px' }}>
      <h2>RFID Log Entry</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Reader Type (Label)</label>
          <select
            name="reader"
            value={formData.reader}
            onChange={handleChange}
            disabled={busy}
          >
            <option value="">Select Reader Type</option>
            <option value="REGISTER">REGISTER</option>
            <option value="EXIT">EXIT</option>
            <option value="EXITOUT">EXITOUT</option>
          </select>
        </div>

        <div className="form-group">
          <label>Portal</label>
          <input
            type="text"
            name="portal"
            value={formData.portal}
            onChange={handleChange}
            placeholder="Enter portal (e.g., portal1)"
            disabled={busy}
          />
        </div>

        <div className="form-group">
          <label>RFID Card ID</label>
          <input
            type="text"
            name="tag"
            value={formData.tag}
            onChange={handleChange}
            placeholder="Enter RFID card ID"
            disabled={busy}
          />
        </div>

        <button 
          type="submit" 
          className="btn primary" 
          disabled={busy}
          style={{ width: '100%', marginTop: '20px' }}
        >
          Submit Log Entry
        </button>

        {msg && (
          <div className="message" style={{ 
            marginTop: '20px',
            padding: '10px',
            borderRadius: '4px',
            backgroundColor: msg.startsWith('✅') ? '#e7f4e8' : '#fee7e7',
            color: msg.startsWith('✅') ? '#2d6a39' : '#cc0000'
          }}>
            {msg}
          </div>
        )}
      </form>
    </div>
  );
}