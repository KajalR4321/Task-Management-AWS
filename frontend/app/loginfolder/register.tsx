'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, CheckSquare, Check } from 'lucide-react';
import { auth } from '@/lib/auth';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const passwordChecks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };
  const passwordValid = Object.values(passwordChecks).every(Boolean);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password || !confirm) { setError('Please fill in all fields.'); return; }
    if (!passwordValid) { setError('Password does not meet requirements.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      const userId = `user-${Date.now()}`;
      auth.setUser({ userId, name, email, token: `token-${userId}` });

      // Show success notification
      setSuccess(true);

      // Redirect after 2 seconds
      setTimeout(() => { router.push('/'); }, 2000);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f13 0%, #1a0f2e 50%, #0f1a2e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background decorative circles */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,106,247,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,222,128,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Success Notification */}
      {success && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 1000,
          background: 'linear-gradient(135deg, rgba(74,222,128,0.15), rgba(74,222,128,0.05))',
          border: '1px solid rgba(74,222,128,0.4)',
          borderRadius: 14, padding: '1rem 1.25rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(74,222,128,0.15)',
          animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(74,222,128,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={16} color="#4ade80" />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#4ade80' }}>Account Created! 🎉</p>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>Welcome {name}! Redirecting...</p>
          </div>
        </div>
      )}

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, background: 'linear-gradient(135deg, #7c6af7, #9d8fff)', borderRadius: 16, marginBottom: '0.75rem', boxShadow: '0 8px 32px rgba(124,106,247,0.35)' }}>
            <CheckSquare size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>TaskFlow</h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Create your free workspace today</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: '2rem',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>Create account</h2>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1.5rem' }}>Fill in your details to get started</p>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Name */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
              <input type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} autoFocus
                style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 10, fontSize: '0.875rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', transition: 'all 0.2s' }}
                onFocus={e => e.target.style.borderColor = 'rgba(124,106,247,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>

            {/* Email */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
                style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 10, fontSize: '0.875rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', transition: 'all 0.2s' }}
                onFocus={e => e.target.style.borderColor = 'rgba(124,106,247,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem 2.8rem 0.7rem 1rem', borderRadius: 10, fontSize: '0.875rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', transition: 'all 0.2s' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(124,106,247,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password strength checks */}
              {password && (
                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {[
                    { ok: passwordChecks.length, label: 'At least 8 characters' },
                    { ok: passwordChecks.upper, label: 'One uppercase letter' },
                    { ok: passwordChecks.number, label: 'One number' },
                  ].map(({ ok, label }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: ok ? '#4ade80' : 'rgba(255,255,255,0.35)' }}>
                      <div style={{ width: 14, height: 14, borderRadius: '50%', background: ok ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Check size={9} style={{ opacity: ok ? 1 : 0 }} />
                      </div>
                      {label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confirm Password</label>
              <input type={showPassword ? 'text' : 'password'} placeholder="Repeat your password" value={confirm} onChange={e => setConfirm(e.target.value)}
                style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 10, fontSize: '0.875rem', background: 'rgba(255,255,255,0.06)', border: confirm && confirm !== password ? '1px solid rgba(249,112,102,0.5)' : '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', transition: 'all 0.2s' }}
                onFocus={e => e.target.style.borderColor = 'rgba(124,106,247,0.6)'}
                onBlur={e => e.target.style.borderColor = confirm && confirm !== password ? 'rgba(249,112,102,0.5)' : 'rgba(255,255,255,0.1)'} />
              {confirm && confirm !== password && (
                <p style={{ fontSize: '0.75rem', color: '#f97066', marginTop: '0.25rem' }}>Passwords do not match</p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: 'rgba(249,112,102,0.1)', border: '1px solid rgba(249,112,102,0.3)', borderRadius: 10, padding: '0.65rem 1rem', fontSize: '0.82rem', color: '#f97066' }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: '0.75rem', borderRadius: 10, border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                background: loading ? 'rgba(124,106,247,0.5)' : 'linear-gradient(135deg, #7c6af7, #9d8fff)',
                color: 'white', fontSize: '0.9rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: loading ? 'none' : '0 8px 24px rgba(124,106,247,0.35)',
                transition: 'all 0.2s', marginTop: '0.25rem',
              }}>
              {loading ? <><Loader2 size={16} className="spinner" /> Creating account...</> : 'Create Account →'}
            </button>
          </form>
        </div>

        {/* Login link */}
        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.35)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#9d8fff', fontWeight: 600, textDecoration: 'none' }}>
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
}