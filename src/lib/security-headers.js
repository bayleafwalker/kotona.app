const CLOUDFLARE_ANALYTICS_SCRIPT = "https://static.cloudflareinsights.com";
const CLOUDFLARE_ANALYTICS_ENDPOINT = "https://cloudflareinsights.com";

/**
 * Build the response CSP around a per-request nonce. Development keeps the
 * allowances Astro needs for its dev client; production does not.
 *
 * @param {string} nonce
 * @param {{ development?: boolean }} [options]
 */
export function contentSecurityPolicy(nonce, { development = false } = {}) {
  const scriptSources = [
    "'self'",
    `'nonce-${nonce}'`,
    CLOUDFLARE_ANALYTICS_SCRIPT,
  ];
  const styleSources = ["'self'"];
  const connectSources = ["'self'", CLOUDFLARE_ANALYTICS_ENDPOINT];

  if (development) {
    scriptSources.push("'unsafe-inline'", "'unsafe-eval'");
    styleSources.push("'unsafe-inline'");
    connectSources.push("ws:");
  }

  return [
    "default-src 'self'",
    "base-uri 'self'",
    `connect-src ${connectSources.join(" ")}`,
    "font-src 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "img-src 'self' data:",
    "object-src 'none'",
    `script-src ${scriptSources.join(" ")}`,
    `style-src ${styleSources.join(" ")}`,
    "upgrade-insecure-requests",
  ].join("; ");
}

/**
 * @param {Headers} headers
 * @param {string} nonce
 * @param {{ development?: boolean }} [options]
 */
export function applySecurityHeaders(headers, nonce, options) {
  headers.set("Content-Security-Policy", contentSecurityPolicy(nonce, options));
  headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Permissions-Policy",
    "accelerometer=(), autoplay=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
  );
}
