'use client';

import { useState, type FormEvent } from 'react';
import { useAdminAuth } from '@/lib/admin-auth';
import { ApiError } from '@/lib/api';

export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      // AdminGate watches the token and redirects to /admin once it's set.
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('E-poçt və ya şifrə yanlışdır.');
      } else if (err instanceof ApiError) {
        setError(`Server xətası (${err.status}). Yenidən cəhd edin.`);
      } else {
        setError('Şəbəkə xətası.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <div className="admin-login-brand">
          <span className="mono">CES</span>
          <span className="brand-sub">ADMIN</span>
        </div>
        <h1>Daxil ol</h1>

        <form onSubmit={onSubmit} className="admin-form">
          <div className="admin-field">
            <label>E-poçt</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
            />
          </div>
          <div className="admin-field">
            <label>Şifrə</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <div className="admin-form-error">{error}</div>}

          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Yoxlanılır…' : 'Daxil ol'}
          </button>
        </form>
      </div>
    </div>
  );
}
