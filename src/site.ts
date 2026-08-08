export const siteConfig = {
  siteUrl: "https://kotona.app",
  title: "kotona.app",
  description:
    "Field notes from systems that have to keep working: data platforms, small infrastructure, software boundaries, and agent-assisted engineering.",
  defaultOgImage: "/og-default.png",
  defaultOgImageAlt: "kotona.app — systems, decisions, and failure modes",
  home: {
    heading: "Notes from systems that have to keep working",
    summary:
      "I write about data platforms, small infrastructure, software boundaries, and using agents in real work. Most entries begin with a system, decision, or failure and then ask what should survive the next change.",
  },
  profile: {
    name: "Juha Huotari",
    role: "Solution analyst",
    about:
      "I’m Juha Huotari, a solution analyst based in Helsinki. Day to day I work around data platforms, requirements, integration boundaries, and the awkward places where useful systems become expensive to reason about. This site holds project notes and system notes from that work and from adjacent personal systems work when the lesson transfers.",
    location: "Helsinki",
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
