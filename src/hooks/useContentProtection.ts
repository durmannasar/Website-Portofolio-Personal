import { useEffect, useRef } from 'react';
import { useStudio } from '../context/StudioContext';

interface UseContentProtectionOptions {
  isPublic: boolean;
}

export function useContentProtection({ isPublic }: UseContentProtectionOptions) {
  const { settings, showToast } = useStudio();
  const cp = settings.contentProtection;
  const lastToastTimeRef = useRef<number>(0);

  useEffect(() => {
    // Content protection applies strictly to the public website, never to the Admin CMS
    if (!isPublic || !cp || cp.enabled === false) {
      document.body.classList.remove('content-protected-active');
      return;
    }

    // Apply or remove text-selection restriction class
    if (cp.disableTextSelection) {
      document.body.classList.add('content-protected-active');
    } else {
      document.body.classList.remove('content-protected-active');
    }

    const triggerProtectedNotice = (message: string) => {
      const now = Date.now();
      if (now - lastToastTimeRef.current > 4000) {
        lastToastTimeRef.current = now;
        showToast(message, 'info');
      }
    };

    // 1. Right Click Handler
    const handleContextMenu = (e: MouseEvent) => {
      if (!cp.disableRightClick) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Allow right-click inside editable form fields
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest('input, textarea, [contenteditable="true"]')
      ) {
        return;
      }

      e.preventDefault();
      triggerProtectedNotice('Durman Nasar Studio · Portfolio visual assets are protected');
    };

    // 2. Keyboard Shortcuts Handler (Ctrl+C, Cmd+C, Ctrl+S, Cmd+S)
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isModifier = e.ctrlKey || e.metaKey;

      if (!isModifier) return;

      // Allow all copy/save shortcuts inside form inputs and textareas
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.closest('input, textarea, [contenteditable="true"]'))
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // Intercept Copy shortcut
      if (cp.disableCopyShortcut && key === 'c') {
        e.preventDefault();
        triggerProtectedNotice('Studio portfolio copy & assets are protected under copyright');
      }

      // Intercept Save Page shortcut
      if (cp.disableSaveShortcut && key === 's') {
        e.preventDefault();
        triggerProtectedNotice('Asset downloading is restricted');
      }
    };

    // 3. Image Dragging Handler
    const handleDragStart = (e: DragEvent) => {
      if (!cp.disableImageDrag) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      if (target.tagName === 'IMG' || target.closest('img, [data-protected-image]')) {
        e.preventDefault();
      }
    };

    // Attach listeners with passive: false for event prevention
    document.addEventListener('contextmenu', handleContextMenu, false);
    document.addEventListener('keydown', handleKeyDown, false);
    document.addEventListener('dragstart', handleDragStart, false);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, false);
      document.removeEventListener('keydown', handleKeyDown, false);
      document.removeEventListener('dragstart', handleDragStart, false);
      document.body.classList.remove('content-protected-active');
    };
  }, [isPublic, cp, showToast]);
}
