import { useState, useEffect, useCallback } from 'react';
import { getWithdrawals, approveWithdrawal, type AdminWithdrawal } from '../../adminApi';
import { StatusBadge } from './DashboardPage';
import { useAdmin } from '../../AdminApp';

export function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const { showToast } = useAdmin();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getWithdrawals();
      if (data.success) {
        setWithdrawals(data.withdrawals);
      } else {
        showToast('error', 'Failed to load withdrawals');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id: number) => {
    if (!window.confirm('Are you sure you want to mark this withdrawal request as DONE?')) {
      return;
    }
    setActionLoading(id);
    try {
      const res = await approveWithdrawal(id);
      if (res.success) {
        showToast('success', 'Withdrawal request marked as DONE');
        load();
      } else {
        showToast('error', 'Failed to approve withdrawal');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to approve withdrawal');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{withdrawals.length} withdrawal requests</span>
        </div>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Full Name</th>
              <th>Amount (ETB)</th>
              <th>Bank / Account</th>
              <th>Status</th>
              <th>Requested At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="loading-center"><div className="spinner" /></td></tr>
            ) : withdrawals.length === 0 ? (
              <tr><td colSpan={8} className="data-table-empty">No withdrawal requests found</td></tr>
            ) : withdrawals.map(w => (
              <tr key={w.id}>
                <td>#{w.id}</td>
                <td>
                  <div className="user-info">
                    <div className="user-avatar">{(w.first_name || w.user_id)?.[0]?.toUpperCase() || '?'}</div>
                    <div>
                      <div className="user-info__name">{w.first_name || w.user_id}</div>
                      {w.username && <div className="user-info__sub">@{w.username}</div>}
                    </div>
                  </div>
                </td>
                <td style={{ fontWeight: 500 }}>{w.full_name}</td>
                <td style={{ fontWeight: 600, color: 'var(--success)' }}>{Number(w.amount).toFixed(2)}</td>
                <td>
                  <div>
                    <div style={{ fontWeight: 500 }}>{w.bank_name}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{w.account_number}</div>
                  </div>
                </td>
                <td>
                  <StatusBadge status={w.status} />
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(w.created_at).toLocaleString()}</td>
                <td>
                  {w.status === 'pending' ? (
                    <button
                      className="btn btn--success btn--sm"
                      disabled={actionLoading === w.id}
                      onClick={() => handleApprove(w.id)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '11px',
                        background: '#00d68f',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      {actionLoading === w.id ? 'Processing...' : 'Mark Done'}
                    </button>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
