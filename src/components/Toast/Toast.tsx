import { Snackbar } from '@telegram-apps/telegram-ui';
import { useApp } from '../../context/AppContext';

const ICONS: Record<string, string> = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
};

export function ToastContainer() {
    const { toasts, removeToast } = useApp();

    if (toasts.length === 0) return null;

    // Show only the latest toast as a Snackbar
    const latest = toasts[toasts.length - 1];

    return (
        <Snackbar
            key={latest.id}
            before={<span style={{ fontSize: 20 }}>{ICONS[latest.type] || 'ℹ️'}</span>}
            description={latest.message}
            onClose={() => removeToast(latest.id)}
            duration={3000}
        >
            {latest.type === 'success' ? 'Success' : latest.type === 'error' ? 'Error' : 'Info'}
        </Snackbar>
    );
}
