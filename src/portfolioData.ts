export type WorkResource = {
  label: string;
  href: string;
  kind: "link" | "file";
  description?: string;
};

export type WorkSection = {
  title: string;
  paragraphs: string[];
  image?: string;
  imageAlt?: string;
};

export type PortfolioWork = {
  id: string;
  number: string;
  title: string;
  category: string;
  description: string;
  image: string;
  imagePosition?: string;
  status: string;
  sections: WorkSection[];
  resources: WorkResource[];
};

export const portfolioWorks: PortfolioWork[] = [
  {
    id: "ai-product",
    number: "01",
    title: "AI 产品探索",
    category: "AI PRODUCT",
    description: "从真实问题出发，记录需求、策略、产品架构与验证。",
    image: `${import.meta.env.BASE_URL}hero-space-poster.webp`,
    imagePosition: "center 65%",
    status: "待填作品",
    sections: [],
    resources: [],
  },
  {
    id: "interaction",
    number: "02",
    title: "智能交互实验",
    category: "INTERACTION",
    description: "探索对话、共情与反馈机制，呈现流程与原型细节。",
    image: `${import.meta.env.BASE_URL}hero-playful-type.webp`,
    status: "待填作品",
    sections: [],
    resources: [],
  },
  {
    id: "research-design",
    number: "03",
    title: "用户研究与设计",
    category: "RESEARCH & DESIGN",
    description: "把行为洞察转化为设计选择，记录依据、取舍与迭代。",
    image: `${import.meta.env.BASE_URL}hero-pop-art.webp`,
    imagePosition: "center 40%",
    status: "待填作品",
    sections: [],
    resources: [],
  },
];
