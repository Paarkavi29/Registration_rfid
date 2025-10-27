import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';

export default function AdminPortal() {
  const [registrations, setRegistrations] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState(''); // '', school, university, general
  const [msg, setMsg] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setMsg('');
      try {
        const [regs, rfid] = await Promise.all([
          api('/api/tags/admin/registrations'),
          api('/api/tags/list-cards'),
        ]);

        console.log(regs);
        console.log(rfid);
        setRegistrations(regs || []);
        setCards(rfid || []);
      } catch (e) {
        setMsg(e.message || 'Failed to load admin data');
        console.log(e.message)
      } finally {
        setLoading(false);
      }
    }
     load();
  }, []);

  const computed = useMemo(() => {
    const typeOf = (r) => {
      if (r.school) return 'school';
      if (r.university) return 'university';
      return 'general';
    };

    const totalRecords = registrations.length;
    const totalPeople = registrations.reduce((sum, r) => sum + (Number(r.group_size) || 1), 0);
    const byType = registrations.reduce((acc, r) => {
      const t = typeOf(r);
      acc[t] = (acc[t] || 0) + (Number(r.group_size) || 1);
      return acc;
    }, {});

    const totalTags = cards.length;
    const assignedTags = cards.filter(c => String(c.status).toLowerCase() === 'assigned').length;
    const availableTags = cards.filter(c => String(c.status).toLowerCase() === 'available').length;

    return { totalRecords, totalPeople, byType, totalTags, assignedTags, availableTags };
  }, [registrations, cards]);

  const filtered = useMemo(() => {
    if (!filterType) return registrations;
    return registrations.filter(r => {
      if (filterType === 'school') return !!r.school;
      if (filterType === 'university') return !!r.university;
      return !r.school && !r.university; // general
    });
  }, [registrations, filterType]);

  if (loading) {
    return <div className="mut">Loading admin portal…</div>;
  }

  return (
    <div className="card" style={{ padding: 12}}>
      <h3 style={{ marginTop: 0 }}>Admin Portal</h3>

      {msg && <div className="small mut" style={{ marginBottom: 10 }}>{msg}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
        <div className="card" style={{ padding: 10 }}>
          <div className="small mut">Total Records</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{computed.totalRecords}</div>
        </div>
        <div className="card" style={{ padding: 10 }}>
          <div className="small mut">Total People</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{computed.totalPeople}</div>
        </div>
        <div className="card" style={{ padding: 10 }}>
          <div className="small mut">Individuals (general)</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{computed.byType.general || 0}</div>
        </div>
        <div className="card" style={{ padding: 10 }}>
          <div className="small mut">Batches (school+univ)</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{(computed.byType.school || 0) + (computed.byType.university || 0)}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
        <div className="card" style={{ padding: 10 }}>
          <div className="small mut">Total RFID Tags</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{computed.totalTags}</div>
        </div>
        <div className="card" style={{ padding: 10 }}>
          <div className="small mut">Available Tags</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{computed.availableTags}</div>
        </div>
        <div className="card" style={{ padding: 10 }}>
          <div className="small mut">Assigned Tags</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{computed.assignedTags}</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <label className="small mut">Filter by type:</label>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">All</option>
          <option value="school">School</option>
          <option value="university">University</option>
          <option value="general">General</option>
        </select>
      </div>

      <div className="list small">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Count</th>
              <th>ID</th>
              <th>Portal</th>
              <th>Type</th>
              <th>Province</th>
              <th>District</th>
              <th>School/University</th>
              <th>Age</th>
              <th>Sex</th>
              <th>Size</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => {
              const type = r.school ? 'school' : (r.university ? 'university' : 'general');
              return (
                <tr key={r.id}>
                  <td>{i + 1}</td>
                  <td className="mono">#{r.id}</td>
                  <td>{r.portal}</td>
                  <td>{type}</td>
                  <td>{r.province || '-'}</td>
                  <td>{r.district || '-'}</td>
                  <td>{r.school || r.university || '-'}</td>
                  <td>{r.age_range || '-'}</td>
                  <td>{r.sex || '-'}</td>
                  <td>{r.group_size}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
