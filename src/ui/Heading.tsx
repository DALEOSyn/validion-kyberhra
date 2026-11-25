import { useEffect, useRef } from 'preact/hooks';
import type { ComponentChildren } from 'preact';

/**
 * The stamp heading of a screen. It takes focus when the screen appears, so keyboard and screen-reader users
 * start reading at the top of the new screen.
 */
export function StageHeading({ children, focus = true }: { children: ComponentChildren; focus?: boolean }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!focus) return;
    ref.current?.focus({ preventScroll: true });
    if (typeof window.scrollTo === 'function') window.scrollTo(0, 0);
  }, [focus]);
  return (
    <h2 class="stamp" tabIndex={-1} ref={ref}>
      {children}
    </h2>
  );
}

export function Stars({ count, max, big = false }: { count: number; max: number; big?: boolean }) {
  return (
    <span class={big ? 'stars' : 'mini-stars'} role="img" aria-label={`Hviezdy: ${count} z ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} class={i < count ? 'on' : ''} aria-hidden="true">
          ★
        </span>
      ))}
    </span>
  );
}
