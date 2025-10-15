import { useState } from 'react';
import { api } from '../api';

export default function AdminPanel() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState('');

  async function listCards() {
    setMsg('');
    try {
      const r = await api('/api/tags/list-cards');
      setRows(r);
    } catch (e) { setMsg(e.message); }
  }

  // Removed release function and button, as tag release is handled automatically by backend

  return (
    <aside className="card">
      <h3 style={{marginTop:0}}>Admin</h3>
      <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
        <button className="btn" onClick={listCards}>List Cards</button>
      </div>

      <div className="hr" />
      <div className="list small">
        {rows.length === 0 ? (
          <div className="mut small">No cards yet.</div>
        ) : (
          <table>
            <thead>
              <tr><th>Card</th><th>Status</th><th>Holder</th></tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.rfid_card_id}>
                  <td className="mono">{r.rfid_card_id}</td>
                  <td>{r.status}</td>
                  <td>
                    {r.user_id ? <>User #{r.user_id} ({r.user_name || '—'})</>
                    : r.group_id ? <>Group #{r.group_id} ({r.organization || '—'})</>
                    : <span className="mut">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="small mut" style={{marginTop:10}}>{msg}</div>
    </aside>
  );
}
