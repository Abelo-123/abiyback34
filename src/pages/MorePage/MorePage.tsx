import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

export function MorePage() {
    const {
        user, alerts, chatMessages, setChatMessages,
        unreadAlerts, setUnreadAlerts, setAlerts, showToast,
    } = useApp();

    const [chatInput, setChatInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    // Mark alerts as read
    const markAlertsRead = () => {
        if (unreadAlerts > 0) {
            setUnreadAlerts(0);
            setAlerts(alerts.map(a => ({ ...a, is_read: true })));
        }
    };

    // Send chat message
    const handleSendChat = () => {
        if (!chatInput.trim()) return;

        const newMsg = {
            id: Date.now(),
            sender: 'user' as const,
            message: chatInput.trim(),
            created_at: new Date().toISOString(),
        };

        setChatMessages([...chatMessages, newMsg]);
        setChatInput('');
        showToast('info', 'Message sent to support');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendChat();
        }
    };

    return (
        <div>
            {/* ─── Profile Card ─── */}
            {user ? (
                <div className="profile-card">
                    {user.photo_url ? (
                        <img
                            className="profile-card__avatar"
                            src={user.photo_url}
                            alt={user.display_name}
                        />
                    ) : (
                        <div className="profile-card__avatar-fallback">👤</div>
                    )}
                    <div className="profile-card__info">
                        <div className="profile-card__name">{user.display_name}</div>
                        <div className="profile-card__id">ID: {user.id}</div>
                    </div>
                </div>
            ) : (
                <div className="profile-card">
                    <div className="profile-card__avatar-fallback">👤</div>
                    <div className="profile-card__info">
                        <div className="profile-card__name">Please log in</div>
                    </div>
                </div>
            )}

            {/* ─── Notifications ─── */}
            <div className="paxyo-section-header">
                Notifications {unreadAlerts > 0 && `(${unreadAlerts})`}
            </div>
            {alerts.length === 0 ? (
                <div className="empty-state" style={{ minHeight: 120 }}>
                    <div className="empty-state__icon" style={{ fontSize: 32 }}>🔔</div>
                    <div className="empty-state__text">No notifications yet</div>
                </div>
            ) : (
                alerts.map((alert) => (
                    <div
                        className="notification-item"
                        key={alert.id}
                        onClick={markAlertsRead}
                    >
                        {!alert.is_read && <div className="notification-item__dot" />}
                        <div className="notification-item__content">
                            <div className="notification-item__message">{alert.message}</div>
                            <div className="notification-item__date">
                                {new Date(alert.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                ))
            )}

            {/* ─── Live Support Chat ─── */}
            <div className="paxyo-section-header">Live Support</div>
            <div className="chat-container">
                <div className="chat-messages">
                    {chatMessages.length === 0 ? (
                        <div className="chat-empty">
                            <span className="chat-empty__icon">💬</span>
                            <span>Start a conversation with support</span>
                        </div>
                    ) : (
                        chatMessages.map(msg => (
                            <div
                                key={msg.id}
                                className={`chat-bubble chat-bubble--${msg.sender}`}
                            >
                                {msg.message}
                            </div>
                        ))
                    )}
                    <div ref={chatEndRef} />
                </div>
                <div className="chat-input-row">
                    <input
                        className="chat-input"
                        placeholder="Type a message..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        className="chat-send-btn"
                        onClick={handleSendChat}
                        disabled={!chatInput.trim()}
                    >
                        ➤
                    </button>
                </div>
            </div>

            {/* Bottom spacing */}
            <div style={{ height: 24 }} />
        </div>
    );
}
