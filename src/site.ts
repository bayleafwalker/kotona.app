export const siteConfig = {
  siteUrl: "https://www.kotona.app",
  title: "kotona.app",
  description:
    "Case studies and technical notes from declarative infrastructure, household systems, and contract-first platform work.",
  defaultOgImage: "/og-default.svg",
  profile: {
    name: "Juha Huotari",
    role: "Solution analyst",
    summary:
      "Solution analyst in Helsinki. I work on data platforms, integration-heavy systems, and infrastructure that benefits from being slightly harder to misuse.",
    about:
      "I’m Juha Huotari, a solution analyst based in Helsinki. Day to day I work around data platforms, requirements, integration boundaries, and the awkward places where useful systems become expensive to reason about. This site holds selected case studies and notes from that work and from adjacent personal systems work when the lesson transfers.",
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
  { href: "/case-studies/", label: "Case studies" },
  { href: "/writing/", label: "Writing" },
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
