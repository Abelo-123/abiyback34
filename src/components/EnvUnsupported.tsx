import { Placeholder, AppRoot } from '@telegram-apps/telegram-ui';
import { useMemo } from 'react';

export function EnvUnsupported() {
  const [platform, isDark] = useMemo(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.platform) {
      return [tg.platform, tg.colorScheme === 'dark'];
    }
    return ['android', true];
  }, []);

  return (
    <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(platform) ? 'ios' : 'base'}
    >
      <Placeholder
        header="Loading..."
        description="Please wait while we initialize the application"
      >
        <div style={{ 
          display: 'block', 
          width: '144px', 
          height: '144px',
          background: '#5288c1',
          borderRadius: '50%',
          animation: 'pulse 1.5s infinite'
        }} />
      </Placeholder>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.95); }
        }
      `}</style>
    </AppRoot>
  );
}
