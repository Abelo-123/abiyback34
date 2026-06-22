import { useState, useEffect } from 'react';
import { getFinanceStats, type FinanceStats } from '../../adminApi';
import { useAdmin } from '../../AdminApp';

export function FinancePage() {
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useAdmin();

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      setLoading(true);
      setError(null);
      const data = await getFinanceStats();
      if (data.success) {
        setStats(data);
      } else {
        setError('Failed to load finance stats');
        showToast('error', 'Failed to load finance stats');
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to load finance stats';
      setError(msg);
      showToast('error', msg);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  
  if (error) {
    return (
      <div className="loading-center" style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 48 }}>⚠️</div>
        <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--error)' }}>
          {error}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 400 }}>
          Make sure your backend server is updated and running. If deploying to Render, ensure your latest git changes are pushed and the build has succeeded.
        </div>
        <button className="btn btn--secondary btn--sm" onClick={loadStats} style={{ marginTop: 8 }}>
          🔄 Retry Load
        </button>
      </div>
    );
  }

  if (!stats) return <div className="loading-center">No finance data available</div>;

  const formatETB = (val: number) => {
    return Number(val).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' ETB';
  };

  const isGrowthPositive = stats.revenueGrowth >= 0;

  return (
    <div className="finance-page" style={{ animation: 'fadeIn 0.3s ease' }}>
      
      {/* ─── Top Stats Row ─── */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        
        {/* Withdrawable Balance */}
        <div className="stat-card">
          <div className="stat-card__header">
            <span className="stat-card__label">Withdrawable Balance</span>
            <div className="stat-card__icon stat-card__icon--purple">🏦</div>
          </div>
          <div className="stat-card__value" style={{ fontSize: 24 }}>{formatETB(stats.withdrawableBalance)}</div>
          <div className="stat-card__change">Sum of all users' wallets</div>
        </div>

        {/* Pending Withdrawals */}
        <div className="stat-card">
          <div className="stat-card__header">
            <span className="stat-card__label">Pending Withdrawals</span>
            <div className="stat-card__icon stat-card__icon--orange">⏳</div>
          </div>
          <div className="stat-card__value" style={{ fontSize: 24, color: 'var(--warning)' }}>{formatETB(stats.pendingWithdrawals)}</div>
          <div className="stat-card__change">Awaiting administrator approval</div>
        </div>

        {/* Revenue Growth */}
        <div className="stat-card">
          <div className="stat-card__header">
            <span className="stat-card__label">Revenue Growth (Weekly)</span>
            <div className="stat-card__icon stat-card__icon--blue">📈</div>
          </div>
          <div className="stat-card__value" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: isGrowthPositive ? 'var(--success)' : 'var(--error)' }}>
              {isGrowthPositive ? '▲' : '▼'} {Math.abs(stats.revenueGrowth)}%
            </span>
          </div>
          <div className="stat-card__change">Vs. previous week's performance</div>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 28 }}>
        
        {/* ─── REVENUE BLOCK ─── */}
        <div className="settings-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 className="settings-card__title" style={{ color: 'var(--success)', borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
            💰 Revenue Analytics
          </h3>

          <div style={{ padding: '8px 0' }}>
            <span style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>
              Total Revenue
            </span>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
              {formatETB(stats.totalRevenue)}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="settings-card__row">
              <span className="settings-card__row-label">Today's Revenue</span>
              <span className="settings-card__row-value" style={{ color: 'var(--success)' }}>{formatETB(stats.todayRevenue)}</span>
            </div>
            <div className="settings-card__row">
              <span className="settings-card__row-label">Weekly Revenue</span>
              <span className="settings-card__row-value">{formatETB(stats.weeklyRevenue)}</span>
            </div>
            <div className="settings-card__row">
              <span className="settings-card__row-label">Monthly Revenue</span>
              <span className="settings-card__row-value">{formatETB(stats.monthlyRevenue)}</span>
            </div>
          </div>
        </div>

        {/* ─── WITHDRAWALS BLOCK ─── */}
        <div className="settings-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 className="settings-card__title" style={{ color: 'var(--accent)', borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
            💸 Withdrawal Analytics
          </h3>

          <div style={{ padding: '8px 0' }}>
            <span style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>
              Total Approved Withdrawn
            </span>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
              {formatETB(stats.totalWithdrawn)}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="settings-card__row">
              <span className="settings-card__row-label">Today's Withdrawals</span>
              <span className="settings-card__row-value" style={{ color: 'var(--accent)' }}>{formatETB(stats.todayWithdrawals)}</span>
            </div>
            <div className="settings-card__row">
              <span className="settings-card__row-label">Weekly Withdrawals</span>
              <span className="settings-card__row-value">{formatETB(stats.weeklyWithdrawals)}</span>
            </div>
            <div className="settings-card__row">
              <span className="settings-card__row-label">Monthly Withdrawals</span>
              <span className="settings-card__row-value">{formatETB(stats.monthlyWithdrawals)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* ─── Financial Health Details ─── */}
      <div className="settings-card" style={{ marginBottom: 28 }}>
        <h3 className="settings-card__title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
          📊 Financial Health & Operations
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginTop: 16 }}>
          
          <div style={{ padding: 16, background: 'rgba(255, 255, 255, 0.02)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Withdrawals (All-time)</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 8 }}>{formatETB(stats.totalWithdrawals)}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>({stats.totalWithdrawalsCount} payout transactions)</div>
          </div>

          <div style={{ padding: 16, background: 'rgba(255, 255, 255, 0.02)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Paying Users</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 8, color: 'var(--success)' }}>{stats.totalPayingUsers} Users</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Users with at least 1 completed deposit</div>
          </div>

          <div style={{ padding: 16, background: 'rgba(255, 255, 255, 0.02)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Upstream Provider Costs</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 8, color: 'var(--error)' }}>{formatETB(stats.providerCosts)}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Estimated cost of GodOfPanel orders</div>
          </div>

        </div>
      </div>

    </div>
  );
}
