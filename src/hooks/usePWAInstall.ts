import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

let deferredPromptCache: BeforeInstallPromptEvent | null = null;
const listeners = new Set<(e: BeforeInstallPromptEvent | null) => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredPromptCache = e as BeforeInstallPromptEvent;
    listeners.forEach((cb) => cb(deferredPromptCache));
  });

  window.addEventListener('appinstalled', () => {
    deferredPromptCache = null;
    listeners.forEach((cb) => cb(null));
  });
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(deferredPromptCache);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const ua = window.navigator.userAgent;
    const isIOSDevice =
      /iPhone|iPad|iPod/i.test(ua) ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);
    setIsAndroid(/Android/i.test(ua));

    const syncPrompt = (promptEvent: BeforeInstallPromptEvent | null) => {
      setDeferredPrompt(promptEvent);
      if (!promptEvent) {
        const standaloneNow =
          window.matchMedia('(display-mode: standalone)').matches ||
          (window.navigator as unknown as { standalone?: boolean }).standalone === true;
        if (standaloneNow) setIsInstalled(true);
      }
    };

    listeners.add(syncPrompt);

    const handleAppInstalled = () => {
      setIsInstalled(true);
      deferredPromptCache = null;
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      listeners.delete(syncPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    const promptToUse = deferredPrompt || deferredPromptCache;
    if (!promptToUse) return false;
    await promptToUse.prompt();
    const { outcome } = await promptToUse.userChoice;
    deferredPromptCache = null;
    listeners.forEach((cb) => cb(null));
    if (outcome === 'accepted') {
      setIsInstalled(true);
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    isAndroid,
    install,
  };
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
