export const siteConfig = {
  siteUrl: "https://kotona.app",
  title: "kotona.app",
  description:
    "Field notes from systems that I want to keep working: data platforms, small infrastructure, software boundaries, and agent-assisted engineering.",
  defaultOgImage: "/og-default.png",
  defaultOgImageAlt: "kotona.app — systems, decisions, and failure modes",
  home: {
    heading: "Notes from systems that I want to keep working",
    summary:
      "I write about data platforms, small infrastructure, software boundaries, and using agents in real work. Most entries begin with a system, decision, or failure and then ask what should survive the next change.",
  },
  // Only `name` is projected (the About page heading and the site's structured
  // data). A second, unrendered copy of the biography and location used to live
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
  { href: "/about/", label: "About" },
] as const;

export function getContactLinks() {
  const { github, linkedin, email } = siteConfig.externalLinks;

  return [
    github ? { label: "GitHub", href: github } : null,
    linkedin ? { label: "LinkedIn", href: linkedin } : null,
    email ? { label: "Email", href: `mailto:${email}` } : null,
  ].filter((link): link is { label: string; href: string } => Boolean(link));
}
