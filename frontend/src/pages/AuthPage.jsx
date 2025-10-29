import { useState } from 'react';
import '../auth.css';
import { useAuth } from '../auth/AuthContext';

export default function AuthPage() {
  const { login, signup, loading, error } = useAuth();
  const [mode, setMode] = useState('signin'); // signin | signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPw, setShowPw] = useState(false);

  const isValid = () => {
    const okEmail = /.+@.+\..+/.test(email);
    const okPw = String(password).length >= 6;
    if (mode === 'signup') {
      return okEmail && okPw && fullName.trim().length >= 2;
    }
    return okEmail && okPw;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValid()) return;
    if (mode === 'signin') {
      await login(email, password);
    } else {
      await signup(email, password, fullName);
    }
  }

  return (
    <div className="auth-layout">
      <aside className="brand-pane">
        <div className="logo-circle">RF</div>
        <h2 className="brand-title">RFID Registration</h2>
        <p className="brand-subtitle">Secure access for authorized staff.</p>
        <ul className="brand-points">
          <li>Encrypted authentication</li>
          <li>Role-ready accounts</li>
          <li>Fast and reliable</li>
        </ul>
      </aside>

      <div className="auth-card">
        <div className="auth-header">
          <div className="tabs" role="tablist">
            <button className={mode==='signin' ? 'tab active' : 'tab'} onClick={() => setMode('signin')} role="tab" aria-selected={mode==='signin'}>Sign In</button>
            <button className={mode==='signup' ? 'tab active' : 'tab'} onClick={() => setMode('signup')} role="tab" aria-selected={mode==='signup'}>Sign Up</button>
          </div>
          <p className="mut">{mode==='signin' ? 'Welcome back. Enter your credentials.' : 'Create your account to continue.'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {mode === 'signup' && (
            <div className="field">
              <label htmlFor="fullName">Full name</label>
              <input id="fullName" type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Doe" required />
            </div>
          )}
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" autoComplete="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="pw-wrap">
              <input id="password" autoComplete={mode==='signin' ? 'current-password' : 'new-password'} type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" required />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(s => !s)} aria-label={showPw ? 'Hide password' : 'Show password'}>
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error && <div className="error" role="alert">{error}</div>}

          <div className="auth-actions">
            <button type="submit" className="btn primary lg" disabled={loading || !isValid()}>
              {loading ? 'Please wait…' : (mode === 'signin' ? 'Sign In' : 'Create Account')}
            </button>
          </div>

          <p className="helper mut">
            By continuing you agree to the acceptable use policy.
          </p>
        </form>
      </div>
    </div>
  );
}
