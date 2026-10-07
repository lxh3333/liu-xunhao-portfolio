import { useEffect, useRef, useState } from "react";
import TechText from "./TechText";
import BorderGlow from "./BorderGlow";
import LetterGlitch from "./LetterGlitch";
import ClickSpark from "./ClickSpark";
import Grainient from "./Grainient";
import Portfolio from "./Portfolio";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import useSmoothWheel from "./useSmoothWheel";
import PageBackground from "./PageBackground";
import MotionLines from "./MotionLines";
import usePortfolioMotion from "./usePortfolioMotion";

const heroGlitchColors = ["#8FA9A1", "#A5A39B", "#8FA9A1", "#A5A39B", "#D18955"];
const internshipGlowColors = ["#f0a164", "#f0cb91", "#91b5ad"];
const projectGlowColors = ["#a4c2b8", "#d2e0d2", "#f0cb91"];

const archives = [
  {
    id: "01",
    title: "审调模拟训练 · AI 角色对话",
    organization: "新华三集团",
    role: "产品经理实习",
    period: "2026.04—07",
    headline: ["审调模拟训练", "AI 角色对话"],
    summary: "把心理学理论转化为 AI 角色的决策机制，参与从需求定义到用户验证的完整流程。",
    highlights: [["三层", "智能架构"], ["4 版", "Prompt 迭代"]],
    tags: ["AI ARCHITECTURE", "PROMPT", "2026"],
    details: [
      ["01 / 产品架构", "主导需求定义与从 0 到 1 的架构设计。融合 Big Five 人格模型与审调场景参数，设计「人格层—动态决策层—回答生成层」三层智能架构，建立可复用的心理—行为机制。"],
      ["02 / 动态 Prompt", "将 Gudjonsson 供述动机理论（GCQ）转化为结构化参数，抽象证据感知、外部压力、内部压力与抑制因素；联合研发设计动态 Prompt 引擎，完成 4 版方案迭代。"],
      ["03 / 策略知识库", "归纳 12 类发问方式、20 项问话技巧与 8 大类应答策略，搭建问话与应答双视角的结构化策略知识库。"],
      ["04 / 用户验证", "参与近 100 人、每人 50+ 轮的端到端验证，联合审调专家进行问题归因与人工评测，持续优化 Prompt 框架及信息输入机制。"],
    ],
  },
  {
    id: "02",
    title: "AI 共情回应与用户使用意愿",
    organization: "人机交互研究",
    role: "第一作者",
    period: "2025.03—09",
    headline: ["AI 共情回应", "与用户使用意愿"],
    summary: "从个体依恋出发，研究用户如何与 AI 建立情感连接，并用数据验证交互策略。",
    highlights: [["GPT-4o", "对话系统"], ["定量", "用户研究"]],
    tags: ["USER RESEARCH", "GPT-4O", "2025"],
    details: [
      ["01 / 研究问题", "研究个体依恋对 AI 聊天机器人共情回应的使用意愿的影响，关注用户情感连接与交互体验。"],
      ["02 / 系统设计", "独立设计并实现基于 GPT-4o 的 AI 对话系统，定义「情感支持者」角色，以温暖自然的交互风格与「支持而非解决」的职能边界约束输出。"],
      ["03 / 数据验证", "使用 SPSS 开展 T 检验与回归分析，量化评估不同交互策略对用户体验的影响，为 AI 交互优化提供数据依据。"],
    ],
  },
  {
    id: "03",
    title: "Color Picker · 个性化染发方案",
    organization: "欧莱雅 BRANDSTORM",
    role: "项目队长",
    period: "2025.03—05",
    headline: ["Color Picker", "个性化染发方案"],
    summary: "围绕居家染发的选色与试错问题，用 AR 预览串联从选择到操作的产品体验。",
    highlights: [["AR", "虚拟试色"], ["端到端", "体验设计"]],
    tags: ["PRODUCT CONCEPT", "AR", "2025"],
    details: [
      ["01 / 用户洞察", "面向一二线城市年轻女性，结合「爆改」热潮与个性化消费趋势，拆解居家染发选色、试色、匹配与操作四个决策环节，识别便捷、低成本与个性化需求。"],
      ["02 / 产品方案", "主导设计 Color Picker，引入 AR 虚拟试色实现效果预览，结合染料自动匹配与工具配置，打通「选色—试色—匹配—染发」端到端流程。"],
      ["03 / 团队统筹", "统筹团队分工与方案迭代，通过「体验前置」降低染发试错成本，提升居家染发决策效率。该项目为创新策划方案，不作为已上线产品展示。"],
    ],
  },
  {
    id: "04",
    title: "动力电池回收 · 行业研究",
    organization: "广发银行",
    role: "行业研究实习生",
    period: "2024.07—09",
    headline: ["动力电池回收", "行业研究"],
    summary: "连接退役需求、产业供需与政策分析，为动力电池回收业务寻找切入方向。",
    highlights: [["2030", "需求测算周期"], ["LLM", "政策文本分析"]],
    tags: ["MARKET RESEARCH", "LLM", "2024"],
    details: [
      ["01 / 需求拆解", "基于动力电池退役周期与 80% 容量衰减规则，拆解退役、回收与梯次利用需求；结合保有量及历史销量，测算 2023—2030 年动力电池退役量约 38.9 万辆，为业务规模测算提供依据。"],
      ["02 / 供需判断", "结合新能源汽车销量、动力电池退役周期与锂矿 4 年供给周期，分析上下游供需变化，识别供需错配及潜在资源回收需求。"],
      ["03 / 政策分析", "使用 LLM 文本分析处理相关政策文件，提取「梯次利用」「回收利用」等关键词，归纳政策导向与监管重点，辅助研判业务切入方向。"],
    ],
  },
];

const Arrow = ({ diagonal = false }: { diagonal?: boolean }) => (
  <svg
    aria-hidden="true"
    className={diagonal ? "icon icon--diagonal" : "icon"}
    viewBox="0 0 24 24"
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

function SectionLabel({ index, children }: { index: string; children: string }) {
  return (
    <div className="section-label">
      <span>{index}</span>
      <span>{children}</span>
    </div>
  );
}

function ArchiveFlipCard({
  project,
  group,
  isFlipped,
  onToggle,
}: {
  project: (typeof archives)[number];
  group: "internship" | "project";
  isFlipped: boolean;
  onToggle: () => void;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const isInternship = group === "internship";
  const grainColors = isInternship
    ? { color1: "#d58b50", color2: "#29231f", color3: "#151515" }
    : { color1: "#92b6a6", color2: "#202a25", color3: "#151515" };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onToggle();
    }
  };

  useSmoothWheel(cardRef, ".archive-flip-details", "is-flipped");

  const card = (
    <article
      ref={cardRef}
      className={`archive-flip-card archive-flip-card--${group} ${isFlipped ? "is-flipped" : ""}`}
      role="button"
      tabIndex={0}
      aria-pressed={isFlipped}
      aria-label={`${project.title}，${isFlipped ? "返回卡片正面" : "查看详细内容"}`}
      onClick={onToggle}
      onKeyDown={handleKeyDown}
    >
      <div className="archive-flip-card__inner">
        <div className="archive-flip-face archive-flip-front" aria-hidden={isFlipped}>
          <Grainient {...grainColors} timeSpeed={0.18} />
          <div className="archive-flip-face-content">
            <div className="archive-flip-meta"><span className="archive-role">{project.role}</span><span>{project.period}</span></div>
            <p className="archive-organization">{project.organization}</p>
            <div className="archive-front-main">
              <h3>{project.headline.map((line) => <span key={line}>{line}</span>)}</h3>
              <p className="archive-summary">{project.summary}</p>
            </div>
            <div className="archive-highlights">{project.highlights.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
            <div className="archive-card-footer"><span>{project.tags.slice(0, 2).join(" / ")}</span><span className="archive-flip-hint">查看详情 <i><ArrowUpRight size={17} /></i></span></div>
          </div>
        </div>
        <div className="archive-flip-face archive-flip-back" aria-hidden={!isFlipped}>
          <div className="archive-flip-face-content">
            <div className="archive-flip-meta"><span className="archive-role">{project.organization}</span><span>{project.period}</span></div>
            <h3>{project.title}</h3>
            <div className="archive-flip-details">
              {project.details.map(([title, text]) => <div key={title}><span className="archive-detail-index" aria-hidden="true">{title.split(" / ")[0]}</span><div><h4>{title.split(" / ")[1]}</h4><p>{text}</p></div></div>)}
            </div>
            <span className="archive-flip-hint archive-return"><RotateCcw size={15} /> 返回概览</span>
          </div>
        </div>
      </div>
    </article>
  );

  return (
    <BorderGlow
      className="archive-border-glow"
      backgroundColor="#181818"
      borderRadius={6}
      edgeSensitivity={55}
      glowColor={isInternship ? "30 85% 66%" : "158 35% 72%"}
      colors={isInternship ? internshipGlowColors : projectGlowColors}
    >
      {card}
    </BorderGlow>
  );
}

export default function App() {
  const rootRef = useRef<HTMLElement>(null);
  usePortfolioMotion(rootRef);
  const homeEntry = window.location.hash === "" || window.location.hash === "#home";
  const [scrolled, setScrolled] = useState(false);
  const [flippedArchives, setFlippedArchives] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        onScroll();
      });
    };
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <ClickSpark sparkColor="#f4e4d2" sparkSize={11} sparkRadius={25} sparkCount={10} duration={700}>
      <main ref={rootRef}>
      <section className="home" id="home">
        <div className="home-frame">
          <header className={`nav home-nav ${scrolled ? "nav--scrolled" : ""}`}>
            <a className="brand" href="#home" aria-label="返回首页">
              <span className="brand-mark">LXH.</span>
              <span className="brand-copy">LIU XUNHAO<small>AI PRODUCT MANAGER · 2026</small></span>
            </a>
            <nav className="home-pill-nav" aria-label="首页导航">
              <a className="is-active" href="#home">首页</a>
              <a href="#about">关于</a>
              <a href="#archive">经历</a>
              <a href="#work">作品</a>
            </nav>
            <a className="home-nav-action" href="#contact">开放交流 <Arrow diagonal /></a>
          </header>

          <div className="home-main-visual">
            <LetterGlitch className="home-letter-glitch" glitchColors={heroGlitchColors} glitchSpeed={50} centerVignette outerVignette={false} smooth />
            <div className="home-ghost-word" aria-hidden="true">AI</div>
            <div className="home-orbit">
              <div className="home-disc home-disc--accent"><span>01</span><b>HUMAN<br />FIRST.</b><small>从人的需求出发，<br />设计有意义的 AI 体验。</small></div>
              <div className="home-disc home-disc--image home-disc--image-one" aria-hidden="true"><span className="motion-image-drift"><span className="motion-image-reveal"><img src={`${import.meta.env.BASE_URL}hero-mono-portrait.webp`} alt="" loading={homeEntry ? "eager" : "lazy"} fetchPriority={homeEntry ? "high" : "auto"} decoding="async" /></span></span></div>
              <div className="home-disc home-disc--image home-disc--image-two" aria-hidden="true"><span className="motion-image-drift"><span className="motion-image-reveal"><img src={`${import.meta.env.BASE_URL}hero-space-poster.webp`} alt="" loading={homeEntry ? "eager" : "lazy"} fetchPriority={homeEntry ? "high" : "auto"} decoding="async" /></span></span></div>
              <h1 className="home-orbit-title" aria-label="LIU XUNHAO">
                <div className="motion-title-mask"><div className="motion-title-content">
                <TechText text="LIU XUNHAO" fontFamily="Space Grotesk" fontWeight={600} fontSize={120} letterSpacing={0} color="#ffffff" accentColor="#ed963e" reveal="letter" dashLength={4} dashGap={2} specks={15} sweep />
                </div></div>
              </h1>
            </div>
          </div>

          <div className="home-feature-grid">
            <div className="home-feature-motion">
            <BorderGlow className="home-feature-card" href="#about">
              <div><span>01 / IDENTITY</span><strong>理解人的需求，<br />定义值得解决的问题。</strong><em>了解更多 <Arrow diagonal /></em></div>
              <div className="home-card-thumb home-card-thumb--human"><img src={`${import.meta.env.BASE_URL}hero-pop-art.webp`} alt="" loading="lazy" decoding="async" /></div>
            </BorderGlow>
            </div><div className="home-feature-motion">
            <BorderGlow className="home-feature-card" href="#archive">
              <div><span>02 / PRACTICE</span><strong>从产品架构到<br />动态 Prompt 的实践。</strong><em>查看经历 <Arrow diagonal /></em></div>
              <div className="home-card-thumb home-card-thumb--type"><img src={`${import.meta.env.BASE_URL}hero-playful-type.webp`} alt="" loading="lazy" decoding="async" /></div>
            </BorderGlow>
            </div><div className="home-feature-motion">
            <BorderGlow className="home-feature-card" href="#work">
              <div><span>03 / PORTFOLIO</span><strong>作品持续整理，<br />探索仍在发生。</strong><em>查看作品集 <Arrow diagonal /></em></div>
              <div className="home-card-thumb home-card-thumb--community"><img src={`${import.meta.env.BASE_URL}hero-community.webp`} alt="" loading="lazy" decoding="async" /></div>
            </BorderGlow>
            </div>
          </div>
        </div>
      </section>

      <div className="interior-pages">
      <PageBackground continuous />
      <section className="about about-compact section shell" id="about">
        <SectionLabel index="01">BACKGROUND / 背景与实践</SectionLabel>
        <div className="about-compact-grid" data-motion-group>
          <div className="about-content">
            <p className="eyebrow"><MotionLines lines={["THE PATH BEHIND THE WORK"]} /></p>
            <h2><MotionLines lines={["从理解人，", <>到设计 <span className="about-title-accent">AI 体验。</span></>]} /></h2>
          </div>
          <div className="about-compact-body">
            <p data-motion-body>心理学研究训练让我习惯从证据出发理解行为；金融学背景让我关注产品判断背后的业务约束。在 AI 产品实践中，我尝试把心理学理论转化为模型参数、交互策略与验证方法。</p>
            <div className="about-facts" data-motion-body>
              <div><span>EDUCATION</span><strong>浙江大学 · 心理学硕士在读</strong></div>
              <div><span>BACKGROUND</span><strong>金融学本科 · 跨学科视角</strong></div>
              <div><span>PRACTICE</span><strong>AI 产品架构 · 用户研究 · 交互设计</strong></div>
            </div>
            <div className="about-meta" data-motion-body>
              <a href="mailto:19550232483@163.com">19550232483@163.com <Arrow diagonal /></a>
              <span>微信 / lxh19550232483</span>
            </div>
          </div>
        </div>
        <div className="stats" data-motion-group>
          <div data-motion-body>
            <strong>4.70</strong>
            <span>GPA / 满分 5.00</span>
          </div>
          <div data-motion-body>
            <strong>02</strong>
            <span>INTERNSHIPS / 实习经历</span>
          </div>
          <div data-motion-body>
            <strong>04</strong>
            <span>PROMPT / 方案迭代</span>
          </div>
          <div data-motion-body>
            <strong>≈100</strong>
            <span>USERS / 参与产品验证人数</span>
          </div>
        </div>
      </section>

      <section className="section archive-section" id="archive">
        <div className="shell">
          <SectionLabel index="02">EXPERIENCE ARCHIVE / 经历档案</SectionLabel>
          <div className="archive-section-heading" data-motion-group>
            <h2><MotionLines lines={["THE PATH SO FAR."]} /></h2>
            <p data-motion-body>
              实习、研究与竞赛中的实践记录。
              <br />
              这些是成长的档案，尚不是完整的作品集案例。
            </p>
          </div>
          <div className="archive-groups">
            {[
              { id: "internships", index: "01", label: "INTERNSHIPS / 实习经历", title: "实习经历", description: "在真实业务中理解问题、搭建方案，并推动 AI 产品落地。", projects: [archives[0], archives[3]], group: "internship" as const },
              { id: "projects", index: "02", label: "PROJECTS / 项目经历", title: "项目经历", description: "从用户研究与产品概念出发，把洞察转译成可验证的体验。", projects: [archives[1], archives[2]], group: "project" as const },
            ].map((section) => (
              <section className="archive-group" key={section.id} data-motion-group>
                <div className={`archive-group-heading archive-group-heading--${section.group}`}>
                  <div className="archive-group-title"><span>{section.index}</span><h3><MotionLines lines={[<>{section.title}<small>{section.group === "internship" ? "INTERNSHIPS" : "PROJECTS"}</small></>]} /></h3></div>
                  <p>{section.description}</p>
                </div>
                <div className="archive-flip-grid">
                  {section.projects.map((project) => (
                    <div className="archive-card-motion" data-motion-body key={project.id}><ArchiveFlipCard
                      project={project}
                      group={section.group}
                      isFlipped={Boolean(flippedArchives[project.id])}
                      onToggle={() => setFlippedArchives((current) => ({ ...current, [project.id]: !current[project.id] }))}
                    /></div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <Portfolio />

      <footer className="contact" id="contact">
        <div className="shell contact-inner">
          <SectionLabel index="04">CONTACT / 开放合作与交流</SectionLabel>
          <div className="contact-main" data-motion-group>
            <p data-motion-body>开放 AI 产品、用户研究与交互设计的合作和交流，也期待产品经理方向的新机会。</p>
            <h2>
              <MotionLines lines={["LET'S CREATE", <span className="contact-title-outline">SOMETHING NEW.</span>]} />
            </h2>
            <a href="mailto:19550232483@163.com" className="contact-button" data-motion-body>
              <span>GET IN TOUCH</span>
              <Arrow diagonal />
            </a>
          </div>
          <div className="contact-foot">
            <div>
              <span>EMAIL</span>
              <a href="mailto:19550232483@163.com">19550232483@163.com</a>
            </div>
            <div>
              <span>PHONE / WECHAT</span>
              <a href="tel:19550232483">19550232483</a>
              <p>微信 / lxh19550232483</p>
            </div>
            <p className="copyright">© 2026 LIU XUNHAO. BUILT WITH CURIOSITY.</p>
            <a href="#home" className="back-top">
              TOP <Arrow />
            </a>
          </div>
        </div>
      </footer>
      </div>
      </main>
    </ClickSpark>
  );
}
