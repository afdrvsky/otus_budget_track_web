declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const GA_SUFFIX: string = import.meta.env.VITE_GA_ID ?? '';
const GA_ID = `G-${GA_SUFFIX}`;

function isActive(): boolean {
  return GA_ID.length > 0 && !GA_ID.startsWith('G-XXX');
}

function initGA() {
  if (!isActive() || typeof window === 'undefined') {
    console.log('[GA] disabled, GA_ID =', GA_ID);
    return;
  }

  console.log('[GA] initializing, GA_ID =', GA_ID);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function (...args: unknown[]) {
    window.dataLayer.push(args);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { send_page_view: false });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  script.onload = () => console.log('[GA] gtag script loaded');
  script.onerror = () => console.log('[GA] gtag script FAILED to load');
  document.head.appendChild(script);
}

initGA();

function isEnabled(): boolean {
  return isActive() && typeof window.gtag === 'function';
}

export function gaPageView(path: string) {
  console.log('[GA] gaPageView called, path =', path, 'enabled =', isEnabled());
  if (!isEnabled()) return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: document.title,
    send_to: GA_ID,
  });
}

export function gaEvent(action: string, params: Record<string, unknown> = {}) {
  if (!isEnabled()) return;
  window.gtag('event', action, params);
}

export const GAEvents = {
  login(method: 'email' | 'google') {
    gaEvent('login', { method });
  },

  register(method: 'email' | 'google') {
    gaEvent('sign_up', { method });
  },

  logout() {
    gaEvent('logout');
  },

  transactionCreated(type: 'income' | 'expense', amount: number, categoryId?: string) {
    gaEvent('transaction_created', {
      transaction_type: type,
      value: amount,
      category_id: categoryId,
    });
  },

  transactionUpdated(type: 'income' | 'expense') {
    gaEvent('transaction_updated', { transaction_type: type });
  },

  transactionDeleted() {
    gaEvent('transaction_deleted');
  },

  categoryCreated(type: 'income' | 'expense') {
    gaEvent('category_created', { category_type: type });
  },

  categoryUpdated() {
    gaEvent('category_updated');
  },

  categoryDeleted() {
    gaEvent('category_deleted');
  },
};
