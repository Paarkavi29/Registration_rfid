import { useState } from 'react';
import { api } from '../api';
import MemberAssignment from './MemberAssignment';
import AdminPanel from './AdminPanel';

export default function TagAssignment({ registrationData, selectedPortal, onComplete }) {
  const [step, setStep] = useState('leader'); // leader | members
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const isIndividual = registrationData?.type === 'individual';
  const totalMembers = isIndividual ? 1 : (registrationData?.group_size || 0);

  async function submitAndAssign() {
    if (busy) return;
    setBusy(true);
    setMsg('');
    try {
      const res = await api('/api/tags/link', {
        method: 'POST',
        body: {
          portal: selectedPortal,
          leaderId: registrationData.id,
          asLeader: true
        }
      });
      setMsg(`✅ Leader tag assigned: ${res.tagId}`);
      if (isIndividual) {
        onComplete();
      } else {
        setStep('members');
      }
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  function confirmAndExit() {
    onComplete();
  }

  function startNewRegistration() {
    onComplete();
  }

  if (step === 'members') {
    return (
      <MemberAssignment
        portal={selectedPortal}
        leaderId={registrationData.id}
        memberCount={Math.max(0, totalMembers - 1)}
        onDone={onComplete}
      />
    );
  }

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>RFID Tag Assignment</h3>

      <div className="row" style={{ marginTop: 10 }}>
        <button className="btn primary" onClick={submitAndAssign} disabled={busy}>
          {busy ? 'Assigning…' : 'Submit & Assign'}
        </button>
        <button className="btn" onClick={confirmAndExit} disabled={busy}>Confirm and Exit</button>
      </div>

      <div style={{ marginTop: 10 }}>
        <button className="btn" onClick={startNewRegistration} disabled={busy}>Start New Registration</button>
      </div>

      <div className="small mut" style={{ marginTop: 10 }}>{msg}</div>

      <div className="hr" />
      <AdminPanel/>
    </div>
  );
}