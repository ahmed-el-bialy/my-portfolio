import { useEffect, useRef } from 'react';
import { useScrollLock } from './useScrollLock';

interface UseAccessibleDialogOptions {
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  lockScroll?: boolean;
  disableEscape?: boolean;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) =>
      !el.hasAttribute('disabled') &&
      el.getAttribute('aria-hidden') !== 'true' &&
      (el.offsetParent !== null || el.getClientRects().length > 0)
  );
}

/**
 * Provides WCAG AA dialog focus management:
 * - Captures previously focused trigger element before opening
 * - Moves initial focus inside the dialog panel cleanly
 * - Traps Tab / Shift+Tab navigation inside the open dialog
 * - Handles Escape dismissal
 * - Restores focus back to the trigger on close
 */
export function useAccessibleDialog(
  isOpen: boolean,
  onClose: () => void,
  containerRef: React.RefObject<HTMLElement | null>,
  options: UseAccessibleDialogOptions = {}
) {
  const { initialFocusRef, lockScroll = true, disableEscape = false } = options;
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const disableEscapeRef = useRef(disableEscape);
  onCloseRef.current = onClose;
  disableEscapeRef.current = disableEscape;

  useScrollLock(lockScroll && isOpen);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const rafId = window.requestAnimationFrame(() => {
      const container = containerRef.current;
      if (!container) return;

      const target = initialFocusRef?.current;
      if (target && (target.offsetParent !== null || target.getClientRects().length > 0)) {
        target.focus({ preventScroll: true });
        return;
      }

      const focusables = getFocusableElements(container);
      if (focusables.length > 0) {
        focusables[0].focus({ preventScroll: true });
      } else {
        if (!container.hasAttribute('tabindex')) {
          container.setAttribute('tabindex', '-1');
        }
        container.focus({ preventScroll: true });
      }
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      const container = containerRef.current;
      if (!container) return;

      if (e.key === 'Escape') {
        if (disableEscapeRef.current) return;
        e.preventDefault();
        e.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (e.key !== 'Tab') return;

      const focusables = getFocusableElements(container);
      if (focusables.length === 0) {
        e.preventDefault();
        container.focus({ preventScroll: true });
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first || !container.contains(active)) {
          e.preventDefault();
          last.focus({ preventScroll: true });
        }
      } else if (active === last || !container.contains(active)) {
        e.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', handleKeyDown, true);

      const previous = previousFocusRef.current;
      if (previous && document.contains(previous)) {
        window.requestAnimationFrame(() => {
          previous.focus({ preventScroll: true });
        });
      }
      previousFocusRef.current = null;
    };
  }, [isOpen, containerRef, initialFocusRef]);
}
