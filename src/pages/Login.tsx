import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogIn, Fingerprint, AlertCircle } from 'lucide-react';
import { startAuthentication } from '@simplewebauthn/browser';

declare global {
  interface Window {
    google?: any;
    FB?: any;
    fbAsyncInit?: () => void;
  }
}

export const Login: React.FC = () => {
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  // Environment variables
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID;

  // State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [passkeyEmail, setPasskeyEmail] = useState('');
  const [showPasskeyPrompt, setShowPasskeyPrompt] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      navigate(redirect);
    }
  }, [token, navigate, redirect]);

  // Handle standard credentials login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        setSuccess('Logged in successfully!');
        setTimeout(() => navigate(redirect), 800);
      } else {
        setError(data.message || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      setError('Network error. Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Mock Social Logins (Google / Facebook)
  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    setError('');
    setLoading(true);

    try {
      // Simulate OAuth response
      const mockName = provider === 'google' ? 'Google User' : 'Facebook User';
      const mockEmail = provider === 'google' ? 'googleuser@example.com' : 'facebookuser@example.com';

      const res = await fetch('/api/auth/oauth-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: mockEmail,
          name: mockName,
          provider
        })
      });

      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        setSuccess(`Successfully signed in via ${provider === 'google' ? 'Google' : 'Facebook'} (Sandbox Mode)!`);
        setTimeout(() => navigate(redirect), 800);
      } else {
        setError(data.message || 'OAuth verification failed.');
      }
    } catch (err) {
      setError('Network error. Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Real Google Login response
  const handleGoogleCredentialResponse = async (response: any) => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        setSuccess('Successfully signed in via Google!');
        setTimeout(() => navigate(redirect), 800);
      } else {
        setError(data.message || 'Google OAuth verification failed on server.');
      }
    } catch (err) {
      setError('Network error. Failed to verify Google account.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Real Facebook Login response
  const handleFacebookLoginResponse = async (accessToken: string) => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/facebook-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        setSuccess('Successfully signed in via Facebook!');
        setTimeout(() => navigate(redirect), 800);
      } else {
        setError(data.message || 'Facebook OAuth verification failed on server.');
      }
    } catch (err) {
      setError('Network error. Failed to verify Facebook account.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger Facebook Login SDK Flow
  const handleFacebookSDKLogin = () => {
    if (!facebookAppId) {
      // Graceful fallback to sandbox simulation
      setSuccess('No App ID configured. Launching sandbox fallback...');
      handleOAuthLogin('facebook');
      return;
    }

    if (window.FB) {
      window.FB.login((response: any) => {
        if (response.authResponse) {
          handleFacebookLoginResponse(response.authResponse.accessToken);
        } else {
          setError('Facebook login was cancelled or failed.');
        }
      }, { scope: 'email,public_profile' });
    } else {
      setError('Facebook SDK has not loaded yet. Please try again.');
    }
  };

  // Initialize SDKs on mount
  useEffect(() => {
    // 1. Initialize Google Identity Services
    if (googleClientId && window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('googleSignInButton'),
          { theme: 'outline', size: 'large', width: '220' }
        );
      } catch (err) {
        console.error('Failed to initialize Google SDK:', err);
      }
    }

    // 2. Initialize Facebook SDK
    if (facebookAppId) {
      window.fbAsyncInit = function() {
        if (window.FB) {
          window.FB.init({
            appId      : facebookAppId,
            cookie     : true,
            xfbml      : true,
            version    : 'v18.0'
          });
        }
      };

      if (window.FB) {
        try {
          window.FB.init({
            appId      : facebookAppId,
            cookie     : true,
            xfbml      : true,
            version    : 'v18.0'
          });
        } catch (err) {
          console.error('Failed to initialize Facebook SDK:', err);
        }
      }
    }
  }, [googleClientId, facebookAppId]);

  // Handle Passkey Biometric Login
  const handlePasskeyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passkeyEmail) {
      setError('Please provide your email to login with passkey.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // 1. Get options from backend
      const optionsRes = await fetch('/api/auth/passkey/login-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: passkeyEmail })
      });

      if (!optionsRes.ok) {
        const errorData = await optionsRes.json();
        throw new Error(errorData.message || 'Failed to get passkey authentication options.');
      }

      const optionsJSON = await optionsRes.json();

      // 2. Authenticate with browser biometric keys
      const credential = await startAuthentication(optionsJSON);

      // 3. Verify on backend
      const verifyRes = await fetch('/api/auth/passkey/login-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: passkeyEmail,
          credential
        })
      });

      const verifyData = await verifyRes.json();
      if (verifyRes.ok && verifyData.verified) {
        login(verifyData.token, verifyData.user);
        setSuccess('Passkey Biometric login verified successfully!');
        setTimeout(() => navigate(redirect), 800);
      } else {
        setError(verifyData.message || 'Passkey verification failed on server.');
      }
    } catch (err: any) {
      setError(err.message || 'Passkey login cancelled or failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-app-text">Welcome Back</h1>
        <p className="text-sm text-gray-500">Sign in to manage your shopping cart and check out</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-4 text-xs font-semibold text-red-500 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/25 rounded-2xl p-4 text-xs font-semibold text-green-600 flex items-center gap-2 animate-pulse">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Login Form Panel */}
      <div className="glass-panel p-6 rounded-3xl space-y-5">
        {!showPasskeyPrompt ? (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-app-text"
                placeholder="e.g. customer@example.com"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-xs font-bold text-gray-400 uppercase">Password</label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-app-text"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-full flex items-center justify-center gap-2 shadow transition-all"
            >
              <LogIn className="h-5 w-5" />
              <span>Sign In</span>
            </button>
          </form>
        ) : (
          /* Passkey Input Drawer */
          <form onSubmit={handlePasskeyLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Registered Email</label>
              <input
                type="email"
                required
                value={passkeyEmail}
                onChange={(e) => setPasskeyEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-app-text"
                placeholder="e.g. john@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-3 rounded-full flex items-center justify-center gap-2 shadow transition-all"
            >
              <Fingerprint className="h-5 w-5" />
              <span>Authenticate Biometrics</span>
            </button>
          </form>
        )}

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-app-border"></div>
          <span className="flex-shrink mx-4 text-xs font-semibold text-gray-450 uppercase">Or Continue With</span>
          <div className="flex-grow border-t border-app-border"></div>
        </div>

        {/* Biometric & Social Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => setShowPasskeyPrompt(!showPasskeyPrompt)}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-app-border bg-glass-bg text-xs font-bold text-app-text hover:border-indigo-500/50 transition-all"
          >
            <Fingerprint className="h-4 w-4 text-indigo-500" />
            <span>{showPasskeyPrompt ? 'Use Email Password' : 'Use Passkey Login'}</span>
          </button>

          {googleClientId ? (
            <div className="flex justify-center items-center py-1 px-4 rounded-xl border border-app-border bg-glass-bg hover:border-red-500/50 transition-all">
              <div id="googleSignInButton" className="w-full flex justify-center"></div>
            </div>
          ) : (
            <button
              onClick={() => {
                setSuccess('No Google Client ID configured. Launching sandbox fallback...');
                handleOAuthLogin('google');
              }}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-app-border bg-glass-bg text-xs font-bold text-app-text hover:border-red-500/50 transition-all"
            >
              <svg className="h-4 w-4 text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C18.155 1.25 15.425 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.89 11.57-11.79 0-.795-.085-1.4-.195-1.925H12.24z"/></svg>
              <span>Google Login (Mock)</span>
            </button>
          )}

          <button
            onClick={handleFacebookSDKLogin}
            className="sm:col-span-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-app-border bg-glass-bg text-xs font-bold text-app-text hover:border-blue-500/50 transition-all"
          >
            <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            <span>{facebookAppId ? 'Facebook Login' : 'Facebook Login (Mock)'}</span>
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-gray-500">
        <span>Don't have an account? </span>
        <Link to={`/register?redirect=${encodeURIComponent(redirect)}`} className="text-primary font-bold hover:underline">
          Register Here
        </Link>
      </div>
    </div>
  );
};
