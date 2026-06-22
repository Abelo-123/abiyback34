import {
  setDebug,
  mountBackButton,
  restoreInitData,
  init as initSDK,
  bindThemeParamsCssVars,
  mountViewport,
  bindViewportCssVars,
  mockTelegramEnv,
  type ThemeParams,
  themeParamsState,
  retrieveLaunchParams,
  emitEvent,
  miniApp,
  mountClosingBehavior,
  mountSettingsButton,
  mountSwipeBehavior,
  disableVerticalSwipes,
} from '@telegram-apps/sdk-react';

import { expandViewport, signalReady } from './helpers/telegram';

/**
 * Initializes the application and configures its dependencies.
 * 
 * PERF: Split into two phases:
 *   1. Critical (sync) — runs immediately, required for first paint
 *   2. Deferred (async) — runs in parallel, doesn't block render
 */
export async function init(options: {
  debug: boolean;
  eruda: boolean;
  mockForMacOS: boolean;
}): Promise<void> {
  // ═══════════════════════════════════════════════════════════════
  // PHASE 1: CRITICAL — runs synchronously, required for UI render
  // ═══════════════════════════════════════════════════════════════
  setDebug(options.debug);
  initSDK();

  // Telegram for macOS bug workarounds (must be before component mounts)
  if (options.mockForMacOS) {
    let firstThemeSent = false;
    mockTelegramEnv({
      onEvent(event, next) {
        if (event[0] === 'web_app_request_theme') {
          let tp: ThemeParams = {};
          if (firstThemeSent) {
            tp = themeParamsState();
          } else {
            firstThemeSent = true;
            tp ||= retrieveLaunchParams().tgWebAppThemeParams;
          }
          return emitEvent('theme_changed', { theme_params: tp });
        }

        if (event[0] === 'web_app_request_safe_area') {
          return emitEvent('safe_area_changed', { left: 0, top: 0, right: 0, bottom: 0 });
        }

        next();
      },
    });
  }

  // Mount critical components (sync, fast)
  mountBackButton.ifAvailable();
  restoreInitData();

  if (miniApp.mountSync.isAvailable()) {
    miniApp.mountSync();
    bindThemeParamsCssVars();
  }

  // Signal ready ASAP so Telegram hides its loading indicator
  signalReady();

  // ═══════════════════════════════════════════════════════════════
  // PHASE 2: DEFERRED — runs in parallel, doesn't block render
  // ═══════════════════════════════════════════════════════════════
  const deferredTasks: Promise<void>[] = [];

  // Viewport setup (the slowest part, was blocking render before)
  if (mountViewport.isAvailable()) {
    deferredTasks.push(
      mountViewport()
        .then(() => {
          bindViewportCssVars();
          expandViewport();
        })
        .catch(() => { /* ignore viewport errors */ })
    );
  }

  // Header/background color
  deferredTasks.push(
    (async () => {
      try {
        const { setHeaderColor, setBackgroundColor } = await import('./helpers/telegram');
        setHeaderColor('#0a0a0f');
        setBackgroundColor('#0a0a0f');
      } catch { /* ignore */ }
    })()
  );

  // Closing and swipe behavior
  deferredTasks.push(
    (async () => {
      try {
        mountClosingBehavior.ifAvailable();
        mountSettingsButton.ifAvailable();
        if (mountSwipeBehavior.isAvailable()) {
          mountSwipeBehavior();
          try { disableVerticalSwipes(); } catch { /* ignore */ }
        }
      } catch { /* ignore */ }
    })()
  );

  // Eruda (debug inspector) — lazy, never blocks
  if (options.eruda) {
    void import('eruda').then(({ default: eruda }) => {
      eruda.init();
      eruda.position({ x: window.innerWidth - 50, y: 0 });
    });
  }

  // Wait for deferred tasks but don't let any failure block the app
  await Promise.allSettled(deferredTasks);
}
