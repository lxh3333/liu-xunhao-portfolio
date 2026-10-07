import { useEffect, type RefObject } from "react";
import { gsap } from "gsap";

export default function useSmoothWheel(
  rootRef: RefObject<HTMLElement | null>,
  selector?: string,
  enabledClass?: string,
  resetKey?: string,
) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let tween: gsap.core.Tween | null = null;
    let target = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || !event.deltaY || (enabledClass && !root.classList.contains(enabledClass))) return;
      const scroller = selector ? root.querySelector<HTMLElement>(selector) : root;
      if (!scroller) return;
      const max = scroller.scrollHeight - scroller.clientHeight;
      if (max <= 0) return;
      event.preventDefault();
      const delta = event.deltaY * (event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? scroller.clientHeight : 1);
      if (!tween?.isActive()) target = scroller.scrollTop;
      target = Math.min(max, Math.max(0, target + delta));
      tween?.kill();
      if (reducedMotion.matches) scroller.scrollTop = target;
      else tween = gsap.to(scroller, { scrollTop: target, duration: 0.32, ease: "power2.out", overwrite: "auto" });
    };

    const stopAnimation = () => { tween?.kill(); };
    root.addEventListener("wheel", onWheel, { passive: false });
    root.addEventListener("pointerdown", stopAnimation);
    root.addEventListener("keydown", stopAnimation);
    return () => {
      tween?.kill();
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("pointerdown", stopAnimation);
      root.removeEventListener("keydown", stopAnimation);
    };
  }, [rootRef, selector, enabledClass, resetKey]);
}
