import { useState, useEffect, useCallback } from 'react';
import { getUsers, updateUserBalance, updateUserRole, sendAlert, sendTelegramMessage, type AdminUser, type SortBy, type SortOrder } from '../../adminApi';
import { useAdmin } from '../../AdminApp';

export function UsersPage() {
  const { showToast, navState, clearNavState } = useAdmin();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(navState?.search || '');
  const [usernameFilter, setUsernameFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('recent_active');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [modalAction, setModalAction] = useState<'balance' | 'role' | 'message' | null>(null);
  const [newRole, setNewRole] = useState('user');
  const [messageBody, setMessageBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sendViaTelegram, setSendViaTelegram] = useState(true);
  const [sendViaInApp, setSendViaInApp] = useState(false);
  const [broadcastResults, setBroadcastResults] = useState<Array<{ tg_id: string; name: string; status: string; error?: string }> | null>(null);
  const [showResultsModal, setShowResultsModal] = useState(false);



  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers(page, search, usernameFilter, sortBy, sortOrder);
      setUsers(data.users);
      setTotal(data.total);
    } catch (err: any) {
      showToast('error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, usernameFilter, sortBy, sortOrder]);

  useEffect(() => { load(); }, [load]);

  // Handle scroll into view & flash animation when the target user is loaded
  useEffect(() => {
    if (!loading && navState?.highlightUserId) {
      const userId = navState.highlightUserId;
      const timer = setTimeout(() => {
        const element = document.getElementById(`user-row-${userId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('row-highlight-flash');

          const removeTimer = setTimeout(() => {
            element.classList.remove('row-highlight-flash');
          }, 2500);

          clearNavState();
          return () => clearTimeout(removeTimer);
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [loading, navState, clearNavState]);

  const totalPages = Math.ceil(total / 20);

  const handleSort = (field: SortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const getSortIcon = (field: SortBy) => {
    if (sortBy !== field) return '⇅';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  async function handleBalance() {
    if (!selectedUser || !balanceAmount) return;
    try {
      const res = await updateUserBalance(selectedUser.tg_id, parseFloat(balanceAmount));
      showToast('success', `Balance updated to ${res.newBalance.toFixed(2)} ETB`);
      setModalAction(null);
      load();
    } catch (err: any) {
      showToast('error', err.message);
    }
  }

  async function handleRole() {
    if (!selectedUser) return;
    try {
      await updateUserRole(selectedUser.tg_id, newRole);
      showToast('success', `Role updated to ${newRole}`);
      setModalAction(null);
      load();
    } catch (err: any) {
      showToast('error', err.message);
    }
  }

  async function handleMessage() {
    const hasMessage = !!messageBody.trim();
    const hasImage = !!imageUrl.trim();

    if (!hasMessage && !hasImage) {
      showToast('error', 'Please enter a message or an image URL');
      return;
    }

    if (!sendViaTelegram && !sendViaInApp) {
      showToast('error', 'Please select at least one delivery channel (Telegram or In-App)');
      return;
    }

    if (sendViaInApp && !hasMessage) {
      showToast('error', 'In-App notifications require message text');
      return;
    }

    try {
      const target = selectedUser ? selectedUser.tg_id : 'all';
      
      if (sendViaInApp) {
        await sendAlert(target, 'Notification', messageBody.trim());
      }
      
      if (sendViaTelegram) {
        const res = await sendTelegramMessage(target, messageBody.trim(), imageUrl.trim() || undefined);
        if (target === 'all' && res.results) {
          setBroadcastResults(res.results);
          setShowResultsModal(true);
        }
      }

      showToast('success', 'Message sent successfully');
      setModalAction(null);
    } catch (err: any) {
      showToast('error', err.message);
    }
  }


  return (
    <>
      {/* Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{total} total users</div>
          <div className="search-bar" style={{ maxWidth: '160px' }}>
            <span className="search-bar__icon">👤</span>
            <input
              className="search-bar__input"
              placeholder="Username..."
              value={usernameFilter}
              onChange={e => { setUsernameFilter(e.target.value); setPage(1); }}
            />
          </div>
          <select 
            className="form-input" 
            style={{ width: 'auto', padding: '6px 12px', fontSize: 13, height: '38px', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', outline: 'none' }} 
            value={`${sortBy}:${sortOrder}`} 
            onChange={e => {
              const [field, order] = e.target.value.split(':');
              setSortBy(field as SortBy);
              setSortOrder(order as SortOrder);
              setPage(1);
            }}
          >
            <option value="recent_registration:desc">📅 Registered (Newest)</option>
            <option value="recent_registration:asc">📅 Registered (Oldest)</option>
            <option value="big_balance:desc">💰 Balance (Highest)</option>
            <option value="big_balance:asc">💰 Balance (Lowest)</option>
            <option value="recent_active:desc">⚡ Last Active (Newest)</option>
            <option value="recent_active:asc">⚡ Last Active (Oldest)</option>
            <option value="total_spent:desc">🛒 Total Spent (Highest)</option>
            <option value="total_spent:asc">🛒 Total Spent (Lowest)</option>
            <option value="last_deposit:desc">📥 Last Deposit (Newest)</option>
            <option value="last_order:desc">📤 Last Order (Newest)</option>
          </select>
        </div>
        <div className="search-bar">
          <span className="search-bar__icon">🔍</span>
          <input
            className="search-bar__input"
            placeholder="Search users..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <button className="btn btn--primary" onClick={() => { setSelectedUser(null); setMessageBody(''); setImageUrl(''); setSendViaTelegram(true); setSendViaInApp(false); setModalAction('message'); }}>
          📢 Broadcast Message
        </button>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Telegram ID</th>
              <th>Phone</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('big_balance')}>
                Balance {getSortIcon('big_balance')}
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('total_spent')}>
                Total Spent {getSortIcon('total_spent')}
              </th>
              <th>Role</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('recent_registration')}>
                Registered {getSortIcon('recent_registration')}
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('recent_active')}>
                Last Active {getSortIcon('recent_active')}
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('last_deposit')}>
                Last Deposit {getSortIcon('last_deposit')}
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('last_order')}>
                Last Order {getSortIcon('last_order')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={11} className="loading-center"><div className="spinner" /></td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={11} className="data-table-empty">No users found</td></tr>
            ) : users.map(u => (
              <tr key={u.tg_id} id={`user-row-${u.tg_id}`}>
                <td>
                  <div className="user-info">
                    <div className="user-avatar">{(u.first_name || u.username || '?')[0].toUpperCase()}</div>
                    <div>
                      <div className="user-info__name">{u.first_name} {u.last_name || ''}</div>
                      {u.username && <div className="user-info__sub">@{u.username}</div>}
                    </div>
                  </div>
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{u.tg_id}</td>
                <td style={{ fontSize: 13 }}>
                  {u.phone_number ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>{u.phone_number}</span>
                      {Number(u.phone_verified) === 1 || u.phone_verified === true ? (
                        <span style={{ color: '#10b981', fontWeight: 'bold' }} title="Verified">✓</span>
                      ) : (
                        <span style={{ color: '#ef4444', fontWeight: 'bold' }} title="Unverified">✗</span>
                      )}
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>—</span>
                  )}
                </td>
                <td style={{ fontWeight: 600 }}>{Number(u.balance).toFixed(2)}</td>
                <td>{u.total_spent != null ? Number(u.total_spent).toFixed(2) : '—'}</td>
                <td><span className={`badge ${u.role === 'admin' ? 'badge--info' : 'badge--default'}`}>{u.role}</span></td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{u.created_at ? new Date(u.created_at).toLocaleString() : '—'}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{u.last_login ? new Date(u.last_login).toLocaleString() : '—'}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{u.last_deposit ? new Date(u.last_deposit).toLocaleString() : '—'}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{u.last_order ? new Date(u.last_order).toLocaleString() : '—'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn--secondary btn--sm" onClick={() => { setSelectedUser(u); setBalanceAmount(''); setModalAction('balance'); }}>💰 Balance</button>
                    <button className="btn btn--secondary btn--sm" onClick={() => { setSelectedUser(u); setNewRole(u.role); setModalAction('role'); }}>👤 Role</button>
                    <button className="btn btn--secondary btn--sm" onClick={() => { setSelectedUser(u); setMessageBody(''); setImageUrl(''); setSendViaTelegram(true); setSendViaInApp(false); setModalAction('message'); }}>✉️ Msg</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button className="pagination__btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹</button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const p = page <= 3 ? i + 1 : page + i - 2;
            if (p < 1 || p > totalPages) return null;
            return (
              <button key={p} className={`pagination__btn ${page === p ? 'pagination__btn--active' : ''}`} onClick={() => setPage(p)}>{p}</button>
            );
          })}
          <button className="pagination__btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>›</button>
        </div>
      )}

      {/* Balance Modal */}
      {modalAction === 'balance' && selectedUser && (
        <div className="modal-overlay" onClick={() => setModalAction(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Adjust Balance — {selectedUser.first_name}</h2>
              <button className="modal__close" onClick={() => setModalAction(null)}>✕</button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
              Current balance: <strong>{Number(selectedUser.balance).toFixed(2)} ETB</strong>. Enter the amount to add (positive) or deduct (negative).
            </p>
            <div className="form-group">
              <label className="form-label">Amount (ETB)</label>
              <input className="form-input" type="number" step="0.01" placeholder="e.g. 100 or -50" value={balanceAmount} onChange={e => setBalanceAmount(e.target.value)} autoFocus />
            </div>
            <div className="modal__footer">
              <button className="btn btn--secondary" onClick={() => setModalAction(null)}>Cancel</button>
              <button className="btn btn--primary" onClick={handleBalance}>Update Balance</button>
            </div>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {modalAction === 'role' && selectedUser && (
        <div className="modal-overlay" onClick={() => setModalAction(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Change Role — {selectedUser.first_name}</h2>
              <button className="modal__close" onClick={() => setModalAction(null)}>✕</button>
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-input" value={newRole} onChange={e => setNewRole(e.target.value)}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="modal__footer">
              <button className="btn btn--secondary" onClick={() => setModalAction(null)}>Cancel</button>
              <button className="btn btn--primary" onClick={handleRole}>Update Role</button>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {modalAction === 'message' && (
        <div className="modal-overlay" onClick={() => setModalAction(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">{selectedUser ? `Send Message to ${selectedUser.first_name}` : 'Broadcast Message (All Users)'}</h2>
              <button className="modal__close" onClick={() => setModalAction(null)}>✕</button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
              {selectedUser ? "Select the delivery channels and compose your notification." : "Broadcast a notification to all users."}
            </p>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label" style={{ display: 'block', marginBottom: 8 }}>Delivery Channels</label>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer', color: 'var(--text-primary)' }}>
                  <input 
                    type="checkbox" 
                    checked={sendViaTelegram} 
                    onChange={e => setSendViaTelegram(e.target.checked)} 
                  />
                  ✈️ Telegram Message
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer', color: 'var(--text-primary)' }}>
                  <input 
                    type="checkbox" 
                    checked={sendViaInApp} 
                    onChange={e => setSendViaInApp(e.target.checked)} 
                  />
                  📱 In-App Notification
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Message {sendViaTelegram && !sendViaInApp ? '(Optional if Image URL is provided)' : ''}</label>
              <textarea 
                className="form-input" 
                rows={4} 
                placeholder="Enter notification message..." 
                value={messageBody} 
                onChange={e => setMessageBody(e.target.value)} 
                autoFocus 
              />
              {sendViaTelegram && (
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  ℹ️ Use {"{name}"} or {"{first_name}"} to insert the user's first name dynamically.
                </span>
              )}
            </div>

            {sendViaTelegram && (
              <div className="form-group" style={{ marginTop: 12 }}>
                <label className="form-label">Image URL (Optional)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="https://example.com/image.jpg" 
                  value={imageUrl} 
                  onChange={e => setImageUrl(e.target.value)} 
                />
              </div>
            )}

            <div className="modal__footer" style={{ marginTop: 20 }}>
              <button className="btn btn--secondary" onClick={() => setModalAction(null)}>Cancel</button>
              <button className="btn btn--primary" onClick={handleMessage}>Send Message</button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Results Modal */}
      {showResultsModal && broadcastResults && (
        <div className="modal-overlay" onClick={() => setShowResultsModal(false)}>
          <div className="modal" style={{ maxWidth: '600px', width: '90%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div className="modal__header" style={{ flexShrink: 0 }}>
              <h2 className="modal__title">Broadcast Report</h2>
              <button className="modal__close" onClick={() => setShowResultsModal(false)}>✕</button>
            </div>
            
            <div style={{ padding: '8px 0', fontSize: 13, color: 'var(--text-muted)', display: 'flex', gap: 16, flexShrink: 0 }}>
              <span>Total: <strong>{broadcastResults.length}</strong></span>
              <span style={{ color: '#10b981' }}>Reached: <strong>{broadcastResults.filter(r => r.status === 'success').length}</strong></span>
              <span style={{ color: '#ef4444' }}>Failed: <strong>{broadcastResults.filter(r => r.status === 'failed').length}</strong></span>
            </div>

            <div style={{ flexGrow: 1, overflowY: 'auto', marginTop: 12, border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'rgba(0, 0, 0, 0.2)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px' }}>User</th>
                    <th style={{ padding: '10px 12px' }}>Telegram ID</th>
                    <th style={{ padding: '10px 12px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {broadcastResults.map((res, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 500 }}>{res.name}</td>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{res.tg_id}</td>
                      <td style={{ padding: '10px 12px' }}>
                        {res.status === 'success' ? (
                          <span style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            ✓ Reached
                          </span>
                        ) : (
                          <span style={{ color: '#ef4444' }} title={res.error}>
                            ✗ Failed
                            <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'normal', wordBreak: 'break-word', marginTop: 2 }}>
                              {res.error || 'Unknown error'}
                            </span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal__footer" style={{ marginTop: 20, flexShrink: 0 }}>
              <button className="btn btn--primary" onClick={() => setShowResultsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
