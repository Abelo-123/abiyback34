import { useState, useEffect, useCallback } from 'react';
import { 
  getBroadcasts, 
  createBroadcast, 
  updateBroadcast, 
  deleteBroadcast, 
  getBroadcastMessages, 
  updateSingleBroadcastMessage, 
  deleteSingleBroadcastMessage, 
  type AdminBroadcast,
  type BroadcastMessageDetail
} from '../../adminApi';
import { useAdmin } from '../../AdminApp';

export function BroadcastPage() {
  const { showToast } = useAdmin();
  const [broadcasts, setBroadcasts] = useState<AdminBroadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Compose / Create state
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [btnText, setBtnText] = useState('Open App 🎵');
  const [btnUrl, setBtnUrl] = useState('https://musical-caramel-cae47e.netlify.app/');

  // Editing state
  const [editingBroadcast, setEditingBroadcast] = useState<AdminBroadcast | null>(null);
  const [editMessage, setEditMessage] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editBtnText, setEditBtnText] = useState('Open App 🎵');
  const [editBtnUrl, setEditBtnUrl] = useState('https://musical-caramel-cae47e.netlify.app/');

  // Delete state
  const [deletingBroadcast, setDeletingBroadcast] = useState<AdminBroadcast | null>(null);

  // User-level Delivery Details state
  const [viewingDetailsBroadcast, setViewingDetailsBroadcast] = useState<AdminBroadcast | null>(null);
  const [recipientMessages, setRecipientMessages] = useState<BroadcastMessageDetail[]>([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);

  // Individual message edit state
  const [editingRecipientMessage, setEditingRecipientMessage] = useState<BroadcastMessageDetail | null>(null);
  const [recipientCustomText, setRecipientCustomText] = useState('');
  const [recipientCustomImage, setRecipientCustomImage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBroadcasts();
      setBroadcasts(data);
    } catch (err: any) {
      showToast('error', 'Failed to load broadcasts history');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const loadRecipients = async (broadcastId: number) => {
    setLoadingRecipients(true);
    try {
      const data = await getBroadcastMessages(broadcastId);
      setRecipientMessages(data);
    } catch (err: any) {
      showToast('error', 'Failed to load recipient details');
    } finally {
      setLoadingRecipients(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !imageUrl.trim()) {
      showToast('error', 'Please enter a message or image URL');
      return;
    }

    setActionLoading(true);
    try {
      const res = await createBroadcast(
        message.trim(), 
        imageUrl.trim() || undefined,
        btnText.trim() || undefined,
        btnUrl.trim() || undefined
      );
      showToast('success', `Broadcast sent! Reached: ${res.sent_count}, Failed: ${res.failed_count}`);
      setMessage('');
      setImageUrl('');
      setBtnText('Open App 🎵');
      setBtnUrl('https://musical-caramel-cae47e.netlify.app/');
      load();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to send broadcast');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBroadcast) return;
    if (!editMessage.trim() && !editImageUrl.trim()) {
      showToast('error', 'Please enter a message or image URL');
      return;
    }

    setActionLoading(true);
    try {
      const res = await updateBroadcast(
        editingBroadcast.id, 
        editMessage.trim(), 
        editImageUrl.trim() || undefined,
        editBtnText.trim() || undefined,
        editBtnUrl.trim() || undefined
      );
      showToast('success', `Broadcast updated! Edited ${res.updated_count} messages in active chats.`);
      setEditingBroadcast(null);
      load();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update broadcast');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingBroadcast) return;
    setActionLoading(true);
    try {
      const res = await deleteBroadcast(deletingBroadcast.id);
      showToast('success', `Broadcast deleted! Removed ${res.deleted_count} messages from chats.`);
      setDeletingBroadcast(null);
      load();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete broadcast');
    } finally {
      setActionLoading(false);
    }
  };

  // Custom User-level controls
  const handleEditRecipientMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecipientMessage) return;
    setActionLoading(true);
    try {
      await updateSingleBroadcastMessage(
        editingRecipientMessage.id,
        recipientCustomText.trim(),
        recipientCustomImage.trim() || undefined
      );
      showToast('success', 'User-level message updated in real-time on Telegram!');
      setEditingRecipientMessage(null);
      if (viewingDetailsBroadcast) {
        loadRecipients(viewingDetailsBroadcast.id);
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update message');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRecipientMessage = async (msgDetail: BroadcastMessageDetail) => {
    if (!confirm(`Are you sure you want to delete this message for ${msgDetail.first_name || 'User'}? It will delete it from their Telegram chat.`)) {
      return;
    }
    setActionLoading(true);
    try {
      await deleteSingleBroadcastMessage(msgDetail.id);
      showToast('success', 'Message deleted from Telegram chat!');
      if (viewingDetailsBroadcast) {
        loadRecipients(viewingDetailsBroadcast.id);
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete message');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
      
      {/* Left Column: Compose & History */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Compose Broadcast */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 12,
          padding: 24
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📢</span> Create Advanced Broadcast
          </h2>
          
          <form onSubmit={handleCreate}>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Message Content</label>
              <textarea
                className="form-input"
                rows={4}
                placeholder="Type message content... Support HTML like <b>bold</b>, <i>italic</i>. Use {name} for personalization."
                value={message}
                onChange={e => setMessage(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Image URL (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div className="form-group">
                <label className="form-label">Button Logo & Text</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Open App 🎵"
                  value={btnText}
                  onChange={e => setBtnText(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Button Web App URL</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://app.link"
                  value={btnUrl}
                  onChange={e => setBtnUrl(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={actionLoading || (!message.trim() && !imageUrl.trim())}
              >
                {actionLoading ? 'Broadcasting...' : '🚀 Launch Broadcast'}
              </button>
            </div>
          </form>
        </div>

        {/* History List */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 12,
          padding: 24
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📜</span> Broadcast History
          </h2>

          {loading ? (
            <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
              <div className="spinner" />
            </div>
          ) : broadcasts.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              No broadcasts found. Send your first broadcast above!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {broadcasts.map(b => (
                <div key={b.id} style={{
                  background: 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  borderRadius: 8,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}>
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      📅 {new Date(b.created_at).toLocaleString()}
                    </span>
                    <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
                      <span style={{ color: '#10b981' }}>Reached: <strong>{b.sent_count}</strong></span>
                      <span style={{ color: '#ef4444' }}>Failed: <strong>{b.failed_count}</strong></span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={{ display: 'flex', gap: 16, alignItems: 'start', flexWrap: 'wrap' }}>
                    {b.image_url && (
                      <img
                        src={b.image_url}
                        alt="Broadcast"
                        style={{
                          width: 80,
                          height: 80,
                          objectFit: 'cover',
                          borderRadius: 6,
                          border: '1px solid rgba(255, 255, 255, 0.08)'
                        }}
                        onError={e => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <p style={{
                        margin: 0,
                        fontSize: 14,
                        whiteSpace: 'pre-wrap',
                        color: 'var(--text-primary)',
                        lineHeight: 1.5
                      }} dangerouslySetInnerHTML={{ __html: b.message || '<i>No text content</i>' }} />
                      
                      {/* Button Details */}
                      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Button Link:</span>
                          <span style={{ fontSize: 11, color: '#818cf8', fontFamily: 'monospace', wordBreak: 'break-all' }}>{b.btn_url}</span>
                        </div>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          alignSelf: 'flex-start',
                          background: 'rgba(99, 102, 241, 0.15)',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                          padding: '6px 12px',
                          borderRadius: 6,
                          fontSize: 12,
                          color: '#818cf8',
                          pointerEvents: 'none',
                          marginTop: 4
                        }}>
                          <span>{b.btn_text || 'Open App 🎵'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, borderTop: '1px solid rgba(255, 255, 255, 0.03)', paddingTop: 12 }}>
                    <button
                      className="btn btn--secondary btn--sm"
                      onClick={() => {
                        setViewingDetailsBroadcast(b);
                        loadRecipients(b.id);
                      }}
                      style={{ padding: '6px 12px', fontSize: 12 }}
                    >
                      📊 Delivery & Control
                    </button>
                    <button
                      className="btn btn--secondary btn--sm"
                      onClick={() => {
                        setEditingBroadcast(b);
                        setEditMessage(b.message);
                        setEditImageUrl(b.image_url || '');
                        setEditBtnText(b.btn_text || 'Open App 🎵');
                        setEditBtnUrl(b.btn_url || 'https://musical-caramel-cae47e.netlify.app/');
                      }}
                      style={{ padding: '6px 12px', fontSize: 12 }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn btn--secondary btn--sm"
                      onClick={() => setDeletingBroadcast(b)}
                      style={{ padding: '6px 12px', fontSize: 12, color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Telegram Live Preview */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'sticky', top: 24 }}>
        
        {/* Telegram Live Preview */}
        <div style={{
          background: '#182533', 
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.05)',
          overflow: 'hidden',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            background: '#24303f',
            padding: '12px 16px',
            fontSize: 13,
            fontWeight: 600,
            borderBottom: '1px solid #101921',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4bb543' }} />
            Telegram Live Preview
          </div>

          <div style={{
            padding: 16,
            minHeight: 250,
            background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 100 100\'%3E%3Cpath d=\'M10 10h1v1h-1z\' fill=\'%23ffffff\' fill-opacity=\'.03\'/%3E%3C/svg%3E") #0e1621',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end'
          }}>
            {/* Bubble */}
            <div style={{
              background: '#182533',
              borderRadius: '8px 8px 8px 0px',
              padding: 10,
              maxWidth: '85%',
              alignSelf: 'flex-start',
              border: '1px solid #233140',
              boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
              color: '#f5f5f5',
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}>
              {(imageUrl || editImageUrl) && (
                <img
                  src={imageUrl || editImageUrl}
                  alt="Preview"
                  style={{
                    width: '100%',
                    borderRadius: 4,
                    maxHeight: 140,
                    objectFit: 'cover'
                  }}
                  onError={e => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              )}
              
              <div
                style={{ fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: '18px', wordBreak: 'break-word' }}
                dangerouslySetInnerHTML={{ __html: (message || editMessage || '<i>Compose message to preview...</i>').replace(/\n/g, '<br/>') }}
              />

              <div style={{ alignSelf: 'flex-end', fontSize: 10, color: '#7e909f', marginTop: 2 }}>
                12:00
              </div>
            </div>

            {/* Telegram WebApp Inline Button */}
            <div style={{
              alignSelf: 'flex-start',
              width: '85%',
              marginTop: 6,
              display: 'flex',
              justifyContent: 'center'
            }}>
              <div style={{
                background: '#2b5278',
                borderRadius: 4,
                width: '100%',
                padding: '8px 12px',
                textAlign: 'center',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                <span>{editingBroadcast ? editBtnText : btnText}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Guidelines */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 12,
          padding: 20,
          fontSize: 13,
          lineHeight: 1.6,
          color: 'var(--text-muted)'
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, marginTop: 0 }}>
            ⚡ Advanced Control Panels
          </h3>
          <ul style={{ paddingLeft: 16, margin: 0 }}>
            <li>You can view individual recipient statuses using <strong>Delivery & Control</strong>.</li>
            <li>In the control panel, you can customize the message for a specific user to personalize it manually.</li>
            <li>You can also delete the message for one specific user without affecting others.</li>
          </ul>
        </div>
      </div>

      {/* Edit Broadcast Modal */}
      {editingBroadcast && (
        <div className="modal-overlay" onClick={() => setEditingBroadcast(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">✏️ Edit Active Broadcast</h2>
              <button className="modal__close" onClick={() => setEditingBroadcast(null)}>✕</button>
            </div>
            
            <form onSubmit={handleUpdate}>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Message Content</label>
                <textarea
                  className="form-input"
                  rows={5}
                  value={editMessage}
                  onChange={e => setEditMessage(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Image URL</label>
                <input
                  type="text"
                  className="form-input"
                  value={editImageUrl}
                  onChange={e => setEditImageUrl(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div className="form-group">
                  <label className="form-label">Button Text</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editBtnText}
                    onChange={e => setEditBtnText(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Button Web App URL</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editBtnUrl}
                    onChange={e => setEditBtnUrl(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div className="modal__footer">
                <button type="button" className="btn btn--secondary" onClick={() => setEditingBroadcast(null)}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={actionLoading}>
                  {actionLoading ? 'Updating Telegram...' : 'Save & Update Telegram'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Broadcast Modal */}
      {deletingBroadcast && (
        <div className="modal-overlay" onClick={() => setDeletingBroadcast(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title" style={{ color: '#ef4444' }}>⚠️ Delete Broadcast</h2>
              <button className="modal__close" onClick={() => setDeletingBroadcast(null)}>✕</button>
            </div>
            <p style={{ color: 'var(--text-primary)', fontSize: 14, marginBottom: 12 }}>
              Are you sure you want to delete this broadcast?
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
              This will remove the message from the chats of all users who received it on Telegram, and wipe it from DB history.
            </p>
            <div className="modal__footer">
              <button className="btn btn--secondary" onClick={() => setDeletingBroadcast(null)}>Cancel</button>
              <button className="btn btn--primary" style={{ background: '#ef4444', borderColor: '#ef4444' }} onClick={handleDelete} disabled={actionLoading}>
                {actionLoading ? 'Deleting on Telegram...' : 'Yes, Delete Completely'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Logs & Controls Drawer / Modal */}
      {viewingDetailsBroadcast && (
        <div className="modal-overlay" onClick={() => setViewingDetailsBroadcast(null)}>
          <div className="modal" style={{ maxWidth: '800px', width: '95%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div className="modal__header" style={{ flexShrink: 0 }}>
              <h2 className="modal__title">📊 Delivery & Controls Detail</h2>
              <button className="modal__close" onClick={() => setViewingDetailsBroadcast(null)}>✕</button>
            </div>
            
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 16px 0', flexShrink: 0 }}>
              Showing individual message delivery records for broadcast ID <strong>#{viewingDetailsBroadcast.id}</strong>. You can customize or delete messages for each user.
            </p>

            <div style={{ flexGrow: 1, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'rgba(0, 0, 0, 0.2)' }}>
              {loadingRecipients ? (
                <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
                  <div className="spinner" />
                </div>
              ) : recipientMessages.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                  No recipient records found.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                      <th style={{ padding: '10px 12px' }}>Recipient</th>
                      <th style={{ padding: '10px 12px' }}>Telegram ID</th>
                      <th style={{ padding: '10px 12px' }}>Message Body</th>
                      <th style={{ padding: '10px 12px' }}>Status</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipientMessages.map((rm) => (
                      <tr key={rm.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 500 }}>
                          <div>{rm.first_name || 'User'}</div>
                          {rm.username && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>@{rm.username}</div>}
                        </td>
                        <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{rm.tg_id}</td>
                        <td style={{ padding: '10px 12px', whiteSpace: 'pre-wrap', maxHeight: 80, overflow: 'hidden' }}>
                          {rm.custom_message ? (
                            <span style={{ color: '#fbbf24' }}>
                              ⚠️ Customized:<br/>
                              {rm.custom_message}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Default Broadcast</span>
                          )}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          {rm.status === 'sent' ? (
                            <span style={{ color: '#10b981' }}>✓ Sent</span>
                          ) : (
                            <span style={{ color: '#ef4444' }} title={rm.error_message || ''}>
                              ✗ Failed
                              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{rm.error_message || 'Unknown error'}</div>
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            {rm.status === 'sent' && (
                              <>
                                <button 
                                  className="btn btn--secondary btn--sm" 
                                  onClick={() => {
                                    setEditingRecipientMessage(rm);
                                    setRecipientCustomText(rm.custom_message || viewingDetailsBroadcast.message);
                                    setRecipientCustomImage(viewingDetailsBroadcast.image_url || '');
                                  }}
                                  style={{ padding: '4px 8px', fontSize: 11 }}
                                >
                                  ✏️ Edit Custom
                                </button>
                                <button 
                                  className="btn btn--secondary btn--sm" 
                                  onClick={() => handleDeleteRecipientMessage(rm)}
                                  style={{ padding: '4px 8px', fontSize: 11, color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                                >
                                  🗑️ Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="modal__footer" style={{ marginTop: 20, flexShrink: 0 }}>
              <button className="btn btn--primary" onClick={() => setViewingDetailsBroadcast(null)}>Close Details</button>
            </div>
          </div>
        </div>
      )}

      {/* Editing Specific User Message Modal */}
      {editingRecipientMessage && viewingDetailsBroadcast && (
        <div className="modal-overlay" style={{ zIndex: 1000 }} onClick={() => setEditingRecipientMessage(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">✏️ Edit Message for User</h2>
              <button className="modal__close" onClick={() => setEditingRecipientMessage(null)}>✕</button>
            </div>
            
            <form onSubmit={handleEditRecipientMessage}>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
                You are customizing the Telegram message specifically for <strong>{editingRecipientMessage.first_name || 'User'}</strong> (ID: {editingRecipientMessage.tg_id}).
              </p>
              
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Custom Message Content</label>
                <textarea
                  className="form-input"
                  rows={5}
                  value={recipientCustomText}
                  onChange={e => setRecipientCustomText(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Image URL (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  value={recipientCustomImage}
                  onChange={e => setRecipientCustomImage(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div className="modal__footer">
                <button type="button" className="btn btn--secondary" onClick={() => setEditingRecipientMessage(null)}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={actionLoading}>
                  {actionLoading ? 'Updating Telegram...' : 'Save & Update Telegram'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
