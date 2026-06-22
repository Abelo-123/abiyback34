import { useApp } from '../../context/AppContext';
import type { TabId } from '../../types';
import { hapticSelection } from '../../helpers/telegram';

const TABS: { id: TabId; label: string; icon: string }[] = [
    { id: 'order', label: 'Order', icon: '🛒' },
    { id: 'history', label: 'History', icon: '📋' },
    { id: 'deposit', label: 'Deposit', icon: '💰' },
    { id: 'more', label: 'More', icon: '⚙️' },
];

export function BottomNav() {
    const { activeTab, setActiveTab, unreadAlerts } = useApp();

    const handleTabClick = (tab: TabId) => {
        setActiveTab(tab);
        hapticSelection();
    };

    return (
        <div className="bottom-nav">
            <div className="bottom-nav__inner">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        className={`bottom-nav__item${activeTab === tab.id ? ' bottom-nav__item--active' : ''}`}
                        onClick={() => handleTabClick(tab.id)}
                    >
                        <span className="bottom-nav__icon">{tab.icon}</span>
                        <span className="bottom-nav__label">{tab.label}</span>
                        {tab.id === 'more' && unreadAlerts > 0 && (
                            <span className="bottom-nav__badge">
                                {unreadAlerts > 9 ? '9+' : unreadAlerts}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
