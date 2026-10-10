import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

const TURNSTILE_SCRIPT_ID = 'cf-turnstile-script';
const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

const TurnstileWidget = forwardRef(({
  siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAAFSJkBh62ClwPHjt',
  theme = 'auto',
  onVerify,
  onExpire,
  onError,
  className = '',
}, ref) => {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const callbacksRef = useRef({ onVerify, onExpire, onError });

  // Keep latest callbacks without triggering re-renders
  useEffect(() => {
    callbacksRef.current = { onVerify, onExpire, onError };
  });

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current);
        } catch (e) {
          console.warn('Turnstile reset error:', e);
        }
      }
    },
    remove: () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
          console.warn('Turnstile remove error:', e);
        }
        widgetIdRef.current = null;
      }
    }
  }));

  useEffect(() => {
    let isMounted = true;

    const renderWidget = () => {
      if (!isMounted || !containerRef.current || !window.turnstile) return;

      // Clean up previous widget instance if any
      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
          // ignore
        }
        widgetIdRef.current = null;
      }

      // Empty container to prevent multiple iframes
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }

      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : 'auto',
          callback: (token) => {
            if (isMounted) {
              callbacksRef.current.onVerify?.(token);
            }
          },
          'expired-callback': () => {
            if (isMounted) {
              callbacksRef.current.onExpire?.();
            }
          },
          'error-callback': (errorCode) => {
            console.error('Cloudflare Turnstile error code:', errorCode);
            if (isMounted) {
              callbacksRef.current.onError?.(errorCode);
            }
          },
        });
        widgetIdRef.current = id;
      } catch (err) {
        console.error('Failed to render Turnstile widget:', err);
      }
    };

    // Check if script already loaded
    if (window.turnstile) {
      renderWidget();
    } else {
      let script = document.getElementById(TURNSTILE_SCRIPT_ID);
      if (!script) {
        script = document.createElement('script');
        script.id = TURNSTILE_SCRIPT_ID;
        script.src = TURNSTILE_SRC;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      const checkInterval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkInterval);
          renderWidget();
        }
      }, 100);

      const timeout = setTimeout(() => {
        clearInterval(checkInterval);
      }, 15000);

      return () => {
        isMounted = false;
        clearInterval(checkInterval);
        clearTimeout(timeout);
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch (e) { }
          widgetIdRef.current = null;
        }
      };
    }

    return () => {
      isMounted = false;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) { }
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, theme]); // Only re-mount if siteKey or theme changes

  return (
    <div className={`turnstile-container flex justify-start my-2 ${className}`}>
      <div ref={containerRef} className="min-h-[65px]" />
    </div>
  );
});

TurnstileWidget.displayName = 'TurnstileWidget';

export default TurnstileWidget;
