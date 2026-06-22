import type { SocialPlatform } from './types';

// ─── API Configuration ───────────────────────────────────────
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://paxyo.com/backend';

// ─── Social Platforms ─────────────────────────────────────────
export interface PlatformDef {
    id: SocialPlatform;
    label: string;
    icon: string;       // emoji for now, can swap to SVG
    keywords: string[];  // used to filter categories
    placeholder: string; // link input placeholder
}

export const PLATFORMS: PlatformDef[] = [
    {
        id: 'instagram',
        label: 'Instagram',
        icon: '📸',
        keywords: ['instagram', 'ig '],
        placeholder: 'https://instagram.com/username',
    },
    {
        id: 'tiktok',
        label: 'TikTok',
        icon: '🎵',
        keywords: ['tiktok', 'tik tok'],
        placeholder: 'https://tiktok.com/@username/video/...',
    },
    {
        id: 'youtube',
        label: 'YouTube',
        icon: '▶️',
        keywords: ['youtube', 'yt '],
        placeholder: 'https://youtube.com/watch?v=...',
    },
    {
        id: 'facebook',
        label: 'Facebook',
        icon: '👤',
        keywords: ['facebook', 'fb '],
        placeholder: 'https://facebook.com/...',
    },
    {
        id: 'twitter',
        label: 'Twitter / X',
        icon: '🐦',
        keywords: ['twitter', 'x.com', 'tweet'],
        placeholder: 'https://x.com/username/status/...',
    },
    {
        id: 'telegram',
        label: 'Telegram',
        icon: '✈️',
        keywords: ['telegram', 'tg '],
        placeholder: 'https://t.me/channel_name',
    },
    {
        id: 'other',
        label: 'Other',
        icon: '🌐',
        keywords: [],      // catches everything not matched
        placeholder: 'https://...',
    },
    {
        id: 'top',
        label: 'Top',
        icon: '⭐',
        keywords: [],
        placeholder: 'https://...',
    },
];

// ─── Order Status ─────────────────────────────────────────────
export const STATUS_COLORS: Record<string, string> = {
    pending: 'var(--color-warning)',
    processing: 'var(--color-info)',
    in_progress: 'var(--color-info)',
    completed: 'var(--color-success)',
    cancelled: 'var(--color-danger)',
    partial: 'var(--color-warning)',
};

export const STATUS_LABELS: Record<string, string> = {
    pending: 'Pending',
    processing: 'Processing',
    in_progress: 'Processing',
    completed: 'Completed',
    cancelled: 'Cancelled',
    partial: 'Partial',
};

// ─── Category → Placeholder mapping ──────────────────────────
export function getLinkPlaceholder(category: string, platform: SocialPlatform): string {
    const cat = category.toLowerCase();
    if (cat.includes('follower') || cat.includes('subscriber')) return 'Profile URL';
    if (cat.includes('like') || cat.includes('view') || cat.includes('comment')) return 'Post/Video URL';
    const def = PLATFORMS.find(p => p.id === platform);
    return def?.placeholder || 'https://...';
}

// ─── Currency Formatting ──────────────────────────────────────
export function formatETB(amount: number): string {
    return amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }) + ' ETB';
}

// ─── Misc ─────────────────────────────────────────────────────
export const HEARTBEAT_INTERVAL = 30_000;    // 30 seconds
export const SSE_RECONNECT_DELAY = 3_000;    // 3 seconds
export const REFILL_COOLDOWN_HOURS = 24;
export const TOAST_DURATION = 3_000;
export const QUANTITY_STEP = 10;
