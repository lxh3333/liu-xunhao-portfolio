import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ArrowUpRight } from "lucide-react";
import type { PortfolioWork } from "./portfolioData";
import "./AccordionGallery.css";

type AccordionGalleryProps = {
  items: PortfolioWork[];
  defaultIndex?: number;
  expandRatio?: number;
  duration?: number;
  parallax?: number;
  tilt?: number;
  grayscale?: boolean;
  onOpen: (work: PortfolioWork) => void;
};

// Adapted from the React Bits AccordionGallery supplied for this portfolio.
export default function AccordionGallery({
  items,
  defaultIndex = 0,
  expandRatio = 0.52,
  duration = 0.6,
  parallax = 0.5,
  tilt = 3,
  grayscale = false,
  onOpen,
}: AccordionGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const mediaRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const firstRun = useRef(true);
  const [active, setActive] = useState(Math.min(defaultIndex, items.length - 1));
  const [compact, setCompact] = useState(() => window.matchMedia("(max-width: 680px)").matches);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 680px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMobile = () => setCompact(mobileQuery.matches);
    const updateMotion = () => setReducedMotion(motionQuery.matches);
    mobileQuery.addEventListener("change", updateMobile);
    motionQuery.addEventListener("change", updateMotion);
    return () => {
      mobileQuery.removeEventListener("change", updateMobile);
      motionQuery.removeEventListener("change", updateMotion);
    };
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !items.length) return;
    const ratio = Math.min(Math.max(expandRatio, 0.2), 0.9);
    const grow = items.length > 1 ? (ratio * (items.length - 1)) / (1 - ratio) : 1;

    const layout = (animate: boolean) => {
      timelineRef.current?.kill();
      const usable = root.clientWidth - 14 * (items.length - 1);
      const mediaSize = compact ? root.clientWidth : Math.max(140, usable * ratio * 1.22);
      root.style.setProperty("--ag-media-size", `${mediaSize}px`);
      const speed = animate && !reducedMotion ? duration : 0;
      const timeline = gsap.timeline();
      panelRefs.current.forEach((panel, index) => {
        if (!panel) return;
        const selected = index === active;
        timeline.to(panel, {
          flexGrow: selected ? grow : 1,
          rotateY: compact ? 0 : selected ? 0 : index < active ? tilt : -tilt,
          duration: speed,
          ease: "power3.out",
        }, 0);
        const media = mediaRefs.current[index];
        if (media) {
          const drift = Math.max(-1.5, Math.min(1.5, active - index));
          timeline.to(media, {
            xPercent: -50,
            yPercent: -50,
            x: compact || selected ? 0 : drift * parallax * mediaSize * 0.06,
            "--ag-gray": grayscale && !selected ? 1 : 0,
            duration: speed,
            ease: "power3.out",
          }, 0);
        }
        const label = labelRefs.current[index];
        if (label) timeline.to(label, { opacity: selected ? 1 : 0, x: selected ? 0 : -14, duration: speed, ease: "power3.out" }, 0);
      });
      timelineRef.current = timeline;
    };

    layout(!firstRun.current);
    firstRun.current = false;
    // Ignore the observer's initial notification so it cannot cancel the hover tween.
    let measuredWidth = root.clientWidth;
    const observer = new ResizeObserver(() => {
      if (root.clientWidth === measuredWidth) return;
      measuredWidth = root.clientWidth;
      layout(false);
    });
    observer.observe(root);
    return () => {
      observer.disconnect();
      timelineRef.current?.kill();
    };
  }, [active, compact, reducedMotion, duration, expandRatio, grayscale, items.length, parallax, tilt]);

  return (
    <div className={`accordion-gallery${compact ? " accordion-gallery--compact" : ""}`} ref={rootRef} aria-label="作品画廊">
      {items.map((item, index) => (
        <a
          key={item.id}
          ref={(node) => { panelRefs.current[index] = node; }}
          className={`ag-panel${active === index ? " ag-panel--active" : ""}`}
          href={`#work/${item.id}`}
          aria-label={`${item.title}，查看详情`}
          onPointerEnter={(event) => { if (event.pointerType === "mouse") setActive(index); }}
          onFocus={() => setActive(index)}
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            setActive(index);
            onOpen(item);
          }}
          onKeyDown={(event) => {
            const direction = ["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : ["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 0;
            if (direction) {
              event.preventDefault();
              panelRefs.current[(index + direction + items.length) % items.length]?.focus();
            }
          }}
          style={{ "--ag-position": item.imagePosition || "center" } as CSSProperties}
        >
          <span className="ag-panel__entrance">
          <span className="ag-panel__frame">
            <span className="ag-panel__media" ref={(node) => { mediaRefs.current[index] = node; }}>
              <span className="motion-image-drift"><span className="motion-image-reveal"><img src={item.image} alt="" loading="lazy" decoding="async" draggable={false} /></span></span>
            </span>
            <span className="ag-panel__overlay" />
          </span>
          <span className="ag-panel__meta"><span>{item.number} / {item.category}</span><span>{item.status}</span></span>
          <span className="ag-panel__collapsed-title" aria-hidden="true">{item.title}</span>
          <span className="ag-panel__label" ref={(node) => { labelRefs.current[index] = node; }} aria-hidden="true">
            <span className="ag-panel__bar" />
            <span className="ag-panel__text"><strong>{item.title}</strong><span>{item.description}</span><small>查看详情</small></span>
            <span className="ag-panel__open"><ArrowUpRight size={24} /></span>
          </span>
          </span>
        </a>
      ))}
    </div>
  );
}
