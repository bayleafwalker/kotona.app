export const siteConfig = {
  siteUrl: "https://kotona.app",
  title: "kotona.app",
  description:
    "Case studies and technical notes from declarative infrastructure, household systems, and contract-first platform work.",
  defaultOgImage: "/og-default.svg",
  profile: {
    name: "",
    role: "Solution analyst / data engineer",
    summary:
      "Mostly declarative infrastructure, operational tooling, and boundary-setting work. The useful part is usually in the trade-offs, not the headline.",
    about:
      "Most of the material here starts as ADRs, runbooks, sprint notes, or an awkward fix committed after the problem became expensive enough. This site is where some of that gets compressed into something readable.",
    location: "",
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

export function getHomeTitle() {
  return siteConfig.profile.name || siteConfig.profile.role;
}

export function getContactLinks() {
  const { github, linkedin, email } = siteConfig.externalLinks;

  return [
    github ? { label: "GitHub", href: github } : null,
    linkedin ? { label: "LinkedIn", href: linkedin } : null,
    email ? { label: "Email", href: `mailto:${email}` } : null,
  ].filter((link): link is { label: string; href: string } => Boolean(link));
}
