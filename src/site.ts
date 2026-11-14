export const siteConfig = {
  siteUrl: "https://kotona.app",
  title: "kotona.app",
  description:
    "Field notes from systems that I want to keep working: data platforms, small infrastructure, software boundaries, and agent-assisted engineering.",
  defaultOgImage: "/og-default.png",
  defaultOgImageAlt: "kotona.app — systems, decisions, and failure modes",
  home: {
    heading: "Working notes, running examples.",
    summary:
      "Data platforms, infrastructure, and agent workflows. What changed, what failed, and what I expect to need again.",
  },
  // `name` is shared by the homepage, About heading and structured data.
  // A second, unrendered copy of the biography and location used to live
  // here and had already drifted from the About page it was meant to describe;
  // the page's own prose is the one statement of it.
  profile: {
    name: "Juha Huotari",
  },
  externalLinks: {
    github: "https://github.com/bayleafwalker",
    linkedin: "https://www.linkedin.com/in/juhahuotari/",
    email: "contact@kotona.app",
  },
} as const;

export const siteNavigation = [
  { href: "/", label: "Home" },
  { href: "/explore/", label: "Explore" },
  { href: "/projects/", label: "Projects" },
  { href: "/notes/", label: "Notes" },
  { href: "/about/", label: "About this site" },
] as const;

export const relatedSites = [
  {
    id: "profile",
    label: "About Juha",
    href: "https://about.kotona.app/",
    host: "about.kotona.app",
  },
  {
    id: "demo",
    label: "Interactive showcase",
    href: "https://demo.vuoro.cloud/",
    host: "demo.vuoro.cloud",
  },
  {
    id: "vuoro",
    label: "Vuoro Cloud",
    href: "https://vuoro.cloud/",
    host: "vuoro.cloud",
  },
] as const;

export function getContactLinks() {
  const { github, linkedin, email } = siteConfig.externalLinks;

  return [
    github ? { label: "GitHub", href: github } : null,
    linkedin ? { label: "LinkedIn", href: linkedin } : null,
    email ? { label: "Email", href: `mailto:${email}` } : null,
  ].filter((link): link is { label: string; href: string } => Boolean(link));
}
