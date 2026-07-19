/**
 * Split an HTTP list while leaving delimiters inside quoted strings alone.
 * Accept parameters rarely need quoting, but treating them correctly avoids
 * making a comma in an extension parameter look like a new media range.
 *
 * @param {string} value
 * @param {string} delimiter
 */
function splitHttpList(value, delimiter) {
  const parts = [];
  let current = "";
  let escaped = false;
  let quoted = false;

  for (const character of value) {
    if (escaped) {
      current += character;
      escaped = false;
      continue;
    }

    if (quoted && character === "\\") {
      current += character;
      escaped = true;
      continue;
    }

    if (character === '"') {
      current += character;
      quoted = !quoted;
      continue;
    }

    if (!quoted && character === delimiter) {
      parts.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  parts.push(current);
  return parts;
}

/** @param {string | undefined} value */
function parseQuality(value) {
  if (value === undefined) {
    return 1;
  }

  const normalized = value.trim();

  // RFC 9110 permits at most three fractional digits. Invalid weights make
  // the media range unusable instead of accidentally opting into Markdown.
  if (!/^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(normalized)) {
    return 0;
  }

  return Number(normalized);
}

/**
 * @param {string} value
 * @returns {{ type: string; subtype: string; quality: number }[]}
 */
function parseAccept(value) {
  return splitHttpList(value, ",").flatMap((rawRange) => {
    const [rawMediaType = "", ...rawParameters] = splitHttpList(rawRange, ";");
    const [type = "", subtype = "", ...extraParts] = rawMediaType
      .trim()
      .toLowerCase()
      .split("/");

    if (!type || !subtype || extraParts.length > 0) {
      return [];
    }

    let rawQuality;

    for (const rawParameter of rawParameters) {
      const separator = rawParameter.indexOf("=");

      if (separator === -1) {
        continue;
      }

      const name = rawParameter.slice(0, separator).trim().toLowerCase();

      if (name === "q") {
        rawQuality = rawParameter.slice(separator + 1);
        break;
      }
    }

    return [{ type, subtype, quality: parseQuality(rawQuality) }];
  });
}

/**
 * Return the quality assigned to a representation. A more-specific media
 * range takes precedence over a wildcard, including an explicit q=0 denial.
 *
 * @param {{ type: string; subtype: string; quality: number }[]} ranges
 * @param {string} type
 * @param {string} subtype
 */
function qualityFor(ranges, type, subtype) {
  let bestSpecificity = -1;
  let quality = 0;

  for (const range of ranges) {
    const typeMatches = range.type === "*" || range.type === type;
    const subtypeMatches = range.subtype === "*" || range.subtype === subtype;

    if (!typeMatches || !subtypeMatches) {
      continue;
    }

    const specificity = range.type === "*" ? 0 : range.subtype === "*" ? 1 : 2;

    if (specificity > bestSpecificity) {
      bestSpecificity = specificity;
      quality = range.quality;
    } else if (specificity === bestSpecificity) {
      quality = Math.max(quality, range.quality);
    }
  }

  return quality;
}

/**
 * HTML is the default representation. Markdown wins only when the request
 * gives it a strictly higher quality than HTML.
 *
 * @param {string | null} value
 */
export function prefersMarkdown(value) {
  if (!value) {
    return false;
  }

  const ranges = parseAccept(value);
  const markdownQuality = qualityFor(ranges, "text", "markdown");
  const htmlQuality = qualityFor(ranges, "text", "html");

  return markdownQuality > 0 && markdownQuality > htmlQuality;
}

/** @param {string} value */
export function decodeEntities(value) {
  const namedEntities = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };

  return value.replace(
    /&(?:#(\d+)|#x([\da-f]+)|([a-z][\da-z]+));/gi,
    (entity, decimal, hexadecimal, named) => {
      if (decimal || hexadecimal) {
        const codePoint = Number.parseInt(
          decimal ?? hexadecimal,
          decimal ? 10 : 16,
        );

        try {
          return String.fromCodePoint(codePoint);
        } catch {
          return entity;
        }
      }

      return namedEntities[named.toLowerCase()] ?? entity;
    },
  );
}

/** @param {string} attributes */
function codeLanguage(attributes) {
  const dataLanguage = attributes.match(
    /\bdata-language\s*=\s*["']([^"']+)["']/i,
  )?.[1];

  if (dataLanguage) {
    return dataLanguage.replace(/[^\w.+-]/g, "");
  }

  const className = attributes.match(/\bclass\s*=\s*["']([^"']+)["']/i)?.[1];
  const languageClass = className
    ?.split(/\s+/)
    .find((value) => value.startsWith("language-"));

  return (
    languageClass?.slice("language-".length).replace(/[^\w.+-]/g, "") ?? ""
  );
}

/** @param {string} value */
function stripTags(value) {
  return value.replace(/<br\s*\/?\s*>/gi, "\n").replace(/<[^>]+>/g, "");
}

/** @param {string} value */
function inlineCode(value) {
  const code = decodeEntities(stripTags(value)).trim();
  const longestRun = Math.max(
    0,
    ...(code.match(/`+/g) ?? []).map((run) => run.length),
  );
  const delimiter = "`".repeat(Math.max(1, longestRun + 1));
  const padding = /^`|`$|^\s|\s$/.test(code) ? " " : "";

  return `${delimiter}${padding}${code}${padding}${delimiter}`;
}

/**
 * @param {string} value
 * @param {{ preserveBlockNewlines?: boolean }} [options]
 */
function inlineHtmlToMarkdown(value, options = {}) {
  const code = [];
  const lineBreakToken = "\uE102";
  let markdown = value.replace(
    /<code\b[^>]*>([\s\S]*?)<\/code>/gi,
    (_, content) => {
      const token = `\uE100${code.length}\uE101`;
      code.push(inlineCode(content));
      return token;
    },
  );

  markdown = markdown
    .replace(
      /<img\b[^>]*\balt=["']([^"']*)["'][^>]*\bsrc=["']([^"']+)["'][^>]*>/gi,
      "![$1]($2)",
    )
    .replace(
      /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*\balt=["']([^"']*)["'][^>]*>/gi,
      "![$2]($1)",
    )
    .replace(
      /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
      "[$2]($1)",
    )
    .replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, "**$2**")
    .replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, "*$2*")
    .replace(/<(del|s)\b[^>]*>([\s\S]*?)<\/\1>/gi, "~~$2~~")
    .replace(/<br\s*\/?\s*>/gi, lineBreakToken)
    .replace(/<[^>]+>/g, "");

  markdown = decodeEntities(markdown).replace(/[ \t\r\f\v]+/g, " ");

  markdown = options.preserveBlockNewlines
    ? markdown.replace(/ *\n */g, "\n").trim()
    : markdown.replace(/\s*\n\s*/g, " ").trim();

  return markdown
    .replace(/\uE100(\d+)\uE101/g, (_, index) => code[Number(index)])
    .replaceAll(lineBreakToken, "<br>");
}

/** @param {string} html */
function tableToMarkdown(html) {
  const rows = [...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(
    (rowMatch) => {
      const cells = [
        ...rowMatch[1].matchAll(/<(th|td)\b[^>]*>([\s\S]*?)<\/\1>/gi),
      ];

      return {
        header: cells.some((cell) => cell[1].toLowerCase() === "th"),
        cells: cells.map((cell) =>
          inlineHtmlToMarkdown(cell[2]).replaceAll("|", "\\|"),
        ),
      };
    },
  );

  if (rows.length === 0 || rows.every((row) => row.cells.length === 0)) {
    return "";
  }

  const columnCount = Math.max(...rows.map((row) => row.cells.length));
  const normalizedRows = rows.map((row) => [
    ...row.cells,
    ...Array(Math.max(0, columnCount - row.cells.length)).fill(""),
  ]);
  const explicitHeaderIndex = rows.findIndex((row) => row.header);
  const headerIndex = explicitHeaderIndex === -1 ? 0 : explicitHeaderIndex;
  const header = normalizedRows[headerIndex];
  const body = normalizedRows.filter((_, index) => index !== headerIndex);
  const renderRow = (cells) => `| ${cells.join(" | ")} |`;

  return [
    renderRow(header),
    renderRow(Array(columnCount).fill("---")),
    ...body.map(renderRow),
  ].join("\n");
}

/**
 * Project the document's main region into readable Markdown. The HTML remains
 * canonical; this intentionally covers semantic content rather than every
 * possible presentation-only element.
 *
 * @param {string} html
 */
export function htmlToMarkdown(html) {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? html;
  const protectedBlocks = [];
  const protect = (value) => {
    const token = `\uE000${protectedBlocks.length}\uE001`;
    protectedBlocks.push(value);
    return `\n\n${token}\n\n`;
  };

  let markdown = main
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|svg|template)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/<pre\b([^>]*)>([\s\S]*?)<\/pre>/gi, (_, preAttributes, body) => {
      const codeMatch = body.match(/<code\b([^>]*)>([\s\S]*?)<\/code>/i);
      const codeAttributes = codeMatch?.[1] ?? "";
      const source = codeMatch?.[2] ?? body;
      const code = decodeEntities(stripTags(source)).replace(/^\n|\n$/g, "");
      const language = codeLanguage(`${preAttributes} ${codeAttributes}`);
      const longestRun = Math.max(
        0,
        ...(code.match(/`+/g) ?? []).map((run) => run.length),
      );
      const fence = "`".repeat(Math.max(3, longestRun + 1));

      return protect(`${fence}${language}\n${code}\n${fence}`);
    })
    .replace(/<table\b[^>]*>([\s\S]*?)<\/table>/gi, (_, table) =>
      protect(tableToMarkdown(table)),
    )
    .replace(
      /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi,
      (_, level, content) =>
        `\n\n${"#".repeat(Number(level))} ${inlineHtmlToMarkdown(content)}\n\n`,
    )
    .replace(/<ol\b([^>]*)>([\s\S]*?)<\/ol>/gi, (_, attributes, body) => {
      const start = attributes.match(/\bstart=["']?(-?\d+)/i)?.[1];
      let nextNumber = start === undefined ? 1 : Number(start);

      return body.replace(
        /<li\b([^>]*)>([\s\S]*?)<\/li>/gi,
        (_, itemAttributes, content) => {
          const explicitValue =
            itemAttributes.match(/\bvalue=["']?(-?\d+)/i)?.[1];
          const itemNumber =
            explicitValue === undefined ? nextNumber : Number(explicitValue);
          nextNumber = itemNumber + 1;
          return `\n${itemNumber}. ${inlineHtmlToMarkdown(content)}\n`;
        },
      );
    })
    .replace(
      /<li\b[^>]*>([\s\S]*?)<\/li>/gi,
      (_, content) => `\n- ${inlineHtmlToMarkdown(content)}\n`,
    )
    .replace(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, content) => {
      const quote = inlineHtmlToMarkdown(content).replaceAll("<br>", "\n");
      return `\n\n${quote
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n")}\n\n`;
    })
    .replace(/<hr\b[^>]*>/gi, "\n\n---\n\n")
    .replace(
      /<(p|div|section|article|header|aside|nav|ul|ol|dl|dt|dd|figure|figcaption)\b[^>]*>/gi,
      "\n\n",
    )
    .replace(
      /<\/(p|div|section|article|header|aside|nav|ul|ol|dl|dt|dd|figure|figcaption)>/gi,
      "\n\n",
    );

  markdown = inlineHtmlToMarkdown(markdown, { preserveBlockNewlines: true })
    .replaceAll("<br>", "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  markdown = markdown.replace(
    /\uE000(\d+)\uE001/g,
    (_, index) => protectedBlocks[Number(index)],
  );

  return `${markdown.trim()}\n`;
}
