import { useLayoutEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./portfolioMotion.css";

gsap.registerPlugin(ScrollTrigger);

const revealed = "inset(0% 0% 0% 0%)";
const concealed = "inset(100% 0% 0% 0%)";

export default function usePortfolioMotion(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const initialHome = window.location.hash === "" || window.location.hash === "#home";
    const entered = new Set<HTMLElement>();
    const sequences = new Map<HTMLElement, gsap.core.Timeline>();
    let openingStarted = false;
    let opening: gsap.core.Timeline | undefined;
    let openingTimer = 0;
    let disposed = false;
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add({ desktop: "(min-width: 761px)", mobile: "(max-width: 760px)", reduce: "(prefers-reduced-motion: reduce)" }, (match) => {
        if (match.conditions?.reduce) return;
        const distance = match.conditions?.mobile ? .6 : 1;
        const select = (selector: string) => Array.from(root.querySelectorAll<HTMLElement>(selector));
        const complete = (targets: HTMLElement[]) => {
          gsap.set(targets, { clearProps: "transform,clipPath,willChange" });
        };

        if (initialHome && window.scrollY < 80) {
          openingStarted = true;
          // Hide the hero synchronously before the first paint. The user sees
          // the animated background first, then the content enters as one
          // deliberate sequence instead of flashing a complete layout.
          if (!(window.location.hash === "" || window.location.hash === "#home")) {
            root.dataset.opening = "complete";
          } else {
              const nav = select(".home-nav");
              const discs = select(".home-disc");
              const title = select(".motion-title-content");
              const titleMask = select(".motion-title-mask");
              const cards = select(".home-feature-motion");
              const imageReveal = select(".home-disc .motion-image-reveal");
              const targets = [...nav, ...discs, ...title, ...titleMask, ...cards, ...imageReveal];
              gsap.set(targets, { willChange: "transform,opacity" });
              gsap.set(nav, { y: -18 * distance, autoAlpha: 0 });
              // Keep all hero content painted on the first frame; the reveal
              // comes from compact positioning and smooth movement, not a
              // hard clip that can expose an empty frame while canvases mount.
              gsap.set(discs, { x: (i) => (1 - i) * 38 * distance, y: 18 * distance, scaleX: .92, scaleY: .96, autoAlpha: 0 });
              gsap.set(title, { yPercent: 26, scaleX: .9, scaleY: 1.06, autoAlpha: 0 });
              gsap.set(titleMask, { clipPath: revealed });
              // Keep the cards fully painted during the opening. Their upward
              // motion supplies the entrance without exposing a clipped half-card.
              gsap.set(cards, { y: 38 * distance, autoAlpha: 0 });
              gsap.set(imageReveal, { scale: 1.1 });
              opening = gsap.timeline({ paused: true, onComplete: () => { complete(targets); root.dataset.opening = "complete"; } });
              root.dataset.opening = "playing";
              opening.to(nav, { y: 0, autoAlpha: 1, duration: .8, ease: "power4.out" }, 0)
                .to(discs, { x: 0, y: 0, scaleX: 1, scaleY: 1, autoAlpha: 1, stagger: .12, duration: 1.4, ease: "power4.out" }, .18)
                .to(imageReveal, { scale: 1, duration: 1.4, stagger: .12, ease: "power3.out" }, .3)
                .to(titleMask, { autoAlpha: 1, duration: .2, ease: "power2.out" }, .7)
                .to(title, { yPercent: 0, scaleX: 1, scaleY: 1, autoAlpha: 1, duration: 1.5, ease: "power4.out" }, .75)
                .to(cards, { y: 0, autoAlpha: 1, duration: .95, stagger: .175, ease: "power4.out" }, 1.7);
              openingTimer = window.setTimeout(() => opening?.play(), 260);
          }
        } else root.dataset.opening = "complete";

        select("[data-motion-group]").forEach((group) => {
          if (entered.has(group)) return;
          const titles = Array.from(group.querySelectorAll<HTMLElement>("[data-motion-title]"));
          const bodies = Array.from(group.querySelectorAll<HTMLElement>("[data-motion-body]"));
          const panels = Array.from(group.querySelectorAll<HTMLElement>(".ag-panel__entrance"));
          const images = Array.from(group.querySelectorAll<HTMLElement>(".motion-image-reveal"));
          const targets = [...titles, ...bodies, ...panels, ...images];
          gsap.set(titles, { yPercent: 115, scaleX: .82, skewY: 3 * distance });
          gsap.set(bodies, { y: 64 * distance, clipPath: concealed });
          gsap.set(panels, { y: 64 * distance, clipPath: concealed });
          gsap.set(images, { scale: 1.1 });
          const timeline = gsap.timeline({ paused: true, onComplete: () => {
            complete(targets);
            group.dataset.motionState = "complete";
          } });
          if (titles.length) timeline.to(titles, { yPercent: 0, scaleX: 1, skewY: 0, duration: 1.4, stagger: .1, ease: "power4.out" }, 0);
          if (bodies.length) timeline.to(bodies, { y: 0, clipPath: revealed, duration: 1.1, stagger: .18, ease: "power4.out" }, .45);
          if (panels.length) timeline.to(panels, { y: 0, clipPath: revealed, duration: 1.1, stagger: .18, ease: "power4.out" }, .45);
          if (images.length) timeline.to(images, { scale: 1, duration: 1.35, stagger: .18, ease: "power3.out" }, .45);
          const play = () => {
            if (entered.has(group)) return;
            entered.add(group);
            group.dataset.motionState = "playing";
            gsap.set(targets, { willChange: "transform,clip-path" });
            timeline.play();
          };
          group.dataset.motionState = "waiting";
          sequences.set(group, timeline);
          ScrollTrigger.create({ trigger: group, start: "top 82%", once: true, onEnter: play,
            // Fast scrolling/hash jumps must not leave skipped sections concealed;
            // the same timeline still completes at its own pace.
            onLeave: play,
          });
          if (group.getBoundingClientRect().top <= window.innerHeight * .82) play();
        });

        select(".motion-image-drift").forEach((image) => {
          const trigger = image.closest(".home-main-visual, .accordion-gallery") as HTMLElement;
          gsap.fromTo(image, { yPercent: 0, scale: 1 }, {
            yPercent: match.conditions?.mobile ? -2 : -4,
            scale: match.conditions?.mobile ? 1.04 : 1.08,
            ease: "none",
            scrollTrigger: { trigger, start: "top top", end: "bottom top", scrub: .8, invalidateOnRefresh: true },
          });
        });
        return () => {
          sequences.clear();
          opening = undefined;
        };
      });
    }, root);

    const finishOpening = () => {
      if (openingTimer) {
        window.clearTimeout(openingTimer);
        openingTimer = 0;
      }
      if (opening) opening.progress(1);
      else if (initialHome) {
        const targets = [
          ...root.querySelectorAll<HTMLElement>(".home-nav, .home-disc, .motion-title-mask, .motion-title-content, .home-feature-motion"),
        ];
        gsap.set(targets, { autoAlpha: 1, clearProps: "transform,clipPath,opacity,visibility,willChange" });
        root.dataset.opening = "complete";
      }
    };
    let scrollFrame = 0;
    const onScroll = () => {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        if (window.scrollY > 80) finishOpening();
      });
    };
    const onNavigation = (event: MouseEvent) => {
      if ((event.target as Element).closest('a[href^="#"]')) finishOpening();
    };
    const onFocus = (event: FocusEvent) => {
      const target = event.target as Element;
      if (target.closest("#home")) finishOpening();
      const group = target.closest<HTMLElement>("[data-motion-group]");
      const sequence = group && sequences.get(group);
      if (sequence) { entered.add(group!); sequence.progress(1); }
    };
    const refresh = () => { if (!disposed) ScrollTrigger.refresh(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("hashchange", finishOpening);
    root.addEventListener("click", onNavigation);
    root.addEventListener("focusin", onFocus);
    root.addEventListener("load", refresh, true);
    document.fonts.ready.then(refresh);
    const frame = requestAnimationFrame(refresh);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(openingTimer);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(scrollFrame);
      window.removeEventListener("hashchange", finishOpening);
      root.removeEventListener("click", onNavigation);
      root.removeEventListener("focusin", onFocus);
      root.removeEventListener("load", refresh, true);
      media.revert();
      context.revert();
      delete root.dataset.opening;
    };
  }, [rootRef]);
}
