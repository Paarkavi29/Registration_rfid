import { useState } from 'react';
import { api } from '../api';
import MemberAssignment from './MemberAssignment';

export default function RegistrationForm() {
  const [portal, setPortal] = useState('');
  const [name, setName] = useState('');
  const [count, setCount] = useState(0); // Start at 0, increment as tags are assigned
  const [pendingLeaderId, setPendingLeaderId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [showMemberAssign, setShowMemberAssign] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [leaderIdForMembers, setLeaderIdForMembers] = useState(null);

  async function registerAndLink() {
    if (busy) return;
    setMsg('');
    setBusy(true);
    try {
      let leaderId = pendingLeaderId;
      if (!leaderId) {
        if (!portal.trim()) throw new Error('Portal is required');
        if (!name.trim()) throw new Error('Name is required');
        const reg = await api('/api/tags/register', {
          method: 'POST',
          body: {
            portal,
            name,
            group_size: 1,
            province: null,
            district: null,
            school: null,
            university: null,
            age_range: null,
            sex: null,
            lang: null
          }
        });
        leaderId = reg.id;
        setPendingLeaderId(leaderId);
      }
      const link = await api('/api/tags/link', {
        method: 'POST',
        body: { portal, leaderId, asLeader: true }
      });
      setMsg(`✅ Tag #${leaderId} linked with tag ${link.tagId}`);
      setCount(prev => prev + 1);
    } catch (e) {
      setMsg(`❌ ${e.message}${pendingLeaderId ? ` (kept as #${pendingLeaderId})` : ''}`);
    } finally {
      setBusy(false);
    }
  }

  function resetForm() {
    setPendingLeaderId(null);
    setCount(0);
    setName('');
    setMsg('🔁 Reset — you can create a new registration now.');
  }

  async function confirmAndExit() {
    if (busy || count === 0) return;
    setBusy(true);
    setMsg('');
    try {
      await api('/api/tags/updateCount', {
        method: 'POST',
        body: {
          portal,
          count,
        },
      });
      setMsg('✅ Count updated and exiting...');
      setTimeout(() => {
        setPortal('');
        setName('');
        setCount(0);
        setPendingLeaderId(null);
        setBusy(false);
        setMsg('');
      }, 1500);
    } catch (err) {
      setMsg('❌ Error updating count: ' + err.message);
      setBusy(false);
    }
  }

  if (showMemberAssign && leaderIdForMembers) {
    return (
      <MemberAssignment
        portal={portal}
        leaderId={leaderIdForMembers}
        memberCount={memberCount}
        onDone={() => {
          setShowMemberAssign(false);
          resetForm();
        }}
      />
    );
  }

  return (
    <div>
      <h3>RFID Registration</h3>

      <label>Portal</label>
      <input
        value={portal}
        onChange={e => setPortal(e.target.value)}
        placeholder="Portal name (e.g., portal1)"
        disabled={!!pendingLeaderId}
      />

      <label>Name</label>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Leader/Individual name"
        disabled={!!pendingLeaderId}
      />
      <div style={{ margin: '10px 0', fontWeight: 'bold' }}>
        Tags assigned: <span style={{ color: 'blue' }}>{count}</span>
      </div>

      <div className="row" style={{ marginTop: 10 }}>
  <button className="btn primary" onClick={registerAndLink} disabled={busy || !name.trim()}>
    {msg.startsWith('❌') ? 'Retry Linking' : 'Submit & Assign Tag'}
  </button>
        <button className="btn" onClick={confirmAndExit} disabled={busy || count === 0} style={{ marginLeft: 10 }}>
          Confirm and Exit
        </button>
      </div>
      {pendingLeaderId && (
        <div className="right">
          <button className="btn" onClick={resetForm} disabled={busy}>Start New Registration</button>
        </div>
      )}

      <div className="hr" />

      <div className="small mut" style={{ marginTop: 10 }}>
        {pendingLeaderId && <>Pending Registration: <b>#{pendingLeaderId}</b> • </>}
        {msg}
      </div>
    </div>
  );
}

