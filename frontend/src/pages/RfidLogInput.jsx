import { useState, useEffect } from 'react';
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
  const [cards, setCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(false);

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

  const loadCards = async () => {
    setLoadingCards(true);
    try {
      const data = await api('/api/tags/list-cards');
      setCards(Array.isArray(data) ? data : []);
    } catch (err) {
      setMsg('❌ Failed to load cards: ' + err.message);
      setCards([]);
    } finally {
      setLoadingCards(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

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

      <div style={{ marginTop: 28 }}>
        <h3 style={{ marginBottom: 8 }}>Available RFID Cards</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <button className="btn" onClick={loadCards} disabled={loadingCards}>Refresh</button>
          <div style={{ flex: 1 }} />
          {loadingCards && <div className="mut">Loading…</div>}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid #ddd' }}>Card ID</th>
                <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid #ddd' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {cards.length === 0 && (
                <tr>
                  <td colSpan={2} style={{ padding: '10px 8px', color: '#666' }}>No cards found</td>
                </tr>
              )}
              {cards.map((c) => (
                <tr key={c.rfid_card_id}>
                  <td style={{ padding: '8px', borderBottom: '1px solid #f1f1f1' }}>{c.rfid_card_id}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #f1f1f1' }}>{c.status || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}