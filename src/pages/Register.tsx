import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserPlus, Fingerprint, AlertCircle } from 'lucide-react';
import { startRegistration } from '@simplewebauthn/browser';

export const Register: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  // Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // States for post-register Passkey registration offer
  const [registeredUser, setRegisteredUser] = useState<any>(null);
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, confirmPassword })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('Account created successfully!');
        setRegisteredUser(data); // Save credentials to prompt passkey registration
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      setError('Network error. Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  // Perform Passkey enrollment
  const handleRegisterPasskey = async () => {
    if (!registeredUser) return;
    setError('');
    setPasskeyLoading(true);

    try {
      // 1. Get registration options from backend
      const optionsRes = await fetch('/api/auth/passkey/register-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registeredUser.user.email,
          name: registeredUser.user.name
        })
      });

      if (!optionsRes.ok) {
        const errorData = await optionsRes.json();
        throw new Error(errorData.message || 'Failed to retrieve passkey registration options.');
      }

      const optionsJSON = await optionsRes.json();

      // 2. Call browser WebAuthn API to register new credential
      const credential = await startRegistration(optionsJSON);

      // 3. Verify on backend
      const verifyRes = await fetch('/api/auth/passkey/register-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registeredUser.user.email,
          credential
        })
      });

      const verifyData = await verifyRes.json();
      if (verifyRes.ok && verifyData.verified) {
        setSuccess('Passkey registered successfully! Logging you in...');
        login(registeredUser.token, registeredUser.user);
        setTimeout(() => navigate(redirect), 1200);
      } else {
        setError(verifyData.message || 'Passkey verification failed on server.');
      }
    } catch (err: any) {
      setError(err.message || 'Passkey enrollment was cancelled or failed.');
    } finally {
      setPasskeyLoading(false);
    }
  };

  const handleSkipPasskey = () => {
    if (registeredUser) {
      login(registeredUser.token, registeredUser.user);
      navigate(redirect);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-app-text">Create Account</h1>
        <p className="text-sm text-gray-500">Sign up to buy fresh groceries and organic products</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-4 text-xs font-semibold text-red-500 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/25 rounded-2xl p-4 text-xs font-semibold text-green-600 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Container Panel */}
      <div className="glass-panel p-6 rounded-3xl space-y-5">
        {!registeredUser ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-app-text"
                placeholder="e.g. John Doe"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-app-text"
                placeholder="e.g. john@example.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-app-text"
                placeholder="e.g. +1 (555) 019-2834"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-app-text"
                placeholder="Minimum 6 characters"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-app-text"
                placeholder="Repeat password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-full flex items-center justify-center gap-2 shadow transition-all"
            >
              <UserPlus className="h-5 w-5" />
              <span>Create Account</span>
            </button>
          </form>
        ) : (
          /* Post-Register Passkey Prompt */
          <div className="space-y-5 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-500/10 text-indigo-500 animate-pulse">
              <Fingerprint className="h-8 w-8" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-app-text">Register a Passkey?</h2>
              <p className="text-xs text-gray-500 mt-1">
                Enable secure, biometric logins using your Fingerprint, Face ID, or Windows Hello. Skip passwords next time!
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleRegisterPasskey}
                disabled={passkeyLoading}
                className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-3 rounded-full flex items-center justify-center gap-2 shadow"
              >
                {passkeyLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <>
                    <Fingerprint className="h-5 w-5" />
                    <span>Setup Biometric Passkey</span>
                  </>
                )}
              </button>
              <button
                onClick={handleSkipPasskey}
                className="w-full border border-app-border text-xs text-gray-500 hover:text-app-text hover:bg-gray-100 dark:hover:bg-slate-850 font-semibold py-2.5 rounded-full transition-all"
              >
                Skip For Now
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-gray-500">
        <span>Already have an account? </span>
        <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-primary font-bold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};
