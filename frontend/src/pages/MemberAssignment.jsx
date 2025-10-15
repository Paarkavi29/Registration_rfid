import { useState } from 'react';
import { api } from '../api';

export default function MemberAssignment({ portal, leaderId, memberCount, onDone }) {
  const [assigned, setAssigned] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [errors, setErrors] = useState([]);

  async function assignMemberTag() {
    setBusy(true);
    setMsg('');
    try {
      const link = await api('/api/tags/link', {
        method: 'POST',
        body: { portal, leaderId, asLeader: false }
      });
      setAssigned(a => a + 1);
      setMsg(`✅ Member ${assigned + 1} assigned tag ${link.tagId}`);
    } catch (e) {
      setErrors(errs => [...errs, `❌ Member ${assigned + 1}: ${e.message}`]);
      setMsg(`❌ ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  if (assigned >= memberCount) {
    return (
      <div>
        <h3>All members assigned!</h3>
        <ul>
          {errors.map((err, i) => <li key={i} style={{ color: 'red' }}>{err}</li>)}
        </ul>
        <div className="row" style={{ marginTop: 10 }}>
          <button className="btn primary" onClick={onDone}>Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3>Assign RFID Tag to Member {assigned + 1} of {memberCount}</h3>
      <div className="row" style={{ marginTop: 10 }}>
        <button className="btn primary" onClick={assignMemberTag} disabled={busy}>
          Assign Tag
        </button>
      </div>
      <div className="small mut" style={{ marginTop: 10 }}>{msg}</div>
      <div className="hr" />
      <ul>
        {errors.map((err, i) => <li key={i} style={{ color: 'red' }}>{err}</li>)}
      </ul>
    </div>
  );
}
