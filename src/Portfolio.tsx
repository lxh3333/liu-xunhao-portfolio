import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Download, ExternalLink, FileText, FolderOpen, X } from "lucide-react";
import { gsap } from "gsap";
import AccordionGallery from "./AccordionGallery";
import { portfolioWorks, type PortfolioWork } from "./portfolioData";
import "./Portfolio.css";
import useSmoothWheel from "./useSmoothWheel";
import PageBackground from "./PageBackground";
import MotionLines from "./MotionLines";

function workFromAddress() {
  return portfolioWorks.find((work) => window.location.hash === `#work/${work.id}`) || null;
}

function WorkDetail({ work, onClose, onNavigate }: {
  work: PortfolioWork;
  onClose: () => void;
  onNavigate: (work: PortfolioWork) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const index = portfolioWorks.findIndex((item) => item.id === work.id);
  useSmoothWheel(contentRef, undefined, undefined, work.id);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth) document.body.style.paddingRight = `${scrollbarWidth}px`;
    dialog.showModal();
    const animation = gsap.fromTo(dialog, { opacity: 0, scale: 0.94, y: 24 }, {
      opacity: 1, scale: 1, y: 0,
      duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.45,
      ease: "power3.out",
    });
    return () => {
      animation.kill();
      dialog.close();
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
    };
  }, []);

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [work.id]);

  return (
    <dialog ref={dialogRef} className="portfolio-detail portfolio-detail--grainient" aria-labelledby="work-detail-title" onCancel={(event) => { event.preventDefault(); onClose(); }}>
      <PageBackground />
      <header className="portfolio-detail-toolbar">
        <button className="portfolio-back" onClick={onClose}><ArrowLeft size={18} /><span>返回作品集</span></button>
        <span className="portfolio-detail-counter">{work.number} / 03</span>
        <button className="portfolio-icon-button" onClick={onClose} aria-label="关闭作品详情" title="关闭作品详情"><X size={22} /></button>
      </header>
      <div className="portfolio-detail-scroll" ref={contentRef}>
        <div className="portfolio-detail-inner">
          <div className="portfolio-detail-hero">
            <div className="portfolio-detail-intro">
              <span className="portfolio-category">{work.category}</span>
              <h2 id="work-detail-title">{work.title}</h2>
              <p>{work.description}</p>
              <dl className="portfolio-detail-meta"><div><dt>状态</dt><dd>{work.status}</dd></div><div><dt>内容</dt><dd>{work.sections.length ? "作品案例" : "尚未发布"}</dd></div></dl>
            </div>
            <div className="portfolio-detail-cover"><img src={work.image} alt="" loading="eager" decoding="async" style={{ objectPosition: work.imagePosition }} /><span> {work.number} / {work.status}</span></div>
          </div>
          <div className="portfolio-detail-body">
            <section className="portfolio-case-content" aria-label="作品介绍">
              <div className="portfolio-block-heading"><span>01 / OVERVIEW</span><h3>作品介绍</h3></div>
              {work.sections.length ? work.sections.map((section) => (
                <section className="portfolio-case-section" key={section.title}>
                  <h4>{section.title}</h4>
                  {section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
                  {section.image ? <img src={section.image} alt={section.imageAlt || section.title} loading="lazy" /> : null}
                </section>
              )) : <div className="portfolio-empty-intro"><p>为下一次探索留白。</p><span>作品内容尚未添加，完整案例将在整理后发布。</span></div>}
            </section>
            <section className="portfolio-resources" aria-label="链接与文件">
              <div className="portfolio-block-heading"><span>02 / RESOURCES</span><h3>链接与文件</h3></div>
              {work.resources.length ? <ul className="portfolio-resource-list">{work.resources.map((resource) => (
                <li key={resource.href}>
                  <a href={resource.href} target="_blank" rel="noreferrer">
                    {resource.kind === "link" ? <ExternalLink size={20} /> : <FileText size={20} />}
                    <span><strong>{resource.label}</strong>{resource.description ? <small>{resource.description}</small> : null}</span>
                    <ArrowUpRight size={18} />
                  </a>
                  {resource.kind === "file" && resource.href.startsWith("/") ? <a className="portfolio-resource-download" href={resource.href} download aria-label={`下载${resource.label}`} title={`下载${resource.label}`}><Download size={18} /></a> : null}
                </li>
              ))}</ul> : <div className="portfolio-empty-resources"><FolderOpen size={30} strokeWidth={1.3} /><strong>暂无资料</strong><p>项目链接与文件将在作品发布时补充。</p></div>}
            </section>
          </div>
          <nav className="portfolio-detail-navigation" aria-label="切换作品">
            <button onClick={() => onNavigate(portfolioWorks[(index - 1 + portfolioWorks.length) % portfolioWorks.length])}><ArrowLeft size={19} /><span><small>上一作品</small>{portfolioWorks[(index - 1 + portfolioWorks.length) % portfolioWorks.length].title}</span></button>
            <button onClick={() => onNavigate(portfolioWorks[(index + 1) % portfolioWorks.length])}><span><small>下一作品</small>{portfolioWorks[(index + 1) % portfolioWorks.length].title}</span><ArrowRight size={19} /></button>
          </nav>
        </div>
      </div>
    </dialog>
  );
}

export default function Portfolio() {
  const [selected, setSelected] = useState<PortfolioWork | null>(workFromAddress);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const syncAddress = () => setSelected(workFromAddress());
    window.addEventListener("hashchange", syncAddress);
    window.addEventListener("popstate", syncAddress);
    return () => {
      window.removeEventListener("hashchange", syncAddress);
      window.removeEventListener("popstate", syncAddress);
    };
  }, []);

  useEffect(() => {
    if (selected || !returnFocusRef.current) return;
    const trigger = returnFocusRef.current;
    const frame = requestAnimationFrame(() => {
      trigger.focus({ preventScroll: true });
      returnFocusRef.current = null;
    });
    return () => cancelAnimationFrame(frame);
  }, [selected]);

  const openWork = (work: PortfolioWork) => {
    returnFocusRef.current = document.querySelector<HTMLAnchorElement>(`.ag-panel[href="#work/${work.id}"]`);
    window.history.pushState({ ...window.history.state, portfolioDetail: true }, "", `#work/${work.id}`);
    setSelected(work);
  };

  const closeWork = () => {
    if (window.history.state?.portfolioDetail) window.history.back();
    else {
      window.history.replaceState(window.history.state, "", "#work");
      setSelected(null);
      requestAnimationFrame(() => document.getElementById("work")?.scrollIntoView({ behavior: "instant" }));
    }
  };

  const navigateWork = (work: PortfolioWork) => {
    window.history.replaceState(window.history.state, "", `#work/${work.id}`);
    setSelected(work);
  };

  return (
    <>
      <section className="section work-section portfolio-section" id="work">
        <div className="shell">
          <div className="section-label"><span>03</span><span>PORTFOLIO / 作品集</span></div>
          <div data-motion-group>
          <div className="portfolio-heading"><h2><MotionLines lines={["A LAB IN", "PROGRESS."]} /></h2><p data-motion-body>作品尚未发布，探索正在发生。<br />这里将记录完整的产品案例，而不只是最终画面。</p></div>
          <AccordionGallery items={portfolioWorks} onOpen={openWork} />
          <div className="portfolio-gallery-foot" data-motion-body><span>03 / 探索方向</span><p>目前保留三个待填作品位，完整案例与资料将陆续补充。</p></div>
          </div>
        </div>
      </section>
      {selected ? <WorkDetail work={selected} onClose={closeWork} onNavigate={navigateWork} /> : null}
    </>
  );
}
