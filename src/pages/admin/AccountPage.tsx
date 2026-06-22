import { useState } from 'react';
import { changeAdminPassword } from '../../adminApi';
import { useAdmin } from '../../AdminApp';

export function AccountPage() {
  const { showToast } = useAdmin();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) return;

    if (newPassword !== confirmPassword) {
      showToast('error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      showToast('error', 'New password must be at least 6 characters');
      return;
    }

    // Verify current password matches what's stored
    const stored = localStorage.getItem('admin_token') || '';
    if (currentPassword !== stored) {
      showToast('error', 'Current password is incorrect');
      return;
    }

    setLoading(true);
    try {
      await changeAdminPassword(newPassword);
      showToast('success', 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '12px 44px 12px 16px',
    borderRadius: 10,
    color: '#fff',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      {/* Profile Card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.1))',
        border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: 16,
        padding: '28px 32px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 20,
      }}>
        <div style={{
          width: 64,
          height: 64,
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          flexShrink: 0,
          boxShadow: '0 0 24px rgba(99,102,241,0.4)',
        }}>
          👤
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Admin</div>
          <div style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <span style={{
              width: 8, height: 8,
              background: '#22c55e',
              borderRadius: '50%',
              display: 'inline-block',
              boxShadow: '0 0 6px #22c55e',
            }} />
            Active Session
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: '28px 32px',
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
          🔐 Change Password
        </h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 24 }}>
          Update your admin password. The change takes effect immediately.
        </p>

        <form onSubmit={handleChangePassword}>
          {/* Current Password */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 8, fontWeight: 500 }}>
              Current Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                style={inputStyle}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: 16,
                  color: 'rgba(255,255,255,0.4)', padding: 0,
                }}
              >
                {showCurrent ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 8, fontWeight: 500 }}>
              New Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters"
                style={inputStyle}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: 16,
                  color: 'rgba(255,255,255,0.4)', padding: 0,
                }}
              >
                {showNew ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 8, fontWeight: 500 }}>
              Confirm New Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                style={{
                  ...inputStyle,
                  borderColor: confirmPassword && newPassword && confirmPassword !== newPassword
                    ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)',
                }}
                autoComplete="new-password"
              />
              {confirmPassword && newPassword && confirmPassword === newPassword && (
                <span style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  color: '#22c55e', fontSize: 16,
                }}>✓</span>
              )}
            </div>
            {confirmPassword && newPassword && confirmPassword !== newPassword && (
              <p style={{ fontSize: 12, color: '#ef4444', marginTop: 6 }}>Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
            className="btn btn--primary btn--full"
            style={{
              padding: '13px 20px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              width: '100%',
              opacity: (loading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword) ? 0.5 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {loading ? '⏳ Saving...' : '🔒 Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
