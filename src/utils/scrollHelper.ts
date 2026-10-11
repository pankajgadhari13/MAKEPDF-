/**
 * Utility for smooth scrolling to the top of the viewport.
 * Works across all browsers, mobile devices, and iframe container contexts.
 */
export const smoothScrollToTop = () => {
  try {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  } catch {
    window.scrollTo(0, 0);
  }

  if (typeof document !== 'undefined') {
    if (document.documentElement && document.documentElement.scrollTop > 0) {
      try {
        document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {
        document.documentElement.scrollTop = 0;
      }
    }
    if (document.body && document.body.scrollTop > 0) {
      try {
        document.body.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {
        document.body.scrollTop = 0;
      }
    }
    const rootEl = document.getElementById('root');
    if (rootEl && rootEl.scrollTop > 0) {
      try {
        rootEl.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {
        rootEl.scrollTop = 0;
      }
    }
  }
};
